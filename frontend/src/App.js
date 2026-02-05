import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GetConfig, GetTickets, SyncTickets, HideWindow, ValidateYouTrackToken, SaveYouTrackToken, FetchProjects, SaveConfig, CopyToClipboard, OpenInBrowser } from 'wailsjs/go/main/App';
const WINDOW_POSITIONS = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Center', value: 'top-center' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Center', value: 'center' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Center', value: 'bottom-center' },
    { label: 'Bottom Right', value: 'bottom-right' },
];
function App() {
    const [config, setConfig] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [isConfigured, setIsConfigured] = useState(false);
    useEffect(() => {
        async function init() {
            const currentConfig = await GetConfig();
            setConfig(currentConfig);
            if (currentConfig.base_url && currentConfig.projects.length > 0) {
                setIsConfigured(true);
                const cachedTickets = await GetTickets();
                setTickets(cachedTickets);
                // Start background sync
                SyncTickets();
            }
            else {
                setIsConfigured(false);
            }
        }
        init();
    }, []);
    if (!config) {
        return _jsx("div", { children: "Loading..." });
    }
    return (_jsx("div", { className: "h-screen w-screen overflow-hidden dark", children: isConfigured ? (_jsx(SearchInterface, { tickets: tickets })) : (_jsx(SetupWizard, { setConfig: setConfig, setIsConfigured: setIsConfigured })) }));
}
function SearchInterface({ tickets }) {
    const [search, setSearch] = useState("");
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                if (search === "") {
                    HideWindow();
                }
                else {
                    setSearch("");
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [search]);
    return (_jsxs(CommandMenu, { children: [_jsx(CommandPrimitive.Input, { value: search, onValueChange: setSearch, placeholder: "Search YouTrack tickets...", className: "h-12 w-full border-none bg-transparent px-4 py-3 text-lg outline-none", autoFocus: true }), _jsxs(CommandPrimitive.List, { className: "max-h-[300px] overflow-y-auto", children: [_jsx(CommandPrimitive.Empty, { children: "No results found." }), tickets.map((ticket) => (_jsx(TicketItem, { ticket: ticket }, ticket.id)))] })] }));
}
function SetupWizard({ setConfig, setIsConfigured }) {
    const [baseURL, setBaseURL] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState(1);
    const [projects, setProjects] = useState([]);
    const [selectedProjects, setSelectedProjects] = useState([]);
    const [windowPos, setWindowPos] = useState("Center");
    const [error, setError] = useState(null);
    const handleValidateAndSaveToken = async () => {
        try {
            const isValid = await ValidateYouTrackToken(baseURL, token);
            if (isValid) {
                await SaveYouTrackToken(token);
                setStep(2);
                setError(null);
                const fetchedProjects = await FetchProjects(baseURL, token);
                // fetchedProjects is an array of project objects; store shortName values
                setProjects(fetchedProjects.map((p) => p.shortName));
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
    return (_jsxs("div", { className: "p-8", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Setup Wizard" }), error && _jsx("p", { className: "text-red-500 mb-4", children: error }), step === 1 && (_jsxs("div", { children: [_jsx("h2", { className: "text-xl mb-2", children: "Step 1: YouTrack Configuration" }), _jsx("input", { type: "text", placeholder: "YouTrack Base URL (e.g., https://myorg.youtrack.cloud)", className: "w-full p-2 mb-2 bg-gray-700 rounded", value: baseURL, onChange: (e) => setBaseURL(e.target.value) }), _jsx("input", { type: "password", placeholder: "Permanent Token", className: "w-full p-2 mb-4 bg-gray-700 rounded", value: token, onChange: (e) => setToken(e.target.value) }), _jsx(Button, { onClick: handleValidateAndSaveToken, children: "Next" })] })), step === 2 && (_jsxs("div", { children: [_jsx("h2", { className: "text-xl mb-2", children: "Step 2: Project Selection" }), _jsx("select", { multiple: true, className: "w-full p-2 mb-4 bg-gray-700 rounded h-40", value: selectedProjects, onChange: (e) => setSelectedProjects(Array.from(e.target.selectedOptions, (option) => option.value)), children: projects.map((project) => (_jsx("option", { value: project, children: project }, project))) }), _jsx(Button, { onClick: () => setStep(3), children: "Next" })] })), step === 3 && (_jsxs("div", { children: [_jsx("h2", { className: "text-xl mb-2", children: "Step 3: Window Position" }), _jsxs("select", { className: "w-full p-2 mb-4 bg-gray-700 rounded", value: windowPos, onChange: (e) => setWindowPos(e.target.value), children: [_jsx("option", { value: "Top Left", children: "Top Left" }), _jsx("option", { value: "Top Center", children: "Top Center" }), _jsx("option", { value: "Top Right", children: "Top Right" }), _jsx("option", { value: "Center", children: "Center" }), _jsx("option", { value: "Bottom Right", children: "Bottom Right" })] }), _jsx(Button, { onClick: handleSaveConfig, children: "Finish Setup" })] }))] }));
}
function TicketItem({ ticket }) {
    const handleSelect = async () => {
        // On Enter: Copy URL
        await CopyToClipboard(ticket.url);
        HideWindow();
    };
    const handleShiftEnter = async () => {
        // On Shift+Enter: Open in Browser
        await OpenInBrowser(ticket.url);
        HideWindow();
    };
    return (_jsx(CommandPrimitive.Item, { onSelect: handleSelect, className: cn("flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none", "aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"), children: _jsxs("div", { className: cn("flex flex-col flex-grow group", "data-[selected=true]:bg-accent"), children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-bold text-blue-400 w-24 flex-shrink-0", children: ticket.id }), _jsx("span", { className: "flex-grow truncate ... text-white", children: ticket.summary }), _jsx("span", { className: cn("ml-4 text-right flex-shrink-0", ticket.priority === "Critical" && "text-red-500", ticket.priority === "Major" && "text-yellow-500", ticket.priority === "Minor" && "text-gray-500"), children: ticket.priority })] }), _jsxs("div", { className: "flex justify-between items-center text-sm text-gray-400", children: [_jsx("span", { className: "text-gray-500", children: ticket.type }), _jsx("div", { className: "flex space-x-1", children: ticket.sprints.map((sprint) => (_jsx("span", { className: "px-2 py-0.5 border border-gray-500 rounded-full text-xs", children: sprint }, sprint))) })] })] }) }));
}
const CommandMenu = React.forwardRef(({ className, ...props }, ref) => (_jsx(CommandPrimitive, { ref: ref, className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className), ...props })));
CommandMenu.displayName = CommandPrimitive.displayName;
export default App;
