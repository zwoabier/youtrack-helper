import React, { useEffect, useState } from "react";
import { main } from 'wailsjs/go/models';
import { GetConfig, GetTickets, SyncTickets } from 'wailsjs/go/main/App';
import { SetupWizard } from '@/components/SetupWizard';
import { SearchInterfaceSimple } from '@/components/SearchInterfaceSimple';

function App() {
  const [config, setConfig] = useState<main.Config | null>(null);
  const [tickets, setTickets] = useState<main.Ticket[]>([]);
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
      } else {
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
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden dark">
      {isConfigured ? (
        <SearchInterfaceSimple tickets={tickets} />
      ) : (
        <SetupWizard setConfig={setConfig} setIsConfigured={setIsConfigured} />
      )}
    </div>
  );
}

export default App;
