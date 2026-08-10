import type { LoginResponse, UserResponse } from "../types/auth";
import { getToken } from "../auth/token";
const API_BASE_URL = import.meta.env.VITE_API_URL;



export async function login(
    username: string,
    password: string,
): Promise<LoginResponse> {
    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
    }

    return response.json();
}

export async function getCurrentUser(): Promise<UserResponse> {
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get current user");
    }

    return response.json();
}