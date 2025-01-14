import React, {useState, useRef, useEffect, useCallback} from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.css";
import "highlight.js/styles/github-dark.min.css";
import Markdown from "react-markdown";
import {BlueLink} from "@/components/BlueLink.tsx";
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes";
// Entferne die alten Icons, da wir sie nicht mehr benötigen
// import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import {useToast} from "@/components/Toast.tsx";
import {useTranslation} from "react-i18next";
import twemoji from 'twemoji';
import {MdArrowDropDown, MdCheck} from "react-icons/md"; // Korrigierter Import

const API_URL = "https://api.grabbe.site/chat";
const AUTH_URL = "https://api.grabbe.site/auth";
const THREAD_URL = "https://api.grabbe.site/thread/create";
const EXAMPLE_QUESTION_URL = "https://api.grabbe.site/examples";
const CHECK_TOKEN_URL = "https://api.grabbe.site/auth/check";
const EVALUATION_URL = "https://api.grabbe.site/evaluation";

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<{
        id: number;
        text: string;
        user: "You" | "Bot",
        evaluation: string
    }[]>([]);
    const [isBotResponding, setIsBotResponding] = useState<boolean>(false);
    const [showExampleCards, setShowExampleCards] = useState<boolean>(true);
    const [inputText, setInputText] = useState<string>("");
    const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("session_token"));
    const [threadId, setThreadId] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(localStorage.getItem("theme") === "dark");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [disclaimer, setDisclaimer] = useState("");

    const {addToast} = useToast();
    const emojiContainerRef = useRef(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const MAX_CHARACTERS = 150;
    const {t, i18n} = useTranslation();
    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setIsDropdownOpen(false);
    };
    const updateDisclaimer = () => {
        const updatedDisclaimer = t("disclaimer")
            .replace(
                "{tos}",
                '<a href="/tos" class="underline hover:text-gray-800">' + t("tos_link") + "</a>"
            )
            .replace(
                "{privacy}",
                '<a href="/privacy" class="underline hover:text-gray-800">' + t("privacy_link") + "</a>"
            );
        setDisclaimer(updatedDisclaimer);
    };

    useEffect(() => {
        updateDisclaimer();
    }, [i18n.language]); // i18n.language ändert sich bei Sprachwechsel

    const languages = [
        {code: "ar", name: "Arabic", flag: "🇸🇦"},
        {code: "de", name: "Deutsch", flag: "🇩🇪"},
        {code: "en", name: "English", flag: "🇬🇧"},
        {code: "ru", name: "Русский", flag: "🇷🇺"},
        {code: "tr", name: "Türkçe", flag: "🇹🇷"},
        {code: "uk", name: "Українська", flag: "🇺🇦"},
    ];

    const authenticate = useCallback(async () => {
        try {
            const authResponse = await fetch(AUTH_URL, {method: "GET", headers: {"Content-Type": "application/json"}});
            if (!authResponse.ok) throw new Error("Authentication failed.");

            const {token: authToken} = await authResponse.json();
            localStorage.setItem("session_token", authToken);
            setToken(authToken);
        } catch (error) {
            console.error(error);
            setErrorMessage("Es gab ein Problem bei der Anmeldung. Bitte versuche es später noch einmal.");
        }
    }, []);

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
    }, [authenticate]);

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

            const currentLanguage = i18n.language; // Aktuelle Sprache ermitteln

            try {
                const cacheKey = `example_questions`;
                const reloadCounterKey = `reload_counter`;

                // Lade den aktuellen Zählerstand aus dem localStorage (Standardwert 0)
                const reloadCounter = parseInt(localStorage.getItem(reloadCounterKey) || "0", 10);

                // Überprüfen, ob der Cache invalidiert werden soll
                if (reloadCounter >= 4) {
                    localStorage.removeItem(cacheKey); // Cache invalidieren
                    localStorage.setItem(reloadCounterKey, "1"); // Zählerstand zurücksetzen
                }

                const cachedQuestions = localStorage.getItem(cacheKey);

                if (cachedQuestions) {
                    const parsedQuestions = JSON.parse(cachedQuestions);
                    setExampleQuestions(shuffleAndSlice(parsedQuestions[currentLanguage], 4));
                } else {
                    const qResponse = await fetch(`${EXAMPLE_QUESTION_URL}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!qResponse.ok) throw new Error("Fetching example questions failed.");

                    const {questions} = await qResponse.json();
                    localStorage.setItem(cacheKey, JSON.stringify(questions));
                    setExampleQuestions(shuffleAndSlice(questions[currentLanguage], 4));
                }

                // Zählerstand erhöhen und speichern
                localStorage.setItem(reloadCounterKey, (reloadCounter + 1).toString());
            } catch (error) {
                console.error(error);
                setErrorMessage(
                    i18n.t("error_message", "Es konnte keine Verbindung zu den Beispiel-Fragen hergestellt werden. Bitte versuche es später erneut.")
                );
            }
        };

        fetchExampleQuestions();
    }, [token, i18n.language]);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        setIsDarkMode(savedTheme === "dark" || (savedTheme === null && window.matchMedia("(prefers-color-scheme: dark)").matches));
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const shuffleAndSlice = (array: string[], count: number): string[] => {
        const shuffled = array.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const handleSend = async (): Promise<void> => {
        if (!inputText.trim() || isBotResponding || inputText.length > MAX_CHARACTERS) return;

        setIsBotResponding(true);
        setShowExampleCards(false);
        const userMessage = {id: Date.now(), text: inputText.trim(), user: "You" as const, evaluation: "null"};
        setMessages(prev => [...prev, userMessage]);
        setInputText("");

        let currentThreadId = threadId;
        if (!currentThreadId) {
            currentThreadId = await createThread();
            if (!currentThreadId) {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: "Error creating thread. Please try again later.",
                    user: "Bot" as const,
                    evaluation: "null"
                }]);
                setIsBotResponding(false);
                return;
            }
            setThreadId(currentThreadId);
        }

        const botMessageId = Date.now() + 1;
        setMessages(prev => [...prev, {id: botMessageId, text: "", user: "Bot" as const, evaluation: "null"}]);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({question: userMessage.text, threadId: currentThreadId}),
            });
            if (!response.ok) throw new Error("Failed to fetch bot response.");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("ReadableStream reader is undefined.");

            const decoder = new TextDecoder();
            let done = false;
            let botMessageText = "";

            while (!done) {
                const {value, done: readerDone} = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, {stream: true});
                if (chunk.startsWith('{"done":true,')) {
                    const {messageId} = JSON.parse(chunk);
                    setMessages(prev => prev.map(msg => msg.id === botMessageId ? {...msg, id: messageId} : msg));
                } else {
                    botMessageText += chunk;
                    setMessages(prev => prev.map(msg => msg.id === botMessageId ? {
                        ...msg,
                        text: botMessageText
                    } : msg));
                }

            }

        } catch (error: unknown) {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: error instanceof Error ? `Error: ${error.message}` : "Unknown error occurred.",
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
                console.error("Failed to create thread.");
                setErrorMessage("Die Erstellung eines neuen Chats ist fehlgeschlagen. Bitte versuche es später erneut.");
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
        setMessages(prev => prev.map(msg => msg.id === messageId ? {...msg, evaluation} : msg));
        try {
            const response = await fetch(EVALUATION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({threadId, messageId, evaluation}),
            });

            if (!response.ok) {
                throw new Error("Failed to send evaluation.");
            }
            addToast("Danke für deine Bewertung der Nachricht!", "success", 5);
        } catch (error) {
            console.error(error);
            addToast("Leider gab es einen Fehler beim Senden der Bewertung. Trotzdem danke!", "error", 5);
        }
    };

    useEffect(() => {
        // Emojis mit Twemoji parsen, sobald der Komponenten-Render abgeschlossen ist
        if (emojiContainerRef.current) {
            twemoji.parse(emojiContainerRef.current);
        }
    }, [emojiContainerRef]);

    // Referenz für das Dropdown, um Klicks außerhalb zu erkennen
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="bg-white text-gray-800 flex justify-center items-center min-h-screen dark:bg-gray-800 relative">

            {/* Beginn des neuen Language Dropdowns */}
            <div className="absolute top-4 right-4 z-50" ref={dropdownRef}>
                <div className="relative">
                    <button
                        className="bg-white text-gray-500 dark:bg-gray-700 dark:text-white rounded-xl shadow-lg py-2 pr-3 pl-5 focus:outline-none flex items-center"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen}
                        aria-controls="language-dropdown"
                    >
                        <span className="inline-block mr-2 text-xl">
                            {languages.find(lang => lang.code === i18n.language)?.flag || "🌐"}
                        </span>
                        <MdArrowDropDown className="text-xl"/> {/* Korrigiertes Icon */}
                    </button>
                    {isDropdownOpen && (
                        <div
                            id="language-dropdown"
                            role="menu"
                            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white shadow-md rounded-xl text-sm absolute right-0 mt-2 w-48 z-30"
                        >
                            <span
                                className="absolute top-0 right-0 w-3 h-3 bg-white dark:bg-gray-700 transform rotate-45 -mt-1 mr-3"></span>
                            <div className="overflow-auto rounded-xl w-full relative z-10">
                                <ul className="list-none p-0 m-0">
                                    {languages.map((lang) => (
                                        <li key={lang.code}>
                                            <button
                                                className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-100 ${
                                                    lang.code === i18n.language ? 'font-semibold' : ''
                                                }`}
                                                onClick={() => changeLanguage(lang.code)}
                                                role="menuitem"
                                            >
                                                <span className="inline-block mr-2 text-xl">
                                                    {lang.flag}
                                                </span>
                                                <span className="inline-block">{lang.name}</span>
                                                {lang.code === i18n.language && (
                                                    <span className="ml-auto">
                                                        <MdCheck className="text-lg"/> {/* Korrigiertes Icon */}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Ende des neuen Language Dropdowns */}

            <div
                className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white w-full max-w-xl p-10 flex flex-col items-center">
                <div className="p-4 dark:bg-gray-800 dark:text-white bg-white text-black w-full">
                    {errorMessage && (
                        <div
                            className="mb-4 p-3 border-l-4 border-red-500 bg-red-100 text-red-800 rounded dark:bg-red-900 dark:text-red-300">
                            {errorMessage}
                        </div>
                    )}
                </div>

                <div className="title text-2xl font-semibold mb-4">{t('title')}</div>
                <div className="subtitle text-base text-gray-600 mb-10">
                    {t('subtitle')}
                </div>

                {showExampleCards && (
                    <div className="suggestions flex flex-wrap justify-center gap-5 mb-16 w-full">
                        {exampleQuestions.map((question, idx) => (
                            <span
                                key={idx}
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
                            className={`flex flex-col ${
                                msg.user === "You"
                                    ? "items-end"
                                    : "items-start"
                            }`}
                        >
                            <div
                                className={`p-3 rounded-2xl text-sm shadow-sm transition-all transform ${
                                    msg.user === "You"
                                        ? "dark:bg-gray-500 dark:text-white bg-blue-200"
                                        : "dark:bg-gray-700 dark:text-white bg-gray-100"
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
                            </div>
                            {/* Bewertung-Buttons nur bei Bot-Nachrichten und nur, wenn die Antwort abgeschlossen ist */}
                            {msg.user === "Bot" && !isBotResponding && msg.text.trim().length > 0 && (
                                <div className="flex space-x-2 mt-1">
                                    {msg.evaluation === "null" && (
                                        <>
                                            {/* Daumen Hoch Button */}
                                            <button
                                                className="rounded-full text-gray-800 hover:bg-gray-200 p-1" // Geändert
                                                aria-label="Good response"
                                                data-testid="good-response-turn-action-button"
                                                onClick={() => handleEvaluation(msg.id, "positive")}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                     xmlns="http://www.w3.org/2000/svg" className="icon-sm-heavy">
                                                    <path fillRule="evenodd" clipRule="evenodd"
                                                          d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z"
                                                          fill="currentColor"></path>
                                                </svg>
                                            </button>
                                            {/* Daumen Runter Button */}
                                            <button
                                                className="rounded-full text-gray-800 hover:bg-gray-200 p-1" // Geändert
                                                aria-label="Bad response"
                                                data-testid="bad-response-turn-action-button"
                                                onClick={() => handleEvaluation(msg.id, "negative")}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                     xmlns="http://www.w3.org/2000/svg" className="icon-sm-heavy">
                                                    <path fillRule="evenodd" clipRule="evenodd"
                                                          d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z"
                                                          fill="currentColor"></path>
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                    {msg.evaluation === "positive" && (
                                        <button
                                            className="rounded-full text-gray-800 cursor-default p-1" // Geändert
                                            aria-label="Good response"
                                            data-testid="good-response-turn-action-button"
                                            disabled
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg" className="icon-sm-heavy">
                                                <path fillRule="evenodd" clipRule="evenodd"
                                                      d="M12.1318 2.50389C12.3321 2.15338 12.7235 1.95768 13.124 2.00775L13.5778 2.06447C16.0449 2.37286 17.636 4.83353 16.9048 7.20993L16.354 8.99999H17.0722C19.7097 8.99999 21.6253 11.5079 20.9313 14.0525L19.5677 19.0525C19.0931 20.7927 17.5124 22 15.7086 22H6C4.34315 22 3 20.6568 3 19V12C3 10.3431 4.34315 8.99999 6 8.99999H8C8.25952 8.99999 8.49914 8.86094 8.6279 8.63561L12.1318 2.50389ZM10 20H15.7086C16.6105 20 17.4008 19.3964 17.6381 18.5262L19.0018 13.5262C19.3488 12.2539 18.391 11 17.0722 11H15C14.6827 11 14.3841 10.8494 14.1956 10.5941C14.0071 10.3388 13.9509 10.0092 14.0442 9.70591L14.9932 6.62175C15.3384 5.49984 14.6484 4.34036 13.5319 4.08468L10.3644 9.62789C10.0522 10.1742 9.56691 10.5859 9 10.8098V19C9 19.5523 9.44772 20 10 20ZM7 11V19C7 19.3506 7.06015 19.6872 7.17071 20H6C5.44772 20 5 19.5523 5 19V12C5 11.4477 5.44772 11 6 11H7Z"
                                                      fill="currentColor"></path>
                                            </svg>
                                        </button>
                                    )}
                                    {msg.evaluation === "negative" && (
                                        <button
                                            className="rounded-full text-gray-800 cursor-default p-1" // Geändert
                                            aria-label="Bad response"
                                            data-testid="bad-response-turn-action-button"
                                            disabled
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                 xmlns="http://www.w3.org/2000/svg" className="icon-sm-heavy">
                                                <path fillRule="evenodd" clipRule="evenodd"
                                                      d="M11.8727 21.4961C11.6725 21.8466 11.2811 22.0423 10.8805 21.9922L10.4267 21.9355C7.95958 21.6271 6.36855 19.1665 7.09975 16.7901L7.65054 15H6.93226C4.29476 15 2.37923 12.4921 3.0732 9.94753L4.43684 4.94753C4.91145 3.20728 6.49209 2 8.29589 2H18.0045C19.6614 2 21.0045 3.34315 21.0045 5V12C21.0045 13.6569 19.6614 15 18.0045 15H16.0045C15.745 15 15.5054 15.1391 15.3766 15.3644L11.8727 21.4961ZM14.0045 4H8.29589C7.39399 4 6.60367 4.60364 6.36637 5.47376L5.00273 10.4738C4.65574 11.746 5.61351 13 6.93226 13H9.00451C9.32185 13 9.62036 13.1506 9.8089 13.4059C9.99743 13.6612 10.0536 13.9908 9.96028 14.2941L9.01131 17.3782C8.6661 18.5002 9.35608 19.6596 10.4726 19.9153L13.6401 14.3721C13.9523 13.8258 14.4376 13.4141 15.0045 13.1902V5C15.0045 4.44772 14.5568 4 14.0045 4ZM17.0045 13V5C17.0045 4.64937 16.9444 4.31278 16.8338 4H18.0045C18.5568 4 19.0045 4.44772 19.0045 5V12C19.0045 12.5523 18.5568 13 18.0045 13H17.0045Z"
                                                      fill="currentColor"></path>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {inputText.length > MAX_CHARACTERS && (
                    <div className="text-red-500 text-sm mb-2">
                        {t('input_character_limit')}
                    </div>
                )}

                <div className="input-area-wrapper w-full flex justify-center mt-6 relative">
                    {isBotResponding && (
                        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                            <div className="flex space-x-2">
                                <div className="h-2 w-2 rounded-full animate-bounce bg-gray-800 dark:bg-gray-300"></div>
                                <div className="h-2 w-2 rounded-full animate-bounce bg-gray-800 dark:bg-gray-300 delay-200"></div>
                                <div className="h-2 w-2 rounded-full animate-bounce bg-gray-800 dark:bg-gray-300 delay-400"></div>
                            </div>
                        </div>
                    )}

                    <div
                        className={`input-area flex flex-nowrap items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-3 w-full ${isBotResponding ? "opacity-50" : ""}`}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={t("input_placeholder")}
                            className="flex-1 min-w-0 bg-transparent outline-none text-base px-2 rounded-full dark:text-white dark:placeholder-white"
                            value={inputText}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            disabled={isBotResponding}
                        />
                        <button
                            aria-label="Send prompt"
                            className="send-button flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-black text-white hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black dark:bg-gray-600 dark:hover:bg-gray-500"
                            onClick={handleSend}
                            disabled={isBotResponding || !token || inputText.length > MAX_CHARACTERS}
                        >
                            <img
                                src="/send.svg"
                                alt="Send Icon"
                                width="32"
                                height="32"
                                className="filter invert-[1] dark:invert-[1] rotate-90"
                            />
                        </button>
                    </div>
                </div>

                <div className="mt-2 text-center text-gray-600 dark:text-gray-600 text-xs">
                    <span dangerouslySetInnerHTML={{__html: disclaimer}}/>
                </div>


            </div>
        </div>
    );

};

export default ChatPage;
