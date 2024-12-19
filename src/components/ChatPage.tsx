import React, { useState, useRef, useEffect } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.css";
import "highlight.js/styles/github-dark.min.css";
import Markdown from "react-markdown";
import { BlueLink } from "@/components/BlueLink.tsx";
import rehypSemanticBlockquotes from "rehype-semantic-blockquotes";

const API_URL = "https://api.grabbe.site/chat";
const AUTH_URL = "https://api.grabbe.site/auth";
const THREAD_URL = "https://api.grabbe.site/thread/create";

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<{ id: number; text: string; user: "You" | "Bot" }[]>([]);
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false);
    const [showExampleCards, setShowExampleCards] = useState<boolean>(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const [token, setToken] = useState<string | null>(null);
    const [threadId, setThreadId] = useState<string | null>(null);

    useEffect(() => {
        async function authenticate() {
            try {
                const authResponse = await fetch(AUTH_URL, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!authResponse.ok) {
                    console.error("Authentication failed.");
                    return;
                }

                const authData = await authResponse.json();
                localStorage.setItem("session_token", authData.token);
                setToken(authData.token);
            } catch (error) {
                console.error("Error during authentication:", error);
            }
        }

        const storedToken = localStorage.getItem("session_token");
        if (!storedToken) {
            authenticate();
        } else {
            setToken(storedToken);
        }
    }, []);

    const createThread = async (): Promise<string | null> => {
        if (!token) return null;

        try {
            const threadResponse = await fetch(THREAD_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!threadResponse.ok) {
                console.error("Thread creation failed.");
                return null;
            }

            const threadData = await threadResponse.json();
            return threadData.threadId;
        } catch (error) {
            console.error("Error creating thread:", error);
            return null;
        }
    };

    const handleSend = async (): Promise<void> => {
        if (!inputRef.current?.value.trim() || isBotResponding || !token) return;

        setIsBotResponding(true);
        setShowExampleCards(false);

        // Sichere Nachricht vom Benutzer
        const userMessage = {
            id: Date.now(),
            text: inputRef.current.value.trim(),
            user: "You" as const,
        };

        setMessages((prev) => [...prev, userMessage]);
        inputRef.current.value = "";

        // Sicherstellen, dass ein Thread existiert
        let currentThreadId = threadId;
        if (!currentThreadId) {
            currentThreadId = await createThread();
            if (!currentThreadId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        text: "Error creating thread. Please try again later.",
                        user: "Bot" as const,
                    },
                ]);
                setIsBotResponding(false);
                return;
            }
            setThreadId(currentThreadId);
        }

        // Initialisiere Bot-Nachricht
        const botMessageId = Date.now() + 1;
        setMessages((prev) => [...prev, { id: botMessageId, text: "", user: "Bot" as const }]);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    question: userMessage.text,
                    threadId: currentThreadId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch bot response.");
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("ReadableStream reader is undefined.");
            }

            const decoder = new TextDecoder();
            let done = false;
            let botMessageText = "";

            // Lies die Daten und setze den Text
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                const chunk = decoder.decode(value, { stream: true });
                botMessageText += chunk;

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === botMessageId ? { ...msg, text: botMessageText } : msg
                    )
                );
            }
        } catch (error: unknown) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    text: error instanceof Error ? `Error: ${error.message}` : "Unknown error occurred.",
                    user: "Bot" as const,
                },
            ]);
        } finally {
            setIsBotResponding(false);
        }
    };

    const exampleQuestions = [
        "Wann ist der nächste Elternsprechtag?",
        "Wie erreiche ich das Sekretariat des Grabbe-Gymnasiums?",
        "Wo ist das Grabbe-Gymnasium?",
    ];

    return (
        <div className="bg-white text-gray-800 flex justify-center items-center min-h-screen">
            <div className="container mx-auto max-w-xl p-10 flex flex-col items-center">
                <div className="logo mb-6 text-sm text-gray-500">Logo</div>
                <div className="title text-2xl font-semibold mb-4">GrabbeAI</div>
                <div className="subtitle text-base text-gray-600 mb-10">
                    Der digitale Assistent des Grabbe-Gymnasiums Detmold
                </div>

                {showExampleCards && (
                    <div className="suggestions flex flex-wrap justify-center gap-5 mb-16 w-full">
                        {exampleQuestions.map((question, index) => (
                            <div
                                key={index}
                                className="suggestion-box bg-white rounded-xl py-4 px-5 text-base text-gray-800 shadow-md hover:bg-gray-200 cursor-pointer min-w-[150px] max-w-[200px] text-center overflow-hidden text-ellipsis whitespace-nowrap"
                                onClick={() => {
                                    if (inputRef.current) inputRef.current.value = question;
                                    handleSend();
                                }}
                            >
                                {question}
                            </div>
                        ))}
                    </div>
                )}

                <div className="w-full flex flex-col gap-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-3 rounded-md text-sm shadow-sm transition-all transform ${
                                msg.user === "You"
                                    ? "bg-blue-500 text-white self-end"
                                    : "bg-gray-100 text-gray-900 self-start"
                            }`}
                        >
                            <Markdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypSemanticBlockquotes]}
                                components={{
                                    a: (props) => <BlueLink {...props} />,
                                }}
                            >
                                {msg.text}
                            </Markdown>
                        </div>
                    ))}
                </div>

                <div className="input-area-wrapper w-full flex justify-center mt-6">
                    <div className="input-area flex items-center bg-gray-100 rounded-full px-4 py-3 w-full max-w-xl">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Message GrabbeAI"
                            className="flex-1 bg-transparent outline-none text-base px-2"
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isBotResponding}
                        />
                        <button
                            aria-label="Send prompt"
                            className="send-button flex items-center justify-center h-10 w-10 rounded-full bg-black text-white hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
                            onClick={handleSend}
                            disabled={isBotResponding || !token}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
