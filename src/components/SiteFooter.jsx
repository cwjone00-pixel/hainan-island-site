import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { useSettings } from '../data/settingsStore'

const socials = [
  { key: 'telegram', label: 'Telegram' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
]

export default function SiteFooter() {
  const { t } = useLanguage()
  const settings = useSettings()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <p className="footer__brand">{t('brand.name')}</p>
            <p className="footer__tag">{t('footer.tagline')}</p>
          </div>

          <div>
            <p className="footer__title">{t('footer.contactTitle')}</p>
            <div className="footer__nav">
              {settings.email ? (
                <a className="footer__link" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              ) : null}
              {settings.phone ? (
                <a className="footer__link" href={`tel:${settings.phone.replace(/\s+/g, '')}`}>
                  {settings.phone}
                </a>
              ) : null}
            </div>
          </div>

          <div>
            <p className="footer__title">{t('footer.socialTitle')}</p>
            <div className="footer__socials">
              {socials.map((social) => {
                const href = settings[social.key]
                return href ? (
                  <a
                    key={social.key}
                    className="social"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.label}
                  </a>
                ) : (
                  <span key={social.key} className="social social--empty">
                    {social.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{t('footer.legal')}</span>
          <Link to="/admin" className="footer__admin">
            {t('footer.admin')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
