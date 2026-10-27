import { useEffect, useState } from 'react'
import { customers as baseCustomers } from './customers'

const API = '/api/bookings'
const EVENT = 'hainan:customers'

let cache = baseCustomers
let loaded = false

function emit() {
  window.dispatchEvent(new Event(EVENT))
}

function newestFirst(list) {
  return list.slice().sort((a, b) => {
    const byTime = String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    return byTime !== 0 ? byTime : String(b.id).localeCompare(String(a.id))
  })
}

export async function loadCustomers() {
  try {
    const res = await fetch(API, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const list = await res.json()
    if (Array.isArray(list)) cache = newestFirst(list)
  } catch {
    // 后端未启动时保留演示数据
  }
  loaded = true
  emit()
}

export async function updateCustomerStatus(id, status) {
  cache = cache.map((item) => (item.id === id ? { ...item, status } : item))
  emit()
  try {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
  } catch {
    await loadCustomers()
  }
}

export async function removeCustomer(id) {
  cache = cache.filter((item) => item.id !== id)
  emit()
  try {
    const res = await fetch(`${API}/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`status ${res.status}`)
  } catch {
    await loadCustomers()
  }
}

export function useCustomers() {
  const [list, setList] = useState(cache)

  useEffect(() => {
    const sync = () => setList(cache)
    window.addEventListener(EVENT, sync)
    if (!loaded) loadCustomers()
    return () => window.removeEventListener(EVENT, sync)
  }, [])

  return list
}
