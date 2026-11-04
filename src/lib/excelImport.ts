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
  acceptedFormat?: string;
  example: string | number;
}

export interface ImportConfig {
  type: ImportType;
  title: string;
  entityName: string;
  singular: string;
  plural: string;
  templateSlug: string;
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
    templateSlug: 'clients',
    uniqueKeyField: 'name',
    fields: [
      {
        key: 'name',
        label: 'Client / Society Name',
        required: true,
        type: 'string',
        aliases: ['client name', 'client', 'customer name', 'customer', 'society name', 'company', 'organization', 'account name', 'name'],
        description: 'Legal commercial entity, housing society, or facility management group.',
        acceptedFormat: 'Free text (unique per client)',
        example: 'Horizon Tech Park Ltd',
      },
      {
        key: 'contactPerson',
        label: 'Contact Person / SPOC',
        required: false,
        type: 'string',
        aliases: ['contact person', 'contact name', 'manager', 'spoc', 'person', 'representative', 'facility manager'],
        description: 'Primary facility or estate manager coordinating AMC operations.',
        acceptedFormat: 'Free text',
        example: 'Vikram Malhotra',
      },
      {
        key: 'phone',
        label: 'Contact Phone Number',
        required: false,
        type: 'phone',
        aliases: ['phone', 'mobile', 'contact number', 'phone number', 'cell', 'tel', 'mobile no'],
        description: '10-digit mobile number or standard landline with area code.',
        acceptedFormat: '10-digit mobile (e.g. 9811023456 or +91 98110 23456)',
        example: '9811023456',
      },
      {
        key: 'email',
        label: 'Official Email Address',
        required: false,
        type: 'email',
        aliases: ['email', 'email address', 'e-mail', 'mail', 'contact email'],
        description: 'Email destination for statutory inspection certificates and notices.',
        acceptedFormat: 'Valid email (name@domain.com)',
        example: 'facilities@horizontechpark.in',
      },
    ],
    sampleRows: [
      {
        'Client / Society Name': 'Horizon Tech Park Ltd',
        'Contact Person / SPOC': 'Vikram Malhotra',
        'Contact Phone Number': '9811023456',
        'Official Email Address': 'facilities@horizontechpark.in',
      },
      {
        'Client / Society Name': 'Emerald Heights RWA',
        'Contact Person / SPOC': 'Sunita Rao (Secretary)',
        'Contact Phone Number': '9871234567',
        'Official Email Address': 'office@emeraldheightsrwa.in',
      },
      {
        'Client / Society Name': 'City Center Commercial Management',
        'Contact Person / SPOC': 'Rajeev Verma',
        'Contact Phone Number': '9910088776',
        'Official Email Address': 'estate@citycenterplaza.in',
      },
    ],
    guidelines: [
      'Client / Society Name is mandatory and uniquely identifies the customer account.',
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
    templateSlug: 'buildings',
    uniqueKeyField: 'name',
    fields: [
      {
        key: 'name',
        label: 'Building / Tower Name',
        required: true,
        type: 'string',
        aliases: ['building name', 'building', 'tower', 'facility', 'premise', 'property', 'site', 'facility name'],
        description: 'Specific tower, block, or building structure.',
        acceptedFormat: 'Free text (unique building/tower name)',
        example: 'Horizon Tower A',
      },
      {
        key: 'clientName',
        label: 'Client / Society',
        required: false,
        type: 'string',
        aliases: ['client', 'client name', 'society', 'customer', 'account', 'customer name', 'parent client'],
        description: 'Name of the client entity that owns or manages this facility. If not found, a new client will be created automatically.',
        acceptedFormat: 'Free text (client / society name)',
        example: 'Horizon Tech Park Ltd',
      },
      {
        key: 'address',
        label: 'Premises Address',
        required: true,
        type: 'string',
        aliases: ['address', 'premises address', 'location address', 'street', 'property address', 'site address'],
        description: 'Physical premises address of the building or facility.',
        acceptedFormat: 'Free text (full street/sector address)',
        example: 'Plot 14, Commercial Tower, Sector 62, Noida',
      },
      {
        key: 'city',
        label: 'City / Region',
        required: false,
        type: 'string',
        aliases: ['city', 'town', 'district', 'region'],
        description: 'Operating city or municipal corporation.',
        acceptedFormat: 'Free text (e.g. Delhi, Mumbai, Pune, Bengaluru)',
        example: 'Delhi',
      },
      {
        key: 'complianceCycle',
        label: 'Compliance Cycle',
        required: false,
        type: 'string',
        aliases: ['compliance cycle', 'cycle', 'inspection cycle', 'statutory cycle', 'audit period'],
        description: 'Default: "Half-Yearly Form-B". Can also be "Quarterly Form-B", "Yearly", etc.',
        acceptedFormat: '"Half-Yearly Form-B", "Quarterly Form-B", "Yearly"',
        example: 'Half-Yearly Form-B',
      },
    ],
    sampleRows: [
      {
        'Building / Tower Name': 'Horizon Tower A',
        'Premises Address': 'Plot 14, Commercial Tower, Sector 62, Noida',
        'Client / Society': 'Horizon Tech Park Ltd',
        'City / Region': 'Delhi',
        'Compliance Cycle': 'Half-Yearly Form-B',
      },
      {
        'Building / Tower Name': 'Emerald Heights Society',
        'Premises Address': 'Sector 19, Green Park Avenue, Pune 411014',
        'Client / Society': 'Emerald Heights RWA',
        'City / Region': 'Pune',
        'Compliance Cycle': 'Quarterly Form-B',
      },
      {
        'Building / Tower Name': 'Tower C (Commercial Plaza)',
        'Premises Address': 'Main Boulevard, Express Zone, Hyderabad 500081',
        'Client / Society': 'City Center Commercial Management',
        'City / Region': 'Hyderabad',
        'Compliance Cycle': 'Yearly',
      },
    ],
    guidelines: [
      'Building / Tower Name and Premises Address are mandatory.',
      'If the specified Client does not exist, VigilAMC will automatically register the Client under your agency organization.',
      'Compliance cycle defaults to "Half-Yearly Form-B" if left blank.',
    ],
  },

  FIRE_ASSETS: {
    type: 'FIRE_ASSETS',
    title: 'Fire Assets & Equipment',
    entityName: 'Equipment',
    singular: 'Fire Asset',
    plural: 'Fire Assets',
    templateSlug: 'fire-assets',
    uniqueKeyField: 'qrCode',
    fields: [
      {
        key: 'qrCode',
        label: 'Asset ID',
        required: true,
        type: 'string',
        aliases: ['asset id', 'equipment id', 'serial', 'tag id', 'tag', 'asset tag', 'tag code', 'barcode'],
        description: 'Unique alphanumeric identifier for this fire equipment item.',
        acceptedFormat: 'Alphanumeric tag ID (e.g. EXT-101, HYD-001)',
        example: 'EXT-101',
      },
      {
        key: 'buildingName',
        label: 'Building / Tower Name',
        required: true,
        type: 'string',
        aliases: ['building', 'building name', 'tower', 'facility', 'premise', 'site'],
        description: 'Facility where this asset is permanently installed. Matches existing buildings or auto-provisions one.',
        acceptedFormat: 'Free text (building / tower name)',
        example: 'Horizon Tower A',
      },
      {
        key: 'type',
        label: 'Equipment Category',
        required: true,
        type: 'string',
        aliases: ['asset type', 'equipment type', 'type', 'category', 'item type'],
        description: 'e.g. Fire Extinguisher, Hydrant Valve, Hose Reel, Smoke Detector, Alarm Panel, Sprinkler System.',
        acceptedFormat: 'Free text (equipment category)',
        example: 'Fire Extinguisher',
      },
      {
        key: 'capacity',
        label: 'Capacity & Specification',
        required: true,
        type: 'string',
        aliases: ['capacity', 'specification', 'size', 'rating', 'spec', 'type & capacity'],
        description: 'e.g. ABC Dry Powder 6kg, CO2 Gas 4.5kg, Single Head 63mm Gunmetal, 30m Drum.',
        acceptedFormat: 'Free text (capacity / specification)',
        example: 'ABC Dry Powder 6kg',
      },
      {
        key: 'location',
        label: 'Location Inside Premise',
        required: true,
        type: 'string',
        aliases: ['location', 'floor / area', 'floor', 'placement', 'position', 'installation spot'],
        description: 'Exact floor, corridor, or room (e.g. Floor 3 - Wing A Lift Lobby, Basement Electrical Panel).',
        acceptedFormat: 'Free text (floor / zone / corridor)',
        example: 'Floor 3 - South Corridor Lift Lobby',
      },
      {
        key: 'lastServiceDate',
        label: 'Last Serviced Date',
        required: false,
        type: 'date',
        aliases: ['last service date', 'last serviced', 'serviced on', 'last inspection', 'service date'],
        description: 'Date format: DD/MM/YYYY or ISO YYYY-MM-DD. If blank, defaults to today.',
        acceptedFormat: 'DD/MM/YYYY or YYYY-MM-DD',
        example: '2025-10-15',
      },
      {
        key: 'nextDueDate',
        label: 'Next Service Due Date',
        required: false,
        type: 'date',
        aliases: ['next due date', 'next service due', 'due date', 'expiry date', 'refill due'],
        description: 'Date format: DD/MM/YYYY or ISO YYYY-MM-DD. Defaults to 12 months from last service.',
        acceptedFormat: 'DD/MM/YYYY or YYYY-MM-DD',
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
        acceptedFormat: 'COMPLIANT | DUE_SOON | OVERDUE',
        example: 'COMPLIANT',
      },
    ],
    sampleRows: [
      {
        'Asset ID': 'EXT-101',
        'Building / Tower Name': 'Horizon Tower A',
        'Equipment Category': 'Fire Extinguisher',
        'Capacity & Specification': 'ABC Dry Powder 6kg',
        'Location Inside Premise': 'Floor 3 - South Corridor Lift Lobby',
        'Last Serviced Date': '2025-10-15',
        'Next Service Due Date': '2026-10-15',
        'Compliance Status': 'COMPLIANT',
      },
      {
        'Asset ID': 'EXT-102',
        'Building / Tower Name': 'Horizon Tower A',
        'Equipment Category': 'Fire Extinguisher',
        'Capacity & Specification': 'CO2 Gas 4.5kg',
        'Location Inside Premise': 'Floor 3 - Server Room',
        'Last Serviced Date': '2025-09-01',
        'Next Service Due Date': '2026-09-01',
        'Compliance Status': 'COMPLIANT',
      },
      {
        'Asset ID': 'HYD-001',
        'Building / Tower Name': 'Horizon Tower A',
        'Equipment Category': 'Hydrant Valve',
        'Capacity & Specification': 'Single Head 63mm Gunmetal',
        'Location Inside Premise': 'Floor 1 - Fire Staircase Landing',
        'Last Serviced Date': '2025-08-20',
        'Next Service Due Date': '2026-08-20',
        'Compliance Status': 'COMPLIANT',
      },
    ],
    guidelines: [
      'Asset ID is the unique key. If an asset tag already exists, you can choose to skip or update it.',
      'Dates can be written in DD/MM/YYYY or ISO YYYY-MM-DD format.',
      'If Building / Tower Name does not exist, a new building record will automatically be provisioned under your agency.',
    ],
  },

  TECHNICIANS: {
    type: 'TECHNICIANS',
    title: 'Technicians & Field Staff',
    entityName: 'UserProfile',
    singular: 'Technician',
    plural: 'Technicians',
    templateSlug: 'technicians',
    uniqueKeyField: 'email',
    fields: [
      {
        key: 'fullName',
        label: 'Technician Full Name',
        required: true,
        type: 'string',
        aliases: ['technician name', 'full name', 'name', 'technician', 'employee name', 'staff name'],
        description: 'Certified field technician carrying out site inspections.',
        acceptedFormat: 'Free text (full name)',
        example: 'Rajesh Kumar Sharma',
      },
      {
        key: 'email',
        label: 'Official Email Address',
        required: true,
        type: 'email',
        aliases: ['email', 'email address', 'official email', 'technician email', 'login email'],
        description: 'Unique email address for technician account identification.',
        acceptedFormat: 'Valid email (name@domain.com)',
        example: 'rajesh.sharma@example.com',
      },
      {
        key: 'phone',
        label: 'Phone / WhatsApp',
        required: false,
        type: 'phone',
        aliases: ['phone', 'mobile', 'contact number', 'phone number', 'whatsapp'],
        description: '10-digit mobile contact for immediate field dispatch.',
        acceptedFormat: '10-digit mobile number',
        example: '9811198765',
      },
      {
        key: 'employeeId',
        label: 'Employee Badge ID',
        required: false,
        type: 'string',
        aliases: ['employee id', 'emp id', 'staff id', 'badge no', 'id', 'emp code'],
        description: 'Internal badge or license reference.',
        acceptedFormat: 'Alphanumeric badge code',
        example: 'VGL-TECH-042',
      },
      {
        key: 'assignedRegion',
        label: 'Assigned Territory / Region',
        required: false,
        type: 'string',
        aliases: ['assigned region', 'region', 'zone', 'area', 'territory', 'city'],
        description: 'Operational zone or city territory.',
        acceptedFormat: 'Free text (city / zone)',
        example: 'Noida Sector 62 Zone',
      },
    ],
    sampleRows: [
      {
        'Technician Full Name': 'Rajesh Kumar Sharma',
        'Official Email Address': 'rajesh.sharma@example.com',
        'Phone / WhatsApp': '9811198765',
        'Employee Badge ID': 'VGL-TECH-042',
        'Assigned Territory / Region': 'Noida Sector 62 Zone',
      },
      {
        'Technician Full Name': 'Mohammad Aslam',
        'Official Email Address': 'aslam.tech@example.com',
        'Phone / WhatsApp': '9873311224',
        'Employee Badge ID': 'VGL-TECH-043',
        'Assigned Territory / Region': 'West Delhi Zone',
      },
      {
        'Technician Full Name': 'Vikas Rawat',
        'Official Email Address': 'vikas.rawat@example.com',
        'Phone / WhatsApp': '9911244332',
        'Employee Badge ID': 'VGL-TECH-044',
        'Assigned Territory / Region': 'Pune Hinjewadi Zone',
      },
    ],
    guidelines: [
      'Official Email Address and Technician Full Name are mandatory.',
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
    templateSlug: 'inspections',
    uniqueKeyField: 'id',
    fields: [
      {
        key: 'equipmentQrCode',
        label: 'Asset ID',
        required: true,
        type: 'string',
        aliases: ['asset id', 'equipment id', 'asset tag', 'tag id', 'tag code'],
        description: 'Asset ID of the fire safety equipment being inspected.',
        acceptedFormat: 'Alphanumeric Asset ID (e.g. EXT-101)',
        example: 'EXT-101',
      },
      {
        key: 'buildingName',
        label: 'Building / Tower Name',
        required: false,
        type: 'string',
        aliases: ['building', 'building name', 'tower', 'facility', 'premise'],
        description: 'Facility name. If omitted, resolved automatically from the asset record.',
        acceptedFormat: 'Free text (building / tower name)',
        example: 'Horizon Tower A',
      },
      {
        key: 'status',
        label: 'Audit Status / Result',
        required: true,
        type: 'enum',
        enumValues: ['PASSED', 'FAILED', 'SERVICE_REQUIRED', 'REPLACEMENT_REQUIRED'],
        aliases: ['audit status', 'status', 'result', 'inspection result', 'outcome'],
        description: 'PASSED, FAILED, SERVICE_REQUIRED, or REPLACEMENT_REQUIRED.',
        acceptedFormat: 'PASSED | FAILED | SERVICE_REQUIRED | REPLACEMENT_REQUIRED',
        example: 'PASSED',
      },
      {
        key: 'technicianName',
        label: 'Inspecting Technician',
        required: false,
        type: 'string',
        aliases: ['technician name', 'technician', 'inspector', 'inspected by', 'staff name'],
        description: 'Name of the technician who performed the inspection.',
        acceptedFormat: 'Free text (technician name)',
        example: 'Rajesh Kumar Sharma',
      },
      {
        key: 'date',
        label: 'Inspection Date',
        required: false,
        type: 'date',
        aliases: ['inspection date', 'date', 'inspected at', 'audit date', 'timestamp'],
        description: 'Date format: DD/MM/YYYY or ISO YYYY-MM-DD. Defaults to current date if blank.',
        acceptedFormat: 'DD/MM/YYYY or YYYY-MM-DD',
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
        acceptedFormat: 'NORMAL | LOW | HIGH | NA',
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
        acceptedFormat: 'GOOD | NEEDS_ATTENTION | DAMAGED',
        example: 'GOOD',
      },
      {
        key: 'remarks',
        label: 'Technician Remarks & Notes',
        required: false,
        type: 'string',
        aliases: ['remarks', 'notes', 'observations', 'comments', 'checklist notes'],
        description: 'Inspection notes, nozzle checks, or replacement justifications.',
        acceptedFormat: 'Free text',
        example: 'Pressure gauge verified in green band. Seal intact. No corrosion detected.',
      },
    ],
    sampleRows: [
      {
        'Asset ID': 'EXT-101',
        'Audit Status / Result': 'PASSED',
        'Building / Tower Name': 'Horizon Tower A',
        'Inspecting Technician': 'Rajesh Kumar Sharma',
        'Inspection Date': '2026-03-25',
        'Pressure Gauge Reading': 'NORMAL',
        'Physical Condition': 'GOOD',
        'Technician Remarks & Notes': 'Pressure gauge verified in green band. Seal intact. No corrosion detected.',
      },
      {
        'Asset ID': 'EXT-102',
        'Audit Status / Result': 'SERVICE_REQUIRED',
        'Building / Tower Name': 'Horizon Tower A',
        'Inspecting Technician': 'Rajesh Kumar Sharma',
        'Inspection Date': '2026-03-25',
        'Pressure Gauge Reading': 'LOW',
        'Physical Condition': 'NEEDS_ATTENTION',
        'Technician Remarks & Notes': 'Low pressure indicator. Needs immediate depot recharge & hydraulic test.',
      },
      {
        'Asset ID': 'HYD-001',
        'Audit Status / Result': 'PASSED',
        'Building / Tower Name': 'Horizon Tower A',
        'Inspecting Technician': 'Mohammad Aslam',
        'Inspection Date': '2026-03-26',
        'Pressure Gauge Reading': 'NORMAL',
        'Physical Condition': 'GOOD',
        'Technician Remarks & Notes': 'Landing valve coupling and rubber washer checked and operational.',
      },
    ],
    guidelines: [
      'Asset ID must match an existing fire asset in your organization, or the asset must be imported beforehand.',
      'Audit Status / Result must be one of: PASSED, FAILED, SERVICE_REQUIRED, or REPLACEMENT_REQUIRED.',
    ],
  },

  WORK_ORDERS: {
    type: 'WORK_ORDERS',
    title: 'Work Orders & Service Jobs',
    entityName: 'WorkOrder',
    singular: 'Work Order',
    plural: 'Work Orders',
    templateSlug: 'work-orders',
    uniqueKeyField: 'id',
    fields: [
      {
        key: 'title',
        label: 'Work Order Title',
        required: true,
        type: 'string',
        aliases: ['title', 'work order title', 'subject', 'task', 'job title', 'summary'],
        description: 'Brief summary of the maintenance or corrective work.',
        acceptedFormat: 'Free text',
        example: 'Refill 6kg ABC Extinguisher & Replace Seal',
      },
      {
        key: 'buildingName',
        label: 'Building / Tower Name',
        required: true,
        type: 'string',
        aliases: ['building', 'building name', 'tower', 'facility', 'premise', 'site'],
        description: 'Facility where the service work takes place.',
        acceptedFormat: 'Free text (building / tower name)',
        example: 'Horizon Tower A',
      },
      {
        key: 'equipmentQrCode',
        label: 'Related Asset ID',
        required: false,
        type: 'string',
        aliases: ['related asset id', 'asset id', 'equipment id', 'asset tag', 'tag id', 'equipment', 'asset'],
        description: 'Specific asset tag linked to this work order (if applicable).',
        acceptedFormat: 'Alphanumeric Asset ID (optional)',
        example: 'EXT-102',
      },
      {
        key: 'priority',
        label: 'Priority Level',
        required: false,
        type: 'enum',
        enumValues: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        aliases: ['priority', 'priority level', 'urgency', 'severity'],
        description: 'LOW, MEDIUM, HIGH, or URGENT. Defaults to MEDIUM.',
        acceptedFormat: 'LOW | MEDIUM | HIGH | URGENT',
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
        acceptedFormat: 'OPEN | IN_PROGRESS | COMPLETED | CANCELLED',
        example: 'OPEN',
      },
      {
        key: 'dueDate',
        label: 'Target Completion Due Date',
        required: false,
        type: 'date',
        aliases: ['due date', 'target date', 'deadline', 'completion date', 'target due date'],
        description: 'Date format: DD/MM/YYYY or ISO YYYY-MM-DD.',
        acceptedFormat: 'DD/MM/YYYY or YYYY-MM-DD',
        example: '2026-04-10',
      },
      {
        key: 'description',
        label: 'Scope of Work / Description',
        required: false,
        type: 'string',
        aliases: ['description', 'details', 'scope of work', 'problem', 'notes'],
        description: 'Detailed scope of work, replacement parts, or technician instructions.',
        acceptedFormat: 'Free text',
        example: 'Technician flagged low pressure during audit. Transport cylinder to workshop for hydrostatic test and powder refill.',
      },
    ],
    sampleRows: [
      {
        'Work Order Title': 'Refill 6kg ABC Extinguisher & Replace Seal',
        'Building / Tower Name': 'Horizon Tower A',
        'Related Asset ID': 'EXT-102',
        'Priority Level': 'HIGH',
        'Work Order Status': 'OPEN',
        'Target Completion Due Date': '2026-04-10',
        'Scope of Work / Description': 'Technician flagged low pressure during audit. Transport cylinder to workshop for hydrostatic test and powder refill.',
      },
      {
        'Work Order Title': 'Quarterly Fire Hydrant Flow & Pressure Test',
        'Building / Tower Name': 'Horizon Tower A',
        'Related Asset ID': 'HYD-001',
        'Priority Level': 'MEDIUM',
        'Work Order Status': 'OPEN',
        'Target Completion Due Date': '2026-04-15',
        'Scope of Work / Description': 'Execute water pump churn pressure check and clean nozzle couplings pursuant to IS 2190.',
      },
    ],
    guidelines: [
      'Work Order Title and Building / Tower Name are mandatory.',
      'Related Asset ID is optional. If provided, it links directly to the specific equipment record.',
      'Priority defaults to MEDIUM and Status defaults to OPEN if not specified.',
    ],
  },
};

/**
 * Returns fields ordered with mandatory (required) fields first, followed by optional fields.
 */
export function getOrderedTemplateFields(type: ImportType): FieldDefinition[] {
  const config = IMPORT_CONFIGS[type];
  return [
    ...config.fields.filter((f) => f.required),
    ...config.fields.filter((f) => !f.required),
  ];
}

/**
 * Returns the standardized template filename (e.g. vigilamc-buildings-template.xlsx)
 */
export function getTemplateFilename(type: ImportType, ext: 'xlsx' | 'csv' = 'xlsx'): string {
  const config = IMPORT_CONFIGS[type];
  return `vigilamc-${config.templateSlug}-template.${ext}`;
}

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
 * Builds the ordered "Data" worksheet (mandatory columns first, frozen header row, bold headers, column widths)
 */
function buildDataWorksheet(type: ImportType): XLSX.WorkSheet {
  const config = IMPORT_CONFIGS[type];
  const orderedFields = getOrderedTemplateFields(type);
  const headerLabels = orderedFields.map((f) => f.label);

  const orderedSampleRows = config.sampleRows.map((row) => {
    const orderedRow: Record<string, any> = {};
    orderedFields.forEach((f) => {
      orderedRow[f.label] = row[f.label] ?? f.example ?? '';
    });
    return orderedRow;
  });

  const wsData = XLSX.utils.json_to_sheet(orderedSampleRows, {
    header: headerLabels,
  });

  // Set column widths
  wsData['!cols'] = orderedFields.map((f) => ({
    wch: Math.max(f.label.length + 4, String(f.example).length + 4, 22),
  }));

  // Freeze top header row (supported by Excel & LibreOffice)
  (wsData as any)['!freeze'] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: 'A2',
    activePane: 'bottomLeft',
    state: 'frozen',
  };
  (wsData as any)['!views'] = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  // Apply bold header styling metadata
  headerLabels.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (wsData[cellRef]) {
      (wsData[cellRef] as any).s = {
        font: { bold: true, color: { rgb: '1C1917' } },
        fill: { fgColor: { rgb: 'FFF0E6' } },
      };
    }
  });

  return wsData;
}

/**
 * Generates an Excel Sample Template (.xlsx) with:
 * - Sheet "Data": headers EXACTLY matching the mapping target fields (mandatory columns first),
 *   frozen header row, bold header style, column widths set, + 2–3 realistic sample rows.
 * - Sheet "How to use": the 6 onboarding steps in plain language + field-format table + support email.
 */
export function generateSampleWorkbook(type: ImportType): XLSX.WorkBook {
  const config = IMPORT_CONFIGS[type];
  const orderedFields = getOrderedTemplateFields(type);
  const wb = XLSX.utils.book_new();

  // Sheet 1: "Data"
  const wsData = buildDataWorksheet(type);
  XLSX.utils.book_append_sheet(wb, wsData, 'Data');

  // Sheet 2: "How to use"
  const aoa: any[][] = [
    [`VigilAMC — How to Import ${config.title}`],
    [''],
    ['Step-by-Step Instructions:'],
    ['1. Download the template (.xlsx or .csv) for your record type.'],
    ['2. Fill your rows on the "Data" sheet (keep column headers unchanged).'],
    ['3. Upload your saved .xlsx, .xls, or .csv file into the Excel Data Import Engine.'],
    ['4. Check or auto-adjust column mapping on the Smart Column Mapping step.'],
    ['5. Click "Verify & Preview" to validate formats and inspect rows.'],
    ['6. Click "Start Bulk Import" — duplicate records are automatically protected.'],
    [''],
    ['Common Issues & Enforced Limits:'],
    ['• Header names are auto-matched — rename only if unmatched.'],
    ['• Duplicate rows are skipped and counted automatically by default.'],
    ['• Max file size: 10 MB (.xlsx, .xls, .csv) • Processed in chunks of 100 rows (supports 500 to 20,000+ rows).'],
    ['• Support: Stuck? vigilamc@gmail.com'],
    [''],
    ['Field Rules & Accepted Formats:'],
    ['Target Field Header', 'Required / Optional', 'Accepted Format', 'Description', 'Example Value'],
    ...orderedFields.map((f) => [
      f.label,
      f.required ? 'Mandatory (Required)' : 'Optional',
      f.acceptedFormat || (f.enumValues ? f.enumValues.join(' | ') : f.type === 'date' ? 'DD/MM/YYYY or YYYY-MM-DD' : 'Free text'),
      f.description,
      String(f.example),
    ]),
    [''],
    ['Need help? Contact Support: vigilamc@gmail.com'],
  ];

  const wsGuide = XLSX.utils.aoa_to_sheet(aoa);
  wsGuide['!cols'] = [
    { wch: 30 },
    { wch: 22 },
    { wch: 36 },
    { wch: 56 },
    { wch: 36 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'How to use');

  return wb;
}

/**
 * Generates a clean, comment-free CSV template string containing the exact "Data" sheet content.
 */
export function generateSampleCsv(type: ImportType): string {
  const wsData = buildDataWorksheet(type);
  return XLSX.utils.sheet_to_csv(wsData);
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
