import React, { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion";

// Define the message type with an optional ID for better identification
type Message = {
    id: number;
    text: string;
    user: "You" | "Bot";
};

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const inputRef = useRef<HTMLInputElement>(null); // Use useRef for the input field
    const [botAnimatingIndex, setBotAnimatingIndex] = useState<number>(0);
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false); // Track bot's response status

    // Helper function to send a message
    const handleSend = (): void => {
        if (inputRef.current?.value.trim() && !isBotResponding) {
            const newMessage: Message = {
                id: Date.now(), // Use timestamp as unique ID
                text: inputRef.current.value,
                user: "You",
            };

            // Add the user message and simulate bot response
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, newMessage];
                return updatedMessages;
            });
            inputRef.current.value = ""; // Clear input after sending message
            setBotAnimatingIndex(messages.length + 1);
            setIsBotResponding(true); // Indicate that the bot is responding

            // Simulate bot response after a short delay
            setTimeout(() => {
                const botMessage: Message = {
                    id: Date.now(), // Use a new timestamp for the bot message ID
                    text: "This is a bot response.",
                    user: "Bot",
                };

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages, botMessage];
                    return updatedMessages;
                });
                setIsBotResponding(false); // Reset the responding state after bot responds
            }, 1000);
        }
    };

    // Typing animation for bot messages
    const TypingText: React.FC<{ text: string; isAnimating: boolean }> = ({ text, isAnimating }) => {
        const [displayedText, setDisplayedText] = useState<string>("");

        useEffect(() => {
            if (!isAnimating) {
                setDisplayedText(text);
                return;
            }

            let index = 0;
            const interval = setInterval(() => {
                if (index < text.length -1) {
                    setDisplayedText((prev) => prev + text[index]);
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 50);
            return () => clearInterval(interval);
        }, [text, isAnimating]);

        return <span>{displayedText}</span>;
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
                    {messages.map((msg, index) => (
                        <motion.div
                            key={msg.id} // Use unique message id for key
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-lg max-w-xs text-sm shadow ${
                                msg.user === "You"
                                    ? "bg-primary text-primary-foreground self-end"
                                    : "bg-secondary text-secondary-foreground self-start"
                            }`}
                        >
                            {msg.user === "Bot" ? (
                                <TypingText
                                    text={msg.text || ""}
                                    isAnimating={index === botAnimatingIndex} // Only animate the latest bot message
                                />
                            ) : (
                                msg.text
                            )}
                        </motion.div>
                    ))}
                </CardContent>

                {/* Input Section */}
                <CardContent className="p-4 flex items-center gap-4 border-t">
                    <Input
                        ref={inputRef} // Use the ref here
                        placeholder="Type your message..."
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isBotResponding} // Disable input while bot is responding
                    />
                    <Button
                        onClick={handleSend}
                        className="h-10"
                        disabled={isBotResponding} // Disable send button while bot is responding
                    >
                        Send
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatPage;
