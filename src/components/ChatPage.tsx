import React, {useState, useRef, useEffect} from "react";
import ReactMarkdown from "react-markdown";
import {Input} from "./ui/input";
import {Button} from "./ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";

const API_URL = "https://api.ai.grabbe.site/chat";
const AUTH_URL = "https://api.ai.grabbe.site/auth";
const THREAD_URL = "https://api.ai.grabbe.site/thread/create";

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
                    headers: {"Content-Type": "application/json"},
                });

                if (!authResponse.ok) {
                    console.error("Fehler bei der Authentifizierung.");
                    return;
                }

                const authData = await authResponse.json();
                localStorage.setItem("session_token", authData.token);
                setToken(authData.token);

                console.log("Authentifizierung erfolgreich.");

                const threadResponse = await fetch(THREAD_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authData.token}`,
                    },
                });

                if (!threadResponse.ok) {
                    console.error("Fehler beim Erstellen des Threads.");
                    return;
                }

                const threadData = await threadResponse.json();
                setThreadId(threadData.threadId);
                console.log("Thread erstellt mit ID:", threadData.threadId);
            } catch (error) {
                console.error("Fehler beim Authentifizieren oder Erstellen des Threads:", error);
            }
        }

        const storedToken = localStorage.getItem("session_token");
        if (!storedToken) {
            authenticateAndCreateThread();
        } else {
            setToken(storedToken);

            // Attempt to create thread if token exists but no thread ID is stored
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
                            console.log("Thread erstellt mit ID:", threadData.threadId);
                        } else {
                            console.error("Fehler beim Erstellen des Threads mit gespeichertem Token.");
                        }
                    } catch (error) {
                        console.error("Fehler beim Erstellen des Threads:", error);
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

        setMessages((prev) => [
            ...prev,
            {id: botMessageId, text: "", user: "Bot" as const},
        ]);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
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
                    {id: Date.now(), text: "Fehler beim Abrufen der Antwort.", user: "Bot" as const},
                ]);
                setIsBotResponding(false);
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const {value, done: readerDone} = await reader?.read()!;
                done = readerDone;

                const chunk = decoder.decode(value, {stream: true});

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === botMessageId
                            ? {...msg, text: msg.text + chunk}
                            : msg
                    )
                );
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setMessages((prev) => [
                    ...prev,
                    {id: Date.now(), text: `Fehler: ${error.message}`, user: "Bot" as const},
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {id: Date.now(), text: "Unbekannter Fehler", user: "Bot" as const},
                ]);
            }
        } finally {
            setIsBotResponding(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <Card className="flex flex-col h-full mx-auto w-full max-w-2xl shadow-md">
                <CardHeader className="py-4 border-b">
                    <CardTitle className="text-center text-lg font-semibold">Grabbe-AI Chat</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-4 rounded-lg max-w-xs text-sm shadow ${
                                msg.user === "You"
                                    ? "bg-primary text-primary-foreground self-end"
                                    : "bg-secondary text-secondary-foreground self-start"
                            }`}
                        >
                            {msg.user === "Bot" ? (
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            ) : (
                                msg.text
                            )}
                        </div>
                    ))}
                </CardContent>

                <CardContent className="p-4 flex items-center gap-4 border-t">
                    <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isBotResponding}
                    />
                    <Button onClick={handleSend} className="h-10" disabled={isBotResponding || !token || !threadId}>
                        Send
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatPage;
