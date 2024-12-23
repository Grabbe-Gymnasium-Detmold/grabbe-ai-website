import React, { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import remarkParse from "remark-parse";
import "katex/dist/katex.css";
import "highlight.js/styles/github-dark.min.css";
import Markdown from "react-markdown";
import rehypeSemanticBlockquotes from "rehype-semantic-blockquotes";
import rehypeRaw from "rehype-raw";

const Privacy: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
        } else {
            setIsDarkMode(
                window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            );
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", isDarkMode ? "dark" : "light");

        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    const tos = `# Datenschutzerklärung für GrabbeAI

Die verwendete künstliche Intelligenz ist eine feinabgestimmte Version des Sprachmodells des US-amerikanischen Softwareentwicklers OpenAI LLC. GPT-4o mini, das im OpenAI-Produkt Assistants API integriert ist und im folgenden Dokument stets als GrabbeAI bezeichnet wird. Diese Beschreibung dient zur Klarstellung der genutzten Technologie und ihrer Bezeichnung.

## 1. Verantwortliche

### 1.1 Hauptverantwortlich:
Finn Busse  
Christian-Dietrich-Grabbe-Gymnasium Detmold  
Detmold, Deutschland  
E-Mail: [grabbeai@finnbusse.de](mailto:grabbeai@finnbusse.de)

### 1.2 Nebenverantwortlich:
Maximilian von Beck  
Christian-Dietrich-Grabbe-Gymnasium Detmold  
Detmold, Deutschland  
E-Mail: [kontakt@maximilianvonbeck.de](mailto:kontakt@maximilianvonbeck.de)

### 1.3 Betreiber des Sprachmodells:

**Für Bewohner der EWR-Staaten oder der Schweiz:**  
*OpenAI Ireland Ltd*  
Liffey Trust Centre  
117-126 Sheriff Street Upper  
Dublin 1, D01 YC43, Irland  
Firmennummer: 737350

**Für Bewohner des Vereinigten Königreiches:**  
*OpenAI, L.L.C.*  
1455 3rd Street  
San Francisco, CA 94158, Vereinigte Staaten  
Firmennummer: 7063675

## 2. Erhebung und Speicherung personenbezogener Daten sowie Art und Zweck von deren Verwendung

Beim Zugriff und der Nutzung von GrabbeAI werden folgende personenbezogenen Daten erhoben, gespeichert und verarbeitet:

- **Eingaben (Input):** Texteingaben des Nutzers zur Beantwortung von Anfragen.
- **Ausgaben (Output):** Generierte Antworten zur Speicherung und Weiterentwicklung der Dienste.
- **Zeiten:** Zeitpunkte der Nutzung.
- **IP-Adressen:** Zur Identifikation und Missbrauchsprävention.
- **Browser- und Geräteinformationen:** Informationen über das verwendete Gerät und den Browser („User-Agent“).
- **Sessions:** Sitzungsdaten wie Session-ID, Gültigkeitszeitraum und Status.
- **Standortdaten:** Land, Stadt, Latitude und Longitude, sofern diese übermittelt werden.

Diese Daten werden zu folgenden Zwecken genutzt:

- Sicherstellung eines ordnungsgemäßen Betriebs der Plattform.
- Verbesserung der Qualität der generierten Inhalte durch Trainingsdatensätze.
- Limitierung und Schutz vor missbräuchlicher Nutzung.
- Statistische Auswertungen und technische Optimierungen.

## 3. Rechtsgrundlage der Datenverarbeitung

Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage folgender Rechtsgrundlagen:

- **Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):** Durch die Nutzung von GrabbeAI stimmen Sie der Erhebung und Verarbeitung Ihrer Daten zu.
- **Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):** Die Verarbeitung ist erforderlich, um den Dienst bereitzustellen.
- **Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):** Die Speicherung und Analyse der Daten erfolgt auch im Interesse der Weiterentwicklung und Sicherheit des Dienstes.

## 4. Haftungsausschluss

GrabbeAI wird mit größter Sorgfalt entwickelt, dennoch übernehmen die Betreiber keinerlei Haftung für:

- Die Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Informationen.
- Entscheidungen, die auf Grundlage der generierten Inhalte getroffen werden.
- Schäden, die durch eine unsachgemäße Nutzung der Plattform entstehen.
- Diskriminierende, beleidigende oder anderweitig unangemessene Inhalte, die durch fehlerhafte Modelleingaben oder Modellgenerierungen entstehen können.
- Schäden oder Konsequenzen, die durch sogenannte „Jailbreaks“ oder andere Versuche entstehen, die Sicherheitsmechanismen der Plattform zu umgehen.

## 5. Speicherung und Löschung von Daten

Ihre personenbezogenen Daten werden für die Dauer der Nutzung und darüber hinaus für einen Zeitraum von maximal 12 Monaten gespeichert, soweit keine gesetzliche Aufbewahrungspflicht besteht. Ältere Daten werden anonymisiert oder gelöscht.

## 6. Weitergabe von Daten an Dritte

Ihre personenbezogenen Daten werden grundsätzlich nicht an Dritte weitergegeben, es sei denn:

- Sie haben ausdrücklich eingewilligt.
- Es besteht eine gesetzliche Verpflichtung zur Weitergabe.
- Die Weitergabe ist zur Wahrung berechtigter Interessen erforderlich und Ihre Interessen überwiegen nicht.

## 7. Sicherheit Ihrer Daten

Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten vor unbefugtem Zugriff, Verlust oder Manipulation zu schützen. Unsere Systeme entsprechen den aktuellen Sicherheitsstandards.

## 8. Rechte der betroffenen Personen

Sie haben das Recht:

- Auskunft über Ihre gespeicherten Daten zu verlangen (Art. 15 DSGVO).
- Die Berichtigung unrichtiger Daten oder die Vervollständigung unvollständiger Daten zu verlangen (Art. 16 DSGVO).
- Die Löschung Ihrer Daten zu verlangen, sofern keine rechtliche Grundlage zur weiteren Verarbeitung besteht (Art. 17 DSGVO).
- Die Einschränkung der Verarbeitung Ihrer Daten zu verlangen (Art. 18 DSGVO).
- Ihre Daten in einem übertragbaren Format zu erhalten (Art. 20 DSGVO).
- Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO).
- Eine Beschwerde bei einer Aufsichtsbehörde einzureichen, wenn Sie der Meinung sind, dass die Verarbeitung Ihrer Daten gegen die DSGVO verstößt.

## 9. Hinweise zur Nutzung

Unter dem Eingabefeld wird folgender Hinweis eingeblendet:  
„GrabbeAI kann Fehler machen. Überprüfe wichtige Informationen. Mit der Nutzung von GrabbeAI stimmen Sie unseren Nutzungsbedingungen und der Datenschutzerklärung zu.“

## 10. Kontakt

Bei Fragen oder zur Geltendmachung Ihrer Rechte können Sie sich an die oben angegebene Adresse wenden.

## 11. Änderungen der Datenschutzerklärung

Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um aktuellen rechtlichen Anforderungen zu entsprechen oder Änderungen unseres Dienstes umzusetzen. Die jeweils aktuelle Fassung finden Sie auf unserer Plattform.

**Stand:** 23.12.2024


`



    return (
        <div className={`tos-page min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            <div className="max-w-3xl mx-auto px-6 py-10">
                <button
                    onClick={toggleDarkMode}
                    className={`p-1 w-16 h-8 flex items-center rounded-full float-right transition-all duration-300 ${
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
                                    d="M21.75 12a9.75 9.75 0 11-10.61-9.737 0.75 0.75 0 01.861.818 0.75 0.75 0 01-.033.268 7.5 7.5 0 109.423 9.423 0.75 0.75 0 01.268-.033 0.75 0.75 0 01.818.861A9.742 9.742 0 0121.75 12z"/>
                            </svg>
                        ) : (
                            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                                 className={`w-6 h-6 text-yellow-400`}
                                 width="1280.000000pt" height="1219.000000pt" viewBox="0 0 1280.000000 1219.000000"
                                 preserveAspectRatio="xMidYMid meet">

                                <g transform="translate(0.000000,1219.000000) scale(0.100000,-0.100000)"
                                   fill="#000000" stroke="none">
                                    <path d="M6235 12171 c-44 -26 -61 -49 -94 -121 -74 -165 -108 -411 -156
-1110 -21 -309 -40 -462 -66 -535 -30 -83 -36 -226 -15 -330 24 -122 102 -271
186 -354 178 -178 382 -181 566 -9 57 54 66 68 88 137 13 42 34 132 46 201 21
116 23 166 30 695 6 491 10 580 25 645 23 100 23 273 0 360 -59 224 -226 372
-480 425 -93 19 -94 19 -130 -4z"/>
                                    <path d="M2686 11408 c-137 -18 -269 -116 -329 -245 -29 -63 -31 -77 -32 -173
0 -181 -45 -122 834 -1100 564 -627 776 -856 821 -887 84 -59 149 -76 269 -71
83 3 105 8 164 37 229 110 315 388 184 598 -18 28 -373 432 -790 897 -603 672
-770 853 -815 881 -92 57 -193 78 -306 63z"/>
                                    <path d="M9974 11222 c-238 -156 -506 -450 -918 -1005 -218 -295 -424 -589
-448 -643 -20 -41 -23 -66 -23 -159 0 -103 2 -114 32 -178 42 -89 121 -168
210 -210 122 -57 293 -49 410 20 69 40 114 91 224 254 104 153 217 311 585
814 292 400 417 593 451 701 15 47 14 54 -2 105 -51 155 -201 290 -372 334
-31 8 -62 15 -68 14 -5 0 -42 -22 -81 -47z"/>
                                    <path d="M895 9350 c-80 -21 -272 -116 -285 -140 -20 -38 -42 -186 -38 -255 8
-117 54 -185 168 -248 25 -13 99 -57 165 -97 66 -41 206 -115 310 -166 259
-125 429 -193 1130 -449 110 -40 265 -99 345 -130 172 -67 249 -78 345 -50 86
24 126 47 194 111 117 108 164 258 127 404 -43 168 -171 270 -491 390 -77 29
-207 79 -290 112 -219 87 -589 222 -1025 374 -212 74 -402 141 -423 149 -50
20 -147 18 -232 -5z"/>
                                    <path d="M6130 8858 c-905 -40 -1743 -489 -2284 -1223 -395 -534 -592 -1196
-556 -1865 57 -1044 658 -1963 1604 -2451 328 -168 681 -275 1061 -320 138
-17 527 -17 660 0 485 59 916 211 1301 457 1062 679 1576 1920 1294 3130 -226
968 -960 1774 -1921 2109 -376 130 -743 182 -1159 163z"/>
                                    <path d="M11915 8759 c-224 -12 -444 -54 -1005 -194 -548 -137 -868 -224 -917
-248 -190 -97 -280 -327 -204 -526 44 -115 160 -223 279 -257 109 -32 159 -25
707 100 904 207 1140 273 1372 386 132 65 164 96 263 263 36 61 35 152 -3 227
-25 49 -103 154 -173 233 -27 31 -40 31 -319 16z"/>
                                    <path d="M12255 6499 c-61 -19 -442 -29 -1280 -35 -923 -6 -920 -6 -1024 -58
-153 -78 -247 -263 -221 -436 22 -140 113 -259 247 -323 l68 -32 595 -3 c595
-3 1384 10 1638 29 210 15 283 39 385 129 115 101 167 318 110 463 -47 122
-151 220 -270 257 -70 21 -193 26 -248 9z"/>
                                    <path d="M670 6219 c-277 -13 -516 -50 -601 -95 -52 -26 -56 -44 -63 -254 -8
-231 1 -277 63 -339 33 -33 52 -42 127 -60 286 -66 674 -93 1544 -107 372 -6
433 -4 488 10 115 29 208 107 265 221 38 76 50 136 45 233 -3 75 -9 96 -38
150 -56 105 -158 182 -287 218 -97 27 -1134 42 -1543 23z"/>
                                    <path d="M2630 4589 c-25 -5 -373 -171 -800 -383 -415 -206 -798 -393 -850
-416 -250 -110 -277 -128 -340 -222 -54 -82 -73 -153 -68 -259 3 -73 9 -97 38
-155 44 -90 107 -152 204 -200 72 -35 87 -39 175 -42 77 -3 108 0 156 16 94
32 394 176 1130 542 724 360 744 372 811 476 49 76 67 151 62 255 -3 74 -9 97
-37 153 -90 176 -287 273 -481 235z"/>
                                    <path d="M9960 4343 c-56 -11 -153 -65 -205 -114 -99 -94 -148 -237 -125 -368
27 -155 105 -247 296 -350 65 -36 214 -121 329 -189 116 -68 265 -156 333
-194 376 -213 637 -293 828 -254 91 18 186 61 237 105 83 73 126 234 106 392
-29 231 -190 336 -1284 836 -293 135 -319 143 -414 142 -42 -1 -87 -4 -101 -6z"/>
                                    <path d="M3851 2964 c-102 -27 -142 -59 -453 -362 -622 -606 -1082 -1041
-1191 -1125 -70 -54 -111 -105 -146 -177 -24 -50 -26 -66 -26 -175 l1 -120 54
-84 c48 -74 64 -90 140 -141 78 -51 95 -57 171 -69 189 -27 274 17 579 297
323 297 1284 1228 1335 1294 59 76 79 140 79 254 1 96 0 103 -37 176 -40 82
-116 162 -188 199 -94 47 -217 60 -318 33z"/>
                                    <path d="M8595 2730 c-106 -17 -186 -61 -262 -143 -47 -51 -68 -88 -89 -156
-19 -64 -18 -187 3 -252 26 -81 475 -750 725 -1081 279 -370 414 -492 595
-534 218 -51 449 83 515 299 46 153 0 320 -117 423 -112 98 -167 158 -283 312
-158 208 -309 424 -503 714 -88 131 -176 257 -196 279 -97 107 -249 161 -388
139z"/>
                                    <path d="M6375 2434 c-123 -32 -211 -91 -273 -183 -64 -96 -69 -128 -76 -461
-3 -162 -13 -412 -21 -555 -17 -303 -19 -684 -5 -805 14 -119 29 -174 66 -256
l32 -72 81 -31 c92 -35 178 -57 266 -66 56 -6 72 -2 235 54 96 34 175 61 177
61 5 0 24 80 38 160 23 140 35 339 35 614 0 320 -27 1121 -40 1196 -24 132
-119 252 -246 312 -56 26 -80 31 -158 34 -50 2 -100 1 -111 -2z"/>
                                </g>
                            </svg>

                        )}
                    </div>
                </button>

                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-3xl p-6">
                    <Markdown
                        remarkPlugins={[remarkParse, remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeSemanticBlockquotes, rehypeRaw]}
                        className="prose dark:prose-invert max-w-none"

                    >
                        {tos}
                    </Markdown>
                </div>
            </div>
        </div>
    );
};

export {Privacy};
