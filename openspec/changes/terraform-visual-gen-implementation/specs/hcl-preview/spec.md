# HCL Preview Specification

## ADDED Requirements

### Requirement: Real-Time HCL Preview
A live HCL preview panel MUST update automatically as users modify the canvas.

#### Scenario: Preview updates on node add
- **WHEN** user adds a node to the canvas
- **THEN** HCL preview updates within 200ms with the new resource block

#### Scenario: Preview updates on property change
- **WHEN** user modifies a node property
- **THEN** HCL preview updates within 200ms reflecting the change

#### Scenario: Preview updates on node delete
- **WHEN** user deletes a node
- **THEN** HCL preview updates within 200ms removing the resource block

#### Scenario: Preview updates on edge change
- **WHEN** user creates or deletes an edge
- **THEN** HCL preview updates with dependency changes

### Requirement: Syntax Highlighting
HCL output MUST be syntax-highlighted for readability.

#### Scenario: Keywords highlighted
- **WHEN** HCL preview displays code
- **THEN** Terraform keywords are highlighted in appropriate colors

#### Scenario: Strings highlighted
- **WHEN** HCL preview displays code
- **THEN** string values are highlighted distinctly

### Requirement: Copy Functionality
Users MUST be able to copy generated HCL to clipboard.

#### Scenario: Copy to clipboard
- **WHEN** user clicks copy button
- **THEN** generated HCL is copied to clipboard
- **AND** success message is displayed

### Requirement: Valid HCL Output
Generated HCL MUST pass terraform fmt.

#### Scenario: Formatted output
- **WHEN** HCL is generated
- **THEN** output passes `terraform fmt -check` without modifications