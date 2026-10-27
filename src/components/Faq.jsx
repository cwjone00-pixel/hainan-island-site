import { useState } from 'react'
import { useLanguage } from '../i18n'

export default function Faq() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState(0)
  const items = t('faq.items')

  return (
    <div className="faq">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.q} className={`faq__item${isOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="faq__question"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span>{item.q}</span>
              <span className="faq__sign" aria-hidden="true" />
            </button>
            <div className="faq__answer">
              <div className="faq__answer-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
