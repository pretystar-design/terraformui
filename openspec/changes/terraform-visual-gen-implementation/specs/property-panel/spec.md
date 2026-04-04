# Property Panel Specification

## ADDED Requirements

### Requirement: Schema-Driven Property Editor
Selecting a node MUST open a property panel where users SHALL fill in required and optional fields validated against the provider's resource schema.

#### Scenario: Panel opens on selection
- **WHEN** user clicks on a node
- **THEN** property panel opens in right sidebar showing all configurable attributes

#### Scenario: Required fields marked
- **WHEN** property panel displays attributes
- **THEN** required fields are marked with an asterisk

#### Scenario: Real-time validation
- **WHEN** user enters an invalid value in a field
- **THEN** immediate validation error is displayed inline

#### Scenario: Empty required field validation
- **WHEN** a required field is left empty
- **THEN** red border and error message are displayed

### Requirement: Type-Aware Input Controls
Input fields MUST adapt to the attribute type.

#### Scenario: Text input for string fields
- **WHEN** attribute type is string
- **THEN** text input field is displayed

#### Scenario: Number input for numeric fields
- **WHEN** attribute type is number
- **THEN** number input field is displayed

#### Scenario: Dropdown for enum fields
- **WHEN** attribute has enum values defined
- **THEN** dropdown select is displayed with options

### Requirement: Terraform Expression Support
Fields MUST accept Terraform expressions without validation errors.

#### Scenario: Expression input accepted
- **WHEN** user enters a Terraform expression like `${var.name}`
- **THEN** the expression is accepted without type validation error

#### Scenario: Reference expression accepted
- **WHEN** user enters a resource reference like `aws_vpc.main.id`
- **THEN** the reference is accepted