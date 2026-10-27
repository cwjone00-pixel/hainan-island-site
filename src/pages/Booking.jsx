import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useProject, projectName } from '../data/projectStore'
import { formatPrice } from '../utils/format'

export default function Booking() {
  const { t, lang } = useLanguage()
  const [searchParams] = useSearchParams()
  const project = useProject(searchParams.get('project'))

  const [fileName, setFileName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [savedId, setSavedId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [failed, setFailed] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setSubmitting(true)
    setFailed(false)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          contact: data.get('contact'),
          date: data.get('date'),
          pax: Number(data.get('pax')),
          slug: project?.slug || '',
          projectName: project ? projectName(project, t) : '',
          fromCity: data.get('fromCity'),
          flightNo: data.get('flightNo'),
          arriveTime: data.get('arriveTime'),
          screenshot: fileName,
          remark: data.get('remark'),
          lang,
        }),
      })

      if (!res.ok) throw new Error(`status ${res.status}`)
      const record = await res.json()

      form.reset()
      setFileName('')
      setSavedId(record.id || '')
      setSubmitted(true)
    } catch {
      setFailed(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="container booking">
      <Link className="back-link" to={project ? `/projects/${project.slug}` : '/'}>
        ← {t('booking.back')}
      </Link>

      <div className="booking__head">
        <p className="eyebrow">{t('booking.eyebrow')}</p>
        <h1 className="page-title booking__title">{t('booking.title')}</h1>
        <p className="page-lead">{t('booking.lead')}</p>
      </div>

      <div className="booking__layout">
        <div>
          {submitted ? (
            <div className="success">
              <h2 className="success__title">{t('booking.successTitle')}</h2>
              <p className="success__text">{t('booking.successText')}</p>
              {savedId ? (
                <p className="success__id">
                  {t('booking.successId')}
                  <strong>{savedId}</strong>
                </p>
              ) : null}
              <button type="button" className="btn btn--ghost" onClick={() => setSubmitted(false)}>
                {t('booking.again')}
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              <div className="form__section">
                <p className="form__legend">
                  <span>01</span>
                  {t('booking.guestTitle')}
                </p>
                <div className="form__grid">
                  <div className="field">
                    <label className="field__label" htmlFor="booking-name">
                      {t('booking.name')} <em>{t('booking.required')}</em>
                    </label>
                    <input
                      id="booking-name"
                      name="name"
                      className="input"
                      type="text"
                      required
                      placeholder={t('booking.namePh')}
                    />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="booking-contact">
                      {t('booking.contact')} <em>{t('booking.required')}</em>
                    </label>
                    <input
                      id="booking-contact"
                      name="contact"
                      className="input"
                      type="text"
                      required
                      placeholder={t('booking.contactPh')}
                    />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="booking-date">
                      {t('booking.date')} <em>{t('booking.required')}</em>
                    </label>
                    <input id="booking-date" name="date" className="input" type="date" required />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="booking-pax">
                      {t('booking.pax')} <em>{t('booking.required')}</em>
                    </label>
                    <select id="booking-pax" name="pax" className="select" defaultValue="2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                        <option key={value} value={value}>
                          {value} {t('booking.paxUnit')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form__section">
                <p className="form__legend">
                  <span>02</span>
                  {t('booking.flightTitle')}
                </p>
                <div className="form__grid">
                  <div className="field">
                    <label className="field__label" htmlFor="booking-from">
                      {t('booking.fromCity')}
                    </label>
                    <input
                      id="booking-from"
                      name="fromCity"
                      className="input"
                      type="text"
                      placeholder={t('booking.fromCityPh')}
                    />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="booking-flight">
                      {t('booking.flightNo')}
                    </label>
                    <input
                      id="booking-flight"
                      name="flightNo"
                      className="input"
                      type="text"
                      placeholder={t('booking.flightNoPh')}
                    />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="booking-arrive">
                      {t('booking.arriveTime')}
                    </label>
                    <input
                      id="booking-arrive"
                      name="arriveTime"
                      className="input"
                      type="text"
                      placeholder={t('booking.arriveTimePh')}
                    />
                  </div>

                  <div className="field field--full">
                    <span className="field__label">{t('booking.upload')}</span>
                    <div className="file">
                      <input
                        className="file__input"
                        type="file"
                        accept="image/png,image/jpeg"
                        aria-label={t('booking.upload')}
                        onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
                      />
                      <p className="file__title">{t('booking.uploadHint')}</p>
                      <p className="file__hint">{t('booking.uploadTypes')}</p>
                      {fileName ? (
                        <p className="file__chosen">
                          {t('booking.uploadChosen')}
                          {fileName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form__section">
                <p className="form__legend">
                  <span>03</span>
                  {t('booking.noteTitle')}
                </p>
                <div className="field">
                  <label className="field__label" htmlFor="booking-remark">
                    {t('booking.remark')} <em>{t('booking.optional')}</em>
                  </label>
                  <textarea
                    id="booking-remark"
                    name="remark"
                    className="textarea"
                    placeholder={t('booking.remarkPh')}
                  />
                </div>

                <label className="consent">
                  <input type="checkbox" required />
                  <span>{t('booking.consent')}</span>
                </label>

                <div className="form__actions">
                  <button type="submit" className="btn btn--solid" disabled={submitting}>
                    {submitting ? t('booking.submitting') : t('booking.submit')}
                  </button>
                  <button
                    type="reset"
                    className="form__reset"
                    onClick={() => setFileName('')}
                  >
                    {t('booking.reset')}
                  </button>
                </div>

                {failed ? <p className="form__error">{t('booking.errorText')}</p> : null}
              </div>
            </form>
          )}
        </div>

        <aside className="summary">
          <h2 className="summary__title">{t('booking.summaryTitle')}</h2>

          {project ? (
            <>
              <div className="summary__row">
                <span>{t('booking.summaryProject')}</span>
                <span>{projectName(project, t)}</span>
              </div>
              <div className="summary__row">
                <span>{t('booking.summaryPrice')}</span>
                <span>
                  ¥ {formatPrice(project.price, lang)}
                  <span className="summary__unit">{t('detail.priceUnit')}</span>
                </span>
              </div>
              <p className="summary__note">{t('booking.summaryNote')}</p>
              <Link to={`/projects/${project.slug}`} className="summary__link">
                {t('nav.explore')} →
              </Link>
            </>
          ) : (
            <>
              <p className="summary__empty">{t('booking.summaryEmpty')}</p>
              <p className="summary__note">{t('booking.chooseProject')}</p>
              <Link to="/projects" className="summary__link">
                {t('nav.explore')} →
              </Link>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}
