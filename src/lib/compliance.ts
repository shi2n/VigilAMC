export interface EquipmentTypeInfo {
  code: string;
  name: string;
  defaultCapacity: string;
  suitableFor: string[];
  notSuitableFor: string[];
  refillIntervalMonths: number;
  hydroTestIntervalMonths: number;
  colorCode: string;
  description: string;
  passGuide: {
    p: string;
    a: string;
    s1: string;
    s2: string;
    caution: string;
  };
}

export const EQUIPMENT_TYPES: Record<string, EquipmentTypeInfo> = {
  ABC_DRY_POWDER: {
    code: 'ABC_DRY_POWDER',
    name: 'ABC Dry Powder (Stored Pressure)',
    defaultCapacity: '6 KG',
    suitableFor: ['Class A (Wood, Paper, Cloth)', 'Class B (Flammable Liquids)', 'Class C (Flammable Gases)', 'Electrical Fires'],
    notSuitableFor: ['Cooking oil/kitchen deep fat fryers (Class F)'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 36, // 3 years per IS 2190
    colorCode: '#3b82f6', // Blue tag standard in India
    description: 'Multi-purpose powder extinguisher suitable for standard commercial and residential hazards.',
    passGuide: {
      p: 'Pull the safety pin by breaking the plastic tamper seal.',
      a: 'Aim low, pointing the nozzle or hose directly at the base of the fire.',
      s1: 'Squeeze the operating lever smoothly to discharge monoammonium phosphate powder.',
      s2: 'Sweep slowly from side to side across the base until fire is completely extinguished.',
      caution: 'Leaves chemical powder residue. Ventilate area after use.'
    }
  },
  CO2: {
    code: 'CO2',
    name: 'Carbon Dioxide (CO2)',
    defaultCapacity: '4.5 KG',
    suitableFor: ['Electrical Hazards (Panels, Server Racks)', 'Class B (Flammable Liquids: Petrol, Diesel, Paint)'],
    notSuitableFor: ['Class A solids in deep seated fires', 'Confined unventilated spaces without breathing apparatus'],
    refillIntervalMonths: 12, // Annual weight loss check / 10% discharge
    hydroTestIntervalMonths: 60, // 5 years per Gas Cylinder Rules & IS 2190
    colorCode: '#1f2937', // Black band
    description: 'Clean residue-free gas discharge ideal for server rooms, electronics, and switchgear.',
    passGuide: {
      p: 'Pull out the locking pin on the wheel or squeeze grip valve.',
      a: 'Aim the discharge horn at the base of the fire.',
      s1: 'Squeeze handle. HOLD ONLY the frost-free insulated handle/grip.',
      s2: 'Sweep edge to edge. Smothers oxygen rapidly.',
      caution: 'Extreme Cold Discharge (-78°C). Never touch the horn with bare skin (risk of severe frostbite)!'
    }
  },
  FOAM_AFFF: {
    code: 'FOAM_AFFF',
    name: 'Mechanical Foam (AFFF)',
    defaultCapacity: '9 LTR',
    suitableFor: ['Class A (Wood, Paper, Textiles)', 'Class B (Spilled Petrol, Diesel, Kerosene, Lubricants)'],
    notSuitableFor: ['LIVE ELECTRICAL FIRES (Water conducts electricity!)', 'Cooking oils'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 36,
    colorCode: '#eab308', // Cream / Yellow band
    description: 'Forms an aqueous film over liquid fuels, smothering vapor release and preventing flashback.',
    passGuide: {
      p: 'Pull out safety pin.',
      a: 'Aim at an adjacent vertical surface or the back edge of the liquid pool so foam gently spreads.',
      s1: 'Squeeze trigger to release foaming blanket.',
      s2: 'Sweep across liquid surface without agitating the fire.',
      caution: 'DANGER: DO NOT spray directly on high voltage electrical equipment.'
    }
  },
  WATER_CO2: {
    code: 'WATER_CO2',
    name: 'Water-CO2 / Stored Water',
    defaultCapacity: '9 LTR',
    suitableFor: ['Class A (Wood, Paper, Cotton, Fabric, Cardboard)'],
    notSuitableFor: ['ELECTRICAL FIRES (Conductive)', 'Flammable liquid fuel spills (Spreads fire)'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 36,
    colorCode: '#ef4444', // Red
    description: 'Cools glowing embers and penetrates deep-seated cellulosic fuels.',
    passGuide: {
      p: 'Pull safety pin.',
      a: 'Aim at the bottom of flames.',
      s1: 'Squeeze lever steadily.',
      s2: 'Sweep thoroughly until all embers are fully drenched.',
      caution: 'ELECTRICITY SHOCK RISK: Ensure circuit breaker tripped before applying water near fixtures.'
    }
  },
  CLEAN_AGENT_FM200: {
    code: 'CLEAN_AGENT_FM200',
    name: 'Clean Agent Gas (HFC-236fa / FM-200)',
    defaultCapacity: '4 KG',
    suitableFor: ['Data Centers', 'Control Rooms', 'Medical Lab Equipment', 'Telecom Exchanges', 'Class A, B, C & Electrical'],
    notSuitableFor: ['Metal fires (Magnesium, Lithium)'],
    refillIntervalMonths: 12,
    hydroTestIntervalMonths: 60,
    colorCode: '#10b981', // Emerald green
    description: 'Zero ozone depletion, zero residue, non-conductive gas for high-value asset protection.',
    passGuide: {
      p: 'Pull the pin from valve.',
      a: 'Aim nozzle at base of fire.',
      s1: 'Squeeze lever to discharge gas.',
      s2: 'Sweep across burning area.',
      caution: 'Safe for occupied computer rooms when discharged according to standard concentration limits.'
    }
  },
  HYDRANT_VALVE: {
    code: 'HYDRANT_VALVE',
    name: 'Landing Hydrant Valve & Riser',
    defaultCapacity: '63mm Single/Double Head',
    suitableFor: ['Heavy structural firefighting', 'High-rise water supply'],
    notSuitableFor: ['Small kitchen fires'],
    refillIntervalMonths: 6, // Bi-annual flow & gland packing test
    hydroTestIntervalMonths: 12, // Annual hydrostatic line test
    colorCode: '#b91c1c',
    description: 'Internal wet riser landing valve connected to rooftop booster and basement fire pumps.',
    passGuide: {
      p: 'Verify hose coupling connected tightly into instantaneous 63mm female outlet.',
      a: 'Ensure nozzle branch pipe held firmly by 2 trained personnel.',
      s1: 'Turn handwheel anti-clockwise slowly to open water supply.',
      s2: 'Maintain 3.5 to 5.5 bar nozzle pressure for jet stream.',
      caution: 'High recoil pressure! Always brace feet securely before opening valve.'
    }
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
