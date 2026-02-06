import React, { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "cmdk";
import { main } from 'wailsjs/go/models';
import { THEME_TAILWIND } from '@/utils/theme';

interface ProjectMultiSelectProps {
  projects: main.Project[];
  selectedProjects: string[];
  onSelectedProjectsChange: (selected: string[]) => void;
}

export function ProjectMultiSelect({ 
  projects, 
  selectedProjects, 
  onSelectedProjectsChange 
}: ProjectMultiSelectProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleUnselect = useCallback((shortName: string) => {
    onSelectedProjectsChange(selectedProjects.filter(s => s !== shortName));
  }, [selectedProjects, onSelectedProjectsChange]);

  const handleSelect = useCallback((shortName: string) => {
    if (!selectedProjects.includes(shortName)) {
      onSelectedProjectsChange([...selectedProjects, shortName]);
    }
    setInputValue("");
    setOpen(false);
  }, [selectedProjects, onSelectedProjectsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
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
    if (!inputValue) return true;
    
    const searchLower = inputValue.toLowerCase();
    return (
      project.shortName.toLowerCase().includes(searchLower) ||
      project.name.toLowerCase().includes(searchLower) ||
      project.id.toLowerCase().includes(searchLower)
    );
  }).filter(project => !selectedProjects.includes(project.shortName));

  // Get project display name
  const getProjectDisplayName = (shortName: string) => {
    const project = projects.find(p => p.shortName === shortName);
    return project ? `${project.shortName} — ${project.name}` : shortName;
  };

  return (
    <div className="space-y-2">
      <Command onKeyDown={handleKeyDown} className="overflow-visible">
        <div className={`
          group rounded-md border border-[hsl(var(--color-border))] 
          px-3 py-2 text-sm ring-offset-background 
          focus-within:ring-2 focus-within:ring-[hsl(var(--color-accent))] 
          focus-within:ring-offset-2 ${THEME_TAILWIND.bgSurface}
        `}>
          <div className="flex flex-wrap gap-1">
            {selectedProjects.map((shortName) => {
              const displayName = getProjectDisplayName(shortName);
              return (
                <div
                  key={shortName}
                  className={`
                    inline-flex items-center gap-1 rounded-full 
                    px-2 py-1 text-xs font-medium
                    ${THEME_TAILWIND.bgSelected} ${THEME_TAILWIND.textPrimary}
                    border border-[hsl(var(--color-border))]
                  `}
                >
                  <span className="truncate max-w-[200px]">{displayName}</span>
                  <button
                    type="button"
                    className={`
                      ml-1 rounded-full outline-none 
                      focus:ring-2 focus:ring-[hsl(var(--color-accent))] 
                      focus:ring-offset-2
                    `}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(shortName);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(shortName)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              placeholder={selectedProjects.length === 0 ? "Select projects..." : "Add more projects..."}
              className={`
                ml-2 flex-1 bg-transparent outline-none 
                placeholder-[hsl(var(--color-text-muted))]
                ${THEME_TAILWIND.textPrimary} min-w-[120px]
              `}
            />
          </div>
        </div>

        <div className="relative">
          <CommandList>
            {open && filteredProjects.length > 0 && (
              <div className={`
                absolute top-2 z-10 w-full rounded-md border 
                shadow-md outline-none animate-in fade-in-0 zoom-in-95
                ${THEME_TAILWIND.bgElevated} border-[hsl(var(--color-border))]
              `}>
                <CommandGroup className="max-h-60 overflow-auto">
                  {filteredProjects.map((project) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => handleSelect(project.shortName)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className={`
                        cursor-pointer px-3 py-2 text-sm
                        ${THEME_TAILWIND.textPrimary}
                        hover:${THEME_TAILWIND.bgHover}
                        aria-selected:${THEME_TAILWIND.bgSelected}
                      `}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{project.shortName} — {project.name}</span>
                        <span className={`text-xs ${THEME_TAILWIND.textSecondary}`}>
                          ID: {project.id}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            )}
          </CommandList>
        </div>
      </Command>

      <div className={`text-xs ${THEME_TAILWIND.textSecondary}`}>
        {selectedProjects.length === 0 
          ? 'No projects selected' 
          : `${selectedProjects.length} project${selectedProjects.length !== 1 ? 's' : ''} selected`
        }
      </div>
    </div>
  );
}