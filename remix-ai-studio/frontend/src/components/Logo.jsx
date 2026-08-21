export default function Logo({ compact = false }) {
  return (
    <div className="logo">
      <span className="mark">REMiX AI</span>
      {!compact && <span className="sub">DJ Remix Studio</span>}
    </div>
  );
}
