import React, { useState, useRef, useEffect, useCallback } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.css";
import "highlight.js/styles/github-dark.min.css";
import Markdown from "react-markdown";
import { BlueLink } from "@/components/BlueLink.tsx";
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { useToast } from "@/components/Toast.tsx";
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

const API_URL = "https://api.grabbe.site/chat";
const AUTH_URL = "https://api.grabbe.site/auth";
const THREAD_URL = "https://api.grabbe.site/thread/create";
const EXAMPLE_QUESTION_URL = "https://api.grabbe.site/examples";
const CHECK_TOKEN_URL = "https://api.grabbe.site/auth/check";
const EVALUATION_URL = "https://api.grabbe.site/evaluation";

const ChatPage: React.FC = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<{ id: number; text: string; user: "You" | "Bot", evaluation: string }[]>([]);
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false);
    const [showExampleCards, setShowExampleCards] = useState<boolean>(true);
    const [inputText, setInputText] = useState<string>("");
    const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("session_token"));
    const [threadId, setThreadId] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(localStorage.getItem("theme") === "dark");
    const { addToast } = useToast();

    const inputRef = useRef<HTMLInputElement>(null);

    const MAX_CHARACTERS = 150;

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'de', name: 'Deutsch' },
        // Weitere Sprachen hinzufügen
    ];

    const authenticate = useCallback(async () => {
        try {
            const authResponse = await fetch(AUTH_URL, { method: "GET", headers: { "Content-Type": "application/json" } });
            if (!authResponse.ok) throw new Error(t('error_authentication'));

            const { token: authToken } = await authResponse.json();
            localStorage.setItem("session_token", authToken);
            setToken(authToken);
        } catch (error) {
            console.error(error);
            setErrorMessage(t('error_authentication'));
        }
    }, [t]);

    const validateToken = useCallback(async (storedToken: string): Promise<boolean> => {
        try {
            const response = await fetch(CHECK_TOKEN_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${storedToken}`,
                },
            });
            return response.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    }, []);

    useEffect(() => {
        const checkToken = async () => {
            const storedToken = localStorage.getItem("session_token");
            if (storedToken) {
                const isValid = await validateToken(storedToken);
                if (isValid) {
                    setToken(storedToken);
                } else {
                    await authenticate();
                }
            } else {
                await authenticate();
            }
        };

        checkToken();
    }, [token, authenticate, validateToken]);

    useEffect(() => {
        const fetchExampleQuestions = async () => {
            if (!token) return;
            try {
                const cachedQuestions = localStorage.getItem("example_questions");
                if (cachedQuestions) {
                    const parsedQuestions = JSON.parse(cachedQuestions);
                    setExampleQuestions(shuffleAndSlice(parsedQuestions, 4));
                    return;
                }

                const qResponse = await fetch(EXAMPLE_QUESTION_URL, {
                    method: "GET",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                });
                if (!qResponse.ok) throw new Error(t('example_error'));

                const { questions } = await qResponse.json();
                localStorage.setItem("example_questions", JSON.stringify(questions));
                setExampleQuestions(shuffleAndSlice(questions, 4));
            } catch (error) {
                console.error(error);
                setErrorMessage(t('example_error'));
            }
        };

        fetchExampleQuestions();
    }, [token, t]);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        setIsDarkMode(savedTheme === "dark" || (savedTheme === null && window.matchMedia("(prefers-color-scheme: dark)").matches));
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

    const shuffleAndSlice = (array: string[], count: number): string[] => {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const handleSend = async (): Promise<void> => {
        if (!inputText.trim() || isBotResponding || inputText.length > MAX_CHARACTERS) return;

        setIsBotResponding(true);
        setShowExampleCards(false);
        const userMessage = { id: Date.now(), text: inputText.trim(), user: "You" as const, evaluation: "null" };
        setMessages(prev => [...prev, userMessage]);
        setInputText("");

        let currentThreadId = threadId;
        if (!currentThreadId) {
            currentThreadId = await createThread();
            if (!currentThreadId) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: t('error_create_thread'),
                    user: "Bot" as const,
                    evaluation: "null"
                }]);
                setIsBotResponding(false);
                return;
            }
            setThreadId(currentThreadId);
        }

        const botMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: botMessageId, text: "", user: "Bot" as const, evaluation: "null" }]);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ question: userMessage.text, threadId: currentThreadId }),
            });
            if (!response.ok) throw new Error(t('error_fetch_bot_response'));

            const reader = response.body?.getReader();
            if (!reader) throw new Error(t('error_fetch_bot_response'));

            const decoder = new TextDecoder();
            let done = false;
            let botMessageText = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });
                if (chunk.startsWith('{"done":true,')) {
                    const { messageId } = JSON.parse(chunk);
                    setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, id: messageId } : msg));
                } else {
                    botMessageText += chunk;
                    setMessages(prev => prev.map(msg => msg.id === botMessageId ? { ...msg, text: botMessageText } : msg));
                }
            }

        } catch (error: unknown) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: error instanceof Error ? `Error: ${error.message}` : t('error_fetch_bot_response'),
                user: "Bot" as const,
                evaluation: "null"
            }]);
        } finally {
            setIsBotResponding(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARACTERS) {
            setInputText(value);
        }
    };

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
                console.error(t('error_create_thread'));
                setErrorMessage(t('error_create_thread'));
                return null;
            }

            const threadData = await threadResponse.json();
            return threadData.threadId;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const handleEvaluation = async (messageId: number, evaluation: "positive" | "negative") => {
        if (!threadId || !token) return;
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, evaluation } : msg));
        try {
            const response = await fetch(EVALUATION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ threadId, messageId, evaluation }),
            });

            if (!response.ok) {
                throw new Error(t('evaluation_error'));
            }
            addToast(t('evaluation_thanks_positive'), "success", 5);
        } catch (error) {
            console.error(error);
            addToast(t('evaluation_error'), "error", 5);
        }
    };

    return (
        <div className="bg-white text-gray-800 flex justify-center items-center min-h-screen dark:bg-gray-800">
            <div className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white">
                <div className="p-4 dark:bg-gray-800 dark:text-white bg-white text-black">
                    {errorMessage && (
                        <div
                            className="mb-4 p-3 border-l-4 border-red-500 bg-red-100 text-red-800 rounded dark:bg-red-900 dark:text-red-300">
                            {errorMessage}
                        </div>
                    )}
                </div>

                <div>
                    <div className="container mx-auto max-w-xl p-10 flex flex-col items-center relative">
                        {/* Dropdown für Sprache */}
                        <div className="absolute top-4 left-4">
                            <select
                                value={i18n.language}
                                onChange={(e) => i18n.changeLanguage(e.target.value)}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            aria-label={t('dark_mode_toggle_label')}
                            className={`absolute top-4 right-4 p-1 w-16 h-8 flex items-center rounded-full transition-all duration-300  ${
                                isDarkMode ? "bg-gray-700" : "bg-yellow-400"
                            }`}
                        >
                            <div
                                className={`transform transition-all duration-300 ${
                                    isDarkMode ? "translate-x-8" : "translate-x-0"
                                }`}
                            >
                                {isDarkMode ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-6 h-6 text-yellow-400"
                                    >
                                        <path
                                            d="M21.75 12a9.75 9.75 0 11-10.61-9.737 0.75 0.75 0 01.861.818 0.75 0.75 0 01-.033.268 7.5 7.5 0 109.423 9.423 0.75 0.75 0 01.268-.033 0.75 0.75 0 01.818.861A9.742 9.742 0 0121.75 12z" />
                                    </svg>
                                ) : (
                                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                         className={`w-6 h-6 text-yellow-400`}
                                         width="1280.000000pt" height="1219.000000pt"
                                         viewBox="0 0 1280.000000 1219.000000"
                                         preserveAspectRatio="xMidYMid meet">

                                        <g transform="translate(0.000000,1219.000000) scale(0.100000,-0.100000)"
                                           fill="#000000" stroke="none">
                                            {/* SVG-Pfade */}
                                            <path d="M6235 12171 c-44 -26 -61 -49 -94 -121 -74 -165 -108 -411 -156
    -1110 -21 -309 -40 -462 -66 -535 -30 -83 -36 -226 -15 -330 24 -122 102 -271
    186 -354 178 -178 382 -181 566 -9 57 54 66 68 88 137 13 42 34 132 46 201 21
    116 23 166 30 695 6 491 10 580 25 645 23 100 23 273 0 360 -59 224 -226 372
    -480 425 -93 19 -94 19 -130 -4z"/>
                                            {/* Weitere Pfade */}
                                        </g>
                                    </svg>
                                )}
                            </div>
                        </button>

                        {/* Titel und Untertitel */}
                        <div className="title text-2xl font-semibold mb-4">{t('title')}</div>
                        <div className="subtitle text-base text-gray-600 mb-10">
                            {t('subtitle')}
                        </div>

                        {showExampleCards && (
                            <div className="suggestions flex flex-wrap justify-center gap-5 mb-16 w-full">
                                {exampleQuestions.map((question, index) => (
                                    <span
                                        key={index}
                                        className="suggestion-box border border-gray-200 bg-gray-50 text-wrap dark:text-white dark:bg-gray-700 dark:border-opacity-0 rounded-xl py-4 px-5 text-base text-gray-800 shadow-md hover:bg-gray-200 cursor-pointer min-w-[150px] max-w-[200px] text-center overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center"
                                        onClick={() => {
                                            setInputText(question);
                                            handleSend();
                                        }}
                                    >
                                        {question}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="w-full flex flex-col gap-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-3 rounded-2xl text-sm shadow-sm transition-all transform  ${
                                        msg.user === "You"
                                            ? "dark:bg-gray-500 dark:text-white self-end bg-blue-200"
                                            : "dark:bg-gray-700 dark:text-white self-start bg-gray-100 relative group"
                                    }`}
                                >
                                    <Markdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeSemanticBlockquotes]}
                                        components={{
                                            a: (props) => <BlueLink {...props} />,
                                        }}
                                    >
                                        {msg.text}
                                    </Markdown>
                                    {!isBotResponding && (
                                        <div
                                            className="absolute transform translate-x-4 translate-y-4 opacity-0 group-hover:opacity-100 flex space-x-2">
                                            {msg.evaluation == "null" && (
                                                <>
                                                    <FaThumbsUp
                                                        onClick={() => handleEvaluation(msg.id, "positive")}
                                                        className="text-lg text-green-500 cursor-pointer hover:scale-110 transition-transform duration-300" />
                                                    <FaThumbsDown
                                                        onClick={() => handleEvaluation(msg.id, "negative")}
                                                        className="text-lg text-red-500 cursor-pointer hover:scale-110 transition-transform duration-300" />
                                                </>
                                            )}
                                            {msg.evaluation == "positive" && (
                                                <FaThumbsUp
                                                    className="text-lg text-green-500 cursor-default hover:scale-100 transition-none" />
                                            )}
                                            {msg.evaluation == "negative" && (
                                                <FaThumbsDown
                                                    className="text-lg text-red-500 cursor-default hover:scale-100 transition-none" />
                                            )}
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>

                        {inputText.length > MAX_CHARACTERS && (
                            <div className="text-red-500 text-sm mb-2">
                                {t('input_character_limit', { count: MAX_CHARACTERS, remaining: inputText.length - MAX_CHARACTERS })}
                            </div>
                        )}

                        <div className="input-area-wrapper w-full flex justify-center mt-6 relative">
                            {isBotResponding && (
                                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                                    <div className="h-4 w-4 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                </div>
                            )}
                            <div
                                className={`input-area flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-3 w-full max-w-xl ${isBotResponding ? "opacity-50" : ""}`}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={t('placeholder')}
                                    className="flex-1 bg-transparent outline-none text-base px-2 rounded-full dark:text-white dark:placeholder-white"
                                    value={inputText}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    disabled={isBotResponding}
                                />
                                <button
                                    aria-label={t('send_prompt_label')}
                                    className="send-button flex items-center justify-center h-10 w-10 rounded-full bg-black text-white hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black dark:bg-gray-600 dark:hover:bg-gray-500"
                                    onClick={handleSend}
                                    disabled={isBotResponding || !token || inputText.length > MAX_CHARACTERS}
                                >
                                    <img
                                        src="/send.svg"
                                        alt="Send Icon"
                                        width="32"
                                        height="32"
                                        className="filter invert-[1] dark:invert-[1]"
                                    />
                                </button>

                            </div>

                        </div>

                        <div className="mt-2 text-center text-gray-600 dark:text-gray-600 text-xs">
                            GrabbeAI kann Fehler machen. Überprüfe wichtige Informationen. Mit der Nutzung von GrabbeAI
                            stimmen Sie unseren <a href="/tos"
                                                   className="underline hover:text-gray-800">{t('tos_link')}</a> und
                            der <a href="/privacy"
                                   className="underline hover:text-gray-800">{t('privacy_link')}</a> zu.
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default ChatPage;
