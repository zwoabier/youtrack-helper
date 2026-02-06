import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { main } from 'wailsjs/go/models';
import { ValidateYouTrackToken, FetchProjects, SaveYouTrackToken, SaveConfig, GetCurrentUser } from 'wailsjs/go/main/App';
import { THEME_TAILWIND } from '@/utils/theme';
import { WindowSetSize } from 'wailsjs/runtime';
import { ProjectMultiSelect } from './ProjectMultiSelect';

interface SetupWizardProps {
  setConfig: (config: main.Config) => void;
  setIsConfigured: (isConfigured: boolean) => void;
}

export function SetupWizard({ setConfig, setIsConfigured }: SetupWizardProps) {
  const [baseURL, setBaseURL] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [projects, setProjects] = useState<main.Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [windowPos, setWindowPos] = useState("Center");
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
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
      } else {
        setError("Invalid YouTrack Base URL or Token.");
      }
    } catch (e: unknown) {
      const message =
        typeof e === "string"
          ? e
          : e instanceof Error
            ? e.message
            : (e as { message?: string })?.message ??
              (e as { Message?: string })?.Message ??
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
      } else {
        setTestResult({
          success: false,
          message: 'Connection succeeded but no user data returned'
        });
      }
    } catch (e: unknown) {
      const message =
        typeof e === "string"
          ? e
          : e instanceof Error
            ? e.message
            : (e as { message?: string })?.message ??
              (e as { Message?: string })?.Message ??
              (e != null ? String(e) : "Unknown error");
      setTestResult({
        success: false,
        message: `Connection failed: ${message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    const newConfig: main.Config = {
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

  return (
    <div className={`min-h-screen p-8 ${THEME_TAILWIND.bgBase} flex flex-col`}>
      <h1 className={`text-2xl font-bold mb-4 ${THEME_TAILWIND.textPrimary}`}>Setup Wizard</h1>
      {error && <p className={`text-[hsl(var(--color-critical))] mb-4 p-3 bg-[hsl(var(--color-critical)_/_10%)] rounded`}>{error}</p>}

      {step === 1 && (
        <div className="flex-1 flex flex-col">
          <h2 className={`text-xl mb-4 ${THEME_TAILWIND.textPrimary}`}>Step 1: YouTrack Configuration</h2>
          <input
            type="text"
            placeholder="https://your-company.myjetbrains.com/youtrack"
            className={`w-full p-3 mb-3 ${THEME_TAILWIND.bgSurface} rounded ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]`}
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
          />
          <input
            type="password"
            placeholder="Permanent Token"
            className={`w-full p-3 mb-4 ${THEME_TAILWIND.bgSurface} rounded ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]`}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          
          {testResult && (
            <div className={`p-3 rounded mb-4 text-sm ${
              testResult.success 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
            }`}>
              {testResult.message}
            </div>
          )}
          
          <div className="flex gap-2 justify-end w-1/2 ml-auto">
            <Button 
              onClick={handleTestConnection} 
              disabled={!baseURL || !token || isTesting}
              className="flex-1 border-2 border-[hsl(var(--primary))] bg-transparent text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)_/_10%)] disabled:opacity-50 disabled:border-[hsl(var(--color-text-muted))] disabled:text-[hsl(var(--color-text-muted))]"
            >
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
            <Button onClick={handleValidateAndSaveToken} className="flex-1">Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <h2 className={`text-xl mb-4 ${THEME_TAILWIND.textPrimary}`}>Step 2: Project Selection</h2>
          <p className={`mb-4 text-sm ${THEME_TAILWIND.textSecondary}`}>
            Select the projects you want to include in your search. You can search by project ID, short name, or full name.
          </p>
          
          {projects.length === 0 ? (
            <div className={`${THEME_TAILWIND.bgSurface} rounded p-4 mb-4 flex-1 flex items-center justify-center`}>
              <p className={THEME_TAILWIND.textSecondary}>No projects available</p>
            </div>
          ) : (
            <div className="mb-4 flex-1">
              <ProjectMultiSelect
                projects={projects}
                selectedProjects={selectedProjects}
                onSelectedProjectsChange={setSelectedProjects}
              />
            </div>
          )}
          
          <div className="flex justify-end w-1/2 ml-auto">
            <Button 
              onClick={() => setStep(3)} 
              disabled={selectedProjects.length === 0}
              className="w-full"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col">
          <h2 className={`text-xl mb-4 ${THEME_TAILWIND.textPrimary}`}>Step 3: Window Position</h2>
          <div className={`${THEME_TAILWIND.bgSurface} rounded p-4 mb-4 flex-1`}>
            <div className="space-y-3">
              {[
                { label: 'Top Left', value: 'Top Left' },
                { label: 'Top Center', value: 'Top Center' },
                { label: 'Top Right', value: 'Top Right' },
                { label: 'Center', value: 'Center' },
                { label: 'Bottom Left', value: 'Bottom Left' },
                { label: 'Bottom Center', value: 'Bottom Center' },
                { label: 'Bottom Right', value: 'Bottom Right' },
              ].map((pos) => (
                <label key={pos.value} className={`flex items-center cursor-pointer ${THEME_TAILWIND.textPrimary}`}>
                  <input
                    type="radio"
                    name="windowPos"
                    checked={windowPos === pos.value}
                    onChange={() => setWindowPos(pos.value)}
                    className="mr-3"
                  />
                  <span>{pos.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end w-1/2 ml-auto">
            <Button onClick={handleSaveConfig} className="w-full">Finish Setup</Button>
          </div>
        </div>
      )}
    </div>
  );
}