import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useSettings } from '../data/settingsStore'

export default function Home() {
  const { t } = useLanguage()
  const settings = useSettings()
  const intro = (settings.brandIntro || '').trim()

  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />

        <div className="hero__inner">
          <div className="hero__content">
            <p className="eyebrow hero__eyebrow">{t('hero.eyebrow')}</p>
            <h1 className="display hero__title">
              <span>{t('hero.titleA')}</span>
              <span>{t('hero.titleB')}</span>
            </h1>
            {intro ? <p className="hero__lead">{intro}</p> : null}
            <div className="hero__actions">
              <Link to="/projects" className="btn btn--solid">
                {t('hero.primary')}
              </Link>
              <Link to="/booking" className="btn btn--ghost">
                {t('hero.secondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
