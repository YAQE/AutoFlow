from app.core.config import settings
from app.services.ai_provider import AIProvider
from app.services.groq_provider import GroqProvider
from app.services.ollama_provider import OllamaProvider


def get_ai_provider(
    provider: str | None = None,
    model: str | None = None,
) -> AIProvider:
    selected_provider = (
        provider or settings.AI_PROVIDER
    ).lower()

    if selected_provider == "ollama":
        selected_model = (
            model or settings.OLLAMA_MODEL
        )

        return OllamaProvider(
            base_url=settings.OLLAMA_BASE_URL,
            model=selected_model,
        )

    if selected_provider == "groq":
        if not settings.GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is required when AI_PROVIDER=groq"
            )

        selected_model = (
            model or settings.GROQ_MODEL
        )

        return GroqProvider(
            api_key=settings.GROQ_API_KEY,
            model=selected_model,
        )

    raise RuntimeError(
        f"Unsupported AI provider: {selected_provider}"
    )


def get_intent_provider() -> AIProvider:
    """
    Intent classification always uses the local Ollama model.

    This keeps intent detection:
    - local
    - cheap
    - fast enough
    - independent from the user's selected chat provider
    """
    return OllamaProvider(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.OLLAMA_MODEL,
    )