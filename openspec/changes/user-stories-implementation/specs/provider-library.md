# Spec: Provider Resource Library (US-005)

## User Story
As a user, I want a searchable library of official provider resources and modules on the left pane so that I can quickly add standardized components.

## Requirements

### R1: Provider Tabs
- Three tabs: AWS (🟠), Azure (🔵), GCP (🟢)
- Active tab highlighted with accent color underline

### R2: Service Grouping
- Resources grouped by service (EC2, S3, VPC for AWS; Compute, Network for Azure; Compute, Storage for GCP)
- Collapsible service sections

### R3: Search
- Real-time filter across resource type, name, service, provider
- Debounced at 150ms
- Results update as user types

### R4: Resource Items
- Each item shows: resource type, display name, provider icon
- Draggable onto canvas
- Tooltip with resource description on hover

## Acceptance Criteria
- Clicking AWS tab shows EC2, S3, VPC resource groups
- Typing "instance" filters to aws_instance, azurerm_linux_virtual_machine, google_compute_instance
- Dragging resource from library onto canvas creates node
- Hovering over resource shows description tooltip
