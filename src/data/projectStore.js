import { useEffect, useState } from 'react'
import { projects as baseProjects } from './projects'

const STORAGE_KEY = 'hainan.projects.v1'
const LEGACY_PRICE_KEY = 'hainan.prices.v1'
const EVENT = 'hainan:projects'
/* 项目与价格的后台覆盖：站内嵌入（客服站后台「海南项目体验 · 项目与价格」）时同源读写，
   后台保存后所有游客看到的都是同一份；独立部署时该接口不存在，自动退回本地存储 */
const REMOTE_API = '/api/exp/projects'

let remoteOverrides = {}

/* 把后台配置覆盖到项目上：价格/定金是数字，名称与简介等文字留空则不覆盖，继续用默认三语文案；
   页面内容（概览/亮点）与图集由后台「海南项目体验 · 项目页面内容」维护，保存后游客端刷新即生效 */
function applyOverrides(list, overrides) {
  if (!overrides || !Object.keys(overrides).length) return list
  return list.map((project) => {
    const o = overrides[project.slug]
    if (!o) return project
    const next = { ...project }
    if (typeof o.price === 'number') next.price = o.price
    if (typeof o.deposit === 'number') next.deposit = o.deposit
    if (o.name) next.name = o.name
    const meta = { ...(project.meta || {}) }
    ;['intro', 'duration', 'group', 'level', 'from'].forEach((key) => {
      if (o[key]) meta[key] = o[key]
    })
    if (Object.keys(meta).length) next.meta = meta
    if (o.content && typeof o.content === 'object') {
      next.content = {
        overview: Array.isArray(o.content.overview) ? o.content.overview : [],
        highlights: Array.isArray(o.content.highlights) ? o.content.highlights : [],
      }
    }
    if (Array.isArray(o.gallery)) next.gallery = o.gallery
    return next
  })
}

async function fetchRemoteProjects() {
  try {
    const res = await fetch(REMOTE_API, { headers: { Accept: 'application/json' } })
    if (!res.ok) return
    const data = await res.json()
    remoteOverrides = (data && data.projects) || {}
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // 独立部署没有该接口：保持本地存储行为
  }
}
fetchRemoteProjects()

function defaults() {
  let legacy = {}
  try {
    const raw = window.localStorage.getItem(LEGACY_PRICE_KEY)
    if (raw) legacy = JSON.parse(raw) || {}
  } catch {
    legacy = {}
  }

  return baseProjects.map((project) => ({
    ...project,
    name: '',
    price: legacy[project.slug]?.price ?? project.price,
    deposit: legacy[project.slug]?.deposit ?? project.deposit,
  }))
}

function load() {
  let list
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const saved = raw ? JSON.parse(raw) : null
    list = Array.isArray(saved) && saved.length ? saved : defaults()
  } catch {
    // 本地存储异常时回退默认项目
    list = defaults()
  }
  return applyOverrides(list, remoteOverrides)
}

export function projectCopy(project, t) {
  const localized = project?.key ? t(`projects.${project.key}`) : null
  if (localized && typeof localized === 'object' && localized.name) return localized
  return t('projects.custom')
}

export function projectName(project, t) {
  const name = project?.name?.trim()
  if (name) return name
  return projectCopy(project, t).name
}

export function defaultContent(t) {
  return {
    overview: [t('detail.overviewP1'), t('detail.overviewP2')],
    highlights: [...t('detail.highlightItems')],
  }
}

export function projectContent(project, t) {
  const content = project?.content
  if (!content) return defaultContent(t)
  return {
    overview: Array.isArray(content.overview) ? content.overview : [],
    highlights: Array.isArray(content.highlights) ? content.highlights : [],
  }
}

export function projectMeta(project, t) {
  const copy = projectCopy(project, t)
  const meta = project?.meta || {}
  return {
    intro: (meta.intro ?? '').trim() || copy.lead,
    duration: (meta.duration ?? '').trim() || copy.duration,
    group: (meta.group ?? '').trim() || copy.group,
    level: (meta.level ?? '').trim() || copy.level,
    from: (meta.from ?? '').trim() || copy.from,
  }
}

export function projectGallery(project) {
  return Array.isArray(project?.gallery) ? project.gallery : []
}

export function useProjects() {
  const [projects, setProjects] = useState(load)

  useEffect(() => {
    const sync = () => setProjects(load())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return projects
}

export function useProject(slug) {
  const projects = useProjects()
  return projects.find((project) => project.slug === slug) || null
}
