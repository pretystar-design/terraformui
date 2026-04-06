# Design: User Stories Implementation

## Architecture

### Frontend (React + Vite + TypeScript)
- **Canvas**: React Flow for visual node/edge manipulation with drag-drop, pan/zoom
- **State Management**: Zustand for canvas state (nodes, edges, selection, undo/redo)
- **UI Components**: Radix UI primitives with Tailwind CSS v4 styling
- **HCL Generation**: TypeScript engine converting canvas model to Terraform HCL
- **i18n**: i18next for English/Chinese translations

### Backend (Go stdlib)
- **HTTP Server**: Standard library `net/http` with middleware chain
- **Authentication**: Session-based auth with mock users, API key support
- **Audit Logging**: File-based audit log with admin-only access
- **Terraform Integration**: Spawns `terraform validate` and `terraform plan` in temp directories
- **CORS**: Middleware for frontend development server communication

### CLI (Go)
- **Commands**: `tfg generate`, `tfg validate`
- **Input**: JSON project model file
- **Output**: `.tf` files in specified directory

## Key Decisions

### 1. Canvas Library: React Flow
- Provides built-in drag-drop, connections, pan/zoom
- Custom node rendering with provider-specific styling
- Edge-based dependency tracking for `depends_on` generation

### 2. State Management: Zustand
- Lightweight, no boilerplate compared to Redux
- Selective subscriptions for performance (`useStore((s) => s.field)`)
- Built-in undo/redo via state snapshots

### 3. HCL Generation: String Builder
- Simple string concatenation for readability
- Deterministic output (sorted keys, consistent formatting)
- No external HCL library dependency

### 4. Authentication: Session + API Key
- Session tokens for browser UI (cookie-based)
- API keys for programmatic/CI access (header-based)
- Mock users for development, SSO-ready architecture

### 5. Project Storage: localStorage
- Client-side persistence for rapid development
- JSON export/import for project sharing
- Future-ready for server-side storage migration

## Non-Functional Requirements
- **Performance**: UI response < 150ms, HCL preview < 200ms
- **Scalability**: Support 500+ nodes on canvas
- **Reliability**: Exported `.tf` passes `terraform validate`
- **Security**: TLS, secure token storage, immutable audit logs
- **Accessibility**: WCAG 2.1 AA compliance
- **Test Coverage**: ≥ 80% across frontend and backend
