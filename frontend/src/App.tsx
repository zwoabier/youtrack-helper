import { useEffect, useState } from 'react'
import { SetupWizard } from './components/SetupWizard'
import { SearchInterface } from './components/SearchInterface'
import * as App from '../wailsjs/go/app/App'

export default function AppComponent() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConfiguration()
  }, [])

  const checkConfiguration = async () => {
    try {
      const status = await App.GetConfigStatus()
      setIsConfigured(status.status === 'ready')
    } catch (error) {
      console.error('Failed to check config:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return isConfigured ? (
    <SearchInterface onReconfigure={() => setIsConfigured(false)} />
  ) : (
    <SetupWizard onComplete={() => setIsConfigured(true)} />
  )
}
