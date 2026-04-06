# Spec: Project Management (US-009)

## User Story
As a user, I want to switch between projects, save models, and roll back history so that multi-branch development and audit trails are supported.

## Requirements

### R1: Project CRUD
- Create new project with name
- List all projects with last modified date and node count
- Delete project with confirmation
- Switch between projects without losing unsaved changes (prompt)

### R2: Auto-Save
- Canvas changes auto-save to localStorage every 30 seconds
- Manual save button in toolbar
- Save status indicator: idle/saving/saved/error

### R3: Version History
- Snapshots created on manual save or major changes
- Each snapshot has timestamp, optional message, and full state
- Restore snapshot replaces current canvas state
- Undo/redo stack (50 entries max)

### R4: Import/Export
- Export project as JSON
- Import project JSON creates new project with new ID

## Acceptance Criteria
- Creating project shows it in project list with node count 0
- Auto-save indicator shows "Saved" within 1 second of canvas change
- Creating snapshot appears in history panel with timestamp
- Restoring snapshot replaces canvas with snapshot state
- Undo reverts last action, redo re-applies it
- Export JSON can be re-imported as new project
