package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zwoabier/youtrack-helper/internal/logger"
)

// #region debug instrumentation
const debugLogPath = "/home/menzelm/Projects/youtrack-helper/.cursor/debug.log"

func writeDebugND(location, message string, data map[string]interface{}, hypothesisId string) {
	payload := map[string]interface{}{
		"sessionId":    "debug-session",
		"runId":        "run1",
		"hypothesisId": hypothesisId,
		"location":     location,
		"message":      message,
		"data":         data,
		"timestamp":    time.Now().UnixMilli(),
	}
	b, _ := json.Marshal(payload)
	f, err := os.OpenFile(debugLogPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
	if err != nil {
		return
	}
	f.Write(b)
	f.Write([]byte("\n"))
	f.Close()
}

// #endregion
// WailsApp struct
type App struct {
	ctx     context.Context
	config  Config
	tickets []Ticket
	cm      *ConfigManager
	ytAPI   *YouTrackAPI
}

// NewApp creates a new App application struct
func NewApp() *App {
	cm := NewConfigManager()
	return &App{
		cm:    cm,
		ytAPI: NewYouTrackAPI(cm),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Use config from ConfigManager (same source YouTrackAPI uses)
	a.config = a.cm.GetConfig()

	// Logger: config first, then env overrides level
	level := a.config.LogLevel
	if level == "" {
		level = "debug"
	}
	logger.SetLevel(level)
	logger.SetLogToFile(a.config.LogToFile)
	if env := os.Getenv("YOUTRACK_HELPER_LOG"); env != "" {
		logger.SetLevel(env)
	}

	// Try to load tickets from cache
	if err := a.loadTicketsFromCache(); err != nil {
		logger.Warn("loading tickets from cache: %v", err)
	} else {
		logger.Debug("loaded %d cached tickets", len(a.tickets))
	}

	// Debug log: startup config state (H1)
	writeDebugND("app.go:startup", "startup_config", map[string]interface{}{
		"isConfigured":       a.cm.IsConfigured(),
		"configProjectsLen":  len(a.config.Projects),
		"hasToken":           a.cm.GetToken() != "",
		"configBaseURLEmpty": a.config.BaseURL == "",
	}, "H1")

	// Start background sync only if configured
	if a.cm.IsConfigured() {
		go a.startBackgroundSync()
	} else {
		logger.Info("Background sync skipped: configuration not complete")
	}
}

// saveConfig saves the current configuration via ConfigManager
func (a *App) saveConfig() error {
	return a.cm.SaveConfig(a.config)
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
		logger.Error("initial background sync failed: %v", err)
	}
}

// GetConfig returns the current application configuration
func (a *App) GetConfig() Config {
	return a.config
}

// SaveConfig saves the provided configuration
func (a *App) SaveConfig(c Config) error {
	a.config = c
	level := c.LogLevel
	if level == "" {
		level = "info"
	}
	logger.SetLevel(level)
	logger.SetLogToFile(c.LogToFile)
	return a.cm.SaveConfig(c)
}

// GetTickets returns cached tickets instantly
func (a *App) GetTickets() []Ticket {
	// Debug: publish ticket count and sample
	func() {
		sample := []string{}
		for i, t := range a.tickets {
			if i >= 5 {
				break
			}
			sample = append(sample, t.ID)
		}
		payload := map[string]interface{}{
			"sessionId":    "debug-session",
			"runId":        "run1",
			"hypothesisId": "H4",
			"location":     "app.go:GetTickets",
			"message":      "get_tickets_called",
			"data": map[string]interface{}{
				"count":  len(a.tickets),
				"sample": sample,
			},
			"timestamp": time.Now().UnixMilli(),
		}
		b, _ := json.Marshal(payload)
		f, _ := os.OpenFile(debugLogPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
		if f != nil {
			f.Write(b)
			f.Write([]byte("\n"))
			f.Close()
		}
	}()

	return a.tickets
}

// FrontendLog allows the frontend to write a debug entry to the NDJSON debug log.
func (a *App) FrontendLog(message string, data map[string]interface{}) {
	// Perform log write asynchronously to avoid blocking the UI/renderer
	go func(msg string, d map[string]interface{}) {
		payload := map[string]interface{}{
			"sessionId": "debug-session",
			"runId":     "run1",
			"location":  "frontend",
			"message":   msg,
			"data":      d,
			"timestamp": time.Now().UnixMilli(),
		}
		b, _ := json.Marshal(payload)
		f, err := os.OpenFile(debugLogPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
		if err == nil {
			// Best-effort write; ignore errors to keep this non-blocking
			_, _ = f.Write(b)
			_, _ = f.Write([]byte("\n"))
			_ = f.Close()
		}
	}(message, data)
}

// SyncTickets forces a network sync with YouTrack API
func (a *App) SyncTickets() ([]Ticket, error) {
	logger.Info("Syncing tickets from YouTrack API...")
	if err := a.ytAPI.SyncTickets(a.ctx); err != nil {
		return nil, err
	}
	a.tickets = a.ytAPI.GetCachedTickets()
	a.config.LastSyncTime = time.Now().Unix()
	_ = a.saveConfig()
	_ = a.saveTicketsToCache()
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
	if baseURL == "" || token == "" {
		return false, fmt.Errorf("base URL and token cannot be empty")
	}
	err := a.ytAPI.ValidateConnection(a.ctx, baseURL, token)
	return err == nil, err
}

// SaveYouTrackToken securely stores the YouTrack permanent token using keyring
func (a *App) SaveYouTrackToken(token string) error {
	return a.cm.SaveToken(token)
}

// GetYouTrackToken retrieves the YouTrack permanent token from keyring
func (a *App) GetYouTrackToken() (string, error) {
	return a.cm.GetToken(), nil
}

// FetchProjects fetches all projects from YouTrack API
func (a *App) FetchProjects(baseURL, token string) ([]Project, error) {
	return a.ytAPI.GetProjects(a.ctx, baseURL, token)
}

// GetCurrentUser fetches the current user information from YouTrack
func (a *App) GetCurrentUser(baseURL, token string) (*User, error) {
	if baseURL == "" || token == "" {
		return nil, fmt.Errorf("base URL and token cannot be empty")
	}
	return a.ytAPI.GetCurrentUser(a.ctx, baseURL, token)
}
