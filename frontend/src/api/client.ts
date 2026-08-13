import type { LoginResponse, UserResponse } from "../types/auth";
import { getToken } from "../auth/token";
import type {
    Workflow,
    WorkflowCreate,
    WorkflowUpdate,
} from "../types/workflow";

import type { Automation } from "../types/automation";
import type { AssistantMessageResponse } from "../types/assistant";



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



export async function getWorkflows(): Promise<Workflow[]> {
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/workflows/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(
            `Failed to get workflows: ${response.status}`,
        );
    }

    return response.json();
}


export async function createWorkflow(
    data: WorkflowCreate,
): Promise<Workflow> {
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_BASE_URL}/workflows/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to create workflow: ${response.status}`,
        );
    }

    return response.json();
}


export async function getWorkflow(
    workflowId: number,
): Promise<Workflow> {
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${API_BASE_URL}/workflows/${workflowId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
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
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${API_BASE_URL}/workflows/${workflowId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${API_BASE_URL}/workflows/${workflowId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to delete workflow: ${response.status}`,
        );
    }
}

export async function getAutomations(): Promise<Automation[]> {
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${API_BASE_URL}/automation/`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to get automations: ${response.status}`,
        );
    }

    return response.json();
}

export async function sendAssistantMessage(
    message: string,
): Promise<AssistantMessageResponse> {
    const token = getToken();

    if (!token) {
        throw new Error("Not authenticated");
    }

    const response = await fetch(
        `${API_BASE_URL}/assistant/message`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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
