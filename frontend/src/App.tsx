import React, { useEffect, useState, useRef } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { main } from 'wailsjs/go/models';
import { GetConfig, GetTickets, SyncTickets, HideWindow, ValidateYouTrackToken, SaveYouTrackToken, FetchProjects, SaveConfig, CopyToClipboard, OpenInBrowser } from 'wailsjs/go/main/App';

interface WindowPosition {
  label: string;
  value: string;
}

const WINDOW_POSITIONS: WindowPosition[] = [
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Center', value: 'top-center' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Center', value: 'center' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Center', value: 'bottom-center' },
  { label: 'Bottom Right', value: 'bottom-right' },
];

function App() {
  const [config, setConfig] = useState<main.Config | null>(null);
  const [tickets, setTickets] = useState<main.Ticket[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    async function init() {
      const currentConfig = await GetConfig();
      setConfig(currentConfig);

      if (currentConfig.base_url && currentConfig.projects.length > 0) {
        setIsConfigured(true);
        const cachedTickets = await GetTickets();
        setTickets(cachedTickets);
        // Start background sync
        SyncTickets();
      } else {
        setIsConfigured(false);
      }
    }
    init();
  }, []);

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen overflow-hidden dark">
      {isConfigured ? (
        <SearchInterface tickets={tickets} />
      ) : (
        <SetupWizard setConfig={setConfig} setIsConfigured={setIsConfigured} />
      )}
    </div>
  );
}

interface SearchInterfaceProps {
  tickets: main.Ticket[];
}

function SearchInterface({ tickets }: SearchInterfaceProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredTickets, setFilteredTickets] = useState<main.Ticket[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const lastSearchRef = useRef("");

  // Effect 1: Filter and rank tickets based on search query
  useEffect(() => {
    if (search.trim() === "") {
      // No search: show all tickets
      setFilteredTickets(tickets);
    } else {
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
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (search === "") {
        HideWindow();
      } else {
        setSearch("");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredTickets.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
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

  const handleTicketSelect = async (ticket: main.Ticket) => {
    const markdownLink = `[${ticket.id}](${ticket.url})`;
    await CopyToClipboard(markdownLink);
    HideWindow();
  };

  return (
    <CommandMenu>
      <CommandPrimitive.Input
        ref={inputRef}
        value={search}
        onValueChange={setSearch}
        placeholder="Search YouTrack tickets..."
        className="h-12 w-full border-none bg-transparent px-4 py-3 text-lg outline-none"
        autoFocus
      />
      <CommandPrimitive.List
        ref={resultsContainerRef}
        className="max-h-[300px] overflow-y-auto"
      >
        {filteredTickets.length === 0 ? (
          <CommandPrimitive.Empty>No results found.</CommandPrimitive.Empty>
        ) : (
          <div className="text-xs text-gray-500 px-4 py-2">
            Showing {filteredTickets.length} result{filteredTickets.length !== 1 ? "s" : ""}
          </div>
        )}
        {filteredTickets.map((ticket, index) => (
          <div
            key={ticket.id}
            ref={index === selectedIndex ? selectedItemRef : null}
            onClick={() => handleTicketSelect(ticket)}
            className={cn(
              "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:bg-opacity-50"
            )}
          >
            <div className="flex flex-col flex-grow group">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-400 w-24 flex-shrink-0">
                  {ticket.id}
                </span>
                <span className="flex-grow truncate text-white">
                  {ticket.summary}
                </span>
                <span
                  className={cn(
                    "ml-4 text-right flex-shrink-0",
                    ticket.priority === "Critical" && "text-red-500",
                    ticket.priority === "Major" && "text-yellow-500",
                    ticket.priority === "Minor" && "text-gray-500"
                  )}
                >
                  {ticket.priority}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span className="text-gray-500">{ticket.type}</span>
                <div className="flex space-x-1">
                  {ticket.sprints && ticket.sprints.length > 0
                    ? ticket.sprints.map((sprint: string) => (
                        <span
                          key={sprint}
                          className="px-2 py-0.5 border border-gray-500 rounded-full text-xs"
                        >
                          {sprint}
                        </span>
                      ))
                    : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CommandPrimitive.List>
    </CommandMenu>
  );
}

interface SetupWizardProps {
  setConfig: (config: main.Config) => void;
  setIsConfigured: (isConfigured: boolean) => void;
}

function SetupWizard({ setConfig, setIsConfigured }: SetupWizardProps) {
  const [baseURL, setBaseURL] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [windowPos, setWindowPos] = useState("Center");
  const [error, setError] = useState<string | null>(null);

  const handleValidateAndSaveToken = async () => {
    try {
      const isValid = await ValidateYouTrackToken(baseURL, token);
      if (isValid) {
        await SaveYouTrackToken(token);
        setStep(2);
        setError(null);
        const fetchedProjects = await FetchProjects(baseURL, token);
        // fetchedProjects is an array of project objects; store shortName values
        setProjects(fetchedProjects.map((p: main.Project) => p.shortName));
      } else {
        setError("Invalid YouTrack Base URL or Token.");
      }
    } catch (e: unknown) {
      const message =
        typeof e === "string"
          ? e
          : e instanceof Error
            ? e.message
            : (e as { message?: string })?.message ??
              (e as { Message?: string })?.Message ??
              (e != null ? String(e) : "Unknown error");
      setError(message);
    }
  };

  const handleSaveConfig = async () => {
    const newConfig: main.Config = {
      base_url: baseURL,
      projects: selectedProjects,
      window_pos: windowPos,
      last_sync_time: 0,
      log_level: "info",
      log_to_file: false,
    };
    await SaveConfig(newConfig);
    setConfig(newConfig);
    setIsConfigured(true);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Setup Wizard</h1>
      {error && <p className="text-red-500 mb-4 p-3 bg-red-900 rounded">{error}</p>}

      {step === 1 && (
        <div className="flex-1 flex flex-col max-w-md">
          <h2 className="text-xl mb-4">Step 1: YouTrack Configuration</h2>
          <input
            type="text"
            placeholder="YouTrack Base URL (e.g., https://myorg.youtrack.cloud)"
            className="w-full p-3 mb-3 bg-gray-700 rounded text-white"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
          />
          <input
            type="password"
            placeholder="Permanent Token"
            className="w-full p-3 mb-4 bg-gray-700 rounded text-white"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button onClick={handleValidateAndSaveToken}>Next</Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl mb-4">Step 2: Project Selection</h2>
          <div className="mb-4 p-3 bg-gray-700 rounded text-sm">
            {selectedProjects.length === 0
              ? 'No projects selected'
              : `${selectedProjects.length} project(s) selected: ${selectedProjects.join(', ')}`}
          </div>
          <div className="bg-gray-700 rounded p-4 mb-4 overflow-y-auto max-h-64 flex-1">
            {projects.length === 0 ? (
              <p className="text-gray-400">No projects available</p>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <label key={project} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProjects([...selectedProjects, project])
                        } else {
                          setSelectedProjects(
                            selectedProjects.filter((p) => p !== project)
                          )
                        }
                      }}
                      className="mr-3"
                    />
                    <span>{project}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <Button onClick={() => setStep(3)}>Next</Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl mb-4">Step 3: Window Position</h2>
          <div className="bg-gray-700 rounded p-4 mb-4 flex-1">
            <div className="space-y-3">
              {[
                { label: 'Top Left', value: 'Top Left' },
                { label: 'Top Center', value: 'Top Center' },
                { label: 'Top Right', value: 'Top Right' },
                { label: 'Center', value: 'Center' },
                { label: 'Bottom Left', value: 'Bottom Left' },
                { label: 'Bottom Center', value: 'Bottom Center' },
                { label: 'Bottom Right', value: 'Bottom Right' },
              ].map((pos) => (
                <label key={pos.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="windowPos"
                    checked={windowPos === pos.value}
                    onChange={() => setWindowPos(pos.value)}
                    className="mr-3"
                  />
                  <span>{pos.label}</span>
                </label>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveConfig}>Finish Setup</Button>
        </div>
      )}
    </div>
  );
}

interface CommandMenuProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {}

const CommandMenu = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, CommandMenuProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  )
);
CommandMenu.displayName = CommandPrimitive.displayName;

export default App;
