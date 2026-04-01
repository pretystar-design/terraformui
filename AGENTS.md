# AGENTS.md — terraform-visual-gen

## Project Overview
HCL (HashiCorp Configuration Language) generator that transforms a JSON project model (nodes + edges) into Terraform-compatible resource definitions. Dual implementation: **Go** (primary) and **Python** (parity).

## Build / Test / Run Commands

### Go (primary)
```bash
# Run all tests
go test

# Run a single test
go test -run TestGenerateHCL
go test -run TestGenerateHCLWithEdges

# Run with verbose output
go test -v

# Build binary
go build -o terraform-visual-gen .

# Run the generator
go run . example_model.json

# Format all Go files (no external formatter configured)
go fmt ./...

# Vet (static analysis)
go vet ./...
```

### Python (secondary)
```bash
# Run all tests
python -m unittest test_generate_hcl.py

# Run a single test
python -m unittest test_generate_hcl.py.TestGenerateHCL.test_simple
python -m unittest test_generate_hcl.py.TestGenerateHCL.test_with_edges

# Run the generator
python generate_hcl.py example_model.json
```

### User Stories Parser (utility)
```bash
go run user_stores_parser.go list
go run user_stores_parser.go backlog
```

## Code Style & Conventions

### Go Style
- **Indentation**: 4 spaces (observed convention; `go fmt` uses tabs — prefer tabs if running `go fmt`)
- **Imports**: Standard library only, grouped in a single `import()` block, alphabetically sorted
- **Naming**: `PascalCase` for exported identifiers (`GenerateHCL`, `Project`), `camelCase` for locals (`depMap`, `resType`)
- **Types**: Structs with JSON struct tags for serialization (`json:"id"`). Use value receivers for small structs
- **Error handling**: Return `(result, error)` tuples. Callers print to `os.Stderr` via `fmt.Fprintf` and exit with `os.Exit(1)`
- **No external dependencies** — `go.mod` requires nothing beyond stdlib
- **Package**: Single `main` package; no subpackages currently

### Python Style
- Mirror Go implementation for parity
- Use `unittest` framework (no pytest)
- Dictionary-based data model matching JSON schema

### Testing Patterns
- Table-driven tests not yet used; simple `TestXxx` functions
- Tests assert exact string output equality
- Test files colocated: `*_test.go` for Go, `test_*.py` for Python
- Edge cases covered in separate `*_edge_test.go` file

### Error Handling
- Go: Errors propagated up to `main()`, printed to stderr, process exits with code 1
- Python: Exceptions propagate naturally (no explicit try/catch in generator)
- No custom error types; use `fmt.Errorf` for wrapped errors if needed

## Architecture
```
main.go              — CLI entry point: reads JSON, calls GenerateHCL, prints output
model.go             — Data types: Node, Edge, Project
generator.go         — Core logic: GenerateHCL(Project) → string
generator_test.go    — Basic unit test
generator_edge_test.go — Edge/dependency test case
user_stores_parser.go — Separate utility: parses user_stores.md
generate_hcl.py      — Python parity implementation
test_generate_hcl.py — Python tests
```

## Notes for Agents
- No linter config (`.golangci.yml`), no Makefile, no CI pipeline — add if extending
- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md`
- Keep changes minimal; this is a small, focused utility
- When adding features, maintain Go/Python parity unless told otherwise
- Go 1.22 minimum; avoid features requiring newer versions without updating `go.mod`
