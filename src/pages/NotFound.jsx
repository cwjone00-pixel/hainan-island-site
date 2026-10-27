import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <section className="section notfound">
      <div className="container">
        <p className="eyebrow">404</p>
        <h1 className="h2">{t('notFound.title')}</h1>
        <p className="section__lead">{t('notFound.text')}</p>
        <Link to="/" className="btn btn--ghost notfound__back">
          {t('notFound.back')}
        </Link>
      </div>
    </section>
  )
}
