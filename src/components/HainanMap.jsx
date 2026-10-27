import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'
import { mapSpots } from '../data/mapSpots'
import { getProjectBySlug } from '../data/projects'
import { formatPrice } from '../utils/format'

export default function HainanMap() {
  const { t, lang } = useLanguage()
  const [activeId, setActiveId] = useState(mapSpots[0].id)

  const activeSpot = mapSpots.find((spot) => spot.id === activeId) || mapSpots[0]
  const activeProject = getProjectBySlug(activeSpot.slug)
  const activeName = t(`map.spots.${activeSpot.id}.name`)
  const activeText = t(`map.spots.${activeSpot.id}.text`)
  const projectText = t(`projects.${activeProject.key}`)

  return (
    <div className="map">
      <div className="map__canvas">
        <span className="map__tag">{t('map.label')}</span>
        <svg className="map__svg" viewBox="0 0 620 560" role="img" aria-label={t('map.title')}>
          <path
            className="map__island"
            d="M300 62C352 58 404 84 448 128C492 172 516 236 512 302C508 368 480 430 428 476C376 522 308 540 252 520C196 500 156 450 144 388C132 326 146 258 176 202C206 146 248 96 300 62Z"
          />
          <path
            className="map__contour"
            d="M300 112C346 110 388 132 416 170C444 208 456 258 448 306C440 354 416 398 376 430C336 462 284 474 240 452C196 430 168 386 164 336C160 286 178 236 210 196C242 156 262 114 300 112Z"
          />
          <path
            className="map__contour"
            d="M300 168C330 168 358 184 376 210C394 236 400 268 392 300C384 332 366 362 336 380C306 398 270 402 242 384C214 366 198 336 198 304C198 272 214 240 236 216C258 192 274 168 300 168Z"
          />

          {mapSpots.map((spot) => {
            const isActive = spot.id === activeId
            return (
              <g
                key={spot.id}
                className={`map__pin${isActive ? ' is-active' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={t(`map.spots.${spot.id}.name`)}
                onClick={() => setActiveId(spot.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setActiveId(spot.id)
                  }
                }}
              >
                <circle className="map__halo" cx={spot.x} cy={spot.y} r="19" />
                <circle className="map__dot" cx={spot.x} cy={spot.y} r={isActive ? 7 : 5} />
                <text
                  className="map__label"
                  x={spot.x}
                  y={spot.y + spot.labelOffset}
                  textAnchor="middle"
                >
                  {t(`map.spots.${spot.id}.name`)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="map__panel">
        <p className="eyebrow">{t('map.hint')}</p>
        <h3 className="map__panel-title">{activeName}</h3>
        <p className="map__panel-text">{activeText}</p>

        <div className="map__chips">
          {mapSpots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className={`map__chip${spot.id === activeId ? ' is-active' : ''}`}
              onClick={() => setActiveId(spot.id)}
            >
              {t(`map.spots.${spot.id}.name`)}
            </button>
          ))}
        </div>

        <div className="map__panel-project">
          <span>{projectText.name}</span>
          <span>
            ¥ {formatPrice(activeProject.price, lang)}
            <span className="map__project-unit">{t('detail.priceUnit')}</span>
          </span>
        </div>

        <Link to={`/projects/${activeSpot.slug}`} className="btn btn--ghost map__cta">
          {t('map.cta')}
        </Link>
      </div>
    </div>
  )
}
