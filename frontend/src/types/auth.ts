export type LoginResponse = {
    access_token: string;
    token_type: string;
};

export type UserResponse = {
    uuid: string;
    username: string;
    email: string;
    full_name: string;
    last_login: string | null;
};