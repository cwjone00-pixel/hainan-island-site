import { useEffect, useState } from 'react'

const API = '/api/settings'
const EVENT = 'hainan:settings'

export const defaultSettings = {
  brandIntro: '',
  email: 'hello@example.com',
  phone: '+86 000 0000 0000',
  telegram: '',
  instagram: '',
  facebook: '',
}

export let cache = defaultSettings
export let loaded = false
let loading = null

function emit() {
  window.dispatchEvent(new Event(EVENT))
}

export async function loadSettings() {
  if (loading) return loading
  loading = (async () => {
    try {
      const res = await fetch(API, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json()
      if (data && typeof data === 'object') cache = { ...defaultSettings, ...data }
    } catch {
      // 后端未启动时使用默认联系方式
    } finally {
      loaded = true
      loading = null
      emit()
    }
  })()
  return loading
}

export async function saveSettings(next) {
  cache = { ...defaultSettings, ...next }
  emit()
  try {
    const res = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cache),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (data && typeof data === 'object') cache = { ...defaultSettings, ...data }
    emit()
    return true
  } catch {
    await loadSettings()
    return false
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(cache)

  useEffect(() => {
    const sync = () => setSettings({ ...cache })
    window.addEventListener(EVENT, sync)
    if (!loaded) loadSettings()
    sync()
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  return settings
}
