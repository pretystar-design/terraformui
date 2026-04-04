package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
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

type GenerateRequest struct {
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

type ValidateResponse struct {
	Valid   bool     `json:"valid"`
	Errors  []string `json:"errors,omitempty"`
	Warnings []string `json:"warnings,omitempty"`
}

type PlanResponse struct {
	Add     int    `json:"add"`
	Change  int    `json:"change"`
	Destroy int    `json:"destroy"`
	Output  string `json:"output"`
}

func main() {
	http.HandleFunc("/api/generate", handleGenerate)
	http.HandleFunc("/api/validate", handleValidate)
	http.HandleFunc("/api/plan", handlePlan)
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"ok"}`)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Server starting on :%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}

func handleGenerate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req GenerateRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	hcl := generateHCL(req)
	w.Header().Set("Content-Type", "text/plain")
	fmt.Fprint(w, hcl)
}

func handleValidate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req GenerateRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	hcl := generateHCL(req)
	resp := runTerraformValidate(hcl)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func handlePlan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req GenerateRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	hcl := generateHCL(req)
	resp := runTerraformPlan(hcl)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func generateHCL(req GenerateRequest) string {
	var sb strings.Builder

	depMap := make(map[string][]string)
	for _, e := range req.Edges {
		depMap[e.Target] = append(depMap[e.Target], e.Source)
	}

	for _, n := range req.Nodes {
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

func runTerraformValidate(hcl string) ValidateResponse {
	dir, err := os.MkdirTemp("", "tfg-validate-*")
	if err != nil {
		return ValidateResponse{Valid: false, Errors: []string{fmt.Sprintf("failed to create temp dir: %v", err)}}
	}
	defer os.RemoveAll(dir)

	if err := os.WriteFile(filepath.Join(dir, "main.tf"), []byte(hcl), 0644); err != nil {
		return ValidateResponse{Valid: false, Errors: []string{fmt.Sprintf("failed to write tf file: %v", err)}}
	}

	cmd := exec.Command("terraform", "validate", "-json")
	cmd.Dir = dir
	output, err := cmd.CombinedOutput()

	if err != nil {
		return ValidateResponse{Valid: false, Errors: []string{string(output)}}
	}

	var result struct {
		Valid    bool `json:"valid"`
		Diag     []struct {
			Severity string `json:"severity"`
			Summary  string `json:"summary"`
			Detail   string `json:"detail"`
		} `json:"diagnostics"`
	}
	if err := json.Unmarshal(output, &result); err != nil {
		return ValidateResponse{Valid: false, Errors: []string{string(output)}}
	}

	var errors, warnings []string
	for _, d := range result.Diag {
		msg := d.Summary
		if d.Detail != "" {
			msg += ": " + d.Detail
		}
		if d.Severity == "error" {
			errors = append(errors, msg)
		} else {
			warnings = append(warnings, msg)
		}
	}

	return ValidateResponse{
		Valid:    result.Valid && len(errors) == 0,
		Errors:   errors,
		Warnings: warnings,
	}
}

func runTerraformPlan(hcl string) PlanResponse {
	dir, err := os.MkdirTemp("", "tfg-plan-*")
	if err != nil {
		return PlanResponse{Output: fmt.Sprintf("failed to create temp dir: %v", err)}
	}
	defer os.RemoveAll(dir)

	if err := os.WriteFile(filepath.Join(dir, "main.tf"), []byte(hcl), 0644); err != nil {
		return PlanResponse{Output: fmt.Sprintf("failed to write tf file: %v", err)}
	}

	initCmd := exec.Command("terraform", "init", "-backend=false")
	initCmd.Dir = dir
	if output, err := initCmd.CombinedOutput(); err != nil {
		return PlanResponse{Output: fmt.Sprintf("init failed: %s", string(output))}
	}

	planCmd := exec.Command("terraform", "plan", "-no-color")
	planCmd.Dir = dir
	output, err := planCmd.CombinedOutput()

	resp := PlanResponse{Output: string(output)}
	if err != nil {
		return resp
	}

	outputStr := string(output)
	for _, line := range strings.Split(outputStr, "\n") {
		if strings.Contains(line, "Plan:") {
			fmt.Sscanf(line, "Plan: %d to add, %d to change, %d to destroy.", &resp.Add, &resp.Change, &resp.Destroy)
		}
	}

	return resp
}
