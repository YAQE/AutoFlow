export type AutomationTrigger = {
    type: string;
    configuration: Record<string, unknown>;
};

export type AutomationAction = {
    type: string;
    configuration: Record<string, unknown>;
};

export type Automation = {
    id: number;
    user_id: number;
    name: string;
    goal: string;
    trigger: AutomationTrigger;
    actions: AutomationAction[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type AutomationPlan = {
    goal: string;
    trigger: AutomationTrigger;
    actions: AutomationAction[];
    missing_information: string[];
};
