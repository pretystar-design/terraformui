# Implementation Tasks

This document breaks down the implementation into detailed tasks with:
- **Inputs**: What the task receives
- **Outputs**: What the task produces
- **Dependencies**: Prerequisite tasks
- **Verification**: How to verify completion
- **Completion Criteria**: Definition of done
- **Failure Handling**: What to do on failure

## Task Checklist

- [x] A.1: Core Type Definitions
- [x] A.2: Provider Data Catalog
- [x] A.3: Zustand Canvas Store Foundation
- [x] A.4: Zustand Project Store Foundation
- [x] A.5: i18n Infrastructure Setup
- [x] B.1: React Flow Canvas Component
- [x] B.2: Left Sidebar Palette Component
- [x] B.3: Property Panel Component
- [x] B.4: HCL Generation Engine
- [x] C.1: HCL Preview Panel
- [x] C.2: Code Export Functionality
- [x] C.3: Toolbar Component
- [x] D.1: Go Server Validation Endpoint
- [x] D.2: Go Server Plan Endpoint
- [x] D.3: CLI Enhancement
- [x] E.1: tfstate Parser
- [x] E.2: Import Dialog Component
- [x] E.3: Plugin System Foundation
- [x] F.1: SSO Integration (mock auth for development)
- [x] F.2: Audit Logging (backend middleware + storage)
- [x] F.3: REST API Authentication (API key middleware)

---

## Parallel Group A: Foundation Layer (No Inter-Dependencies)

These tasks can be executed simultaneously as they have no dependencies on each other.

---

### Task A.1: Core Type Definitions

**Priority**: P0 | **Estimate**: 2h | **Type**: Implementation

**Description**: Define TypeScript interfaces and types for the entire application.

**Input**:
- Existing `model.go` types (Node, Edge, Project)
- requirements.md type specifications

**Output**:
- `frontend/src/types/index.ts` with all type definitions
- `frontend/src/types/node.ts` for node-related types
- `frontend/src/types/edge.ts` for edge-related types
- `frontend/src/types/project.ts` for project types
- `frontend/src/types/provider.ts` for provider schema types

**Dependencies**: None

**Verification**:
```bash
cd frontend && npx tsc -b
```

**Completion Criteria**:
- All types compile without errors
- Types match Go model definitions
- No `any` types used

**Failure Handling**:
- Review Go model.go for exact type definitions
- Ensure TypeScript strict mode compatibility

---

### Task A.2: Provider Data Catalog (US-005 Foundation)

**Priority**: P0 | **Estimate**: 4h | **Type**: Implementation

**Description**: Create bundled JSON catalog of AWS, Azure, GCP resource schemas.

**Input**:
- Terraform Registry API documentation
- Provider schema specifications

**Output**:
- `frontend/src/lib/provider-data.ts` with resource catalog
- `frontend/src/data/providers/aws.json`
- `frontend/src/data/providers/azure.json`
- `frontend/src/data/providers/gcp.json`

**Dependencies**: Task A.1 (Core Type Definitions)

**Verification**:
```bash
cd frontend && npm test -- --grep "provider-data"
```

**Completion Criteria**:
- At least 10 resources per provider (MVP)
- Each resource has: type, icon, attributes, required fields
- JSON schema valid for all entries

**Failure Handling**:
- Start with minimal subset of resources
- Add placeholder icons if official icons unavailable

---

### Task A.3: Zustand Canvas Store Foundation

**Priority**: P0 | **Estimate**: 3h | **Type**: Implementation

**Description**: Create Zustand store for canvas state management.

**Input**:
- React Flow state patterns
- Task A.1 type definitions

**Output**:
- `frontend/src/store/canvas-store.ts`

**Dependencies**: Task A.1 (Core Type Definitions)

**Verification**:
```bash
cd frontend && npm test -- --grep "canvas-store"
```

**Completion Criteria**:
- Store manages: nodes, edges, selection, viewport
- Actions for: addNode, removeNode, updateNode, addEdge, removeEdge
- Selector hooks for selective subscriptions
- Persist middleware configured

**Failure Handling**:
- Review Zustand documentation for best practices
- Simplify to core operations if complexity issues

---

### Task A.4: Zustand Project Store Foundation

**Priority**: P0 | **Estimate**: 3h | **Type**: Implementation

**Description**: Create Zustand store for project management.

**Input**:
- Task A.1 type definitions
- US-009 requirements

**Output**:
- `frontend/src/store/project-store.ts`

**Dependencies**: Task A.1 (Core Type Definitions)

**Verification**:
```bash
cd frontend && npm test -- --grep "project-store"
```

**Completion Criteria**:
- Store manages: projects, activeProject, snapshots
- Actions for: createProject, deleteProject, saveProject, loadProject
- Auto-save middleware (debounced 30s)

**Failure Handling**:
- Start without auto-save, add later
- Use localStorage fallback if IndexedDB issues

---

### Task A.5: i18n Infrastructure Setup (US-011 Foundation)

**Priority**: P1 | **Estimate**: 2h | **Type**: Implementation

**Description**: Set up i18next internationalization framework.

**Input**:
- i18next documentation
- US-011 requirements

**Output**:
- `frontend/src/i18n/index.ts`
- `frontend/src/i18n/locales/en.json`
- `frontend/src/i18n/locales/zh.json`

**Dependencies**: None

**Verification**:
```bash
cd frontend && npm test -- --grep "i18n"
```

**Completion Criteria**:
- i18next initialized with React bindings
- Language toggle working
- All translation keys defined for MVP components

**Failure Handling**:
- Start with English only
- Add Chinese translations incrementally

---

## Parallel Group B: Core Canvas (Depends on Group A)

These tasks depend on Group A completion but can run in parallel within Group B.

---

### Task B.1: React Flow Canvas Component (US-001)

**Priority**: P0 | **Estimate**: 6h | **Type**: Implementation

**Description**: Implement the main canvas with React Flow.

**Input**:
- Task A.1 types
- Task A.2 provider data
- Task A.3 canvas store
- React Flow library

**Output**:
- `frontend/src/components/canvas/Canvas.tsx`
- `frontend/src/components/canvas/ResourceNode.tsx`
- `frontend/src/components/canvas/Canvas.test.tsx`

**Dependencies**: Task A.1, A.2, A.3

**Verification**:
```bash
cd frontend && npm test -- --grep "Canvas"
```

**Completion Criteria**:
- Drag-drop from palette creates nodes
- Nodes display icon, type, label
- Pan and zoom work correctly
- Selection highlights nodes
- Delete key removes selected nodes

**Failure Handling**:
- Check React Flow event handlers
- Verify DnD integration with palette

---

### Task B.2: Left Sidebar Palette Component (US-005)

**Priority**: P0 | **Estimate**: 4h | **Type**: Implementation

**Description**: Implement searchable resource palette.

**Input**:
- Task A.2 provider data
- React Flow DnD utilities

**Output**:
- `frontend/src/components/sidebar/Sidebar.tsx`
- `frontend/src/components/sidebar/ProviderTabs.tsx`
- `frontend/src/components/sidebar/ResourcePalette.tsx`
- `frontend/src/components/sidebar/SearchBar.tsx`

**Dependencies**: Task A.2

**Verification**:
```bash
cd frontend && npm test -- --grep "Sidebar"
```

**Completion Criteria**:
- Tabbed sections for AWS, Azure, GCP
- Search filters resources by name
- Drag initiates from palette items
- Resources grouped by service category

**Failure Handling**:
- Simplify to single provider (AWS) initially
- Defer search if performance issues

---

### Task B.3: Property Panel Component (US-002)

**Priority**: P0 | **Estimate**: 6h | **Type**: Implementation

**Description**: Implement schema-driven property editor.

**Input**:
- Task A.1 types
- Task A.2 provider schemas
- Task A.3 canvas store

**Output**:
- `frontend/src/components/property-panel/PropertyPanel.tsx`
- `frontend/src/components/property-panel/PropertyField.tsx`
- `frontend/src/components/property-panel/ValidationMessage.tsx`

**Dependencies**: Task A.2, A.3

**Verification**:
```bash
cd frontend && npm test -- --grep "PropertyPanel"
```

**Completion Criteria**:
- Panel opens on node selection
- Fields generated from schema
- Required fields marked with asterisk
- Real-time validation with error display
- Type-aware input controls (text, number, dropdown)

**Failure Handling**:
- Start with text inputs only
- Add type-aware controls incrementally

---

### Task B.4: HCL Generation Engine (US-003 Foundation)

**Priority**: P0 | **Estimate**: 4h | **Type**: Implementation

**Description**: Port Go HCL generator to TypeScript.

**Input**:
- `generator.go` logic
- `generate_hcl.py` for reference

**Output**:
- `frontend/src/lib/generate-hcl.ts`
- `frontend/src/lib/generate-hcl.test.ts`

**Dependencies**: Task A.1

**Verification**:
```bash
cd frontend && npm test -- --grep "generate-hcl"
```

**Completion Criteria**:
- Generates valid HCL from Node[] and Edge[]
- Output matches Go generator for same input
- Handles all basic resource types
- Test coverage > 90%

**Failure Handling**:
- Compare output with Go generator line-by-line
- Focus on AWS resources first

---

## Parallel Group C: Preview & Export (Depends on Group B)

---

### Task C.1: HCL Preview Panel (US-003)

**Priority**: P0 | **Estimate**: 4h | **Type**: Implementation

**Description**: Implement real-time HCL preview with syntax highlighting.

**Input**:
- Task B.4 HCL generator
- Prism.js for syntax highlighting

**Output**:
- `frontend/src/components/preview/HCLPreview.tsx`
- `frontend/src/hooks/useHCLPreview.ts`

**Dependencies**: Task B.4

**Verification**:
```bash
cd frontend && npm test -- --grep "HCLPreview"
```

**Completion Criteria**:
- Preview updates on canvas changes (debounced 50ms)
- Update latency < 200ms
- Syntax highlighting with HCL theme
- Copy-to-clipboard button

**Failure Handling**:
- Increase debounce if performance issues
- Use monospace fallback if Prism issues

---

### Task C.2: Code Export Functionality (US-004)

**Priority**: P0 | **Estimate**: 3h | **Type**: Implementation

**Description**: Implement export to .tf and ZIP.

**Input**:
- Task B.4 HCL generator
- JSZip library

**Output**:
- `frontend/src/lib/export.ts`
- `frontend/src/lib/export.test.ts`

**Dependencies**: Task B.4

**Verification**:
```bash
cd frontend && npm test -- --grep "export"
```

**Completion Criteria**:
- Export single .tf file
- Export ZIP with main.tf, variables.tf, outputs.tf
- Exported code passes `terraform fmt`
- ZIP download works in browser

**Failure Handling**:
- Start with single file export
- Add ZIP later

---

### Task C.3: Toolbar Component

**Priority**: P0 | **Estimate**: 3h | **Type**: Implementation

**Description**: Implement top toolbar with actions.

**Input**:
- Task A.3, A.4 stores
- Task C.2 export functionality

**Output**:
- `frontend/src/components/toolbar/Toolbar.tsx`
- `frontend/src/components/toolbar/UndoRedoButtons.tsx`
- `frontend/src/components/toolbar/ExportButton.tsx`

**Dependencies**: Task A.3, A.4, C.2

**Verification**:
```bash
cd frontend && npm test -- --grep "Toolbar"
```

**Completion Criteria**:
- Undo/Redo buttons functional
- Export button triggers download
- Language toggle present
- Save indicator shows status

**Failure Handling**:
- Simplify to core buttons first
- Add language toggle later

---

## Parallel Group D: Backend Enhancement

These tasks can run in parallel with frontend work but require coordination.

---

### Task D.1: Go Server Validation Endpoint

**Priority**: P1 | **Estimate**: 4h | **Type**: Implementation

**Description**: Add terraform validate endpoint to Go server.

**Input**:
- `server/main.go` existing code
- Docker for sandboxed execution

**Output**:
- Updated `server/main.go` with `/api/validate`
- Dockerfile for sandboxed Terraform

**Dependencies**: None (backend task)

**Verification**:
```bash
go test -v ./server/
curl -X POST http://localhost:8080/api/validate -d '{"hcl": "..."}'
```

**Completion Criteria**:
- POST /api/validate accepts HCL
- Returns validation errors with line numbers
- Docker container isolated per request
- 60s timeout enforced

**Failure Handling**:
- Start with non-Docker execution
- Add Docker isolation later

---

### Task D.2: Go Server Plan Endpoint

**Priority**: P1 | **Estimate**: 4h | **Type**: Implementation

**Description**: Add terraform plan endpoint.

**Input**:
- Task D.1 server infrastructure

**Output**:
- Updated `server/main.go` with `/api/plan`
- WebSocket support for streaming output

**Dependencies**: Task D.1

**Verification**:
```bash
go test -v ./server/
```

**Completion Criteria**:
- POST /api/plan accepts HCL
- Streams plan output via WebSocket
- Returns add/change/destroy summary
- Credentials passed via environment

**Failure Handling**:
- Use SSE instead of WebSocket if issues
- Start with synchronous response

---

### Task D.3: CLI Enhancement

**Priority**: P1 | **Estimate**: 3h | **Type**: Implementation

**Description**: Enhance CLI with generate/validate/plan commands.

**Input**:
- `cli/main.go` existing code

**Output**:
- Updated `cli/main.go` with subcommands

**Dependencies**: None

**Verification**:
```bash
go build -o tfg ./cli/
./tfg generate model.json --output ./out/
./tfg validate model.json
```

**Completion Criteria**:
- `tvg generate <file> --output <dir>` works
- `tvg validate <file>` exits 0/1 appropriately
- `tvg plan <file>` executes plan
- JSON output mode available

**Failure Handling**:
- Focus on generate command first
- Add validate/plan later

---

## Parallel Group E: Advanced Features

These can start after Group C completion.

---

### Task E.1: tfstate Parser (US-007)

**Priority**: P2 | **Estimate**: 4h | **Type**: Implementation

**Description**: Parse tfstate files for import functionality.

**Input**:
- Terraform state format specification
- Task A.1 types

**Output**:
- `frontend/src/lib/tfstate-parser.ts`
- `frontend/src/lib/tfstate-parser.test.ts`

**Dependencies**: Task A.1
**Verification**:
```bash
cd frontend && npm test -- --grep "tfstate-parser"
```

**Completion Criteria**:
- Parses v3 and v4 state formats
- Extracts resources with attributes
- Infers dependencies from references
- Handles invalid state gracefully

**Failure Handling**:
- Start with v4 format only
- Add v3 support later

---

### Task E.2: Import Dialog Component (US-007)

**Priority**: P2 | **Estimate**: 3h | **Type**: Implementation

**Description**: UI for importing tfstate files.

**Input**:
- Task E.1 parser
- Task A.3 canvas store

**Output**:
- `frontend/src/components/ui/ImportDialog.tsx`

**Dependencies**: Task E.1, A.3

**Verification**:
```bash
cd frontend && npm test -- --grep "ImportDialog"
```

**Completion Criteria**:
- Accepts file upload (.tfstate, .tfstate.json)
- Preview before import
- Creates nodes from parsed resources

**Failure Handling**:
- Simplify to direct import without preview

---

### Task E.3: Plugin System Foundation (US-008)

**Priority**: P2 | **Estimate**: 6h | **Type**: Implementation

**Description**: Implement plugin manifest loading and registration.

**Input**:
- US-008 plugin specification

**Output**:
- `frontend/src/plugins/types.ts`
- `frontend/src/plugins/loader.ts`
- `frontend/src/plugins/registry.ts`

**Dependencies**: Task A.1, A.2

**Verification**:
```bash
cd frontend && npm test -- --grep "plugins"
```

**Completion Criteria**:
- Loads plugin manifest JSON
- Registers custom resource types
- Validates plugin schema
- Handles invalid plugins gracefully

**Failure Handling**:
- Start with schema-only plugins
- Add UI component plugins later

---

## Parallel Group F: Enterprise Features

These are lower priority and can be implemented last.

---

### Task F.1: SSO Integration (US-010)

**Priority**: P3 | **Estimate**: 6h | **Type**: Implementation

**Description**: Implement SSO authentication.

**Input**:
- SAML 2.0 / OIDC specifications

**Output**:
- Backend auth middleware
- Frontend login flow

**Dependencies**: Task D.1 (server infrastructure)

**Verification**: Manual testing with IdP

**Completion Criteria**:
- SSO login flow works
- Session management functional
- Logout clears session

**Failure Handling**:
- Start with mock auth for development
- Integrate real IdP later

---

### Task F.2: Audit Logging (US-010)

**Priority**: P3 | **Estimate**: 4h | **Type**: Implementation

**Description**: Implement audit log for all operations.

**Input**:
- US-010 audit requirements

**Output**:
- Backend audit middleware
- Audit log storage

**Dependencies**: Task F.1

**Verification**:
```bash
go test -v ./server/
```

**Completion Criteria**:
- All operations logged with user, action, timestamp
- Logs stored in append-only format
- Export functionality available

**Failure Handling**:
- Log to file initially
- Add database later

---

### Task F.3: REST API Authentication

**Priority**: P3 | **Estimate**: 3h | **Type**: Implementation

**Description**: Add API key authentication for REST endpoints.

**Input**:
- Task F.1 auth infrastructure

**Output**:
- API key generation
- Key validation middleware

**Dependencies**: Task F.1

**Verification**:
```bash
curl -H "Authorization: Bearer <key>" http://localhost:8080/api/generate
```

**Completion Criteria**:
- API keys can be generated
- Keys validate on API requests
- 401 returned for invalid keys

**Failure Handling**:
- Start with static keys for testing
- Add dynamic generation later

---

## Task Summary by Parallel Group

| Group | Tasks | Dependencies | Parallel Within Group |
|-------|-------|--------------|----------------------|
| A | A.1, A.2, A.3, A.4, A.5 | None | Yes (all independent) |
| B | B.1, B.2, B.3, B.4 | Group A | Yes |
| C | C.1, C.2, C.3 | Group B | Yes |
| D | D.1, D.2, D.3 | None (backend) | Yes |
| E | E.1, E.2, E.3 | Groups A, C | Yes |
| F | F.1, F.2, F.3 | Group D | F.1 → F.2 → F.3 (sequential) |

---

## Estimated Timeline

| Phase | Groups | Duration | Parallel Workers |
|-------|--------|----------|-----------------|
| Week 1-2 | A + D | 2 weeks | 3-5 developers |
| Week 3-4 | B + D.cont | 2 weeks | 3-5 developers |
| Week 5-6 | C + E | 2 weeks | 3-5 developers |
| Week 7-8 | E.cont + F | 2 weeks | 2-3 developers |

---

## Unit Test Tasks (Pre-Implementation)

For pure logic methods without I/O, generate tests first:

### Test Task T.1: HCL Generator Tests
**Depends on**: None | **Before**: Task B.4
**Output**: `frontend/src/lib/generate-hcl.test.ts`

### Test Task T.2: tfstate Parser Tests
**Depends on**: None | **Before**: Task E.1
**Output**: `frontend/src/lib/tfstate-parser.test.ts`

### Test Task T.3: Export Function Tests
**Depends on**: None | **Before**: Task C.2
**Output**: `frontend/src/lib/export.test.ts`

### Test Task T.4: Provider Data Validation Tests
**Depends on**: None | **Before**: Task A.2
**Output**: `frontend/src/lib/provider-data.test.ts`**Verification**:
```bash
cd frontend && npm test -- --grep "tfstate-parser"
```

**Completion Criteria**:
- Parses v3 and v4 state formats
- Extracts resources with attributes
- Infers dependencies from references
- Handles invalid state gracefully

**Failure Handling**:
- Start with v4 format only
- Add v3 support later

---

### Task E.2: Import Dialog Component (US-007)

**Priority**: P2 | **Estimate**: 3h | **Type**: Implementation

**Description**: UI for importing tfstate files.

**Input**:
- Task E.1 parser
- Task A.3 canvas store

**Output**:
- `frontend/src/components/ui/ImportDialog.tsx`

**Dependencies**: Task E.1, A.3

**Verification**:
```bash
cd frontend && npm test -- --grep "ImportDialog"
```

**Completion Criteria**:
- Accepts file upload (.tfstate, .tfstate.json)
- Preview before import
- Creates nodes from parsed resources

**Failure Handling**:
- Simplify to direct import without preview

---

### Task E.3: Plugin System Foundation (US-008)

**Priority**: P2 | **Estimate**: 6h | **Type**: Implementation

**Description**: Implement plugin manifest loading and registration.

**Input**:
- US-008 plugin specification

**Output**:
- `frontend/src/plugins/types.ts`
- `frontend/src/plugins/loader.ts`
- `frontend/src/plugins/registry.ts`

**Dependencies**: Task A.1, A.2

**Verification**:
```bash
cd frontend && npm test -- --grep "plugins"
```

**Completion Criteria**:
- Loads plugin manifest JSON
- Registers custom resource types
- Validates plugin schema
- Handles invalid plugins gracefully

**Failure Handling**:
- Start with schema-only plugins
- Add UI component plugins later

---

## Parallel Group F: Enterprise Features

These are lower priority and can be implemented last.

---

### Task F.1: SSO Integration (US-010)

**Priority**: P3 | **Estimate**: 6h | **Type**: Implementation

**Description**: Implement SSO authentication.

**Input**:
- SAML 2.0 / OIDC specifications

**Output**:
- Backend auth middleware
- Frontend login flow

**Dependencies**: Task D.1 (server infrastructure)

**Verification**: Manual testing with IdP

**Completion Criteria**:
- SSO login flow works
- Session management functional
- Logout clears session

**Failure Handling**:
- Start with mock auth for development
- Integrate real IdP later

---

### Task F.2: Audit Logging (US-010)

**Priority**: P3 | **Estimate**: 4h | **Type**: Implementation

**Description**: Implement audit log for all operations.

**Input**:
- US-010 audit requirements

**Output**:
- Backend audit middleware
- Audit log storage

**Dependencies**: Task F.1

**Verification**:
```bash
go test -v ./server/
```

**Completion Criteria**:
- All operations logged with user, action, timestamp
- Logs stored in append-only format
- Export functionality available

**Failure Handling**:
- Log to file initially
- Add database later

---

### Task F.3: REST API Authentication

**Priority**: P3 | **Estimate**: 3h | **Type**: Implementation

**Description**: Add API key authentication for REST endpoints.

**Input**:
- Task F.1 auth infrastructure

**Output**:
- API key generation
- Key validation middleware

**Dependencies**: Task F.1

**Verification**:
```bash
curl -H "Authorization: Bearer <key>" http://localhost:8080/api/generate
```

**Completion Criteria**:
- API keys can be generated
- Keys validate on API requests
- 401 returned for invalid keys

**Failure Handling**:
- Start with static keys for testing
- Add dynamic generation later

---

## Task Summary by Parallel Group

| Group | Tasks | Dependencies | Parallel Within Group |
|-------|-------|--------------|----------------------|
| A | A.1, A.2, A.3, A.4, A.5 | None | Yes (all independent) |
| B | B.1, B.2, B.3, B.4 | Group A | Yes |
| C | C.1, C.2, C.3 | Group B | Yes |
| D | D.1, D.2, D.3 | None (backend) | Yes |
| E | E.1, E.2, E.3 | Groups A, C | Yes |
| F | F.1, F.2, F.3 | Group D | F.1 → F.2 → F.3 (sequential) |

---

## Estimated Timeline

| Phase | Groups | Duration | Parallel Workers |
|-------|--------|----------|-----------------|
| Week 1-2 | A + D | 2 weeks | 3-5 developers |
| Week 3-4 | B + D.cont | 2 weeks | 3-5 developers |
| Week 5-6 | C + E | 2 weeks | 3-5 developers |
| Week 7-8 | E.cont + F | 2 weeks | 2-3 developers |

---

## Unit Test Tasks (Pre-Implementation)

For pure logic methods without I/O, generate tests first:

### Test Task T.1: HCL Generator Tests
**Depends on**: None | **Before**: Task B.4
**Output**: `frontend/src/lib/generate-hcl.test.ts`

### Test Task T.2: tfstate Parser Tests
**Depends on**: None | **Before**: Task E.1
**Output**: `frontend/src/lib/tfstate-parser.test.ts`

### Test Task T.3: Export Function Tests
**Depends on**: None | **Before**: Task C.2
**Output**: `frontend/src/lib/export.test.ts`

### Test Task T.4: Provider Data Validation Tests
**Depends on**: None | **Before**: Task A.2
