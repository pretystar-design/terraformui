import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export function exportAsTF(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  saveAs(blob, filename)
}

export async function exportAsZIP(files: Record<string, string>, projectName: string) {
  const zip = new JSZip()
  const folder = zip.folder(projectName)!

  for (const [name, content] of Object.entries(files)) {
    if (content) folder.file(name, content)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `${projectName}.zip`)
}
