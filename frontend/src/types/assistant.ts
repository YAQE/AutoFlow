export type AssistantIntent =
    | "assistant_chat"
    | "automation";

export type AssistantMessageResponse = {
    intent: AssistantIntent;
    message: string;
};