import crypto from 'crypto';
import { calendarDayDiff } from './dates';

/**
 * ============================================================================
 * VIGILAMC — JURISDICTION-AWARE COMPLIANCE, LEGAL REFERENCE & REPORT ENGINE
 * ============================================================================
 * Strictly adheres to Government Compliance, Fire Safety Reporting & State-Wise
 * Report Generator Upgrade requirements (Steps 1–16):
 * - Never claims VigilAMC or any agency is Government Authorized/Approved/Certified
 *   unless documented authorization exists and is verified by an administrator.
 * - Never generates Government Form-B or Form-H or Fire NOC certificates.
 * - Implements Delhi, Noida (Uttar Pradesh), and Gurugram (Haryana) jurisdiction
 *   configurations with official government source references.
 * - Implements updated BIS standards (IS 2190:2024 Fifth Revision, etc.) mapped
 *   strictly to registered equipment categories.
 * - Enforces the Zero-Asset Rule, Incomplete-Inspection Rule, and 7-state
 *   Report Status calculation.
 */

export type ReportTypeCode =
  | 'FIRE_SAFETY_INSPECTION_REPORT'
  | 'FIRE_EQUIPMENT_MAINTENANCE_REPORT'
  | 'FIRE_SAFETY_ASSET_REGISTER'
  | 'PERIODIC_INSPECTION_REPORT'
  | 'CORRECTIVE_ACTION_REPORT'
  | 'AMC_SERVICE_MAINTENANCE_REPORT';

export interface ReportTypeDefinition {
  code: ReportTypeCode;
  name: string;
  title: string;
  subtitle: string;
  description: string;
}

export const DEFAULT_REPORT_TITLE = 'VIGILAMC FIRE SAFETY INSPECTION & MAINTENANCE REPORT';
export const DEFAULT_REPORT_SUBTITLE = 'Equipment Inspection, Maintenance Records and Field Verification Report.';

export const REPORT_TYPES: Record<ReportTypeCode, ReportTypeDefinition> = {
  FIRE_SAFETY_INSPECTION_REPORT: {
    code: 'FIRE_SAFETY_INSPECTION_REPORT',
    name: 'Fire Safety Inspection Report',
    title: DEFAULT_REPORT_TITLE,
    subtitle: DEFAULT_REPORT_SUBTITLE,
    description: 'Comprehensive inspection report covering registered fire safety equipment, field observations, and maintenance status.',
  },
  FIRE_EQUIPMENT_MAINTENANCE_REPORT: {
    code: 'FIRE_EQUIPMENT_MAINTENANCE_REPORT',
    name: 'Fire Equipment Maintenance Report',
    title: 'VIGILAMC FIRE EQUIPMENT MAINTENANCE REPORT',
    subtitle: DEFAULT_REPORT_SUBTITLE,
    description: 'Detailed maintenance and servicing record for fire protection equipment installed at the premises.',
  },
  FIRE_SAFETY_ASSET_REGISTER: {
    code: 'FIRE_SAFETY_ASSET_REGISTER',
    name: 'Fire Safety Asset Register',
    title: 'VIGILAMC FIRE SAFETY ASSET REGISTER',
    subtitle: 'Registered Fire Protection Equipment Inventory, Specifications and Service Schedule.',
    description: 'Complete asset inventory register listing equipment IDs, types, makes, capacities, serial numbers, locations, and due dates.',
  },
  PERIODIC_INSPECTION_REPORT: {
    code: 'PERIODIC_INSPECTION_REPORT',
    name: 'Periodic Inspection Report',
    title: 'VIGILAMC PERIODIC INSPECTION REPORT',
    subtitle: DEFAULT_REPORT_SUBTITLE,
    description: 'Scheduled periodic inspection record documenting condition checks, pressure readings, and field verification.',
  },
  CORRECTIVE_ACTION_REPORT: {
    code: 'CORRECTIVE_ACTION_REPORT',
    name: 'Corrective Action Report',
    title: 'VIGILAMC CORRECTIVE ACTION & DEFECT RECTIFICATION REPORT',
    subtitle: 'Observed Equipment Defects, Severity Classification, Rectification Status and Field Verification.',
    description: 'Dedicated report tracking open and resolved equipment defects, repair actions, and workshop/field rectification.',
  },
  AMC_SERVICE_MAINTENANCE_REPORT: {
    code: 'AMC_SERVICE_MAINTENANCE_REPORT',
    name: 'AMC Service & Maintenance Report',
    title: 'VIGILAMC AMC SERVICE & MAINTENANCE REPORT',
    subtitle: DEFAULT_REPORT_SUBTITLE,
    description: 'Annual Maintenance Contract (AMC) service visit record documenting preventive maintenance and technician verification.',
  },
};

export type JurisdictionCode = 'DELHI' | 'UP_NOIDA' | 'HR_GURUGRAM' | 'GENERAL';

export interface StatutoryFormNotice {
  formCode: string;
  officialName: string;
  legalPurpose: string;
  issuingAuthority: string;
  canAgencyIssueAsGovCertificate: false;
  templateStatus: 'DRAFT / PENDING LEGAL REVIEW';
  notice: string;
}

export interface JurisdictionConfig {
  code: JurisdictionCode;
  label: string;
  state: string;
  cityOrRegion: string;
  department: string;
  reportTemplateName: string;
  primaryOfficialSources: { label: string; url: string }[];
  legalFramework: string[];
  statutoryFormDistinction: string;
  statutoryFormsCatalog: StatutoryFormNotice[];
  referenceFields: {
    certificateLabel: string;
    numberFieldLabel: string;
    issueDateLabel?: string;
    validityDateLabel: string;
    localAuthorityDefault: string;
    procedureNote: string;
  };
}

export const JURISDICTIONS: Record<JurisdictionCode, JurisdictionConfig> = {
  DELHI: {
    code: 'DELHI',
    label: '1. Delhi (NCT of Delhi)',
    state: 'National Capital Territory of Delhi',
    cityOrRegion: 'Delhi',
    department: 'Delhi Fire Service (DFS), Govt. of NCT of Delhi',
    reportTemplateName: 'Delhi AMC Inspection Report',
    primaryOfficialSources: [
      {
        label: 'Delhi Fire Service Act and Rules',
        url: 'https://dfs.delhi.gov.in/dfs/delhi-fire-service-act-and-rules',
      },
      {
        label: 'Delhi Fire Service Official Forms',
        url: 'https://dfs.delhi.gov.in/dfs/forms',
      },
    ],
    legalFramework: [
      'Delhi Fire Service Act, 2007',
      'Delhi Fire Service Rules, 2010 (including applicable amendments through 2025)',
      'Unified Building Bye-Laws for Delhi (UBBL) & National Building Code of India (NBC 2016, Part 4)',
    ],
    statutoryFormDistinction:
      'IMPORTANT STATUTORY FORM DISTINCTION (NCT OF DELHI): Under the Delhi Fire Service Rules, 2010, Delhi Form-B is an Application for Stand-by Duty, and Delhi Form-H is the prescribed Fire Safety Certificate issued by the Director, Delhi Fire Service. This agency-generated Delhi AMC Inspection Report is a private maintenance and inspection record and is NOT a Delhi Form-B or Form-H government certificate.',
    statutoryFormsCatalog: [
      {
        formCode: 'DELHI_FORM_B',
        officialName: 'Delhi Form-B (Application for Stand-by Duty)',
        legalPurpose: 'Application to Delhi Fire Service for deployment of stand-by fire service personnel/appliance.',
        issuingAuthority: 'Applicant to Director, Delhi Fire Service',
        canAgencyIssueAsGovCertificate: false,
        templateStatus: 'DRAFT / PENDING LEGAL REVIEW',
        notice: 'Form-B in Delhi is an Application for Stand-by Duty, NOT a private agency inspection certificate.',
      },
      {
        formCode: 'DELHI_FORM_H',
        officialName: 'Delhi Form-H (Fire Safety Certificate)',
        legalPurpose: 'Prescribed Fire Safety Certificate issued under Rule 35 of the Delhi Fire Service Rules, 2010.',
        issuingAuthority: 'Director, Delhi Fire Service (Govt. of NCT of Delhi)',
        canAgencyIssueAsGovCertificate: false,
        templateStatus: 'DRAFT / PENDING LEGAL REVIEW',
        notice: 'Only the Delhi Fire Service can issue a Form-H Fire Safety Certificate.',
      },
    ],
    referenceFields: {
      certificateLabel: 'Existing Delhi Fire Safety Certificate (Form-H) Reference (If Supplied by Client)',
      numberFieldLabel: 'Fire Safety Certificate (FSC) Ref. No.',
      validityDateLabel: 'FSC Validity Date (As Supplied)',
      localAuthorityDefault: 'Delhi Fire Service / MCD / NDMC / DDA',
      procedureNote:
        'FSC reference details are recorded strictly as supplied by the building management. VigilAMC does not automatically declare or verify that a building holds a valid government Fire Safety Certificate.',
    },
  },
  UP_NOIDA: {
    code: 'UP_NOIDA',
    label: '2. Uttar Pradesh – Noida',
    state: 'Uttar Pradesh',
    cityOrRegion: 'Noida, District Gautam Buddha Nagar',
    department: 'Uttar Pradesh Fire and Emergency Services Department',
    reportTemplateName: 'Noida Inspection & Maintenance Report',
    primaryOfficialSources: [
      {
        label: 'UP Nivesh Mitra Single Window Portal',
        url: 'https://niveshmitra.up.nic.in/',
      },
      {
        label: 'UP Nivesh Mitra Service SOPs',
        url: 'https://niveshmitra.up.nic.in/Default.aspx/ServiceSOP.aspx',
      },
      {
        label: 'UP Fire Department Process Flow (DPF_111)',
        url: 'https://niveshmitra.up.nic.in/Documents/Dept_Process_Flow/DPF_111.pdf',
      },
    ],
    legalFramework: [
      'Uttar Pradesh Fire and Emergency Services Act, 2022 & Applicable Rules',
      'New Okhla Industrial Development Authority (NOIDA) Building Regulations & Bye-Laws',
      'Applicable UP Fire NOC Requirements & National Building Code of India (NBC 2016, Part 4)',
    ],
    statutoryFormDistinction:
      'IMPORTANT NOTICE (UTTAR PRADESH – NOIDA): This Noida Inspection & Maintenance Report documents private AMC equipment inspection and maintenance observations. It is NOT a Fire NOC or government-issued certificate. Official Fire NOCs in Uttar Pradesh must be obtained through the UP Fire and Emergency Services Department via the official Nivesh Mitra portal (https://niveshmitra.up.nic.in/).',
    statutoryFormsCatalog: [
      {
        formCode: 'UP_FIRE_NOC_PORTAL',
        officialName: 'Uttar Pradesh Fire NOC (Nivesh Mitra DPF_111)',
        legalPurpose: 'Grant / Renewal of Fire No Objection Certificate (NOC) by UP Fire & Emergency Services.',
        issuingAuthority: 'Uttar Pradesh Fire and Emergency Services Department (via Nivesh Mitra)',
        canAgencyIssueAsGovCertificate: false,
        templateStatus: 'DRAFT / PENDING LEGAL REVIEW',
        notice: 'Digitally signed government Fire NOCs are issued exclusively via Nivesh Mitra.',
      },
    ],
    referenceFields: {
      certificateLabel: 'Existing UP Fire NOC Reference (If Supplied by Client)',
      numberFieldLabel: 'Fire NOC Reference Number',
      issueDateLabel: 'Fire NOC Issue Date (As Supplied)',
      validityDateLabel: 'Fire NOC Expiry Date (As Supplied)',
      localAuthorityDefault: 'NOIDA Authority / District Gautam Buddha Nagar',
      procedureNote:
        'Fire NOC reference numbers and dates are recorded only if provided by the premises owner/occupier. Government-issued Fire NOCs must be obtained from https://niveshmitra.up.nic.in/.',
    },
  },
  HR_GURUGRAM: {
    code: 'HR_GURUGRAM',
    label: '3. Haryana – Gurugram',
    state: 'Haryana',
    cityOrRegion: 'Gurugram',
    department: 'Haryana Fire and Emergency Services / Directorate of Urban Local Bodies, Haryana',
    reportTemplateName: 'Gurugram Inspection & Maintenance Report',
    primaryOfficialSources: [
      {
        label: 'ULB Haryana Fire Services Portal',
        url: 'https://ulbharyana.gov.in/WebCMS/Start/10572',
      },
      {
        label: 'ULB Haryana Official Fire Downloads',
        url: 'https://ulbharyana.gov.in/Home/FireDownloads',
      },
      {
        label: 'Directorate of Urban Local Bodies Haryana Notification / Guidelines',
        url: 'https://ulbharyana.gov.in/Website/DirectorateofUrbanLocalBodies/Images/2602b04f-cba9-4fef-b3be-32c9c2629d1a.pdf',
      },
    ],
    legalFramework: [
      'Haryana Fire and Emergency Services Act, 2022',
      'Applicable Haryana Fire Service Rules, Amendments & Government Notifications',
      'Haryana Building Code & National Building Code of India (NBC 2016, Part 4)',
    ],
    statutoryFormDistinction:
      'IMPORTANT NOTICE (HARYANA – GURUGRAM): Fire NOC procedures in Haryana depend on building occupancy classification, building height, covered area, local authority (MCG / GMDA / DTCP / HSIIDC / ULB Haryana), and applicable rules under the Haryana Fire and Emergency Services Act, 2022. This Gurugram Inspection & Maintenance Report is an agency maintenance record and does NOT constitute a Haryana Fire NOC or statutory approval.',
    statutoryFormsCatalog: [
      {
        formCode: 'HR_FIRE_NOC_ULB',
        officialName: 'Haryana Fire Fighting Scheme / Fire NOC Application & Renewal',
        legalPurpose: 'Statutory Fire NOC / Renewal issued by Haryana Fire and Emergency Services / ULB Haryana.',
        issuingAuthority: 'Directorate of Fire Services / Urban Local Bodies, Haryana',
        canAgencyIssueAsGovCertificate: false,
        templateStatus: 'DRAFT / PENDING LEGAL REVIEW',
        notice: 'Fire NOC procedures vary by building height, occupancy classification, and local authority.',
      },
    ],
    referenceFields: {
      certificateLabel: 'Existing Haryana Fire NOC Reference (If Supplied by Client)',
      numberFieldLabel: 'Fire NOC Reference Number',
      issueDateLabel: 'Fire NOC Issue Date (As Supplied)',
      validityDateLabel: 'Fire NOC Validity Date (As Supplied)',
      localAuthorityDefault: 'MCG / GMDA / ULB Haryana (Gurugram)',
      procedureNote:
        'Applicable Fire NOC procedure depends on building type, height, occupancy classification, and local authority rules under the Haryana Fire and Emergency Services Act, 2022.',
    },
  },
  GENERAL: {
    code: 'GENERAL',
    label: 'General Inspection Report (All India / Standard)',
    state: 'India',
    cityOrRegion: 'General Jurisdiction',
    department: 'Applicable State / Municipal Fire & Emergency Services Authority',
    reportTemplateName: 'General Fire Safety Inspection & Maintenance Report',
    primaryOfficialSources: [
      {
        label: 'Bureau of Indian Standards (BIS) Official Portal',
        url: 'https://standards.bis.gov.in/',
      },
    ],
    legalFramework: [
      'National Building Code of India (NBC 2016, Part 4 – Fire and Life Safety)',
      'Applicable Bureau of Indian Standards (BIS) Codes of Practice for Fire Protection Equipment',
      'Applicable State Fire Service Act, Rules, and Local Municipal Building Bye-Laws',
    ],
    statutoryFormDistinction:
      'IMPORTANT NOTICE: This report is a private equipment inspection and maintenance record generated from field service data. It is NOT a government-issued Fire NOC, Fire Safety Certificate, or statutory approval.',
    statutoryFormsCatalog: [],
    referenceFields: {
      certificateLabel: 'Existing Fire NOC / Fire Safety Certificate Reference (If Supplied)',
      numberFieldLabel: 'Fire NOC / FSC Reference No.',
      issueDateLabel: 'Issue Date (As Supplied)',
      validityDateLabel: 'Validity / Expiry Date (As Supplied)',
      localAuthorityDefault: 'Local Municipal / Fire Authority',
      procedureNote:
        'Reference details are recorded only if supplied by the client. Statutory certificates must be obtained from the competent government fire authority.',
    },
  },
};

export function detectJurisdictionFromBuilding(building: {
  jurisdictionCode?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
}): JurisdictionCode {
  if (building.jurisdictionCode && building.jurisdictionCode in JURISDICTIONS) {
    return building.jurisdictionCode as JurisdictionCode;
  }
  const combined = `${building.city || ''} ${building.state || ''} ${building.address || ''}`.toLowerCase();
  if (combined.includes('noida') || combined.includes('greater noida') || combined.includes('gautam buddha nagar') || combined.includes('uttar pradesh')) {
    return 'UP_NOIDA';
  }
  if (combined.includes('gurugram') || combined.includes('gurgaon') || combined.includes('manesar') || combined.includes('haryana') || combined.includes('faridabad')) {
    return 'HR_GURUGRAM';
  }
  if (combined.includes('delhi') || combined.includes('new delhi') || combined.includes('okhla') || combined.includes('connaught') || combined.includes('dwarka') || combined.includes('nehru place') || combined.includes('saket') || combined.includes('rohini')) {
    return 'DELHI';
  }
  return 'GENERAL';
}

/**
 * ============================================================================
 * STEP 4 & 5: INDIAN STANDARDS (BIS) & LEGAL REFERENCE DEFINITIONS
 * ============================================================================
 * Updated IS 2190:2024 (Fifth Revision) for portable and mobile first-aid
 * fire extinguishers. Never applies IS 2190 to non-extinguisher systems.
 */
export interface EquipmentStandardMapping {
  categoryCode: string;
  categoryLabel: string;
  standardCode: string;
  title: string;
  revisionOrVersion: string;
  effectiveYear: string;
  officialSourceUrl: string;
  scopeDescription: string;
  verificationStatus: 'VERIFIED_ACTIVE' | 'LEGAL REFERENCE PENDING VERIFICATION';
}

export const EQUIPMENT_CATEGORY_STANDARDS: Record<string, EquipmentStandardMapping> = {
  PORTABLE_EXTINGUISHER: {
    categoryCode: 'PORTABLE_EXTINGUISHER',
    categoryLabel: 'Portable Fire Extinguishers',
    standardCode: 'IS 2190:2024',
    title: 'Selection, Installation and Maintenance of First-Aid Fire Extinguishers — Code of Practice (Fifth Revision)',
    revisionOrVersion: 'Fifth Revision (2024)',
    effectiveYear: '2024',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable strictly to selection, installation, inspection, testing, and maintenance of portable and mobile first-aid fire extinguishers (along with IS 15683:2018 for portable extinguisher manufacturing/performance requirements).',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  WHEELED_EXTINGUISHER: {
    categoryCode: 'WHEELED_EXTINGUISHER',
    categoryLabel: 'Wheeled / Mobile Fire Extinguishers',
    standardCode: 'IS 2190:2024 / IS 16018',
    title: 'Selection, Installation and Maintenance of Portable and Mobile First-Aid Fire Extinguishers (Fifth Revision)',
    revisionOrVersion: 'Fifth Revision (2024)',
    effectiveYear: '2024',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to wheeled/trolley-mounted mobile first-aid fire extinguishers.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  HYDRANT_SYSTEM: {
    categoryCode: 'HYDRANT_SYSTEM',
    categoryLabel: 'Hydrant Systems (Internal & External)',
    standardCode: 'IS 3844:1989 / IS 13039:1991',
    title: 'Code of Practice for Installation and Maintenance of Internal Fire Hydrants and Hose Reels on Premises / External Hydrant Systems',
    revisionOrVersion: 'IS 3844:1989 (Reaffirmed) / IS 13039:1991',
    effectiveYear: '1989 / 1991',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to landing valves (IS 5290), wet risers, down-comers, delivery hoses (IS 636 / IS 8423), branch pipes, and external yard hydrants.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  HOSE_REEL: {
    categoryCode: 'HOSE_REEL',
    categoryLabel: 'First-Aid Hose Reels',
    standardCode: 'IS 884:1985 / IS 3844:1989',
    title: 'Specification for First-Aid Hose-Reel for Fire Fighting / Code of Practice for Internal Fire Hydrants and Hose Reels',
    revisionOrVersion: 'IS 884:1985 / IS 3844:1989',
    effectiveYear: '1985 / 1989',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to swinging/fixed first-aid fire fighting hose reels, tubing (IS 12585), and shut-off nozzles.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  FIRE_ALARM_PANEL: {
    categoryCode: 'FIRE_ALARM_PANEL',
    categoryLabel: 'Fire Alarm & Detection Control Panels',
    standardCode: 'IS 2189:2008 / IS 15908:2011',
    title: 'Selection, Installation and Maintenance of Automatic Fire Detection and Alarm System — Code of Practice (Fourth Revision)',
    revisionOrVersion: 'Fourth Revision (2008)',
    effectiveYear: '2008',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to addressable/conventional fire alarm control panels (FACP), manual call points (MCP), hooters/sounders, and loop wiring.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  SMOKE_DETECTOR: {
    categoryCode: 'SMOKE_DETECTOR',
    categoryLabel: 'Smoke & Heat Detectors',
    standardCode: 'IS 2189:2008',
    title: 'Selection, Installation and Maintenance of Automatic Fire Detection and Alarm System — Code of Practice (Fourth Revision)',
    revisionOrVersion: 'Fourth Revision (2008)',
    effectiveYear: '2008',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to optical smoke detectors, multi-criteria detectors, and rate-of-rise/fixed-temperature heat detectors.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  SPRINKLER_SYSTEM: {
    categoryCode: 'SPRINKLER_SYSTEM',
    categoryLabel: 'Automatic Sprinkler Systems',
    standardCode: 'IS 15105:2021',
    title: 'Design and Installation of Fixed Automatic Sprinkler Fire Extinguishing Systems — Code of Practice (First Revision)',
    revisionOrVersion: 'First Revision (2021)',
    effectiveYear: '2021',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to automatic glass-bulb/fusible-link sprinkler heads, alarm valves, flow switches, and zone control valve assemblies.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  FIRE_PUMP: {
    categoryCode: 'FIRE_PUMP',
    categoryLabel: 'Fire Fighting Pumps & Pump Room Installations',
    standardCode: 'IS 15301 / NBC 2016 Part 4',
    title: 'Installation and Maintenance of Fire Fighting Pumps — Code of Practice & NBC 2016 Part 4 Provisions',
    revisionOrVersion: 'IS 15301 / NBC 2016',
    effectiveYear: '2016',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to main electric fire pump, diesel engine driven standby pump, jockey pump, terrace booster pump, and starting panels.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
  EMERGENCY_LIGHTING: {
    categoryCode: 'EMERGENCY_LIGHTING',
    categoryLabel: 'Emergency Escape Lighting & Exit Signage',
    standardCode: 'IS 9583 / NBC 2016 Part 4',
    title: 'Emergency Lighting Units & NBC 2016 Part 4 Means of Egress Illumination Guidelines',
    revisionOrVersion: 'NBC 2016 Part 4',
    effectiveYear: '2016',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    scopeDescription: 'Applicable to battery-backed emergency luminaires, illuminated exit signage, and escape route lighting.',
    verificationStatus: 'VERIFIED_ACTIVE',
  },
};

export function classifyEquipmentCategory(type?: string | null, capacity?: string | null): string {
  const t = `${type || ''} ${capacity || ''}`.toLowerCase();
  if (t.includes('wheeled') || t.includes('trolley') || t.includes('25kg') || t.includes('25 kg') || t.includes('50kg') || t.includes('50 kg') || t.includes('75kg')) {
    return 'WHEELED_EXTINGUISHER';
  }
  if (
    t.includes('extinguisher') ||
    t.includes('abc') ||
    t.includes('co2') ||
    t.includes('foam') ||
    t.includes('afff') ||
    t.includes('clean agent') ||
    t.includes('fm200') ||
    t.includes('fm-200') ||
    t.includes('water') ||
    t.includes('wet chemical') ||
    t.includes('dcp')
  ) {
    return 'PORTABLE_EXTINGUISHER';
  }
  if (t.includes('hose reel')) {
    return 'HOSE_REEL';
  }
  if (t.includes('hydrant') || t.includes('landing valve') || t.includes('riser') || t.includes('breeching') || t.includes('branch pipe')) {
    return 'HYDRANT_SYSTEM';
  }
  if (t.includes('smoke') || t.includes('heat detector') || t.includes('detector')) {
    return 'SMOKE_DETECTOR';
  }
  if (t.includes('alarm') || t.includes('panel') || t.includes('mcp') || t.includes('call point') || t.includes('hooter') || t.includes('sounder')) {
    return 'FIRE_ALARM_PANEL';
  }
  if (t.includes('sprinkler')) {
    return 'SPRINKLER_SYSTEM';
  }
  if (t.includes('pump') || t.includes('jockey') || t.includes('diesel') || t.includes('booster')) {
    return 'FIRE_PUMP';
  }
  if (t.includes('emergency light') || t.includes('exit sign') || t.includes('luminaire') || t.includes('signage')) {
    return 'EMERGENCY_LIGHTING';
  }
  return 'UNCLASSIFIED';
}

export function getApplicableStandardsForEquipments(equipments: Array<{ type?: string | null; capacity?: string | null }>): EquipmentStandardMapping[] {
  if (!equipments || equipments.length === 0) {
    // ZERO ASSET RULE: Do not attach IS 2190 or any BIS standard when 0 assets are registered
    return [];
  }
  const seenCategories = new Set<string>();
  const mappings: EquipmentStandardMapping[] = [];

  for (const eq of equipments) {
    const cat = classifyEquipmentCategory(eq.type, eq.capacity);
    if (cat !== 'UNCLASSIFIED' && EQUIPMENT_CATEGORY_STANDARDS[cat] && !seenCategories.has(cat)) {
      seenCategories.add(cat);
      mappings.push(EQUIPMENT_CATEGORY_STANDARDS[cat]);
    }
  }

  return mappings;
}

/**
 * ============================================================================
 * STEP 6: COMPLIANCE CALCULATION LOGIC & 7 REPORT STATUSES
 * ============================================================================
 */
export type ReportStatusCode =
  | 'NOT INSPECTED'
  | 'INSPECTION IN PROGRESS'
  | 'INSPECTION COMPLETED'
  | 'INSPECTION COMPLETED - ACTION REQUIRED'
  | 'CORRECTIVE ACTION PENDING'
  | 'CORRECTIVE ACTION COMPLETED'
  | 'INSUFFICIENT DATA';

export const ZERO_ASSET_MESSAGE =
  'No fire safety equipment has been registered in this system for the selected premises. Inspection and compliance status cannot be determined.';

export const INCOMPLETE_INSPECTION_MESSAGE =
  'Inspection Incomplete – Compliance Status Pending.';

export type EquipmentReportStatus =
  | 'OPERATIONAL'
  | 'NON_OPERATIONAL'
  | 'MAINTENANCE_DUE'
  | 'OVERDUE'
  | 'NOT_INSPECTED';

export interface EvaluatedEquipmentItem {
  id: string;
  assetTag: string;
  type: string;
  categoryCode: string;
  categoryLabel: string;
  applicableStandard: string;
  make: string;
  model: string;
  capacity: string;
  serialNumber: string;
  floor: string;
  location: string;
  installDate: string | null;
  lastServiceDate: string | null;
  nextDueDate: string | null;
  refillDueDate: string | null;
  hydroDueDate: string | null;
  inspectionStatus: EquipmentReportStatus;
  statusLabel: string;
  badgeColor: 'green' | 'orange' | 'red' | 'grey';
  hasActualInspectionRecord: boolean;
  hasGPS: boolean;
  latitude: number | null;
  longitude: number | null;
  hasPhoto: boolean;
  photoUrl: string | null;
  latestAuditor: string | null;
  latestRemarks: string | null;
  pressureGauge: string | null;
  overallCondition: string | null;
  openIssuesCount: number;
}

export interface ComplianceCalculationResult {
  reportStatus: ReportStatusCode;
  statusBadgeColor: 'green' | 'orange' | 'red' | 'grey';
  compliancePercentage: number | null;
  statusBannerMessage: string;
  formulaDescription: string;
  counts: {
    totalRegistered: number;
    inspectedCount: number;
    operationalCount: number;
    nonOperationalCount: number;
    maintenanceDueCount: number;
    overdueCount: number;
    notInspectedCount: number;
    openDefectsCount: number;
    resolvedDefectsCount: number;
    gpsVerifiedCount: number;
    photoVerifiedCount: number;
  };
  evaluatedEquipments: EvaluatedEquipmentItem[];
}

export function calculateBuildingCompliance(params: {
  equipments: any[];
  defects?: any[];
  correctiveActions?: any[];
  now?: Date;
}): ComplianceCalculationResult {
  const { equipments = [], defects = [], correctiveActions = [], now = new Date() } = params;
  const totalRegistered = equipments.length;

  const openDefectsFromTable = defects.filter((d) => d.status !== 'RESOLVED' && d.status !== 'CLOSED').length;
  const resolvedDefectsFromTable = defects.filter((d) => d.status === 'RESOLVED' || d.status === 'CLOSED').length;
  const openCorrectiveActions = correctiveActions.filter((ca) => ca.status !== 'VERIFIED' && ca.status !== 'CLOSED').length;
  const resolvedCorrectiveActions = correctiveActions.filter((ca) => ca.status === 'VERIFIED' || ca.status === 'CLOSED').length;

  // ZERO ASSET RULE (Step 6)
  if (totalRegistered === 0) {
    return {
      reportStatus: 'INSUFFICIENT DATA',
      statusBadgeColor: 'grey',
      compliancePercentage: null,
      statusBannerMessage: ZERO_ASSET_MESSAGE,
      formulaDescription: 'Compliance % = (Operational Inspected Assets / Total Registered Assets) × 100. Cannot be calculated when Total Registered Assets = 0.',
      counts: {
        totalRegistered: 0,
        inspectedCount: 0,
        operationalCount: 0,
        nonOperationalCount: 0,
        maintenanceDueCount: 0,
        overdueCount: 0,
        notInspectedCount: 0,
        openDefectsCount: openDefectsFromTable + openCorrectiveActions,
        resolvedDefectsCount: resolvedDefectsFromTable + resolvedCorrectiveActions,
        gpsVerifiedCount: 0,
        photoVerifiedCount: 0,
      },
      evaluatedEquipments: [],
    };
  }

  let inspectedCount = 0;
  let operationalCount = 0;
  let nonOperationalCount = 0;
  let maintenanceDueCount = 0;
  let overdueCount = 0;
  let notInspectedCount = 0;
  let equipmentLevelDefects = 0;
  let gpsVerifiedCount = 0;
  let photoVerifiedCount = 0;

  const evaluatedEquipments: EvaluatedEquipmentItem[] = equipments.map((eq) => {
    const latestInspection = eq.inspections?.[0] || null;
    const latestServiceLog = eq.serviceLogs?.[0] || null;
    const hasActualInspectionRecord = Boolean(latestInspection || latestServiceLog);

    const parsedDue = eq.nextDueDate ? new Date(eq.nextDueDate) : null;
    const nextDue = parsedDue && !isNaN(parsedDue.getTime()) ? parsedDue : null;
    const diffDays = nextDue ? calendarDayDiff(nextDue, now) : null;

    const hasValidGps = Boolean(
      typeof latestInspection?.latitude === 'number' &&
      typeof latestInspection?.longitude === 'number' &&
      !isNaN(latestInspection.latitude) &&
      !isNaN(latestInspection.longitude) &&
      (latestInspection.latitude !== 0 || latestInspection.longitude !== 0)
    );
    if (hasValidGps) gpsVerifiedCount++;

    const firstInspectionPhoto = latestInspection?.inspectionPhotos?.[0]?.photoUrl || null;
    let legacyPhoto: string | null = null;
    if (latestInspection?.photos) {
      try {
        const parsed = JSON.parse(latestInspection.photos);
        if (Array.isArray(parsed) && parsed.length > 0) legacyPhoto = parsed[0];
      } catch {
        if (typeof latestInspection.photos === 'string' && latestInspection.photos.startsWith('http')) {
          legacyPhoto = latestInspection.photos;
        }
      }
    }
    const resolvedPhotoUrl = firstInspectionPhoto || legacyPhoto || eq.photoUrl || null;
    const hasPhoto = Boolean(resolvedPhotoUrl);
    if (hasPhoto) photoVerifiedCount++;

    const openIssuesOnEquipment = Array.isArray(eq.inspectionIssues)
      ? eq.inspectionIssues.filter((iss: any) => iss.status !== 'RESOLVED').length
      : Array.isArray(latestInspection?.issues)
      ? latestInspection.issues.filter((iss: any) => iss.status !== 'RESOLVED').length
      : 0;

    const isExplicitlyDefective =
      eq.status === 'DEFECTIVE' ||
      eq.status === 'SERVICE_REQUIRED' ||
      eq.status === 'REPLACEMENT_REQUIRED' ||
      latestInspection?.status === 'FAILED' ||
      latestInspection?.status === 'SERVICE_REQUIRED' ||
      latestInspection?.status === 'REPLACEMENT_REQUIRED' ||
      latestInspection?.overallCondition === 'DAMAGED' ||
      latestInspection?.overallCondition === 'NEEDS_ATTENTION' ||
      latestInspection?.pressureGauge === 'LOW' ||
      latestInspection?.pressureGauge === 'HIGH' ||
      openIssuesOnEquipment > 0;

    const isOverdueByDate = (diffDays !== null && diffDays < 0) || eq.status === 'OVERDUE';
    const isDueSoonByDate = (diffDays !== null && diffDays >= 0 && diffDays <= 30) || eq.status === 'DUE_SOON';

    let inspectionStatus: EquipmentReportStatus;
    let statusLabel: string;
    let badgeColor: 'green' | 'orange' | 'red' | 'grey';

    if (!hasActualInspectionRecord && !isExplicitlyDefective && !isOverdueByDate) {
      inspectionStatus = 'NOT_INSPECTED';
      statusLabel = 'Not Inspected';
      badgeColor = 'grey';
      notInspectedCount++;
    } else if (isExplicitlyDefective) {
      inspectionStatus = 'NON_OPERATIONAL';
      statusLabel =
        eq.status === 'REPLACEMENT_REQUIRED' || latestInspection?.status === 'REPLACEMENT_REQUIRED'
          ? 'Non-Operational (Replacement Required)'
          : 'Non-Operational / Defect Observed';
      badgeColor = 'red';
      inspectedCount++;
      nonOperationalCount++;
      equipmentLevelDefects += Math.max(1, openIssuesOnEquipment);
    } else if (isOverdueByDate) {
      inspectionStatus = 'OVERDUE';
      statusLabel = diffDays !== null && diffDays < 0 ? `Overdue (${Math.abs(diffDays)}d past due)` : 'Overdue for Service';
      badgeColor = 'red';
      if (hasActualInspectionRecord) inspectedCount++;
      else notInspectedCount++;
      overdueCount++;
    } else if (isDueSoonByDate) {
      inspectionStatus = 'MAINTENANCE_DUE';
      statusLabel = diffDays !== null ? `Maintenance Due (${diffDays}d left)` : 'Maintenance Due Soon';
      badgeColor = 'orange';
      inspectedCount++;
      maintenanceDueCount++;
      operationalCount++; // Operational right now, but due soon
    } else {
      inspectionStatus = 'OPERATIONAL';
      statusLabel = 'Operational (Inspected)';
      badgeColor = 'green';
      inspectedCount++;
      operationalCount++;
    }

    const catCode = classifyEquipmentCategory(eq.type, eq.capacity);
    const stdInfo = EQUIPMENT_CATEGORY_STANDARDS[catCode];

    const actualServiceDate = latestInspection?.date
      ? new Date(latestInspection.date).toISOString()
      : latestServiceLog?.servicedAt
      ? new Date(latestServiceLog.servicedAt).toISOString()
      : null;

    return {
      id: eq.id,
      assetTag: eq.qrCode || eq.id,
      type: eq.type || 'Unspecified Equipment',
      categoryCode: catCode,
      categoryLabel: stdInfo?.categoryLabel || 'Fire Protection Equipment',
      applicableStandard: stdInfo?.standardCode || 'Standard Pending Category Verification',
      make: eq.manufacturer || 'Not Specified',
      model: eq.model || 'Not Specified',
      capacity: eq.capacity || 'Not Specified',
      serialNumber: eq.serialNumber || 'Not Specified',
      floor: eq.floor || 'Not Specified',
      location: eq.location || 'Location Not Specified',
      installDate: eq.installDate ? new Date(eq.installDate).toISOString() : null,
      lastServiceDate: actualServiceDate,
      nextDueDate: nextDue ? nextDue.toISOString() : null,
      refillDueDate: eq.refillDueDate ? new Date(eq.refillDueDate).toISOString() : null,
      hydroDueDate: eq.hydroDueDate ? new Date(eq.hydroDueDate).toISOString() : null,
      inspectionStatus,
      statusLabel,
      badgeColor,
      hasActualInspectionRecord,
      hasGPS: hasValidGps,
      latitude: hasValidGps ? latestInspection.latitude : null,
      longitude: hasValidGps ? latestInspection.longitude : null,
      hasPhoto,
      photoUrl: resolvedPhotoUrl,
      latestAuditor: hasActualInspectionRecord
        ? sanitizeTechnicianName(latestInspection?.technician?.fullName || latestInspection?.technicianName || latestServiceLog?.technicianName)
        : null,
      latestRemarks: latestInspection?.remarks || latestServiceLog?.notes || null,
      pressureGauge: hasActualInspectionRecord ? latestInspection?.pressureGauge || null : null,
      overallCondition: hasActualInspectionRecord ? latestInspection?.overallCondition || null : null,
      openIssuesCount: openIssuesOnEquipment,
    };
  });

  const totalOpenDefects = Math.max(openDefectsFromTable + openCorrectiveActions, nonOperationalCount, equipmentLevelDefects);
  const totalResolvedDefects = resolvedDefectsFromTable + resolvedCorrectiveActions;

  // Determine the 7 Report Statuses (Step 6)
  let reportStatus: ReportStatusCode;
  let statusBadgeColor: 'green' | 'orange' | 'red' | 'grey';
  let statusBannerMessage: string;
  let compliancePercentage: number | null = null;

  if (inspectedCount === 0) {
    reportStatus = 'NOT INSPECTED';
    statusBadgeColor = 'grey';
    compliancePercentage = null;
    statusBannerMessage = `${INCOMPLETE_INSPECTION_MESSAGE} 0 of ${totalRegistered} registered assets have documented field inspections.`;
  } else if (notInspectedCount > 0) {
    reportStatus = 'INSPECTION IN PROGRESS';
    statusBadgeColor = 'orange';
    compliancePercentage = Math.round((operationalCount / totalRegistered) * 100);
    statusBannerMessage = `${INCOMPLETE_INSPECTION_MESSAGE} ${inspectedCount} of ${totalRegistered} assets inspected (${notInspectedCount} asset(s) not yet inspected).${
      totalOpenDefects > 0 || overdueCount > 0
        ? ` ${nonOperationalCount} non-operational asset(s) and ${overdueCount} overdue asset(s) require attention.`
        : ''
    }`;
  } else if (openCorrectiveActions > 0) {
    reportStatus = 'CORRECTIVE ACTION PENDING';
    statusBadgeColor = 'red';
    compliancePercentage = Math.round((operationalCount / totalRegistered) * 100);
    statusBannerMessage = `All ${totalRegistered} registered assets have been inspected. ${openCorrectiveActions} corrective action(s) / defect rectification(s) are currently pending resolution.`;
  } else if (nonOperationalCount > 0 || overdueCount > 0 || totalOpenDefects > 0) {
    reportStatus = 'INSPECTION COMPLETED - ACTION REQUIRED';
    statusBadgeColor = 'red';
    compliancePercentage = Math.round((operationalCount / totalRegistered) * 100);
    statusBannerMessage = `Inspection completed across ${totalRegistered} registered asset(s). Action required: ${nonOperationalCount} non-operational asset(s), ${overdueCount} overdue asset(s), and ${totalOpenDefects} open defect observation(s).`;
  } else if (totalResolvedDefects > 0 && totalOpenDefects === 0 && nonOperationalCount === 0 && overdueCount === 0) {
    reportStatus = 'CORRECTIVE ACTION COMPLETED';
    statusBadgeColor = 'green';
    compliancePercentage = Math.round((operationalCount / totalRegistered) * 100);
    statusBannerMessage = `All ${totalRegistered} registered assets inspected and operational. ${totalResolvedDefects} previously recorded corrective action(s) have been resolved and verified.`;
  } else {
    reportStatus = 'INSPECTION COMPLETED';
    statusBadgeColor = maintenanceDueCount > 0 ? 'orange' : 'green';
    compliancePercentage = Math.round((operationalCount / totalRegistered) * 100);
    statusBannerMessage =
      maintenanceDueCount > 0
        ? `All ${totalRegistered} registered assets have been inspected and are currently operational (${maintenanceDueCount} asset(s) due for scheduled maintenance within 30 days).`
        : `All ${totalRegistered} registered assets have been inspected and found operational during the documented field inspection.`;
  }

  return {
    reportStatus,
    statusBadgeColor,
    compliancePercentage,
    statusBannerMessage,
    formulaDescription:
      'Operational Readiness % = (Operational Inspected Assets ÷ Total Registered Assets) × 100. Uninspected, non-operational, or overdue assets are excluded from the operational numerator. Compliance percentage is withheld (N/A) when 0 assets are registered or 0 assets have been inspected.',
    counts: {
      totalRegistered,
      inspectedCount,
      operationalCount,
      nonOperationalCount,
      maintenanceDueCount,
      overdueCount,
      notInspectedCount,
      openDefectsCount: totalOpenDefects,
      resolvedDefectsCount: totalResolvedDefects,
      gpsVerifiedCount,
      photoVerifiedCount,
    },
    evaluatedEquipments,
  };
}

/**
 * ============================================================================
 * STEP 7 & 8: AGENCY & TECHNICIAN CREDENTIAL SANITIZATION
 * ============================================================================
 * Removes all hardcoded/invented license numbers (e.g. DL/FIRE/LIC/2026/042,
 * DL/FIRE/LIC/2022/A-412, DL/FIRE/LIC/PENDING) and prohibited auto-assigned
 * auditor titles (e.g. Chief Fire Safety Auditor, ISI/NBC Certified Auditor).
 */
const BANNED_FAKE_LICENSES = new Set([
  'dl/fire/lic/2026/042',
  'dl/fire/lic/2022/a-412',
  'dl/fire/lic/pending',
  'lic-pending',
  'govt-lic-001',
]);

const BANNED_AUTO_TITLES = [
  'chief fire safety auditor',
  'certified fire safety auditor',
  'isi certified technician',
  'nbc certified auditor',
  'isi/nbc certified auditor',
  'chief fire safety officer',
  'chief fire safety engineer',
  'govt. licensed auditor',
];

export type CredentialVerificationStatus =
  | 'NOT_PROVIDED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export interface SanitizedAgencyCredentials {
  legalName: string;
  businessAddress: string;
  phone: string;
  email: string;
  gstin: string | null;
  licenseNumber: string | null;
  issuingAuthority: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  verificationStatus: CredentialVerificationStatus;
  verificationStatusLabel: string;
  isLicenseVerified: boolean;
  signatoryName: string | null;
  signatoryDesignation: string | null;
  signatorySignatureUrl: string | null;
  brandLogoUrl: string | null;
}

export function sanitizeAgencyCredentials(
  org: any,
  agencyCredRecord?: any | null
): SanitizedAgencyCredentials {
  const rawLicense = (agencyCredRecord?.licenseNumber ?? org?.licenseNumber ?? '').trim();
  const isFakeLicense = !rawLicense || BANNED_FAKE_LICENSES.has(rawLicense.toLowerCase());
  const cleanLicense = isFakeLicense ? null : rawLicense;

  let verificationStatus: CredentialVerificationStatus = 'NOT_PROVIDED';
  if (agencyCredRecord?.verificationStatus) {
    verificationStatus = agencyCredRecord.verificationStatus as CredentialVerificationStatus;
  } else if (cleanLicense) {
    verificationStatus = 'PENDING_VERIFICATION';
  }

  // Check expiry if verified
  if (agencyCredRecord?.expiryDate && new Date(agencyCredRecord.expiryDate).getTime() < Date.now()) {
    verificationStatus = 'EXPIRED';
  }

  const statusLabels: Record<CredentialVerificationStatus, string> = {
    NOT_PROVIDED: 'Not Provided',
    PENDING_VERIFICATION: 'Submitted — Pending Admin Verification',
    VERIFIED: 'Verified Credential on File',
    REJECTED: 'Credential Verification Rejected',
    EXPIRED: 'License Expired',
  };

  const rawDesignation = (org?.signatoryDesignation || '').trim();
  const isBannedDesignation = BANNED_AUTO_TITLES.some((b) => rawDesignation.toLowerCase().includes(b));

  return {
    legalName: agencyCredRecord?.legalName || org?.name || 'Service Agency',
    businessAddress: agencyCredRecord?.businessAddress || org?.address || 'Address Not Provided',
    phone: org?.phone || 'Not Provided',
    email: org?.email || 'Not Provided',
    gstin: agencyCredRecord?.gstin || org?.gstin || null,
    licenseNumber: cleanLicense,
    issuingAuthority: agencyCredRecord?.issuingAuthority || null,
    issueDate: agencyCredRecord?.issueDate ? new Date(agencyCredRecord.issueDate).toISOString() : null,
    expiryDate: agencyCredRecord?.expiryDate ? new Date(agencyCredRecord.expiryDate).toISOString() : null,
    verificationStatus,
    verificationStatusLabel: statusLabels[verificationStatus] || 'Not Provided',
    isLicenseVerified: verificationStatus === 'VERIFIED' && Boolean(cleanLicense),
    signatoryName: org?.signatoryName || org?.contactPerson || null,
    signatoryDesignation: isBannedDesignation ? 'Authorized Agency Representative' : rawDesignation || 'Authorized Agency Representative',
    signatorySignatureUrl: org?.signatorySignatureUrl || null,
    brandLogoUrl: org?.brandLogoUrl || null,
  };
}

export function sanitizeTechnicianName(name?: string | null): string {
  if (!name || !name.trim()) return 'Field Service Technician';
  return name.trim();
}

export function sanitizeTechnicianDesignation(designation?: string | null, isVerified?: boolean): string {
  if (!designation || !designation.trim()) return 'Field Service Technician';
  const lower = designation.trim().toLowerCase();
  if (BANNED_AUTO_TITLES.some((b) => lower.includes(b)) && !isVerified) {
    return 'Field Service Technician';
  }
  return designation.trim();
}

/**
 * ============================================================================
 * STEP 10: PERMANENT LEGAL DISCLAIMER (VERBATIM)
 * ============================================================================
 */
export const PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS: string[] = [
  'This report is generated through the VigilAMC platform based on equipment records, inspection checklists, maintenance logs, photographs and field inputs recorded by the servicing fire safety agency and/or assigned technician.',
  'This document is an inspection and maintenance report only.',
  'It does not constitute a Fire Safety Certificate, Fire NOC, statutory government approval or regulatory clearance issued by any Fire Service Department, Municipal Authority, Urban Local Body or Government Agency unless issued directly by the competent authority through the official government process.',
  'Building owners, occupiers and facility managers remain responsible for obtaining and maintaining all required statutory approvals, Fire NOCs, Fire Safety Certificates and periodic renewals required under applicable law.',
  'Agency license numbers, technician qualifications and statutory references shown in this report are based on submitted records and applicable reference frameworks.',
  'Verification of this report confirms that the document was generated on the VigilAMC platform and reflects the recorded inspection data as of the stated timestamp.',
];

export const PERMANENT_LEGAL_DISCLAIMER_TEXT = PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS.join('\n\n');

/**
 * Compute deterministic SHA-256 record integrity hash for a report payload
 */
export function computeReportIntegrityHash(payload: {
  reportReferenceId: string;
  buildingId: string;
  generatedAtIso: string;
  totalRegistered: number;
  operationalCount: number;
  nonOperationalCount: number;
  notInspectedCount: number;
  inspectionStatus: string;
}): string {
  const canonical = JSON.stringify(payload);
  return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 24).toUpperCase();
}

/**
 * Default seed legal references for Delhi, Noida (Uttar Pradesh), and Gurugram (Haryana)
 * plus BIS standards (IS 2190:2024, etc.)
 */
export const DEFAULT_LEGAL_REFERENCES = [
  {
    jurisdictionCode: 'DELHI',
    state: 'National Capital Territory of Delhi',
    city: 'Delhi',
    department: 'Delhi Fire Service (DFS)',
    actName: 'Delhi Fire Service Act, 2007 & Delhi Fire Service Rules, 2010',
    ruleNumber: 'Rules 33, 35, 37 & Form-B (Stand-by Duty) / Form-H (Fire Safety Certificate)',
    notificationNumber: 'DFS Rules 2010 (with applicable amendments up to 2025)',
    applicableStandard: 'NBC 2016 Part 4 / IS 2190:2024',
    equipmentCategory: 'GENERAL',
    officialSourceUrl: 'https://dfs.delhi.gov.in/dfs/delhi-fire-service-act-and-rules',
    version: '2010 / 2025 Rev',
    currentStatus: 'VERIFIED_ACTIVE',
    verificationNotes: 'Verified against official Delhi Fire Service portal (https://dfs.delhi.gov.in/dfs/forms). Form-B is Application for Stand-by Duty; Form-H is Fire Safety Certificate.',
    verifiedBy: 'System Compliance Audit',
    approvalStatus: 'APPROVED',
  },
  {
    jurisdictionCode: 'UP_NOIDA',
    state: 'Uttar Pradesh',
    city: 'Noida (Gautam Buddha Nagar)',
    department: 'Uttar Pradesh Fire and Emergency Services Department',
    actName: 'Uttar Pradesh Fire and Emergency Services Act, 2022 & Nivesh Mitra SOP (DPF_111)',
    ruleNumber: 'Service SOP DPF_111 (Fire NOC Grant / Renewal)',
    notificationNumber: 'UP Fire & Emergency Services Act 2022',
    applicableStandard: 'NBC 2016 Part 4 / NOIDA Building Bye-Laws',
    equipmentCategory: 'GENERAL',
    officialSourceUrl: 'https://niveshmitra.up.nic.in/Documents/Dept_Process_Flow/DPF_111.pdf',
    version: '2022 / Current SOP',
    currentStatus: 'VERIFIED_ACTIVE',
    verificationNotes: 'Verified against UP Nivesh Mitra official portal (https://niveshmitra.up.nic.in/). Official Fire NOCs are issued exclusively via Nivesh Mitra.',
    verifiedBy: 'System Compliance Audit',
    approvalStatus: 'APPROVED',
  },
  {
    jurisdictionCode: 'HR_GURUGRAM',
    state: 'Haryana',
    city: 'Gurugram',
    department: 'Haryana Fire and Emergency Services / Directorate of Urban Local Bodies, Haryana',
    actName: 'Haryana Fire and Emergency Services Act, 2022 & Haryana Building Code',
    ruleNumber: 'ULB Haryana Fire Service Rules & Notifications',
    notificationNumber: 'Haryana Act No. 19 of 2022',
    applicableStandard: 'NBC 2016 Part 4 / Haryana Building Code',
    equipmentCategory: 'GENERAL',
    officialSourceUrl: 'https://ulbharyana.gov.in/WebCMS/Start/10572',
    version: '2022',
    currentStatus: 'VERIFIED_ACTIVE',
    verificationNotes: 'Verified against Directorate of Urban Local Bodies Haryana official portal (https://ulbharyana.gov.in/Home/FireDownloads).',
    verifiedBy: 'System Compliance Audit',
    approvalStatus: 'APPROVED',
  },
  {
    jurisdictionCode: 'GENERAL',
    state: 'All India',
    city: 'All Cities',
    department: 'Bureau of Indian Standards (BIS)',
    actName: 'IS 2190:2024 — Selection, Installation and Maintenance of First-Aid Fire Extinguishers',
    ruleNumber: 'IS 2190:2024 (Fifth Revision)',
    notificationNumber: 'BIS CED 22 (Fire Fighting Sectional Committee)',
    applicableStandard: 'IS 2190:2024',
    equipmentCategory: 'PORTABLE_EXTINGUISHER',
    officialSourceUrl: 'https://standards.bis.gov.in/',
    version: 'Fifth Revision (2024)',
    currentStatus: 'VERIFIED_ACTIVE',
    verificationNotes: 'Supersedes IS 2190:2010. Applies strictly to portable and mobile first-aid fire extinguishers.',
    verifiedBy: 'System Compliance Audit',
    approvalStatus: 'APPROVED',
  },
  {
    jurisdictionCode: 'GENERAL',
    state: 'Pending State / Municipal Rule',
    city: 'Unverified Local Jurisdiction',
    department: 'State Fire Service Department',
    actName: 'Unverified Municipal Fire Bye-Law Draft Reference',
    ruleNumber: 'Draft Rule (Unverified)',
    notificationNumber: 'Pending Notification',
    applicableStandard: 'Pending Verification',
    equipmentCategory: 'GENERAL',
    officialSourceUrl: '',
    version: 'Draft',
    currentStatus: 'LEGAL REFERENCE PENDING VERIFICATION',
    verificationNotes: 'Rule source has not yet been verified by an authorized administrator. Remains inactive until approved.',
    verifiedBy: null,
    approvalStatus: 'PENDING_REVIEW',
  },
];

export function normalizeLegalReferenceInput(input: {
  state: string;
  city?: string;
  department: string;
  actName: string;
  ruleNumber?: string;
  officialSourceUrl?: string;
  verifiedBy?: string | null;
  approvalStatus?: string | null;
}) {
  const isApproved = input.approvalStatus === 'APPROVED' && Boolean(input.verifiedBy) && Boolean(input.officialSourceUrl);
  return {
    ...input,
    currentStatus: isApproved ? 'VERIFIED_ACTIVE' : 'LEGAL REFERENCE PENDING VERIFICATION',
    approvalStatus: isApproved ? 'APPROVED' : 'PENDING_REVIEW',
    isActiveInReports: isApproved,
  };
}

