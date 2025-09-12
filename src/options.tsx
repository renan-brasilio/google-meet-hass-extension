/**
 * Options page component for the Google Meet ↔ Home Assistant extension
 *
 * GOAL:
 * This React component provides the comprehensive configuration interface for the extension.
 * Users can set up their Home Assistant integration by choosing between API or webhook
 * methods and providing the necessary connection details.
 *
 * The options page allows users to:
 * - Select integration method (API or Webhook)
 * - Configure Home Assistant connection details
 * - Test their configuration before saving
 * - Save and validate their settings
 *
 * CONFIGURATION METHODS:
 * - API Method: Requires Home Assistant URL, auth token, and entity ID
 * - Webhook Method: Requires a complete webhook URL
 *
 * FEATURES:
 * - Dynamic form fields based on selected method
 * - Real-time configuration validation
 * - Connection testing with visual feedback
 * - Save state management with change detection
 * - Password field with visibility toggle for API tokens
 * - Responsive design with Material-UI components
 *
 * COMPONENTS:
 * - Options: Main component that manages the configuration interface
 * - Theme configuration for consistent Material-UI styling
 *
 * METHODS:
 * - test(): Tests the connection to Home Assistant
 * - save(): Saves configuration to Chrome storage
 * - hasConfigChanged(): Checks if configuration has been modified
 * - hasUrlToTest(): Determines if there's enough info to test connection
 * - areRequiredFieldsFilled(): Validates that all required fields are completed
 *
 * STATE MANAGEMENT:
 * - config: Current configuration being edited
 * - originalConfig: Saved configuration for change detection
 * - saved: Boolean indicating if save was successful
 * - testStatus: Current status of connection testing
 * - testResult: Result of the last connection test
 * - showToken: Boolean for API token visibility toggle
 *
 * UI ELEMENTS:
 * - Method selection radio buttons (API/Webhook)
 * - Dynamic form fields based on selected method
 * - Test button (enabled when configuration is complete)
 * - Save button (enabled when changes are made and fields are valid)
 * - Success/error notifications via Snackbar components
 *
 * VALIDATION:
 * - Required field validation
 * - URL format validation for Home Assistant host
 * - Real-time connection testing
 * - Visual feedback for all validation states
 */

import React, { useEffect, useState, Suspense } from "react";
import ReactDOM from "react-dom";
import { Config, defaultConfig, loadConfig, saveConfig, UpdateMethod } from "./config";
import { testConnection, TestResult } from "./hass";
import { t, setLanguage, getCurrentLanguage, getSupportedLanguages, getLanguageName, SupportedLanguage, initializeTranslations } from "./translations";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoadingButton from "@mui/lab/LoadingButton";
import {
    Alert,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    IconButton,
    InputAdornment,
    Radio,
    RadioGroup,
    Snackbar,
    Stack,
    TextField,
    ThemeProvider,
    createTheme,
    Select,
    MenuItem,
} from "@mui/material";

/**
 * Create a theme with proper font settings
 */
const theme = createTheme({
    typography: {
        fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputLabel-root': {
                        fontSize: '14px',
                    },
                    '& .MuiInputBase-input': {
                        fontSize: '14px',
                    },
                    '& .MuiFormHelperText-root': {
                        fontSize: '12px',
                    },
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    fontSize: '14px',
                    fontWeight: 500,
                },
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                label: {
                    fontSize: '14px',
                },
            },
        },
    },
});

/**
 * Test status enumeration for connection testing
 */
enum TestStatus {
    NotTested,
    Testing,
    Complete,
}

/**
 * Loading component for the options page
 */
const OptionsLoading = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        color: '#666'
    }}>
        Loading options...
    </div>
);

/**
 * Main options component for configuration
 */
const Options = () => {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const [originalConfig, setOriginalConfig] = useState<Config>(defaultConfig);
    const [saved, setSaved] = useState<boolean>(false);
    const [testStatus, setTestStatus] = useState<TestStatus>(
        TestStatus.NotTested
    );
    const [testResult, setTestResult] = useState<TestResult>({
        success: false,
        message: "Testing...",
    });
    const [showToken, setShowToken] = useState<boolean>(false);

    /**
     * Populate the previous configuration on load and initialize translations
     */
    useEffect(() => {
        // Initialize translations first
        initializeTranslations();

        loadConfig().then((loadedConfig) => {
            setConfig(loadedConfig);
            setOriginalConfig(loadedConfig);
            // Set the language from config
            setLanguage(loadedConfig.language);
        });
    }, []);

    /**
     * Tests the connection to Home Assistant
     */
    const test = async () => {
        setTestStatus(TestStatus.Testing);

        const result = await testConnection(config);

        setTestResult(result);
        setTestStatus(TestStatus.Complete);
    };

    /**
     * Saves the configuration to Chrome storage
     */
    const save = async () => {
        await saveConfig(config);
        setOriginalConfig(config);

        setSaved(true);

        const timeout = setTimeout(() => {
            setSaved(false);
        }, 1000);
        return () => clearTimeout(timeout);
    };

    /**
     * Handles language change
     */
    const handleLanguageChange = (newLanguage: SupportedLanguage) => {
        setConfig({ ...config, language: newLanguage });
        setLanguage(newLanguage);
    };

    /**
     * Check if configuration has changed
     * @returns True if configuration has changed, false otherwise
     */
    const hasConfigChanged = () => {
        return JSON.stringify(config) !== JSON.stringify(originalConfig);
    };

    /**
     * Check if there's a URL to test
     * @returns True if there's a valid URL to test, false otherwise
     */
    const hasUrlToTest = () => {
        if (config.method === "api") {
            return config.host && config.host.trim() !== "" &&
                   config.token && config.token.trim() !== "" &&
                   config.entity_id && config.entity_id.trim() !== "";
        } else if (config.method === "webhook") {
            return config.webhook_url && config.webhook_url.trim() !== "";
        }
        return false;
    };

    /**
     * Check if all required fields are filled
     * @returns True if all required fields are filled, false otherwise
     */
    const areRequiredFieldsFilled = () => {
        if (config.method === "api") {
            return config.host && config.host.trim() !== "" &&
                   config.token && config.token.trim() !== "" &&
                   config.entity_id && config.entity_id.trim() !== "";
        } else if (config.method === "webhook") {
            return config.webhook_url && config.webhook_url.trim() !== "";
        }
        return false;
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    width: 450,
                    maxHeight: 600,
                    overflow: 'auto',
                    padding: 2,
                    boxSizing: 'border-box'
                }}
            >
                <Stack spacing={2}>
                    <Box>
                        <FormControl fullWidth variant="standard">
                            <FormLabel component="legend">{t('options.language')}</FormLabel>
                            <Select
                                value={config.language}
                                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                                variant="standard"
                            >
                                {getSupportedLanguages().map((lang) => (
                                    <MenuItem key={lang} value={lang}>
                                        {getLanguageName(lang)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">{t('options.updateMethod')}</FormLabel>
                            <RadioGroup
                                value={config.method}
                                onChange={(e) =>
                                    setConfig({ ...config, method: e.target.value as UpdateMethod })
                                }
                            >
                                <FormControlLabel value="api" control={<Radio />} label={t('options.api')} />
                                <FormControlLabel value="webhook" control={<Radio />} label={t('options.webhook')} />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                    {config.method === "api" && (
                        <Box>
                            <TextField
                                id="host"
                                name="host"
                                label={`${t('options.hostUrl')} *`}
                                value={config.host}
                                onChange={(e) =>
                                    setConfig({ ...config, host: e.target.value })
                                }
                                helperText={t('options.hostUrlHelp')}
                                variant="standard"
                                fullWidth
                                required
                            />
                        </Box>
                    )}
                    {config.method === "webhook" && (
                        <Box>
                            <TextField
                                id="webhook_url"
                                name="webhook_url"
                                label={t('options.webhookUrl')}
                                value={config.webhook_url}
                                onChange={(e) =>
                                    setConfig({ ...config, webhook_url: e.target.value })
                                }
                                helperText={t('options.webhookUrlHelp')}
                                variant="standard"
                                fullWidth
                                required
                            />
                        </Box>
                    )}
                    {config.method === "api" && (
                        <Box>
                            <TextField
                                id="token"
                                name="token"
                                type={showToken ? "text" : "password"}
                                label={t('options.authToken')}
                                value={config.token}
                                onChange={(e) =>
                                    setConfig({ ...config, token: e.target.value })
                                }
                                variant="standard"
                                fullWidth
                                required
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="Toggle auth token visibility"
                                                onClick={() =>
                                                    setShowToken(!showToken)
                                                }
                                                edge="end"
                                            >
                                                {showToken ? (
                                                    <Visibility />
                                                ) : (
                                                    <VisibilityOff />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    )}
                    {config.method === "api" && (
                        <Box>
                            <TextField
                                id="entity_id"
                                name="entity_id"
                                label={t('options.entityId')}
                                value={config.entity_id}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        entity_id: e.target.value,
                                    })
                                }
                                variant="standard"
                                fullWidth
                                required
                            />
                        </Box>
                    )}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 1
                    }}>
                        {hasUrlToTest() && (
                            <LoadingButton
                                size="small"
                                onClick={test}
                                loading={testStatus === TestStatus.Testing}
                                loadingIndicator={t('test.testing')}
                                variant="outlined"
                            >
                                {t('options.test')}
                            </LoadingButton>
                        )}
                        <Button
                            variant="contained"
                            onClick={save}
                            disabled={!hasConfigChanged() || !areRequiredFieldsFilled()}
                            sx={{
                                backgroundColor: (hasConfigChanged() && areRequiredFieldsFilled()) ? undefined : '#ccc',
                                color: (hasConfigChanged() && areRequiredFieldsFilled()) ? undefined : '#666',
                                '&:hover': {
                                    backgroundColor: (hasConfigChanged() && areRequiredFieldsFilled()) ? undefined : '#ccc',
                                }
                            }}
                        >
                            {t('options.save')}
                        </Button>
                    </Box>
                    <Box sx={{ minHeight: 20, position: 'relative' }}>
                        <Snackbar
                            open={saved}
                            autoHideDuration={6000}
                            onClose={() => setSaved(false)}
                        >
                            <Alert
                                onClose={() => setSaved(false)}
                                severity="success"
                                sx={{ width: "100%" }}
                            >
                                {t('options.configurationSaved')}
                            </Alert>
                        </Snackbar>
                        <Snackbar
                            open={testStatus === TestStatus.Complete}
                            autoHideDuration={6000}
                            onClose={() => setTestStatus(TestStatus.NotTested)}
                        >
                            <Alert
                                onClose={() =>
                                    setTestStatus(TestStatus.NotTested)
                                }
                                severity={
                                    testResult.success ? "success" : "warning"
                                }
                                sx={{ width: "100%" }}
                            >
                                {testResult.message}
                            </Alert>
                        </Snackbar>
                    </Box>
                </Stack>
            </Box>
        </ThemeProvider>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Suspense fallback={<OptionsLoading />}>
            <Options />
        </Suspense>
    </React.StrictMode>,
    document.getElementById("root")
);