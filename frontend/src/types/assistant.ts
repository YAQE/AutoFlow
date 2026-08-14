export type AssistantIntent =
    | "assistant_chat"
    | "automation";

export type AssistantMessageResponse = {
    intent: AssistantIntent;
    message: string;
    conversation_id: number;
};

export type AssistantConversationMessage = {
    id: number;
    conversation_id: number;
    role: "user" | "assistant";
    content: string;
    created_at: string;
};

export type AssistantConversationResponse = {
    conversation_id: number | null;
    messages: AssistantConversationMessage[];
};