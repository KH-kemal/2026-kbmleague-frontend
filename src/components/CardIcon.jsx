export default function CardIcon({ color }) {
  return <svg aria-hidden="true" width="11" height="16" viewBox="0 0 11 16" className="shrink-0">
    <rect x="0.5" y="0.5" width="10" height="15" rx="2" fill={color === 'yellow' ? '#facc15' : '#ef4444'} />
  </svg>;
}
