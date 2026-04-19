# TerraformUI - Visual Terraform Code Generator

A modern, visual Terraform code generation tool that enables users to design infrastructure through an intuitive drag-and-drop canvas interface.

## Features

### Core Features (MVP)

- **Visual Infrastructure Design** - Drag cloud resources from a categorized palette onto an infinite canvas
- **Real-time HCL Preview** - See Terraform code generate instantly as you design
- **Multi-Provider Support** - AWS, Azure, and GCP resources with full schema support
- **Smart Property Configuration** - Schema-driven property panels with validation
- **Export Capabilities** - Generate `.tf` files or download as ZIP archive
- **tfstate Import** - Import existing infrastructure to visualize current state

### Provider Resources

| Provider | Resource Types |
|----------|---------------|
| AWS | EC2, VPC, S3, RDS, IAM, ECS, EKS, ALB, ElastiCache, CloudWatch, DynamoDB, Lambda, Route53, SQS, SNS, and more |
| Azure | Virtual Machines, Virtual Network, Storage, SQL Database, Cosmos DB, AKS, Container Instances, App Service, Key Vault, and more |
| GCP | Compute Engine, GKE, Cloud Storage, Cloud SQL, VPC, Pub/Sub, BigQuery, Cloud Functions, and more |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected node |
| `Shift+Click` | Multi-select nodes |
| `Escape` | Clear selection |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Canvas | React Flow |
| State Management | Zustand |
| Backend | Go (CLI, HCL Generator, Validation Server) |
| Internationalization | i18next |

## Getting Started

### Prerequisites

- Node.js 18+
- Go 1.21+ (for backend tools)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend CLI Setup

```bash
cd cli
go build -o tvg main.go
./tvg generate model.json --output ./output/
```

## Project Structure

```
terraformui/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── canvas/       # React Flow canvas
│   │   │   ├── layout/       # App layout components
│   │   │   ├── preview/      # HCL preview
│   │   │   ├── property-panel/ # Property editor
│   │   │   ├── sidebar/      # Resource palette
│   │   │   └── toolbar/      # Top toolbar
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript types
│   └── package.json
├── cli/                      # Go CLI tool
│   └── main.go
└── requirements.md           # Detailed requirements
```

## User Stories Status

| ID | Description | Priority | Status |
|----|-------------|----------|--------|
| US-001 | Basic Resource Editing | Must | ✅ Complete |
| US-002 | Property Configuration | Must | ✅ Complete |
| US-003 | Real-time HCL Preview | Must | ✅ Complete |
| US-004 | Code Export | Must | ✅ Complete |
| US-005 | Provider Library | Must | ✅ Expanded |
| US-006 | Validation & Plan | Should | ⚠️ Partial |
| US-007 | Infrastructure Import | Should | ✅ Complete |
| US-008 | Plugin Architecture | Could | ⚠️ Partial |
| US-009 | Project Management | Should | ⚠️ Partial |
| US-010 | Permissions & Audit | Could | ❌ Pending |
| US-011 | Internationalization | Could | ✅ Complete |
| US-012 | CI Integration | Could | ⚠️ Partial |

## Roadmap

### Phase 1 - MVP ✅
- Visual resource editing canvas
- AWS/Azure/GCP resource palette
- Real-time HCL generation
- Property configuration with validation
- Export to Terraform files

### Phase 2 - Enhanced
- [ ] Terraform validate/plan backend integration
- [ ] Project version history
- [ ] Enhanced provider schemas

### Phase 3 - Enterprise
- [ ] SSO authentication
- [ ] Audit logging
- [ ] Team collaboration
- [ ] Plugin marketplace

## License

MIT
