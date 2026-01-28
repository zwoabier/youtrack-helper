import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Config, WindowPosition } from '@/types';

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
  onComplete: (config: Config) => Promise<void>;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [baseURL, setBaseURL] = useState('');
  const [token, setToken] = useState('');
  const [projects, setProjects] = useState<string[]>([]);
  const [windowPos, setWindowPos] = useState('top-right');
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  async function validateConnection() {
    setIsValidating(true);
    setError('');
    try {
      await window.go.main.YouTrackAPI.ValidateConnection(baseURL, token);
      const projectList = await window.go.main.YouTrackAPI.GetProjects(baseURL, token);
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

    const config: Config = {
      base_url: baseURL,
      projects,
      window_pos: windowPos,
      last_sync_time: Date.now(),
    };

    try {
      setIsLoading(true);
      // Save token to keyring
      await window.go.main.ConfigManager.SaveToken(token);
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
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">YouTrack Helper Setup</CardTitle>
          <CardDescription className="text-slate-400">Step {step} of 4</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Base URL */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">YouTrack Base URL</label>
                <Input
                  placeholder="https://myorg.youtrack.cloud"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="mt-2 text-xs text-slate-400">e.g., https://myorg.youtrack.cloud</p>
              </div>
              <Button
                onClick={() => baseURL && setStep(2)}
                disabled={!baseURL}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Token */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Permanent Token</label>
                <Input
                  placeholder="Enter your YouTrack permanent token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="mt-2 text-xs text-slate-400">Create this in YouTrack settings under API Tokens</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Back
                </Button>
                <Button
                  onClick={validateConnection}
                  disabled={!token || isValidating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <label className="text-sm font-medium text-slate-300 block mb-3">Select Projects</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableProjects.map(project => (
                    <label key={project} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-800 transition">
                      <input
                        type="checkbox"
                        checked={projects.includes(project)}
                        onChange={() => toggleProject(project)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800"
                      />
                      <span className="text-sm text-slate-300">{project}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={projects.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                <label className="text-sm font-medium text-slate-300 block mb-3">Window Position</label>
                <select
                  value={windowPos}
                  onChange={(e) => setWindowPos(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300"
                >
                  {WINDOW_POSITIONS.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="text-sm text-green-400">
                    <p className="font-medium">Configuration Complete</p>
                    <p className="text-xs mt-1">Selected projects: {projects.join(', ')}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
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
