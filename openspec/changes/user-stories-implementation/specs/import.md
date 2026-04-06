# Spec: Import (US-007)

## User Story
As a user, I want to import an existing `tfstate` or project files so that the canvas can reconstruct the current infrastructure for further iteration.

## Requirements

### R1: tfstate Import
- Drag-and-drop or file picker for `.tfstate` / `.json` files
- Parses `resources` array from tfstate
- Maps each resource to canvas node with type, attributes, and provider
- Infers edges from resource references in attributes

### R2: Project JSON Import
- Import previously exported project JSON
- Restores full canvas state: nodes, edges, variables, outputs

### R3: Import Dialog
- Modal with drop zone and file picker
- Shows loading state during parsing
- Error display for invalid files

### R4: Reference Inference
- Parses attribute values for `${aws_instance.web.id}` patterns
- Creates edges between referenced resources automatically

## Acceptance Criteria
- Dropping valid `.tfstate` file populates canvas with nodes
- Each tfstate resource becomes node with correct type and attributes
- Resource references in attributes create dependency edges
- Invalid JSON shows parse error message
- Import dialog closes on successful import
