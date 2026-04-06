# Spec: CI Integration (US-012)

## User Story
As a DevOps engineer, I want a CLI/REST endpoint that can be called from CI pipelines to generate HCL and run `terraform plan` so that automated checks are part of the deployment workflow.

## Requirements

### R1: REST API
- POST `/api/generate` — accepts canvas model JSON, returns HCL string
- POST `/api/validate` — accepts canvas model JSON, returns validation result
- POST `/api/plan` — accepts canvas model JSON, returns plan summary
- All endpoints accept Bearer token or API key authentication

### R2: CLI Tool
- `tfg generate <model.json> --output <dir>` — generates `.tf` files
- `tfg validate <model.json>` — validates generated HCL
- Exit code 0 on success, 1 on failure
- Output to stdout/stderr

### R3: CI-Friendly Output
- JSON responses for programmatic consumption
- Non-interactive (no prompts)
- Machine-parseable error messages

### R4: Health Check
- GET `/api/health` returns `{"status":"ok"}`
- Used for readiness/liveness probes in containerized deployments

## Acceptance Criteria
- `curl -X POST /api/generate -d @model.json` returns valid HCL
- `tfg generate model.json --output ./tf` creates `.tf` files in directory
- Failed validation returns non-zero exit code
- `/api/health` returns 200 with `{"status":"ok"}`
- API key authentication works for all endpoints
