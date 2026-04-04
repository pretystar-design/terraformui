# Terraform Visual Gen - Full Implementation Proposal

## Why

The terraform-visual-gen project aims to provide a graphical interface for generating Terraform HCL code. Currently, only the basic HCL generation engine exists (Go, Python, TypeScript implementations). This proposal outlines the implementation of all user-facing features to create a complete, production-ready visual Terraform development tool.

The implementation is needed now because:
1. Infrastructure as Code (IaC) adoption is growing, but hand-writing HCL is error-prone
2. Visual tools lower the barrier to entry for Terraform
3. Teams need a way to visualize, validate, and collaborate on infrastructure designs
4. Existing tools lack real-time preview and multi-provider support

## What Changes

This change implements 12 user stories organized into 4 phases:

### Phase 1 — MVP (Weeks 1-4)
- **US-001**: Basic resource editing (AWS only initially)
- **US-002**: Property configuration with schema validation
- **US-003**: Real-time HCL preview
- **US-004**: Code export (single `.tf` file)

### Phase 2 — Core (Weeks 5-8)
- **US-005**: Provider & module library (AWS, Azure, GCP)
- **US-006**: Code validation & plan
- **US-009**: Project switching & version management
- **US-011**: Localization (Chinese/English)

### Phase 3 — Advanced (Weeks 9-12)
- **US-007**: Existing infrastructure import
- **US-008**: Plugin architecture
- **US-012**: CI integration (CLI/REST)

### Phase 4 — Enterprise (Weeks 13-16)
- **US-010**: Permissions & audit (SSO, RBAC, audit logging)

## Capabilities

### New Capabilities

- `canvas-editor`: Visual drag-drop canvas for infrastructure design (US-001)
- `property-panel`: Schema-driven property editor with validation (US-002)
- `hcl-preview`: Real-time HCL code generation and preview (US-003)
- `code-export`: Export to .tf files and ZIP archives (US-004)
- `provider-library`: Searchable resource palette for AWS/Azure/GCP (US-005)
- `terraform-validation`: Backend integration for terraform validate/plan (US-006)
- `state-import`: Import existing tfstate files to canvas (US-007)
- `plugin-system`: Extensible plugin API for custom providers (US-008)
- `project-management`: Multi-project support with version history (US-009)
- `auth-audit`: SSO authentication and audit logging (US-010)
- `i18n`: Internationalization support (en, zh) (US-011)
- `ci-integration`: CLI and REST API for CI/CD pipelines (US-012)

### Modified Capabilities

None - this is a new implementation.

## Impact

### Frontend (React SPA)
- New components: canvas, sidebar, property-panel, preview, toolbar
- New stores: canvas-store, project-store
- New libraries: generate-hcl.ts, provider-data.ts, tfstate-parser.ts

### Backend (Go)
- Enhanced server with validation/plan endpoints
- Docker-based sandboxed Terraform execution
- REST API with authentication

### CLI (Go)
- Extended commands: generate, validate, plan
- JSON output mode for CI integration

### Dependencies
- React Flow for canvas rendering
- JSZip for ZIP export
- Prism.js for syntax highlighting
- i18next for localization
- Zustand for state management

## Task Dependency Graph

```
Phase 1:
  [US-005 Provider Data] ──┬──> [US-001 Canvas] ──> [US-002 Properties] ──> [US-003 HCL Preview] ──> [US-004 Export]
  [US-009 Project Store] ──┘

Phase 2 (parallel with Phase 1 completion):
  [US-006 Validation Backend] (parallel with) [US-011 i18n]

Phase 3:
  [US-007 Import] (parallel with) [US-008 Plugins] (parallel with) [US-012 CI]

Phase 4:
  [US-010 Auth & Audit]