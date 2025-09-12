/**
 * Home Assistant integration utilities for the Google Meet extension
 *
 * GOAL:
 * This module provides all the communication logic between the extension and Home Assistant.
 * It handles both API-based and webhook-based integrations, with robust error handling,
 * retry mechanisms, and fallback strategies to ensure reliable entity state updates.
 *
 * The module supports two integration methods:
 * - API: Direct REST API calls using Home Assistant's service endpoints
 * - Webhook: HTTP webhook calls for simpler integration
 *
 * FEATURES:
 * - Network connectivity checking before making requests
 * - Exponential backoff retry mechanism for failed requests
 * - Fallback from service calls to direct state setting for API method
 * - Connection testing for both API and webhook methods
 * - Comprehensive error handling and logging
 *
 * METHODS:
 * - setEntityState(): Main function to update HA entity state (supports both API and webhook)
 * - testConnection(): Tests the connection to Home Assistant
 * - checkNetworkConnectivity(): Checks if network is available
 * - retryWithBackoff(): Implements exponential backoff retry logic
 * - setEntityStateAPI(): Updates entity via Home Assistant REST API
 * - setEntityStateWebhook(): Updates entity via webhook
 * - testConnectionAPI(): Tests API connection
 * - testConnectionWebhook(): Tests webhook connection
 *
 * INTERFACES:
 * - TestResult: Result object for connection tests
 *
 * ERROR HANDLING:
 * - Network connectivity failures
 * - HTTP errors (401, 404, etc.)
 * - Service call failures with fallback to direct state setting
 * - Retry logic with exponential backoff
 */

import { Config } from "./config";
import { t } from "./translations";

/**
 * Check if the network is available by attempting to reach a reliable endpoint
 * @returns Promise that resolves to true if network is available, false otherwise
 */
async function checkNetworkConnectivity(): Promise<boolean> {
    try {
        // Try to reach a reliable endpoint with a short timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch("https://www.google.com/favicon.ico", {
            method: "HEAD",
            signal: controller.signal,
            cache: "no-cache"
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.error("Network connectivity check failed:", error);
        return false;
    }
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelay - Base delay in milliseconds (default: 1000)
 * @returns Promise that resolves to the function result
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxRetries) {
                throw lastError;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

/**
 * Updates entity state using Home Assistant API
 * @param config - Configuration object containing API details
 * @param newValue - New boolean value for the entity
 */
async function setEntityStateAPI(config: Config, newValue: boolean) {
    try {
        // First try using service calls for boolean entities
        const service = newValue ? "input_boolean.turn_on" : "input_boolean.turn_off";
        const serviceUrl = `${config.host}/api/services/${service}`;

        const response = await fetch(serviceUrl, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + config.token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                entity_id: config.entity_id,
            }),
        });

        if (!response.ok) {
            // Fallback to direct state setting if service call fails
            const stateUrl = `${config.host}/api/states/${config.entity_id}`;

            const fallbackResponse = await fetch(stateUrl, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + config.token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    state: newValue ? "on" : "off",
                }),
            });

            if (!fallbackResponse.ok) {
                console.error(`Both service call and direct state setting failed: HTTP ${fallbackResponse.status} ${fallbackResponse.statusText}`);
                throw new Error(`HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
            }
        }
    } catch (error) {
        console.error("Error updating entity state via API:", error);
        throw error;
    }
}

/**
 * Updates entity state using Home Assistant webhook
 * @param config - Configuration object containing webhook URL
 * @param newValue - New boolean value for the entity
 */
async function setEntityStateWebhook(config: Config, newValue: boolean) {
    try {
        const response = await fetch(config.webhook_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                value: newValue ? "on" : "off",
            }),
        });

        if (!response.ok) {
            console.error(`Failed to update entity state via webhook: HTTP ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error updating entity state via webhook:", error);
        throw error;
    }
}

/**
 * Updates Home Assistant entity state based on configuration method
 * @param config - Configuration object
 * @param newValue - New boolean value for the entity
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function setEntityState(config: Config, newValue: boolean) {
    try {
        // Check network connectivity first
        const isNetworkAvailable = await checkNetworkConnectivity();
        if (!isNetworkAvailable) {
            console.error("No network connectivity available");
            return false;
        }

        // Use retry logic for the actual API call
        const result = await retryWithBackoff(async () => {
            if (config.method === "webhook") {
                return await setEntityStateWebhook(config, newValue);
            } else {
                return await setEntityStateAPI(config, newValue);
            }
        });

        return result;
    } catch (error) {
        console.error("Failed to update Home Assistant entity state after retries:", error);
        // Don't throw the error to prevent the extension from crashing
        // The user can check the console for error details
        return false;
    }
}

/**
 * Interface for test connection results
 */
export interface TestResult {
    /** Whether the test was successful */
    success: boolean;
    /** Test result message */
    message: string;
}

/**
 * Tests API connection to Home Assistant
 * @param config - Configuration object containing API details
 * @returns Promise that resolves to test result
 */
async function testConnectionAPI(config: Config): Promise<TestResult> {
    try {
        const { status } = await fetch(
            config.host + "/api/states/" + config.entity_id,
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + config.token,
                    "Content-Type": "application/json",
                },
            }
        );

        switch (status) {
            case 200:
                return {
                    success: true,
                    message: t('test.apiValid'),
                };
            case 401:
                return {
                    success: false,
                    message: t('test.invalidToken'),
                };
            case 404:
                return {
                    success: false,
                    message: t('test.entityNotFound'),
                };
            default:
                return {
                    success: false,
                    message: t('test.unexpectedError') + ": HTTP " + status,
                };
        }
    } catch (error) {
        return {
            success: false,
            message: t('test.unexpectedError') + ": " + error,
        };
    }
}

/**
 * Tests webhook connection to Home Assistant
 * @param config - Configuration object containing webhook URL
 * @returns Promise that resolves to test result
 */
async function testConnectionWebhook(config: Config): Promise<TestResult> {
    try {
        const response = await fetch(config.webhook_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                value: "on",
            }),
        });

        if (response.status === 200) {
            return {
                success: true,
                message: t('test.webhookValid'),
            };
        } else {
            return {
                success: false,
                message: t('test.webhookFailed') + ": HTTP " + response.status,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: t('test.webhookFailed') + ": " + error,
        };
    }
}

/**
 * Tests the connection to Home Assistant based on configuration method
 * @param config - Configuration object
 * @returns Promise that resolves to test result
 */
export async function testConnection(config: Config): Promise<TestResult> {
    if (config.method === "webhook") {
        return await testConnectionWebhook(config);
    } else {
        return await testConnectionAPI(config);
    }
}