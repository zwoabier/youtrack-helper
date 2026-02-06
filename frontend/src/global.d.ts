interface Window { 
  go: { 
    main: { 
      App: { 
        GetConfig(): Promise<Config>; 
        SaveConfig(config: Config): Promise<void>; 
        GetTickets(): Promise<Ticket[]>; 
        SyncTickets(): Promise<Ticket[]>; 
        CopyToClipboard(text: string): Promise<void>; 
        OpenInBrowser(url: string): Promise<void>; 
        HideWindow(): Promise<void>; 
        ValidateYouTrackToken(baseURL: string, token: string): Promise<boolean>; 
        SaveYouTrackToken(token: string): Promise<void>; 
        GetYouTrackToken(): Promise<string>; 
        FetchProjects(baseURL: string, token: string): Promise<Project[]>; 
      }; 
    }; 
  }; 
} 

declare global { 
  interface Window { 
    go: { 
      main: { 
        App: { 
          GetConfig(): Promise<Config>; 
          SaveConfig(config: Config): Promise<void>; 
          GetTickets(): Promise<Ticket[]>; 
          SyncTickets(): Promise<Ticket[]>; 
          CopyToClipboard(text: string): Promise<void>; 
          OpenInBrowser(url: string): Promise<void>; 
          HideWindow(): Promise<void>; 
          ValidateYouTrackToken(baseURL: string, token: string): Promise<boolean>; 
          SaveYouTrackToken(token: string): Promise<void>; 
          GetYouTrackToken(): Promise<string>; 
          FetchProjects(baseURL: string, token: string): Promise<Project[]>; 
        }; 
      }; 
    }; 
  } 

  declare module 'clsx';
  declare module 'class-variance-authority';
} 

interface Config { 
  BaseURL: string; 
  Projects: string[]; 
  WindowPos: string; 
  LastSyncTime: number; 
} 

interface Project {
  id: string;
  name: string;
  shortName: string;
  archived: boolean;
}

interface Ticket { 
  ID: string; 
  Summary: string; 
  Type: string; 
  Priority: string; 
  Sprints: string[]; 
  Url: string; 
}
