import { useCallback } from 'react'
import { useCanvasStore } from '@/store/canvas-store'
import { generateHCL, generateProviderBlocks, generateVariablesTF, generateOutputsTF } from '@/lib/generate-hcl'

export function useHCLPreview() {
  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const variables = useCanvasStore((s) => s.variables)
  const outputs = useCanvasStore((s) => s.outputs)

  const generate = useCallback(() => {
    const providers: Record<string, { source: string; region?: string }> = {}
    for (const node of nodes) {
      const provider = node.provider
      if (!providers[provider]) {
        providers[provider] = {
          source: provider === 'aws' ? 'hashicorp/aws' : provider === 'azure' ? 'hashicorp/azurerm' : 'hashicorp/google',
          region: undefined,
        }
      }
    }

    const providerBlocks = generateProviderBlocks(providers)
    const resourceBlocks = generateHCL(nodes, edges)
    const variablesBlocks = generateVariablesTF(variables)
    const outputsBlocks = generateOutputsTF(outputs)

    return [providerBlocks, resourceBlocks, variablesBlocks, outputsBlocks]
      .filter(Boolean)
      .join('\n')
  }, [nodes, edges, variables, outputs])

  return { hcl: generate(), generate }
}
