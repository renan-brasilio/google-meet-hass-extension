import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Config, defaultConfig, loadConfig, validateConfig } from "./config";
import Settings from "@mui/icons-material/Settings";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Error from "@mui/icons-material/Error";
import Warning from "@mui/icons-material/Warning";
import Videocam from "@mui/icons-material/Videocam";
import VideocamOff from "@mui/icons-material/VideocamOff";
import {
    Box,
    IconButton,
    Stack,
    ThemeProvider,
    createTheme,
    Typography,
    Chip,
} from "@mui/material";

// Create a theme with proper font settings
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

const Popup = () => {
    const [config, setConfig] = useState<Config>(defaultConfig);
    const [isInMeeting, setIsInMeeting] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<string>("");

    // Check meeting status and update timestamp
    const checkMeetingStatus = () => {
        chrome.tabs.query({
            url: "https://meet.google.com/*-*-*",
        }).then((tabs) => {
            setIsInMeeting(tabs.length > 0);
            setLastUpdate(new Date().toLocaleTimeString());
        });
    };

    // Populate the previous configuration on load and start monitoring
    useEffect(() => {
        loadConfig().then((loadedConfig) => {
            console.log('Loaded config in popup:', loadedConfig);
            setConfig(loadedConfig);
        });
        checkMeetingStatus();

        // Check meeting status every 2 seconds
        const interval = setInterval(checkMeetingStatus, 2000);

        return () => clearInterval(interval);
    }, []);

    const openOptionsPage = () => {
        chrome.runtime.openOptionsPage();
    };

    const getConfigurationStatus = () => {
        console.log('Checking config status for:', config);
        const validation = validateConfig(config);
        console.log('Validation result:', validation);

        if (!validation.isValid) {
            return {
                status: 'error',
                message: 'Not configured',
                icon: <Error color="error" />,
                color: 'error' as const
            };
        }

        return {
            status: 'configured',
            message: 'Properly configured',
            icon: <CheckCircle color="success" />,
            color: 'success' as const
        };
    };

    const getMeetingStatus = () => {
        if (isInMeeting) {
            return {
                status: 'meeting',
                message: 'In Google Meet',
                icon: <Videocam color="primary" />,
                color: 'primary' as const
            };
        } else {
            return {
                status: 'idle',
                message: 'Not in meeting',
                icon: <VideocamOff color="inherit" />,
                color: 'default' as const
            };
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    width: 320,
                    padding: 2.5,
                    boxSizing: 'border-box'
                }}
            >
                <Stack spacing={3}>
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <img src="icon48.png" alt="Logo" width="24" height="24" />
                            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                                Google Meet ↔ HA
                            </Typography>
                        </Stack>
                        <IconButton
                            size="small"
                            onClick={openOptionsPage}
                            title="Open configuration"
                        >
                            <Settings fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Configuration Status */}
                    <Box>
                        <Typography variant="body2" sx={{ color: '#666', marginBottom: 1.5, fontWeight: 500 }}>
                            Configuration Status
                        </Typography>
                        <Chip
                            icon={getConfigurationStatus().icon}
                            label={getConfigurationStatus().message}
                            color={getConfigurationStatus().color}
                            variant="outlined"
                            sx={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                height: 36,
                                fontSize: '14px'
                            }}
                        />
                    </Box>

                    {/* Meeting Status */}
                    <Box>
                        <Typography variant="body2" sx={{ color: '#666', marginBottom: 1.5, fontWeight: 500 }}>
                            Meeting Status
                        </Typography>
                        <Chip
                            icon={getMeetingStatus().icon}
                            label={getMeetingStatus().message}
                            color={getMeetingStatus().color}
                            variant="filled"
                            sx={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                height: 36,
                                fontSize: '14px'
                            }}
                        />
                    </Box>

                    {/* Last Update */}
                    {lastUpdate && (
                        <Box sx={{ marginTop: 1, textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: '#999', fontSize: '11px' }}>
                                Last updated: {lastUpdate}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </Box>
        </ThemeProvider>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
    document.getElementById("root")
);
