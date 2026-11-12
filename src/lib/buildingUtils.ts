/**
 * Building utility helpers for pickers, labels, and disambiguation.
 */

export interface BuildingRef {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}

/**
 * Disambiguates duplicate building names in select pickers / dropdowns.
 * If multiple buildings in the list share the same case-insensitive name,
 * appends their address, city, or ID prefix in parentheses.
 */
export function formatBuildingPickerLabel(
  building: BuildingRef,
  allBuildings?: BuildingRef[]
): string {
  if (!building?.name) return '—';
  if (!allBuildings || allBuildings.length <= 1) return building.name;

  const targetName = building.name.trim().toLowerCase();
  const duplicates = allBuildings.filter(
    (b) => b && b.name && b.name.trim().toLowerCase() === targetName
  );

  if (duplicates.length > 1) {
    const loc = building.address || building.city || building.id.slice(0, 6);
    return `${building.name} (${loc})`;
  }

  return building.name;
}
