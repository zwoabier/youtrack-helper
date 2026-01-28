import { useEffect, useState } from 'react';
import { SetupWizard } from './components/SetupWizard';
import { SearchInterface } from './components/SearchInterface';
import type { Config } from './types';

export function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  async function checkConfiguration() {
    try {
      const result = await window.go.main.App.IsConfigured();
      if (result) {
        const cfg = await window.go.main.App.GetConfig();
        setConfig(cfg);
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Failed to check configuration:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetupComplete(newConfig: Config) {
    try {
      await window.go.main.App.SaveConfig(newConfig);
      setConfig(newConfig);
      setIsConfigured(true);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {!isConfigured ? (
        <SetupWizard onComplete={handleSetupComplete} />
      ) : (
        <SearchInterface config={config!} />
      )}
    </>
  );
}
