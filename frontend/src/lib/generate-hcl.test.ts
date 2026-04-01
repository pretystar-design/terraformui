import { describe, it, expect } from 'vitest'
import { generateHCL, generateProviderBlocks, generateVariablesTF, generateOutputsTF } from '@/lib/generate-hcl'
import type { CanvasNode, CanvasEdge } from '@/types'

describe('generateHCL', () => {
  it('generates a single resource block', () => {
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
    const result = generateHCL(nodes, [])
    expect(result).toContain('resource "aws_instance" "my_instance"')
    expect(result).toContain('ami = "ami-12345"')
    expect(result).toContain('instance_type = "t2.micro"')
  })

  it('generates depends_on from edges', () => {
    const nodes: CanvasNode[] = [
      { id: 'a', type: 'aws_instance', label: 'A', provider: 'aws', position: { x: 0, y: 0 }, attributes: { ami: 'ami-123' } },
      { id: 'b', type: 'aws_security_group', label: 'B', provider: 'aws', position: { x: 100, y: 0 }, attributes: { name: 'sg' } },
    ]
    const edges: CanvasEdge[] = [{ id: 'a->b', source: 'a', target: 'b', type: 'dependency' }]
    const result = generateHCL(nodes, edges)
    expect(result).toContain('depends_on = ["a"]')
  })

  it('handles empty input', () => {
    const result = generateHCL([], [])
    expect(result).toBe('')
  })

  it('formats boolean values correctly', () => {
    const nodes: CanvasNode[] = [
      {
        id: 'bucket',
        type: 'aws_s3_bucket',
        label: 'Bucket',
        provider: 'aws',
        position: { x: 0, y: 0 },
        attributes: { versioning: true, force_destroy: false },
      },
    ]
    const result = generateHCL(nodes, [])
    expect(result).toContain('versioning = true')
    expect(result).toContain('force_destroy = false')
  })

  it('preserves Terraform expressions', () => {
    const nodes: CanvasNode[] = [
      {
        id: 'subnet',
        type: 'aws_subnet',
        label: 'Subnet',
        provider: 'aws',
        position: { x: 0, y: 0 },
        attributes: { vpc_id: 'aws_vpc.main.id', cidr_block: '10.0.1.0/24' },
      },
    ]
    const result = generateHCL(nodes, [])
    expect(result).toContain('vpc_id = aws_vpc.main.id')
  })
})

describe('generateProviderBlocks', () => {
  it('generates provider configuration', () => {
    const result = generateProviderBlocks({
      aws: { source: 'hashicorp/aws', version: '~> 5.0', region: 'us-east-1' },
    })
    expect(result).toContain('provider "aws"')
    expect(result).toContain('region = "us-east-1"')
  })
})

describe('generateVariablesTF', () => {
  it('generates variable blocks', () => {
    const result = generateVariablesTF([
      { name: 'region', type: 'string', description: 'AWS region', default: 'us-east-1', required: false },
    ])
    expect(result).toContain('variable "region"')
    expect(result).toContain('type        = string')
    expect(result).toContain('description = "AWS region"')
  })
})

describe('generateOutputsTF', () => {
  it('generates output blocks', () => {
    const result = generateOutputsTF([
      { name: 'instance_ip', value: 'aws_instance.my_instance.public_ip', description: 'Public IP' },
    ])
    expect(result).toContain('output "instance_ip"')
    expect(result).toContain('value = aws_instance.my_instance.public_ip')
  })
})
