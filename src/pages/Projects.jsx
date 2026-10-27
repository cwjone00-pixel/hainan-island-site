import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useProjects, projectCopy, projectName, projectMeta } from '../data/projectStore'
import Media from '../components/Media'

export default function Projects() {
  const { t } = useLanguage()
  const projects = useProjects()

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">{t('nav.home')}</Link>
            <span>/</span>
            <span>{t('nav.explore')}</span>
          </nav>

          <div className="page-hero__grid">
            <div>
              <p className="eyebrow">{t('categories.eyebrow')}</p>
              <h1 className="page-title">{t('categories.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      <section className="section projects-page">
        <div className="container">
          <div className="cards">
            {projects.map((project, index) => {
              const copy = projectCopy(project, t)
              const meta = projectMeta(project, t)
              return (
                <Link key={project.slug} to={`/projects/${project.slug}`} className="card">
                  <Media
                    tone={project.tone}
                    label={projectName(project, t)}
                    className="card__media"
                  />
                  <div className="card__body">
                    <div>
                      <p className="card__meta">0{index + 1}</p>
                      <h3 className="card__title">{projectName(project, t)}</h3>
                      <p className="card__text">{meta.intro}</p>
                    </div>
                    <span className="card__arrow" aria-hidden="true">
                      →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
