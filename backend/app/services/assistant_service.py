import json

from app.services.ai_provider_factory import (
    get_ai_provider,
    get_intent_provider,
)


class AssistantService:

    INTENT_PROMPT = """
You are AutoFlow's local intent classifier.

Classify the CURRENT USER MESSAGE into exactly one intent:

assistant_chat
automation

assistant_chat means:
- asking a question
- learning something
- discussing an idea
- asking for advice
- improving a prompt
- normal conversation
- asking how an automation works

automation means:
- asking AutoFlow to perform a real-world task
- asking AutoFlow to create an automation
- asking AutoFlow to monitor, collect, notify, schedule,
  transform, send, or otherwise automate something

Important:

- Talking ABOUT automation -> assistant_chat
- Asking HOW to build automation -> assistant_chat
- Asking AutoFlow TO BUILD or PERFORM automation -> automation

Use recent conversation context only when it helps resolve ambiguity.

Return ONLY valid JSON.

Valid responses:

{"intent":"assistant_chat"}

or

{"intent":"automation"}

RECENT CONVERSATION:

{history}

CURRENT USER MESSAGE:

{message}
"""

    CHAT_PROMPT = """
You are AutoFlow AI Assistant.

You are a personal AI assistant that helps the user:

- learn technical and non-technical topics
- plan study sessions
- discuss ideas
- solve problems
- improve prompts
- think through decisions
- prepare daily work plans
- discuss automation ideas

You have access to the conversation history.

Use it to maintain continuity.

If the user previously stated a fact and later refers to it,
use that information naturally.

Do not invent memories.

Do not claim that an action was performed unless the system
actually performed it.

If the user explicitly wants to create or perform an automation,
the system handles that separately.

Answer naturally, clearly and concisely.

CONVERSATION HISTORY:

{history}

CURRENT USER MESSAGE:

{message}
"""

    AUTOMATION_CONFIRMATION = (
        "Bu mesaj bir otomasyon isteği gibi görünüyor. "
        "Bunu bir otomasyona dönüştürmemi ister misin?"
    )

    @staticmethod
    def _build_history(
        history: list[dict[str, str]] | None,
        limit: int = 20,
    ) -> str:
        if not history:
            return "No previous conversation."

        recent_history = history[-limit:]

        return "\n".join(
            f"{item['role'].upper()}: {item['content']}"
            for item in recent_history
        )

    @staticmethod
    async def classify_intent(
        message: str,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        """
        Always uses local Ollama for intent classification.
        """

        provider = get_intent_provider()

        # Intent detection does not need 20 messages.
        # A small recent context is enough.
        history_text = (
            AssistantService._build_history(
                history,
                limit=6,
            )
        )

        prompt = (
            AssistantService.INTENT_PROMPT
            .replace(
                "{history}",
                history_text,
            )
            .replace(
                "{message}",
                message,
            )
        )

        raw_response = await provider.generate(
            prompt
        )

        try:
            data = json.loads(
                raw_response
            )
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "Local intent provider returned invalid JSON"
            ) from exc

        intent = data.get("intent")

        if intent not in {
            "assistant_chat",
            "automation",
        }:
            raise RuntimeError(
                "Local intent provider returned an invalid intent"
            )

        return intent

    @staticmethod
    async def generate_chat_response(
        message: str,
        history: list[dict[str, str]] | None = None,
        provider: str | None = None,
        model: str | None = None,
    ) -> str:
        """
        Uses the provider/model selected by the user.
        """

        ai_provider = get_ai_provider(
            provider=provider,
            model=model,
        )

        history_text = (
            AssistantService._build_history(
                history,
                limit=20,
            )
        )

        prompt = (
            AssistantService.CHAT_PROMPT
            .replace(
                "{history}",
                history_text,
            )
            .replace(
                "{message}",
                message,
            )
        )

        return await ai_provider.generate(
            prompt
        )

    @staticmethod
    async def respond(
        message: str,
        history: list[dict[str, str]] | None = None,
        provider: str | None = None,
        model: str | None = None,
    ) -> tuple[str, str]:
        """
        Full assistant pipeline:

        1. Local Ollama determines intent.
        2. If normal chat:
           selected provider generates the response.
        3. If automation:
           return the automation handoff message.
        """

        intent = (
            await AssistantService.classify_intent(
                message=message,
                history=history,
            )
        )

        if intent == "assistant_chat":
            response = (
                await AssistantService.generate_chat_response(
                    message=message,
                    history=history,
                    provider=provider,
                    model=model,
                )
            )

            return intent, response

        return (
            intent,
            AssistantService.AUTOMATION_CONFIRMATION,
        )