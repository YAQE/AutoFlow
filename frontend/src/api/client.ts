import type { LoginResponse, UserResponse } from "../types/auth";
import {
    getToken,
    removeToken,
    setToken,
} from "../auth/token";

import type {
    Workflow,
    WorkflowUpdate,
} from "../types/workflow";

import type {
    Automation,
    AutomationPlan,
} from "../types/automation";

import type {
    AssistantConversationResponse,
    AssistantMessageResponse,
} from "../types/assistant";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function expired() {
    window.dispatchEvent(
        new Event("autoflow:session-expired"),
    );
}

async function refreshAccessToken(): Promise<boolean> {
    const response = await fetch(
        `${API_BASE_URL}/auth/refresh`,
        {
            method: "POST",
            credentials: "include",
        },
    );

    if (!response.ok) {
        return false;
    }

    const data: LoginResponse =
        await response.json();

    setToken(data.access_token);

    return true;
}

async function authenticatedFetch(
    url: string,
    init: RequestInit = {},
): Promise<Response> {
    const request = () => {
        const headers = new Headers(
            init.headers,
        );

        const token = getToken();

        if (token) {
            headers.set(
                "Authorization",
                `Bearer ${token}`,
            );
        }

        return fetch(url, {
            ...init,
            headers,
            credentials: "include",
        });
    };

    let response = await request();

    if (response.status !== 401) {
        return response;
    }

    if (await refreshAccessToken()) {
        response = await request();

        if (response.status !== 401) {
            return response;
        }
    }

    removeToken();
    expired();

    return response;
}

function assertToken() {
    if (!getToken()) {
        throw new Error("Not authenticated");
    }
}


/* =========================================================
   AUTH
========================================================= */

export async function login(
    username: string,
    password: string,
): Promise<LoginResponse> {
    const formData = new URLSearchParams({
        username,
        password,
    });

    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
            body: formData,
            credentials: "include",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Login failed: ${response.status}`,
        );
    }

    return response.json();
}

export async function logout(): Promise<void> {
    await fetch(
        `${API_BASE_URL}/auth/logout`,
        {
            method: "POST",
            credentials: "include",
        },
    );

    removeToken();
}

export async function getCurrentUser(): Promise<UserResponse> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/auth/me`,
        );

    if (!response.ok) {
        throw new Error(
            "Failed to get current user",
        );
    }

    return response.json();
}


/* =========================================================
   WORKFLOW
========================================================= */

export async function getWorkflow(
    workflowId: number,
): Promise<Workflow> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/workflows/${workflowId}`,
        );

    if (!response.ok) {
        throw new Error(
            `Failed to get workflow: ${response.status}`,
        );
    }

    return response.json();
}

export async function updateWorkflow(
    workflowId: number,
    data: WorkflowUpdate,
): Promise<Workflow> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/workflows/${workflowId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(data),
            },
        );

    if (!response.ok) {
        throw new Error(
            `Failed to update workflow: ${response.status}`,
        );
    }

    return response.json();
}

export async function deleteWorkflow(
    workflowId: number,
): Promise<void> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/workflows/${workflowId}`,
            {
                method: "DELETE",
            },
        );

    if (!response.ok) {
        throw new Error(
            `Failed to delete workflow: ${response.status}`,
        );
    }
}


/* =========================================================
   AUTOMATION
========================================================= */

export async function getAutomations(): Promise<Automation[]> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/automation/`,
        );

    if (!response.ok) {
        throw new Error(
            `Failed to get automations: ${response.status}`,
        );
    }

    return response.json();
}

export async function getAutomation(
    automationId: number,
): Promise<Automation> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/automation/${automationId}`,
        );

    if (!response.ok) {
        throw new Error(
            "Failed to get automation",
        );
    }

    return response.json();
}

export async function analyzeAutomation(
    message: string,
    currentPlan?: AutomationPlan,
): Promise<AutomationPlan> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/automation/analyze`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    message,
                    ...(currentPlan
                        ? {
                              current_plan:
                                  currentPlan,
                          }
                        : {}),
                }),
            },
        );

    if (!response.ok) {
        throw new Error(
            "Automation analysis failed",
        );
    }

    return response.json();
}

export async function createAutomation(
    name: string,
    plan: AutomationPlan,
): Promise<Automation> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/automation/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    name,
                    plan,
                }),
            },
        );

    if (!response.ok) {
        throw new Error(
            "Automation could not be created",
        );
    }

    return response.json();
}


/* =========================================================
   ASSISTANT
========================================================= */

export async function sendAssistantMessage(
    message: string,
): Promise<AssistantMessageResponse> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/assistant/message`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    message,
                }),
            },
        );

    if (!response.ok) {
        throw new Error(
            `Assistant request failed: ${response.status}`,
        );
    }

    return response.json();
}

export async function getAssistantConfiguration(): Promise<{
    provider: string;
    model: string;
}> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/assistant/configuration`,
        );

    if (!response.ok) {
        throw new Error(
            "Failed to get AI configuration",
        );
    }

    return response.json();
}

export async function getAssistantConversation(): Promise<AssistantConversationResponse> {
    assertToken();

    const response =
        await authenticatedFetch(
            `${API_BASE_URL}/assistant/conversation`,
        );

    if (!response.ok) {
        throw new Error(
            `Failed to load conversation: ${response.status}`,
        );
    }

    return response.json();
}