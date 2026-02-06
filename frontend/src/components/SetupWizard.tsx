import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Uncommented
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Uncommented
import { AlertCircle, CheckCircle } from 'lucide-react';
import { main } from 'wailsjs/go/models';
import { ValidateYouTrackToken, FetchProjects, SaveYouTrackToken, SaveConfig } from 'wailsjs/go/main/App';
import { THEME_TAILWIND } from '@/utils/theme';

interface WindowPosition {
  label: string;
  value: string;
}

const WINDOW_POSITIONS: WindowPosition[] = [
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Center', value: 'top-center' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Center', value: 'center' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Center', value: 'bottom-center' },
  { label: 'Bottom Right', value: 'bottom-right' },
];

interface SetupWizardProps {
  onComplete: (config: main.Config) => Promise<void>;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [baseURL, setBaseURL] = useState('');
  const [token, setToken] = useState('');
  const [projects, setProjects] = useState<string[]>([]);
  const [windowPos, setWindowPos] = useState('top-right');
  const [availableProjects, setAvailableProjects] = useState<
    { id: string; name: string; shortName: string; archived: boolean }[]
  >([]);
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
    } catch (err) {
      setError(`Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsValidating(false);
    }
  }

  async function handleComplete() {
    if (projects.length === 0) {
      setError('Please select at least one project');
      return;
    }

    const config: main.Config = {
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
    } catch (err) {
      setError(`Failed to save configuration: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleProject(project: string) {
    setProjects(prev =>
      prev.includes(project)
        ? prev.filter(p => p !== project)
        : [...prev, project]
    );
  }

  return (
    <div className={`w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--color-bg-base))] to-[hsl(var(--color-bg-elevated))] p-4`}>
      <Card className={`w-full max-w-md ${THEME_TAILWIND.bgElevated} ${THEME_TAILWIND.border}`}>
        <CardHeader>
          <CardTitle className={THEME_TAILWIND.textPrimary}>YouTrack Helper Setup</CardTitle>
          <CardDescription className={THEME_TAILWIND.textSecondary}>Step {step} of 4</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className={`flex items-center gap-2 p-3 bg-[hsl(var(--color-critical)_/_10%)] border border-[hsl(var(--color-critical)_/_50%)] rounded-lg`}>
              <AlertCircle className={`w-5 h-5 text-[hsl(var(--color-critical))]`} />
              <p className={`text-sm text-[hsl(var(--color-critical))]`}>{error}</p>
            </div>
          )}

          {/* Step 1: Base URL */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${THEME_TAILWIND.textPrimary}`}>YouTrack Base URL</label>
                <Input
                  placeholder="https://myorg.youtrack.cloud"
                  value={baseURL}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaseURL(e.target.value)}
                  className={`mt-2 ${THEME_TAILWIND.bgSurface} ${THEME_TAILWIND.border} ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]`}
                />
                <p className={`mt-2 text-xs ${THEME_TAILWIND.textSecondary}`}>e.g., https://myorg.youtrack.cloud</p>
              </div>
              <Button
                onClick={() => baseURL && setStep(2)}
                disabled={!baseURL}
                className="w-full bg-[hsl(var(--color-accent-bright))] hover:bg-[hsl(var(--color-accent))]"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Token */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${THEME_TAILWIND.textPrimary}`}>Permanent Token</label>
                <Input
                  placeholder="Enter your YouTrack permanent token"
                  type="password"
                  value={token}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
                  className={`mt-2 ${THEME_TAILWIND.bgSurface} ${THEME_TAILWIND.border} ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]`}
                />
                <p className={`mt-2 text-xs ${THEME_TAILWIND.textSecondary}`}>Create this in YouTrack settings under API Tokens</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className={`flex-1 ${THEME_TAILWIND.border} ${THEME_TAILWIND.textSecondary} hover:${THEME_TAILWIND.bgHover}`}
                >
                  Back
                </Button>
                <Button
                  onClick={validateConnection}
                  disabled={!token || isValidating}
                  className="flex-1 bg-[hsl(var(--color-accent-bright))] hover:bg-[hsl(var(--color-accent))]"
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Projects */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${THEME_TAILWIND.textPrimary} block mb-3`}>Select Projects</label>
                <div className={`space-y-2 max-h-64 overflow-y-auto`}>
                  {availableProjects.map(p => (
                    <label key={p.id} className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:${THEME_TAILWIND.bgHover} transition`}>
                      <input
                        type="checkbox"
                        checked={projects.includes(p.shortName)}
                        onChange={() => toggleProject(p.shortName)}
                        className={`w-4 h-4 rounded border-[hsl(var(--color-border))] ${THEME_TAILWIND.bgSurface}`}
                      />
                      <span className={`text-sm ${THEME_TAILWIND.textPrimary}`}>{`${p.shortName} — ${p.name}`}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className={`flex-1 ${THEME_TAILWIND.border} ${THEME_TAILWIND.textSecondary} hover:${THEME_TAILWIND.bgHover}`}
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={projects.length === 0}
                  className="flex-1 bg-[hsl(var(--color-accent-bright))] hover:bg-[hsl(var(--color-accent))]"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Window Position */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className={`text-sm font-medium ${THEME_TAILWIND.textPrimary} block mb-3`}>Window Position</label>
                <select
                  value={windowPos}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWindowPos(e.target.value)}
                  className={`w-full p-2 ${THEME_TAILWIND.bgSurface} border border-[hsl(var(--color-border))] rounded-md ${THEME_TAILWIND.textPrimary}`}
                >
                  {WINDOW_POSITIONS.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 p-3 bg-[hsl(var(--color-normal)_/_10%)] border border-[hsl(var(--color-normal)_/_50%)] rounded-lg`}>
                  <CheckCircle className={`w-5 h-5 text-[hsl(var(--color-normal))]`} />
                  <div className={`text-sm text-[hsl(var(--color-normal))]`}>
                    <p className="font-medium">Configuration Complete</p>
                    <p className="text-xs mt-1">Selected projects: {projects.join(', ')}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className={`flex-1 ${THEME_TAILWIND.border} ${THEME_TAILWIND.textSecondary} hover:${THEME_TAILWIND.bgHover}`}
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 bg-[hsl(var(--color-normal))] hover:bg-[hsl(var(--color-normal))] text-white"
                >
                  {isLoading ? 'Saving...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
