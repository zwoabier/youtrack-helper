import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import * as App from '../../wailsjs/go/app/App'

interface SetupWizardProps {
  onComplete: () => void
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [baseURL, setBaseURL] = useState('')
  const [token, setToken] = useState('')
  const [projects, setProjects] = useState<string[]>([])
  const [windowPos, setWindowPos] = useState('top-center')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')

      if (step === 1) {
        if (!baseURL) {
          setError('Base URL is required')
          return
        }
        setStep(2)
      } else if (step === 2) {
        if (!token) {
          setError('API Token is required')
          return
        }
        await App.SetAPIToken(token)
        setStep(3)
      } else if (step === 3) {
        if (projects.length === 0) {
          setError('Select at least one project')
          return
        }
        setStep(4)
      } else if (step === 4) {
        await App.SaveConfig(baseURL, projects, windowPos)
        onComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">YouTrack Helper</h1>
          <p className="text-slate-400">Step {step} of 4</p>
          <div className="mt-4 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Base URL */}
        {step === 1 && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              YouTrack Base URL
            </label>
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://myorg.youtrack.cloud"
              className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* Step 2: API Token */}
        {step === 2 && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              API Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your permanent token"
              className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* Step 3: Project Selection */}
        {step === 3 && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Projects to Track
            </label>
            <p className="text-sm text-slate-400 mb-3">Enter project keys (comma-separated)</p>
            <input
              type="text"
              value={projects.join(', ')}
              onChange={(e) => setProjects(e.target.value.split(',').map(p => p.trim()).filter(Boolean))}
              placeholder="e.g., AGV, DEV, INFRA"
              className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}

        {/* Step 4: Window Position */}
        {step === 4 && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Window Position
            </label>
            <select
              value={windowPos}
              onChange={(e) => setWindowPos(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-cyan-500 focus:outline-none"
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
              <option value="center">Center</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || loading}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {step === 4 ? 'Complete' : 'Next'}
            {step < 4 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
