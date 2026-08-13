from app.services.ai_provider_factory import get_ai_provider


class AutomationQuestionService:

    QUESTION_PROMPT = """
You are AutoFlow's automation clarification assistant.

The user wants to create an automation.

An automation analyzer has already created a plan.

Your job is to ask the user for the missing information required
to complete the automation.

IMPORTANT:

- Ask ONLY for information listed in missing_information.
- Do not ask for information that is already known.
- Ask multiple missing items in ONE message whenever possible.
- Do not ask one question at a time.
- Do not invent missing values.
- Do not explain technical implementation.
- Do not mention n8n.
- Do not write code.
- Be concise and natural.
- The user should feel like they are talking to an AI automation assistant.

Explain briefly what you understood, then ask for the missing
information.

AUTOMATION PLAN:

{plan}

MISSING INFORMATION:

{missing_information}
"""

    @staticmethod
    async def generate_questions(
        plan: dict,
    ) -> str:

        provider = get_ai_provider()

        prompt = AutomationQuestionService.QUESTION_PROMPT.replace(
            "{plan}",
            str(plan),
        ).replace(
            "{missing_information}",
            str(plan["missing_information"]),
        )

        return await provider.generate(prompt)