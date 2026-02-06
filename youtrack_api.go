package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/zwoabier/youtrack-helper/internal/logger"
	"os"
	"time"
)

type YouTrackAPI struct {
	cm             *ConfigManager
	cachedTickets []Ticket
	http           *http.Client
}

func NewYouTrackAPI(cm *ConfigManager) *YouTrackAPI {
	return &YouTrackAPI{
		cm:             cm,
		cachedTickets: []Ticket{},
		http:           &http.Client{},
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// userMessageForStatus returns a short, actionable message for the user.
func userMessageForStatus(statusCode int) string {
	switch {
	case statusCode == 401:
		return "Invalid token. Check your YouTrack permanent token."
	case statusCode == 404:
		return "YouTrack URL or API path may be wrong. Check the base URL."
	case statusCode >= 500:
		return "YouTrack server error. Try again later."
	default:
		return "Connection failed. Check your YouTrack URL and token."
	}
}

// SyncTickets fetches tickets from YouTrack API and updates cache
func (yt *YouTrackAPI) SyncTickets(ctx context.Context) error {
	cfg := yt.cm.GetConfig()
	token := yt.cm.GetToken()

	if cfg.BaseURL == "" || token == "" {
		return fmt.Errorf("YouTrack is not configured. Complete setup first.")
	}

	baseURL := normalizeBaseURL(cfg.BaseURL)

	// Debug log: SyncTickets entry (H1)
	writeDebugND := func(location, message string, data map[string]interface{}, hypothesisId string) {
		// minimal inline writer to avoid extra imports
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
		f, err := os.OpenFile("/home/menzelm/Projects/youtrack-helper/.cursor/debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
		if err == nil {
			f.Write(b)
			f.Write([]byte("\n"))
			f.Close()
		}
	}
	writeDebugND("youtrack_api.go:SyncTickets", "entry", map[string]interface{}{"projectsLen": len(cfg.Projects)}, "H1")

	// Ensure projects are selected
	if len(cfg.Projects) == 0 {
		logger.Info("SyncTickets: no projects selected; skipping sync")
		return fmt.Errorf("No projects selected. Complete setup to enable sync.")
	}

	// Build YouTrack API query
	projectQuery := strings.Join(cfg.Projects, " or project: ")
	queryStr := fmt.Sprintf("project: %s", projectQuery)

	// Construct URL
	apiURL := fmt.Sprintf("%s/api/issues?query=%s&fields=idReadable,summary,customFields(name,value(name))&$top=5000",
		baseURL,
		url.QueryEscape(queryStr),
	)

	// Create request
	logger.Debug("SyncTickets: sending request to %s", apiURL)
	req, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		logger.Error("SyncTickets: failed to create request: %v", err)
		return fmt.Errorf("Failed to prepare sync.")
	}

	// Set authorization header
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/json")

	// Execute request
	logger.Debug("SyncTickets: executing HTTP request")
	resp, err := yt.http.Do(req)
	if err != nil {
		logger.Error("SyncTickets: request failed: %v", err)
		return fmt.Errorf("Connection failed. Check your network and YouTrack URL.")
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	// NDJSON debug entry for HTTP response (avoid logging tokens)
	func() {
		payload := map[string]interface{}{
			"sessionId":    "debug-session",
			"runId":        "run1",
			"hypothesisId": "H2",
			"location":     "youtrack_api.go:SyncTickets",
			"message":      "http_response",
			"data": map[string]interface{}{
				"status": resp.StatusCode,
				"url":    apiURL,
				"body":   string(bodyBytes[:min(len(bodyBytes), 1000)]),
			},
			"timestamp": time.Now().UnixMilli(),
		}
		b, _ := json.Marshal(payload)
		f, _ := os.OpenFile("/home/menzelm/Projects/youtrack-helper/.cursor/debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
		if f != nil {
			f.Write(b)
			f.Write([]byte("\n"))
			f.Close()
		}
	}()

	if resp.StatusCode != http.StatusOK {
		logger.Error("SyncTickets: YouTrack API error status=%d url=%s body=%s", resp.StatusCode, apiURL, string(bodyBytes))
		return fmt.Errorf("%s", userMessageForStatus(resp.StatusCode))
	}

	var issues []map[string]interface{}
	if err := json.Unmarshal(bodyBytes, &issues); err != nil {
		logger.Error("SyncTickets: decode error: %v", err)
		return fmt.Errorf("Invalid response from YouTrack. Try again later.")
	}
	logger.Debug("SyncTickets: received %d issues", len(issues))
	// NDJSON debug: list first 5 issue IDs
	func() {
		sample := []string{}
		for i, it := range issues {
			if i >= 5 {
				break
			}
			if id, ok := it["idReadable"].(string); ok {
				sample = append(sample, id)
			}
		}
		payload := map[string]interface{}{
			"sessionId":    "debug-session",
			"runId":        "run1",
			"hypothesisId": "H2",
			"location":     "youtrack_api.go:SyncTickets",
			"message":      "parsed_issues_sample",
			"data": map[string]interface{}{
				"count":  len(issues),
				"sample": sample,
			},
			"timestamp": time.Now().UnixMilli(),
		}
		b, _ := json.Marshal(payload)
		f, _ := os.OpenFile("/home/menzelm/Projects/youtrack-helper/.cursor/debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
		if f != nil {
			f.Write(b)
			f.Write([]byte("\n"))
			f.Close()
		}
	}()

	// Parse tickets
	yt.cachedTickets = []Ticket{}
	for _, issue := range issues {
		ticket := yt.parseTicket(issue, baseURL)
		yt.cachedTickets = append(yt.cachedTickets, ticket)
	}
	// NDJSON debug: cache update
	func() {
		payload := map[string]interface{}{
			"sessionId":    "debug-session",
			"runId":        "run1",
			"hypothesisId": "H3",
			"location":     "youtrack_api.go:SyncTickets",
			"message":      "cached_tickets_updated",
			"data": map[string]interface{}{
				"cached_count": len(yt.cachedTickets),
			},
			"timestamp": time.Now().UnixMilli(),
		}
		b, _ := json.Marshal(payload)
		f, _ := os.OpenFile("/home/menzelm/Projects/youtrack-helper/.cursor/debug.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0600)
		if f != nil {
			f.Write(b)
			f.Write([]byte("\n"))
			f.Close()
		}
	}()

	return nil
}

func (yt *YouTrackAPI) parseTicket(issue map[string]interface{}, baseURL string) Ticket {
	ticket := Ticket{}

	// Extract basic fields
	if id, ok := issue["idReadable"].(string); ok {
		ticket.ID = id
	}
	if summary, ok := issue["summary"].(string); ok {
		ticket.Summary = summary
	}

	// Construct URL
	ticket.Url = fmt.Sprintf("%s/issues/%s", baseURL, ticket.ID)

	// Parse custom fields
	if customFields, ok := issue["customFields"].([]interface{}); ok {
		for _, field := range customFields {
			if fieldMap, ok := field.(map[string]interface{}); ok {
				name, _ := fieldMap["name"].(string)
				
				if value, ok := fieldMap["value"]; ok {
					switch name {
					case "Type":
						if typeVal, ok := value.(map[string]interface{}); ok {
							if typeName, ok := typeVal["name"].(string); ok {
								ticket.Type = typeName
							}
						}

					case "Priority":
						if priVal, ok := value.(map[string]interface{}); ok {
							if priName, ok := priVal["name"].(string); ok {
								ticket.Priority = priName
							}
						}

					case "Sprints":
						if sprints, ok := value.([]interface{}); ok {
							for _, sprint := range sprints {
								if sprintMap, ok := sprint.(map[string]interface{}); ok {
									if sprintName, ok := sprintMap["name"].(string); ok {
										ticket.Sprints = append(ticket.Sprints, sprintName)
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return ticket
}

func (yt *YouTrackAPI) GetCachedTickets() []Ticket {
	return yt.cachedTickets
}

// normalizeBaseURL trims spaces and removes a trailing slash so /api/me is built correctly
func normalizeBaseURL(baseURL string) string {
	baseURL = strings.TrimSpace(baseURL)
	baseURL = strings.TrimSuffix(baseURL, "/")
	return baseURL
}

// ValidateConnection tests the API connection with provided credentials
func (yt *YouTrackAPI) ValidateConnection(ctx context.Context, baseURL, token string) error {
	baseURL = normalizeBaseURL(baseURL)
	if baseURL == "" {
		return fmt.Errorf("Base URL is required.")
	}
	apiURL := fmt.Sprintf("%s/api/users/me", baseURL)

	req, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		logger.Error("ValidateConnection: invalid URL: %v", err)
		return fmt.Errorf("Invalid YouTrack URL.")
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/json")

	resp, err := yt.http.Do(req)
	if err != nil {
		logger.Error("ValidateConnection: request failed: %v", err)
		return fmt.Errorf("Connection failed. Check your network and YouTrack URL.")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Error("ValidateConnection: status=%d url=%s body=%s", resp.StatusCode, apiURL, string(body))
		return fmt.Errorf("%s", userMessageForStatus(resp.StatusCode))
	}

	return nil
}

// GetCurrentUser fetches the current user information from YouTrack
func (yt *YouTrackAPI) GetCurrentUser(ctx context.Context, baseURL, token string) (*User, error) {
	baseURL = normalizeBaseURL(baseURL)
	apiURL := fmt.Sprintf("%s/api/users/me?fields=id,name,email", baseURL)

	req, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		logger.Error("GetCurrentUser: failed to create request: %v", err)
		return nil, fmt.Errorf("Invalid YouTrack URL.")
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/json")

	resp, err := yt.http.Do(req)
	if err != nil {
		logger.Error("GetCurrentUser: request failed: %v", err)
		return nil, fmt.Errorf("Connection failed. Check your network and YouTrack URL.")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Error("GetCurrentUser: status=%d url=%s body=%s", resp.StatusCode, apiURL, string(body))
		return nil, fmt.Errorf("%s", userMessageForStatus(resp.StatusCode))
	}

	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		logger.Error("GetCurrentUser: decode error: %v", err)
		return nil, fmt.Errorf("Invalid response from YouTrack. Try again later.")
	}

	return &user, nil
}

// GetProjects fetches available projects from YouTrack
func (yt *YouTrackAPI) GetProjects(ctx context.Context, baseURL, token string) ([]Project, error) {
	baseURL = normalizeBaseURL(baseURL)
	apiURL := fmt.Sprintf("%s/api/admin/projects?fields=id,name,shortName,archived", baseURL)

	req, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		logger.Error("GetProjects: failed to create request: %v", err)
		return nil, fmt.Errorf("Invalid YouTrack URL.")
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/json")

	resp, err := yt.http.Do(req)
	if err != nil {
		logger.Error("GetProjects: request failed: %v", err)
		return nil, fmt.Errorf("Connection failed. Check your network and YouTrack URL.")
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Error("GetProjects: status=%d url=%s body=%s", resp.StatusCode, apiURL, string(body))
		return nil, fmt.Errorf("%s", userMessageForStatus(resp.StatusCode))
	}

	var projects []Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		logger.Error("GetProjects: decode error: %v", err)
		return nil, fmt.Errorf("Invalid response from YouTrack. Try again later.")
	}

	return projects, nil
}
