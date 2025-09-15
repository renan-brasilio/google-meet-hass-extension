/**
 * Configuration types and utilities for the Google Meet ↔ Home Assistant extension
 *
 * GOAL:
 * This module provides the core configuration management system for the extension.
 * It handles storing, loading, validating, and managing all configuration settings
 * that control how the extension communicates with Home Assistant.
 *
 * The configuration supports two integration methods:
 * - API: Direct REST API calls to Home Assistant
 * - Webhook: HTTP webhook calls to Home Assistant
 *
 * The configuration also supports internationalization with language selection.
 *
 * METHODS:
 * - loadConfig(): Loads configuration from Chrome storage
 * - saveConfig(): Saves configuration to Chrome storage
 * - validateConfig(): Validates configuration completeness and format
 *
 * TYPES:
 * - UpdateMethod: Union type for "api" | "webhook"
 * - Config: Main configuration interface
 * - defaultConfig: Default configuration values
 */

// import { SupportedLanguage, getBrowserLanguage, t } from "./translations";

/**
 * Available update methods for Home Assistant integration
 */
export type UpdateMethod = "api" | "webhook";

/**
 * Configuration interface for the extension
 */
export interface Config {
    /** Home Assistant base URL (for API method) */
    host: string;
    /** Authorization token (for API method) */
    token: string;
    /** Entity ID to update in Home Assistant */
    entity_id: string;
    /** Method to use for updating Home Assistant */
    method: UpdateMethod;
    /** Webhook URL (for webhook method) */
    webhook_url: string;
    /** Selected language for the extension UI */
    language: string;
}

/**
 * Default configuration values
 */
export const defaultConfig: Config = {
    host: "",
    token: "",
    entity_id: "input_boolean.in_meeting",
    method: "api",
    webhook_url: "",
    language: "en",
};

/**
 * Loads the configuration from Chrome storage
 * @returns Promise that resolves to the loaded configuration
 */
export async function loadConfig(): Promise<Config> {
    return (await chrome.storage.sync.get(defaultConfig)) as Config;
}

/**
 * Saves the configuration to Chrome storage
 * @param config - Configuration object to save
 */
export async function saveConfig(config: Config) {
    await chrome.storage.sync.set(config);
}

/**
 * Validates the configuration object
 * @param config - Configuration object to validate
 * @returns Object containing validation result and error messages
 */
export function validateConfig(config: Config): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if this is a completely empty configuration (first time setup)
    const isEmptyConfig = !config.host && !config.token && !config.webhook_url;
    if (isEmptyConfig) {
        return {
            isValid: false,
            errors: ["Please configure the extension first"]
        };
    }

    if (config.method === "api") {
        if (!config.host || config.host.trim() === "") {
            errors.push("Home Assistant host URL is required");
        } else if (!config.host.startsWith("http://") && !config.host.startsWith("https://")) {
            errors.push("Home Assistant host URL must start with http:// or https://");
        }

        if (!config.entity_id || config.entity_id.trim() === "") {
            errors.push("Entity ID is required");
        }

        if (!config.token || config.token.trim() === "" || config.token === "xxxxxxx") {
            errors.push("API token is required for API method");
        }
    } else if (config.method === "webhook") {
        if (!config.webhook_url || config.webhook_url.trim() === "") {
            errors.push("Webhook URL is required for webhook method");
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
