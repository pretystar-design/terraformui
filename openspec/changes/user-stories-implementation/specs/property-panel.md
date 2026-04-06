# Spec: Property Panel (US-002)

## User Story
As a user, I want to select a node and fill required fields in a property panel so that the resource definition is complete and provider-valid.

## Requirements

### R1: Panel Display
- Opens automatically when a node is selected
- Shows node header with provider icon, label (editable), and resource type
- Closes when selection is cleared

### R2: Schema-Based Fields
- Fields generated from provider catalog attribute definitions
- Required fields marked with red asterisk
- Field types: text input, boolean dropdown, list, map
- Default values pre-filled from schema

### R3: Validation
- Required field validation on blur
- Type validation (string, bool, list, map)
- Visual error indicators on invalid fields

### R4: Actions
- Duplicate node (creates copy with offset position)
- Delete node (removes from canvas and closes panel)
- Close panel (X button, clears selection)

## Acceptance Criteria
- Selecting `aws_instance` node shows fields: ami (required), instance_type (required, default "t2.micro"), key_name, subnet_id, vpc_security_group_ids, tags
- Leaving required field empty shows red border and error message
- Clicking Duplicate creates identical node 40px offset with "(copy)" suffix
- Clicking Delete removes node and closes panel
