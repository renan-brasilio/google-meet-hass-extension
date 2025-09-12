/**
 * Translation system for the Google Meet ↔ Home Assistant extension
 *
 * GOAL:
 * This module provides internationalization (i18n) support for the extension,
 * allowing users to use the extension in their preferred language. It supports
 * 15 of the most spoken languages worldwide and automatically detects the
 * user's browser language preference.
 *
 * FEATURES:
 * - Support for 15 major world languages
 * - Automatic browser language detection
 * - Fallback to English if language not supported
 * - Easy addition of new languages via JSON files
 * - Type-safe translation keys
 *
 * SUPPORTED LANGUAGES:
 * - English (en) - Default
 * - Portuguese Brazil (pt-BR)
 * - Portuguese Portugal (pt)
 * - French (fr)
 * - Chinese Simplified (zh-CN)
 * - Spanish (es)
 * - Hindi (hi)
 * - Arabic (ar)
 * - Bengali (bn)
 * - Russian (ru)
 * - Japanese (ja)
 * - Punjabi (pa)
 * - Indonesian (id)
 * - Urdu (ur)
 * - German (de)
 *
 * METHODS:
 * - getSupportedLanguages(): Returns list of supported language codes
 * - getBrowserLanguage(): Detects user's browser language preference
 * - loadTranslations(): Loads translation files for all supported languages
 * - t(): Main translation function that returns localized strings
 * - setLanguage(): Changes the current language
 * - getCurrentLanguage(): Returns the currently active language
 */

// Lazy load translation data to reduce initial bundle size
const translationModules: Record<SupportedLanguage, () => TranslationData> = {
    'en': () => require('./en.json'),
    'pt-BR': () => require('./pt-BR.json'),
    'pt': () => require('./pt.json'),
    'fr': () => require('./fr.json'),
    'zh-CN': () => require('./zh-CN.json'),
    'es': () => require('./es.json'),
    'hi': () => require('./hi.json'),
    'ar': () => require('./ar.json'),
    'bn': () => require('./bn.json'),
    'ru': () => require('./ru.json'),
    'ja': () => require('./ja.json'),
    'pa': () => require('./pa.json'),
    'id': () => require('./id.json'),
    'ur': () => require('./ur.json'),
    'de': () => require('./de.json'),
};

// Cache for loaded translations
const translationCache: Record<SupportedLanguage, TranslationData> = {} as Record<SupportedLanguage, TranslationData>;

/**
 * Type definition for translation keys
 */
export type TranslationKey =
    | 'extension.name'
    | 'extension.description'
    | 'options.title'
    | 'options.updateMethod'
    | 'options.api'
    | 'options.webhook'
    | 'options.hostUrl'
    | 'options.hostUrlHelp'
    | 'options.authToken'
    | 'options.entityId'
    | 'options.webhookUrl'
    | 'options.webhookUrlHelp'
    | 'options.test'
    | 'options.save'
    | 'options.configurationSaved'
    | 'options.required'
    | 'options.language'
    | 'popup.title'
    | 'popup.configurationStatus'
    | 'popup.meetingStatus'
    | 'popup.properlyConfigured'
    | 'popup.notConfigured'
    | 'popup.inGoogleMeet'
    | 'popup.notInMeeting'
    | 'popup.lastUpdated'
    | 'popup.openConfiguration'
    | 'test.testing'
    | 'test.apiValid'
    | 'test.webhookValid'
    | 'test.invalidToken'
    | 'test.entityNotFound'
    | 'test.unexpectedError'
    | 'test.webhookFailed'
    | 'errors.hostRequired'
    | 'errors.hostFormat'
    | 'errors.entityRequired'
    | 'errors.tokenRequired'
    | 'errors.webhookRequired'
    | 'errors.configureFirst';

/**
 * Type definition for translation data structure
 */
export interface TranslationData {
    extension: {
        name: string;
        description: string;
    };
    options: {
        title: string;
        updateMethod: string;
        api: string;
        webhook: string;
        hostUrl: string;
        hostUrlHelp: string;
        authToken: string;
        entityId: string;
        webhookUrl: string;
        webhookUrlHelp: string;
        test: string;
        save: string;
        configurationSaved: string;
        required: string;
        language: string;
    };
    popup: {
        title: string;
        configurationStatus: string;
        meetingStatus: string;
        properlyConfigured: string;
        notConfigured: string;
        inGoogleMeet: string;
        notInMeeting: string;
        lastUpdated: string;
        openConfiguration: string;
    };
    test: {
        testing: string;
        apiValid: string;
        webhookValid: string;
        invalidToken: string;
        entityNotFound: string;
        unexpectedError: string;
        webhookFailed: string;
    };
    errors: {
        hostRequired: string;
        hostFormat: string;
        entityRequired: string;
        tokenRequired: string;
        webhookRequired: string;
        configureFirst: string;
    };
}

/**
 * Supported language codes
 */
export const SUPPORTED_LANGUAGES = [
    'en', 'pt-BR', 'pt', 'fr', 'zh-CN', 'es', 'hi', 'ar', 'bn', 'ru', 'ja', 'pa', 'id', 'ur', 'de'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Language display names for the UI
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
    'en': 'English',
    'pt-BR': 'Português (Brasil)',
    'pt': 'Português (Portugal)',
    'fr': 'Français',
    'zh-CN': '中文 (简体)',
    'es': 'Español',
    'hi': 'हिन्दी',
    'ar': 'العربية',
    'bn': 'বাংলা',
    'ru': 'Русский',
    'ja': '日本語',
    'pa': 'ਪੰਜਾਬੀ',
    'id': 'Bahasa Indonesia',
    'ur': 'اردو',
    'de': 'Deutsch'
};

/**
 * Get translation data for a specific language (with lazy loading and caching)
 */
function getTranslations(language: SupportedLanguage): TranslationData {
    if (!translationCache[language]) {
        translationCache[language] = translationModules[language]();
    }
    return translationCache[language];
}

/**
 * Current language setting
 */
let currentLanguage: SupportedLanguage = 'en';

/**
 * Gets the list of supported language codes
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): readonly SupportedLanguage[] {
    return SUPPORTED_LANGUAGES;
}

/**
 * Gets the display name for a language code
 * @param languageCode The language code
 * @returns The display name for the language
 */
export function getLanguageName(languageCode: SupportedLanguage): string {
    return LANGUAGE_NAMES[languageCode];
}

/**
 * Detects the user's browser language preference
 * @returns The detected language code or 'en' as fallback
 */
export function getBrowserLanguage(): SupportedLanguage {
    const browserLang = navigator.language || (navigator as any).userLanguage;

    // Check for exact match first
    if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
        return browserLang as SupportedLanguage;
    }

    // Check for language without region (e.g., 'pt' from 'pt-BR')
    const langWithoutRegion = browserLang.split('-')[0];
    const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.startsWith(langWithoutRegion));

    if (supportedLang) {
        return supportedLang;
    }

    // Fallback to English
    return 'en';
}

/**
 * Sets the current language
 * @param language The language code to set
 */
export function setLanguage(language: SupportedLanguage): void {
    if (SUPPORTED_LANGUAGES.includes(language)) {
        currentLanguage = language;
    }
}

/**
 * Gets the currently active language
 * @returns The current language code
 */
export function getCurrentLanguage(): SupportedLanguage {
    return currentLanguage;
}

/**
 * Main translation function
 * @param key The translation key (e.g., 'options.title')
 * @returns The translated string
 */
export function t(key: TranslationKey): string {
    const keys = key.split('.');
    let value: any = getTranslations(currentLanguage);

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback to English if key not found
            value = getTranslations('en');
            for (const fallbackKey of keys) {
                if (value && typeof value === 'object' && fallbackKey in value) {
                    value = value[fallbackKey];
                } else {
                    return key; // Return the key itself if not found anywhere
                }
            }
            break;
        }
    }

    return typeof value === 'string' ? value : key;
}

/**
 * Initializes the translation system with browser language detection
 */
export function initializeTranslations(): void {
    const browserLang = getBrowserLanguage();
    setLanguage(browserLang);
}
