from app.core.config import settings


class RootService:
    @staticmethod
    def get_app_info():
        return {
            "application": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "status": settings.STATUS,
            "environment": "development",
            "docs": "/docs",
        }