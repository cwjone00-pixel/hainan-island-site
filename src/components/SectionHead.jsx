export default function SectionHead({ index, eyebrow, title, lead, action }) {
  return (
    <header className="section__head">
      <div className="section__head-main">
        <p className="eyebrow">
          {index ? <span className="eyebrow__num">{index}</span> : null}
          {eyebrow}
        </p>
        <h2 className="h2">{title}</h2>
        {lead ? <p className="section__lead">{lead}</p> : null}
      </div>
      {action ? <div className="section__action">{action}</div> : null}
    </header>
  )
}
