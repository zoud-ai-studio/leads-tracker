export function StatTile({ label, value }: { label: string; value: string | number }) {
  return <section className="stat-tile"><h2>{label}</h2><strong>{value}</strong></section>;
}
