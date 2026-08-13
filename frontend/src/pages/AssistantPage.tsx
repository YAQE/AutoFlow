import {
    useEffect,
    useRef,
    useState,
} from "react";

import { Link } from "react-router-dom";

import { sendAssistantMessage } from "../api/client";

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
    isTyping?: boolean;
};

function AssistantPage() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const chatEndRef =
        useRef<HTMLDivElement | null>(null);

    const textareaRef =
        useRef<HTMLTextAreaElement | null>(null);

    const typingTimerRef =
        useRef<number | null>(null);

    const [messages, setMessages] =
        useState<ChatMessage[]>([
            {
                id: 1,
                role: "assistant",
                content:
                    "Hi. I'm your AutoFlow assistant. Ask me anything, discuss an idea, or describe something you'd like to automate.",
            },
        ]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, loading]);

    useEffect(() => {
        return () => {
            if (typingTimerRef.current !== null) {
                window.clearTimeout(
                    typingTimerRef.current,
                );
            }
        };
    }, []);

    function resizeTextarea() {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        textarea.style.height = "auto";

        const maxHeight = 180;

        textarea.style.height = `${Math.min(
            textarea.scrollHeight,
            maxHeight,
        )}px`;
    }

    useEffect(() => {
        resizeTextarea();
    }, [message]);

    function addAssistantMessageAnimated(
        fullText: string,
    ) {
        const messageId = Date.now() + 1;

        setMessages((current) => [
            ...current,
            {
                id: messageId,
                role: "assistant",
                content: "",
                isTyping: true,
            },
        ]);

        let currentIndex = 0;

        function typeNextChunk() {
            if (currentIndex >= fullText.length) {
                setMessages((current) =>
                    current.map((item) =>
                        item.id === messageId
                            ? {
                                  ...item,
                                  isTyping: false,
                              }
                            : item,
                    ),
                );
            
                typingTimerRef.current = null;
                return;
            }

            /*
             * Bir kerede 1-3 karakter oluşturarak
             * doğal bir yazım hissi veriyoruz.
             */
            const chunkSize =
                Math.floor(Math.random() * 3) + 1;

            currentIndex = Math.min(
                currentIndex + chunkSize,
                fullText.length,
            );

            const currentText =
                fullText.slice(0, currentIndex);

            setMessages((current) =>
                current.map((item) =>
                    item.id === messageId
                        ? {
                              ...item,
                              content: currentText,
                          }
                        : item,
                ),
            );

            /*
             * Her karakter arasında tamamen sabit
             * olmayan küçük bir gecikme.
             */
            const delay =
                Math.floor(
                    Math.random() * 18,
                ) + 12;

            typingTimerRef.current =
                window.setTimeout(
                    typeNextChunk,
                    delay,
                );
        }

        typeNextChunk();
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedMessage =
            message.trim();

        if (!trimmedMessage || loading) {
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: "user",
            content: trimmedMessage,
        };

        setMessages((current) => [
            ...current,
            userMessage,
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response =
                await sendAssistantMessage(
                    trimmedMessage,
                );

            /*
             * Önce "Thinking..." durumunu
             * kapatıyoruz.
             */
            setLoading(false);

            /*
             * Sonra AI cevabını karakter karakter
             * oluşturmaya başlıyoruz.
             */
            addAssistantMessageAnimated(
                response.message,
            );
        } catch (error) {
            setLoading(false);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Something went wrong.";

            addAssistantMessageAnimated(
                errorMessage,
            );
        }
    }

    function handleKeyDown(
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            event.currentTarget.form?.requestSubmit();
        }
    }

    return (
        <main className="assistant-page">
            <div className="assistant-shell">

                {/* SIDEBAR */}

                <aside className="assistant-sidebar">

                    <div className="assistant-brand">
                        <div className="assistant-brand-mark">
                            A
                        </div>

                        <div>
                            <strong>
                                AutoFlow
                            </strong>

                            <span>
                                AI workspace
                            </span>
                        </div>
                    </div>

                    <nav className="assistant-navigation">

                        <Link
                            to="/assistant"
                            className="assistant-nav-item active"
                        >
                            <span className="nav-icon">
                                ✦
                            </span>

                            AI Assistant
                        </Link>

                        <Link
                            to="/automations"
                            className="assistant-nav-item"
                        >
                            <span className="nav-icon">
                                ⚡
                            </span>

                            Automations
                        </Link>

                    </nav>

                    <div className="assistant-sidebar-bottom">

                        <div className="assistant-user-card">

                            <div className="user-avatar">
                                Y
                            </div>

                            <div>
                                <strong>
                                    Workspace
                                </strong>

                                <span>
                                    Personal
                                </span>
                            </div>

                        </div>

                    </div>

                </aside>


                {/* MAIN */}

                <section className="assistant-content">

                    <header className="assistant-topbar">

                        <div>

                            <div className="assistant-status">
                                <span className="status-dot" />
                                AI Assistant
                            </div>

                            <h1>
                                What can I help you with?
                            </h1>

                        </div>

                        <div className="assistant-model">

                            <span className="model-dot" />

                            <div>
                                <span>
                                    Ollama
                                </span>

                                <small>
                                    qwen3:4b
                                </small>
                            </div>

                        </div>

                    </header>


                    {/* CHAT */}

                    <div className="assistant-chat">

                        <div className="chat-scroll">

                            {messages.map(
                                (chatMessage) => (

                                    <div
                                        key={
                                            chatMessage.id
                                        }
                                        className={`chat-row ${chatMessage.role}`}
                                    >

                                        {chatMessage.role ===
                                            "assistant" && (
                                            <div className="chat-avatar assistant-avatar">
                                                A
                                            </div>
                                        )}

                                        <div
                                            className={`chat-message ${chatMessage.role}`}
                                        >
                                            {
                                                chatMessage.content
                                            }

                                            {chatMessage.role === "assistant" &&
                                                chatMessage.isTyping && (
                                                    <span className="typing-cursor">
                                                        ▌
                                                    </span>
                                                )}
                                        </div>

                                        {chatMessage.role ===
                                            "user" && (
                                            <div className="chat-avatar user-message-avatar">
                                                Y
                                            </div>
                                        )}

                                    </div>
                                ),
                            )}

                            {loading && (
                                <div className="chat-row assistant">

                                    <div className="chat-avatar assistant-avatar">
                                        A
                                    </div>

                                    <div className="chat-message assistant typing-message">
                                        <span />
                                        <span />
                                        <span />
                                    </div>

                                </div>
                            )}

                            <div ref={chatEndRef} />

                        </div>


                        {/* INPUT */}

                        <div className="assistant-input-area">

                            <form
                                className="assistant-input-box"
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(
                                            event.target.value,
                                        )
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    placeholder="Message AutoFlow..."
                                    rows={1}
                                    disabled={loading}
                                />

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !message.trim()
                                    }
                                    aria-label="Send message"
                                >
                                    {loading
                                        ? "..."
                                        : "↑"}
                                </button>

                            </form>

                            <p>
                                Enter to send · Shift +
                                Enter for a new line
                            </p>

                        </div>

                    </div>

                </section>


                {/* CONFIG */}

                <aside className="assistant-config">

                    <div className="config-header">

                        <div>

                            <span className="config-eyebrow">
                                AI CONFIGURATION
                            </span>

                            <h2>
                                Assistant
                            </h2>

                        </div>

                        <button
                            className="config-settings-button"
                            type="button"
                            aria-label="Settings"
                        >
                            ⚙
                        </button>

                    </div>

                    <div className="config-section">

                        <label>
                            Provider
                        </label>

                        <button
                            className="config-select"
                            type="button"
                        >
                            <span>
                                Ollama
                            </span>

                            <span>
                                ▾
                            </span>
                        </button>

                    </div>

                    <div className="config-section">

                        <label>
                            Model
                        </label>

                        <button
                            className="config-select"
                            type="button"
                        >
                            <span>
                                qwen3:4b
                            </span>

                            <span>
                                ▾
                            </span>
                        </button>

                    </div>

                    <div className="config-divider" />

                    <div className="config-section instructions">

                        <div className="instructions-heading">

                            <label>
                                Behavior
                            </label>

                            <span>
                                System instructions
                            </span>

                        </div>

                        <textarea
                            defaultValue={`You are a helpful AI assistant inside AutoFlow.

Help the user learn, think through ideas and improve their prompts.

When the user wants to automate a real-world task, help them turn the
idea into a clear automation.`}
                        />

                    </div>

                    <div className="config-info">

                        <div className="info-icon">
                            i
                        </div>

                        <p>
                            These instructions define
                            how the assistant behaves
                            during conversations.
                        </p>

                    </div>

                    <button
                        className="save-config-button"
                        type="button"
                    >
                        Save configuration
                    </button>

                </aside>

            </div>
        </main>
    );
}

export default AssistantPage;