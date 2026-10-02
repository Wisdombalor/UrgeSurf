export default function Toast({ message }) {
  return (
    <div className="toast" hidden={!message}>
      {message}
    </div>
  )
}
