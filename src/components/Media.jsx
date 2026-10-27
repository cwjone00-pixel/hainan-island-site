export default function Media({ tone = 'a', label, className = '' }) {
  return (
    <div className={`media media--${tone} ${className}`.trim()}>
      <div className="media__inner" aria-hidden="true" />
      {label ? <span className="media__label">{label}</span> : null}
    </div>
  )
}
