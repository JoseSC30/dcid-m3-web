export default function Message({ text, type = "info" }) {
  return text ? (
    <div role="status" className={`message ${type}`}>
      {text}
    </div>
  ) : null;
}
