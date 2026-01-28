import clsx from 'clsx'

interface TicketItemProps {
  ticket: any
  isSelected: boolean
  onSelect: () => void
}

const priorityColors: Record<string, string> = {
  Critical: 'text-red-400',
  High: 'text-orange-400',
  Medium: 'text-yellow-400',
  Low: 'text-green-400',
  '': 'text-slate-400',
}

export function TicketItem({ ticket, isSelected, onSelect }: TicketItemProps) {
  return (
    <div
      onClick={onSelect}
      className={clsx(
        'px-4 py-3 cursor-pointer transition-colors',
        isSelected ? 'bg-slate-800' : 'hover:bg-slate-900'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="font-bold text-cyan-400 min-w-fit">{ticket.id}</span>
        <span className="text-white flex-1 truncate">{ticket.summary}</span>
        <span className={clsx('font-medium text-sm', priorityColors[ticket.priority] || priorityColors[''])}>
          {ticket.priority || '-'}
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-400 text-sm">
        <span className="min-w-fit">{ticket.type || 'Unknown'}</span>
        <div className="flex-1" />
        {ticket.sprints && ticket.sprints.length > 0 && (
          <div className="flex gap-2">
            {ticket.sprints.map((sprint: string) => (
              <span key={sprint} className="px-2 py-1 border border-slate-600 rounded-full text-xs">
                {sprint}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
