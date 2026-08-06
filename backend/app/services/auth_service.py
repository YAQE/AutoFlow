class AuthService:

    @staticmethod
    def login(username: str, password: str):

        return {
            "access_token": "fake-jwt-token",
            "token_type": "bearer",
        }