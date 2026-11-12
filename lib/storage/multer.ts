import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import multer from 'multer'

export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
])

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

function ensureUploadDirSync() {
  if (!fsSync.existsSync(UPLOAD_DIR)) {
    fsSync.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDirSync()
    cb(null, UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 48)
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    cb(null, `${unique}-${base || 'image'}${ext}`)
  },
})

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(
        new Error(
          `Unsupported file type "${file.mimetype}". Allowed: JPG, PNG, WebP, AVIF, SVG, ICO.`
        )
      )
      return
    }
    cb(null, true)
  },
}).single('file')

export type MulterUploadedFile = {
  filename: string
  originalname: string
  mimetype: string
  size: number
  publicUrl: string
  storagePath: string
  altText: string
}

export async function parseMulterImageUpload(request: Request): Promise<MulterUploadedFile> {
  const arrayBuffer = await request.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const stream = Readable.from(buffer) as Readable & {
    headers: Record<string, string>
    method: string
    body?: Record<string, unknown>
    file?: Express.Multer.File
  }

  stream.headers = {}
  request.headers.forEach((value, key) => {
    stream.headers[key.toLowerCase()] = value
  })
  stream.method = request.method

  const mockReq = stream as unknown as Parameters<typeof uploadMiddleware>[0]
  const mockRes = {} as Parameters<typeof uploadMiddleware>[1]

  await new Promise<void>((resolve, reject) => {
    uploadMiddleware(mockReq, mockRes, (err?: unknown) => {
      if (err) {
        reject(err instanceof Error ? err : new Error('File upload failed.'))
        return
      }
      resolve()
    })
  })

  if (!stream.file) {
    throw new Error('No image file provided.')
  }

  const rawAlt = typeof stream.body?.altText === 'string' ? stream.body.altText.trim() : ''
  const altText = rawAlt || stream.file.originalname.replace(/\.[^.]+$/, '')

  return {
    filename: stream.file.filename,
    originalname: stream.file.originalname,
    mimetype: stream.file.mimetype,
    size: stream.file.size,
    publicUrl: `/uploads/${stream.file.filename}`,
    storagePath: stream.file.filename,
    altText,
  }
}

export async function deleteMulterUploadedFile(storagePath: string): Promise<void> {
  if (!storagePath) return
  const safeName = path.basename(storagePath)
  const fullPath = path.join(UPLOAD_DIR, safeName)
  await fs.unlink(fullPath).catch(() => {})
}
