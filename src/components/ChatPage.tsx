import React, { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
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
        "Wer ist der Schulleiter?",
        "Wie melde ich mein Kind krank?",
        "Wo finde ich die IServ-Seite?",
    ];

    return (
        <div className="flex flex-col h-screen bg-white text-gray-900">
            <Card className="flex flex-col h-full mx-auto w-full max-w-4xl shadow-md border border-gray-300 bg-white">
                <CardHeader className="p-4 bg-gray-100">
                    <div className="text-2xl font-bold text-center animate-pulse">Chat Interface</div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                    {showExampleCards && (
                        <div className="absolute inset-0 flex justify-center items-center gap-4 animate-fade-in">
                            {exampleQuestions.map((question, index) => (
                                <Card
                                    key={index}
                                    className="p-4 bg-gray-200 text-gray-900 rounded-lg shadow-md cursor-pointer hover:bg-gray-300 transform transition-transform hover:scale-105 hover:rotate-1"
                                    onClick={() => {
                                        if (inputRef.current) inputRef.current.value = question;
                                        handleSend();
                                    }}
                                >
                                    {question}
                                </Card>
                            ))}
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-3 rounded-md text-sm shadow-sm transition-all transform ${
                                msg.user === "You"
                                    ? "bg-blue-500 text-white self-end animate-slide-up"
                                    : "bg-gray-100 text-gray-900 self-start animate-fade-in"
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
                </CardContent>
                <CardContent className="p-4 flex items-center gap-2 bg-gray-100 animate-fade-in">
                    <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-900 border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isBotResponding}
                    />
                    <Button
                        onClick={handleSend}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 animate-bounce"
                        disabled={isBotResponding || !token}
                    >
                        Send
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatPage;
