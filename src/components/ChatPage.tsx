import React, { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.css";
import "highlight.js/styles/github-dark.min.css";
import Markdown from "react-markdown";

const API_URL = "https://api.grabbe.site/chat";
const AUTH_URL = "https://api.grabbe.site/auth";
const THREAD_URL = "https://api.grabbe.site/thread/create";

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<{ id: number; text: string; user: "You" | "Bot" }[]>([]);
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [token, setToken] = useState<string | null>(null);
    const [threadId, setThreadId] = useState<string | null>(null);
    useEffect(() => {
        async function authenticateAndCreateThread() {
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

                const threadResponse = await fetch(THREAD_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authData.token}`,
                    },
                });

                if (!threadResponse.ok) {
                    console.error("Thread creation failed.");
                    return;
                }

                const threadData = await threadResponse.json();
                setThreadId(threadData.threadId);
            } catch (error) {
                console.error("Error during authentication or thread creation:", error);
            }
        }

        const storedToken = localStorage.getItem("session_token");
        if (!storedToken) {
            authenticateAndCreateThread();
        } else {
            setToken(storedToken);
            if (!threadId) {
                (async () => {
                    try {
                        const threadResponse = await fetch(THREAD_URL, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${storedToken}`,
                            },
                        });

                        if (threadResponse.ok) {
                            const threadData = await threadResponse.json();
                            setThreadId(threadData.threadId);
                        } else {
                            console.error("Thread creation failed with stored token.");
                        }
                    } catch (error) {
                        console.error("Error creating thread:", error);
                    }
                })();
            }
        }
    }, [threadId]);

    const handleSend = async (): Promise<void> => {
        if (!inputRef.current?.value.trim() || isBotResponding || !token || !threadId) return;

        const userMessage = {
            id: Date.now(),
            text: inputRef.current.value.trim(),
            user: "You" as const,
        };

        setMessages((prev) => [...prev, userMessage]);
        inputRef.current.value = "";
        setIsBotResponding(true);

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
                    threadId: threadId,
                }),
            });

            if (!response.ok) {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now(), text: "Error retrieving response.", user: "Bot" as const },
                ]);
                setIsBotResponding(false);
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("ReadableStream reader is undefined.");
            }

            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                const chunk = decoder.decode(value, { stream: true });
                console.log(chunk);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === botMessageId ? { ...msg, text: msg.text + chunk } : msg
                    )
                );
            }

        } catch (error: unknown) {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    text: error instanceof Error ? `Error: ${error.message}` : "Unknown error",
                    user: "Bot" as const,
                },
            ]);
        } finally {
            setIsBotResponding(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
            <Card className="flex flex-col h-full mx-auto w-full max-w-2xl shadow-xl  border border-gray-700 bg-gray-900">
                <CardHeader className="py-4  bg-gray-800 text-white">
                    <CardTitle className="text-center text-lg font-bold">GrabbeAI Chat</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-4 w-full text-sm rounded-lg shadow-md transition-transform transform-gpu hover:scale-105 ${
                                msg.user === "You"
                                    ? "bg-blue-600 text-white self-end"
                                    : "bg-gray-700 text-gray-200 self-start"
                            }`}
                        >
                            <Markdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                            >
                                {msg.text}
                            </Markdown>
                        </div>
                    ))}
                </CardContent>

                <CardContent className="p-4 flex items-center gap-4  bg-gray-800 ">
                    <Input
                        ref={inputRef}
                        placeholder="Schreibe eine Nachricht..."
                        className="flex-1 rounded-full bg-gray-700 text-white border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isBotResponding}
                    />
                    <Button
                        onClick={handleSend}
                        className="h-10 px-6 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={isBotResponding || !token || !threadId}
                    >
                        Senden
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatPage;
