package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"
)

// AuditEntry represents a single audit log entry.
type AuditEntry struct {
	ID         string    `json:"id"`
	Timestamp  time.Time `json:"timestamp"`
	UserID     string    `json:"userId"`
	UserName   string    `json:"userName"`
	Action     string    `json:"action"`
	Resource   string    `json:"resource,omitempty"`
	Method     string    `json:"method"`
	Path       string    `json:"path"`
	StatusCode int       `json:"statusCode"`
	Duration   string    `json:"duration"`
	IPAddress  string    `json:"ipAddress,omitempty"`
	UserAgent  string    `json:"userAgent,omitempty"`
	Details    string    `json:"details,omitempty"`
}

// AuditLog manages audit entries.
type AuditLog struct {
	mu     sync.RWMutex
	entries []AuditEntry
	file   string
}

// NewAuditLog creates a new audit log.
func NewAuditLog(file string) *AuditLog {
	al := &AuditLog{file: file}
	// Load existing entries if file exists
	if data, err := os.ReadFile(file); err == nil {
		json.Unmarshal(data, &al.entries)
	}
	return al
}

// AddEntry appends an audit entry.
func (al *AuditLog) AddEntry(entry AuditEntry) {
	al.mu.Lock()
	defer al.mu.Unlock()
	al.entries = append(al.entries, entry)
	// Persist to file
	if al.file != "" {
		data, _ := json.MarshalIndent(al.entries, "", "  ")
		os.WriteFile(al.file, data, 0644)
	}
}

// GetEntries returns audit entries with optional filtering.
func (al *AuditLog) GetEntries(limit int, userID string) []AuditEntry {
	al.mu.RLock()
	defer al.mu.RUnlock()

	var filtered []AuditEntry
	for i := len(al.entries) - 1; i >= 0 && len(filtered) < limit; i-- {
		e := al.entries[i]
		if userID != "" && e.UserID != userID {
			continue
		}
		filtered = append(filtered, e)
	}
	return filtered
}

// AuditMiddleware wraps a handler to log all requests.
func AuditMiddleware(store *SessionStore, log *AuditLog, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Get user info from session
		userID := "anonymous"
		userName := "Anonymous"
		session, ok := SessionFromContext(r.Context())
		if ok {
			userID = session.UserID
			userName = session.Name
		}

		// Wrap ResponseWriter to capture status code
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		// Call the actual handler
		next(rw, r)

		// Log the request
		entry := AuditEntry{
			ID:         fmt.Sprintf("audit_%d", start.UnixNano()),
			Timestamp:  start,
			UserID:     userID,
			UserName:   userName,
			Action:     fmt.Sprintf("%s %s", r.Method, r.URL.Path),
			Method:     r.Method,
			Path:       r.URL.Path,
			StatusCode: rw.statusCode,
			Duration:   time.Since(start).String(),
			IPAddress:  r.RemoteAddr,
			UserAgent:  r.UserAgent(),
		}

		log.AddEntry(entry)
	}
}

// responseWriter wraps http.ResponseWriter to capture the status code.
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// handleAuditLog returns audit log entries.
func handleAuditLog(store *SessionStore, log *AuditLog) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, ok := SessionFromContext(r.Context())
		if !ok {
			jsonError(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		if session.Role != "admin" {
			jsonError(w, "forbidden", http.StatusForbidden)
			return
		}

		limit := 100
		if r.URL.Query().Get("limit") != "" {
			fmt.Sscanf(r.URL.Query().Get("limit"), "%d", &limit)
		}

		entries := log.GetEntries(limit, "")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(entries)
	}
}
}
