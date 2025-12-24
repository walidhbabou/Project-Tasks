import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProjectProvider, useProjects } from '@/contexts/ProjectContext'
import React from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock API services with in-memory store to reflect refreshProjects
const mockProjects: any[] = []
vi.mock('@/services/api', () => ({
  projectApi: {
    createProject: vi.fn(async (payload) => {
      const created = { id: 1, name: payload.name, description: payload.description, color: '#0EA5E9', tasks: [], createdAt: new Date().toISOString() }
      mockProjects.push(created)
      return created
    }),
    getAllProjects: vi.fn(async () => [...mockProjects]),
  },
  taskApi: {
    createTask: vi.fn(async (_projectId, task) => ({ id: Math.random().toString(), title: task.title, description: task.description, completed: false, dueDate: task.dueDate, section: task.section })),
    updateTaskStatus: vi.fn(async () => ({ status: 'COMPLETED', completed: true })),
    toggleTaskComplete: vi.fn(async () => ({ completed: true })),
  },
}))

// Ensure auth is considered authenticated and reset mocks per test
beforeEach(() => {
  // Simulate an authenticated user so `isAuthenticated` is true
  localStorage.setItem('user', JSON.stringify({ id: 'test', email: 'test', name: 'test' }))
  // Reset in-memory projects
  mockProjects.length = 0
})

afterEach(() => {
  localStorage.clear()
})

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <ProjectProvider>{children}</ProjectProvider>
  </AuthProvider>
)

describe('Project progress rounding to 5% steps', () => {
  it('returns 35% for 1 of 3 tasks completed', async () => {
    const { result } = renderHook(() => useProjects(), { wrapper })

    await act(async () => {
      await result.current.addProject('Test Project')
    })
    await waitFor(() => expect(result.current.projects.length).toBe(1))
    const pid = result.current.projects[0].id

    await act(async () => {
      await result.current.addTask(pid, 'Task A')
      await result.current.addTask(pid, 'Task B')
      await result.current.addTask(pid, 'Task C')
    })

    // Ensure state reflects all 3 tasks before proceeding
    await waitFor(() => expect(result.current.projects[0].tasks.length).toBe(3))

    // Mark one task completed
    const tId = result.current.projects[0].tasks[0].id
    await act(async () => {
      await result.current.toggleTaskComplete(pid, tId)
    })

    const progress = result.current.getProjectProgress(pid)
    expect(progress).toBe(35) // 33.33 rounded to nearest 5 -> 35
  })
})
