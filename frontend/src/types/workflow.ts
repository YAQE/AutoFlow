export type WorkflowStatus = "active" | "inactive";

export type Workflow = {
    id: number;
    title: string;
    description: string | null;
    prompt: string;
    status: WorkflowStatus;
    created_at: string;
    updated_at: string;
    owner_id: number;
};

export type WorkflowCreate = {
    title: string;
    description?: string | null;
    prompt?: string | null;
    status?: WorkflowStatus;
};

export type WorkflowUpdate = {
    title?: string;
    description?: string | null;
    prompt?: string;
    status?: WorkflowStatus;
};

export type WorkflowRunRequest = {
    input: string;
};

export type WorkflowRunResponse = {
    id: number;
    workflow_id: number;
    input: string;
    output: string;
    created_at: string;
};