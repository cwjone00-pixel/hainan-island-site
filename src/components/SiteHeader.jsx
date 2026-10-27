import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'

export default function SiteHeader() {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = pathname === '/'
  const isTransparent = isHome && !scrolled

  return (
    <header className={`site-header ${isTransparent ? 'is-transparent' : 'is-solid'}`}>
      <div className="site-header__inner">
        <Link to="/" className="brand" aria-label={t('nav.home')}>
          {t('brand.name')}
          <span className="brand__tag">{t('brand.tag')}</span>
        </Link>

        <div className="site-header__actions">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
