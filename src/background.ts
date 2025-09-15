/**
 * Background script for the Google Meet ↔ Home Assistant extension
 *
 * GOAL:
 * This is the service worker that runs in the background and monitors Google Meet tabs.
 * It automatically detects when the user joins or leaves Google Meet calls and updates
 * the corresponding Home Assistant entity state in real-time.
 *
 * The script listens for:
 * - Tab creation/removal events
 * - Tab URL changes
 * - Extension installation
 *
 * When a meeting state change is detected, it:
 * - Updates the extension badge to show current status
 * - Sends API calls or webhooks to Home Assistant
 * - Handles errors gracefully with visual feedback
 *
 * METHODS:
 * - updateMeetingStateIfNeeded(): Main function that checks meeting status and updates HA
 *
 * EVENT LISTENERS:
 * - chrome.runtime.onInstalled: Runs on extension installation
 * - chrome.tabs.onRemoved: Runs when tabs are closed
 * - chrome.tabs.onUpdated: Runs when tab URLs change
 *
 * STATE MANAGEMENT:
 * - wasInMeeting: Caches previous meeting state to avoid duplicate updates
 * - Badge updates: Shows "ON" (red) when in meeting, empty (green) when not, "!" (orange) on errors
 */

// Cache the previous meeting state to avoid unnecessary updates
let wasInMeeting: boolean | null = null;

// Default configuration
const defaultConfig = {
    host: "",
    token: "",
    entity_id: "input_boolean.in_meeting",
    method: "api",
    webhook_url: "",
    language: "en"
};

// Load configuration from Chrome storage
async function loadConfig() {
    try {
        const result = await chrome.storage.sync.get(defaultConfig);
        return result;
    } catch (error) {
        console.error("Error loading config:", error);
        return defaultConfig;
    }
}

// Validate configuration
function validateConfig(config: any) {
    const errors: string[] = [];

    if (!config.host && !config.token && !config.webhook_url) {
        return { isValid: false, errors: ["Please configure the extension first"] };
    }

    if (config.method === "api") {
        if (!config.host || config.host.trim() === "") {
            errors.push("Home Assistant URL is required");
        } else if (!config.host.startsWith("http://") && !config.host.startsWith("https://")) {
            errors.push("Home Assistant URL must start with http:// or https://");
        }

        if (!config.entity_id || config.entity_id.trim() === "") {
            errors.push("Entity ID is required");
        }

        if (!config.token || config.token.trim() === "" || config.token === "xxxxxxx") {
            errors.push("Authorization token is required");
        }
    } else if (config.method === "webhook") {
        if (!config.webhook_url || config.webhook_url.trim() === "") {
            errors.push("Webhook URL is required");
        }
    }

    return { isValid: errors.length === 0, errors };
}

// Check network connectivity
async function checkNetworkConnectivity(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("https://www.google.com/favicon.ico", {
            method: "HEAD",
            signal: controller.signal,
            cache: "no-cache"
        });

        clearTimeout(timeout);
        return response.ok;
    } catch (error) {
        console.error("Network connectivity check failed:", error);
        return false;
    }
}

// Update entity state via API
async function setEntityStateAPI(config: any, newValue: boolean) {
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

// Update entity state via webhook
async function setEntityStateWebhook(config: any, newValue: boolean) {
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

// Retry with exponential backoff
async function retryWithBackoff(fn: () => Promise<any>, maxRetries: number = 3, baseDelay: number = 1000) {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i === maxRetries) {
                throw lastError;
            }

            const delay = baseDelay * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

// Set entity state in Home Assistant
async function setEntityState(config: any, newValue: boolean): Promise<boolean> {
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
        return false;
    }
}

// Updates the meeting state in Home Assistant if it has changed
async function updateMeetingStateIfNeeded() {
    const tabs = await chrome.tabs.query({
        url: "https://meet.google.com/*-*-*",
    });
    const isInMeeting = tabs.length > 0;

    // Don't send an entity update if the state hasn't changed
    if (wasInMeeting === isInMeeting) {
        return;
    }

    wasInMeeting = isInMeeting;

    // Set the action indicator immediately
    if (isInMeeting) {
        // Show "ON" badge when in meeting
        chrome.action.setBadgeText({ text: "ON" });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" }); // Red for visibility
    } else {
        // Clear badge when not in meeting
        chrome.action.setBadgeText({ text: "" });
        chrome.action.setBadgeBackgroundColor({ color: "#00FF00" }); // Green for visibility
    }

    // Send the entity update to Home Assistant
    try {
        const config = await loadConfig();

        // Validate configuration before attempting to update
        const validation = validateConfig(config);
        if (!validation.isValid) {
            // Don't change badge for unconfigured state - let it show meeting status
            return;
        }

        const success = await setEntityState(config, isInMeeting);

        if (success === false) {
            // Update badge to show error state
            chrome.action.setBadgeText({ text: "!" });
            chrome.action.setBadgeBackgroundColor({ color: "orange" });
            console.error("Failed to update Home Assistant entity. Check your configuration and network connection.");
        }
    } catch (error) {
        console.error("Error in updateMeetingStateIfNeeded:", error);
        // Update badge to show error state
        chrome.action.setBadgeText({ text: "!" });
        chrome.action.setBadgeBackgroundColor({ color: "orange" });
    }
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
    updateMeetingStateIfNeeded();
});

chrome.tabs.onRemoved.addListener(() => {
    updateMeetingStateIfNeeded();
});

chrome.tabs.onUpdated.addListener(function (_, changeInfo) {
    if (changeInfo.status === "complete") {
        updateMeetingStateIfNeeded();
    }
});

// Keep-alive mechanism to prevent service worker from being terminated
let keepAliveInterval: NodeJS.Timeout | null = null;

function startKeepAlive() {
    if (keepAliveInterval) return;

    keepAliveInterval = setInterval(() => {
        // Keep-alive ping to prevent service worker termination
    }, 20000); // Every 20 seconds
}

// Start keep-alive and initial check
startKeepAlive();
updateMeetingStateIfNeeded();