export type ComplianceStatus = 'NOT_INSPECTED' | 'DUE_SOON' | 'OVERDUE' | 'VERIFIED';

export interface EquipmentStatusResult {
  status: ComplianceStatus;
  label: string;
  color: string;
  badgeClass: string;
  diffDays: number;
  lastVerifiedDate: Date | null;
  hasGPS: boolean;
  hasPhoto: boolean;
  isImported: boolean;
}

export function evaluateEquipmentStatus(eq: any, now: Date = new Date()): EquipmentStatusResult {
  const nextDue = eq.nextDueDate ? new Date(eq.nextDueDate) : null;
  const diffDays = nextDue ? Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const latestInspection = eq.inspections?.[0] || eq.serviceLogs?.[0] || null;
  const hasInspection = Boolean(latestInspection || eq.lastServiceDate || eq.status);
  const isImported = Boolean(latestInspection?.isImported || eq.isImported);
  const hasGPS = Boolean(latestInspection?.latitude && latestInspection?.longitude);
  const hasPhoto = Boolean(
    eq.photoUrl ||
    latestInspection?.photos ||
    (latestInspection?.inspectionPhotos && latestInspection.inspectionPhotos.length > 0)
  );
  const verifiedDate = latestInspection
    ? new Date(latestInspection.date || latestInspection.servicedAt)
    : eq.lastServiceDate
    ? new Date(eq.lastServiceDate)
    : null;

  // 1. Overdue (red) - always takes priority when nextDueDate has passed
  if (diffDays < 0 || eq.status === 'OVERDUE') {
    return {
      status: 'OVERDUE',
      label: 'Overdue',
      color: 'rose',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50',
      diffDays,
      lastVerifiedDate: verifiedDate,
      hasGPS,
      hasPhoto,
      isImported,
    };
  }

  // 2. Due soon (amber, due within 30 days)
  if (diffDays <= 30 || eq.status === 'DUE_SOON') {
    return {
      status: 'DUE_SOON',
      label: 'Due soon (<30d)',
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50',
      diffDays,
      lastVerifiedDate: verifiedDate,
      hasGPS,
      hasPhoto,
      isImported,
    };
  }

  // 3. Not inspected yet (grey)
  if (!hasInspection) {
    return {
      status: 'NOT_INSPECTED',
      label: 'Not inspected yet',
      color: 'slate',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700',
      diffDays,
      lastVerifiedDate: null,
      hasGPS: false,
      hasPhoto: false,
      isImported: false,
    };
  }

  // 4. Verified (green)
  return {
    status: 'VERIFIED',
    label: isImported ? 'Imported (not field-verified)' : 'Verified',
    color: isImported ? 'blue' : 'emerald',
    badgeClass: isImported
      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50'
      : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50',
    diffDays,
    lastVerifiedDate: verifiedDate,
    hasGPS,
    hasPhoto,
    isImported,
  };
}

export const EQUIPMENT_TYPES: Record<string, any> = {
  ABC_DRY_POWDER: {
    code: 'ABC_DRY_POWDER',
    name: 'ABC Dry Powder (Stored Pressure)',
    defaultCapacity: '6 KG',
    suitableFor: ['Class A (Wood, Paper, Cloth)', 'Class B (Flammable Liquids)', 'Class C (Flammable Gases)', 'Electrical Fires'],
    notSuitableFor: ['Cooking oil/kitchen deep fat fryers (Class F)'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 36,
    colorCode: '#3b82f6',
    description: 'Multi-purpose powder extinguisher suitable for standard commercial and residential hazards.',
  },
  CO2: {
    code: 'CO2',
    name: 'Carbon Dioxide (CO2)',
    defaultCapacity: '4.5 KG',
    suitableFor: ['Electrical Hazards (Panels, Server Racks)', 'Class B (Flammable Liquids: Petrol, Diesel, Paint)'],
    notSuitableFor: ['Class A solids in deep seated fires', 'Confined unventilated spaces without breathing apparatus'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 60,
    colorCode: '#1f2937',
    description: 'Clean residue-free gas discharge ideal for server rooms, electronics, and switchgear.',
  },
  FOAM_AFFF: {
    code: 'FOAM_AFFF',
    name: 'Mechanical Foam (AFFF)',
    defaultCapacity: '9 LTR',
    suitableFor: ['Class A (Wood, Paper, Textiles)', 'Class B (Spilled Petrol, Diesel, Kerosene, Lubricants)'],
    notSuitableFor: ['LIVE ELECTRICAL FIRES', 'Cooking oils'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 36,
    colorCode: '#eab308',
    description: 'Forms an aqueous film over liquid fuels, smothering vapor release and preventing flashback.',
  },
  WATER_CO2: {
    code: 'WATER_CO2',
    name: 'Water-CO2 / Stored Water',
    defaultCapacity: '9 LTR',
    suitableFor: ['Class A (Wood, Paper, Cotton, Fabric, Cardboard)'],
    notSuitableFor: ['ELECTRICAL FIRES', 'Flammable liquid fuel spills'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 36,
    colorCode: '#ef4444',
    description: 'Cools glowing embers and penetrates deep-seated cellulosic fuels.',
  },
  CLEAN_AGENT_FM200: {
    code: 'CLEAN_AGENT_FM200',
    name: 'Clean Agent Gas (HFC-236fa / FM-200)',
    defaultCapacity: '4 KG',
    suitableFor: ['Data Centers', 'Control Rooms', 'Medical Lab Equipment', 'Telecom Exchanges', 'Class A, B, C & Electrical'],
    notSuitableFor: ['Metal fires (Magnesium, Lithium)'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 60,
    colorCode: '#10b981',
    description: 'Zero ozone depletion, zero residue, non-conductive gas for high-value asset protection.',
  },
  HYDRANT_VALVE: {
    code: 'HYDRANT_VALVE',
    name: 'Landing Hydrant Valve & Riser',
    defaultCapacity: '63mm Single/Double Head',
    suitableFor: ['Heavy structural firefighting', 'High-rise water supply'],
    notSuitableFor: ['Small kitchen fires'],
    refillIntervalMonths: 6,
    hydroTestIntervalMonths: 12,
    colorCode: '#b91c1c',
    description: 'Internal wet riser landing valve connected to rooftop booster and basement fire pumps.',
  }
};

export interface NocStatus {
  daysRemaining: number;
  status: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'HEALTHY';
  label: string;
  badgeClass: string;
  textClass: string;
}

export function getNocStatus(expiryDate: Date | string): NocStatus {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      daysRemaining,
      status: 'EXPIRED',
      label: `Lapsed (${Math.abs(daysRemaining)} days ago)`,
      badgeClass: 'bg-red-950 text-red-400 border border-red-800',
      textClass: 'text-red-500 font-bold',
    };
  } else if (daysRemaining <= 30) {
    return {
      daysRemaining,
      status: 'CRITICAL',
      label: `${daysRemaining} days left (Urgent Renewal)`,
      badgeClass: 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse',
      textClass: 'text-red-400 font-semibold',
    };
  } else if (daysRemaining <= 60) {
    return {
      daysRemaining,
      status: 'WARNING',
      label: `${daysRemaining} days left (Upcoming Renewal)`,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      textClass: 'text-amber-400 font-medium',
    };
  } else {
    return {
      daysRemaining,
      status: 'HEALTHY',
      label: `Valid (${daysRemaining} days left)`,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      textClass: 'text-emerald-400',
    };
  }
}

export function getAssetRefillStatus(nextRefillDate: Date | string) {
  const due = new Date(nextRefillDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'OVERDUE',
      label: `Overdue by ${Math.abs(diffDays)}d`,
      color: 'bg-red-500 text-white',
      badgeClass: 'bg-red-950/80 text-red-300 border border-red-800'
    };
  } else if (diffDays <= 30) {
    return {
      status: 'DUE_SOON',
      label: `Due in ${diffDays}d`,
      color: 'bg-amber-500 text-black',
      badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-800'
    };
  } else {
    return {
      status: 'OK',
      label: `Valid (${Math.round(diffDays / 30)} mos)`,
      color: 'bg-emerald-600 text-white',
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
    };
  }
}
