/**
 * Centralized theme constants and utilities
 * All color references should use CSS variables defined in index.css
 * This makes the UI easily adjustable by modifying CSS variables
 */

export const PRIORITY_COLORS: Record<string, string> = {
  'Show-stopper': 'hsl(var(--color-priority-show-stopper))',
  Critical: 'hsl(var(--color-priority-critical))',
  'High-priority': 'hsl(var(--color-priority-high-priority))',
  Major: 'hsl(var(--color-priority-major))',
  Normal: 'hsl(var(--color-priority-normal))',
  Minor: 'hsl(var(--color-priority-minor))',
  Planning: 'hsl(var(--color-priority-planning))',
  '': 'hsl(var(--color-text-secondary))',
}

export const PRIORITY_TAILWIND: Record<string, string> = {
  'Show-stopper': 'text-[hsl(var(--color-priority-show-stopper))]',
  Critical: 'text-[hsl(var(--color-priority-critical))]',
  'High-priority': 'text-[hsl(var(--color-priority-high-priority))]',
  Major: 'text-[hsl(var(--color-priority-major))]',
  Normal: 'text-[hsl(var(--color-priority-normal))]',
  Minor: 'text-[hsl(var(--color-priority-minor))]',
  Planning: 'text-[hsl(var(--color-priority-planning))]',
  '': 'text-[hsl(var(--color-text-secondary))]',
}

// Ticket Type colors and styling
export const TICKET_TYPE_COLORS: Record<string, string> = {
  Task: 'hsl(var(--color-type-task))',
  Epic: 'hsl(var(--color-type-epic))',
  Feature: 'hsl(var(--color-type-feature))',
  'User Story': 'hsl(var(--color-type-user-story))',
  'Sub-Task': 'hsl(var(--color-type-sub-task))',
  Spike: 'hsl(var(--color-type-spike))',
  NEW: 'hsl(var(--color-type-new))',
  'Bug (Blocking)': 'hsl(var(--color-type-bug-blocking))',
  'Bug (Non-blocking)': 'hsl(var(--color-type-bug-non-blocking))',
  Investigation: 'hsl(var(--color-type-investigation))',
}

export const TICKET_TYPE_TAILWIND: Record<string, { bg: string; text: string }> = {
  Task: {
    bg: 'bg-[hsl(var(--color-type-task)_/_20%)]',
    text: 'text-[hsl(var(--color-type-task))]',
  },
  Epic: {
    bg: 'bg-[hsl(var(--color-type-epic)_/_20%)]',
    text: 'text-[hsl(var(--color-type-epic))]',
  },
  Feature: {
    bg: 'bg-[hsl(var(--color-type-feature)_/_20%)]',
    text: 'text-[hsl(var(--color-type-feature))]',
  },
  'User Story': {
    bg: 'bg-[hsl(var(--color-type-user-story)_/_20%)]',
    text: 'text-[hsl(var(--color-type-user-story))]',
  },
  'Sub-Task': {
    bg: 'bg-[hsl(var(--color-type-sub-task)_/_20%)]',
    text: 'text-[hsl(var(--color-type-sub-task))]',
  },
  Spike: {
    bg: 'bg-[hsl(var(--color-type-spike)_/_20%)]',
    text: 'text-[hsl(var(--color-type-spike))]',
  },
  NEW: {
    bg: 'bg-[hsl(var(--color-type-new)_/_20%)]',
    text: 'text-[hsl(var(--color-type-new))]',
  },
  'Bug (Blocking)': {
    bg: 'bg-[hsl(var(--color-type-bug-blocking)_/_20%)]',
    text: 'text-[hsl(var(--color-type-bug-blocking))]',
  },
  'Bug (Non-blocking)': {
    bg: 'bg-[hsl(var(--color-type-bug-non-blocking)_/_20%)]',
    text: 'text-[hsl(var(--color-type-bug-non-blocking))]',
  },
  Investigation: {
    bg: 'bg-[hsl(var(--color-type-investigation)_/_20%)]',
    text: 'text-[hsl(var(--color-type-investigation))]',
  },
}

export const TICKET_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  Bug: {
    bg: 'bg-[hsl(10_86%_70%_/_15%)]',
    text: 'text-[hsl(var(--color-critical))]',
  },
  Feature: {
    bg: 'bg-[hsl(102_29%_47%_/_15%)]',
    text: 'text-[hsl(var(--color-normal))]',
  },
  Epic: {
    bg: 'bg-[hsl(37_100%_71%_/_15%)]',
    text: 'text-[hsl(var(--color-major))]',
  },
  'User Story': {
    bg: 'bg-[hsl(27_61%_50%_/_15%)]',
    text: 'text-[hsl(var(--color-high))]',
  },
}

export const THEME_COLORS = {
  // Backgrounds
  bgBase: 'hsl(var(--color-bg-base))',
  bgElevated: 'hsl(var(--color-bg-elevated))',
  bgSurface: 'hsl(var(--color-bg-surface))',
  bgHover: 'hsl(var(--color-bg-hover))',
  bgActive: 'hsl(var(--color-bg-active))',
  bgSelected: 'hsl(var(--color-bg-selected))',

  // Text
  textPrimary: 'hsl(var(--color-text-primary))',
  textSecondary: 'hsl(var(--color-text-secondary))',
  textMuted: 'hsl(var(--color-text-muted))',

  // UI Elements
  border: 'hsl(var(--color-border))',
  input: 'hsl(var(--color-input))',

  // Accents
  accent: 'hsl(var(--color-accent))',
  accentBright: 'hsl(var(--color-accent-bright))',

  // Priority Colors
  critical: 'hsl(var(--color-critical))',
  high: 'hsl(var(--color-high))',
  major: 'hsl(var(--color-major))',
  normal: 'hsl(var(--color-normal))',
}

export const THEME_TAILWIND = {
  // Backgrounds
  bgBase: 'bg-[hsl(var(--color-bg-base))]',
  bgElevated: 'bg-[hsl(var(--color-bg-elevated))]',
  bgSurface: 'bg-[hsl(var(--color-bg-surface))]',
  bgHover: 'bg-[hsl(var(--color-bg-hover))]',
  bgActive: 'bg-[hsl(var(--color-bg-active))]',
  bgSelected: 'bg-[hsl(var(--color-bg-selected))]',

  // Text
  textPrimary: 'text-[hsl(var(--color-text-primary))]',
  textSecondary: 'text-[hsl(var(--color-text-secondary))]',
  textMuted: 'text-[hsl(var(--color-text-muted))]',

  // Borders
  border: 'border-[hsl(var(--color-border))]',
  borderBottom: 'border-b border-[hsl(var(--color-border))]',
  borderTop: 'border-t border-[hsl(var(--color-border))]',
  divideY: 'divide-y divide-[hsl(var(--color-border))]',

  // Input
  input: 'bg-[hsl(var(--color-input))]',

  // Accents
  accent: 'text-[hsl(var(--color-accent-bright))]',
  accentBg: 'bg-[hsl(var(--color-accent))]',

  // Priority Colors
  critical: 'text-[hsl(var(--color-critical))]',
  high: 'text-[hsl(var(--color-high))]',
  major: 'text-[hsl(var(--color-major))]',
  normal: 'text-[hsl(var(--color-normal))]',
}

// Helper function to get priority badge classes
export const getPriorityBadgeClass = (priority?: string): string => {
  if (!priority) {
    return 'bg-[hsl(var(--color-text-secondary)_/_20%)] text-[hsl(var(--color-text-secondary))]'
  }

  const priorityBadgeMap: Record<string, string> = {
    'Show-stopper': 'bg-[hsl(var(--color-priority-show-stopper)_/_20%)] text-[hsl(var(--color-priority-show-stopper))]',
    Critical: 'bg-[hsl(var(--color-priority-critical)_/_20%)] text-[hsl(var(--color-priority-critical))]',
    'High-priority': 'bg-[hsl(var(--color-priority-high-priority)_/_20%)] text-[hsl(var(--color-priority-high-priority))]',
    Major: 'bg-[hsl(var(--color-priority-major)_/_20%)] text-[hsl(var(--color-priority-major))]',
    Normal: 'bg-[hsl(var(--color-priority-normal)_/_20%)] text-[hsl(var(--color-priority-normal))]',
    Minor: 'bg-[hsl(var(--color-priority-minor)_/_20%)] text-[hsl(var(--color-priority-minor))]',
    Planning: 'bg-[hsl(var(--color-priority-planning)_/_20%)] text-[hsl(var(--color-priority-planning))]',
  }

  return priorityBadgeMap[priority] || 'bg-[hsl(var(--color-text-secondary)_/_20%)] text-[hsl(var(--color-text-secondary))]'
}
