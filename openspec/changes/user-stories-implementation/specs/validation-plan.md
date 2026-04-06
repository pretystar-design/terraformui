# Spec: Validation & Plan (US-006)

## User Story
As a user, I want a Validate/Plan button that runs `terraform validate` and `terraform plan` in the background so that errors are highlighted before committing.

## Requirements

### R1: Validate Endpoint
- POST `/api/validate` accepts canvas model JSON
- Generates HCL, writes to temp directory, runs `terraform validate -json`
- Returns `{ valid: bool, errors: string[], warnings: string[] }`

### R2: Plan Endpoint
- POST `/api/plan` accepts canvas model JSON
- Runs `terraform init -backend=false` then `terraform plan -no-color`
- Returns `{ add: int, change: int, destroy: int, output: string }`

### R3: UI Integration
- Validate button in toolbar shows results in notification panel
- Errors highlighted with red indicators
- Plan results shown as summary: "Plan: X to add, Y to change, Z to destroy"

### R4: Error Display
- Validation errors shown inline on affected nodes
- Click error to navigate to problematic node
- Warnings shown with orange indicators

## Acceptance Criteria
- Clicking Validate returns results within 5 seconds
- Invalid HCL shows specific error messages with line references
- Plan output shows resource counts and full plan text
- Error notification panel dismissable with X button
