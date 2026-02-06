import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ValidateYouTrackToken, FetchProjects, SaveYouTrackToken, SaveConfig, GetCurrentUser } from 'wailsjs/go/main/App';
import { THEME_TAILWIND } from '@/utils/theme';
import { WindowSetSize } from 'wailsjs/runtime';
import { ProjectMultiSelect } from './ProjectMultiSelect';
export function SetupWizard({ setConfig, setIsConfigured }) {
    const [baseURL, setBaseURL] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState(1);
    const [projects, setProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [windowPos, setWindowPos] = useState("Center");
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    useEffect(() => {
        // Set window size to half height for setup wizard
        WindowSetSize(600, 250);
    }, []);
    const handleValidateAndSaveToken = async () => {
        try {
            const isValid = await ValidateYouTrackToken(baseURL, token);
            if (isValid) {
                await SaveYouTrackToken(token);
                setStep(2);
                setError(null);
                const fetchedProjects = await FetchProjects(baseURL, token);
                // Store full project objects including id, name, and shortName
                setProjects(fetchedProjects);
            }
            else {
                setError("Invalid YouTrack Base URL or Token.");
            }
        }
        catch (e) {
            const message = typeof e === "string"
                ? e
                : e instanceof Error
                    ? e.message
                    : e?.message ??
                        e?.Message ??
                        (e != null ? String(e) : "Unknown error");
            setError(message);
        }
    };
    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            // Validate baseURL
            if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
                throw new Error('Base URL must start with http:// or https://');
            }
            // Use the Go backend to make the API call (avoids CORS issues)
            const user = await GetCurrentUser(baseURL, token);
            if (user) {
                const userName = user.name || 'Unknown';
                const userEmail = user.email || 'Unknown';
                setTestResult({
                    success: true,
                    message: `Token belongs to ${userName} with email ${userEmail}`
                });
            }
            else {
                setTestResult({
                    success: false,
                    message: 'Connection succeeded but no user data returned'
                });
            }
        }
        catch (e) {
            const message = typeof e === "string"
                ? e
                : e instanceof Error
                    ? e.message
                    : e?.message ??
                        e?.Message ??
                        (e != null ? String(e) : "Unknown error");
            setTestResult({
                success: false,
                message: `Connection failed: ${message}`
            });
        }
        finally {
            setIsTesting(false);
        }
    };
    const handleSaveConfig = async () => {
        const newConfig = {
            base_url: baseURL,
            projects: selectedProjects,
            window_pos: windowPos,
            last_sync_time: 0,
            log_level: "info",
            log_to_file: false,
        };
        await SaveConfig(newConfig);
        setConfig(newConfig);
        setIsConfigured(true);
    };
    return (_jsxs("div", { className: `min-h-screen p-8 ${THEME_TAILWIND.bgBase} flex flex-col`, children: [_jsx("h1", { className: `text-2xl font-bold mb-4 ${THEME_TAILWIND.textPrimary}`, children: "Setup Wizard" }), error && _jsx("p", { className: `text-[hsl(var(--color-critical))] mb-4 p-3 bg-[hsl(var(--color-critical)_/_10%)] rounded`, children: error }), step === 1 && (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx("h2", { className: `text-xl mb-4 ${THEME_TAILWIND.textPrimary}`, children: "Step 1: YouTrack Configuration" }), _jsx("input", { type: "text", placeholder: "https://your-company.myjetbrains.com/youtrack", className: `w-full p-3 mb-3 ${THEME_TAILWIND.bgSurface} rounded ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]`, value: baseURL, onChange: (e) => setBaseURL(e.target.value) }), _jsx("input", { type: "password", placeholder: "Permanent Token", className: `w-full p-3 mb-4 ${THEME_TAILWIND.bgSurface} rounded ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]`, value: token, onChange: (e) => setToken(e.target.value) }), testResult && (_jsx("div", { className: `p-3 rounded mb-4 text-sm ${testResult.success
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'}`, children: testResult.message })), _jsxs("div", { className: "flex gap-2 justify-end w-1/2 ml-auto", children: [_jsx(Button, { onClick: handleTestConnection, disabled: !baseURL || !token || isTesting, className: "flex-1 border-2 border-[hsl(var(--primary))] bg-transparent text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_10%)] disabled:opacity-50 disabled:border-[hsl(var(--color-text-muted))] disabled:text-[hsl(var(--color-text-muted))]", children: isTesting ? 'Testing...' : 'Test' }), _jsx(Button, { onClick: handleValidateAndSaveToken, className: "flex-1", children: "Next" })] })] })), step === 2 && (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx("h2", { className: `text-xl mb-4 ${THEME_TAILWIND.textPrimary}`, children: "Step 2: Project Selection" }), _jsx("p", { className: `mb-4 text-sm ${THEME_TAILWIND.textSecondary}`, children: "Select the projects you want to include in your search. You can search by project ID, short name, or full name." }), projects.length === 0 ? (_jsx("div", { className: `${THEME_TAILWIND.bgSurface} rounded p-4 mb-4 flex-1 flex items-center justify-center`, children: _jsx("p", { className: THEME_TAILWIND.textSecondary, children: "No projects available" }) })) : (_jsx("div", { className: "mb-4 flex-1", children: _jsx(ProjectMultiSelect, { projects: projects, selectedProjects: selectedProjects, onSelectedProjectsChange: setSelectedProjects }) })), _jsx("div", { className: "flex justify-end w-1/2 ml-auto", children: _jsx(Button, { onClick: () => setStep(3), disabled: selectedProjects.length === 0, className: "w-full", children: "Next" }) })] })), step === 3 && (_jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx("h2", { className: `text-xl mb-4 ${THEME_TAILWIND.textPrimary}`, children: "Step 3: Window Position" }), _jsx("div", { className: `${THEME_TAILWIND.bgSurface} rounded p-4 mb-4 flex-1`, children: _jsx("div", { className: "space-y-3", children: [
                                { label: 'Top Left', value: 'Top Left' },
                                { label: 'Top Center', value: 'Top Center' },
                                { label: 'Top Right', value: 'Top Right' },
                                { label: 'Center', value: 'Center' },
                                { label: 'Bottom Left', value: 'Bottom Left' },
                                { label: 'Bottom Center', value: 'Bottom Center' },
                                { label: 'Bottom Right', value: 'Bottom Right' },
                            ].map((pos) => (_jsxs("label", { className: `flex items-center cursor-pointer ${THEME_TAILWIND.textPrimary}`, children: [_jsx("input", { type: "radio", name: "windowPos", checked: windowPos === pos.value, onChange: () => setWindowPos(pos.value), className: "mr-3" }), _jsx("span", { children: pos.label })] }, pos.value))) }) }), _jsx("div", { className: "flex justify-end w-1/2 ml-auto", children: _jsx(Button, { onClick: handleSaveConfig, className: "w-full", children: "Finish Setup" }) })] }))] }));
}
