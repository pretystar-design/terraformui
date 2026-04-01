# Detailed Requirements — Graphical Terraform Code Generation Tool

## Document Info
- **Source**: `user_stories.md`
- **Date**: 2026-04-01
- **Status**: Draft

---

## US-001: 基础资源编辑 (Basic Resource Editing)

### Description
Users can visually construct infrastructure by dragging cloud resource nodes from a palette onto an infinite canvas. Nodes represent AWS, Azure, and GCP resources.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | Left sidebar displays categorized resource palette (AWS, Azure, GCP tabs) | Must |
| FR-001.2 | Dragging a resource from palette onto canvas creates a node with unique auto-generated ID | Must |
| FR-001.3 | Nodes display resource icon, type name, and user-assigned label | Must |
| FR-001.4 | Nodes can be freely repositioned on canvas via drag | Must |
| FR-001.5 | Nodes can be selected (single) and multi-selected (Shift+Click / box select) | Must |
| FR-001.6 | Selected nodes can be deleted (Delete key or context menu) | Must |
| FR-001.7 | Undo/Redo for all canvas operations (Ctrl+Z / Ctrl+Y) | Must |
| FR-001.8 | Canvas supports pan (middle-mouse drag) and zoom (scroll wheel) | Must |
| FR-001.9 | Right-click context menu on nodes: Rename, Delete, Duplicate, Connect | Should |
| FR-001.10 | Minimap in bottom-right corner for large diagrams | Could |

### Acceptance Criteria
- Dragging `aws_instance` from palette creates a visually distinct node on canvas
- Each node receives a unique ID (format: `{type}_{uuid_short}` e.g., `aws_instance_a1b2c3`)
- Canvas handles 500+ nodes without frame drops (<16ms per frame)
- Undo stack preserves at least 50 operations
- Zoom range: 10% to 500%

### Technical Considerations
- Canvas library: React Flow / Konva / custom SVG
- Node IDs must be stable across save/load cycles
- Palette data sourced from provider schema definitions (see US-005)

### Dependencies
- US-005 (Provider library) for resource palette data
- US-009 (Project management) for save/load

---

## US-002: 属性配置 (Property Configuration)

### Description
Selecting a node opens a property panel where users fill in required and optional fields. The panel validates input against the provider's resource schema.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Clicking a node opens property panel (right sidebar) | Must |
| FR-002.2 | Panel displays all configurable attributes grouped by category | Must |
| FR-002.3 | Required fields marked with asterisk; empty required fields block generation | Must |
| FR-002.4 | Type-aware input controls: text, number, dropdown, toggle, multi-select | Must |
| FR-002.5 | Real-time validation with inline error messages | Must |
| FR-002.6 | Default values pre-filled from provider schema defaults | Should |
| FR-002.7 | Attribute descriptions/tooltips on hover | Should |
| FR-002.8 | Support for Terraform expressions (`${var.name}`, `aws_vpc.main.id`) | Must |
| FR-002.9 | JSON/YAML raw edit mode for complex attributes (e.g., `tags`, `policy`) | Could |

### Acceptance Criteria
- Selecting an `aws_instance` node shows fields: `ami`, `instance_type`, `key_name`, `tags`, etc.
- Leaving a required field empty shows red border + error message
- Entering invalid type (e.g., string in number field) shows immediate validation error
- Terraform expression syntax accepted without validation errors
- Panel closes when clicking canvas background or another node

### Technical Considerations
- Provider schemas loaded as JSON Schema or custom format
- Validation engine: Ajv (JSON Schema) or custom rule engine
- Expression fields bypass type validation but flag warnings

### Dependencies
- US-005 (Provider library) for schema definitions
- US-003 (HCL preview) to reflect property changes

---

## US-003: 实时 HCL 预览 (Real-time HCL Preview)

### Description
A live HCL preview panel updates automatically as users modify the canvas — adding nodes, changing properties, or creating connections.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | HCL preview panel visible as split pane or tab | Must |
| FR-003.2 | Preview updates on every canvas change (node add/edit/delete/connect) | Must |
| FR-003.3 | Update latency < 200ms from user action to preview refresh | Must |
| FR-003.4 | Syntax-highlighted HCL output | Must |
| FR-003.5 | Preview reflects current canvas state exactly (no stale data) | Must |
| FR-003.6 | Copy-to-clipboard button for generated HCL | Should |
| FR-003.7 | Toggle to show/hide preview panel | Should |
| FR-003.8 | Diff view showing changes since last save | Could |

### Acceptance Criteria
- Adding an `aws_instance` node with `ami` and `instance_type` produces valid HCL within 200ms
- Modifying a property updates only the affected resource block (not full regeneration flicker)
- Generated HCL passes `terraform fmt` without modifications
- Syntax highlighting uses standard HCL/HashiCorp theme

### Technical Considerations
- HCL generation runs client-side (WebAssembly Go or TypeScript port)
- Debounce updates: 50ms to avoid excessive regeneration during rapid typing
- Use existing `generator.go` logic as reference; port to TypeScript or compile to WASM

### Dependencies
- US-001 (Canvas) for change events
- US-002 (Properties) for attribute data
- US-004 (Export) shares same generation engine

---

## US-004: 代码导出 (Code Export)

### Description
Users can export generated Terraform code as individual `.tf` files or a structured ZIP archive ready for deployment.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Export button in toolbar | Must |
| FR-004.2 | Export options: single `.tf` file, ZIP with `main.tf` + `variables.tf` + `outputs.tf` | Must |
| FR-004.3 | Exported files pass `terraform fmt` validation | Must |
| FR-004.4 | ZIP includes `README.md` with project metadata | Should |
| FR-004.5 | Export respects module boundaries (if modules defined) | Should |
| FR-004.6 | Auto-generated `variables.tf` for parameterized values | Should |
| FR-004.7 | Export to GitHub repository (OAuth flow) | Could |

### Acceptance Criteria
- Clicking Export → ZIP downloads a file containing valid `.tf` files
- Running `terraform fmt -check` on exported files returns exit code 0
- Running `terraform init` on exported directory succeeds (assuming provider availability)
- Export completes within 2 seconds for 100-node projects

### Technical Considerations
- ZIP generation via JSZip (client-side) or backend service
- File structure:
  ```
  project-name/
  ├── main.tf          # All resources
  ├── variables.tf     # Input variables
  ├── outputs.tf       # Output definitions
  ├── providers.tf     # Provider configurations
  └── README.md        # Project info
  ```

### Dependencies
- US-003 (HCL generation engine)
- US-009 (Project metadata for README)

---

## US-005: Provider 与模块库 (Provider & Module Library)

### Description
A searchable, browsable library of official provider resources and modules displayed in the left sidebar palette.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Left sidebar with tabbed provider sections (AWS, Azure, GCP) | Must |
| FR-005.2 | Search bar filters resources by name across all providers | Must |
| FR-005.3 | Resources grouped by service (e.g., AWS: EC2, S3, RDS, VPC) | Must |
| FR-005.4 | Each resource shows icon, name, and brief description | Must |
| FR-005.5 | Clicking a resource shows detailed schema in tooltip/panel | Should |
| FR-005.6 | Module library section for reusable Terraform modules | Should |
| FR-005.7 | Favorite/pin frequently used resources | Could |
| FR-005.8 | Custom provider support via plugin (see US-008) | Could |

### Acceptance Criteria
- Searching "instance" shows `aws_instance`, `azurerm_linux_virtual_machine`, `google_compute_instance`
- Clicking AWS tab shows resources grouped: EC2, S3, RDS, IAM, VPC, etc.
- Dragging any listed resource onto canvas creates a valid node
- Library loads within 1 second (cached)

### Technical Considerations
- Resource metadata sourced from Terraform Registry API or bundled JSON
- Schema data includes: required fields, types, descriptions, defaults
- Bundle size optimization: lazy-load provider schemas on demand
- Data format:
  ```json
  {
    "provider": "aws",
    "service": "ec2",
    "resource": "aws_instance",
    "icon": "...",
    "attributes": [
      {"name": "ami", "type": "string", "required": true, "description": "..."},
      {"name": "instance_type", "type": "string", "required": true, "default": "t2.micro"}
    ]
  }
  ```

### Dependencies
- US-001 (Canvas) for drag-drop target
- US-002 (Properties) for schema-driven panels

---

## US-006: 代码验证 & 计划 (Code Validation & Plan)

### Description
A Validate/Plan button runs `terraform validate` and `terraform plan` in the background, surfacing errors and warnings directly on the canvas.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | "Validate" button runs `terraform validate` on generated code | Must |
| FR-006.2 | "Plan" button runs `terraform plan` (requires credentials) | Must |
| FR-006.3 | Validation errors highlighted on canvas nodes (red border + tooltip) | Must |
| FR-006.4 | Validation warnings shown as yellow indicators | Should |
| FR-006.5 | Plan output (add/change/destroy summary) displayed in panel | Must |
| FR-006.6 | Plan diff view showing resource-level changes | Should |
| FR-006.7 | Credentials managed via environment variables or cloud auth | Must |
| FR-006.8 | Validation runs automatically on export | Should |

### Acceptance Criteria
- Clicking Validate on invalid config shows specific error: "Missing required argument 'ami'"
- Error indicator appears on the offending node with clickable tooltip
- Plan output shows: "Plan: 2 to add, 0 to change, 0 to destroy"
- Validation completes within 5 seconds for 100-node projects
- Credentials never stored in browser; passed via secure channel

### Technical Considerations
- Backend service required for `terraform` CLI execution (sandboxed)
- Docker container per validation request with isolated workspace
- Credentials passed via environment, never persisted
- WebSocket or SSE for streaming plan output
- Security: sandbox execution, resource limits, timeout (60s max)

### Dependencies
- US-003 (HCL generation) for code to validate
- US-010 (SSO/Auth) for credential management

---

## US-007: 现有基础设施导入 (Existing Infrastructure Import)

### Description
Users can import existing `tfstate` files or Terraform project directories to reconstruct the current infrastructure on the canvas.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Import dialog accepts: `tfstate` file, `tfstate` JSON, or project directory | Must |
| FR-007.2 | Parses `terraform state pull` output to extract resources | Must |
| FR-007.3 | Reconstructs nodes with correct types and attributes on canvas | Must |
| FR-007.4 | Infers dependency edges from resource references | Should |
| FR-007.5 | Imported nodes visually distinguished (e.g., dashed border) | Should |
| FR-007.6 | Import preview before committing to canvas | Should |
| FR-007.7 | Supports remote state backends (S3, GCS, Azure Blob) | Could |
| FR-007.8 | Conflict resolution when importing into existing project | Should |

### Acceptance Criteria
- Importing a `tfstate` with 3 `aws_instance` resources creates 3 nodes on canvas
- Each node populated with attributes from state (ami, instance_type, etc.)
- Dependencies inferred from `depends_on` and reference expressions
- Import completes within 10 seconds for 200-resource state files
- Invalid state file shows clear error message

### Technical Considerations
- State parser handles both v3 and v4 state formats
- Reference inference: parse attribute values for `${resource_type.resource_name.attr}` patterns
- Large state files: stream processing, not full in-memory load
- Backend service for remote state access (with auth)

### Dependencies
- US-001 (Canvas) for node rendering
- US-009 (Project management) for import target selection

---

## US-008: 插件化扩展 (Plugin Architecture)

### Description
A plugin API allows developers to define UI components and schemas for custom or internal providers not in the standard library.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Plugin manifest format (JSON/YAML) defining provider metadata | Must |
| FR-008.2 | Plugin can register custom resource types with icons and schemas | Must |
| FR-008.3 | Plugin can register custom UI components for property editing | Must |
| FR-008.4 | Plugin SDK with TypeScript types and build tools | Must |
| FR-008.5 | Plugin marketplace/install mechanism | Should |
| FR-008.6 | Plugin sandboxing (no arbitrary code execution) | Must |
| FR-008.7 | Hot-reload plugins during development | Should |
| FR-008.8 | Plugin versioning and compatibility checks | Should |

### Acceptance Criteria
- Developer creates a plugin JSON manifest + schema → custom resources appear in palette
- Custom property editor component renders when editing plugin resource attributes
- Plugin installation: drop files in `~/.terraform-visual-gen/plugins/` and restart
- Invalid plugin shows error in plugin manager, doesn't crash app
- Plugin API documentation available with example plugins

### Technical Considerations
- Plugin format:
  ```json
  {
    "name": "my-provider",
    "version": "1.0.0",
    "resources": [
      {
        "type": "my_resource",
        "icon": "data:image/svg+xml,...",
        "schema": { "required": ["name"], "properties": {...} }
      }
    ],
    "components": {
      "propertyEditor": "./components/MyPropertyEditor.jsx"
    }
  }
  ```
- Component loading: dynamic import with sandboxed iframe or Web Worker
- Security: schema-only plugins (no code) vs full plugins (code execution in sandbox)

### Dependencies
- US-005 (Provider library) for plugin integration point

---

## US-009: 项目切换与版本管理 (Project Switching & Version Management)

### Description
Users manage multiple projects, save models, and access version history with rollback capability.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009.1 | Project list view with name, last modified, node count | Must |
| FR-009.2 | Create / Rename / Delete / Duplicate projects | Must |
| FR-009.3 | Auto-save every 30 seconds and on every significant change | Must |
| FR-009.4 | Manual save with optional commit message | Must |
| FR-009.5 | Version history timeline with snapshots | Should |
| FR-009.6 | Rollback to any previous version | Should |
| FR-009.7 | Diff between versions (node/edge/property changes) | Should |
| FR-009.8 | Project export/import as `.tvg` (custom format) or JSON | Must |
| FR-009.9 | Cloud sync for team collaboration | Could |

### Acceptance Criteria
- Creating a new project starts with empty canvas
- Auto-save indicator shows "Saved" / "Saving..." / "Unsaved changes"
- Version history shows timestamps and node counts per snapshot
- Rolling back to v3 restores canvas to exact state at v3
- Project file (.tvg) can be shared and imported on another machine

### Technical Considerations
- Storage: IndexedDB (local) + optional cloud backend
- Snapshot format: serialized canvas state (nodes, edges, positions, properties)
- Version control: append-only log with snapshot deltas
- Conflict resolution: last-write-wins for local; merge strategy for cloud

### Dependencies
- US-010 (Auth) for cloud-synced projects

---

## US-010: 权限与审计 (Permissions & Audit)

### Description
Enterprise-grade authentication via SSO and comprehensive audit logging of all user operations.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-010.1 | SSO login via SAML 2.0 / OIDC (Okta, Azure AD, Google Workspace) | Must |
| FR-010.2 | Role-based access: Admin, Editor, Viewer | Must |
| FR-010.3 | Audit log captures: user, action, timestamp, resource, before/after | Must |
| FR-010.4 | Audit log export (CSV, JSON) | Should |
| FR-010.5 | Admin dashboard for user management | Should |
| FR-010.6 | Session timeout and re-authentication for sensitive operations | Should |
| FR-010.7 | Immutable audit log (append-only, tamper-evident) | Must |
| FR-010.8 | API key management for CI integration (US-012) | Should |

### Acceptance Criteria
- User logs in via corporate SSO → granted access based on group membership
- Editor creates a node → audit log records: `{user: "alice", action: "node.create", resource: "aws_instance_x", timestamp: "..."}`
- Admin views audit log filtered by user and date range
- Viewer role cannot modify canvas or export code
- Session expires after 8 hours of inactivity

### Technical Considerations
- Auth provider: Keycloak / Auth0 / cloud-native
- Audit log storage: append-only database (e.g., DynamoDB with stream)
- RBAC enforced at API gateway and application layer
- Token management: short-lived JWT with refresh tokens

### Dependencies
- US-012 (CI integration) for API key auth

---

## US-011: 本地化与多语言 (Localization & Multi-language)

### Description
UI supports language toggling between Chinese (Simplified) and English, with extensible architecture for additional languages.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-011.1 | Language toggle in user settings (Chinese / English) | Must |
| FR-011.2 | All UI labels, buttons, menus, tooltips translated | Must |
| FR-011.3 | Error messages and validation text translated | Must |
| FR-011.4 | Language preference persisted per user | Must |
| FR-011.5 | Resource names and provider terms remain in English (industry standard) | Must |
| FR-011.6 | Date/time/number formatting follows locale conventions | Should |
| FR-011.7 | RTL language support (future) | Could |

### Acceptance Criteria
- Toggling to Chinese translates all UI text instantly without page reload
- Technical terms (`aws_instance`, `depends_on`, `terraform plan`) remain in English
- Error messages display in selected language
- Language preference persists across sessions

### Technical Considerations
- i18n library: react-i18next or next-intl
- Translation files: JSON per locale (`en.json`, `zh.json`)
- Key naming convention: `feature.component.element` (e.g., `canvas.toolbar.export`)
- Missing translations fall back to English with dev warning

### Dependencies
- None (cross-cutting concern)

---

## US-012: CI 集成 (CI Integration)

### Description
Expose CLI and REST endpoints for CI/CD pipelines to generate HCL from saved models and run validation checks.

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-012.1 | CLI command: `tvg generate <project.json> --output ./tf/` | Must |
| FR-012.2 | CLI command: `tvg validate <project.json>` | Must |
| FR-012.3 | CLI command: `tvg plan <project.json> --credentials-env` | Must |
| FR-012.4 | REST API: `POST /api/generate` with project JSON body | Must |
| FR-012.5 | REST API: `POST /api/validate` returns validation results | Must |
| FR-012.6 | REST API authentication via API key or OAuth token | Must |
| FR-012.7 | Exit code 0 on success, non-zero on failure (for CI) | Must |
| FR-012.8 | JSON output mode for machine-readable results | Must |
| FR-012.9 | GitHub Action / GitLab CI template provided | Should |
| FR-012.10 | Webhook support for triggering generation on model change | Could |

### Acceptance Criteria
- `tvg generate model.json --output ./out/` produces `.tf` files in `./out/`
- `tvg validate model.json` exits 0 if valid, 1 if invalid, prints errors to stderr
- REST API `POST /api/generate` returns 200 with HCL string or ZIP
- Invalid API key returns 401 with JSON error body
- GitHub Action template runs `tvg validate` on PR to infrastructure model

### Technical Considerations
- CLI built from existing Go codebase (`main.go` extended)
- REST API: lightweight Go HTTP server or serverless function
- API key rotation and revocation support
- Rate limiting on REST endpoints
- Output formats: HCL string, ZIP archive, JSON summary

### Dependencies
- US-003 (HCL generation engine)
- US-006 (Validation engine)
- US-010 (API key management)

---

## Non-Functional Requirements

| ID | Category | Requirement | Target |
|----|----------|-------------|--------|
| NFR-001 | Performance | UI interaction response time (drag, click, edit) | < 150ms |
| NFR-002 | Performance | HCL preview generation latency | < 200ms |
| NFR-003 | Performance | Canvas render with 500 nodes | 60fps |
| NFR-004 | Performance | Export completion for 100-node project | < 2s |
| NFR-005 | Performance | Import completion for 200-resource state | < 10s |
| NFR-006 | Performance | Validation completion for 100-node project | < 5s |
| NFR-007 | Reliability | Exported `.tf` passes `terraform validate` | 100% |
| NFR-008 | Reliability | Auto-save data loss window | < 30s |
| NFR-009 | Security | All API traffic encrypted | TLS 1.2+ |
| NFR-010 | Security | SSO tokens stored securely | httpOnly cookies |
| NFR-011 | Security | Audit log tamper resistance | Append-only, hashed |
| NFR-012 | Security | Credentials never stored in browser | Ephemeral only |
| NFR-013 | Usability | Keyboard shortcuts for common actions | Documented |
| NFR-014 | Usability | Accessibility compliance | WCAG 2.1 AA |
| NFR-015 | Maintainability | Test coverage | ≥ 80% |
| NFR-016 | Maintainability | CI pipeline on every push | Lint + Unit + Integration |
| NFR-017 | Scalability | Maximum supported diagram size | 500 nodes |
| NFR-018 | Scalability | Concurrent users (cloud deployment) | 100+ |

---

## Implementation Priority Phases

### Phase 1 — MVP (Weeks 1-4)
- US-001: Basic resource editing (AWS only)
- US-002: Property configuration
- US-003: Real-time HCL preview
- US-004: Code export (single `.tf`)

### Phase 2 — Core (Weeks 5-8)
- US-005: Provider & module library (AWS, Azure, GCP)
- US-006: Code validation & plan
- US-009: Project switching & version management
- US-011: Localization (Chinese/English)

### Phase 3 — Advanced (Weeks 9-12)
- US-007: Existing infrastructure import
- US-008: Plugin architecture
- US-012: CI integration

### Phase 4 — Enterprise (Weeks 13-16)
- US-010: Permissions & audit
- US-012: REST API + GitHub Action
- NFR hardening (performance, security, accessibility)
