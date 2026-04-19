package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type Node struct {
	ID         string            `json:"id"`
	Type       string            `json:"type"`
	Label      string            `json:"label"`
	Provider   string            `json:"provider"`
	Attributes map[string]string `json:"attributes"`
}

type Edge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

type CLIProject struct {
	Name      string   `json:"name,omitempty"`
	Nodes     []Node   `json:"nodes"`
	Edges     []Edge   `json:"edges"`
	Variables []VarDef `json:"variables,omitempty"`
	Outputs   []OutDef `json:"outputs,omitempty"`
	Providers []ProviderDef `json:"providers,omitempty"`
}

type VarDef struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Description string `json:"description,omitempty"`
	Default     any    `json:"default,omitempty"`
	Required    bool   `json:"required"`
}

type OutDef struct {
	Name        string `json:"name"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
	Sensitive   bool   `json:"sensitive,omitempty"`
}

type ProviderDef struct {
	Name    string            `json:"name"`
	Source  string            `json:"source,omitempty"`
	Version string            `json:"version,omitempty"`
	Config  map[string]string `json:"config,omitempty"`
}

func main() {
	if len(os.Args) < 3 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]
	inputFile := os.Args[2]

	data, err := os.ReadFile(inputFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	var proj CLIProject
	if err := json.Unmarshal(data, &proj); err != nil {
		fmt.Fprintf(os.Stderr, "error parsing JSON: %v\n", err)
		os.Exit(1)
	}

	switch command {
	case "generate":
		outputDir := "."
		if len(os.Args) > 4 && os.Args[3] == "--output" {
			outputDir = os.Args[4]
		}
		if err := generate(proj, outputDir); err != nil {
			fmt.Fprintf(os.Stderr, "error: %v\n", err)
			os.Exit(1)
		}
	case "validate":
		hcl := buildHCL(proj)
		if err := validateHCL(hcl); err != nil {
			fmt.Fprintf(os.Stderr, "validation failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Configuration is valid.")
	case "fmt":
		hcl := buildHCL(proj)
		if err := formatHCL(hcl, os.Stdout); err != nil {
			fmt.Fprintf(os.Stderr, "format failed: %v\n", err)
			os.Exit(1)
		}
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Usage: tvg <command> <model.json> [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  generate <model.json> --output <dir>  Generate .tf files")
	fmt.Println("  validate <model.json>                 Validate generated HCL")
	fmt.Println("  fmt <model.json>                      Format and print HCL")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  tvg generate project.json --output ./terraform/")
	fmt.Println("  tvg validate project.json")
}

func generate(proj CLIProject, outputDir string) error {
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return err
	}

	// Generate providers.tf
	if len(proj.Providers) > 0 {
		providers := buildProvidersTF(proj.Providers)
		if err := os.WriteFile(filepath.Join(outputDir, "providers.tf"), []byte(providers), 0644); err != nil {
			return err
		}
		fmt.Println("Generated providers.tf")
	}

	// Generate main.tf
	hcl := buildHCL(proj)
	if err := os.WriteFile(filepath.Join(outputDir, "main.tf"), []byte(hcl), 0644); err != nil {
		return err
	}
	fmt.Printf("Generated main.tf (%d resources)\n", len(proj.Nodes))

	// Generate variables.tf
	if len(proj.Variables) > 0 {
		vars := buildVariablesTF(proj.Variables)
		if err := os.WriteFile(filepath.Join(outputDir, "variables.tf"), []byte(vars), 0644); err != nil {
			return err
		}
		fmt.Printf("Generated variables.tf (%d variables)\n", len(proj.Variables))
	}

	// Generate outputs.tf
	if len(proj.Outputs) > 0 {
		outs := buildOutputsTF(proj.Outputs)
		if err := os.WriteFile(filepath.Join(outputDir, "outputs.tf"), []byte(outs), 0644); err != nil {
			return err
		}
		fmt.Printf("Generated outputs.tf (%d outputs)\n", len(proj.Outputs))
	}

	// Generate README.md
	readme := buildReadme(proj)
	if err := os.WriteFile(filepath.Join(outputDir, "README.md"), []byte(readme), 0644); err != nil {
		return err
	}
	fmt.Println("Generated README.md")

	fmt.Printf("\n✓ Generated Terraform project in %s\n", outputDir)
	return nil
}

func buildProvidersTF(providers []ProviderDef) string {
	var sb strings.Builder

	for _, p := range providers {
		fmt.Fprintf(&sb, "terraform {\n")
		if p.Version != "" {
			fmt.Fprintf(&sb, "  required_version = %q\n", p.Version)
		}
		if p.Source != "" {
			fmt.Fprintf(&sb, "  required_providers {\n")
			fmt.Fprintf(&sb, "    %s = {\n", p.Name)
			fmt.Fprintf(&sb, "      source = %q\n", p.Source)
			fmt.Fprintf(&sb, "    }\n")
			fmt.Fprintf(&sb, "  }\n")
		}
		fmt.Fprintln(&sb, "}")
		fmt.Fprintln(&sb)

		fmt.Fprintf(&sb, "provider %q {\n", p.Name)
		for k, v := range p.Config {
			fmt.Fprintf(&sb, "  %s = %q\n", k, v)
		}
		fmt.Fprintln(&sb, "}")
		fmt.Fprintln(&sb)
	}

	return sb.String()
}

func buildHCL(proj CLIProject) string {
	var sb strings.Builder

	// Group nodes by provider for organization
	providerGroups := make(map[string][]Node)
	for _, n := range proj.Nodes {
		providerGroups[n.Provider] = append(providerGroups[n.Provider], n)
	}

	// Build dependency map
	depMap := make(map[string][]string)
	for _, e := range proj.Edges {
		depMap[e.Target] = append(depMap[e.Target], e.Source)
	}

	// Generate resources
	for _, n := range proj.Nodes {
		fmt.Fprintf(&sb, "# %s - %s\n", n.Label, n.Type)
		fmt.Fprintf(&sb, "resource \"%s\" \"%s\" {\n", n.Type, n.ID)

		// Output attributes in sorted order for determinism
		keys := sortedKeys(n.Attributes)
		for _, k := range keys {
			v := n.Attributes[k]
			// Check if it's a Terraform reference
			if isTerraformRef(v) {
				fmt.Fprintf(&sb, "  %s = %s\n", k, v)
			} else if isBool(v) {
				fmt.Fprintf(&sb, "  %s = %s\n", k, v)
			} else if isNumber(v) {
				fmt.Fprintf(&sb, "  %s = %s\n", k, v)
			} else {
				fmt.Fprintf(&sb, "  %s = %q\n", k, v)
			}
		}

		// Add depends_on if there are dependencies
		if deps, ok := depMap[n.ID]; ok && len(deps) > 0 {
			fmt.Fprint(&sb, "  depends_on = [")
			for i, src := range deps {
				if i > 0 {
					fmt.Fprint(&sb, ", ")
				}
				// Find the node type for the source
				for _, node := range proj.Nodes {
					if node.ID == src {
						fmt.Fprintf(&sb, "%s.%s", node.Type, src)
						break
					}
				}
			}
			fmt.Fprintln(&sb, "]")
		}

		fmt.Fprintln(&sb, "}")
		fmt.Fprintln(&sb)
	}

	return sb.String()
}

func sortedKeys(m map[string]string) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	for i := 0; i < len(keys)-1; i++ {
		for j := i + 1; j < len(keys); j++ {
			if keys[i] > keys[j] {
				keys[i], keys[j] = keys[j], keys[i]
			}
		}
	}
	return keys
}

func isTerraformRef(s string) bool {
	return strings.HasPrefix(s, "${") ||
		strings.HasPrefix(s, "aws_") ||
		strings.HasPrefix(s, "azurerm_") ||
		strings.HasPrefix(s, "google_") ||
		strings.Contains(s, ".id") ||
		strings.Contains(s, ".arn") ||
		strings.Contains(s, ".name")
}

func isBool(s string) bool {
	return s == "true" || s == "false"
}

func isNumber(s string) bool {
	_, err := parseNumber(s)
	return err == nil
}

func parseNumber(s string) (float64, error) {
	var n float64
	_, err := fmt.Sscanf(s, "%f", &n)
	return n, err
}

func buildVariablesTF(vars []VarDef) string {
	var sb strings.Builder

	fmt.Fprintln(&sb, "# Variables")
	fmt.Fprintln(&sb)

	for _, v := range vars {
		fmt.Fprintf(&sb, "variable %q {\n", v.Name)
		fmt.Fprintf(&sb, "  type        = %s\n", v.Type)
		if v.Description != "" {
			fmt.Fprintf(&sb, "  description = %q\n", v.Description)
		}
		if v.Default != nil {
			fmt.Fprintf(&sb, "  default     = %v\n", formatDefault(v.Default))
		}
		fmt.Fprintln(&sb, "}")
		fmt.Fprintln(&sb)
	}

	return sb.String()
}

func buildOutputsTF(outs []OutDef) string {
	var sb strings.Builder

	fmt.Fprintln(&sb, "# Outputs")
	fmt.Fprintln(&sb)

	for _, o := range outs {
		fmt.Fprintf(&sb, "output %q {\n", o.Name)
		fmt.Fprintf(&sb, "  value = %s\n", o.Value)
		if o.Description != "" {
			fmt.Fprintf(&sb, "  description = %q\n", o.Description)
		}
		if o.Sensitive {
			fmt.Fprintln(&sb, "  sensitive   = true")
		}
		fmt.Fprintln(&sb, "}")
		fmt.Fprintln(&sb)
	}

	return sb.String()
}

func formatDefault(v any) string {
	switch val := v.(type) {
	case string:
		if isTerraformRef(val) || isNumber(val) {
			return val
		}
		return fmt.Sprintf("%q", val)
	case float64:
		return fmt.Sprintf("%g", val)
	case int:
		return fmt.Sprintf("%d", val)
	case bool:
		if val {
			return "true"
		}
		return "false"
	case nil:
		return "null"
	default:
		return fmt.Sprintf("%q", fmt.Sprintf("%v", val))
	}
}

func buildReadme(proj CLIProject) string {
	var sb strings.Builder

	projectName := proj.Name
	if projectName == "" {
		projectName = "Terraform Project"
	}

	fmt.Fprintf(&sb, "# %s\n\n", projectName)
	fmt.Fprintln(&sb, "Generated by TerraformUI")
	fmt.Fprintln(&sb)
	fmt.Fprintf(&sb, "**Created:** %s\n\n", formatDate())
	fmt.Fprintln(&sb, "## Resources\n\n")

	// Group resources by type
	resourceTypes := make(map[string]int)
	for _, n := range proj.Nodes {
		resourceTypes[n.Type]++
	}

	for type_, count := range resourceTypes {
		fmt.Fprintf(&sb, "- %s (%d)\n", type_, count)
	}

	fmt.Fprintln(&sb)
	fmt.Fprintln(&sb, "## Usage\n\n")
	fmt.Fprintln(&sb, "```bash")
	fmt.Fprintln(&sb, "# Initialize")
	fmt.Fprintln(&sb, "terraform init\n")
	fmt.Fprintln(&sb, "# Validate")
	fmt.Fprintln(&sb, "terraform validate\n")
	fmt.Fprintln(&sb, "# Plan")
	fmt.Fprintln(&sb, "terraform plan -out=tfplan\n")
	fmt.Fprintln(&sb, "# Apply")
	fmt.Fprintln(&sb, "terraform apply tfplan")
	fmt.Fprintln(&sb, "```\n")

	if len(proj.Variables) > 0 {
		fmt.Fprintln(&sb, "## Variables\n\n")
		fmt.Fprintln(&sb, "| Name | Type | Default | Description |\n")
		fmt.Fprintln(&sb, "|------|------|---------|-------------|\n")
		for _, v := range proj.Variables {
			defaultVal := "-"
			if v.Default != nil {
				defaultVal = fmt.Sprintf("%v", v.Default)
			}
			desc := v.Description
			if desc == "" {
				desc = "-"
			}
			fmt.Fprintf(&sb, "| %s | %s | %s | %s |\n", v.Name, v.Type, defaultVal, desc)
		}
		fmt.Fprintln(&sb)
	}

	if len(proj.Outputs) > 0 {
		fmt.Fprintln(&sb, "## Outputs\n\n")
		for _, o := range proj.Outputs {
			if o.Description != "" {
				fmt.Fprintf(&sb, "- **%s**: %s\n", o.Name, o.Description)
			} else {
				fmt.Fprintf(&sb, "- **%s**\n", o.Name)
			}
		}
		fmt.Fprintln(&sb)
	}

	return sb.String()
}

func formatDate() string {
	return "2026-04-19"
}

func validateHCL(hcl string) error {
	// Write HCL to a temporary file
	tmpFile, err := os.CreateTemp("", "tvg-validate-*.tf")
	if err != nil {
		return fmt.Errorf("failed to create temp file: %w", err)
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)
	defer tmpFile.Close()

	if _, err := tmpFile.WriteString(hcl); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}
	tmpFile.Close()

	// Try terraform validate
	cmd := exec.Command("terraform", "validate", "-json")
	cmd.Dir = filepath.Dir(tmpPath)
	output, err := cmd.CombinedOutput()

	if err != nil {
		if len(output) > 0 {
			return fmt.Errorf("terraform validate failed: %s", string(output))
		}
		return fmt.Errorf("terraform validate failed: %w", err)
	}

	return nil
}

func formatHCL(hcl string, out *os.File) error {
	// Write HCL to a temporary file
	tmpFile, err := os.CreateTemp("", "tvg-fmt-*.tf")
	if err != nil {
		return fmt.Errorf("failed to create temp file: %w", err)
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)
	defer tmpFile.Close()

	if _, err := tmpFile.WriteString(hcl); err != nil {
		return fmt.Errorf("failed to write temp file: %w", err)
	}
	tmpFile.Close()

	// Run terraform fmt
	cmd := exec.Command("terraform", "fmt", tmpPath)
	if err := cmd.Run(); err != nil {
		// If terraform fmt fails, just output the original
		fmt.Fprint(out, hcl)
		return nil
	}

	// Read formatted file
	data, err := os.ReadFile(tmpPath)
	if err != nil {
		return fmt.Errorf("failed to read formatted file: %w", err)
	}

	fmt.Fprint(out, string(data))
	return nil
}
