# AGENTS.md — terraform-visual-gen

## Project Overview
Graphical Terraform code generation tool with a **React frontend** (visual canvas) and **Go backend** (HCL generation, validation, CLI). Transforms a JSON project model (nodes + edges) into Terraform HCL. Dual implementations: Go (primary), Python (parity), TypeScript (frontend).

## Build / Test / Run Commands

### Frontend (React + Vite + TypeScript)
```bash
cd frontend

# Development server
npm run dev              # Starts on http://localhost:3000

# Type check
npx tsc -b

# Run all tests
npm test                 # vitest run
npm run test:watch       # vitest watch mode

# Run a single test file
npx vitest run src/lib/generate-hcl.test.ts

# Build for production
npm run build

# Lint
npm run lint
```

### Go (root — HCL generator, server, CLI)
```bash
# Run all tests
go test

# Run a single test
go test -run TestGenerateHCL
go test -run TestGenerateHCLWithEdges

# Run with verbose output
go test -v

# Build binaries
go build -o terraform-visual-gen .          # Root generator
go build -o terraform-visual-server ./server/  # Validation/plan server
go build -o tfg ./cli/                      # CLI tool

# Run the generator
go run . example_model.json

# Format and vet
go fmt ./...
go vet ./...
```

### Python (parity)
```bash
python -m unittest test_generate_hcl.py
python generate_hcl.py example_model.json
```

### User Stories Parser
```bash
go run user_stores_parser.go list
go run user_stores_parser.go backlog
```

## Code Style & Conventions

### Go Style
- **Indentation**: tabs (`go fmt`), 4 spaces observed in root files
- **Imports**: Standard library only (root), grouped in single `import()`, sorted
- **Naming**: `PascalCase` exported (`GenerateHCL`), `camelCase` locals (`depMap`)
- **Types**: Structs with JSON tags (`json:"id"`). Value receivers for small structs
- **Error handling**: Return `(result, error)`. Print to stderr, exit 1
- **No external dependencies** in root; server/CLI may import stdlib packages
- **Package**: Single `main` package per directory

### TypeScript Style
- **Strict mode** enabled in tsconfig
- **Path aliases**: `@/*` → `./src/*`
- **Naming**: `PascalCase` components/types, `camelCase` variables/functions
- **Types**: Prefer interfaces over type aliases for object shapes. Use discriminated unions for state
- **Imports**: Absolute paths via `@/` alias. Group: external → internal → relative
- **No `any`** — use `unknown` with type guards
- **Zustand stores**: Selective subscriptions via `useStore((s) => s.field)`

### Python Style
- Mirror Go implementation for parity
- Use `unittest` framework (no pytest)

### Testing Patterns
- **Go**: Table-driven tests, `TestXxx` functions, exact string equality assertions
- **TypeScript**: Vitest with `describe`/`it`/`expect`. Colocated `*.test.ts` files
- **Python**: `unittest.TestCase`, exact string equality
- Test files: `*_test.go`, `*.test.ts`, `test_*.py`

### Error Handling
- **Go**: Propagate to `main()`, print stderr, exit 1
- **TypeScript**: Throw typed errors. UI catches and displays. No silent swallowing
- **Python**: Exceptions propagate naturally

## Architecture
```
Root (Go/Python HCL generator):
  main.go              — CLI entry point
  model.go             — Data types: Node, Edge, Project
  generator.go         — Core HCL generation logic
  generator_test.go    — Basic unit test
  generator_edge_test.go — Edge/dependency test
  generate_hcl.py      — Python parity
  test_generate_hcl.py — Python tests

frontend/ (React SPA):
  src/
    components/
      canvas/          — React Flow canvas with drag-drop, pan/zoom
      sidebar/         — Provider library, resource palette (AWS/Azure/GCP)
      property-panel/  — Node property editor with schema validation
      preview/         — HCL preview with syntax highlighting (Prism.js)
      toolbar/         — Top toolbar: undo/redo, export, validate, i18n
      layout/          — App layout composition
      ui/              — Reusable UI (import dialog, etc.)
    store/
      canvas-store.ts  — Zustand: nodes, edges, selection, undo/redo
      project-store.ts — Zustand: project CRUD, snapshots, save/load
    lib/
      generate-hcl.ts  — HCL generation engine (TypeScript)
      provider-data.ts — AWS/Azure/GCP resource catalog
      tfstate-parser.ts — Import existing infrastructure
      validation.ts    — Client-side validation
      export.ts        — Export as .tf or ZIP (JSZip)
    types/             — TypeScript type definitions
    i18n/              — i18next translations (en, zh)
    hooks/             — Custom hooks (keyboard shortcuts, HCL preview)
    plugins/           — Plugin system (US-008)

server/ (Go HTTP server):
  main.go              — REST API: /api/generate, /api/validate, /api/plan

cli/ (Go CLI tool):
  main.go              — tfg generate/validate commands

.github/
  workflows/ci.yml     — CI: frontend build/test, Go build/test
  actions/             — Reusable GitHub Action for CI pipelines
```

## Notes for Agents
- CI pipeline runs on every push/PR (GitHub Actions)
- Frontend: React 19, Vite 8, React Flow, Zustand, Tailwind v4, Radix UI
- Backend: Go stdlib only for server and CLI
- Maintain Go/Python/TypeScript parity for HCL generation logic
- Go 1.22 minimum for all Go code
- TypeScript strict mode — no `as any`, no `@ts-ignore`
- i18n: English + Chinese (Simplified) via i18next
- Provider data: bundled JSON catalog (AWS, Azure, GCP)
