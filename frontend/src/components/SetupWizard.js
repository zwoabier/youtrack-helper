import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Uncommented
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Uncommented
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ValidateYouTrackToken, FetchProjects, SaveYouTrackToken } from 'wailsjs/go/main/App';
import { THEME_TAILWIND } from '@/utils/theme';
const WINDOW_POSITIONS = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Center', value: 'top-center' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Center', value: 'center' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Center', value: 'bottom-center' },
    { label: 'Bottom Right', value: 'bottom-right' },
];
export function SetupWizard({ onComplete }) {
    const [step, setStep] = useState(1);
    const [baseURL, setBaseURL] = useState('');
    const [token, setToken] = useState('');
    const [projects, setProjects] = useState([]);
    const [windowPos, setWindowPos] = useState('top-right');
    const [availableProjects, setAvailableProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    async function validateConnection() {
        setIsValidating(true);
        setError('');
        try {
            await ValidateYouTrackToken(baseURL, token);
            const projectList = await FetchProjects(baseURL, token);
            setAvailableProjects(projectList);
            setStep(3);
        }
        catch (err) {
            setError(`Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        finally {
            setIsValidating(false);
        }
    }
    async function handleComplete() {
        if (projects.length === 0) {
            setError('Please select at least one project');
            return;
        }
        const config = {
            base_url: baseURL,
            projects: projects,
            window_pos: windowPos,
            last_sync_time: Date.now(),
            log_level: "info",
            log_to_file: false,
        };
        try {
            setIsLoading(true);
            // Save token to keyring
            await SaveYouTrackToken(token);
            await onComplete(config);
        }
        catch (err) {
            setError(`Failed to save configuration: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        finally {
            setIsLoading(false);
        }
    }
    function toggleProject(project) {
        setProjects(prev => prev.includes(project)
            ? prev.filter(p => p !== project)
            : [...prev, project]);
    }
    return (_jsx("div", { className: `w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--color-bg-base))] to-[hsl(var(--color-bg-elevated))] p-4`, children: _jsxs(Card, { className: `w-full max-w-md ${THEME_TAILWIND.bgElevated} ${THEME_TAILWIND.border}`, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: THEME_TAILWIND.textPrimary, children: "YouTrack Helper Setup" }), _jsxs(CardDescription, { className: THEME_TAILWIND.textSecondary, children: ["Step ", step, " of 4"] })] }), _jsxs(CardContent, { className: "space-y-6", children: [error && (_jsxs("div", { className: `flex items-center gap-2 p-3 bg-[hsl(var(--color-critical)_/_10%)] border border-[hsl(var(--color-critical)_/_50%)] rounded-lg`, children: [_jsx(AlertCircle, { className: `w-5 h-5 text-[hsl(var(--color-critical))]` }), _jsx("p", { className: `text-sm text-[hsl(var(--color-critical))]`, children: error })] })), step === 1 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: `text-sm font-medium ${THEME_TAILWIND.textPrimary}`, children: "YouTrack Base URL" }), _jsx(Input, { placeholder: "https://myorg.youtrack.cloud", value: baseURL, onChange: (e) => setBaseURL(e.target.value), className: `mt-2 ${THEME_TAILWIND.bgSurface} ${THEME_TAILWIND.border} ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]` }), _jsx("p", { className: `mt-2 text-xs ${THEME_TAILWIND.textSecondary}`, children: "e.g., https://myorg.youtrack.cloud" })] }), _jsx(Button, { onClick: () => baseURL && setStep(2), disabled: !baseURL, className: "w-full bg-[hsl(var(--color-accent-bright))] hover:bg-[hsl(var(--color-accent))]", children: "Continue" })] })), step === 2 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: `text-sm font-medium ${THEME_TAILWIND.textPrimary}`, children: "Permanent Token" }), _jsx(Input, { placeholder: "Enter your YouTrack permanent token", type: "password", value: token, onChange: (e) => setToken(e.target.value), className: `mt-2 ${THEME_TAILWIND.bgSurface} ${THEME_TAILWIND.border} ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]` }), _jsx("p", { className: `mt-2 text-xs ${THEME_TAILWIND.textSecondary}`, children: "Create this in YouTrack settings under API Tokens" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setStep(1), variant: "outline", className: `flex-1 ${THEME_TAILWIND.border} ${THEME_TAILWIND.textSecondary} hover:${THEME_TAILWIND.bgHover}`, children: "Back" }), _jsx(Button, { onClick: validateConnection, disabled: !token || isValidating, className: "flex-1 bg-[hsl(var(--color-accent-bright))] hover:bg-[hsl(var(--color-accent))]", children: isValidating ? 'Validating...' : 'Validate' })] })] })), step === 3 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: `text-sm font-medium ${THEME_TAILWIND.textPrimary} block mb-3`, children: "Select Projects" }), _jsx("div", { className: `space-y-2 max-h-64 overflow-y-auto`, children: availableProjects.map(p => (_jsxs("label", { className: `flex items-center gap-2 cursor-pointer p-2 rounded hover:${THEME_TAILWIND.bgHover} transition`, children: [_jsx("input", { type: "checkbox", checked: projects.includes(p.shortName), onChange: () => toggleProject(p.shortName), className: `w-4 h-4 rounded border-[hsl(var(--color-border))] ${THEME_TAILWIND.bgSurface}` }), _jsx("span", { className: `text-sm ${THEME_TAILWIND.textPrimary}`, children: `${p.shortName} — ${p.name}` })] }, p.id))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setStep(2), variant: "outline", className: `flex-1 ${THEME_TAILWIND.border} ${THEME_TAILWIND.textSecondary} hover:${THEME_TAILWIND.bgHover}`, children: "Back" }), _jsx(Button, { onClick: () => setStep(4), disabled: projects.length === 0, className: "flex-1 bg-[hsl(var(--color-accent-bright))] hover:bg-[hsl(var(--color-accent))]", children: "Continue" })] })] })), step === 4 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: `text-sm font-medium ${THEME_TAILWIND.textPrimary} block mb-3`, children: "Window Position" }), _jsx("select", { value: windowPos, onChange: (e) => setWindowPos(e.target.value), className: `w-full p-2 ${THEME_TAILWIND.bgSurface} border border-[hsl(var(--color-border))] rounded-md ${THEME_TAILWIND.textPrimary}`, children: WINDOW_POSITIONS.map(pos => (_jsx("option", { value: pos.value, children: pos.label }, pos.value))) })] }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: `flex items-center gap-2 p-3 bg-[hsl(var(--color-normal)_/_10%)] border border-[hsl(var(--color-normal)_/_50%)] rounded-lg`, children: [_jsx(CheckCircle, { className: `w-5 h-5 text-[hsl(var(--color-normal))]` }), _jsxs("div", { className: `text-sm text-[hsl(var(--color-normal))]`, children: [_jsx("p", { className: "font-medium", children: "Configuration Complete" }), _jsxs("p", { className: "text-xs mt-1", children: ["Selected projects: ", projects.join(', ')] })] })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setStep(3), variant: "outline", className: `flex-1 ${THEME_TAILWIND.border} ${THEME_TAILWIND.textSecondary} hover:${THEME_TAILWIND.bgHover}`, children: "Back" }), _jsx(Button, { onClick: handleComplete, disabled: isLoading, className: "flex-1 bg-[hsl(var(--color-normal))] hover:bg-[hsl(var(--color-normal))] text-white", children: isLoading ? 'Saving...' : 'Complete Setup' })] })] }))] })] }) }));
}
