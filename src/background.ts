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
 * - Badge updates: Shows "mtg" (red) when in meeting, empty (green) when not, "err" (orange) on errors
 */

import { loadConfig, validateConfig } from "./config";
import { setEntityState } from "./hass";

/**
 * Cache the previous meeting state to avoid unnecessary updates
 */
let wasInMeeting: boolean | null = null;

/**
 * Updates the meeting state in Home Assistant if it has changed
 * Monitors Google Meet tabs and updates the entity state accordingly
 */
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
        // Show green badge when in meeting
        chrome.action.setBadgeText({ text: "🟢" });
        chrome.action.setBadgeBackgroundColor({ color: "white" });
    } else {
        // Clear badge when not in meeting
        chrome.action.setBadgeText({ text: "" });
        chrome.action.setBadgeBackgroundColor({ color: "gray" });
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

// Run once installed and continue listening for tab URL changes
chrome.runtime.onInstalled.addListener(updateMeetingStateIfNeeded);
chrome.tabs.onRemoved.addListener(updateMeetingStateIfNeeded);
chrome.tabs.onUpdated.addListener(function (_, changeInfo) {
    if (changeInfo.status === "complete") {
        updateMeetingStateIfNeeded();
    }
});