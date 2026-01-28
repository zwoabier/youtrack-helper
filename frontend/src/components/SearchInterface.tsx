import { useEffect, useState, useRef } from 'react'
import { Command } from 'cmdk'
import { Search, Copy, ExternalLink } from 'lucide-react'
import { TicketItem } from './TicketItem'
import * as App from '../../wailsjs/go/app/App'

interface SearchInterfaceProps {
  onReconfigure: () => void
}

export function SearchInterface({ onReconfigure }: SearchInterfaceProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [filteredTickets, setFilteredTickets] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTickets()
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredTickets(tickets)
    } else {
      const query = search.toLowerCase()
      const filtered = tickets.filter(t =>
        t.id.toLowerCase().includes(query) ||
        t.summary.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query)
      )
      setFilteredTickets(filtered)
    }
    setSelectedIndex(0)
  }, [search, tickets])

  const loadTickets = async () => {
    try {
      const items = await App.GetTickets()
      setTickets(items || [])
      setFilteredTickets(items || [])
    } catch (error) {
      console.error('Failed to load tickets:', error)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (search) {
        setSearch('')
      } else {
        App.HideWindow()
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(0, prev - 1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(filteredTickets.length - 1, prev + 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredTickets[selectedIndex]) {
        if (e.shiftKey || e.ctrlKey) {
          App.OpenInBrowser(filteredTickets[selectedIndex].url)
        } else {
          App.CopyToClipboard(filteredTickets[selectedIndex].url)
        }
        App.HideWindow()
      }
    }
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2">
          <Search size={20} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="flex-1 bg-transparent outline-none text-white placeholder-slate-500"
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No tickets found
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredTickets.map((ticket, index) => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                isSelected={index === selectedIndex}
                onSelect={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 space-y-1">
        <div>Enter - Copy URL | Shift+Enter - Open in Browser | Esc - Close</div>
      </div>
    </div>
  )
}
