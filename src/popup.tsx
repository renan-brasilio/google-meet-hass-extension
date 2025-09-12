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
import { t, setLanguage, initializeTranslations } from "./translations";

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
            // Set the language from config
            setLanguage(loadedConfig.language);
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