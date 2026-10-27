import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useProject, projectName } from '../data/projectStore'
import { formatPrice } from '../utils/format'

// 客服聊天站地址（北所访客站）：点击【确定】后把预订清单写入该站会话
const CHAT_API = import.meta.env.VITE_CHAT_API || 'https://beisu-visitor.onrender.com'

export default function Booking() {
  const { t, lang } = useLanguage()
  const [searchParams] = useSearchParams()
  const project = useProject(searchParams.get('project'))

  const [fileName, setFileName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [savedId, setSavedId] = useState('')
  const [record, setRecord] = useState(null)   // 本次提交的记录快照（供确定按钮与摘要使用）
  const [sendState, setSendState] = useState('idle')   // idle | sending | sent | fail
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
      setRecord(record)
      setSendState('idle')
      setSubmitted(true)
    } catch {
      setFailed(true)
    } finally {
      setSubmitting(false)
    }
  }

  /* 组装发送到客服聊天的清单：基础项目 + （可选）高端体验项目 */
  const buildChatText = () => {
    const r = record || {}
    const lines = [`【${t('booking.summaryTitle')}】${savedId}`]
    const push = (label, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        lines.push(`· ${label}：${value}`)
      }
    }
    lines.push(t('booking.baseGroup'))
    push(t('booking.date'), r.date)
    push(t('booking.pax'), r.pax ? `${r.pax} ${t('booking.paxUnit')}` : '')
    push(t('booking.fromCity'), r.fromCity)
    push(t('booking.flightNo'), r.flightNo)
    push(t('booking.arriveTime'), r.arriveTime)
    push(t('booking.name'), r.name)
    push(t('booking.contact'), r.contact)
    push(t('booking.remark'), r.remark)
    if (project) {
      lines.push(t('booking.premiumGroup'))
      lines.push(
        `· ${projectName(project, t)}（${t('booking.summaryPrice')} ¥ ${formatPrice(project.price, lang)} ${t('detail.priceUnit')}）`
      )
    }
    return lines.join('\n')
  }

  /* 点击【确定】：把全部所选项目写入客服聊天会话（直接成为一条消息，无需游客再发送） */
  const handleConfirm = async () => {
    if (sendState === 'sending' || sendState === 'sent') return
    setSendState('sending')
    try {
      const res = await fetch(`${CHAT_API}/api/booking/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: buildChatText(), bookingId: savedId }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      setSendState('sent')
    } catch {
      setSendState('fail')
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
              <div className="success__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setSubmitted(false)}>
                  {t('booking.again')}
                </button>
                <button
                  type="button"
                  className="btn btn--solid"
                  onClick={handleConfirm}
                  disabled={sendState === 'sending' || sendState === 'sent'}
                >
                  {sendState === 'sent' ? t('booking.sent') : sendState === 'sending' ? t('booking.submitting') : t('booking.confirm')}
                </button>
              </div>
              {sendState === 'fail' ? <p className="form__error">{t('booking.sendFail')}</p> : null}
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

          {submitted && record ? (
            <>
              {/* 基础项目：本次预订填写的信息 */}
              <h3 className="summary__group">{t('booking.baseGroup')}</h3>
              <div className="summary__row">
                <span>{t('booking.date')}</span>
                <span>{record.date || '—'}</span>
              </div>
              <div className="summary__row">
                <span>{t('booking.pax')}</span>
                <span>
                  {record.pax || '—'} {t('booking.paxUnit')}
                </span>
              </div>
              {record.fromCity ? (
                <div className="summary__row">
                  <span>{t('booking.fromCity')}</span>
                  <span>{record.fromCity}</span>
                </div>
              ) : null}
              {record.flightNo ? (
                <div className="summary__row">
                  <span>{t('booking.flightNo')}</span>
                  <span>{record.flightNo}</span>
                </div>
              ) : null}
              {record.arriveTime ? (
                <div className="summary__row">
                  <span>{t('booking.arriveTime')}</span>
                  <span>{record.arriveTime}</span>
                </div>
              ) : null}
              <div className="summary__row">
                <span>{t('booking.name')}</span>
                <span>{record.name || '—'}</span>
              </div>
              {record.remark ? (
                <div className="summary__row">
                  <span>{t('booking.remark')}</span>
                  <span>{record.remark}</span>
                </div>
              ) : null}

              {/* 高端体验项目：仅当另外选择了海南项目体验时才展示 */}
              {project ? (
                <>
                  <h3 className="summary__group">{t('booking.premiumGroup')}</h3>
                  <div className="summary__row">
                    <span>{t('booking.summaryProject')}</span>
                    <span>{record.projectName || projectName(project, t)}</span>
                  </div>
                  <div className="summary__row">
                    <span>{t('booking.summaryPrice')}</span>
                    <span>
                      ¥ {formatPrice(project.price, lang)}
                      <span className="summary__unit">{t('detail.priceUnit')}</span>
                    </span>
                  </div>
                </>
              ) : null}

              <p className="summary__note">{t('booking.summaryNote')}</p>
              {project ? (
                <Link to={`/projects/${project.slug}`} className="summary__link">
                  {t('nav.explore')} →
                </Link>
              ) : (
                <Link to="/projects" className="summary__link">
                  {t('nav.explore')} →
                </Link>
              )}
            </>
          ) : project ? (
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
