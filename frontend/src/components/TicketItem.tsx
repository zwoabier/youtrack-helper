import { forwardRef } from 'react'
import clsx from 'clsx'
import { PRIORITY_TAILWIND, TICKET_TYPE_STYLES, THEME_TAILWIND } from '@/utils/theme'

interface TicketItemProps {
  ticket: any
  isSelected: boolean
  onSelect: () => void
}

export const TicketItem = forwardRef<HTMLDivElement, TicketItemProps>(
  function TicketItem({ ticket, isSelected, onSelect }, ref) {
    return (
      <div
        ref={ref}
        onClick={onSelect}
        className={clsx(
          'px-4 py-3 cursor-pointer transition-colors border-l-3 border-l-transparent',
          isSelected ? `${THEME_TAILWIND.bgHover} border-l-[hsl(var(--color-accent-bright))]` : `hover:${THEME_TAILWIND.bgHover}`
        )}
      >
      <div className="flex items-center gap-3 mb-2">
        <span className={clsx('font-bold min-w-fit', THEME_TAILWIND.accent)}>{ticket.id}</span>
        <span className={clsx('flex-1 truncate', THEME_TAILWIND.textPrimary)}>{ticket.summary}</span>
        <span className={clsx('font-medium text-sm', PRIORITY_TAILWIND[ticket.priority] || PRIORITY_TAILWIND[''])}>
          {ticket.priority || '-'}
        </span>
      </div>
      <div className={clsx('flex items-center gap-3 text-sm', THEME_TAILWIND.textSecondary)}>
        <span className="min-w-fit">{ticket.type || 'Unknown'}</span>
        <div className="flex-1" />
        {ticket.sprints && ticket.sprints.length > 0 && (
          <div className="flex gap-2">
            {ticket.sprints.map((sprint: string) => (
              <span key={sprint} className={clsx('px-2 py-1 border rounded-full text-xs', THEME_TAILWIND.border, THEME_TAILWIND.textSecondary)}>
                {sprint}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
)
