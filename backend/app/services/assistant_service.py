import json

from app.services.ai_provider_factory import get_ai_provider


class AssistantService:

    INTENT_PROMPT = """
You are the intent classification engine of AutoFlow.

Classify the user's message into exactly one of these two intents:

assistant_chat:
The user wants to learn, ask a question, discuss an idea, get advice,
improve a prompt, or have a normal conversation.

automation:
The user wants AutoFlow to perform, schedule, monitor, collect,
transform, send, notify, or otherwise automate a real-world task.

Important:
- Talking ABOUT automation is assistant_chat.
- Asking HOW to build an automation is assistant_chat.
- Asking AutoFlow TO BUILD or PERFORM an automation is automation.
- If the user explicitly asks to automate a task, classify it as automation.

Return ONLY valid JSON.

Format:
{"intent":"assistant_chat"}

or

{"intent":"automation"}

User message:

{message}
"""

    CHAT_PROMPT = """
You are AutoFlow AI Assistant.

You are a helpful, clear and intelligent assistant.

You can:
- answer questions
- teach concepts
- discuss ideas
- help improve prompts
- help the user think through problems
- explain technical topics

You are part of AutoFlow, an AI automation platform.

If the user is discussing an automation idea but has NOT explicitly
asked you to create or perform it, discuss the idea normally.

Do not claim that you performed an action unless the system actually
performed it.

Answer naturally and concisely.

USER:

{message}
"""

    @staticmethod
    async def classify_intent(message: str) -> str:
        provider = get_ai_provider()

        prompt = AssistantService.INTENT_PROMPT.replace(
            "{message}",
            message,
        )

        raw_response = await provider.generate(prompt)

        try:
            data = json.loads(raw_response)
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "AI provider returned invalid intent JSON"
            ) from exc

        intent = data.get("intent")

        if intent not in {
            "assistant_chat",
            "automation",
        }:
            raise RuntimeError(
                "AI provider returned an invalid intent"
            )

        return intent

    @staticmethod
    async def generate_chat_response(
        message: str,
    ) -> str:
        provider = get_ai_provider()

        prompt = AssistantService.CHAT_PROMPT.replace(
            "{message}",
            message,
        )

        return await provider.generate(prompt)

    @staticmethod
    async def respond(
        message: str,
    ) -> tuple[str, str]:

        intent = await AssistantService.classify_intent(
            message,
        )

        if intent == "assistant_chat":
            response = await AssistantService.generate_chat_response(
                message,
            )

            return intent, response

        return (
            intent,
            "Bu mesaj bir otomasyon isteği gibi görünüyor. "
            "Bunu bir otomasyona dönüştürmemi ister misin?",
        )