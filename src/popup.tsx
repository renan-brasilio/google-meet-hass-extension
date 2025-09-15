/**
 * Popup component for the Google Meet ↔ Home Assistant extension
 *
 * GOAL:
 * This React component provides the main user interface that appears when users click
 * the extension icon. It displays real-time information about the current meeting status
 * and configuration state, giving users immediate feedback about the extension's operation.
 *
 * The popup shows:
 * - Current meeting status (in meeting or not)
 * - Configuration status (properly configured or not)
 * - Selected integration method (API or Webhook)
 * - Last update timestamp
 * - Quick access to settings
 *
 * FEATURES:
 * - Real-time meeting status monitoring (updates every 2 seconds)
 * - Visual status indicators with icons and colors
 * - Configuration validation display
 * - One-click access to options page
 * - Responsive design optimized for extension popup dimensions
 *
 * COMPONENTS:
 * - Popup: Main component that orchestrates the popup interface
 * - Theme configuration for consistent Material-UI styling
 *
 * METHODS:
 * - checkMeetingStatus(): Queries Chrome tabs to detect Google Meet sessions
 * - openOptionsPage(): Opens the extension options page
 * - getConfigurationStatus(): Returns current configuration status with visual indicators
 * - getMeetingStatus(): Returns current meeting status with visual indicators
 *
 * STATE MANAGEMENT:
 * - config: Current extension configuration
 * - isInMeeting: Boolean indicating if user is currently in a Google Meet
 * - lastUpdate: Timestamp of last status check
 *
 * UI ELEMENTS:
 * - Header with extension logo and settings button
 * - Configuration status chip (success/error with method type)
 * - Meeting status chip (in meeting/not in meeting)
 * - Last update timestamp
 */

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Config, defaultConfig, loadConfig, validateConfig } from "./config";

// Simple translation function with language detection
const getLanguage = (): string => {
    // Check if user has set a language preference
    const savedLang = localStorage.getItem('extension-language');
    if (savedLang) return savedLang;

    // Auto-detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt-br')) return 'pt-br';
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('ar')) return 'ar';
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('ru')) return 'ru';
    return 'en'; // Default to English
};

const t = (key: string): string => {
    const language = getLanguage();

    const translations: Record<string, Record<string, string>> = {
        en: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'Configuration Status',
            'popup.meetingStatus': 'Meeting Status',
            'popup.notConfigured': 'Not configured',
            'popup.properlyConfigured': 'Properly configured',
            'popup.inGoogleMeet': 'In Google Meet',
            'popup.notInMeeting': 'Not in meeting',
            'popup.lastUpdated': 'Last updated',
            'popup.openConfiguration': 'Open configuration',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        'pt-br': {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'Status da Configuração',
            'popup.meetingStatus': 'Status da Reunião',
            'popup.notConfigured': 'Não configurado',
            'popup.properlyConfigured': 'Configurado corretamente',
            'popup.inGoogleMeet': 'No Google Meet',
            'popup.notInMeeting': 'Não em reunião',
            'popup.lastUpdated': 'Última atualização',
            'popup.openConfiguration': 'Abrir configuração',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        pt: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'Estado da Configuração',
            'popup.meetingStatus': 'Estado da Reunião',
            'popup.notConfigured': 'Não configurado',
            'popup.properlyConfigured': 'Configurado corretamente',
            'popup.inGoogleMeet': 'No Google Meet',
            'popup.notInMeeting': 'Não em reunião',
            'popup.lastUpdated': 'Última atualização',
            'popup.openConfiguration': 'Abrir configuração',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        es: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'Estado de Configuración',
            'popup.meetingStatus': 'Estado de Reunión',
            'popup.notConfigured': 'No configurado',
            'popup.properlyConfigured': 'Configurado correctamente',
            'popup.inGoogleMeet': 'En Google Meet',
            'popup.notInMeeting': 'No en reunión',
            'popup.lastUpdated': 'Última actualización',
            'popup.openConfiguration': 'Abrir configuración',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        fr: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'Statut de Configuration',
            'popup.meetingStatus': 'Statut de Réunion',
            'popup.notConfigured': 'Non configuré',
            'popup.properlyConfigured': 'Configuré correctement',
            'popup.inGoogleMeet': 'Dans Google Meet',
            'popup.notInMeeting': 'Pas en réunion',
            'popup.lastUpdated': 'Dernière mise à jour',
            'popup.openConfiguration': 'Ouvrir la configuration',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        de: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'Konfigurationsstatus',
            'popup.meetingStatus': 'Meeting-Status',
            'popup.notConfigured': 'Nicht konfiguriert',
            'popup.properlyConfigured': 'Korrekt konfiguriert',
            'popup.inGoogleMeet': 'In Google Meet',
            'popup.notInMeeting': 'Nicht im Meeting',
            'popup.lastUpdated': 'Zuletzt aktualisiert',
            'popup.openConfiguration': 'Konfiguration öffnen',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        zh: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': '配置状态',
            'popup.meetingStatus': '会议状态',
            'popup.notConfigured': '未配置',
            'popup.properlyConfigured': '配置正确',
            'popup.inGoogleMeet': '在 Google Meet 中',
            'popup.notInMeeting': '未在会议中',
            'popup.lastUpdated': '最后更新',
            'popup.openConfiguration': '打开配置',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        ja: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': '設定状態',
            'popup.meetingStatus': '会議状態',
            'popup.notConfigured': '未設定',
            'popup.properlyConfigured': '正しく設定済み',
            'popup.inGoogleMeet': 'Google Meet 中',
            'popup.notInMeeting': '会議中ではない',
            'popup.lastUpdated': '最終更新',
            'popup.openConfiguration': '設定を開く',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        ko: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': '구성 상태',
            'popup.meetingStatus': '회의 상태',
            'popup.notConfigured': '구성되지 않음',
            'popup.properlyConfigured': '올바르게 구성됨',
            'popup.inGoogleMeet': 'Google Meet 중',
            'popup.notInMeeting': '회의 중이 아님',
            'popup.lastUpdated': '마지막 업데이트',
            'popup.openConfiguration': '구성 열기',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        ar: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'حالة التكوين',
            'popup.meetingStatus': 'حالة الاجتماع',
            'popup.notConfigured': 'غير مُكوَّن',
            'popup.properlyConfigured': 'مُكوَّن بشكل صحيح',
            'popup.inGoogleMeet': 'في Google Meet',
            'popup.notInMeeting': 'ليس في اجتماع',
            'popup.lastUpdated': 'آخر تحديث',
            'popup.openConfiguration': 'فتح التكوين',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        hi: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'कॉन्फ़िगरेशन स्थिति',
            'popup.meetingStatus': 'मीटिंग स्थिति',
            'popup.notConfigured': 'कॉन्फ़िगर नहीं',
            'popup.properlyConfigured': 'सही तरीके से कॉन्फ़िगर',
            'popup.inGoogleMeet': 'Google Meet में',
            'popup.notInMeeting': 'मीटिंग में नहीं',
            'popup.lastUpdated': 'अंतिम अपडेट',
            'popup.openConfiguration': 'कॉन्फ़िगरेशन खोलें',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        },
        ru: {
            'popup.title': 'Google Meet ↔ HA',
            'popup.configurationStatus': 'Статус конфигурации',
            'popup.meetingStatus': 'Статус встречи',
            'popup.notConfigured': 'Не настроено',
            'popup.properlyConfigured': 'Правильно настроено',
            'popup.inGoogleMeet': 'В Google Meet',
            'popup.notInMeeting': 'Не на встрече',
            'popup.lastUpdated': 'Последнее обновление',
            'popup.openConfiguration': 'Открыть конфигурацию',
            'options.api': 'API',
            'options.webhook': 'Webhook'
        }
    };

    return translations[language]?.[key] || translations['en'][key] || key;
};

/**
 * Lightweight popup styles
 */
const popupStyles = `
    .popup-container {
        width: 320px;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #fff;
        box-sizing: border-box;
    }
    .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }
    .popup-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
    }
    .popup-logo {
        width: 24px;
        height: 24px;
    }
    .settings-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        color: #666;
        font-size: 18px;
    }
    .settings-button:hover {
        background: #f5f5f5;
    }
    .status-section {
        margin-bottom: 20px;
    }
    .status-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 500;
    }
    .status-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 16px;
        font-size: 14px;
        width: 100%;
        box-sizing: border-box;
    }
    .status-chip.configured {
        background: #e8f5e8;
        color: #2e7d32;
        border: 1px solid #c8e6c9;
    }
    .status-chip.error {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #ffcdd2;
    }
    .status-chip.meeting {
        background: #e3f2fd;
        color: #1976d2;
        border: 1px solid #bbdefb;
    }
    .status-chip.idle {
        background: #f5f5f5;
        color: #666;
        border: 1px solid #e0e0e0;
    }
    .status-icon {
        font-size: 16px;
    }
    .last-updated {
        text-align: right;
        margin-top: 8px;
        font-size: 11px;
        color: #999;
    }
`;

/**
 * Main popup component that displays extension status
 */
const Popup = () => {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const [isInMeeting, setIsInMeeting] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    /**
     * Check meeting status and update timestamp
     */
    const checkMeetingStatus = () => {
        chrome.tabs.query({
            url: "https://meet.google.com/*-*-*",
        }).then((tabs) => {
            setIsInMeeting(tabs.length > 0);
            setLastUpdate(new Date().toLocaleTimeString());
        });
    };

    /**
     * Populate the previous configuration on load and start monitoring
     */
    useEffect(() => {
        // Initialize translations first
        initializeTranslations();

        loadConfig().then((loadedConfig) => {
            setConfig(loadedConfig);
        }).catch((error) => {
            console.error("Error loading config:", error);
            // Set default config if loading fails
            setConfig(defaultConfig);
        });

        checkMeetingStatus();

        // Check meeting status every 2 seconds
        const interval = setInterval(checkMeetingStatus, 2000);

        return () => clearInterval(interval);
    }, []);

    /**
     * Opens the options page for configuration
     */
    const openOptionsPage = () => {
        chrome.runtime.openOptionsPage();
    };

    /**
     * Gets the current configuration status
     * @returns Object containing status information
     */
    const getConfigurationStatus = () => {
        const validation = validateConfig(config);

        if (!validation.isValid) {
            return {
                status: 'error',
                message: t('popup.notConfigured'),
                icon: '❌',
                className: 'error'
            };
        }

        const methodText = config.method === 'api' ? t('options.api') : t('options.webhook');
        return {
            status: 'configured',
            message: `${t('popup.properlyConfigured')} (${methodText})`,
            icon: '✅',
            className: 'configured'
        };
    };

    /**
     * Gets the current meeting status
     * @returns Object containing meeting status information
     */
    const getMeetingStatus = () => {
        if (isInMeeting) {
            return {
                status: 'meeting',
                message: t('popup.inGoogleMeet'),
                icon: '📹',
                className: 'meeting'
            };
        } else {
            return {
                status: 'idle',
                message: t('popup.notInMeeting'),
                icon: '📹',
                className: 'idle'
            };
        }
    };

    const configStatus = getConfigurationStatus();
    const meetingStatus = getMeetingStatus();

    return (
        <>
            <style>{popupStyles}</style>
            <div className="popup-container">
                {/* Header */}
                <div className="popup-header">
                    <div className="popup-title">
                        <img src="icon48.png" alt="Logo" className="popup-logo" />
{t('popup.title')}
                    </div>
                    <button
                        className="settings-button"
                        onClick={openOptionsPage}
                        title={t('popup.openConfiguration')}
                    >
                        ⚙️
                    </button>
                </div>

                {/* Configuration Status */}
                <div className="status-section">
                    <div className="status-label">{t('popup.configurationStatus')}</div>
                    <div className={`status-chip ${configStatus.className}`}>
                        <span className="status-icon">{configStatus.icon}</span>
                        {configStatus.message}
                    </div>
                </div>

                {/* Meeting Status */}
                <div className="status-section">
                    <div className="status-label">{t('popup.meetingStatus')}</div>
                    <div className={`status-chip ${meetingStatus.className}`}>
                        <span className="status-icon">{meetingStatus.icon}</span>
                        {meetingStatus.message}
                    </div>
                </div>

                {/* Last Update */}
                {lastUpdate && (
                    <div className="last-updated">
                        {t('popup.lastUpdated')}: {lastUpdate}
                    </div>
                )}
            </div>
        </>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
    document.getElementById("root")
);