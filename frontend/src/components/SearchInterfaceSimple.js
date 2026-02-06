import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search } from 'lucide-react';
import { HideWindow, CopyToClipboard } from 'wailsjs/go/main/App';
import { THEME_TAILWIND, TICKET_TYPE_TAILWIND, getPriorityBadgeClass } from '@/utils/theme';
export function SearchInterfaceSimple({ tickets }) {
    const [search, setSearch] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const inputRef = useRef(null);
    const selectedItemRef = useRef(null);
    const resultsContainerRef = useRef(null);
    const lastSearchRef = useRef("");
    // Effect 1: Filter and rank tickets based on search query
    useEffect(() => {
        if (search.trim() === "") {
            // No search: show all tickets
            setFilteredTickets(tickets);
        }
        else {
            // Calculate relevance scores for each ticket
            const searchLower = search.toLowerCase();
            const scored = tickets.map((ticket) => {
                let score = 0;
                // ID exact match: 1000 points
                if (ticket.id.toLowerCase() === searchLower) {
                    score += 1000;
                }
                // ID starts with query: 800 points
                else if (ticket.id.toLowerCase().startsWith(searchLower)) {
                    score += 800;
                }
                // ID contains query: 600 points
                else if (ticket.id.toLowerCase().includes(searchLower)) {
                    score += 600;
                }
                // Summary contains query: 400 points
                if (ticket.summary.toLowerCase().includes(searchLower)) {
                    score += 400;
                }
                // Type contains query: 200 points
                if (ticket.type && ticket.type.toLowerCase().includes(searchLower)) {
                    score += 200;
                }
                // Priority contains query: 100 points
                if (ticket.priority && ticket.priority.toLowerCase().includes(searchLower)) {
                    score += 100;
                }
                // Sprints contain query: 100 points
                if (ticket.sprints && ticket.sprints.some(s => s.toLowerCase().includes(searchLower))) {
                    score += 100;
                }
                return { ticket, score };
            });
            // Filter out zero-score results and sort by score descending
            const filtered = scored
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(item => item.ticket);
            setFilteredTickets(filtered);
        }
    }, [search, tickets]);
    // Effect 2: Reset selection and scroll to top when search query changes
    useEffect(() => {
        if (search !== lastSearchRef.current) {
            setSelectedIndex(0);
            // Scroll container to top
            if (resultsContainerRef.current) {
                resultsContainerRef.current.scrollTop = 0;
            }
            lastSearchRef.current = search;
        }
    }, [search]);
    // Effect 3: Scroll selected item into view
    useEffect(() => {
        if (selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [selectedIndex, filteredTickets]);
    // Keyboard navigation handler
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            if (search === "") {
                HideWindow();
            }
            else {
                setSearch("");
            }
        }
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => prev < filteredTickets.length - 1 ? prev + 1 : prev);
        }
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredTickets[selectedIndex]) {
                const ticket = filteredTickets[selectedIndex];
                const markdownLink = `[${ticket.id}](${ticket.url})`;
                CopyToClipboard(markdownLink);
                HideWindow();
            }
        }
    };
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [search, filteredTickets, selectedIndex]);
    const handleTicketSelect = async (ticket) => {
        const markdownLink = `[${ticket.id}](${ticket.url})`;
        await CopyToClipboard(markdownLink);
        HideWindow();
    };
    return (_jsxs("div", { className: `h-screen w-screen ${THEME_TAILWIND.bgBase} flex flex-col overflow-hidden`, children: [_jsx("div", { className: `p-4 ${THEME_TAILWIND.borderBottom}`, children: _jsxs("div", { className: `flex items-center gap-2 ${THEME_TAILWIND.bgSurface} rounded-lg px-3 py-2 border border-[hsl(var(--color-border))]`, children: [_jsx(Search, { size: 18, className: THEME_TAILWIND.textSecondary }), _jsx("input", { ref: inputRef, type: "text", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search tickets...", className: `flex-1 ${THEME_TAILWIND.bgSurface} outline-none ${THEME_TAILWIND.textPrimary} placeholder-[hsl(var(--color-text-muted))]`, autoFocus: true })] }) }), _jsx("div", { ref: resultsContainerRef, className: "flex-1 overflow-y-auto", children: filteredTickets.length === 0 ? (_jsx("div", { className: `flex items-center justify-center h-full ${THEME_TAILWIND.textSecondary} p-4`, children: "No tickets found" })) : (_jsx("div", { children: filteredTickets.map((ticket, index) => (_jsxs("div", { ref: index === selectedIndex ? selectedItemRef : null, onClick: () => handleTicketSelect(ticket), className: cn(`px-4 py-3 cursor-pointer transition-colors border-l-3 border-l-transparent`, index === selectedIndex
                            ? `${THEME_TAILWIND.bgSelected} border-l-[hsl(var(--color-accent-bright))]`
                            : `hover:${THEME_TAILWIND.bgHover}`), children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("span", { className: `font-bold min-w-fit ${THEME_TAILWIND.accent}`, children: ticket.id }), _jsx("span", { className: cn('inline-block px-2 py-1 rounded text-xs font-medium', ticket.type && TICKET_TYPE_TAILWIND[ticket.type]
                                            ? `${TICKET_TYPE_TAILWIND[ticket.type]?.bg} ${TICKET_TYPE_TAILWIND[ticket.type]?.text}`
                                            : 'bg-[hsl(var(--color-text-secondary)_/_20%)] text-[hsl(var(--color-text-secondary))]'), children: ticket.type || 'Unknown' }), _jsx("span", { className: cn('inline-block px-2 py-1 rounded text-xs font-medium ml-auto', getPriorityBadgeClass(ticket.priority)), children: ticket.priority || '—' })] }), _jsx("div", { className: "mb-2", children: _jsx("p", { className: `${THEME_TAILWIND.textPrimary} text-sm leading-5`, children: ticket.summary }) }), ticket.sprints && ticket.sprints.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: ticket.sprints.map((sprint) => (_jsx("span", { className: `inline-block px-2 py-1 border border-[hsl(var(--color-border))] rounded text-xs ${THEME_TAILWIND.textSecondary}`, children: sprint }, sprint))) }))] }, ticket.id))) })) }), _jsx("div", { className: `p-3 border-t border-[hsl(var(--color-border))] text-xs ${THEME_TAILWIND.textSecondary} space-y-1`, children: _jsx("div", { children: "Enter - Copy URL | Shift+Enter - Open in Browser | Esc - Close" }) })] }));
}
