import * as XLSX from 'xlsx';

export type ImportType =
  | 'CLIENTS'
  | 'BUILDINGS'
  | 'FIRE_ASSETS'
  | 'TECHNICIANS'
  | 'INSPECTIONS'
  | 'WORK_ORDERS';

export type DuplicateStrategy = 'SKIP' | 'UPDATE' | 'CREATE_NEW';

export interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
  type: 'string' | 'email' | 'phone' | 'date' | 'number' | 'enum';
  enumValues?: string[];
  aliases: string[];
  description: string;
  example: string | number;
}

export interface ImportConfig {
  type: ImportType;
  title: string;
  entityName: string;
  singular: string;
  plural: string;
  uniqueKeyField: string;
  fields: FieldDefinition[];
  sampleRows: Record<string, any>[];
  guidelines: string[];
}

export const IMPORT_CONFIGS: Record<ImportType, ImportConfig> = {
  CLIENTS: {
    type: 'CLIENTS',
    title: 'Clients & Societies',
    entityName: 'Client',
    singular: 'Client',
    plural: 'Clients',
    uniqueKeyField: 'name',
    fields: [
      {
        key: 'name',
        label: 'Client / Society Name',
        required: true,
        type: 'string',
        aliases: ['client name', 'client', 'customer name', 'customer', 'society name', 'company', 'organization', 'account name', 'name'],
        description: 'Legal commercial entity, housing society, or facility management group.',
        example: 'DLF CyberCity Management Ltd',
      },
      {
        key: 'contactPerson',
        label: 'Contact Person / SPOC',
        required: false,
        type: 'string',
        aliases: ['contact person', 'contact name', 'manager', 'spoc', 'person', 'representative', 'facility manager'],
        description: 'Primary facility or estate manager coordinating AMC operations.',
        example: 'Vikram Malhotra',
      },
      {
        key: 'phone',
        label: 'Contact Phone Number',
        required: false,
        type: 'phone',
        aliases: ['phone', 'mobile', 'contact number', 'phone number', 'cell', 'tel', 'mobile no'],
        description: '10-digit mobile number or standard landline with area code.',
        example: '+91 98110 23456',
      },
      {
        key: 'email',
        label: 'Official Email Address',
        required: false,
        type: 'email',
        aliases: ['email', 'email address', 'e-mail', 'mail', 'contact email'],
        description: 'Email destination for statutory inspection certificates and notices.',
        example: 'facilities@dlfcybercity.in',
      },
    ],
    sampleRows: [
      {
        'Client / Society Name': 'DLF CyberCity Management Ltd',
        'Contact Person / SPOC': 'Vikram Malhotra',
        'Contact Phone Number': '+91 98110 23456',
        'Official Email Address': 'facilities@dlfcybercity.in',
      },
      {
        'Client / Society Name': 'Max Super Speciality Hospital Facility',
        'Contact Person / SPOC': 'Dr. Sunita Rao (Admin)',
        'Contact Phone Number': '+91 98712 34567',
        'Official Email Address': 'admin.safetynoida@maxhealth.in',
      },
      {
        'Client / Society Name': 'Ambience Island RWA',
        'Contact Person / SPOC': 'Rajeev Verma (Secretary)',
        'Contact Phone Number': '+91 99100 88776',
        'Official Email Address': 'rwa@ambienceisland.org',
      },
    ],
    guidelines: [
      'Client name is mandatory and must uniquely identify the customer account.',
      'Duplicates are checked primarily by Client Name (case-insensitive) or Email.',
      'Existing clients can be updated with newly provided phone numbers and email contacts.',
    ],
  },

  BUILDINGS: {
    type: 'BUILDINGS',
    title: 'Buildings & Facilities',
    entityName: 'Building',
    singular: 'Building',
    plural: 'Buildings',
    uniqueKeyField: 'name',
    fields: [
      {
        key: 'name',
        label: 'Building / Tower Name',
        required: true,
        type: 'string',
        aliases: ['building name', 'building', 'tower', 'facility', 'premise', 'property', 'site', 'facility name'],
        description: 'Specific tower, block, or building structure.',
        example: 'Cyber Tower 10A',
      },
      {
        key: 'clientName',
        label: 'Client / Society',
        required: false,
        type: 'string',
        aliases: ['client', 'client name', 'society', 'customer', 'account', 'customer name', 'parent client'],
        description: 'Name of the client entity that owns or manages this facility. If not found, a new client will be created automatically.',
        example: 'DLF CyberCity Management Ltd',
      },
      {
        key: 'address',
        label: 'Premises Address',
        required: true,
        type: 'string',
        aliases: ['address', 'premises address', 'location address', 'street', 'property address', 'site address'],
        description: 'Physical address in Delhi NCR (Delhi, Noida, Gurugram).',
        example: 'Plot 14, DLF Cyber City, Sector 24, Gurugram, Delhi NCR 122002',
      },
      {
        key: 'city',
        label: 'City / Region',
        required: false,
        type: 'string',
        aliases: ['city', 'town', 'district', 'region'],
        description: 'Operating city: Delhi, Noida, or Gurugram (Delhi NCR).',
        example: 'Gurugram',
      },
      {
        key: 'complianceCycle',
        label: 'Compliance Cycle',
        required: false,
        type: 'string',
        aliases: ['compliance cycle', 'cycle', 'inspection cycle', 'statutory cycle', 'audit period'],
        description: 'Default: "Delhi NCR Statutory Form-B (Half-Yearly)". Can also be "Delhi Fire NOC Rule 33 (Annual)" or "Haryana Fire Safety Rules (Annual)".',
        example: 'Delhi NCR Statutory Form-B (Half-Yearly)',
      },
    ],
    sampleRows: [
      {
        'Building / Tower Name': 'Cyber Tower 10A',
        'Client / Society': 'DLF CyberCity Management Ltd',
        'Premises Address': 'Plot 14, DLF Cyber City, Sector 24, Gurugram, Delhi NCR 122002',
        'City / Region': 'Gurugram',
        'Compliance Cycle': 'Delhi NCR Statutory Form-B (Half-Yearly)',
      },
      {
        'Building / Tower Name': 'Medical Arts Block B',
        'Client / Society': 'Max Super Speciality Hospital Facility',
        'Premises Address': 'Sector 19, Noida, Delhi NCR 201301',
        'City / Region': 'Noida',
        'Compliance Cycle': 'Delhi NCR Statutory Form-B (Half-Yearly)',
      },
      {
        'Building / Tower Name': 'Tower 3 (Amber Court)',
        'Client / Society': 'Ambience Island RWA',
        'Premises Address': 'Ambience Island, NH-8, Gurugram, Delhi NCR 122001',
        'City / Region': 'Gurugram',
        'Compliance Cycle': 'Delhi Fire NOC Rule 33 (Annual)',
      },
    ],
    guidelines: [
      'Building Name and Premises Address are mandatory.',
      'If the specified Client does not exist, VigilAMC will automatically register the Client under your agency organization.',
      'Compliance cycle defaults to "Delhi NCR Statutory Form-B (Half-Yearly)" if left blank.',
    ],
  },

  FIRE_ASSETS: {
    type: 'FIRE_ASSETS',
    title: 'Fire Assets & Equipment',
    entityName: 'Equipment',
    singular: 'Fire Asset',
    plural: 'Fire Assets',
    uniqueKeyField: 'qrCode',
    fields: [
      {
        key: 'qrCode',
        label: 'Asset Tag / QR Code',
        required: true,
        type: 'string',
        aliases: ['qr code', 'asset tag', 'qr tag', 'tag id', 'barcode', 'equipment id', 'serial', 'tag', 'qr', 'asset id'],
        description: 'Unique alphanumeric identifier printed on the weatherproof physical QR label.',
        example: 'GGN-EXT-101',
      },
      {
        key: 'buildingName',
        label: 'Building / Tower Name',
        required: true,
        type: 'string',
        aliases: ['building', 'building name', 'tower', 'facility', 'premise', 'site'],
        description: 'Facility where this asset is permanently installed. Matches existing buildings or auto-provisions one.',
        example: 'Cyber Tower 10A',
      },
      {
        key: 'type',
        label: 'Equipment Category',
        required: true,
        type: 'string',
        aliases: ['asset type', 'equipment type', 'type', 'category', 'item type'],
        description: 'e.g. Fire Extinguisher, Hydrant Valve, Hose Reel, Smoke Detector, Alarm Panel, Sprinkler System.',
        example: 'Fire Extinguisher',
      },
      {
        key: 'capacity',
        label: 'Capacity & Specification',
        required: true,
        type: 'string',
        aliases: ['capacity', 'specification', 'size', 'rating', 'spec', 'type & capacity'],
        description: 'e.g. ABC Dry Powder 6kg, CO2 Gas 4.5kg, Single Head 63mm Gunmetal, 30m Drum.',
        example: 'ABC Dry Powder 6kg',
      },
      {
        key: 'location',
        label: 'Location Inside Premise',
        required: true,
        type: 'string',
        aliases: ['location', 'floor / area', 'floor', 'placement', 'position', 'installation spot'],
        description: 'Exact floor, corridor, or room (e.g. Floor 3 - Wing A Lift Lobby, Basement Electrical Panel).',
        example: 'Floor 3 - South Corridor Lift Lobby',
      },
      {
        key: 'lastServiceDate',
        label: 'Last Serviced Date',
        required: false,
        type: 'date',
        aliases: ['last service date', 'last serviced', 'serviced on', 'last inspection', 'service date'],
        description: 'Date format: YYYY-MM-DD or DD/MM/YYYY. If blank, defaults to today.',
        example: '2025-10-15',
      },
      {
        key: 'nextDueDate',
        label: 'Next Service Due Date',
        required: false,
        type: 'date',
        aliases: ['next due date', 'next service due', 'due date', 'expiry date', 'refill due'],
        description: 'Date format: YYYY-MM-DD or DD/MM/YYYY. Defaults to 12 months from last service.',
        example: '2026-10-15',
      },
      {
        key: 'currentStatus',
        label: 'Compliance Status',
        required: false,
        type: 'enum',
        enumValues: ['COMPLIANT', 'DUE_SOON', 'OVERDUE'],
        aliases: ['status', 'compliance status', 'condition', 'audit status'],
        description: 'COMPLIANT, DUE_SOON, or OVERDUE. Automatically evaluated based on next due date if blank.',
        example: 'COMPLIANT',
      },
    ],
    sampleRows: [
      {
        'Asset Tag / QR Code': 'GGN-EXT-101',
        'Building / Tower Name': 'Cyber Tower 10A',
        'Equipment Category': 'Fire Extinguisher',
        'Capacity & Specification': 'ABC Dry Powder 6kg',
        'Location Inside Premise': 'Floor 3 - South Corridor Lift Lobby',
        'Last Serviced Date': '2025-10-15',
        'Next Service Due Date': '2026-10-15',
        'Compliance Status': 'COMPLIANT',
      },
      {
        'Asset Tag / QR Code': 'GGN-EXT-102',
        'Building / Tower Name': 'Cyber Tower 10A',
        'Equipment Category': 'Fire Extinguisher',
        'Capacity & Specification': 'CO2 Gas 4.5kg',
        'Location Inside Premise': 'Floor 3 - Server Server Room',
        'Last Serviced Date': '2025-09-01',
        'Next Service Due Date': '2026-09-01',
        'Compliance Status': 'COMPLIANT',
      },
      {
        'Asset Tag / QR Code': 'GGN-HYD-001',
        'Building / Tower Name': 'Cyber Tower 10A',
        'Equipment Category': 'Hydrant Valve',
        'Capacity & Specification': 'Single Head 63mm Gunmetal',
        'Location Inside Premise': 'Floor 1 - Fire Staircase Landing',
        'Last Serviced Date': '2025-08-20',
        'Next Service Due Date': '2026-08-20',
        'Compliance Status': 'COMPLIANT',
      },
    ],
    guidelines: [
      'Asset Tag / QR Code is the unique key. If an asset tag already exists, you can choose to skip or update it.',
      'Dates can be written in standard Excel date formats or text strings like YYYY-MM-DD or DD/MM/YYYY.',
      'If Building Name does not exist, a new building record will automatically be provisioned under your agency.',
    ],
  },

  TECHNICIANS: {
    type: 'TECHNICIANS',
    title: 'Technicians & Field Staff',
    entityName: 'UserProfile',
    singular: 'Technician',
    plural: 'Technicians',
    uniqueKeyField: 'email',
    fields: [
      {
        key: 'fullName',
        label: 'Technician Full Name',
        required: true,
        type: 'string',
        aliases: ['technician name', 'full name', 'name', 'technician', 'employee name', 'staff name'],
        description: 'Certified field technician carrying out site inspections.',
        example: 'Rajesh Kumar Sharma',
      },
      {
        key: 'email',
        label: 'Official Email Address',
        required: true,
        type: 'email',
        aliases: ['email', 'email address', 'official email', 'technician email', 'login email'],
        description: 'Unique email address for mobile technician app login.',
        example: 'rajesh.technician@vigilamc.com',
      },
      {
        key: 'phone',
        label: 'Phone / WhatsApp',
        required: false,
        type: 'phone',
        aliases: ['phone', 'mobile', 'contact number', 'phone number', 'whatsapp'],
        description: 'Mobile contact for immediate field dispatch.',
        example: '+91 98111 98765',
      },
      {
        key: 'employeeId',
        label: 'Employee Badge ID',
        required: false,
        type: 'string',
        aliases: ['employee id', 'emp id', 'staff id', 'badge no', 'id', 'emp code'],
        description: 'Internal badge or license reference.',
        example: 'VGL-TECH-042',
      },
      {
        key: 'assignedRegion',
        label: 'Assigned Territory / Region',
        required: false,
        type: 'string',
        aliases: ['assigned region', 'region', 'zone', 'area', 'territory', 'city'],
        description: 'Operational zone: Delhi, Noida, or Gurugram (Delhi NCR).',
        example: 'Delhi NCR - Gurugram Zone',
      },
    ],
    sampleRows: [
      {
        'Technician Full Name': 'Rajesh Kumar Sharma',
        'Official Email Address': 'rajesh.technician@vigilamc.com',
        'Phone / WhatsApp': '+91 98111 98765',
        'Employee Badge ID': 'VGL-TECH-042',
        'Assigned Territory / Region': 'Delhi NCR - Gurugram Zone',
      },
      {
        'Technician Full Name': 'Mohammad Aslam',
        'Official Email Address': 'aslam.technician@vigilamc.com',
        'Phone / WhatsApp': '+91 98733 11224',
        'Employee Badge ID': 'VGL-TECH-043',
        'Assigned Territory / Region': 'Delhi NCR - Noida Sector 62',
      },
      {
        'Technician Full Name': 'Vikas Rawat',
        'Official Email Address': 'vikas.technician@vigilamc.com',
        'Phone / WhatsApp': '+91 99112 44332',
        'Employee Badge ID': 'VGL-TECH-044',
        'Assigned Territory / Region': 'Delhi NCR - Okhla & South Delhi',
      },
    ],
    guidelines: [
      'Email address is mandatory and must be unique per technician.',
      'Imported technicians are created with the TECHNICIAN role under your agency organization.',
      'Technicians can immediately be assigned to building facilities and work orders.',
    ],
  },

  INSPECTIONS: {
    type: 'INSPECTIONS',
    title: 'Inspections & Audit Logs',
    entityName: 'Inspection',
    singular: 'Inspection',
    plural: 'Inspections',
    uniqueKeyField: 'id',
    fields: [
      {
        key: 'equipmentQrCode',
        label: 'Equipment QR Code',
        required: true,
        type: 'string',
        aliases: ['equipment qr code', 'asset tag', 'qr code', 'qr tag', 'tag id', 'equipment id'],
        description: 'QR Code of the fire safety asset being audited.',
        example: 'GGN-EXT-101',
      },
      {
        key: 'buildingName',
        label: 'Building / Tower Name',
        required: false,
        type: 'string',
        aliases: ['building', 'building name', 'tower', 'facility', 'premise'],
        description: 'Facility name. If omitted, resolved automatically from the asset record.',
        example: 'Cyber Tower 10A',
      },
      {
        key: 'status',
        label: 'Audit Status / Result',
        required: true,
        type: 'enum',
        enumValues: ['PASSED', 'FAILED', 'SERVICE_REQUIRED', 'REPLACEMENT_REQUIRED'],
        aliases: ['audit status', 'status', 'result', 'inspection result', 'outcome'],
        description: 'PASSED, FAILED, SERVICE_REQUIRED, or REPLACEMENT_REQUIRED.',
        example: 'PASSED',
      },
      {
        key: 'technicianName',
        label: 'Inspecting Technician',
        required: false,
        type: 'string',
        aliases: ['technician name', 'technician', 'inspector', 'inspected by', 'staff name'],
        description: 'Name of the technician who performed the inspection.',
        example: 'Rajesh Kumar Sharma',
      },
      {
        key: 'date',
        label: 'Inspection Date',
        required: false,
        type: 'date',
        aliases: ['inspection date', 'date', 'inspected at', 'audit date', 'timestamp'],
        description: 'Date format: YYYY-MM-DD or DD/MM/YYYY. Defaults to current date if blank.',
        example: '2026-03-25',
      },
      {
        key: 'pressureGauge',
        label: 'Pressure Gauge Reading',
        required: false,
        type: 'enum',
        enumValues: ['NORMAL', 'LOW', 'HIGH', 'NA'],
        aliases: ['pressure gauge', 'gauge', 'pressure', 'gauge status'],
        description: 'NORMAL, LOW, HIGH, or NA.',
        example: 'NORMAL',
      },
      {
        key: 'overallCondition',
        label: 'Physical Condition',
        required: false,
        type: 'enum',
        enumValues: ['GOOD', 'NEEDS_ATTENTION', 'DAMAGED'],
        aliases: ['overall condition', 'condition', 'physical condition', 'hardware status'],
        description: 'GOOD, NEEDS_ATTENTION, or DAMAGED.',
        example: 'GOOD',
      },
      {
        key: 'remarks',
        label: 'Technician Remarks & Notes',
        required: false,
        type: 'string',
        aliases: ['remarks', 'notes', 'observations', 'comments', 'checklist notes'],
        description: 'Inspection notes, nozzle checks, or replacement justifications.',
        example: 'Pressure gauge verified in green band. Seal intact. No corrosion detected.',
      },
    ],
    sampleRows: [
      {
        'Equipment QR Code': 'GGN-EXT-101',
        'Building / Tower Name': 'Cyber Tower 10A',
        'Audit Status / Result': 'PASSED',
        'Inspecting Technician': 'Rajesh Kumar Sharma',
        'Inspection Date': '2026-03-25',
        'Pressure Gauge Reading': 'NORMAL',
        'Physical Condition': 'GOOD',
        'Technician Remarks & Notes': 'Pressure gauge verified in green band. Seal intact. No corrosion detected.',
      },
      {
        'Equipment QR Code': 'GGN-EXT-102',
        'Building / Tower Name': 'Cyber Tower 10A',
        'Audit Status / Result': 'SERVICE_REQUIRED',
        'Inspecting Technician': 'Rajesh Kumar Sharma',
        'Inspection Date': '2026-03-25',
        'Pressure Gauge Reading': 'LOW',
        'Physical Condition': 'NEEDS_ATTENTION',
        'Technician Remarks & Notes': 'Low pressure indicator. Needs immediate depot recharge & hydraulic test.',
      },
    ],
    guidelines: [
      'Equipment QR Code must match an existing fire asset in your organization, or the asset must be imported beforehand.',
      'Status must be one of: PASSED, FAILED, SERVICE_REQUIRED, or REPLACEMENT_REQUIRED.',
    ],
  },

  WORK_ORDERS: {
    type: 'WORK_ORDERS',
    title: 'Work Orders & Service Jobs',
    entityName: 'WorkOrder',
    singular: 'Work Order',
    plural: 'Work Orders',
    uniqueKeyField: 'id',
    fields: [
      {
        key: 'title',
        label: 'Work Order Title',
        required: true,
        type: 'string',
        aliases: ['title', 'work order title', 'subject', 'task', 'job title', 'summary'],
        description: 'Brief summary of the maintenance or corrective work.',
        example: 'Refill 6kg ABC Extinguisher & Replace Seal',
      },
      {
        key: 'buildingName',
        label: 'Building / Tower Name',
        required: true,
        type: 'string',
        aliases: ['building', 'building name', 'tower', 'facility', 'premise', 'site'],
        description: 'Facility where the service work takes place.',
        example: 'Cyber Tower 10A',
      },
      {
        key: 'equipmentQrCode',
        label: 'Related Asset QR Code',
        required: false,
        type: 'string',
        aliases: ['equipment qr code', 'asset tag', 'qr code', 'tag id', 'equipment', 'asset'],
        description: 'Specific asset tag linked to this work order (if applicable).',
        example: 'GGN-EXT-102',
      },
      {
        key: 'priority',
        label: 'Priority Level',
        required: false,
        type: 'enum',
        enumValues: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        aliases: ['priority', 'priority level', 'urgency', 'severity'],
        description: 'LOW, MEDIUM, HIGH, or URGENT. Defaults to MEDIUM.',
        example: 'HIGH',
      },
      {
        key: 'status',
        label: 'Work Order Status',
        required: false,
        type: 'enum',
        enumValues: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        aliases: ['status', 'work order status', 'job status', 'progress'],
        description: 'OPEN, IN_PROGRESS, COMPLETED, or CANCELLED. Defaults to OPEN.',
        example: 'OPEN',
      },
      {
        key: 'dueDate',
        label: 'Target Completion Due Date',
        required: false,
        type: 'date',
        aliases: ['due date', 'target date', 'deadline', 'completion date', 'target due date'],
        description: 'Date format: YYYY-MM-DD or DD/MM/YYYY.',
        example: '2026-04-10',
      },
      {
        key: 'description',
        label: 'Scope of Work / Description',
        required: false,
        type: 'string',
        aliases: ['description', 'details', 'scope of work', 'problem', 'notes'],
        description: 'Detailed scope of work, replacement parts, or technician instructions.',
        example: 'Technician flagged low pressure during Q1 audit. Transport cylinder to workshop for hydrostatic test and powder refill.',
      },
    ],
    sampleRows: [
      {
        'Work Order Title': 'Refill 6kg ABC Extinguisher & Replace Seal',
        'Building / Tower Name': 'Cyber Tower 10A',
        'Related Asset QR Code': 'GGN-EXT-102',
        'Priority Level': 'HIGH',
        'Work Order Status': 'OPEN',
        'Target Completion Due Date': '2026-04-10',
        'Scope of Work / Description': 'Technician flagged low pressure during Q1 audit. Transport cylinder to workshop for hydrostatic test and powder refill.',
      },
      {
        'Work Order Title': 'Quarterly Fire Hydrant Flow & Pressure Test',
        'Building / Tower Name': 'Cyber Tower 10A',
        'Related Asset QR Code': 'GGN-HYD-001',
        'Priority Level': 'MEDIUM',
        'Work Order Status': 'OPEN',
        'Target Completion Due Date': '2026-04-15',
        'Scope of Work / Description': 'Execute water pump churn pressure check and clean nozzle couplings pursuant to IS 2190.',
      },
    ],
    guidelines: [
      'Work Order Title and Building Name are mandatory.',
      'Related Asset QR Code is optional. If provided, it links directly to the specific equipment record.',
      'Priority defaults to MEDIUM and Status defaults to OPEN if not specified.',
    ],
  },
};

/**
 * Smart Column Header Matcher
 * Maps raw spreadsheet column headers to standard schema field keys using aliases and fuzzy matching.
 */
export function matchColumnsToFields(
  rawHeaders: string[],
  config: ImportConfig
): Record<string, string | null> {
  const mapping: Record<string, string | null> = {};
  const usedFields = new Set<string>();

  rawHeaders.forEach((raw) => {
    const cleaned = String(raw || '').trim().toLowerCase();
    let bestMatch: string | null = null;

    // 1. Exact match with field key or label
    for (const f of config.fields) {
      if (usedFields.has(f.key)) continue;
      if (
        f.key.toLowerCase() === cleaned ||
        f.label.toLowerCase() === cleaned
      ) {
        bestMatch = f.key;
        break;
      }
    }

    // 2. Exact match with any known alias
    if (!bestMatch) {
      for (const f of config.fields) {
        if (usedFields.has(f.key)) continue;
        if (f.aliases.some((alias) => alias.toLowerCase() === cleaned)) {
          bestMatch = f.key;
          break;
        }
      }
    }

    // 3. Substring / inclusion match with aliases
    if (!bestMatch) {
      for (const f of config.fields) {
        if (usedFields.has(f.key)) continue;
        for (const alias of f.aliases) {
          const a = alias.toLowerCase();
          if (cleaned.includes(a) || a.includes(cleaned)) {
            bestMatch = f.key;
            break;
          }
        }
        if (bestMatch) break;
      }
    }

    if (bestMatch) {
      usedFields.add(bestMatch);
      mapping[raw] = bestMatch;
    } else {
      mapping[raw] = null; // Unmapped
    }
  });

  return mapping;
}

/**
 * Robust Date Parser
 * Handles Excel integer dates (serial), ISO date strings, DD/MM/YYYY, MM/DD/YYYY, and DD-MM-YYYY
 */
export function parseSpreadsheetDate(value: any): Date | null {
  if (value === null || value === undefined || value === '') return null;

  // 1. Date object already
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  // 2. Excel numeric serial date (e.g. 45210)
  if (typeof value === 'number') {
    // 25569 = days between 1900-01-01 and 1970-01-01
    const ms = (value - 25569) * 86400 * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // 3. String date formats
  const str = String(value).trim();
  if (!str) return null;

  // Standard ISO or YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Generic fallback
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Validates a single parsed row against field schema rules
 */
export function validateRow(
  row: Record<string, any>,
  rowNumber: number,
  config: ImportConfig
): {
  isValid: boolean;
  parsedData: Record<string, any>;
  errors: string[];
  suggestedCorrections: string[];
} {
  const errors: string[] = [];
  const suggestedCorrections: string[] = [];
  const parsedData: Record<string, any> = {};

  for (const field of config.fields) {
    let rawVal = row[field.key];
    if (typeof rawVal === 'string') {
      rawVal = rawVal.trim();
    }

    // Required check
    if (field.required) {
      if (rawVal === undefined || rawVal === null || rawVal === '') {
        errors.push(`Missing mandatory field "${field.label}"`);
        suggestedCorrections.push(`Provide a valid ${field.label} for Row ${rowNumber}`);
        continue;
      }
    }

    if (rawVal === undefined || rawVal === null || rawVal === '') {
      parsedData[field.key] = null;
      continue;
    }

    // Type specific checks
    if (field.type === 'email') {
      const emailStr = String(rawVal).toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailStr)) {
        errors.push(`Invalid email format in "${field.label}": "${rawVal}"`);
        suggestedCorrections.push(`Enter a valid email address (e.g. name@domain.com)`);
      } else {
        parsedData[field.key] = emailStr;
      }
    } else if (field.type === 'phone') {
      const phoneStr = String(rawVal).replace(/[\s\-\(\)]/g, '');
      if (phoneStr.length < 7) {
        errors.push(`Invalid phone number in "${field.label}": "${rawVal}"`);
        suggestedCorrections.push(`Enter a 10-digit mobile number or standard contact number`);
      } else {
        parsedData[field.key] = String(rawVal);
      }
    } else if (field.type === 'date') {
      const parsedDate = parseSpreadsheetDate(rawVal);
      if (!parsedDate) {
        errors.push(`Unrecognized date format in "${field.label}": "${rawVal}"`);
        suggestedCorrections.push(`Use YYYY-MM-DD or DD/MM/YYYY date format`);
      } else {
        parsedData[field.key] = parsedDate.toISOString();
      }
    } else if (field.type === 'enum' && field.enumValues) {
      const upperVal = String(rawVal).toUpperCase().replace(/\s+/g, '_');
      const matchedEnum = field.enumValues.find(
        (ev) => ev.toUpperCase() === upperVal || ev.toUpperCase().includes(upperVal)
      );
      if (!matchedEnum) {
        errors.push(
          `Invalid value for "${field.label}": "${rawVal}". Allowed: ${field.enumValues.join(', ')}`
        );
        suggestedCorrections.push(`Select one of: ${field.enumValues.join(', ')}`);
      } else {
        parsedData[field.key] = matchedEnum;
      }
    } else if (field.type === 'number') {
      const num = Number(rawVal);
      if (isNaN(num)) {
        errors.push(`"${field.label}" must be a number: "${rawVal}"`);
        suggestedCorrections.push(`Enter a numeric value`);
      } else {
        parsedData[field.key] = num;
      }
    } else {
      parsedData[field.key] = String(rawVal);
    }
  }

  return {
    isValid: errors.length === 0,
    parsedData,
    errors,
    suggestedCorrections,
  };
}

/**
 * Generates an Excel Sample Template (.xlsx) with:
 * - Sheet 1: Data Template with formatted headers & realistic Delhi NCR sample rows
 * - Sheet 2: Field Guide & Instructions
 */
export function generateSampleWorkbook(type: ImportType): XLSX.WorkBook {
  const config = IMPORT_CONFIGS[type];
  const wb = XLSX.utils.book_new();

  // Sheet 1: Data Template
  const wsData = XLSX.utils.json_to_sheet(config.sampleRows);
  
  // Set column widths
  const colWidths = config.fields.map((f) => ({
    wch: Math.max(f.label.length, String(f.example).length, 18),
  }));
  wsData['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, wsData, `Import ${config.plural}`);

  // Sheet 2: Field Guide
  const guideRows = config.fields.map((f) => ({
    'Column Name': f.label,
    'Internal Key': f.key,
    'Mandatory?': f.required ? 'YES (Required)' : 'Optional',
    'Data Type': f.type.toUpperCase(),
    'Allowed Values / Format': f.enumValues ? f.enumValues.join(', ') : f.type === 'date' ? 'YYYY-MM-DD or DD/MM/YYYY' : 'Free text',
    'Description': f.description,
    'Example': f.example,
  }));

  const wsGuide = XLSX.utils.json_to_sheet(guideRows);
  wsGuide['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 16 },
    { wch: 14 },
    { wch: 32 },
    { wch: 50 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Field Guide & Instructions');

  return wb;
}

/**
 * Generates an Error Report Excel Workbook (.xlsx)
 * Enables admins to fix invalid rows directly in Excel and re-upload them.
 */
export function generateErrorReportWorkbook(
  type: ImportType,
  failedRows: Array<{
    rowNumber: number;
    originalData: Record<string, any>;
    errorReason: string;
    suggestedCorrection: string;
  }>
): XLSX.WorkBook {
  const config = IMPORT_CONFIGS[type];
  const wb = XLSX.utils.book_new();

  const reportRows = failedRows.map((item) => {
    const rowObj: Record<string, any> = {
      'Excel Row #': item.rowNumber,
      'Error Reason': item.errorReason,
      'Suggested Correction': item.suggestedCorrection,
    };

    // Append original input data
    config.fields.forEach((f) => {
      rowObj[f.label] = item.originalData[f.key] ?? item.originalData[f.label] ?? '';
    });

    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(reportRows);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 45 },
    { wch: 45 },
    ...config.fields.map((f) => ({ wch: 20 })),
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Import Errors');
  return wb;
}
