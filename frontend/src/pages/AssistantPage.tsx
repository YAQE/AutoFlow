import {
    useEffect,
    useRef,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    getAssistantConversation,
    sendAssistantMessage,
} from "../api/client";

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
    isTyping?: boolean;
};

function AssistantPage() {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [conversationLoading, setConversationLoading] =
        useState(true);

    const chatEndRef =
        useRef<HTMLDivElement | null>(null);

    const textareaRef =
        useRef<HTMLTextAreaElement | null>(null);

    const typingTimerRef =
        useRef<number | null>(null);

    const [messages, setMessages] =
        useState<ChatMessage[]>([]);

    /*
     * Load conversation history once when the
     * assistant page is opened.
     */
    useEffect(() => {
        async function loadConversation() {
            try {
                const conversation =
                    await getAssistantConversation();

                if (conversation.messages.length > 0) {
                    setMessages(
                        conversation.messages.map(
                            (item) => ({
                                id: item.id,
                                role: item.role,
                                content:
                                    item.content,
                            }),
                        ),
                    );
                } else {
                    setMessages([
                        {
                            id: 1,
                            role: "assistant",
                            content:
                                "Merhaba. Ben AutoFlow Assistant. Bir şey öğrenmek, fikir tartışmak veya yapmak istediğin bir işi otomasyona dönüştürmek için benimle konuşabilirsin.",
                        },
                    ]);
                }
            } catch {
                setMessages([
                    {
                        id: 1,
                        role: "assistant",
                        content:
                            "Merhaba. Ben AutoFlow Assistant. Bir şey öğrenmek, fikir tartışmak veya yapmak istediğin bir işi otomasyona dönüştürmek için benimle konuşabilirsin.",
                    },
                ]);
            } finally {
                setConversationLoading(false);
            }
        }

        loadConversation();
    }, []);

    /*
     * Scroll to the latest message.
     */
    useEffect(() => {
        if (conversationLoading) {
            return;
        }

        chatEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [
        messages,
        loading,
        conversationLoading,
    ]);

    /*
     * Cleanup typing timer.
     */
    useEffect(() => {
        return () => {
            if (
                typingTimerRef.current !== null
            ) {
                window.clearTimeout(
                    typingTimerRef.current,
                );
            }
        };
    }, []);

    /*
     * Resize textarea automatically.
     */
    function resizeTextarea() {
        const textarea =
            textareaRef.current;

        if (!textarea) {
            return;
        }

        textarea.style.height = "auto";

        const maxHeight = 180;

        textarea.style.height =
            `${Math.min(
                textarea.scrollHeight,
                maxHeight,
            )}px`;
    }

    useEffect(() => {
        resizeTextarea();
    }, [message]);

    /*
     * Simulate streaming for the current UI.
     *
     * Later this can be replaced with real
     * model streaming without changing the UI.
     */
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
            if (
                currentIndex >=
                fullText.length
            ) {
                setMessages((current) =>
                    current.map((item) =>
                        item.id ===
                        messageId
                            ? {
                                  ...item,
                                  isTyping:
                                      false,
                              }
                            : item,
                    ),
                );

                typingTimerRef.current =
                    null;

                return;
            }

            const chunkSize =
                Math.floor(
                    Math.random() * 3,
                ) + 1;

            currentIndex = Math.min(
                currentIndex +
                    chunkSize,
                fullText.length,
            );

            const currentText =
                fullText.slice(
                    0,
                    currentIndex,
                );

            setMessages((current) =>
                current.map((item) =>
                    item.id === messageId
                        ? {
                              ...item,
                              content:
                                  currentText,
                          }
                        : item,
                ),
            );

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

        if (
            !trimmedMessage ||
            loading ||
            conversationLoading
        ) {
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

            setLoading(false);

            addAssistantMessageAnimated(
                response.message,
            );
        } catch (error) {
            setLoading(false);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Bir hata oluştu.";

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


                        <Link
                            to="/dashboard"
                            className="assistant-nav-item"
                        >
                            <span className="nav-icon">
                                ▦
                            </span>

                            Dashboard
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
                                    AI Provider
                                </span>

                                <small>
                                    Connected
                                </small>

                            </div>

                        </div>

                    </header>


                    {/* CHAT */}

                    <div className="assistant-chat">

                        <div className="chat-scroll">

                            {conversationLoading ? (

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

                            ) : (

                                messages.map(
                                    (
                                        chatMessage,
                                    ) => (

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


                                                {chatMessage.role ===
                                                    "assistant" &&
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
                                )

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
                                    ref={
                                        textareaRef
                                    }
                                    value={message}
                                    onChange={(
                                        event,
                                    ) =>
                                        setMessage(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    onKeyDown={
                                        handleKeyDown
                                    }
                                    placeholder="Message AutoFlow..."
                                    rows={1}
                                    disabled={
                                        loading ||
                                        conversationLoading
                                    }
                                />


                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        conversationLoading ||
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
                                Enter to send ·
                                Shift + Enter for a
                                new line
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
                                Active provider
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
                                Current model
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
                            These instructions will
                            eventually become persistent
                            assistant configuration.
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