import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

export async function saveUploadedFile(file: File): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true })
  const ext = file.name.split('.').pop() || 'png'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(UPLOAD_DIR, filename), buffer)
  return `/uploads/${filename}`
}
