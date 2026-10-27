import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useCustomers, updateCustomerStatus, removeCustomer } from '../data/customerStore'
import {
  useProjects,
  saveProjects,
  createProject,
  projectName,
  projectCopy,
  projectContent,
  projectGallery,
} from '../data/projectStore'
import { projects as baseProjects } from '../data/projects'
import { useSettings, saveSettings } from '../data/settingsStore'
import LanguageSwitcher from '../components/LanguageSwitcher'

function CustomersPanel() {
  const { t } = useLanguage()
  const projects = useProjects()
  const customers = useCustomers()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const keyword = query.trim().toLowerCase()
  const rows = customers.filter((customer) => {
    const matchesStatus = status === 'all' || customer.status === status
    const matchesQuery =
      !keyword ||
      customer.name.toLowerCase().includes(keyword) ||
      customer.contact.toLowerCase().includes(keyword)
    return matchesStatus && matchesQuery
  })

  const changeStatus = (id, nextStatus) => {
    updateCustomerStatus(id, nextStatus)
  }

  const remove = (id) => {
    if (!window.confirm(t('admin.deleteConfirm'))) return
    removeCustomer(id)
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h1 className="panel__title">{t('admin.tabCustomers')}</h1>
          <p className="panel__note">{t('admin.demoNote')}</p>
        </div>
        <div className="panel__actions">
          <button type="button" className="btn btn--ghost btn--sm" disabled>
            {t('admin.addCustomer')}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" disabled>
            {t('admin.export')}
          </button>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input input--sm"
          type="search"
          value={query}
          placeholder={t('admin.search')}
          aria-label={t('admin.search')}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="select select--sm"
          value={status}
          aria-label={t('admin.filterAll')}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">{t('admin.filterAll')}</option>
          <option value="new">{t('admin.status.new')}</option>
          <option value="pending">{t('admin.status.pending')}</option>
          <option value="confirmed">{t('admin.status.confirmed')}</option>
          <option value="done">{t('admin.status.done')}</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t('admin.tableName')}</th>
              <th>{t('admin.tableContact')}</th>
              <th>{t('admin.tableProject')}</th>
              <th>{t('admin.tableDate')}</th>
              <th>{t('admin.tablePax')}</th>
              <th>{t('admin.tableStatus')}</th>
              <th>{t('admin.tableAction')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((customer) => {
              const project = projects.find((item) => item.slug === customer.slug)
              return (
                <tr key={customer.id}>
                  <td>
                    <span className="table__name">{customer.name}</span>
                    <span className="table__id">{customer.id}</span>
                  </td>
                  <td>{customer.contact}</td>
                  <td>{project ? projectName(project, t) : customer.slug}</td>
                  <td>{customer.date}</td>
                  <td>{customer.pax}</td>
                  <td>
                    <select
                      className={`select select--sm select--status is-${customer.status}`}
                      value={customer.status}
                      aria-label={t('admin.tableStatus')}
                      onChange={(event) => changeStatus(customer.id, event.target.value)}
                    >
                      <option value="new">{t('admin.status.new')}</option>
                      <option value="pending">{t('admin.status.pending')}</option>
                      <option value="confirmed">{t('admin.status.confirmed')}</option>
                      <option value="done">{t('admin.status.done')}</option>
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="table__link table__link--danger"
                      onClick={() => remove(customer.id)}
                    >
                      {t('admin.delete')}
                    </button>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="table__empty">
                  {t('admin.noResults')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PricesPanel() {
  const { t } = useLanguage()
  const storedProjects = useProjects()
  const [draft, setDraft] = useState(storedProjects)
  const [saved, setSaved] = useState(false)

  const update = (slug, field, value) => {
    setDraft((prev) =>
      prev.map((project) => (project.slug === slug ? { ...project, [field]: value } : project)),
    )
    setSaved(false)
  }

  const add = () => {
    setDraft((prev) => [...prev, createProject(prev)])
    setSaved(false)
  }

  const save = () => {
    saveProjects(draft)
    setSaved(true)
  }

  const reset = () => {
    setDraft(baseProjects.map((project) => ({ ...project, name: '' })))
    setSaved(false)
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h1 className="panel__title">{t('admin.priceTitle')}</h1>
          <p className="panel__note">{t('admin.priceLead')}</p>
        </div>
        <div className="panel__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={add}>
            {t('admin.addProject')}
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t('admin.priceName')}</th>
              <th>{t('admin.pricePrice')}</th>
              <th>{t('admin.priceDeposit')}</th>
            </tr>
          </thead>
          <tbody>
            {draft.map((project) => {
              const copy = projectCopy(project, t)
              const placeholder = copy.name
              return (
                <tr key={project.slug}>
                  <td>
                    <input
                      className="input input--sm price-name"
                      type="text"
                      value={project.name ?? ''}
                      placeholder={placeholder}
                      aria-label={t('admin.priceName')}
                      onChange={(event) => update(project.slug, 'name', event.target.value)}
                    />
                    <span className="table__id">{project.slug}</span>
                  </td>
                  <td>
                    <div className="price-input">
                      <span>¥</span>
                      <input
                        className="input input--sm"
                        type="number"
                        min="0"
                        step="100"
                        value={project.price ?? 0}
                        aria-label={`${placeholder} ${t('admin.pricePrice')}`}
                        onChange={(event) => update(project.slug, 'price', Number(event.target.value))}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="price-input">
                      <span>¥</span>
                      <input
                        className="input input--sm"
                        type="number"
                        min="0"
                        step="100"
                        value={project.deposit ?? 0}
                        aria-label={`${placeholder} ${t('admin.priceDeposit')}`}
                        onChange={(event) =>
                          update(project.slug, 'deposit', Number(event.target.value))
                        }
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="panel__foot">
        <div className="panel__actions">
          <button type="button" className="btn btn--solid btn--sm" onClick={save}>
            {t('admin.save')}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={reset}>
            {t('admin.reset')}
          </button>
          {saved ? <span className="panel__saved">{t('admin.saved')}</span> : null}
        </div>
        <p className="panel__note">{t('admin.priceNote')}</p>
      </div>
    </div>
  )
}

function SitePanel() {
  const { t } = useLanguage()
  const stored = useSettings()
  const [draft, setDraft] = useState(stored)
  const [saved, setSaved] = useState(false)
  const [failed, setFailed] = useState(false)

  // 当 settings 从后端异步加载完成或 saveSettings 成功后，
  // 把 draft 同步为 stored —— 避免 draft 停留在初始 defaultSettings
  useEffect(() => {
    setDraft({ ...stored })
  }, [stored.brandIntro, stored.email, stored.phone, stored.telegram, stored.instagram, stored.facebook])

  const update = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
    setFailed(false)
  }

  const save = async () => {
    // 以 stored（服务端最新值）为 base，只覆盖用户编辑过的 draft 字段
    // 双保险：即使 draft 里残留默认值，也不会覆盖服务端已有好数据
    const merged = { ...stored, ...draft }
    const ok = await saveSettings(merged)
    setSaved(ok)
    setFailed(!ok)
  }

  const fields = [
    { key: 'email', label: t('admin.siteEmail'), placeholder: 'hello@example.com' },
    { key: 'phone', label: t('admin.sitePhone'), placeholder: '+86 138 0000 0000' },
    { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/…' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/…' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/…' },
  ]

  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h1 className="panel__title">{t('admin.siteTitle')}</h1>
          <p className="panel__note">{t('admin.siteLead')}</p>
        </div>
        <div className="panel__actions">
          <button type="button" className="btn btn--solid btn--sm" onClick={save}>
            {t('admin.save')}
          </button>
          {saved ? <span className="panel__saved">{t('admin.saved')}</span> : null}
          {failed ? <span className="panel__error">{t('admin.saveFailed')}</span> : null}
        </div>
      </div>

      <div className="site-form">
        <label className="site-form__row site-form__row--intro">
          <span className="site-form__label">{t('admin.siteIntro')}</span>
          <textarea
            className="input site-form__textarea"
            rows={4}
            value={draft.brandIntro ?? ''}
            placeholder={t('admin.siteIntroPlaceholder')}
            onChange={(event) => update('brandIntro', event.target.value)}
          />
        </label>

        {fields.map((field) => (
          <label key={field.key} className="site-form__row">
            <span className="site-form__label">{field.label}</span>
            <input
              className="input"
              type="text"
              value={draft[field.key] ?? ''}
              placeholder={field.placeholder}
              onChange={(event) => update(field.key, event.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function ContentPanel() {
  const { t } = useLanguage()
  const projects = useProjects()
  const [slug, setSlug] = useState(projects[0]?.slug || '')
  const project = projects.find((item) => item.slug === slug) || projects[0] || null
  const [draft, setDraft] = useState(null)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!project) return
    const rawMeta = project.meta || {}
    setDraft({
      ...projectContent(project, t),
      price: project.price,
      meta: {
        intro: rawMeta.intro || '',
        duration: rawMeta.duration || '',
        group: rawMeta.group || '',
        level: rawMeta.level || '',
        from: rawMeta.from || '',
      },
      gallery: projectGallery(project),
    })
    setSaved(false)
    setUploadError('')
  }, [project?.slug])

  if (!project || !draft) {
    return (
      <div className="panel">
        <p className="panel__note">{t('admin.empty')}</p>
      </div>
    )
  }

  const setText = (key, index, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? value : item)),
    }))
    setSaved(false)
  }

  const addText = (key) => {
    setDraft((prev) => ({ ...prev, [key]: [...prev[key], ''] }))
    setSaved(false)
  }

  const removeText = (key, index) => {
    setDraft((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }))
    setSaved(false)
  }

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const setMeta = (key, value) => {
    setDraft((prev) => ({ ...prev, meta: { ...prev.meta, [key]: value } }))
    setSaved(false)
  }

  const upload = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (!files.length) return

    setUploading(true)
    setUploadError('')
    const added = []
    for (const file of files) {
      try {
        const res = await fetch(`/api/uploads?name=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json()
        if (data?.url) added.push(data.url)
      } catch {
        setUploadError(t('admin.uploadFailed'))
      }
    }
    if (added.length) {
      setDraft((prev) => ({ ...prev, gallery: [...prev.gallery, ...added] }))
      setSaved(false)
    }
    setUploading(false)
  }

  const removeImage = async (url) => {
    setDraft((prev) => ({ ...prev, gallery: prev.gallery.filter((item) => item !== url) }))
    setSaved(false)
    try {
      await fetch(`/api/uploads/${encodeURIComponent(url.replace('/uploads/', ''))}`, {
        method: 'DELETE',
      })
    } catch {
      // 删除失败不影响从页面移除
    }
  }

  const save = () => {
    const clean = {
      overview: draft.overview.map((item) => item.trim()).filter(Boolean),
      highlights: draft.highlights.map((item) => item.trim()).filter(Boolean),
    }
    const meta = {
      intro: (draft.meta.intro || '').trim(),
      duration: (draft.meta.duration || '').trim(),
      group: (draft.meta.group || '').trim(),
      level: (draft.meta.level || '').trim(),
      from: (draft.meta.from || '').trim(),
    }
    saveProjects(
      projects.map((item) =>
        item.slug === project.slug
          ? {
              ...item,
              price: Number(draft.price) || 0,
              content: clean,
              meta,
              gallery: draft.gallery,
            }
          : item,
      ),
    )
    setDraft((prev) => ({ ...prev, ...clean }))
    setSaved(true)
  }

  const copy = projectCopy(project, t)
  const metaFields = [
    { key: 'duration', label: t('detail.duration'), placeholder: copy.duration },
    { key: 'group', label: t('detail.group'), placeholder: copy.group },
    { key: 'level', label: t('detail.level'), placeholder: copy.level },
    { key: 'from', label: t('detail.from'), placeholder: copy.from },
  ]
  return (
    <div className="panel">
      <div className="panel__head">
        <div>
          <h1 className="panel__title">{t('admin.contentTitle')}</h1>
          <p className="panel__note">{t('admin.contentLead')}</p>
        </div>
        <div className="panel__actions">
          <select
            className="input select--project"
            value={project.slug}
            onChange={(event) => setSlug(event.target.value)}
          >
            {projects.map((item) => (
              <option key={item.slug} value={item.slug}>
                {projectName(item, t)}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn--solid btn--sm" onClick={save}>
            {t('admin.save')}
          </button>
          {saved ? <span className="panel__saved">{t('admin.saved')}</span> : null}
        </div>
      </div>

      <section className="content-block">
        <div className="content-block__head">
          <h2 className="content-block__title">{t('admin.secOverview')}</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => addText('overview')}
          >
            {t('admin.addParagraph')}
          </button>
        </div>
        {draft.overview.length === 0 ? (
          <p className="content-block__empty">{t('admin.empty')}</p>
        ) : null}
        {draft.overview.map((text, index) => (
          <div key={index} className="content-row">
            <textarea
              className="input content-row__area"
              rows={3}
              value={text}
              onChange={(event) => setText('overview', index, event.target.value)}
            />
            <button
              type="button"
              className="table__link table__link--danger"
              onClick={() => removeText('overview', index)}
            >
              {t('admin.delete')}
            </button>
          </div>
        ))}
      </section>

      <section className="content-block">
        <div className="content-block__head">
          <h2 className="content-block__title">{t('admin.secHighlights')}</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => addText('highlights')}
          >
            {t('admin.addHighlight')}
          </button>
        </div>
        {draft.highlights.length === 0 ? (
          <p className="content-block__empty">{t('admin.empty')}</p>
        ) : null}
        {draft.highlights.map((text, index) => (
          <div key={index} className="content-row">
            <input
              className="input"
              type="text"
              value={text}
              onChange={(event) => setText('highlights', index, event.target.value)}
            />
            <button
              type="button"
              className="table__link table__link--danger"
              onClick={() => removeText('highlights', index)}
            >
              {t('admin.delete')}
            </button>
          </div>
        ))}
      </section>

      <section className="content-block">
        <div className="content-block__head">
          <h2 className="content-block__title">{t('admin.secInfo')}</h2>
        </div>
        <div className="meta-block">
          <label className="meta-block__field">
            <span className="meta-block__label">{t('admin.introLabel')}</span>
            <textarea
              className="input content-row__area"
              rows={2}
              value={draft.meta.intro}
              placeholder={copy.lead}
              onChange={(event) => setMeta('intro', event.target.value)}
            />
          </label>
        </div>
        <div className="meta-grid">
          <label className="meta-field">
            <span className="meta-field__label">{t('detail.priceLabel')}</span>
            <input
              className="input"
              type="number"
              min="0"
              value={draft.price}
              onChange={(event) => setField('price', event.target.value)}
            />
          </label>
          {metaFields.map((field) => (
            <label key={field.key} className="meta-field">
              <span className="meta-field__label">{field.label}</span>
              <input
                className="input"
                type="text"
                value={draft.meta[field.key]}
                placeholder={field.placeholder}
                onChange={(event) => setMeta(field.key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <p className="content-block__empty">{t('admin.secInfoNote')}</p>
      </section>

      <section className="content-block">
        <div className="content-block__head">
          <h2 className="content-block__title">{t('admin.secGallery')}</h2>
          <label className="btn btn--ghost btn--sm upload-btn">
            {uploading ? t('admin.uploading') : t('admin.uploadImages')}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={upload}
            />
          </label>
        </div>
        {uploadError ? <p className="panel__error">{uploadError}</p> : null}
        {draft.gallery.length === 0 ? (
          <p className="content-block__empty">{t('admin.galleryEmpty')}</p>
        ) : (
          <div className="gallery-grid">
            {draft.gallery.map((url) => (
              <figure key={url} className="gallery-item">
                <img src={url} alt="" />
                <button
                  type="button"
                  className="gallery-item__remove"
                  onClick={() => removeImage(url)}
                  aria-label={t('admin.delete')}
                >
                  ×
                </button>
              </figure>
            ))}
          </div>
        )}
        <p className="content-block__empty">{t('admin.galleryNote')}</p>
      </section>
    </div>
  )
}

export default function Admin() {
  const { t } = useLanguage()
  const [tab, setTab] = useState('customers')

  return (
    <div className="admin">
      <header className="admin__bar">
        <Link to="/" className="admin__brand">
          {t('brand.name')}
          <span className="admin__brand-sub">{t('admin.brandSub')}</span>
        </Link>
        <div className="admin__bar-actions">
          <span className="admin__demo">{t('admin.demoNote')}</span>
          <LanguageSwitcher />
          <Link to="/" className="btn btn--ghost btn--sm">
            {t('admin.backSite')}
          </Link>
        </div>
      </header>

      <div className="admin__layout">
        <aside className="admin__side">
          <p className="admin__side-title">{t('admin.title')}</p>
          <button
            type="button"
            className={`admin__tab${tab === 'customers' ? ' is-active' : ''}`}
            onClick={() => setTab('customers')}
          >
            {t('admin.tabCustomers')}
          </button>
          <button
            type="button"
            className={`admin__tab${tab === 'prices' ? ' is-active' : ''}`}
            onClick={() => setTab('prices')}
          >
            {t('admin.tabPrices')}
          </button>
          <button
            type="button"
            className={`admin__tab${tab === 'content' ? ' is-active' : ''}`}
            onClick={() => setTab('content')}
          >
            {t('admin.tabContent')}
          </button>
          <button
            type="button"
            className={`admin__tab${tab === 'site' ? ' is-active' : ''}`}
            onClick={() => setTab('site')}
          >
            {t('admin.tabSite')}
          </button>
        </aside>

        <main className="admin__main">
          {tab === 'customers' ? <CustomersPanel /> : null}
          {tab === 'prices' ? <PricesPanel /> : null}
          {tab === 'content' ? <ContentPanel /> : null}
          {tab === 'site' ? <SitePanel /> : null}
        </main>
      </div>
    </div>
  )
}
