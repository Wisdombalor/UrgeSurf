import Sheet from '../components/Sheet'
import Icon from '../components/Icon'

export default function ShareDoneSheet({ title, message, onView }) {
  return (
    <Sheet>
      <div className="pop-card" role="status">
        <div className="pop-emoji" aria-hidden="true">
          <Icon name="check" size={30} strokeWidth={2.4} />
        </div>
        <h1>{title}</h1>
        <p className="s" style={{ marginTop: 8, textAlign: 'center' }}>
          {message}
        </p>
        <button className="cta" onClick={onView}>
          View it now
        </button>
      </div>
    </Sheet>
  )
}
