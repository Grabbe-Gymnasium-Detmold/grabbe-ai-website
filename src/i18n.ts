import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18next
    .use(HttpBackend) // Lädt Übersetzungsdateien
    .use(LanguageDetector) // Erkennt die Sprache des Nutzers
    .init({
        fallbackLng: 'en', // Standardsprache
        debug: true, // Debugging aktivieren
        interpolation: {
            escapeValue: false, // Kein Escaping für HTML
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json', // Pfad zu den Übersetzungsdateien
        },
    });

export default i18next;
