package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Provider string `json:"provider,omitempty"`
}

type LoginResponse struct {
	Token   string    `json:"token"`
	User    UserInfo  `json:"user"`
	Expires time.Time `json:"expires"`
}

type UserInfo struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

type APIKey struct {
	Key       string    `json:"key"`
	Name      string    `json:"name"`
	UserID    string    `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
	LastUsed  time.Time `json:"lastUsed,omitempty"`
}

type SessionStore struct {
	mu       sync.RWMutex
	sessions map[string]*Session
	apiKeys  map[string]*APIKey
}

func NewSessionStore() *SessionStore {
	return &SessionStore{
		sessions: make(map[string]*Session),
		apiKeys:  make(map[string]*APIKey),
	}
}

func (s *SessionStore) CreateSession(userID, email, name, role string, ttl time.Duration) string {
	token := generateToken()
	s.mu.Lock()
	defer s.mu.Unlock()

	session := &Session{
		ID:        token,
		UserID:    userID,
		Email:     email,
		Name:      name,
		Role:      role,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(ttl),
	}
	s.sessions[token] = session
	return token
}

func (s *SessionStore) GetSession(token string) (*Session, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	session, exists := s.sessions[token]
	if !exists {
		return nil, false
	}
	if time.Now().After(session.ExpiresAt) {
		return nil, false
	}
	return session, true
}

func (s *SessionStore) DeleteSession(token string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, token)
}

func (s *SessionStore) CreateAPIKey(userID, name string, ttl time.Duration) *APIKey {
	key := generateToken()
	apiKey := &APIKey{
		Key:       "tfg_" + key,
		Name:      name,
		UserID:    userID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(ttl),
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.apiKeys[apiKey.Key] = apiKey
	return apiKey
}

func (s *SessionStore) ValidateAPIKey(key string) (*APIKey, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	apiKey, exists := s.apiKeys[key]
	if !exists {
		return nil, false
	}
	if time.Now().After(apiKey.ExpiresAt) {
		return nil, false
	}
	return apiKey, true
}

func (s *SessionStore) TouchAPIKey(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if apiKey, exists := s.apiKeys[key]; exists {
		apiKey.LastUsed = time.Now()
	}
}

func (s *SessionStore) GetAPIKeys(userID string) []*APIKey {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var keys []*APIKey
	for _, apiKey := range s.apiKeys {
		if apiKey.UserID == userID {
			keys = append(keys, apiKey)
		}
	}
	return keys
}

func (s *SessionStore) RevokeAPIKey(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.apiKeys, key)
}

func generateToken() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return fmt.Sprintf("token_%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

var mockUsers = map[string]struct {
	Password string
	Name     string
	Role     string
}{
	"admin@tfg.local":  {Password: "admin", Name: "Admin User", Role: "admin"},
	"dev@tfg.local":    {Password: "dev", Name: "Developer", Role: "developer"},
	"viewer@tfg.local": {Password: "viewer", Name: "Viewer", Role: "viewer"},
}

func AuthMiddleware(store *SessionStore, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := extractToken(r)
		if token == "" {
			jsonError(w, "missing authentication token", http.StatusUnauthorized)
			return
		}

		session, exists := store.GetSession(token)
		if !exists {
			jsonError(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := r.Context()
		ctx = sessionToContext(ctx, session)
		next(w, r.WithContext(ctx))
	}
}

func APIKeyMiddleware(store *SessionStore, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("X-API-Key")
		if key == "" {
			token := extractToken(r)
			if token == "" {
				jsonError(w, "missing authentication", http.StatusUnauthorized)
				return
			}
			session, exists := store.GetSession(token)
			if !exists {
				jsonError(w, "invalid token", http.StatusUnauthorized)
				return
			}
			ctx := sessionToContext(r.Context(), session)
			next(w, r.WithContext(ctx))
			return
		}

		apiKey, exists := store.ValidateAPIKey(key)
		if !exists {
			jsonError(w, "invalid API key", http.StatusUnauthorized)
			return
		}

		store.TouchAPIKey(key)

		session := &Session{
			ID:     "api-" + apiKey.Key[:8],
			UserID: apiKey.UserID,
			Email:  "api-key@" + apiKey.Key[:8] + ".local",
			Name:   "API Key: " + apiKey.Name,
			Role:   "api",
		}
		ctx := sessionToContext(r.Context(), session)
		next(w, r.WithContext(ctx))
	}
}

func extractToken(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if auth != "" {
		if len(auth) > 7 && auth[:7] == "Bearer " {
			return auth[7:]
		}
		return auth
	}

	cookie, err := r.Cookie("tfg_session")
	if err == nil {
		return cookie.Value
	}

	return ""
}

type contextKey string

const sessionContextKey contextKey = "session"

func sessionToContext(ctx context.Context, session *Session) context.Context {
	return context.WithValue(ctx, sessionContextKey, session)
}

func SessionFromContext(ctx context.Context) (*Session, bool) {
	s, ok := ctx.Value(sessionContextKey).(*Session)
	return s, ok
}

func handleLogin(store *SessionStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			jsonError(w, "invalid request body", http.StatusBadRequest)
			return
		}

		user, exists := mockUsers[req.Email]
		if !exists || user.Password != req.Password {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "invalid credentials",
			})
			return
		}

		token := store.CreateSession(req.Email, req.Email, user.Name, user.Role, 24*time.Hour)

		resp := LoginResponse{
			Token: token,
			User: UserInfo{
				ID:    req.Email,
				Email: req.Email,
				Name:  user.Name,
				Role:  user.Role,
			},
			Expires: time.Now().Add(24 * time.Hour),
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "tfg_session",
			Value:    token,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   86400,
		})

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

func handleLogout(store *SessionStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		token := extractToken(r)
		if token != "" {
			store.DeleteSession(token)
		}

		http.SetCookie(w, &http.Cookie{
			Name:   "tfg_session",
			Value:  "",
			Path:   "/",
			MaxAge: -1,
		})

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"logged out"}`)
	}
}

func handleWhoami(store *SessionStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := extractToken(r)
		if token == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"authenticated": false,
			})
			return
		}

		session, exists := store.GetSession(token)
		if !exists {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"authenticated": false,
			})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": true,
			"user": UserInfo{
				ID:    session.UserID,
				Email: session.Email,
				Name:  session.Name,
				Role:  session.Role,
			},
		})
	}
}

func handleAPIKeys(store *SessionStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := extractToken(r)
		if token == "" {
			jsonError(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		session, exists := store.GetSession(token)
		if !exists {
			jsonError(w, "invalid token", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		switch r.Method {
		case http.MethodGet:
			keys := store.GetAPIKeys(session.UserID)
			safeKeys := make([]map[string]interface{}, len(keys))
			for i, k := range keys {
				safeKeys[i] = map[string]interface{}{
					"key":       k.Key[:8] + "..." + k.Key[len(k.Key)-4:],
					"name":      k.Name,
					"createdAt": k.CreatedAt,
					"expiresAt": k.ExpiresAt,
					"lastUsed":  k.LastUsed,
				}
			}
			json.NewEncoder(w).Encode(safeKeys)

		case http.MethodPost:
			var req struct {
				Name string `json:"name"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				jsonError(w, "invalid request", http.StatusBadRequest)
				return
			}
			if req.Name == "" {
				req.Name = "API Key"
			}

			apiKey := store.CreateAPIKey(session.UserID, req.Name, 90*24*time.Hour)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"key":       apiKey.Key,
				"name":      apiKey.Name,
				"createdAt": apiKey.CreatedAt,
				"expiresAt": apiKey.ExpiresAt,
			})

		case http.MethodDelete:
			var req struct {
				Key string `json:"key"`
			}
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				jsonError(w, "invalid request", http.StatusBadRequest)
				return
			}
			store.RevokeAPIKey(req.Key)
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, `{"status":"revoked"}`)

		default:
			jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}
}
