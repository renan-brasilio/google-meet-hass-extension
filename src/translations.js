/**
 * Translation system for the Google Meet ↔ Home Assistant extension
 *
 * This file contains all translations for the extension interface.
 * The system automatically detects the user's browser language and falls back to English if not supported.
 */

const translations = {
    // English (default)
    en: {
        extension: {
            name: "Google Meet ↔ Home Assistant",
            description: "Updates a Home Assistant entity state with the status of your Google Meet calls"
        },
        options: {
            title: "Google Meet ↔ Home Assistant Options",
            updateMethod: "Update Method",
            api: "API",
            webhook: "Webhook",
            hostUrl: "Home Assistant Base URL",
            hostUrlHelp: "No trailing slashes, example: http://homeassistant.local",
            authToken: "Authorization Token",
            entityId: "Entity ID",
            webhookUrl: "Webhook URL",
            webhookUrlHelp: "Full webhook URL including entity ID, example: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Check <a href=\"https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger\" target=\"_blank\" rel=\"noopener noreferrer\">this guide</a> for more information.",
            test: "Test",
            save: "Save",
            configurationSaved: "Configuration saved!",
            required: "Required",
            language: "Language"
        },
        popup: {
            title: "Google Meet ↔ HA",
            configurationStatus: "Configuration Status",
            meetingStatus: "Meeting Status",
            properlyConfigured: "Properly configured",
            notConfigured: "Not configured",
            inGoogleMeet: "In Google Meet",
            notInMeeting: "Not in meeting",
            lastUpdated: "Last updated",
            openConfiguration: "Open configuration"
        },
        test: {
            testing: "Testing...",
            apiValid: "API configuration is valid",
            webhookValid: "Webhook configuration is valid",
            invalidToken: "Invalid auth token",
            entityNotFound: "Entity not found, or incorrect base URL",
            unexpectedError: "Unexpected error",
            webhookFailed: "Webhook test failed"
        },
        errors: {
            hostRequired: "Home Assistant host URL is required",
            hostFormat: "Home Assistant host URL must start with http:// or https://",
            entityRequired: "Entity ID is required",
            tokenRequired: "API token is required for API method",
            webhookRequired: "Webhook URL is required for webhook method",
            configureFirst: "Please configure the extension first"
        }
    },

    // Portuguese (Brazil)
    pt: {
        extension: {
            name: "Google Meet ↔ Home Assistant",
            description: "Atualiza o estado de uma entidade do Home Assistant com o status das suas chamadas do Google Meet"
        },
        options: {
            title: "Opções do Google Meet ↔ Home Assistant",
            updateMethod: "Método de Atualização",
            api: "API",
            webhook: "Webhook",
            hostUrl: "URL Base do Home Assistant",
            hostUrlHelp: "Sem barras no final, exemplo: http://homeassistant.local",
            authToken: "Token de Autorização",
            entityId: "ID da Entidade",
            webhookUrl: "URL do Webhook",
            webhookUrlHelp: "URL completa do webhook incluindo ID da entidade, exemplo: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Consulte <a href=\"https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger\" target=\"_blank\" rel=\"noopener noreferrer\">este guia</a> para mais informações.",
            test: "Testar",
            save: "Salvar",
            configurationSaved: "Configuração salva!",
            required: "Obrigatório",
            language: "Idioma"
        },
        popup: {
            title: "Google Meet ↔ HA",
            configurationStatus: "Status da Configuração",
            meetingStatus: "Status da Reunião",
            properlyConfigured: "Configurado corretamente",
            notConfigured: "Não configurado",
            inGoogleMeet: "No Google Meet",
            notInMeeting: "Não em reunião",
            lastUpdated: "Última atualização",
            openConfiguration: "Abrir configuração"
        },
        test: {
            testing: "Testando...",
            apiValid: "Configuração da API é válida",
            webhookValid: "Configuração do webhook é válida",
            invalidToken: "Token de autenticação inválido",
            entityNotFound: "Entidade não encontrada ou URL base incorreta",
            unexpectedError: "Erro inesperado",
            webhookFailed: "Teste do webhook falhou"
        },
        errors: {
            hostRequired: "URL do host do Home Assistant é obrigatória",
            hostFormat: "URL do host do Home Assistant deve começar com http:// ou https://",
            entityRequired: "ID da entidade é obrigatório",
            tokenRequired: "Token da API é obrigatório para o método API",
            webhookRequired: "URL do webhook é obrigatória para o método webhook",
            configureFirst: "Por favor, configure a extensão primeiro"
        }
    },

    // French
    fr: {
        extension: {
            name: "Google Meet ↔ Home Assistant",
            description: "Met à jour l'état d'une entité Home Assistant avec le statut de vos appels Google Meet"
        },
        options: {
            title: "Options Google Meet ↔ Home Assistant",
            updateMethod: "Méthode de mise à jour",
            api: "API",
            webhook: "Webhook",
            hostUrl: "URL de base Home Assistant",
            hostUrlHelp: "Pas de barres obliques à la fin, exemple: http://homeassistant.local",
            authToken: "Token d'autorisation",
            entityId: "ID de l'entité",
            webhookUrl: "URL du webhook",
            webhookUrlHelp: "URL complète du webhook incluant l'ID de l'entité, exemple: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Consultez <a href=\"https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger\" target=\"_blank\" rel=\"noopener noreferrer\">ce guide</a> pour plus d'informations.",
            test: "Tester",
            save: "Enregistrer",
            configurationSaved: "Configuration enregistrée !",
            required: "Requis",
            language: "Langue"
        },
        popup: {
            title: "Google Meet ↔ HA",
            configurationStatus: "Statut de la configuration",
            meetingStatus: "Statut de la réunion",
            properlyConfigured: "Correctement configuré",
            notConfigured: "Non configuré",
            inGoogleMeet: "Dans Google Meet",
            notInMeeting: "Pas en réunion",
            lastUpdated: "Dernière mise à jour",
            openConfiguration: "Ouvrir la configuration"
        },
        test: {
            testing: "Test en cours...",
            apiValid: "La configuration API est valide",
            webhookValid: "La configuration webhook est valide",
            invalidToken: "Token d'authentification invalide",
            entityNotFound: "Entité non trouvée ou URL de base incorrecte",
            unexpectedError: "Erreur inattendue",
            webhookFailed: "Le test webhook a échoué"
        },
        errors: {
            hostRequired: "L'URL de l'hôte Home Assistant est requise",
            hostFormat: "L'URL de l'hôte Home Assistant doit commencer par http:// ou https://",
            entityRequired: "L'ID de l'entité est requis",
            tokenRequired: "Le token API est requis pour la méthode API",
            webhookRequired: "L'URL du webhook est requise pour la méthode webhook",
            configureFirst: "Veuillez d'abord configurer l'extension"
        }
    },

    // Spanish
    es: {
        extension: {
            name: "Google Meet ↔ Home Assistant",
            description: "Actualiza el estado de una entidad de Home Assistant con el estado de tus llamadas de Google Meet"
        },
        options: {
            title: "Opciones de Google Meet ↔ Home Assistant",
            updateMethod: "Método de actualización",
            api: "API",
            webhook: "Webhook",
            hostUrl: "URL base de Home Assistant",
            hostUrlHelp: "Sin barras al final, ejemplo: http://homeassistant.local",
            authToken: "Token de autorización",
            entityId: "ID de entidad",
            webhookUrl: "URL del webhook",
            webhookUrlHelp: "URL completa del webhook incluyendo ID de entidad, ejemplo: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Consulta <a href=\"https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger\" target=\"_blank\" rel=\"noopener noreferrer\">esta guía</a> para más información.",
            test: "Probar",
            save: "Guardar",
            configurationSaved: "¡Configuración guardada!",
            required: "Requerido",
            language: "Idioma"
        },
        popup: {
            title: "Google Meet ↔ HA",
            configurationStatus: "Estado de configuración",
            meetingStatus: "Estado de reunión",
            properlyConfigured: "Configurado correctamente",
            notConfigured: "No configurado",
            inGoogleMeet: "En Google Meet",
            notInMeeting: "No en reunión",
            lastUpdated: "Última actualización",
            openConfiguration: "Abrir configuración"
        },
        test: {
            testing: "Probando...",
            apiValid: "La configuración de la API es válida",
            webhookValid: "La configuración del webhook es válida",
            invalidToken: "Token de autenticación inválido",
            entityNotFound: "Entidad no encontrada o URL base incorrecta",
            unexpectedError: "Error inesperado",
            webhookFailed: "La prueba del webhook falló"
        },
        errors: {
            hostRequired: "La URL del host de Home Assistant es requerida",
            hostFormat: "La URL del host de Home Assistant debe comenzar con http:// o https://",
            entityRequired: "El ID de entidad es requerido",
            tokenRequired: "El token de API es requerido para el método API",
            webhookRequired: "La URL del webhook es requerida para el método webhook",
            configureFirst: "Por favor, configura la extensión primero"
        }
    },

    // German
    de: {
        extension: {
            name: "Google Meet ↔ Home Assistant",
            description: "Aktualisiert den Status einer Home Assistant-Entität mit dem Status Ihrer Google Meet-Anrufe"
        },
        options: {
            title: "Google Meet ↔ Home Assistant Optionen",
            updateMethod: "Update-Methode",
            api: "API",
            webhook: "Webhook",
            hostUrl: "Home Assistant Basis-URL",
            hostUrlHelp: "Keine Schrägstriche am Ende, Beispiel: http://homeassistant.local",
            authToken: "Autorisierungs-Token",
            entityId: "Entitäts-ID",
            webhookUrl: "Webhook-URL",
            webhookUrlHelp: "Vollständige Webhook-URL einschließlich Entitäts-ID, Beispiel: https://ha.example.com/api/webhook/entity_webhook.<br/><br/> Siehe <a href=\"https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger\" target=\"_blank\" rel=\"noopener noreferrer\">diese Anleitung</a> für weitere Informationen.",
            test: "Testen",
            save: "Speichern",
            configurationSaved: "Konfiguration gespeichert!",
            required: "Erforderlich",
            language: "Sprache"
        },
        popup: {
            title: "Google Meet ↔ HA",
            configurationStatus: "Konfigurationsstatus",
            meetingStatus: "Meeting-Status",
            properlyConfigured: "Korrekt konfiguriert",
            notConfigured: "Nicht konfiguriert",
            inGoogleMeet: "In Google Meet",
            notInMeeting: "Nicht im Meeting",
            lastUpdated: "Zuletzt aktualisiert",
            openConfiguration: "Konfiguration öffnen"
        },
        test: {
            testing: "Testen...",
            apiValid: "API-Konfiguration ist gültig",
            webhookValid: "Webhook-Konfiguration ist gültig",
            invalidToken: "Ungültiger Authentifizierungs-Token",
            entityNotFound: "Entität nicht gefunden oder falsche Basis-URL",
            unexpectedError: "Unerwarteter Fehler",
            webhookFailed: "Webhook-Test fehlgeschlagen"
        },
        errors: {
            hostRequired: "Home Assistant Host-URL ist erforderlich",
            hostFormat: "Home Assistant Host-URL muss mit http:// oder https:// beginnen",
            entityRequired: "Entitäts-ID ist erforderlich",
            tokenRequired: "API-Token ist für die API-Methode erforderlich",
            webhookRequired: "Webhook-URL ist für die Webhook-Methode erforderlich",
            configureFirst: "Bitte konfigurieren Sie zuerst die Erweiterung"
        }
    }
};

/**
 * Get the user's browser language
 * @returns {string} The detected language code
 */
function getBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (!browserLang) return 'en';

    // Check for exact match first
    if (translations[browserLang]) {
        return browserLang;
    }

    // Check for language without region (e.g., 'pt' from 'pt-BR')
    const langWithoutRegion = browserLang.split('-')[0];
    if (translations[langWithoutRegion]) {
        return langWithoutRegion;
    }

    // Fallback to English
    return 'en';
}

/**
 * Get translation for a key
 * @param {string} key - The translation key (e.g., 'options.title')
 * @param {string} language - The language code (optional, defaults to browser language)
 * @returns {string} The translated string
 */
function t(key, language = null) {
    const lang = language || getBrowserLanguage();
    const translation = translations[lang] || translations['en'];

    const keys = key.split('.');
    let value = translation;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback to English if key not found
            const englishTranslation = translations['en'];
            value = englishTranslation;
            for (const fallbackKey of keys) {
                if (value && typeof value === 'object' && fallbackKey in value) {
                    value = value[fallbackKey];
                } else {
                    return key; // Return the key if not found in English either
                }
            }
            break;
        }
    }

    return typeof value === 'string' ? value : key;
}

/**
 * Get all available languages
 * @returns {Array} Array of language codes
 */
function getAvailableLanguages() {
    return Object.keys(translations);
}

/**
 * Get language name for display
 * @param {string} langCode - The language code
 * @returns {string} The display name for the language
 */
function getLanguageName(langCode) {
    const names = {
        'en': 'English',
        'pt': 'Português',
        'fr': 'Français',
        'es': 'Español',
        'de': 'Deutsch'
    };
    return names[langCode] || langCode;
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, getBrowserLanguage, getAvailableLanguages, getLanguageName };
} else {
    // Make functions available globally
    window.translations = { t, getBrowserLanguage, getAvailableLanguages, getLanguageName };
}
