import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Uncommented
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Uncommented
import { AlertCircle, CheckCircle } from 'lucide-react';
import { ValidateYouTrackToken, FetchProjects, SaveYouTrackToken } from 'wailsjs/go/main/App';
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
    return (_jsx("div", { className: "w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4", children: _jsxs(Card, { className: "w-full max-w-md bg-slate-900 border-slate-800", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-white", children: "YouTrack Helper Setup" }), _jsxs(CardDescription, { className: "text-slate-400", children: ["Step ", step, " of 4"] })] }), _jsxs(CardContent, { className: "space-y-6", children: [error && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-500" }), _jsx("p", { className: "text-sm text-red-400", children: error })] })), step === 1 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "YouTrack Base URL" }), _jsx(Input, { placeholder: "https://myorg.youtrack.cloud", value: baseURL, onChange: (e) => setBaseURL(e.target.value), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" }), _jsx("p", { className: "mt-2 text-xs text-slate-400", children: "e.g., https://myorg.youtrack.cloud" })] }), _jsx(Button, { onClick: () => baseURL && setStep(2), disabled: !baseURL, className: "w-full bg-blue-600 hover:bg-blue-700", children: "Continue" })] })), step === 2 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-slate-300", children: "Permanent Token" }), _jsx(Input, { placeholder: "Enter your YouTrack permanent token", type: "password", value: token, onChange: (e) => setToken(e.target.value), className: "mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" }), _jsx("p", { className: "mt-2 text-xs text-slate-400", children: "Create this in YouTrack settings under API Tokens" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setStep(1), variant: "outline", className: "flex-1 border-slate-700 text-slate-300 hover:bg-slate-800", children: "Back" }), _jsx(Button, { onClick: validateConnection, disabled: !token || isValidating, className: "flex-1 bg-blue-600 hover:bg-blue-700", children: isValidating ? 'Validating...' : 'Validate' })] })] })), step === 3 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-slate-300 block mb-3", children: "Select Projects" }), _jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: availableProjects.map(p => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 transition", children: [_jsx("input", { type: "checkbox", checked: projects.includes(p.shortName), onChange: () => toggleProject(p.shortName), className: "w-4 h-4 rounded border-slate-600 bg-slate-800" }), _jsx("span", { className: "text-sm text-slate-300", children: `${p.shortName} — ${p.name}` })] }, p.id))) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setStep(2), variant: "outline", className: "flex-1 border-slate-700 text-slate-300 hover:bg-slate-800", children: "Back" }), _jsx(Button, { onClick: () => setStep(4), disabled: projects.length === 0, className: "flex-1 bg-blue-600 hover:bg-blue-700", children: "Continue" })] })] })), step === 4 && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-slate-300 block mb-3", children: "Window Position" }), _jsx("select", { value: windowPos, onChange: (e) => setWindowPos(e.target.value), className: "w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300", children: WINDOW_POSITIONS.map(pos => (_jsx("option", { value: pos.value, children: pos.label }, pos.value))) })] }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500" }), _jsxs("div", { className: "text-sm text-green-400", children: [_jsx("p", { className: "font-medium", children: "Configuration Complete" }), _jsxs("p", { className: "text-xs mt-1", children: ["Selected projects: ", projects.join(', ')] })] })] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setStep(3), variant: "outline", className: "flex-1 border-slate-700 text-slate-300 hover:bg-slate-800", children: "Back" }), _jsx(Button, { onClick: handleComplete, disabled: isLoading, className: "flex-1 bg-green-600 hover:bg-green-700", children: isLoading ? 'Saving...' : 'Complete Setup' })] })] }))] })] }) }));
}
