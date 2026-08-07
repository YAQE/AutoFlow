class UserAlreadyExistsException(Exception):
    pass


class InvalidCredentialsException(Exception):
    pass


class UserNotFoundException(Exception):
    pass


class InvalidTokenException(Exception):
    pass