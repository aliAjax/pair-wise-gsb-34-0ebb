export function StatCard({ label, value, hint, tone = "" }: { label: string; value: string | number; hint?: string; tone?: string }) {
  return (
    <div className={`stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}
