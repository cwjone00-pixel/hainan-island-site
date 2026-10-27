import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import zh from './zh'
import en from './en'
import ru from './ru'

const dictionaries = { zh, en, ru }
const STORAGE_KEY = 'hainan.lang'

const LanguageContext = createContext(null)

function deepGet(source, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), source)
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return dictionaries[saved] ? saved : 'zh'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t(path) {
        const text = deepGet(dictionaries[lang], path)
        return text === undefined ? deepGet(zh, path) : text
      },
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}
