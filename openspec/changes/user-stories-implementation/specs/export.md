# Spec: Export (US-004)

## User Story
As a user, I want a one-click export to `.tf` or a ZIP archive so that I can hand off the code for review or deployment.

## Requirements

### R1: Export Formats
- Single `.tf` file: all resources, variables, outputs in one file
- ZIP archive: separate files (`main.tf`, `variables.tf`, `outputs.tf`, `providers.tf`)

### R2: Export Trigger
- Toolbar export button opens format selection dropdown
- Download starts immediately after format selection

### R3: File Naming
- Default filename: `{project-name}.tf` or `{project-name}.zip`
- Timestamp appended if project has no name

### R4: Content Validation
- Exported HCL passes `terraform fmt` formatting rules
- Provider blocks included based on detected providers

## Acceptance Criteria
- Clicking Export → "Download .tf" produces valid single file
- Clicking Export → "Download ZIP" produces archive with 4 files
- Downloaded `.tf` file passes `terraform fmt -check`
- ZIP contains `main.tf`, `variables.tf`, `outputs.tf`, `providers.tf`
