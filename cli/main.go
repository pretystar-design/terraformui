package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type CLIProject struct {
	Nodes     []Node   `json:"nodes"`
	Edges     []Edge   `json:"edges"`
	Variables []VarDef `json:"variables,omitempty"`
	Outputs   []OutDef `json:"outputs,omitempty"`
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
	default:
		fmt.Fprintf(os.Stderr, "unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Usage: tfg <command> <model.json> [options]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  generate <model.json> --output <dir>  Generate .tf files")
	fmt.Println("  validate <model.json>                 Validate generated HCL")
}

func generate(proj CLIProject, outputDir string) error {
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return err
	}

	hcl := buildHCL(proj)
	if err := os.WriteFile(filepath.Join(outputDir, "main.tf"), []byte(hcl), 0644); err != nil {
		return err
	}

	if len(proj.Variables) > 0 {
		vars := buildVariablesTF(proj.Variables)
		if err := os.WriteFile(filepath.Join(outputDir, "variables.tf"), []byte(vars), 0644); err != nil {
			return err
		}
	}

	if len(proj.Outputs) > 0 {
		outs := buildOutputsTF(proj.Outputs)
		if err := os.WriteFile(filepath.Join(outputDir, "outputs.tf"), []byte(outs), 0644); err != nil {
			return err
		}
	}

	fmt.Printf("Generated %d file(s) in %s\n", 1+len(proj.Variables)/1000+len(proj.Outputs)/1000, outputDir)
	return nil
}

func buildHCL(proj CLIProject) string {
	var sb strings.Builder

	depMap := make(map[string][]string)
	for _, e := range proj.Edges {
		depMap[e.Target] = append(depMap[e.Target], e.Source)
	}

	for _, n := range proj.Nodes {
		fmt.Fprintf(&sb, "resource \"%s\" \"%s\" {\n", n.Type, n.ID)
		for k, v := range n.Attributes {
			fmt.Fprintf(&sb, "  %s = %q\n", k, v)
		}
		if deps, ok := depMap[n.ID]; ok && len(deps) > 0 {
			fmt.Fprint(&sb, "  depends_on = [")
			for i, src := range deps {
				if i > 0 {
					fmt.Fprint(&sb, ", ")
				}
				fmt.Fprintf(&sb, "%q", src)
			}
			fmt.Fprintln(&sb, "]")
		}
		fmt.Fprintln(&sb, "}")
		fmt.Fprintln(&sb)
	}

	return sb.String()
}

func buildResourcesTF(proj CLIProject) string {
	return buildHCL(proj)
}

func buildVariablesTF(vars []VarDef) string {
	var sb strings.Builder
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
	for _, o := range outs {
		fmt.Fprintf(&sb, "output %q {\n", o.Name)
		fmt.Fprintf(&sb, "  value = %s\n", o.Value)
		if o.Description != "" {
			fmt.Fprintf(&sb, "  description = %q\n", o.Description)
		}
		if o.Sensitive {
			fmt.Fprintln(&sb, "  sensitive = true")
		}
		fmt.Fprintln(&sb, "}")
		fmt.Fprintln(&sb)
	}
	return sb.String()
}

func formatDefault(v any) string {
	switch val := v.(type) {
	case string:
		return fmt.Sprintf("%q", val)
	case float64:
		return fmt.Sprintf("%v", val)
	case bool:
		return fmt.Sprintf("%v", val)
	default:
		return fmt.Sprintf("%v", val)
	}
}

func validateHCL(hcl string) error {
	dir, err := os.MkdirTemp("", "tfg-validate-*")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)

	if err := os.WriteFile(filepath.Join(dir, "main.tf"), []byte(hcl), 0644); err != nil {
		return err
	}

	cmd := exec.Command("terraform", "validate", "-json")
	cmd.Dir = dir
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("%s", string(output))
	}

	var result struct {
		Valid bool `json:"valid"`
	}
	if err := json.Unmarshal(output, &result); err != nil {
		return fmt.Errorf("failed to parse validation output: %v", err)
	}
	if !result.Valid {
		return fmt.Errorf("validation failed: %s", string(output))
	}

	return nil
}
