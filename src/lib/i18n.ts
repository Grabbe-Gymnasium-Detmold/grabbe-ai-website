import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import deJSON from '../locales/de/translation.json';
import enJSON from '../locales/en/translation.json';
import ukJSON from '../locales/uk/translation.json';
import ruJSON from '../locales/ru/translation.json';
import trJSON from '../locales/tr/translation.json';
import arJSON from '../locales/ar/translation.json';


i18n
    .use(LanguageDetector) // Erkennt die Sprache des Benutzers
    .use(initReactI18next) // Bindet i18n an react-i18next
    .init({
        fallbackLng: 'de', // Fallback-Sprache
        debug: true, // Debug-Logs in der Konsole
        supportedLngs: ['ar', 'de', 'en', 'ru', 'tr', 'uk'], // Unterstützte Sprachen
        resources: {
            de: { translation: deJSON },
            en: { translation: enJSON },
            uk: { translation: ukJSON },
            ru: { translation: ruJSON },
            tr: { translation: trJSON },
            ar: { translation: arJSON },
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'], // Reihenfolge der Spracherkennung
            caches: ['cookie', 'localStorage'], // Speichern der Sprache
        },
        interpolation: {
            escapeValue: false, // Keine Escaping, da React XSS-Schutz bietet
        },
    });

export default i18n;
