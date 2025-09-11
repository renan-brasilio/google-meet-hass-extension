export type UpdateMethod = "api" | "webhook";

export interface Config {
    host: string;
    token: string;
    entity_id: string;
    method: UpdateMethod;
    webhook_url: string;
}

export const defaultConfig: Config = {
    host: "",
    token: "",
    entity_id: "input_boolean.in_meeting",
    method: "api",
    webhook_url: "",
};

export async function loadConfig(): Promise<Config> {
    return (await chrome.storage.sync.get(defaultConfig)) as Config;
}

export async function saveConfig(config: Config) {
    await chrome.storage.sync.set(config);
}

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

export function isConfigured(config: Config): boolean {
    return validateConfig(config).isValid;
}
