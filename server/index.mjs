import { createServer } from 'node:http'
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.PORT) || 5175
const HOST = process.env.HOST || '0.0.0.0'
const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(dirname(ROOT), 'dist')
const DATA_DIR = join(ROOT, 'data')
const UPLOAD_DIR = join(DATA_DIR, 'uploads')
const DATA_FILE = join(DATA_DIR, 'bookings.json')
const SETTINGS_FILE = join(DATA_DIR, 'settings.json')

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  // 前端构建产物用到的类型（生产环境由本服务托管 dist）
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
}

const DEFAULT_SETTINGS = {
  brandIntro: '',
  email: 'hello@example.com',
  phone: '+86 000 0000 0000',
  telegram: '',
  instagram: '',
  facebook: '',
}

const SEED = [
  { id: 'HA-2601', name: 'Lin Wei', contact: '+86 138 **** 2041', slug: 'sanya-surf', date: '2026-11-08', pax: 2, status: 'new' },
  { id: 'HA-2602', name: 'Anna Petrova', contact: 'anna.p@example.com', slug: 'lingshui-retreat', date: '2026-11-14', pax: 4, status: 'confirmed' },
  { id: 'HA-2603', name: 'Chen Yu', contact: '+86 139 **** 7712', slug: 'wanning-dive', date: '2026-11-21', pax: 1, status: 'pending' },
  { id: 'HA-2604', name: 'Mikhail Ivanov', contact: 'm.ivanov@example.com', slug: 'haikou-culture', date: '2026-12-02', pax: 3, status: 'new' },
  { id: 'HA-2605', name: 'Zhang Min', contact: '+86 137 **** 3390', slug: 'sanya-surf', date: '2026-10-30', pax: 2, status: 'done' },
  { id: 'HA-2606', name: 'Elena Sokolova', contact: 'elena.s@example.com', slug: 'lingshui-retreat', date: '2026-12-12', pax: 6, status: 'confirmed' },
]

async function readAll() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    const list = JSON.parse(raw)
    if (Array.isArray(list)) return list
  } catch {
    // 首次运行或文件损坏时回退种子数据
  }
  return SEED.map((item) => ({ ...item }))
}

async function writeAll(list) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8')
}

async function readSettings() {
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf8')
    const data = JSON.parse(raw)
    if (data && typeof data === 'object') return { ...DEFAULT_SETTINGS, ...data }
  } catch {
    // 首次运行使用默认联系方式
  }
  return { ...DEFAULT_SETTINGS }
}

async function writeSettings(data) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function nextId(list) {
  const used = new Set(list.map((item) => item.id))
  let index = list.length + 1
  while (used.has(`HA-${2600 + index}`)) index += 1
  return `HA-${2600 + index}`
}

function send(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
}

async function readRaw(req, limit = 12 * 1024 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new Error('too large')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname

  if (req.method === 'OPTIONS') return send(res, 204, {})

  // 项目图集图片上传（原始二进制 + 文件名）
  if (path === '/api/uploads' && req.method === 'POST') {
    const original = String(url.searchParams.get('name') || 'image.jpg')
    const ext = (extname(original) || '.jpg').toLowerCase()
    if (!MIME[ext]) return send(res, 400, { error: 'unsupported file type' })

    let buffer
    try {
      buffer = await readRaw(req)
    } catch {
      return send(res, 413, { error: 'file too large' })
    }
    if (!buffer.length) return send(res, 400, { error: 'empty file' })

    const base = original
      .slice(0, original.length - extname(original).length)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 40) || 'image'
    const file = `${Date.now()}-${base}${ext}`
    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(join(UPLOAD_DIR, file), buffer)
    return send(res, 201, { url: `/uploads/${file}` })
  }

  // 图集图片访问
  if (path.startsWith('/uploads/')) {
    const file = path.slice('/uploads/'.length)
    if (!file || file.includes('/') || file.includes('..')) return send(res, 404, { error: 'not found' })
    try {
      const buffer = await readFile(join(UPLOAD_DIR, file))
      const ext = extname(file).toLowerCase()
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      })
      return res.end(buffer)
    } catch {
      return send(res, 404, { error: 'not found' })
    }
  }

  // 删除图集图片
  if (path.startsWith('/api/uploads/') && req.method === 'DELETE') {
    const file = path.slice('/api/uploads/'.length)
    if (!file || file.includes('/') || file.includes('..')) return send(res, 400, { error: 'invalid file' })
    try {
      await unlink(join(UPLOAD_DIR, file))
    } catch {
      // 文件已不存在时同样视为删除成功
    }
    return send(res, 200, { ok: true })
  }

  // 预订列表
  if (path === '/api/bookings' && req.method === 'GET') {
    return send(res, 200, await readAll())
  }

  // 页脚联系方式与社交链接
  if (path === '/api/settings' && req.method === 'GET') {
    return send(res, 200, await readSettings())
  }

  if (path === '/api/settings' && req.method === 'PUT') {
    const body = await readBody(req)
    if (!body || typeof body !== 'object') return send(res, 400, { error: 'invalid body' })
    const current = await readSettings()
    const next = { ...current }
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (key in body) {
        const limit = key === 'brandIntro' ? 600 : 200
        next[key] = String(body[key] ?? '').trim().slice(0, limit)
      }
    }
    await writeSettings(next)
    return send(res, 200, next)
  }

  // 新建预订（前端表单提交）
  if (path === '/api/bookings' && req.method === 'POST') {
    const body = await readBody(req)
    if (!body || !body.name || !body.contact || !body.date) {
      return send(res, 400, { error: 'name / contact / date are required' })
    }

    const list = await readAll()
    const record = {
      id: nextId(list),
      name: String(body.name).trim().slice(0, 80),
      contact: String(body.contact).trim().slice(0, 120),
      slug: body.slug ? String(body.slug) : '',
      projectName: body.projectName ? String(body.projectName).slice(0, 120) : '',
      date: String(body.date).slice(0, 20),
      pax: Number(body.pax) || 1,
      status: 'new',
      fromCity: body.fromCity ? String(body.fromCity).slice(0, 60) : '',
      flightNo: body.flightNo ? String(body.flightNo).slice(0, 60) : '',
      arriveTime: body.arriveTime ? String(body.arriveTime).slice(0, 60) : '',
      screenshot: body.screenshot ? String(body.screenshot).slice(0, 200) : '',
      remark: body.remark ? String(body.remark).slice(0, 1000) : '',
      lang: body.lang ? String(body.lang).slice(0, 8) : '',
      createdAt: new Date().toISOString(),
    }
    list.push(record)
    await writeAll(list)
    return send(res, 201, record)
  }

  const match = path.match(/^\/api\/bookings\/([^/]+)$/)
  if (match) {
    const id = decodeURIComponent(match[1])
    const list = await readAll()
    const index = list.findIndex((item) => item.id === id)
    if (index < 0) return send(res, 404, { error: 'not found' })

    if (req.method === 'PATCH') {
      const body = await readBody(req)
      if (!body || typeof body !== 'object') return send(res, 400, { error: 'invalid body' })
      const allowed = ['status', 'name', 'contact', 'date', 'pax', 'remark']
      const patch = {}
      for (const key of allowed) {
        if (key in body) patch[key] = body[key]
      }
      list[index] = { ...list[index], ...patch, updatedAt: new Date().toISOString() }
      await writeAll(list)
      return send(res, 200, list[index])
    }

    if (req.method === 'DELETE') {
      const [removed] = list.splice(index, 1)
      await writeAll(list)
      return send(res, 200, removed)
    }
  }

  if (path.startsWith('/api/')) return send(res, 404, { error: 'not found' })

  // 静态资源：生产环境由本服务同时托管前端构建产物（dist）
  // /api 与 /uploads 之外的请求全部走这里；找不到文件则回退 index.html，交给前端路由处理
  let rel = '/'
  try {
    rel = decodeURIComponent(path)
  } catch {
    return send(res, 400, { error: 'invalid path' })
  }
  if (rel.includes('..')) return send(res, 400, { error: 'invalid path' })
  if (rel === '/' || rel === '') rel = '/index.html'

  try {
    const buffer = await readFile(join(DIST_DIR, rel))
    const ext = extname(rel).toLowerCase()
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      // 带哈希的静态资源可长缓存，index.html 不缓存以便发版即时生效
      'Cache-Control': rel === '/index.html' ? 'no-store' : 'public, max-age=3600',
    })
    return res.end(buffer)
  } catch {
    try {
      const html = await readFile(join(DIST_DIR, 'index.html'))
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
      return res.end(html)
    } catch {
      return send(res, 404, { error: 'frontend not built: run npm run build' })
    }
  }
})

if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })

server.listen(PORT, HOST, () => {
  console.log(`[hainan] listening on http://${HOST}:${PORT}`)
  console.log(`[hainan] data file: ${DATA_FILE}`)
  console.log(`[hainan] static dir: ${DIST_DIR}`)
})
