import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { GetConfig, GetTickets, SyncTickets } from 'wailsjs/go/main/App';
import { SetupWizard } from '@/components/SetupWizard';
import { SearchInterfaceSimple } from '@/components/SearchInterfaceSimple';
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
    // Load tickets when configuration is completed (after setup wizard)
    useEffect(() => {
        if (isConfigured && config && config.base_url && config.projects.length > 0) {
            async function loadtickets() {
                const cachedTickets = await GetTickets();
                setTickets(cachedTickets);
                // Start background sync
                SyncTickets();
            }
            loadtickets();
        }
    }, [isConfigured, config]);
    if (!config) {
        return _jsx("div", { children: "Loading..." });
    }
    return (_jsx("div", { className: "h-screen w-screen overflow-hidden dark", children: isConfigured ? (_jsx(SearchInterfaceSimple, { tickets: tickets })) : (_jsx(SetupWizard, { setConfig: setConfig, setIsConfigured: setIsConfigured })) }));
}
export default App;
