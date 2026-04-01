import { create } from 'zustand'
import type { Project, ProjectSnapshot, ProjectMetadata } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface ProjectState {
  projects: ProjectMetadata[]
  currentProject: Project | null
  snapshots: ProjectSnapshot[]
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'

  createProject: (name: string) => void
  switchProject: (id: string) => void
  deleteProject: (id: string) => void
  saveCurrentProject: () => void
  createSnapshot: (message?: string) => void
  restoreSnapshot: (snapshotId: string) => void
  exportProject: () => string
  importProject: (json: string) => void
}

const STORAGE_KEY = 'tvg-projects'

function loadProjects(): ProjectMetadata[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadProject(id: string): Project | null {
  try {
    const raw = localStorage.getItem(`tvg-project-${id}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveProjectToStorage(project: Project) {
  localStorage.setItem(`tvg-project-${project.id}`, JSON.stringify(project))
}

function saveProjectList(projects: ProjectMetadata[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: loadProjects(),
  currentProject: null,
  snapshots: [],
  saveStatus: 'idle',

  createProject: (name) => {
    const id = uuidv4()
    const project: Project = {
      id,
      name,
      nodes: [],
      edges: [],
      variables: [],
      outputs: [],
      providers: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    saveProjectToStorage(project)
    const meta: ProjectMetadata = {
      id,
      name,
      lastModified: Date.now(),
      nodeCount: 0,
      versionCount: 0,
    }
    const projects = [...get().projects, meta]
    saveProjectList(projects)
    set({ currentProject: project, projects, saveStatus: 'saved' })
  },

  switchProject: (id) => {
    const project = loadProject(id)
    if (project) {
      set({ currentProject: project, saveStatus: 'saved' })
    }
  },

  deleteProject: (id) => {
    localStorage.removeItem(`tvg-project-${id}`)
    const projects = get().projects.filter((p) => p.id !== id)
    saveProjectList(projects)
    set({
      projects,
      currentProject: get().currentProject?.id === id ? null : get().currentProject,
    })
  },

  saveCurrentProject: () => {
    const project = get().currentProject
    if (!project) return
    set({ saveStatus: 'saving' })
    project.updatedAt = Date.now()
    project.lastSavedAt = Date.now()
    saveProjectToStorage(project)
    const projects = get().projects.map((p) =>
      p.id === project.id ? { ...p, lastModified: Date.now(), nodeCount: project.nodes.length } : p,
    )
    saveProjectList(projects)
    set({ saveStatus: 'saved', projects })
  },

  createSnapshot: (message) => {
    const project = get().currentProject
    if (!project) return
    const snapshot: ProjectSnapshot = {
      id: uuidv4(),
      projectId: project.id,
      timestamp: Date.now(),
      message,
      state: {
        nodes: project.nodes,
        edges: project.edges,
        variables: project.variables,
        outputs: project.outputs,
      },
    }
    set((state) => ({ snapshots: [...state.snapshots, snapshot] }))
  },

  restoreSnapshot: (snapshotId) => {
    const snapshot = get().snapshots.find((s) => s.id === snapshotId)
    const project = get().currentProject
    if (!snapshot || !project) return
    project.nodes = snapshot.state.nodes
    project.edges = snapshot.state.edges
    project.variables = snapshot.state.variables
    project.outputs = snapshot.state.outputs
    project.updatedAt = Date.now()
    saveProjectToStorage(project)
    set({ currentProject: project })
  },

  exportProject: () => {
    const project = get().currentProject
    return project ? JSON.stringify(project, null, 2) : ''
  },

  importProject: (json) => {
    const data: Project = JSON.parse(json)
    data.id = uuidv4()
    saveProjectToStorage(data)
    const meta: ProjectMetadata = {
      id: data.id,
      name: data.name,
      lastModified: Date.now(),
      nodeCount: data.nodes.length,
      versionCount: 0,
    }
    const projects = [...get().projects, meta]
    saveProjectList(projects)
    set({ currentProject: data, projects, saveStatus: 'saved' })
  },
}))
