import json

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.automation import Automation
from app.models.automation_plan import AutomationPlan
from app.repositories.automation_repository import (
    AutomationRepository,
)
from app.services.ai_provider_factory import get_ai_provider


class AutomationService:

    # ============================================================
    # INITIAL ANALYSIS
    # ============================================================

    ANALYSIS_PROMPT = """
You are AutoFlow's automation planning engine.

You are NOT a chatbot.
You are NOT a programming assistant.
You are NOT a coding assistant.

Your job is to analyze a user's automation request and convert it
into a structured automation plan.

Your response will be directly parsed by Python using json.loads().

IMPORTANT:
Return ONLY one valid JSON object.

DO NOT output:
- explanations
- reasoning
- markdown
- code fences
- greetings
- comments
- Python
- JavaScript
- HTML
- XML
- n8n code
- <think> tags

Nothing may appear before or after the JSON object.

--------------------------------------------------
SUPPORTED TRIGGERS
--------------------------------------------------

Only these trigger types are supported:

- schedule
- webhook
- manual

--------------------------------------------------
SUPPORTED ACTIONS
--------------------------------------------------

Only these action types are supported:

- web_scrape
- send_email
- send_telegram
- webhook
- transform_data
- filter

--------------------------------------------------
TASK
--------------------------------------------------

Analyze the user's automation request.

Extract:

1. The main goal.
2. The trigger.
3. The actions.
4. Required information that is still missing.

Do NOT invent information.

If the user did not provide a required value,
do not guess it.

--------------------------------------------------
TRIGGER RULES
--------------------------------------------------

Use "schedule" when the automation happens at a specific
time or repeatedly.

Use "webhook" when the automation starts from an HTTP webhook.

Use "manual" when the user explicitly says the automation
will be started manually.

If the trigger is manual:

trigger.configuration must be an empty object.

For schedule triggers, extract available information such as:

- time
- frequency
- day
- timezone

Do not invent missing scheduling information.

--------------------------------------------------
ACTION RULES
--------------------------------------------------

Use "web_scrape" when the user wants information collected
from a website.

Use "send_email" when the user wants an email sent.

Use "send_telegram" when the user wants a Telegram message sent.

Use "webhook" when the automation needs to call an external webhook.

Use "transform_data" when the user explicitly wants data transformed.

Use "filter" when the user explicitly wants information filtered.

Only include actions that are actually required.

Keep actions in logical execution order.

Do not create duplicate actions.

--------------------------------------------------
MISSING INFORMATION
--------------------------------------------------

Only include information in missing_information if it is
actually required to execute the requested automation.

Examples of potentially required information:

- website URL
- email recipient
- Telegram recipient
- webhook URL
- schedule time
- schedule frequency
- required transformation details

Do not mark optional information as missing.

Example:

User:
"Every morning scrape technology news and email me."

Possible missing information:

- website URL
- email recipient
- exact schedule time

Example:

User:
"Every day at 09:00 scrape https://example.com and send the
headlines to test@example.com."

missing_information should be empty.

--------------------------------------------------
OUTPUT
--------------------------------------------------

Return a JSON object containing EXACTLY these top-level fields:

- goal
- trigger
- actions
- missing_information

The trigger must contain:

- type
- configuration

Every action must contain:

- type
- configuration

missing_information must always be an array of strings.

--------------------------------------------------
FINAL VALIDATION
--------------------------------------------------

Before responding, silently verify:

1. The response is valid JSON.
2. There are exactly four top-level fields.
3. trigger.type is supported.
4. Every action.type is supported.
5. No information was invented.
6. All required missing information is included.
7. Nothing exists outside the JSON object.

USER REQUEST:

{message}
"""

    # ============================================================
    # REFINE EXISTING PLAN
    # ============================================================

    REFINE_PROMPT = """
You are AutoFlow's automation planning engine.

You are updating an EXISTING automation plan.

You are NOT creating a new automation from scratch.

The CURRENT AUTOMATION PLAN contains information collected
from previous user messages.

The USER'S NEW MESSAGE may provide information that was previously
missing, correct an existing value, or add a new requirement.

Your job is to merge the new information into the existing plan.

--------------------------------------------------
IMPORTANT RULE
--------------------------------------------------

The CURRENT AUTOMATION PLAN is the source of truth for all
previously collected information.

The USER'S NEW MESSAGE is an UPDATE to that plan.

Never forget valid information from the current plan.

If the latest message does not mention something,
KEEP the existing value.

If the user provides new information,
ADD it to the existing plan.

If the user corrects an existing value,
REPLACE the old value with the new value.

--------------------------------------------------
SUPPORTED TRIGGERS
--------------------------------------------------

Only these trigger types are supported:

- schedule
- webhook
- manual

--------------------------------------------------
SUPPORTED ACTIONS
--------------------------------------------------

Only these action types are supported:

- web_scrape
- send_email
- send_telegram
- webhook
- transform_data
- filter

--------------------------------------------------
MERGING RULES
--------------------------------------------------

If the user provides:

- an email address:
  update the appropriate send_email configuration.

- a website URL:
  update the web_scrape configuration.

- a schedule:
  update the trigger configuration.

- a Telegram recipient:
  update the send_telegram configuration.

- a webhook URL:
  update the webhook configuration.

- transformation requirements:
  update transform_data configuration.

- filtering requirements:
  update filter configuration.

Do not create duplicate actions.

Do not create duplicate missing_information entries.

--------------------------------------------------
MISSING INFORMATION RULE
--------------------------------------------------

After merging the new information, re-evaluate the ENTIRE
automation plan.

Do not simply remove one missing item.

You must check whether ANY other required information is still missing.

For example:

CURRENT PLAN:

- website = missing
- email = missing
- schedule time = missing

USER:

"My website is https://example.com"

The updated plan must:

- fill the website
- keep email as missing
- keep schedule time as missing

The AI must NOT assume that providing one value means
the entire automation is complete.

Another example:

CURRENT PLAN:

- website = https://example.com
- email = missing
- schedule time = missing

USER:

"My email is test@example.com"

The updated plan must:

- preserve the website
- fill the email
- KEEP schedule time as missing

--------------------------------------------------
DO NOT INVENT INFORMATION
--------------------------------------------------

Never guess:

- email addresses
- website URLs
- times
- dates
- frequencies
- Telegram usernames
- webhook URLs
- API keys
- transformation rules
- filtering rules

Only use information explicitly provided by the user
or already present in the current plan.

--------------------------------------------------
OUTPUT RULES
--------------------------------------------------

Return ONLY one valid JSON object.

Nothing before or after it.

Do not use:

- markdown
- code fences
- explanations
- reasoning
- comments
- Python
- JavaScript
- XML
- HTML
- <think> tags

The response must be directly parseable by Python json.loads().

The JSON must contain EXACTLY these top-level fields:

- goal
- trigger
- actions
- missing_information

The trigger must contain:

- type
- configuration

Every action must contain:

- type
- configuration

missing_information must always be an array of strings.

Do not add additional top-level fields.

--------------------------------------------------
FINAL VALIDATION
--------------------------------------------------

Before responding, silently verify:

1. Did I preserve all valid information from CURRENT PLAN?
2. Did I correctly apply the USER'S NEW MESSAGE?
3. Did I replace values if the user corrected them?
4. Did I avoid inventing information?
5. Did I check the COMPLETE automation again?
6. Did I keep every still-required missing item?
7. Did I avoid duplicate actions?
8. Did I avoid duplicate missing information?
9. Is the response valid JSON?
10. Is there anything outside the JSON object?

CURRENT AUTOMATION PLAN:

{current_plan}

USER'S NEW MESSAGE:

{message}
"""

    # ============================================================
    # ANALYZE
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        plan: AutomationPlan,
        user_id: UUID,
        name: str,
    ) -> Automation:

        if plan.missing_information:
            raise ValueError(
                "Automation plan is incomplete"
            )

        automation = Automation(
            user_id=user_id,
            name=name,
            goal=plan.goal,
            trigger=plan.trigger.model_dump(),
            actions=[
                action.model_dump()
                for action in plan.actions
            ],
        )

        return AutomationRepository.create(
            db=db,
            automation=automation,
        )



    @staticmethod
    async def analyze(
        message: str,
        current_plan: AutomationPlan | None = None,
    ) -> AutomationPlan:
    
        provider = get_ai_provider()
    
        if current_plan is None:
        
            prompt = AutomationService.ANALYSIS_PROMPT.format(
                message=message,
            )
    
        else:
        
            current_plan_json = current_plan.model_dump_json(
                indent=2,
            )
    
            prompt = AutomationService.REFINE_PROMPT.format(
                current_plan=current_plan_json,
                message=message,
            )
    
        raw_response = await provider.generate(prompt)
    
        try:
            data = json.loads(raw_response)
    
        except json.JSONDecodeError as exc:
        
            raise RuntimeError(
                "AI provider returned invalid automation JSON"
            ) from exc
    
        try:
            plan = AutomationPlan.model_validate(data)
    
        except Exception as exc:
        
            raise RuntimeError(
                "AI provider returned an invalid automation plan"
            ) from exc
    
        return plan.model_dump()
