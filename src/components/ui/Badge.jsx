const TONES = {
  High: 'red', Medium: 'amber', Low: '', New: 'teal', 'In review': 'amber', Routed: 'green', Dismissed: '',
  Ready: 'green', Stale: 'amber', Replayed: 'green', Pending: 'amber', Failed: 'red', Initial: 'teal', Update: '',
};
export default function Badge({ children, tone }) {
  const normalizedTone = ({ warning: 'amber', danger: 'red', success: 'green' })[tone] || tone || TONES[children] || '';
  return <span className={`badge ${normalizedTone}`}>{children}</span>;
}
