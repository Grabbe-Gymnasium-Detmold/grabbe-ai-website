import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpBackend) // lädt Übersetzungsdateien
    .use(LanguageDetector) // erkennt die Sprache des Nutzers
    .use(initReactI18next) // Integration mit React
    .init({
        fallbackLng: 'de', // Standard-Sprache
        debug: true, // Debug-Modus
        interpolation: {
            escapeValue: false, // verhindert XSS
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json', // Pfad zu den Übersetzungsdateien
        },
    });

export default i18n;
