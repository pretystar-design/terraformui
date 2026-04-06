# Spec: HCL Preview (US-003)

## User Story
As a user, I want an instant HCL preview that updates with canvas changes so that I can verify correctness on the fly.

## Requirements

### R1: Real-Time Generation
- HCL output updates within 200ms of any canvas change
- Auto-generates from current nodes, edges, variables, and outputs
- No manual refresh required

### R2: Syntax Highlighting
- Prism.js with HCL language support
- Color coding: keywords (purple), strings (green), numbers (yellow), comments (gray italic), block names (cyan), attributes (blue)

### R3: Copy Functionality
- One-click copy button copies full HCL to clipboard
- Visual feedback (checkmark icon) for 2 seconds after copy

### R4: Empty State
- Displays placeholder message when canvas has no nodes
- Clear call-to-action to add resources

## Acceptance Criteria
- Adding node to canvas updates HCL preview within 200ms
- `resource "aws_instance" "web" { ... }` renders with proper syntax highlighting
- Copy button shows ✓ "Copied!" for 2 seconds
- Empty canvas shows "Add resources to generate HCL" message
