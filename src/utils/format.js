const locales = {
  zh: 'zh-CN',
  en: 'en-US',
  ru: 'ru-RU',
}

export function formatPrice(amount, lang) {
  return new Intl.NumberFormat(locales[lang] || locales.zh).format(amount)
}
