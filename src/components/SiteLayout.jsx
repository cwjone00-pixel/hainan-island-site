import { Outlet } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

export default function SiteLayout() {
  return (
    <div className="site">
      <SiteHeader />
      <main className="site__main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
