# Canvas Editor Specification

## ADDED Requirements

### Requirement: Drag-and-Drop Node Creation
Users MUST be able to drag cloud resource nodes from the palette onto an infinite canvas to create infrastructure diagrams.

#### Scenario: Create node from palette
- **WHEN** user drags a resource type (e.g., `aws_instance`) from the left sidebar palette onto the canvas
- **THEN** a new node is created with a unique auto-generated ID (format: `{type}_{uuid_short}`)

#### Scenario: Node displays correctly
- **WHEN** a node is created on the canvas
- **THEN** the node displays resource icon, type name, and default label

#### Scenario: Node repositioning
- **WHEN** user drags an existing node to a new position
- **THEN** node moves to new position and state is updated

#### Scenario: Node selection
- **WHEN** user clicks on a node
- **THEN** node becomes selected with visual highlight

#### Scenario: Node deletion
- **WHEN** user selects node(s) and presses Delete key
- **THEN** selected nodes are removed from canvas along with connected edges

### Requirement: Canvas Navigation
Users MUST be able to navigate large diagrams with pan and zoom.

#### Scenario: Pan canvas
- **WHEN** user drags with middle-mouse button on canvas
- **THEN** canvas view pans in the drag direction

#### Scenario: Zoom canvas
- **WHEN** user scrolls mouse wheel on canvas
- **THEN** canvas zooms in/out centered on cursor position within 10%-500% range

### Requirement: Undo/Redo
All canvas operations MUST support undo/redo.

#### Scenario: Undo operation
- **WHEN** user presses Ctrl+Z
- **THEN** last canvas operation is reversed

#### Scenario: Redo operation
- **WHEN** user presses Ctrl+Y
- **THEN** last undone operation is re-applied