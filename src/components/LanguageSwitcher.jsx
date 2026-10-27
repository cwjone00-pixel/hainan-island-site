import { useLanguage } from '../i18n'

const options = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export default function LanguageSwitcher({ variant = 'default' }) {
  const { lang, setLang } = useLanguage()

  return (
    <div className={`lang lang--${variant}`} role="group" aria-label="Language / 语言">
      {options.map((option) => (
        <button
          key={option.code}
          type="button"
          className={`lang__btn${lang === option.code ? ' is-active' : ''}`}
          aria-pressed={lang === option.code}
          onClick={() => setLang(option.code)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
