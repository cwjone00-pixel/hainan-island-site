import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { LanguageProvider } from './i18n'
import SiteLayout from './components/SiteLayout'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Booking from './pages/Booking'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

/* 记录从客服站跳转带来的会话 ID（?bsid=）：任意页面一进来就先存下来，
   避免访客先浏览项目、再点「立即预订」时查询参数已丢失，导致清单落不到原会话 */
function ChatSessionCapture() {
  const { search } = useLocation()

  useEffect(() => {
    const bsid = new URLSearchParams(search).get('bsid')
    if (bsid && /^[A-Za-z0-9_-]{1,64}$/.test(bsid)) {
      try {
        localStorage.setItem('bs_sid', bsid)
      } catch {
        /* 隐私模式下不可用，忽略 */
      }
    }
  }, [search])

  return null
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'}>
        <ScrollManager />
        <ChatSessionCapture />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
