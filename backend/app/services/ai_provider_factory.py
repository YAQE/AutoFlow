from app.core.config import settings
from app.services.ai_provider import AIProvider
from app.services.ollama_provider import OllamaProvider


def get_ai_provider() -> AIProvider:
    if settings.AI_PROVIDER == "ollama":
        return OllamaProvider(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
        )

    raise RuntimeError(
        f"Unsupported AI provider: {settings.AI_PROVIDER}"
    )