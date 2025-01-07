import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18next
    .use(HttpBackend) // Übersetzungen von Dateien laden
    .use(LanguageDetector) // Sprache des Nutzers erkennen
    .init({
        fallbackLng: 'en', // Standardsprache
        debug: true, // Debug-Modus aktivieren
        interpolation: {
            escapeValue: false, // Kein Escaping für HTML
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json', // Pfad zu Übersetzungsdateien
        },
    });

export default i18next;
