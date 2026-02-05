import { useEffect, useState, useRef } from 'react'
import { Command } from 'cmdk'
import { Search, Copy, ExternalLink } from 'lucide-react'
import { TicketItem } from './TicketItem'
import { GetTickets, HideWindow, OpenInBrowser, CopyToClipboard } from '../../wailsjs/go/main/App'

interface SearchInterfaceProps {
  onReconfigure: () => void
}

export function SearchInterface({ onReconfigure }: SearchInterfaceProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [filteredTickets, setFilteredTickets] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedItemRef = useRef<HTMLDivElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (search) {
        setSearch('')
      } else {
        HideWindow()
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
          OpenInBrowser(filteredTickets[selectedIndex].url)
        } else {
          const ticket = filteredTickets[selectedIndex]
          const markdownLink = `[${ticket.id}](${ticket.url})`
          CopyToClipboard(markdownLink)
        }
        HideWindow()
      }
    }
  }

  useEffect(() => {
    loadTickets()
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  /**
   * Search and Sort Effect
   * 
   * EMPTY SEARCH BEHAVIOR:
   * - When search bar is empty, tickets are sorted by ID in descending order (newest first)
   * - Example: AGV-920, AGV-919, AGV-918... (higher numbers first)
   * 
   * SEARCH BEHAVIOR WITH RELEVANCE SCORING:
   * When user types in the search bar, results are filtered and ranked by relevance score.
   * Each ticket receives a relevance score based on which fields match the query:
   * 
   * RELEVANCE SCORING SYSTEM:
   * - ID exact match: 1000 points (e.g., searching "AGV-910" finds exact ticket)
   * - ID starts with query: 800 points (e.g., searching "AGV-9" matches "AGV-910")
   * - ID contains query: 600 points (e.g., searching "910" matches "AGV-910")
   * - Summary match: 400 points (ticket title/description contains query)
   * - Type match: 200 points (e.g., "User Story", "Epic" contains query)
   * - Priority match: 100 points (e.g., "Critical", "Major" contains query)
   * - Sprints match: 100 points (e.g., "AGV_Sprint_22" contains query)
   * 
   * Results with score > 0 are displayed, sorted by score descending (best matches first).
   * If multiple fields match, scores are cumulative (e.g., ID + Summary match = higher score).
   */
  useEffect(() => {
    let processed = [...tickets]

    if (search.trim() === '') {
      // Sort by ID descending (newest first) when search is empty
      processed.sort((a, b) => {
        const idA = a.id
        const idB = b.id
        // Extract numeric part from ID (e.g., "AGV-910" → 910)
        const numA = parseInt(idA.split('-')[1] || '0', 10)
        const numB = parseInt(idB.split('-')[1] || '0', 10)
        return numB - numA // Descending: higher numbers first
      })
      setFilteredTickets(processed)
    } else {
      const query = search.toLowerCase()

      // Filter and score all tickets
      const filtered = tickets
        .map((t) => {
          let relevanceScore = 0

          // ID matching (highest priority - most specific field)
          if (t.id.toLowerCase() === query) {
            relevanceScore += 1000 // Exact match
          } else if (t.id.toLowerCase().startsWith(query)) {
            relevanceScore += 800 // Starts with query (e.g., "AGV-9" matches "AGV-910")
          } else if (t.id.toLowerCase().includes(query)) {
            relevanceScore += 600 // Contains query anywhere (e.g., "910" matches "AGV-910")
          }

          // Summary/title matching (high priority)
          if (t.summary && t.summary.toLowerCase().includes(query)) {
            relevanceScore += 400
          }

          // Type matching (medium priority)
          if (t.type && t.type.toLowerCase().includes(query)) {
            relevanceScore += 200
          }

          // Priority matching (lower priority)
          if (t.priority && t.priority.toLowerCase().includes(query)) {
            relevanceScore += 100
          }

          // Sprints matching (lower priority)
          if (t.sprints && t.sprints.some((s: string) => s.toLowerCase().includes(query))) {
            relevanceScore += 100
          }

          return { ticket: t, score: relevanceScore }
        })
        .filter((item) => item.score > 0) // Only include tickets with at least one match
        .sort((a, b) => b.score - a.score) // Sort by relevance score (highest first)
        .map((item) => item.ticket) // Extract ticket objects

      setFilteredTickets(filtered)
    }

    setSelectedIndex(0)
  }, [search, tickets])

  // Scroll to top when search changes or results update
  // This runs AFTER the component re-renders with new filteredTickets
  useEffect(() => {
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollTop = 0
    }
  }, [search, filteredTickets])

  // Scroll selected item into view when arrow keys change selection
  // This only runs when selectedIndex changes (not when search changes)
  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedIndex])

  // Debug: report filteredTickets changes to ingest endpoint and console
  useEffect(() => {
    try {
      console.log('filteredTickets updated', filteredTickets.length)
      fetch('http://127.0.0.1:7242/ingest/f9cf7c51-4fcd-40aa-bdf5-3e8d3c5f549f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'frontend/src/components/SearchInterface.tsx:filteredTicketsEffect',
          message: 'filtered_tickets_update',
          data: { count: filteredTickets.length, search },
          timestamp: Date.now(),
          sessionId: 'debug-session'
        })
      }).catch(()=>{})
    } catch (e) {
      // ignore
    }
  }, [filteredTickets, search])

  const loadTickets = async () => {
    try {
      const items = await GetTickets()
      setTickets(items || [])
      setFilteredTickets(items || [])
      try {
        // Call backend to record that frontend received tickets
        // @ts-ignore - generated binding will appear after wails rebuild
        if ((window as any).go && (window as any).go.main && (window as any).go.main.App && (window as any).go.main.App.FrontendLog) {
          const sample = (items || []).slice(0, 5).map((t: any) => t.id)
          await (window as any).go.main.App.FrontendLog('frontend_received_tickets', { count: (items || []).length, sample })
        }
      } catch (e) {
        // ignore
      }
      // Debug: send NDJSON-style log to ingest endpoint
      try {
        const sample = (items || []).slice(0, 5).map((t: any) => t.id)
        fetch('http://127.0.0.1:7242/ingest/f9cf7c51-4fcd-40aa-bdf5-3e8d3c5f549f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'frontend/src/components/SearchInterface.tsx:loadTickets',
            message: 'load_tickets',
            data: { count: (items || []).length, sample },
            timestamp: Date.now(),
            sessionId: 'debug-session'
          })
        }).catch(()=>{})
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.error('Failed to load tickets:', error)
      try {
        fetch('http://127.0.0.1:7242/ingest/f9cf7c51-4fcd-40aa-bdf5-3e8d3c5f549f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'frontend/src/components/SearchInterface.tsx:loadTickets',
            message: 'load_tickets_error',
            data: { error: String(error) },
            timestamp: Date.now(),
            sessionId: 'debug-session'
          })
        }).catch(()=>{})
      } catch (e) {}
    }
  }

  const MAX_RENDER = 50
  const displayedTickets = filteredTickets.slice(0, MAX_RENDER)

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
            onKeyDown={(e) => {
              try {
                if ((window as any).go && (window as any).go.main && (window as any).go.main.App && (window as any).go.main.App.FrontendLog) {
                  ;(window as any).go.main.App.FrontendLog('input_keydown', { key: e.key })
                }
              } catch (err) {}
            }}
            placeholder="Search tickets..."
            className="flex-1 bg-transparent outline-none text-white placeholder-slate-500"
            autoFocus
          />
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Tickets: {tickets.length} • Filtered: {filteredTickets.length} • Sample: {filteredTickets.slice(0,5).map(t=>t.id).join(', ')}
        </div>
      </div>

      <div ref={resultsContainerRef} className="flex-1 overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            No tickets found
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {displayedTickets.map((ticket, index) => (
              <TicketItem
                key={ticket.id}
                ticket={ticket}
                isSelected={index === selectedIndex}
                onSelect={() => setSelectedIndex(index)}
                ref={index === selectedIndex ? selectedItemRef : undefined}
              />
            ))}
            {filteredTickets.length > MAX_RENDER && (
              <div className="p-4 text-center text-sm text-slate-400">
                Showing first {MAX_RENDER} of {filteredTickets.length} results
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 space-y-1">
        <div>Enter - Copy URL | Shift+Enter - Open in Browser | Esc - Close</div>
      </div>
    </div>
  )
}
