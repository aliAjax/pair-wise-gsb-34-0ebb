export function DeviceLocationCell({
  buildingName,
  floor,
  locationDesc,
}: {
  buildingName?: string | null;
  floor: string;
  locationDesc: string;
}) {
  return (
    <div className="location-cell">
      <strong>{buildingName ?? "-"}</strong>
      <span>{floor} · {locationDesc}</span>
    </div>
  );
}
