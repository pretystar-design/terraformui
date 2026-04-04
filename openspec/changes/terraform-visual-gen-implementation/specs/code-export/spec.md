# Code Export Specification

## ADDED Requirements

### Requirement: Export to Single File
Users MUST be able to export generated Terraform code as a single .tf file.

#### Scenario: Export single file
- **WHEN** user clicks Export and selects single file option
- **THEN** a main.tf file is downloaded containing all resources

#### Scenario: Exported file is valid
- **WHEN** exported .tf file is run through terraform validate
- **THEN** validation passes without errors

### Requirement: Export to ZIP Archive
Users MUST be able to export as a structured ZIP archive.

#### Scenario: Export ZIP archive
- **WHEN** user clicks Export and selects ZIP option
- **THEN** a ZIP file is downloaded containing main.tf, variables.tf, outputs.tf, providers.tf

#### Scenario: ZIP includes README
- **WHEN** ZIP is exported
- **THEN** README.md is included with project metadata

#### Scenario: Variables extracted
- **WHEN** ZIP is exported with parameterized values
- **THEN** variables.tf contains variable declarations

### Requirement: Export Performance
Export MUST complete within 2 seconds for typical projects.

#### Scenario: Export completes within time limit
- **WHEN** user exports a 100-node project
- **THEN** export completes within 2 seconds

### Requirement: Module Boundaries
Export MUST respect module structure if defined.

#### Scenario: Module structure preserved
- **WHEN** project has modules defined
- **THEN** export creates separate directories for each module