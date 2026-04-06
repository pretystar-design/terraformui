# Spec: Canvas Node Management (US-001)

## User Story
As a user, I want to drag-and-drop AWS, Azure, GCP resource nodes onto a canvas so that I can create infrastructure without hand-writing HCL.

## Requirements

### R1: Drag-and-Drop Node Creation
- Sidebar contains draggable resource items organized by provider (AWS, Azure, GCP)
- Dragging a resource onto the canvas creates a new node at the drop position
- Each node receives a unique ID in format `{type}_{uuid8}`

### R2: Canvas Interaction
- Pan and zoom via mouse wheel and touch gestures
- Nodes are draggable after creation
- Multi-select with Shift+click
- Delete selected nodes with Delete key

### R3: Node Visual Representation
- Each node displays: provider icon, resource type, user-defined label
- Selected nodes show highlight border with accent color
- Connection handles on left (input) and right (output) sides

### R4: Edge Creation
- Drag from output handle of one node to input handle of another
- Edges represent `depends_on` relationships
- Animated dashed lines for active connections

## Acceptance Criteria
- Dragging `aws_instance` from sidebar creates node with ID `aws_instance_xxxxxxxx`
- Canvas supports pan (middle-click drag) and zoom (scroll wheel)
- Node displays AWS icon, "Instance" label, and resource type
- Creating edge from node A to node B generates `depends_on = ["A"]` in HCL
- Delete key removes selected node and its connected edges
