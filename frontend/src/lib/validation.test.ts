import { describe, it, expect } from 'vitest'
import { validateNodes } from '@/lib/validation'
import type { CanvasNode, CanvasEdge } from '@/types'

describe('validateNodes', () => {
  it('passes for a valid node with all required attributes', () => {
    const nodes: CanvasNode[] = [
      {
        id: 'my_instance',
        type: 'aws_instance',
        label: 'My Instance',
        provider: 'aws',
        position: { x: 0, y: 0 },
        attributes: { ami: 'ami-12345', instance_type: 't2.micro' },
      },
    ]
    const result = validateNodes(nodes, [])
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails for missing required attributes', () => {
    const nodes: CanvasNode[] = [
      {
        id: 'my_instance',
        type: 'aws_instance',
        label: 'My Instance',
        provider: 'aws',
        position: { x: 0, y: 0 },
        attributes: { instance_type: 't2.micro' },
      },
    ]
    const result = validateNodes(nodes, [])
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.attribute === 'ami')).toBe(true)
  })

  it('detects dangling edge references', () => {
    const nodes: CanvasNode[] = []
    const edges: CanvasEdge[] = [
      { id: 'a->b', source: 'a', target: 'b', type: 'dependency' },
    ]
    const result = validateNodes(nodes, edges)
    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })
})
