import { describe, it, expect } from 'vitest'
import { parseTFState } from '@/lib/tfstate-parser'

describe('parseTFState', () => {
  it('parses a simple tfstate with one resource', () => {
    const state = JSON.stringify({
      version: 4,
      terraform_version: '1.5.0',
      serial: 1,
      lineage: 'test-123',
      outputs: {},
      resources: [
        {
          module: '',
          mode: 'managed',
          type: 'aws_instance',
          name: 'web',
          provider: 'provider["registry.terraform.io/hashicorp/aws"]',
          instances: [
            {
              attributes: {
                id: 'i-12345',
                ami: 'ami-12345',
                instance_type: 't2.micro',
                tags: { Name: 'web' },
              },
            },
          ],
        },
      ],
    })

    const { nodes, edges } = parseTFState(state)
    expect(nodes).toHaveLength(1)
    expect(nodes[0].type).toBe('aws_instance')
    expect(nodes[0].id).toBe('aws_instance_web')
    expect(nodes[0].imported).toBe(true)
    expect(nodes[0].attributes.ami).toBe('ami-12345')
    expect(edges).toHaveLength(0)
  })

  it('parses resources with dependencies', () => {
    const state = JSON.stringify({
      version: 4,
      terraform_version: '1.5.0',
      serial: 1,
      lineage: 'test-456',
      outputs: {},
      resources: [
        {
          mode: 'managed',
          type: 'aws_vpc',
          name: 'main',
          provider: 'provider["registry.terraform.io/hashicorp/aws"]',
          instances: [{ attributes: { id: 'vpc-123', cidr_block: '10.0.0.0/16' } }],
        },
        {
          mode: 'managed',
          type: 'aws_instance',
          name: 'web',
          provider: 'provider["registry.terraform.io/hashicorp/aws"]',
          instances: [
            {
              attributes: { ami: 'ami-123' },
              dependencies: ['aws_vpc.main'],
            },
          ],
        },
      ],
    })

    const { nodes, edges } = parseTFState(state)
    expect(nodes).toHaveLength(2)
    expect(edges).toHaveLength(1)
    expect(edges[0].source).toBe('aws_vpc_main')
    expect(edges[0].target).toBe('aws_instance_web')
  })

  it('skips data sources', () => {
    const state = JSON.stringify({
      version: 4,
      terraform_version: '1.5.0',
      serial: 1,
      lineage: 'test-789',
      outputs: {},
      resources: [
        {
          mode: 'data',
          type: 'aws_ami',
          name: 'latest',
          provider: 'provider["registry.terraform.io/hashicorp/aws"]',
          instances: [{ attributes: { id: 'ami-latest' } }],
        },
      ],
    })

    const { nodes } = parseTFState(state)
    expect(nodes).toHaveLength(0)
  })
})
