package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zalando/go-keyring"
)

// WailsApp struct
type App struct {
	ctx    context.Context
	config Config	
	tickets []Ticket
}

// Config struct for application configuration
type Config struct {
	BaseURL      string   `json:"base_url"`
	Projects     []string `json:"projects"`
	WindowPos    string   `json:"window_pos"` // e.g., "top-right"
	LastSyncTime int64    `json:"last_sync_time"`
}

// Ticket struct for YouTrack tickets
type Ticket struct {
	ID       string   `json:"id"`       // idReadable (AGV-10)
	Summary  string   `json:"summary"`
	Type     string   `json:"type"`     // Parsed from customFields
	Priority string   `json:"priority"` // Parsed from customFields
	Sprints  []string `json:"sprints"`  // Parsed from customFields
	Url      string   `json:"url"`      // Computed or fetched
}

// NewApp creates a new App application structunc NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Load config from file
	if err := a.loadConfig(); err != nil {
		log.Printf("Error loading config: %v", err)
		// If config not found or error, initialize with default values
		a.config = Config{}
	}

	// Try to load tickets from cache
	if err := a.loadTicketsFromCache(); err != nil {
		log.Printf("Error loading tickets from cache: %v", err)
	}

	// Start background sync
	go a.startBackgroundSync()
}

// loadConfig loads the configuration from config.json
func (a *App) loadConfig() error {
	data, err := ioutil.ReadFile("config.json")
	if err != nil {
		return fmt.Errorf("failed to read config.json: %w", err)
	}
	return json.Unmarshal(data, &a.config)
}

// saveConfig saves the current configuration to config.json
func (a *App) saveConfig() error {
	data, err := json.MarshalIndent(a.config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}
	return ioutil.WriteFile("config.json", data, 0644)
}

// loadTicketsFromCache loads tickets from a local cache file
func (a *App) loadTicketsFromCache() error {
	data, err := ioutil.ReadFile("tickets_cache.json")
	if err != nil {
		return fmt.Errorf("failed to read tickets_cache.json: %w", err)
	}
	return json.Unmarshal(data, &a.tickets)
}

// saveTicketsToCache saves tickets to a local cache file
func (a *App) saveTicketsToCache() error {
	data, err := json.MarshalIndent(a.tickets, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal tickets: %w", err)
	}
	return ioutil.WriteFile("tickets_cache.json", data, 0644)
}

// startBackgroundSync initiates an asynchronous fetch to YouTrack REST API
func (a *App) startBackgroundSync() {
	// Implement periodic sync logic here
	// For now, a simple one-time sync after startup
	time.Sleep(5 * time.Second) // Simulate some delay
	_, err := a.SyncTickets()
	if err != nil {
		log.Printf("Initial background sync failed: %v", err)
	}
}

// GetConfig returns the current application configuration
func (a *App) GetConfig() Config {
	return a.config
}

// SaveConfig saves the provided configuration
func (a *App) SaveConfig(c Config) error {
	a.config = c
	return a.saveConfig()
}

// GetTickets returns cached tickets instantly
func (a *App) GetTickets() []Ticket {
	return a.tickets
}

// SyncTickets forces a network sync with YouTrack API
func (a *App) SyncTickets() ([]Ticket, error) {
	// Placeholder for YouTrack API interaction
	log.Println("Syncing tickets from YouTrack API...")
	// In a real implementation, this would fetch data from YouTrack,
	// parse it into []Ticket, and then call a.saveTicketsToCache()

	// Simulate fetching data
	simulatedTickets := []Ticket{
		{ID: "AGV-100", Summary: "Fix critical bug in login flow", Type: "Bug", Priority: "Critical", Sprints: []string{"Sprint 22"}, Url: "https://myorg.youtrack.cloud/issue/AGV-100"},
		{ID: "DEV-201", Summary: "Implement new user dashboard feature", Type: "Feature", Priority: "Major", Sprints: []string{"Sprint 23"}, Url: "https://myorg.youtrack.cloud/issue/DEV-201"},
	}

	a.tickets = simulatedTickets
	a.config.LastSyncTime = time.Now().Unix()
	a.saveConfig()
	a.saveTicketsToCache()

	return a.tickets, nil
}

// CopyToClipboard copies the given text to the clipboard
func (a *App) CopyToClipboard(text string) {
	runtime.ClipboardSetText(a.ctx, text)
}

// OpenInBrowser opens the given URL in the default browser
func (a *App) OpenInBrowser(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

// HideWindow hides the application window
func (a *App) HideWindow() {
	runtime.WindowHide(a.ctx)
}

// ValidateYouTrackToken validates the YouTrack permanent token
func (a *App) ValidateYouTrackToken(baseURL, token string) (bool, error) {
	// In a real scenario, make an API call to YouTrack to validate the token
	// For now, a simple check
	if baseURL == "" || token == "" {
		return false, fmt.Errorf("base URL and token cannot be empty")
	}
	// Simulate API call success
	return true, nil
}

// SaveYouTrackToken securely stores the YouTrack permanent token using keyring
func (a *App) SaveYouTrackToken(token string) error {
	// Use a service name specific to your app, e.g., "youtrack-spotlight"
	return keyring.Set("youtrack-spotlight", "token", token)
}

// GetYouTrackToken retrieves the YouTrack permanent token from keyring
func (a *App) GetYouTrackToken() (string, error) {
	return keyring.Get("youtrack-spotlight", "token")
}

// FetchProjects fetches all projects from YouTrack API
func (a *App) FetchProjects(baseURL, token string) ([]string, error) {
	// Placeholder for YouTrack API interaction to fetch projects
	// In a real implementation, this would make an authenticated API call
	// to YouTrack and parse the project names.

	// Simulate fetching projects
	simulatedProjects := []string{
		"AGV", "DEV", "OPS", "TEST",
	}
	return simulatedProjects, nil
}
