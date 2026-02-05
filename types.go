package main

type Config struct {
	BaseURL      string   `json:"base_url"`
	Projects     []string `json:"projects"`
	WindowPos    string   `json:"window_pos"` // e.g., "top-right"
	LastSyncTime int64    `json:"last_sync_time"`
	LogLevel     string   `json:"log_level"`   // "debug", "info", "warn", "error"; default "info"
	LogToFile    bool     `json:"log_to_file"` // when true, also write to ~/.youtrack-helper/app.log
}

type Ticket struct {
	ID       string   `json:"id"`       // idReadable (AGV-10)
	Summary  string   `json:"summary"`
	Type     string   `json:"type"`     // Parsed from customFields
	Priority string   `json:"priority"` // Parsed from customFields
	Sprints  []string `json:"sprints"`  // Parsed from customFields
	Url      string   `json:"url"`      // Computed or fetched
}

// Project represents a YouTrack project returned by the admin/projects endpoint
type Project struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	ShortName string `json:"shortName"`
	Archived  bool   `json:"archived"`
}
