import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../i18n'
import {
  useProject,
  projectCopy,
  projectName,
  projectContent,
  projectMeta,
  projectGallery,
} from '../data/projectStore'
import { formatPrice } from '../utils/format'
import Media from '../components/Media'

export default function ProjectDetail() {
  const { slug } = useParams()
  const { t, lang } = useLanguage()
  const project = useProject(slug)

  if (!project) {
    return (
      <section className="section notfound">
        <div className="container">
          <h1 className="h2">{t('detail.notFound')}</h1>
          <Link to="/" className="btn btn--ghost notfound__back">
            {t('detail.backHome')}
          </Link>
        </div>
      </section>
    )
  }

  const data = { ...projectCopy(project, t), name: projectName(project, t) }
  const content = projectContent(project, t)
  const info = projectMeta(project, t)
  const gallery = projectGallery(project)
  const meta = [
    { label: t('detail.duration'), value: info.duration },
    { label: t('detail.group'), value: info.group },
    { label: t('detail.level'), value: info.level },
    { label: t('detail.from'), value: info.from },
  ]

  return (
    <article className="detail">
      <div className="container">
        <div className="page-hero">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <Link to="/projects">{data.category}</Link>
            <span>/</span>
            <span>{data.name}</span>
          </nav>

          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">{data.category}</p>
              <h1 className="page-title">{data.name}</h1>
              <p className="page-lead">{info.intro}</p>
            </div>
            <div className="page-hero__aside">
              <p className="eyebrow">{t('detail.priceLabel')}</p>
              <p className="page-hero__price">¥ {formatPrice(project.price, lang)}</p>
              <p className="page-hero__unit">{t('detail.priceUnit')}</p>
            </div>
          </div>
        </div>

        <Media tone={project.tone} label={t('detail.media')} className="detail__banner" />
      </div>

      <div className="container detail__layout">
        <div className="detail__main">
          <section className="block">
            <h2 className="block__title">{t('detail.overview')}</h2>
            <div className="overview">
              {content.overview.map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
          </section>

          <section className="block">
            <h2 className="block__title">{t('detail.highlights')}</h2>
            <ul className="highlights">
              {content.highlights.map((item, index) => (
                <li key={index} className="highlight">
                  <span className="highlight__num">0{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="block split">
            <div>
              <h2 className="block__title">{t('detail.included')}</h2>
              <ul className="list-line">
                {t('detail.includedItems').map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="block__title">{t('detail.excluded')}</h2>
              <ul className="list-line">
                {t('detail.excludedItems').map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <section className="block">
            <div className={`detail__gallery${gallery.length ? ' detail__gallery--photos' : ''}`}>
              {gallery.length
                ? gallery.map((url) => (
                    <figure key={url} className="detail__shot">
                      <img src={url} alt={data.name} loading="lazy" />
                    </figure>
                  ))
                : [0, 1, 2].map((index) => (
                    <Media
                      key={index}
                      tone={project.tone}
                      label={`${t('detail.galleryNote')} 0${index + 1}`}
                    />
                  ))}
            </div>
          </section>
        </div>

        <aside className="detail__aside">
          <p className="eyebrow">{t('detail.priceLabel')}</p>
          <p className="aside__price">¥ {formatPrice(project.price, lang)}</p>
          <p className="aside__price-unit">{t('detail.priceUnit')}</p>

          <dl className="aside__meta">
            {meta.map((row) => (
              <div key={row.label} className="aside__meta-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <Link to={`/booking?project=${project.slug}`} className="btn btn--solid btn--block aside__cta">
            {t('detail.book')}
          </Link>
          <p className="aside__note">{t('detail.priceNote')}</p>
        </aside>
      </div>
    </article>
  )
}
