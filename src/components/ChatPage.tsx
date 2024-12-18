import React, { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const API_URL = "https://api.ai.grabbe.site/chat";
const AUTH_URL = "https://api.ai.grabbe.site/auth";

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<{ id: number; text: string; user: "You" | "Bot" }[]>([]);
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [token, setToken] = useState<string | null>(null);

    // Authentifizierung beim Laden der Seite
    useEffect(() => {
        async function login() {
            try {
                const response = await fetch(AUTH_URL, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("session_token", data.token);
                    setToken(data.token);
                    console.log("Authentifizierung erfolgreich.");
                } else {
                    console.error("Fehler bei der Authentifizierung.");
                }
            } catch (error) {
                console.error("Fehler beim Abrufen der Authentifizierung:", error);
            }
        }

        const storedToken = localStorage.getItem("session_token");
        if (!storedToken) {
            login();
        } else {
            setToken(storedToken);
        }
    }, []);

    const handleSend = async (): Promise<void> => {
        if (!inputRef.current?.value.trim() || isBotResponding || !token) return;

        const userMessage = {
            id: Date.now(),
            text: inputRef.current.value.trim(),
            user: "You" as const,
        };

        setMessages((prev) => [...prev, userMessage]);
        inputRef.current.value = "";
        setIsBotResponding(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ question: userMessage.text }),
            });

            if (!response.ok) {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now(), text: "Fehler beim Abrufen der Antwort.", user: "Bot" as const },
                ]);
                setIsBotResponding(false);
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let botResponse = "";

            while (!done) {
                const { value, done: readerDone } = await reader?.read()!;
                done = readerDone;
                botResponse += decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const updatedMessages = [...prev];
                    if (updatedMessages.some((msg) => msg.user === "Bot" && msg.id === userMessage.id + 1)) {
                        updatedMessages[updatedMessages.length - 1].text = botResponse;
                    } else {
                        updatedMessages.push({ id: userMessage.id + 1, text: botResponse, user: "Bot" as const });
                    }
                    return updatedMessages;
                });
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now(), text: `Fehler: ${error.message}`, user: "Bot" as const },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { id: Date.now(), text: "Unbekannter Fehler", user: "Bot" as const },
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
                            {msg.text}
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
                    <Button onClick={handleSend} className="h-10" disabled={isBotResponding || !token}>
                        Send
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatPage;
