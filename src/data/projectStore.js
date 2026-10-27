import { useEffect, useState } from 'react'
import { projects as baseProjects } from './projects'

const STORAGE_KEY = 'hainan.projects.v1'
const LEGACY_PRICE_KEY = 'hainan.prices.v1'
const EVENT = 'hainan:projects'

const TONES = ['a', 'b', 'c', 'd']

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
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : null
    if (Array.isArray(list) && list.length) return list
  } catch {
    // 本地存储异常时回退默认项目
  }
  return defaults()
}

export function saveProjects(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 本地存储不可用时仅保留页面状态
  }
  window.dispatchEvent(new Event(EVENT))
}

export function createProject(list) {
  const used = new Set(list.map((project) => project.slug))
  let index = 1
  while (used.has(`custom-${index}`)) index += 1

  return {
    slug: `custom-${index}`,
    key: null,
    name: '',
    price: 0,
    deposit: 0,
    tone: TONES[list.length % TONES.length],
  }
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
