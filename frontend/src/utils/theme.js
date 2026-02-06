/**
 * Centralized theme constants and utilities
 * All color references should use CSS variables defined in index.css
 * This makes the UI easily adjustable by modifying CSS variables
 */
export const PRIORITY_COLORS = {
    Critical: 'hsl(var(--color-critical))',
    High: 'hsl(var(--color-high))',
    Major: 'hsl(var(--color-major))',
    Medium: 'hsl(var(--color-major))',
    Normal: 'hsl(var(--color-normal))',
    Low: 'hsl(var(--color-normal))',
    '': 'hsl(var(--color-text-secondary))',
};
export const PRIORITY_TAILWIND = {
    Critical: 'text-[hsl(var(--color-critical))]',
    High: 'text-[hsl(var(--color-high))]',
    Major: 'text-[hsl(var(--color-major))]',
    Medium: 'text-[hsl(var(--color-major))]',
    Normal: 'text-[hsl(var(--color-normal))]',
    Low: 'text-[hsl(var(--color-normal))]',
    '': 'text-[hsl(var(--color-text-secondary))]',
};
export const TICKET_TYPE_STYLES = {
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
};
export const THEME_COLORS = {
    // Backgrounds
    bgBase: 'hsl(var(--color-bg-base))',
    bgElevated: 'hsl(var(--color-bg-elevated))',
    bgSurface: 'hsl(var(--color-bg-surface))',
    bgHover: 'hsl(var(--color-bg-hover))',
    bgActive: 'hsl(var(--color-bg-active))',
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
};
export const THEME_TAILWIND = {
    // Backgrounds
    bgBase: 'bg-[hsl(var(--color-bg-base))]',
    bgElevated: 'bg-[hsl(var(--color-bg-elevated))]',
    bgSurface: 'bg-[hsl(var(--color-bg-surface))]',
    bgHover: 'bg-[hsl(var(--color-bg-hover))]',
    bgActive: 'bg-[hsl(var(--color-bg-active))]',
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
};
