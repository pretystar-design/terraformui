# Spec: Plugin System (US-008)

## User Story
As a developer, I want a plugin API that lets us define UI components for custom/internal providers so that the platform can evolve with proprietary resources.

## Requirements

### R1: Plugin Registration
- `registerPlugin(name, config)` API for third-party extensions
- Config includes: provider metadata, resource definitions, custom UI components

### R2: Resource Catalog Extension
- Plugins add entries to the sidebar resource library
- Custom provider tab with branded icon and color
- Plugin resources appear alongside built-in providers

### R3: Custom UI Components
- Plugins can register custom property panel fields
- Support for complex field types (JSON editor, credential picker, region selector)
- Lifecycle hooks: onNodeCreate, onNodeUpdate, onNodeDelete

### R4: Plugin Loading
- Plugins loaded from `src/plugins/` directory
- Hot-reload during development
- Plugin manifest file (`plugin.json`) for metadata

## Acceptance Criteria
- Calling `registerPlugin("custom", config)` adds resources to sidebar
- Custom provider tab appears with specified icon and color
- Plugin custom fields render in property panel when node selected
- Plugin lifecycle hooks fire on corresponding canvas actions
- Plugins directory scan on app startup loads all valid plugins
