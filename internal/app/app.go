package app

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"github.com/pkg/browser"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/zalando/go-keyring"
)

type App struct {
	ctx    context.Context
	config *Config
	tickets []Ticket
}

type Config struct {
	BaseURL      string   `json:"base_url"`
	Projects     []string `json:"projects"`
	WindowPos    string   `json:"window_pos"`
	LastSyncTime int64    `json:"last_sync_time"`
}

type Ticket struct {
	ID       string   `json:"id"`
	Summary  string   `json:"summary"`
	Type     string   `json:"type"`
	Priority string   `json:"priority"`
	Sprints  []string `json:"sprints"`
	URL      string   `json:"url"`
}

type YouTrackIssue struct {
	IDReadable   string `json:"idReadable"`
	Summary      string `json:"summary"`
	URL          string `json:"url"`
	CustomFields []struct {
		Name  string `json:"name"`
		Value interface{} `json:"value"`
	} `json:"customFields"`
}

type YouTrackResponse struct {
	Issues []YouTrackIssue `json:"issues"`
}

const (
	configFileName = "config.json"
	cacheFileName  = "tickets.json"
	keystoreKey    = "youtrack-helper"
	keystoreName   = "youtrack-api-token"
)

func NewApp() *App {
	return &App{}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx

	// Load config from file
	configPath := a.getConfigPath(configFileName)
	if _, err := os.Stat(configPath); err == nil {
		data, err := os.ReadFile(configPath)
		if err == nil {
			json.Unmarshal(data, &a.config)
		}
	}

	// Load cached tickets
	cachePath := a.getConfigPath(cacheFileName)
	if _, err := os.Stat(cachePath); err == nil {
		data, err := os.ReadFile(cachePath)
		if err == nil {
			json.Unmarshal(data, &a.tickets)
		}
	}

	// Start background sync if config exists
	if a.config != nil && a.config.BaseURL != "" {
		go a.backgroundSync()
	}
}

func (a *App) GetConfigStatus() map[string]interface{} {
	if a.config == nil || a.config.BaseURL == "" {
		return map[string]interface{}{"status": "not_configured"}
	}
	return map[string]interface{}{"status": "ready", "config": a.config}
}

func (a *App) GetTickets() []Ticket {
	if a.tickets == nil {
		a.tickets = []Ticket{}
	}
	return a.tickets
}

func (a *App) SaveConfig(baseURL string, projects []string, windowPos string) error {
	if baseURL == "" {
		return fmt.Errorf("base URL cannot be empty")
	}

	a.config = &Config{
		BaseURL:   baseURL,
		Projects:  projects,
		WindowPos: windowPos,
	}

	configPath := a.getConfigPath(configFileName)

data, err := json.MarshalIndent(a.config, "", "  ")
	if err != nil {
		return err
	}

	err = os.WriteFile(configPath, data, 0644)
	if err != nil {
		return err
	}

	// Try to sync immediately
	a.SyncTickets()
	return nil
}

func (a *App) SetAPIToken(token string) error {
	err := keyring.Set(keystoreName, keystoreKey, token)
	if err != nil {
		// Fallback: save to file (encrypted would be better)
		tokenPath := a.getConfigPath(".token")
		return os.WriteFile(tokenPath, []byte(token), 0600)
	}
	return nil
}

func (a *App) GetAPIToken() string {
	token, err := keyring.Get(keystoreName, keystoreKey)
	if err == nil {
		return token
	}

	// Fallback: read from file
	tokenPath := a.getConfigPath(".token")
	if data, err := os.ReadFile(tokenPath); err == nil {
		return string(data)
	}

	return ""
}

func (a *App) SyncTickets() error {
	if a.config == nil || a.config.BaseURL == "" {
		return fmt.Errorf("not configured")
	}

	token := a.GetAPIToken()
	if token == "" {
		return fmt.Errorf("no API token")
	}

	// Build query
	query := "project: "
	for i, proj := range a.config.Projects {
		if i > 0 {
			query += " or project: "
		}
		query += proj
	}

	// Fetch from YouTrack API
	requestURL := a.config.BaseURL + "/api/issues?query=" + url.QueryEscape(query) + "&fields=idReadable,summary,url,customFields(name,value(name))&$top=5000"

	req, _ := http.NewRequest("GET", requestURL, nil)
	req.Header.Add("Authorization", "Bearer "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error: %d - %s", resp.StatusCode, string(body))
	}

	var ytResp YouTrackResponse
	err = json.NewDecoder(resp.Body).Decode(&ytResp)
	if err != nil {
		return err
	}

	// Parse tickets
	a.tickets = a.parseTickets(ytResp.Issues)

	// Cache tickets
	cachePath := a.getConfigPath(cacheFileName)
	data, _ := json.MarshalIndent(a.tickets, "", "  ")
	os.WriteFile(cachePath, data, 0644)

	a.config.LastSyncTime = time.Now().Unix()
	return nil
}

func (a *App) parseTickets(issues []YouTrackIssue) []Ticket {
	var tickets []Ticket

	for _, issue := range issues {
		ticket := Ticket{
			ID:      issue.IDReadable,
			Summary: issue.Summary,
			URL:     issue.URL,
		}

		for _, field := range issue.CustomFields {
			switch field.Name {
			case "Priority":
				if v, ok := field.Value.(map[string]interface{}); ok {
					if name, ok := v["name"]; ok {
						ticket.Priority = name.(string)
					}
				}
			case "Type":
				if v, ok := field.Value.(map[string]interface{}); ok {
					if name, ok := v["name"]; ok {
						ticket.Type = name.(string)
					}
				}
			case "Sprints":
				if arr, ok := field.Value.([]interface{}); ok {
					for _, item := range arr {
						if v, ok := item.(map[string]interface{}); ok {
							if name, ok := v["name"]; ok {
								ticket.Sprints = append(ticket.Sprints, name.(string))
							}
						}
					}
				}
			}
		}

		tickets = append(tickets, ticket)
	}

	return tickets
}

func (a *App) CopyToClipboard(text string) error {
	runtime.ClipboardSetText(a.ctx, text)
	return nil
}

func (a *App) OpenInBrowser(url string) error {
	return browser.OpenURL(url)
}

func (a *App) HideWindow() {
	runtime.WindowHide(a.ctx)
}

func (a *App) backgroundSync() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		a.SyncTickets()
	}
}

func (a *App) getConfigPath(filename string) string {
	var configDir string

	if runtime.GOOS == "windows" {
		configDir = os.Getenv("APPDATA")
	} else {
		configDir = filepath.Join(os.Getenv("HOME"), ".config")
	}

	appDir := filepath.Join(configDir, "youtrack-helper")
	os.MkdirAll(appDir, 0755)

	return filepath.Join(appDir, filename)
}
