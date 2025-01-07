// lib/i18n.ts
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Initialisiere i18next
i18next
    .use(HttpBackend) // Übersetzungen von Dateien laden
    .use(LanguageDetector) // Sprache des Nutzers erkennen
    .init({
        fallbackLng: 'en', // Standardsprache
        debug: false, // Debug-Modus deaktivieren in Produktion
        interpolation: {
            escapeValue: false, // Kein Escaping für HTML
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json', // Pfad zu Übersetzungsdateien
        },
        react: {
            useSuspense: false, // Da wir react-i18next nicht verwenden
        },
    });

export default i18next;
