# Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (React SPA)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │   Toolbar   │  │   Sidebar   │  │   Canvas    │  │   Property Panel    ││
│  │  (undo/redo)│  │  (palette)  │  │  (ReactFlow)│  │   (schema-driven)   ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      HCL Preview Panel                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Zustand Stores                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  canvas-store   │  │ project-store   │  │   Undo/Redo Middleware     │  │
│  │  (nodes, edges) │  │ (projects)      │  │                             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Core Libraries                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ generate-hcl.ts │  │ provider-data.ts│  │    tfstate-parser.ts       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/WebSocket
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Backend (Go HTTP Server)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ POST /api/      │  │ POST /api/      │  │ POST /api/plan             │  │
│  │ generate        │  │ validate        │  │ (WebSocket streaming)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              Docker Sandbox (Terraform CLI)                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Models

### Node
```typescript
interface Node {
  id: string;                    // Format: {type}_{uuid_short}
  type: string;                  // e.g., "aws_instance"
  label: string;                 // User-assigned label
  provider: string;              // "aws" | "azure" | "gcp"
  position: { x: number; y: number };
  attributes: Record<string, unknown>;
  validationErrors?: string[];
}
```

### Edge
```typescript
interface Edge {
  id: string;
  source: string;                // Source node ID
  target: string;                // Target node ID
  sourceHandle?: string;         // Output handle on source
  targetHandle?: string;         // Input handle on target
  label?: string;                // Optional label
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}
```

## Component Hierarchy

```
App
├── Layout
│   ├── Toolbar
│   │   ├── UndoRedoButtons
│   │   ├── ExportButton
│   │   ├── LanguageToggle
│   │   └── SaveIndicator
│   ├── Sidebar
│   │   ├── ProviderTabs
│   │   ├── SearchBar
│   │   └── ResourcePalette
│   ├── Canvas (React Flow)
│   │   └── ResourceNode (custom node type)
│   ├── PropertyPanel
│   │   ├── PropertyField (multiple)
│   │   └── ValidationMessage
│   └── HCLPreview
│       ├── SyntaxHighlighter
│       └── CopyButton
└── ImportDialog (modal)
```

## State Management

### Canvas Store (Zustand)
```typescript
interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeIds: string[];
  viewport: Viewport;
  
  // Actions
  addNode: (node: Node) => void;
  removeNodes: (ids: string[]) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  addEdge: (edge: Edge) => void;
  removeEdges: (ids: string[]) => void;
  setSelection: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
}
```

### Project Store (Zustand)
```typescript
interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  snapshots: Snapshot[];
  
  // Actions
  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  takeSnapshot: (message?: string) => void;
  rollback: (snapshotId: string) => void;
}
```

## HCL Generation Strategy

The HCL generator follows this algorithm:

1. **Topological Sort**: Order nodes by dependencies (edges)
2. **Resource Block Generation**: For each node:
   ```
   resource "<type>" "<label>" {
     <attribute> = <value>
     ...
   }
   ```
3. **Reference Resolution**: Replace `${node_id.attribute}` with `resource_type.label.attribute`
4. **Output Formatting**: Apply HCL formatting rules

## Provider Data Structure

```json
{
  "provider": "aws",
  "services": {
    "ec2": {
      "resources": [
        {
          "type": "aws_instance",
          "icon": "data:image/svg+xml,...",
          "attributes": [
            {
              "name": "ami",
              "type": "string",
              "required": true,
              "description": "AMI ID for the instance"
            },
            {
              "name": "instance_type",
              "type": "string",
              "required": true,
              "default": "t2.micro"
            }
          ]
        }
      ]
    }
  }
}
```

## Validation Flow

```
User Input → Schema Validation → State Update → HCL Generation
                    ↓
              Display Errors
```

## Export Flow

```
Export Button → Generate HCL → Create ZIP (JSZip) → Download
                     ↓
              Format with terraform fmt (optional)
```

## Backend API Design

### POST /api/generate
Request:
```json
{
  "nodes": [...],
  "edges": [...]
}
```
Response:
```json
{
  "hcl": "resource \"aws_instance\" \"main\" {...}",
  "files": {
    "main.tf": "...",
    "variables.tf": "...",
    "outputs.tf": "..."
  }
}
```

### POST /api/validate
Request:
```json
{
  "hcl": "..."
}
```
Response:
```json
{
  "valid": false,
  "errors": [
    {
      "line": 5,
      "column": 1,
      "message": "Missing required argument 'ami'"
    }
  ]
}
```

### POST /api/plan (WebSocket)
1. Client sends HCL
2. Server creates temporary workspace
3. Server runs `terraform init` → `terraform plan`
4. Server streams output via WebSocket
5. Server sends final summary

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Framework | React 19 | Component-based UI |
| Canvas | React Flow | Node graph rendering |
| State Management | Zustand | Global state |
| Styling | Tailwind v4 | Utility-first CSS |
| UI Components | Radix UI | Accessible primitives |
| HCL Preview | Prism.js | Syntax highlighting |
| Export | JSZip | ZIP file creation |
| i18n | i18next | Internationalization |
| Backend | Go stdlib | HTTP server |
| Validation | Docker + Terraform | Sandboxed execution |