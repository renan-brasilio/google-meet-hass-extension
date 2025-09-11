import { Config } from "./config";

/**
 * Check if the network is available by attempting to reach a reliable endpoint
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
        console.warn("Network connectivity check failed:", error);
        return false;
    }
}

/**
 * Retry a function with exponential backoff
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
            console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

async function setEntityStateAPI(config: Config, newValue: boolean) {
    try {
        const response = await fetch(config.host + "/api/states/" + config.entity_id, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + config.token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                state: newValue ? "on" : "off",
            }),
        });

        if (!response.ok) {
            console.error(`Failed to update entity state: HTTP ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log(`Successfully updated entity ${config.entity_id} to ${newValue ? "on" : "off"}`);
    } catch (error) {
        console.error("Error updating entity state via API:", error);
        throw error;
    }
}

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

        console.log(`Successfully updated entity via webhook to ${newValue ? "on" : "off"}`);
    } catch (error) {
        console.error("Error updating entity state via webhook:", error);
        throw error;
    }
}

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

export interface TestResult {
    success: boolean;
    message: string;
}

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
                    message: "API configuration is valid",
                };
            case 401:
                return {
                    success: false,
                    message: "Invalid auth token",
                };
            case 404:
                return {
                    success: false,
                    message: "Entity not found, or incorrect base URL",
                };
            default:
                return {
                    success: false,
                    message: "Unexpected error: HTTP " + status,
                };
        }
    } catch (error) {
        return {
            success: false,
            message: "Unexpected error: " + error,
        };
    }
}

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
                message: "Webhook configuration is valid",
            };
        } else {
            return {
                success: false,
                message: "Webhook test failed: HTTP " + response.status,
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Webhook test failed: " + error,
        };
    }
}

export async function testConnection(config: Config): Promise<TestResult> {
    if (config.method === "webhook") {
        return await testConnectionWebhook(config);
    } else {
        return await testConnectionAPI(config);
    }
}
