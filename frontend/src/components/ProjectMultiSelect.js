import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "cmdk";
import { THEME_TAILWIND } from '@/utils/theme';
export function ProjectMultiSelect({ projects, selectedProjects, onSelectedProjectsChange }) {
    const inputRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const handleUnselect = useCallback((shortName) => {
        onSelectedProjectsChange(selectedProjects.filter(s => s !== shortName));
    }, [selectedProjects, onSelectedProjectsChange]);
    const handleSelect = useCallback((shortName) => {
        if (!selectedProjects.includes(shortName)) {
            onSelectedProjectsChange([...selectedProjects, shortName]);
        }
        setInputValue("");
        setOpen(false);
    }, [selectedProjects, onSelectedProjectsChange]);
    const handleKeyDown = useCallback((e) => {
        const input = inputRef.current;
        if (input) {
            if ((e.key === "Delete" || e.key === "Backspace") && input.value === "") {
                onSelectedProjectsChange(selectedProjects.slice(0, -1));
            }
            if (e.key === "Escape") {
                input.blur();
                setOpen(false);
            }
        }
    }, [selectedProjects, onSelectedProjectsChange]);
    // Filter projects based on search input
    const filteredProjects = projects.filter(project => {
        if (!inputValue)
            return true;
        const searchLower = inputValue.toLowerCase();
        return (project.shortName.toLowerCase().includes(searchLower) ||
            project.name.toLowerCase().includes(searchLower) ||
            project.id.toLowerCase().includes(searchLower));
    }).filter(project => !selectedProjects.includes(project.shortName));
    // Get project display name
    const getProjectDisplayName = (shortName) => {
        const project = projects.find(p => p.shortName === shortName);
        return project ? `${project.shortName} — ${project.name}` : shortName;
    };
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs(Command, { onKeyDown: handleKeyDown, className: "overflow-visible", children: [_jsx("div", { className: `
          group rounded-md border border-[hsl(var(--color-border))] 
          px-3 py-2 text-sm ring-offset-background 
          focus-within:ring-2 focus-within:ring-[hsl(var(--color-accent))] 
          focus-within:ring-offset-2 ${THEME_TAILWIND.bgSurface}
        `, children: _jsxs("div", { className: "flex flex-wrap gap-1", children: [selectedProjects.map((shortName) => {
                                    const displayName = getProjectDisplayName(shortName);
                                    return (_jsxs("div", { className: `
                    inline-flex items-center gap-1 rounded-full 
                    px-2 py-1 text-xs font-medium
                    ${THEME_TAILWIND.bgSelected} ${THEME_TAILWIND.textPrimary}
                    border border-[hsl(var(--color-border))]
                  `, children: [_jsx("span", { className: "truncate max-w-[200px]", children: displayName }), _jsx("button", { type: "button", className: `
                      ml-1 rounded-full outline-none 
                      focus:ring-2 focus:ring-[hsl(var(--color-accent))] 
                      focus:ring-offset-2
                    `, onKeyDown: (e) => {
                                                    if (e.key === "Enter") {
                                                        handleUnselect(shortName);
                                                    }
                                                }, onMouseDown: (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }, onClick: () => handleUnselect(shortName), children: _jsx(X, { className: "h-3 w-3" }) })] }, shortName));
                                }), _jsx("input", { ref: inputRef, value: inputValue, onChange: (e) => setInputValue(e.target.value), onFocus: () => setOpen(true), onBlur: () => setTimeout(() => setOpen(false), 200), placeholder: selectedProjects.length === 0 ? "Select projects..." : "Add more projects...", className: `
                ml-2 flex-1 bg-transparent outline-none 
                placeholder-[hsl(var(--color-text-muted))]
                ${THEME_TAILWIND.textPrimary} min-w-[120px]
              ` })] }) }), _jsx("div", { className: "relative", children: _jsx(CommandList, { children: open && filteredProjects.length > 0 && (_jsx("div", { className: `
                absolute top-2 z-10 w-full rounded-md border 
                shadow-md outline-none animate-in fade-in-0 zoom-in-95
                ${THEME_TAILWIND.bgElevated} border-[hsl(var(--color-border))]
              `, children: _jsx(CommandGroup, { className: "max-h-60 overflow-auto", children: filteredProjects.map((project) => (_jsx(CommandItem, { onSelect: () => handleSelect(project.shortName), onMouseDown: (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }, className: `
                        cursor-pointer px-3 py-2 text-sm
                        ${THEME_TAILWIND.textPrimary}
                        hover:${THEME_TAILWIND.bgHover}
                        aria-selected:${THEME_TAILWIND.bgSelected}
                      `, children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: "font-medium", children: [project.shortName, " \u2014 ", project.name] }), _jsxs("span", { className: `text-xs ${THEME_TAILWIND.textSecondary}`, children: ["ID: ", project.id] })] }) }, project.id))) }) })) }) })] }), _jsx("div", { className: `text-xs ${THEME_TAILWIND.textSecondary}`, children: selectedProjects.length === 0
                    ? 'No projects selected'
                    : `${selectedProjects.length} project${selectedProjects.length !== 1 ? 's' : ''} selected` })] }));
}
