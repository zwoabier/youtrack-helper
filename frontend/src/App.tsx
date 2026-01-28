import React, { useEffect, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Config {
  BaseURL: string;
  Projects: string[];
  WindowPos: string;
  LastSyncTime: number;
}

interface Ticket {
  ID: string;
  Summary: string;
  Type: string;
  Priority: string;
  Sprints: string[];
  Url: string;
}

function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    async function init() {
      const currentConfig = await window.go.main.GetConfig();
      setConfig(currentConfig);

      if (currentConfig.BaseURL && currentConfig.Projects.length > 0) {
        setIsConfigured(true);
        const cachedTickets = await window.go.main.GetTickets();
        setTickets(cachedTickets);
        // Start background sync
        window.go.main.SyncTickets();
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
  tickets: Ticket[];
}

function SearchInterface({ tickets }: SearchInterfaceProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (search === "") {
          window.go.main.HideWindow();
        } else {
          setSearch("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [search]);

  return (
    <CommandMenu>
      <CommandPrimitive.Input
        value={search}
        onValueChange={setSearch}
        placeholder="Search YouTrack tickets..."
        className="h-12 w-full border-none bg-transparent px-4 py-3 text-lg outline-none"
        autoFocus
      />
      <CommandPrimitive.List className="max-h-[300px] overflow-y-auto">
        <CommandPrimitive.Empty>No results found.</CommandPrimitive.Empty>
        {tickets.map((ticket) => (
          <TicketItem key={ticket.ID} ticket={ticket} />
        ))}
      </CommandPrimitive.List>
    </CommandMenu>
  );
}

interface SetupWizardProps {
  setConfig: (config: Config) => void;
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
      const isValid = await window.go.main.ValidateYouTrackToken(baseURL, token);
      if (isValid) {
        await window.go.main.SaveYouTrackToken(token);
        setStep(2);
        setError(null);
        const fetchedProjects = await window.go.main.FetchProjects(baseURL, token);
        setProjects(fetchedProjects);
      } else {
        setError("Invalid YouTrack Base URL or Token.");
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleSaveConfig = async () => {
    const newConfig: Config = {
      BaseURL: baseURL,
      Projects: selectedProjects,
      WindowPos: windowPos,
      LastSyncTime: 0,
    };
    await window.go.main.SaveConfig(newConfig);
    setConfig(newConfig);
    setIsConfigured(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Setup Wizard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {step === 1 && (
        <div>
          <h2 className="text-xl mb-2">Step 1: YouTrack Configuration</h2>
          <input
            type="text"
            placeholder="YouTrack Base URL (e.g., https://myorg.youtrack.cloud)"
            className="w-full p-2 mb-2 bg-gray-700 rounded"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
          />
          <input
            type="password"
            placeholder="Permanent Token"
            className="w-full p-2 mb-4 bg-gray-700 rounded"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button onClick={handleValidateAndSaveToken}>Next</Button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl mb-2">Step 2: Project Selection</h2>
          <select
            multiple
            className="w-full p-2 mb-4 bg-gray-700 rounded h-40"
            value={selectedProjects}
            onChange={(e) =>
              setSelectedProjects(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
          >
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
          <Button onClick={() => setStep(3)}>Next</Button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl mb-2">Step 3: Window Position</h2>
          <select
            className="w-full p-2 mb-4 bg-gray-700 rounded"
            value={windowPos}
            onChange={(e) => setWindowPos(e.target.value)}
          >
            <option value="Top Left">Top Left</option>
            <option value="Top Center">Top Center</option>
            <option value="Top Right">Top Right</option>
            <option value="Center">Center</option>
            <option value="Bottom Right">Bottom Right</option>
          </select>
          <Button onClick={handleSaveConfig}>Finish Setup</Button>
        </div>
      )}
    </div>
  );
}

interface TicketItemProps {
  ticket: Ticket;
}

function TicketItem({ ticket }: TicketItemProps) {
  const handleSelect = async () => {
    // On Enter: Copy URL
    await window.go.main.CopyToClipboard(ticket.Url);
    window.go.main.HideWindow();
  };

  const handleShiftEnter = async () => {
    // On Shift+Enter: Open in Browser
    await window.go.main.OpenInBrowser(ticket.Url);
    window.go.main.HideWindow();
  };

  return (
    <CommandPrimitive.Item
      onSelect={handleSelect}
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
      )}
    >
      <div
        className={cn(
          "flex flex-col flex-grow group",
          "data-[selected=true]:bg-accent"
        )}
      >
        <div className="flex justify-between items-center">
          <span className="font-bold text-blue-400 w-24 flex-shrink-0">
            {ticket.ID}
          </span>
          <span className="flex-grow truncate ... text-white">
            {ticket.Summary}
          </span>
          <span
            className={cn(
              "ml-4 text-right flex-shrink-0",
              ticket.Priority === "Critical" && "text-red-500",
              ticket.Priority === "Major" && "text-yellow-500",
              ticket.Priority === "Minor" && "text-gray-500"
            )}
          >
            {ticket.Priority}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span className="text-gray-500">{ticket.Type}</span>
          <div className="flex space-x-1">
            {ticket.Sprints.map((sprint) => (
              <span
                key={sprint}
                className="px-2 py-0.5 border border-gray-500 rounded-full text-xs"
              >
                {sprint}
              </span>
            ))}
          </div>
        </div>
      </div>
    </CommandPrimitive.Item>
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
