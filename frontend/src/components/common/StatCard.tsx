export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "warn" | "danger" | "ok";
}) {
  return (
    <div className={"stat" + (tone ? ` tone-${tone}` : "")}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <em>{hint}</em>}
    </div>
  );
}
