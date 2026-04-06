# Tasks: User Stories Implementation

## US-001: Canvas Node Management
- [x] Set up React Flow canvas with pan/zoom and dot grid background
- [x] Implement drag-and-drop from sidebar to canvas
- [x] Create custom node component with provider icon, label, and type display
- [x] Implement edge creation between nodes (drag handle to handle)
- [x] Add multi-select with Shift+click and Delete key support
- [x] Implement undo/redo stack (50 entries max)

## US-002: Property Panel
- [x] Build property panel layout with header, body, and actions sections
- [x] Implement schema-based field generation from provider catalog
- [x] Add required field validation with visual error indicators
- [x] Implement duplicate and delete node actions
- [x] Add grouped attribute display by category (basic, networking, security)
- [x] Implement Tags section with Name and Environment fields

## US-003: HCL Preview
- [x] Implement real-time HCL generation from canvas state
- [x] Add Prism.js syntax highlighting for HCL
- [x] Implement copy-to-clipboard with visual feedback
- [x] Add empty state placeholder message

## US-004: Export
- [x] Implement single `.tf` file export
- [x] Implement ZIP archive export with JSZip
- [x] Add export format selection dropdown in toolbar
- [x] Ensure exported HCL passes `terraform fmt` rules

## US-005: Provider Resource Library
- [x] Create provider catalog data (AWS, Azure, GCP)
- [x] Build sidebar with provider tabs
- [x] Implement service grouping with collapsible sections
- [x] Add real-time search with debounced filtering
- [x] Make resource items draggable onto canvas

## US-006: Validation & Plan
- [x] Implement `/api/validate` endpoint with `terraform validate -json`
- [x] Implement `/api/plan` endpoint with `terraform init` and `terraform plan`
- [x] Add validate and plan buttons to toolbar
- [x] Display validation errors and plan results in UI

## US-007: Import
- [x] Build import dialog with drag-and-drop zone
- [x] Implement tfstate parser to extract resources and attributes
- [x] Add reference inference for automatic edge creation
- [x] Implement project JSON import

## US-008: Plugin System
- [x] Design plugin API interface with registration hooks
- [x] Implement plugin loader from `src/plugins/` directory
- [x] Add plugin manifest schema (`plugin.json`)
- [x] Implement custom field type registration for property panel

## US-009: Project Management
- [x] Implement project CRUD with localStorage persistence
- [x] Add auto-save with 30-second interval
- [x] Build snapshot/version history with restore capability
- [x] Implement project switcher in toolbar

## US-010: Auth & Audit
- [x] Implement session-based authentication with mock users
- [x] Add API key management (create, list, revoke)
- [x] Implement role-based access control middleware
- [x] Build audit logging with file persistence
- [x] Add admin-only audit log endpoint

## US-011: i18n
- [x] Set up i18next with English and Chinese translation files
- [x] Add language toggle button in toolbar
- [x] Translate all UI labels, buttons, and messages
- [x] Persist language preference in localStorage

## US-012: CI Integration
- [x] Implement REST API endpoints (`/api/generate`, `/api/validate`, `/api/plan`)
- [x] Build CLI tool with `generate` and `validate` commands
- [x] Add CORS middleware for frontend communication
- [x] Implement health check endpoint (`/api/health`)
