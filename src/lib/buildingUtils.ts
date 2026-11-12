/**
 * Building and Client utility helpers for pickers, labels, and disambiguation.
 */

export interface BuildingRef {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  locality?: string | null;
  client?: { name: string } | null;
}

export interface ClientRef {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
}

/**
 * Returns a distinctive short-id slice from a CUID or UUID.
 * For cuid format (e.g. cmumxyrsl... -> "rsl", cmumxyqp... -> "qpa")
 */
export function getShortId(id?: string | null): string {
  if (!id) return '';
  const trimmed = id.trim();
  if (trimmed.startsWith('c') && trimmed.length >= 10) {
    return trimmed.slice(6, 9);
  }
  return trimmed.slice(-4);
}

/**
 * Disambiguates duplicate building names in select pickers / dropdowns.
 * 1. If multiple buildings share the same name, appends address/locality/city.
 * 2. If the display label STILL collides anywhere in the list, appends the short-id:
 *    e.g. "Tower c (Mayur vihar) · …rsl"
 */
export function formatBuildingPickerLabel(
  building: BuildingRef,
  allBuildings?: BuildingRef[]
): string {
  if (!building?.name) return '—';
  if (!allBuildings || allBuildings.length <= 1) return building.name;

  const targetName = building.name.trim().toLowerCase();
  const nameMatches = allBuildings.filter(
    (b) => b && b.name && b.name.trim().toLowerCase() === targetName
  );

  if (nameMatches.length <= 1) {
    return building.name;
  }

  const loc = (building.address || building.locality || building.city || '').trim();
  const baseWithLoc = loc ? `${building.name} (${loc})` : building.name;

  const locMatches = allBuildings.filter((b) => {
    if (!b || !b.name) return false;
    const bLoc = (b.address || b.locality || b.city || '').trim();
    const bBase = bLoc ? `${b.name} (${bLoc})` : b.name;
    return bBase.trim().toLowerCase() === baseWithLoc.trim().toLowerCase();
  });

  if (locMatches.length > 1) {
    const short = getShortId(building.id);
    return short ? `${baseWithLoc} · …${short}` : baseWithLoc;
  }

  return baseWithLoc;
}

/**
 * Disambiguates duplicate client names in select pickers / dropdowns.
 * 1. If multiple clients share the same name, appends (contactPerson).
 * 2. If the display label STILL collides anywhere in the list, appends the short-id:
 *    e.g. "B-1 (Manager) · …r2v"
 */
export function formatClientPickerLabel(
  client: ClientRef,
  allClients?: ClientRef[]
): string {
  if (!client?.name) return '—';
  if (!allClients || allClients.length <= 1) return client.name;

  const targetName = client.name.trim().toLowerCase();
  const nameMatches = allClients.filter(
    (c) => c && c.name && c.name.trim().toLowerCase() === targetName
  );

  if (nameMatches.length <= 1) {
    return client.name;
  }

  const contact = (client.contactPerson || '').trim();
  const baseWithContact = contact ? `${client.name} (${contact})` : client.name;

  const contactMatches = allClients.filter((c) => {
    if (!c || !c.name) return false;
    const cContact = (c.contactPerson || '').trim();
    const cBase = cContact ? `${c.name} (${cContact})` : c.name;
    return cBase.trim().toLowerCase() === baseWithContact.trim().toLowerCase();
  });

  if (contactMatches.length > 1) {
    const short = getShortId(client.id);
    return short ? `${baseWithContact} · …${short}` : baseWithContact;
  }

  return baseWithContact;
}
