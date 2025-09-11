import { loadConfig, validateConfig } from "./config";
import { setEntityState } from "./hass";

// Cache the previous state
let wasInMeeting: boolean | null = null;

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
    chrome.action.setBadgeText({ text: isInMeeting ? "mtg" : "" });
    chrome.action.setBadgeBackgroundColor({
        color: isInMeeting ? "red" : "green",
    });

    // Send the entity update to Home Assistant
    try {
        const config = await loadConfig();

        // Validate configuration before attempting to update
        const validation = validateConfig(config);
        if (!validation.isValid) {
            // Only show configuration errors in console, don't spam the user
            console.log("Extension not configured yet:", validation.errors[0]);
            // Don't change badge for unconfigured state - let it show meeting status
            return;
        }

        const success = await setEntityState(config, isInMeeting);

        if (success === false) {
            // Update badge to show error state
            chrome.action.setBadgeText({ text: "err" });
            chrome.action.setBadgeBackgroundColor({ color: "orange" });
            console.warn("Failed to update Home Assistant entity. Check your configuration and network connection.");
        }
    } catch (error) {
        console.error("Error in updateMeetingStateIfNeeded:", error);
        // Update badge to show error state
        chrome.action.setBadgeText({ text: "err" });
        chrome.action.setBadgeBackgroundColor({ color: "orange" });
    }
}

// Run once installed and continue listening for tab URL changes
chrome.runtime.onInstalled.addListener(updateMeetingStateIfNeeded);
chrome.tabs.onRemoved.addListener(updateMeetingStateIfNeeded);
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        updateMeetingStateIfNeeded();
    }
});
