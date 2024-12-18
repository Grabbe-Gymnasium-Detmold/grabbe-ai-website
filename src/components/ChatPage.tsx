import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const API_URL = "https://api.ai.grabbe.site/chat"; // Deine API URL

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<{ id: number; text: string; user: "You" | "Bot" }[]>([]);
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = async (): Promise<void> => {
        if (!inputRef.current?.value.trim() || isBotResponding) return;

        const userMessage = {
            id: Date.now(),
            text: inputRef.current.value.trim(),
            user: "You",
        };

        setMessages((prev) => [...prev, userMessage]);
        inputRef.current.value = ""; // Eingabe leeren
        setIsBotResponding(true);

        // Bot Antwort als Stream laden
        const token = localStorage.getItem("session_token");
        if (!token) {
            alert("Bitte melden Sie sich an, um fortzufahren.");
            setIsBotResponding(false);
            return;
        }

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
                    { id: Date.now(), text: "Fehler beim Abrufen der Antwort.", user: "Bot" },
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

                // Zeige den aktuell gestreamten Text an
                setMessages((prev) => {
                    const updatedMessages = [...prev];
                    if (updatedMessages.some((msg) => msg.user === "Bot" && msg.id === userMessage.id + 1)) {
                        updatedMessages[updatedMessages.length - 1].text = botResponse;
                    } else {
                        updatedMessages.push({ id: userMessage.id + 1, text: botResponse, user: "Bot" });
                    }
                    return updatedMessages;
                });
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { id: Date.now(), text: `Fehler: ${error.message}`, user: "Bot" },
            ]);
        } finally {
            setIsBotResponding(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <Card className="flex flex-col h-full mx-auto w-full max-w-2xl shadow-md">
                {/* Header */}
                <CardHeader className="py-4 border-b">
                    <CardTitle className="text-center text-lg font-semibold">Grabbe-AI Chat</CardTitle>
                </CardHeader>

                {/* Chat Content */}
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

                {/* Input Section */}
                <CardContent className="p-4 flex items-center gap-4 border-t">
                    <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isBotResponding}
                    />
                    <Button onClick={handleSend} className="h-10" disabled={isBotResponding}>
                        Send
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatPage;
