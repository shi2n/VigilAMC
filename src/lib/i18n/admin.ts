/**
 * admin.ts — Admin Dashboard Internationalization
 * Supports ALL 22 8th Schedule Indian Languages + English
 * Complete dictionaries for top Indian languages with automatic per-key fallback.
 */

export interface IndianLanguageMeta {
  code: string;
  name: string; // English name
  nativeName: string; // Native script
  script: string;
  bcp47: string;
}

export const ALL_INDIAN_LANGUAGES: IndianLanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', bcp47: 'en-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', bcp47: 'hi-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', bcp47: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', bcp47: 'gu-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', bcp47: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', bcp47: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', bcp47: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', bcp47: 'ml-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', bcp47: 'bn-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', bcp47: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', bcp47: 'or-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', bcp47: 'as-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', bcp47: 'ur-IN' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', bcp47: 'sa-IN' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', bcp47: 'kok-IN' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', bcp47: 'mai-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', bcp47: 'ne-NP' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी / سنڌي', script: 'Devanagari/Arabic', bcp47: 'sd-IN' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر', script: 'Arabic/Devanagari', bcp47: 'ks-IN' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', bcp47: 'doi-IN' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', script: 'Bengali/Meitei', bcp47: 'mni-IN' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', bcp47: 'sat-IN' },
  { code: 'brx', name: 'Bodo', nativeName: 'बर\'', script: 'Devanagari', bcp47: 'brx-IN' },
];

export interface AdminDictionary {
  // Navigation
  navOverview: string;
  navClients: string;
  navEquipment: string;
  navInspections: string;
  navFieldTeam: string;
  navReports: string;
  navSettings: string;
  navGuide: string;

  // Attention Digest
  digestTitle: string;
  digestSubtitle: string;
  digestAllClear: string;
  digestAllClearDesc: string;
  digestOverdueChecks: string;
  digestExpiringAssets: string;
  digestUnassignedJobs: string;
  digestPendingSyncs: string;
  digestNewFeedback: string;
  digestOpenLink: string;
  digestDismiss: string;
  digestShowAll: string;

  // KPIs
  kpiTotalClients: string;
  kpiTotalBuildings: string;
  kpiTotalEquipment: string;
  kpiActiveTechs: string;
  kpiOpenRepairs: string;
  kpiOverdueChecks: string;
  kpiDueSoon: string;
  kpiComplianceRate: string;

  // Velocity Chart
  chartTitle: string;
  chartSubtitle: string;
  chartEmptyState: string;
  chartSeriesInspections: string;
  chartSeriesCompliance: string;
  chartSeriesRepairs: string;
  chartSeriesAssets: string;
  range7D: string;
  range30D: string;
  range90D: string;
  range12M: string;
  deltaVsPrior: string;

  // View Subtitles & Help
  inspectionsSubtitle: string;
  repairsSubtitle: string;
  filterAll: string;
  filterPassed: string;
  filterActionNeeded: string;
  filterOverdue: string;
  statusOpen: string;
  statusAssigned: string;
  statusInProgress: string;
  statusCompleted: string;
  statusCancelled: string;

  // Field Team
  techActive: string;
  techBlocked: string;
  techSystematicId: string;
  techPin: string;
  techViewActivity: string;
  techActivityTitle: string;
  techLastSeen: string;
  techTasksCompleted: string;
  techPendingSyncs: string;
  techNotifyWhatsApp: string;
  techBulkSelect: string;
  techSetActive: string;
  techSetBlocked: string;

  // Common Actions
  actionRegister: string;
  actionAddClient: string;
  actionAddBuilding: string;
  actionSave: string;
  actionCancel: string;
  actionSaving: string;
  actionExport: string;
  actionImport: string;

  // Guide
  guideTitle: string;
  guideSubtitle: string;
  guideChecklistTitle: string;
  guideChecklistDesc: string;
  guideGoTo: string;
  guideDismiss: string;
  guideInviteTechDesc: string;
  guidePlayStoreLink: string;
  techSuccessPlayCopy: string;
  techPlayStoreHint: string;
  // Welcome Testing Modal
  welcomeEyebrow: string;
  welcomeHeading: string;
  welcomeHeadingFallback: string;
  welcomeBody: string;
  welcomeAgencyFallback: string;
  welcomeBullet1: string;
  welcomeBullet2: string;
  welcomeBullet3: string;
  welcomeCta: string;
  welcomeCloseAria: string;
  welcomeFooter: string;
  // Account Deletion Requests
  deletionRequestedBadge: string;
  deletionRequestsPanelTitle: string;
  deletionRequestsPanelSubtitle: string;
  deletionColStaff: string;
  deletionColRequested: string;
  deletionColRecords: string;
  deletionColActions: string;
  btnApproveDeletion: string;
  confirmDeletionTitle: string;
  confirmDeletionMessage: string;
  deletionApprovedSuccess: string;
  noPendingDeletionRequests: string;
  // Excel Import Guide & Templates
  importHowToButton: string;
  importHowToTitle: string;
  importStep1: string;
  importStep2: string;
  importStep3: string;
  importStep4: string;
  importStep5: string;
  importStep6: string;
  importFieldRulesTitle: string;
  importCommonIssuesTitle: string;
  importIssueAutoMatch: string;
  importIssueDuplicates: string;
  importIssueLimits: string;
  importSupportLine: string;
  importDownloadExcelTemplate: string;
  importDownloadCsvTemplate: string;
  importRequiredUnmappedError: string;
  importOptionalUnmappedHint: string;
  importTotalRowsDetected: string;
  // Module A — Inspection Approval Queue
  approvalsTabTitle: string;
  approvalsQueueTitle: string;
  approvalsQueueSubtitle: string;
  approvalsApproveBtn: string;
  approvalsBulkApproveBtn: string;
  approvalsReturnBtn: string;
  approvalsReturnModalTitle: string;
  approvalsReturnNoteLabel: string;
  approvalsReturnConfirmBtn: string;
  approvalsFlagFindingBtn: string;
  approvalsEmptyTitle: string;
  approvalsEmptyDesc: string;
  approvalsAwaitingChip: string;
  // Module B — Corrective Action (Findings) Board
  findingsTabTitle: string;
  findingsBoardTitle: string;
  findingsBoardSubtitle: string;
  findingsNewBtn: string;
  findingsSendWorkshopBtn: string;
  findingsCloseConfirmTitle: string;
  findingsCloseNoteLabel: string;
  findingsAgeOpen: string;
  findingsDigestEscalation: string;
  // Module C — Compliance Cycles + Auto Work Orders
  cyclesTabTitle: string;
  cyclesConfigTitle: string;
  cyclesConfigSubtitle: string;
  cyclesAutoToggleLabel: string;
  cyclesAutoToggleDesc: string;
  cyclesLeadTimeLabel: string;
  cyclesRunNowBtn: string;
  cyclesAutoScheduledBadge: string;
  // Module D — Expiry Radar + Schedule Visit
  radarTabTitle: string;
  radarTitle: string;
  radarSubtitle: string;
  radarSummaryStrip: string;
  radarScheduleVisitBtn: string;
  radarScheduledBadge: string;
  // Module E — Client Portfolio Rollup
  portfolioTabTitle: string;
  portfolioTitle: string;
  portfolioSubtitle: string;
  portfolioExpiringChip: string;
  // Module F — Asset Service Dates + Monthly Register Export
  registerExportBtn: string;
  registerColLastService: string;
  registerColNextService: string;
  registerColNextHydro: string;
  // Module G — White-Label Report Branding
  brandingTabTitle: string;
  brandingTitle: string;
  brandingSubtitle: string;
  brandingLogoLabel: string;
  brandingSignatoryNameLabel: string;
  brandingSignatoryDesigLabel: string;
  brandingSignatureImgLabel: string;
  brandingFooterLabel: string;
  // Module H — Floor-Plan Pins
  floorPlansBtn: string;
  floorPlansTitle: string;
  floorPlansSubtitle: string;
  floorPlansUploadBtn: string;
  floorPlansClickHint: string;
  // Client Portal & Public Verification
  portalNavTab: string;
  portalInviteTitle: string;
  portalInviteSubtitle: string;
  portalInviteBtn: string;
  portalCopyLinkBtn: string;
  portalLinkCopiedToast: string;
  portalUsersTableTitle: string;
  portalReceiptsTabTitle: string;
  portalRevokeBtn: string;
  portalRestoreBtn: string;
  portalPublicVerifyToggleLabel: string;
  portalMasterToggleLabel: string;
  portalAcknowledgedBadge: string;
}

const DICTIONARY_EN: AdminDictionary = {
  navOverview: 'Overview',
  navClients: 'Clients & Sites',
  navEquipment: 'Fire Equipment',
  navInspections: 'Inspections & Work',
  navFieldTeam: 'Field Team & Technicians',
  navReports: 'Compliance Reports',
  navSettings: 'Agency Settings',
  navGuide: 'Getting Started Guide',

  digestTitle: 'Needs Your Attention Today',
  digestSubtitle: 'Prioritized live alerts requiring operational action',
  digestAllClear: 'Nothing urgent — you are on top of it 🎯',
  digestAllClearDesc: 'All client sites, inspections, and work orders are fully up to date.',
  digestOverdueChecks: 'overdue inspections across {count} buildings',
  digestExpiringAssets: 'fire assets expiring or overdue within 30 days',
  digestUnassignedJobs: 'unassigned or overdue repair work orders',
  digestPendingSyncs: 'technician field submissions pending sync',
  digestNewFeedback: 'new customer enquiries / feedback received',
  digestOpenLink: 'Open →',
  digestDismiss: 'Dismiss',
  digestShowAll: 'Show all alerts',

  kpiTotalClients: 'Client Societies',
  kpiTotalBuildings: 'Buildings & Towers',
  kpiTotalEquipment: 'Fire Assets',
  kpiActiveTechs: 'Active Field Technicians',
  kpiOpenRepairs: 'Open Repairs',
  kpiOverdueChecks: 'Overdue Checks',
  kpiDueSoon: 'Due Soon (30d)',
  kpiComplianceRate: 'Compliance Rate',

  chartTitle: 'Compliance & Field Velocity Trend',
  chartSubtitle: 'Live operational metrics derived directly from verified field visits',
  chartEmptyState: 'Data appears after your first inspections are logged.',
  chartSeriesInspections: 'Field Inspections',
  chartSeriesCompliance: 'Compliance Rate',
  chartSeriesRepairs: 'Work Orders Closed',
  chartSeriesAssets: 'Assets Covered',
  range7D: '7 Days',
  range30D: '30 Days',
  range90D: '90 Days',
  range12M: '12 Months',
  deltaVsPrior: 'vs prior period',

  inspectionsSubtitle: 'Every inspection your technicians completed on-site — results, photos, and proof of visit.',
  repairsSubtitle: 'Jobs raised from failed inspections or maintenance requests — assign, track, and close them.',
  filterAll: 'All',
  filterPassed: 'Passed',
  filterActionNeeded: 'Action Needed',
  filterOverdue: 'Overdue',
  statusOpen: 'Open',
  statusAssigned: 'Assigned',
  statusInProgress: 'In Progress',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',

  techActive: 'Active',
  techBlocked: 'Blocked',
  techSystematicId: 'Technician ID (Username)',
  techPin: 'Login PIN',
  techViewActivity: 'View activity',
  techActivityTitle: 'Technician Field Activity & Audit',
  techLastSeen: 'Last Seen / Synced',
  techTasksCompleted: 'Checks Completed',
  techPendingSyncs: 'Unsynced Items',
  techNotifyWhatsApp: 'Notify via WhatsApp',
  techBulkSelect: 'selected',
  techSetActive: 'Set Active',
  techSetBlocked: 'Set Blocked',

  actionRegister: 'Register Building',
  actionAddClient: 'Add Client Society',
  actionAddBuilding: 'Add Building',
  actionSave: 'Save Changes',
  actionCancel: 'Cancel',
  actionSaving: 'Saving...',
  actionExport: 'Export Excel',
  actionImport: 'Import Excel',

  guideTitle: 'VigilAMC Platform Guide',
  guideSubtitle: 'Everything you need to manage fire AMC compliance efficiently',
  guideChecklistTitle: 'Welcome to VigilAMC — Setup Checklist',
  guideChecklistDesc: 'Complete these quick steps to get your fire agency running smoothly.',
  guideGoTo: 'Go to section →',
  guideDismiss: 'Skip for now',
  guideInviteTechDesc: 'Technicians install VigilAMC Field from Google Play and sign in with the credentials you create here',
  guidePlayStoreLink: 'Get on Google Play',
  techSuccessPlayCopy: 'Share these credentials — the technician signs in on the VigilAMC Field Android app (Google Play).',
  techPlayStoreHint: 'Technicians sign in on the VigilAMC Field Android app (Google Play).',
  welcomeEyebrow: '🎉 FREE TESTING ACCESS',
  welcomeHeading: 'Welcome, {firstName}!',
  welcomeHeadingFallback: 'Welcome to VigilAMC!',
  welcomeBody: 'Great to have {agency} onboard. VigilAMC is in active testing — your account gets FULL FREE ACCESS to every feature during this testing period. Some things may still evolve; your feedback helps us shape the product.',
  welcomeAgencyFallback: 'your workspace',
  welcomeBullet1: 'Add your buildings & fire equipment',
  welcomeBullet2: 'Invite technicians to the VigilAMC Field Android app (Google Play)',
  welcomeBullet3: 'Build your first compliance report',
  welcomeCta: 'Start exploring',
  welcomeCloseAria: 'Close welcome dialog',
  welcomeFooter: 'Questions or feedback? vigilamc@gmail.com',

  // Account Deletion Requests
  deletionRequestedBadge: 'Deletion requested',
  deletionRequestsPanelTitle: 'Account Deletion Requests',
  deletionRequestsPanelSubtitle: 'Field staff deletion requests under DPDP Act 2023 (7-day compliance window)',
  deletionColStaff: 'Staff Member',
  deletionColRequested: 'Requested On',
  deletionColRecords: 'Statutory Records',
  deletionColActions: 'Action',
  btnApproveDeletion: 'Approve & Anonymize',
  confirmDeletionTitle: 'Permanently Anonymize Staff Account?',
  confirmDeletionMessage: 'This action is PERMANENT and cannot be undone. The technician\'s login access, mobile number, and personal details will be irreversibly anonymized. Statutory fire safety inspection records and photos are preserved per Indian compliance.',
  deletionApprovedSuccess: 'Staff account successfully anonymized',
  noPendingDeletionRequests: 'No pending account deletion requests.',
  // Excel Import Guide & Templates
  importHowToButton: '❓ How to import',
  importHowToTitle: 'How to Import Your Agency Data (6 Steps)',
  importStep1: 'Download the template (.xlsx or .csv) for your record type.',
  importStep2: 'Fill your rows in Excel or Google Sheets (keep headers unchanged).',
  importStep3: 'Upload your saved .xlsx, .xls, or .csv file.',
  importStep4: 'Check or auto-adjust column mapping on the mapping screen.',
  importStep5: 'Click Verify & Preview to validate formats and inspect rows.',
  importStep6: 'Import (existing duplicates are automatically protected).',
  importFieldRulesTitle: 'Per-Type Field Rules & Accepted Formats',
  importCommonIssuesTitle: 'Common Issues & File Limits',
  importIssueAutoMatch: 'Header names are auto-matched — rename only if unmatched.',
  importIssueDuplicates: 'Duplicate rows are skipped and counted automatically by default.',
  importIssueLimits: 'Max file size: 10 MB (.xlsx, .xls, .csv) • Processed in chunks of 100 rows (handles 500 to 20,000+ rows).',
  importSupportLine: 'Stuck? vigilamc@gmail.com',
  importDownloadExcelTemplate: 'Download Excel template',
  importDownloadCsvTemplate: 'Download CSV template',
  importRequiredUnmappedError: '{field} is required — map a spreadsheet column to it',
  importOptionalUnmappedHint: 'will be left empty',
  importTotalRowsDetected: 'Total Rows Detected:',
  // Module A — Inspection Approval Queue
  approvalsTabTitle: 'Approvals',
  approvalsQueueTitle: 'Inspection Approval Queue',
  approvalsQueueSubtitle: 'Review submitted field inspections before they appear in official Form-B compliance reports.',
  approvalsApproveBtn: 'Approve',
  approvalsBulkApproveBtn: 'Approve Selected',
  approvalsReturnBtn: 'Return with note',
  approvalsReturnModalTitle: 'Return Inspection to Technician',
  approvalsReturnNoteLabel: 'Return Reason / Correction Note (Required)',
  approvalsReturnConfirmBtn: 'Confirm Return',
  approvalsFlagFindingBtn: 'Flag finding',
  approvalsEmptyTitle: 'All Caught Up — Zero Pending Approvals',
  approvalsEmptyDesc: 'Every submitted field inspection has been reviewed. New technician submissions will appear here automatically.',
  approvalsAwaitingChip: '{count} awaiting approval',
  // Module B — Corrective Action (Findings) Board
  findingsTabTitle: 'Corrective Actions',
  findingsBoardTitle: 'Corrective Actions (Findings) Board',
  findingsBoardSubtitle: 'Track field defects from discovery through workshop dispatch, repair, verification, and closure.',
  findingsNewBtn: 'New Finding',
  findingsSendWorkshopBtn: 'Send to workshop',
  findingsCloseConfirmTitle: 'Close Corrective Action',
  findingsCloseNoteLabel: 'Closure Verification Note (Required)',
  findingsAgeOpen: '{days}d open',
  findingsDigestEscalation: '{count} corrective action(s) open >15 days (oldest: {oldest}d)',
  // Module C — Compliance Cycles + Auto Work Orders
  cyclesTabTitle: 'Compliance Cycles',
  cyclesConfigTitle: 'Compliance Cycles & Auto-Scheduling',
  cyclesConfigSubtitle: 'Configure per-building inspection cycles, asset-type overrides, and automated lead-time work order generation.',
  cyclesAutoToggleLabel: 'Automated Work Order Scheduling',
  cyclesAutoToggleDesc: 'Automatically create OPEN work orders when assets enter their lead-time window.',
  cyclesLeadTimeLabel: 'Lead Time (Days Before Due)',
  cyclesRunNowBtn: 'Run scheduling now',
  cyclesAutoScheduledBadge: 'Auto-scheduled',
  // Module D — Expiry Radar + Schedule Visit
  radarTabTitle: 'Expiry Radar',
  radarTitle: 'Expiry Radar & Visit Scheduler',
  radarSubtitle: 'Proactive 30 / 60 / 90 day horizon of upcoming extinguisher refills, hydro-tests, and AMC audits.',
  radarSummaryStrip: '{due30} due in 30 days · {due90} due in 90 days · {overdue} overdue',
  radarScheduleVisitBtn: 'Schedule visit',
  radarScheduledBadge: 'Scheduled ✓',
  // Module E — Client Portfolio Rollup
  portfolioTabTitle: 'Portfolio',
  portfolioTitle: 'Client Portfolio Rollup',
  portfolioSubtitle: 'Executive multi-site rollup of compliance rate, 30-day expiry exposure, and inspection coverage per client.',
  portfolioExpiringChip: '{count} expiring ≤30d',
  // Module F — Asset Service Dates + Monthly Register Export
  registerExportBtn: 'Monthly Register (.xlsx)',
  registerColLastService: 'Last Service',
  registerColNextService: 'Next Service Due',
  registerColNextHydro: 'Next Hydro Due',
  // Module G — White-Label Report Branding
  brandingTabTitle: 'Report Branding',
  brandingTitle: 'White-Label Report Branding',
  brandingSubtitle: 'Customize your agency logo, authorized signatory block, digital signature, and statutory page footer.',
  brandingLogoLabel: 'Agency Logo (PNG/JPEG ≤ 1MB)',
  brandingSignatoryNameLabel: 'Authorized Signatory Name',
  brandingSignatoryDesigLabel: 'Signatory Designation',
  brandingSignatureImgLabel: 'Signatory Signature Image (Optional)',
  brandingFooterLabel: 'Statutory Footer Line',
  // Module H — Floor-Plan Pins
  floorPlansBtn: 'Floor Plans',
  floorPlansTitle: 'Floor Plans & Asset Pins',
  floorPlansSubtitle: 'Upload floor schematics and place live compliance-colored pins bound to building fire assets.',
  floorPlansUploadBtn: 'Upload Floor Plan',
  floorPlansClickHint: 'Click anywhere on the floor plan to place an asset pin, or drag existing pins to reposition.',
  // Client Portal & Public Verification
  portalNavTab: 'Client Portal',
  portalInviteTitle: 'Invite Client User',
  portalInviteSubtitle: 'Grant read-only compliance portal access to building owners, societies, and facility managers.',
  portalInviteBtn: 'Send Portal Invite',
  portalCopyLinkBtn: 'Copy Magic Invite Link',
  portalLinkCopiedToast: 'Magic invite link copied to clipboard!',
  portalUsersTableTitle: 'Active Client Portal Users',
  portalReceiptsTabTitle: 'Report Delivery & Acknowledgement Receipts',
  portalRevokeBtn: 'Revoke Access',
  portalRestoreBtn: 'Restore Access',
  portalPublicVerifyToggleLabel: 'Public Verification Pages (/verify/[assetTag])',
  portalMasterToggleLabel: 'Client Portal Access (Master Switch)',
  portalAcknowledgedBadge: 'Acknowledged ✓',
};

const DICTIONARY_HI: Partial<AdminDictionary> = {
  navOverview: 'अवलोकन (Overview)',
  navClients: 'ग्राहक और भवन (Sites)',
  navEquipment: 'अग्नि सुरक्षा उपकरण',
  navInspections: 'जांच एवं कार्य (Work)',
  navFieldTeam: 'फील्ड टीम एवं तकनीशियन',
  navReports: 'प्रमाणपत्र एवं रिपोर्ट',
  navSettings: 'एजेंसी सेटिंग्स',
  navGuide: 'उपयोग मार्गदर्शिका (Guide)',

  digestTitle: 'आज आपका ध्यान आवश्यक है',
  digestSubtitle: 'तत्काल कार्रवाई योग्य महत्वपूर्ण अलर्ट',
  digestAllClear: 'सब कुछ दुरुस्त है — कोई लंबित समस्या नहीं 🎯',
  digestAllClearDesc: 'सभी भवन, उपकरण एवं कार्य आदेश अद्यतन हैं।',
  digestOverdueChecks: '{count} भवनों में निरीक्षण समय सीमा समाप्त (Overdue)',
  digestExpiringAssets: '30 दिनों के भीतर समाप्त होने वाले उपकरण',
  digestUnassignedJobs: 'अनावंटित या लंबित मरम्मत कार्य',
  digestPendingSyncs: 'सिंक हेतु प्रतीक्षारत फील्ड डेटा',
  digestNewFeedback: 'नई ग्राहक पूछताछ / प्रतिक्रिया',
  digestOpenLink: 'देखें →',
  digestDismiss: 'हटाएं',
  digestShowAll: 'सभी अलर्ट देखें',

  kpiTotalClients: 'ग्राहक सोसायटियां',
  kpiTotalBuildings: 'कुल भवन / टावर',
  kpiTotalEquipment: 'कुल अग्निशमन उपकरण',
  kpiActiveTechs: 'सक्रिय तकनीशियन',
  kpiOpenRepairs: 'खुले मरम्मत कार्य',
  kpiOverdueChecks: 'अतिदेय जांचें (Overdue)',
  kpiDueSoon: 'जल्द देय (30 दिन)',
  kpiComplianceRate: 'अनुपालन दर (Compliance)',

  chartTitle: 'अनुपालन एवं फील्ड कार्य प्रगति',
  chartSubtitle: 'फील्ड निरीक्षणों से सीधे प्राप्त वास्तविक परिचालन डेटा',
  chartEmptyState: 'पहले निरीक्षण दर्ज होने के बाद डेटा यहाँ दिखाई देगा।',
  chartSeriesInspections: 'फील्ड निरीक्षण',
  chartSeriesCompliance: 'अनुपालन दर (%)',
  chartSeriesRepairs: 'पूर्ण मरम्मत कार्य',
  chartSeriesAssets: 'निरीक्षित उपकरण (%)',
  range7D: '7 दिन',
  range30D: '30 दिन',
  range90D: '90 दिन',
  range12M: '12 महीने',
  deltaVsPrior: 'पिछले समय की तुलना में',

  inspectionsSubtitle: 'तकनीशियनों द्वारा मौके पर पूरे किए गए निरीक्षण — परिणाम, तस्वीरें और उपस्थिति प्रमाण।',
  repairsSubtitle: 'विफल निरीक्षणों या अनुरोधों से उत्पन्न कार्य — असाइन करें, ट्रैक करें और पूर्ण करें।',
  filterAll: 'सभी',
  filterPassed: 'सफल (Passed)',
  filterActionNeeded: 'कार्रवाई आवश्यक',
  filterOverdue: 'समय सीमा पार (Overdue)',
  statusOpen: 'खुला (Open)',
  statusAssigned: 'आवंटित (Assigned)',
  statusInProgress: 'प्रगति पर (In Progress)',
  statusCompleted: 'पूर्ण (Completed)',
  statusCancelled: 'रद्द (Cancelled)',

  techActive: 'सक्रिय (Active)',
  techBlocked: 'अवरुद्ध (Blocked)',
  techSystematicId: 'तकनीशियन आईडी (यूज़रनेम)',
  techPin: 'लॉगिन पिन',
  techViewActivity: 'गतिविधि देखें',
  techActivityTitle: 'तकनीशियन फील्ड गतिविधि एवं विवरण',
  techLastSeen: 'अंतिम सक्रियता / सिंक',
  techTasksCompleted: 'पूर्ण किए गए निरीक्षण',
  techPendingSyncs: 'अनसिंक मदें',
  techNotifyWhatsApp: 'व्हाट्सएप पर सूचित करें',
  techBulkSelect: 'चयनित',
  techSetActive: 'सक्रिय करें',
  techSetBlocked: 'अवरुद्ध करें',

  actionRegister: 'भवन पंजीकृत करें',
  actionAddClient: 'ग्राहक सोसायटी जोड़ें',
  actionAddBuilding: 'नया भवन जोड़ें',
  actionSave: 'सहेजें',
  actionCancel: 'रद्द करें',
  actionSaving: 'सहेजा जा रहा है...',
  actionExport: 'एक्सेल निर्यात',
  actionImport: 'एक्सेल आयात',

  guideTitle: 'VigilAMC प्लेटफ़ॉर्म मार्गदर्शिका',
  guideSubtitle: 'अग्नि सुरक्षा एएमसी का सुचारू प्रबंधन करने के लिए हर अनुभाग की जानकारी',
  guideChecklistTitle: 'VigilAMC में आपका स्वागत है — सेटअप चेकलिस्ट',
  guideChecklistDesc: 'अपनी एजेंसी को शुरू करने के लिए इन चरणों को पूरा करें।',
  guideGoTo: 'इस अनुभाग में जाएं →',
  guideDismiss: 'बाद में देखें',
  guideInviteTechDesc: 'तकनीशियन Google Play से VigilAMC Field इंस्टॉल करते हैं और यहाँ बनाए गए विवरण से साइन इन करते हैं',
  guidePlayStoreLink: 'Google Play पर प्राप्त करें',
  techSuccessPlayCopy: 'ये लॉगिन विवरण साझा करें — तकनीशियन VigilAMC Field एंड्रॉइड ऐप (Google Play) पर साइन इन करता है।',
  techPlayStoreHint: 'तकनीशियन VigilAMC Field एंड्रॉइड ऐप (Google Play) पर साइन इन करते हैं।',
  welcomeEyebrow: '🎉 निःशुल्क परीक्षण एक्सेस (FREE TESTING ACCESS)',
  welcomeHeading: 'स्वागत है, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC में आपका स्वागत है!',
  welcomeBody: '{agency} को हमारे साथ जोड़कर खुशी हुई। VigilAMC अभी सक्रिय परीक्षण (testing) में है — इस परीक्षण अवधि के दौरान आपके खाते को हर सुविधा का पूर्ण निःशुल्क एक्सेस मिलता है। आपकी प्रतिक्रिया उत्पाद को बेहतर बनाने में हमारी मदद करती है।',
  welcomeAgencyFallback: 'आपका वर्कस्पेस',
  welcomeBullet1: 'अपने भवन और अग्नि सुरक्षा उपकरण जोड़ें',
  welcomeBullet2: 'तकनीशियनों को VigilAMC Field एंड्रॉइड ऐप (Google Play) पर आमंत्रित करें',
  welcomeBullet3: 'अपनी पहली अनुपालन रिपोर्ट तैयार करें',
  welcomeCta: 'शुरू करें (Start exploring)',
  welcomeCloseAria: 'स्वागत संवाद बंद करें',
  welcomeFooter: 'कोई प्रश्न या सुझाव? vigilamc@gmail.com',
  // Excel Import Guide & Templates
  importHowToButton: '❓ आयात कैसे करें (How to import)',
  importHowToTitle: 'एजेंसी डेटा आयात करने की विधि (6 चरण)',
  importStep1: 'अपने रिकॉर्ड प्रकार के लिए टेम्पलेट (.xlsx या .csv) डाउनलोड करें।',
  importStep2: 'अपनी पंक्तियाँ भरें (कॉलम हेडर अपरिवर्तित रखें)।',
  importStep3: '.xlsx, .xls या .csv फ़ाइल अपलोड करें।',
  importStep4: 'कॉलम मैपिंग की जांच या समायोजन करें।',
  importStep5: 'सत्यापन और पूर्वावलोकन (Verify & Preview) पर क्लिक करें।',
  importStep6: 'आयात करें (डुप्लिकेट अपने आप सुरक्षित रहते हैं)।',
  importFieldRulesTitle: 'फ़ील्ड नियम और स्वीकार्य प्रारूप',
  importCommonIssuesTitle: 'सामान्य समस्याएं और फ़ाइल सीमाएं',
  importIssueAutoMatch: 'हेडर नाम अपने आप मैच हो जाते हैं — केवल अनमैच होने पर बदलें।',
  importIssueDuplicates: 'डुप्लिकेट पंक्तियाँ डिफ़ॉल्ट रूप से छोड़ दी जाती हैं और गिनी जाती हैं।',
  importIssueLimits: 'अधिकतम फ़ाइल आकार: 10 MB (.xlsx, .xls, .csv) • 100 पंक्तियों के बैच में प्रोसेस होता है।',
  importSupportLine: 'कोई समस्या? vigilamc@gmail.com',
  importDownloadExcelTemplate: 'Excel टेम्पलेट डाउनलोड करें',
  importDownloadCsvTemplate: 'CSV टेम्पलेट डाउनलोड करें',
  importRequiredUnmappedError: '{field} अनिवार्य है — इसके लिए स्प्रेडशीट कॉलम चुनें',
  importOptionalUnmappedHint: 'खाली छोड़ दिया जाएगा',
  importTotalRowsDetected: 'कुल पंक्तियाँ मिलीं:',
  approvalsTabTitle: 'अनुमोदन (Approvals)',
  approvalsQueueTitle: 'निरीक्षण अनुमोदन कतार',
  approvalsQueueSubtitle: 'आधिकारिक फॉर्म-बी रिपोर्ट में शामिल करने से पहले फील्ड निरीक्षणों की समीक्षा करें।',
  approvalsApproveBtn: 'स्वीकृत करें (Approve)',
  approvalsBulkApproveBtn: 'चयनित स्वीकृत करें',
  approvalsReturnBtn: 'नोट के साथ वापस भेजें',
  approvalsReturnModalTitle: 'तकनीशियन को निरीक्षण वापस भेजें',
  approvalsReturnNoteLabel: 'वापसी का कारण / सुधार नोट (अनिवार्य)',
  approvalsReturnConfirmBtn: 'वापसी की पुष्टि करें',
  approvalsFlagFindingBtn: 'दोष चिह्नित करें (Flag finding)',
  approvalsEmptyTitle: 'कोई लंबित अनुमोदन नहीं',
  approvalsEmptyDesc: 'सभी प्रस्तुत फील्ड निरीक्षणों की समीक्षा की जा चुकी है।',
  approvalsAwaitingChip: '{count} अनुमोदन हेतु लंबित',
  findingsTabTitle: 'सुधारात्मक कार्य (Findings)',
  findingsBoardTitle: 'सुधारात्मक कार्य एवं दोष बोर्ड',
  findingsBoardSubtitle: 'फील्ड दोषों को वर्कशॉप डिस्पैच, मरम्मत और सत्यापन तक ट्रैक करें।',
  findingsNewBtn: 'नया दोष जोड़ें',
  findingsSendWorkshopBtn: 'वर्कशॉप भेजें',
  findingsCloseConfirmTitle: 'सुधारात्मक कार्य बंद करें',
  findingsCloseNoteLabel: 'समापन सत्यापन नोट (अनिवार्य)',
  findingsAgeOpen: '{days} दिन से खुला',
  findingsDigestEscalation: '{count} सुधारात्मक कार्य >15 दिनों से खुले हैं (सबसे पुराना: {oldest} दिन)',
  cyclesTabTitle: 'अनुपालन चक्र (Cycles)',
  cyclesConfigTitle: 'अनुपालन चक्र एवं ऑटो-शेड्यूलिंग',
  cyclesConfigSubtitle: 'प्रत्येक भवन के लिए निरीक्षण चक्र और स्वचालित कार्य आदेश सेट करें।',
  cyclesAutoToggleLabel: 'स्वचालित कार्य आदेश शेड्यूलिंग',
  cyclesAutoToggleDesc: 'देय तिथि से पहले स्वचालित रूप से OPEN कार्य आदेश बनाएं।',
  cyclesLeadTimeLabel: 'लीड टाइम (देय तिथि से पहले के दिन)',
  cyclesRunNowBtn: 'अभी शेड्यूलिंग चलाएं',
  cyclesAutoScheduledBadge: 'स्वतः निर्धारित (Auto-scheduled)',
  radarTabTitle: 'एक्सपायरी रडार (Expiry Radar)',
  radarTitle: 'एक्सपायरी रडार एवं विज़िट शेड्यूलर',
  radarSubtitle: 'आगामी 30 / 60 / 90 दिनों में देय रिफिल, हाइड्रो-टेस्ट और एएमसी जांचें।',
  radarSummaryStrip: '30 दिनों में {due30} देय · 90 दिनों में {due90} देय · {overdue} अतिदेय',
  radarScheduleVisitBtn: 'विज़िट शेड्यूल करें',
  radarScheduledBadge: 'शेड्यूल किया गया ✓',
  portfolioTabTitle: 'पोर्टफोलियो (Portfolio)',
  portfolioTitle: 'ग्राहक पोर्टफोलियो अनुपालन सारांश',
  portfolioSubtitle: 'प्रत्येक ग्राहक के लिए भवन, उपकरण, अनुपालन % और 30-दिन एक्सपायरी सारांश।',
  portfolioExpiringChip: '{count} ≤30 दिनों में समाप्त',
  registerExportBtn: 'मासिक रजिस्टर (.xlsx)',
  registerColLastService: 'अंतिम सर्विस',
  registerColNextService: 'अगली सर्विस देय',
  registerColNextHydro: 'अगला हाइड्रो टेस्ट देय',
  brandingTabTitle: 'रिपोर्ट ब्रांडिंग',
  brandingTitle: 'व्हाइट-लेबल रिपोर्ट ब्रांडिंग',
  brandingSubtitle: 'अपनी एजेंसी का लोगो, हस्ताक्षरकर्ता का नाम, पदनाम और फुटर पंक्ति सेट करें।',
  brandingLogoLabel: 'एजेंसी लोगो (PNG/JPEG ≤ 1MB)',
  brandingSignatoryNameLabel: 'अधिकृत हस्ताक्षरकर्ता का नाम',
  brandingSignatoryDesigLabel: 'हस्ताक्षरकर्ता का पदनाम',
  brandingSignatureImgLabel: 'हस्ताक्षर छवि (वैकल्पिक)',
  brandingFooterLabel: 'रिपोर्ट फुटर पंक्ति',
  floorPlansBtn: 'फ़्लोर प्लान (Floor Plans)',
  floorPlansTitle: 'फ़्लोर प्लान और उपकरण पिन',
  floorPlansSubtitle: 'फ़्लोर प्लान अपलोड करें और उपकरणों की स्थिति दर्शाने वाले पिन लगाएं।',
  floorPlansUploadBtn: 'फ़्लोर प्लान अपलोड करें',
  floorPlansClickHint: 'उपकरण पिन लगाने के लिए फ़्लोर प्लान पर कहीं भी क्लिक करें, या पिन को खींचकर स्थान बदलें।',
  portalNavTab: 'क्लाइंट पोर्टल (Client Portal)',
  portalInviteTitle: 'क्लाइंट को आमंत्रित करें',
  portalInviteSubtitle: 'सोसायटियों और भवन प्रबंधकों को केवल-पठन अनुपालन पोर्टल का उपयोग प्रदान करें।',
  portalInviteBtn: 'पोर्टल आमंत्रण भेजें',
  portalCopyLinkBtn: 'मैजिक आमंत्रण लिंक कॉपी करें',
  portalLinkCopiedToast: 'मैजिक आमंत्रण लिंक क्लिपबोर्ड पर कॉपी हो गया!',
  portalUsersTableTitle: 'सक्रिय क्लाइंट पोर्टल उपयोगकर्ता',
  portalReceiptsTabTitle: 'रिपोर्ट डिलीवरी और पावती रसीदें (Receipts)',
  portalRevokeBtn: 'पहुंच निरस्त करें',
  portalRestoreBtn: 'पहुंच बहाल करें',
  portalPublicVerifyToggleLabel: 'सार्वजनिक सत्यापन पृष्ठ (/verify/[assetTag])',
  portalMasterToggleLabel: 'क्लाइंट पोर्टल मास्टर स्विच',
  portalAcknowledgedBadge: 'प्राप्ति स्वीकार ✓',
};

const DICTIONARY_MR: Partial<AdminDictionary> = {
  navOverview: 'आढावा (Overview)',
  navClients: 'ग्राहक आणि इमारती',
  navEquipment: 'अग्निशमन उपकरणे',
  navInspections: 'तपासणी व कामे',
  navFieldTeam: 'फील्ड टीम व तंत्रज्ञ',
  navReports: 'अनुपालन अहवाल',
  navSettings: 'एजन्सी सेटिंग्ज',
  digestTitle: 'आज लक्ष देणे आवश्यक आहे',
  digestAllClear: 'सर्व काही अद्ययावत आहे — कोणतीही प्रलंबित समस्या नाही 🎯',
  chartTitle: 'अनुपालन व फील्ड कामाचा कल',
  inspectionsSubtitle: 'तंत्रज्ञांनी जागेवर केलेल्या तपासण्या — निकाल, फोटो व पुष्टी.',
  repairsSubtitle: 'दुरुस्तीची कामे — नेमणूक करा, ट्रॅक करा आणि पूर्ण करा.',
  techActive: 'सक्रिय (Active)',
  techBlocked: 'ब्लॉक (Blocked)',
  actionSave: 'जतन करा',
  actionCancel: 'रद्द करा',
  guideInviteTechDesc: 'तंत्रज्ञ Google Play वरून VigilAMC Field इन्स्टॉल करतात आणि येथे तयार केलेल्या माहितीने साइन इन करतात',
  guidePlayStoreLink: 'Google Play वर मिळवा',
  techSuccessPlayCopy: 'हे क्रेडेन्शियल्स शेअर करा — तंत्रज्ञ VigilAMC Field अँड्रॉइड अ‍ॅपवर (Google Play) साइन इन करतो.',
  techPlayStoreHint: 'तंत्रज्ञ VigilAMC Field अँड्रॉइड अ‍ॅपवर (Google Play) साइन इन करतात.',
  welcomeEyebrow: '🎉 मोफत चाचणी प्रवेश (FREE TESTING ACCESS)',
  welcomeHeading: 'स्वागत आहे, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC मध्ये आपले स्वागत आहे!',
  welcomeBody: '{agency} आमच्यासोबत जोडल्याबद्दल आनंद झाला. VigilAMC सक्रिय चाचणी टप्प्यात आहे — या चाचणी कालावधीत आपल्या खात्याला सर्व सुविधांचा पूर्ण मोफत प्रवेश मिळतो. आपला अभिप्राय उत्पादन अधिक चांगले करण्यात मदत करतो.',
  welcomeAgencyFallback: 'तुमचा वर्कस्पेस',
  welcomeBullet1: 'तुमच्या इमारती आणि अग्निशमन उपकरणे जोडा',
  welcomeBullet2: 'तंत्रज्ञांना VigilAMC Field अँड्रॉइड अ‍ॅपवर (Google Play) आमंत्रित करा',
  welcomeBullet3: 'तुमचा पहिला अनुपालन अहवाल तयार करा',
  welcomeCta: 'वापर सुरू करा',
  welcomeCloseAria: 'स्वागत पॉपअप बंद करा',
  welcomeFooter: 'प्रश्न किंवा अभिप्राय? vigilamc@gmail.com',
};

const DICTIONARY_GU: Partial<AdminDictionary> = {
  navOverview: 'ઓવરવ્યૂ',
  navClients: 'ગ્રાહક અને ઇમારતો',
  navEquipment: 'ફાયર સાધનો',
  navInspections: 'તપાસ અને કામ',
  navFieldTeam: 'ફિલ્ડ ટીમ અને ટેકનિશિયન',
  navReports: 'અહેવાલો',
  navSettings: 'સેટિંગ્સ',
  digestTitle: 'આજે તમારું ધ્યાન જરૂરી છે',
  digestAllClear: 'બધું બરાબર છે — કોઈ મુશ્કેલી નથી 🎯',
  chartTitle: 'અનુપાલન અને પ્રગતિ',
  inspectionsSubtitle: 'સ્થળ પર કરેલી તપાસ — પરિણામો અને પુરાવા.',
  repairsSubtitle: 'સમારકામ કામો — સોંપો અને પૂર્ણ કરો.',
  techActive: 'સક્રિય (Active)',
  techBlocked: 'બ્લોક (Blocked)',
  actionSave: 'સાચવો',
  actionCancel: 'રદ કરો',
  guideInviteTechDesc: 'ટેકનિશિયન Google Play પરથી VigilAMC Field ઇન્સ્ટોલ કરે છે અને અહીં બનાવેલા ક્રેડેન્શિયલ્સથી સાઇન ઇન કરે છે',
  guidePlayStoreLink: 'Google Play પર મેળવો',
  techSuccessPlayCopy: 'આ ક્રેડેન્શિયલ્સ શેર કરો — ટેકનિશિયન VigilAMC Field એન્ડ્રોઇડ એપ (Google Play) પર સાઇન ઇન કરે છે.',
  techPlayStoreHint: 'ટેકનિશિયન VigilAMC Field એન્ડ્રોઇડ એપ (Google Play) પર સાઇન ઇન કરે છે.',
  welcomeEyebrow: '🎉 મફત ટેસ્ટિંગ એક્સેસ (FREE TESTING ACCESS)',
  welcomeHeading: 'સ્વાગત છે, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC માં આપનું સ્વાગત છે!',
  welcomeBody: '{agency} ને જોડીને આનંદ થયો. VigilAMC હાલમાં સક્રિય ટેસ્ટિંગમાં છે — આ ટેસ્ટિંગ સમયગાળા દરમિયાન તમારા એકાઉન્ટને દરેક સુવિધાનો સંપૂર્ણ મફત એક્સેસ મળે છે. તમારો પ્રતિસાદ અમને પ્રોડક્ટને વધુ સારી બનાવવામાં મદદ કરે છે.',
  welcomeAgencyFallback: 'તમારું વર્કસ્પેસ',
  welcomeBullet1: 'તમારી ઇમારતો અને ફાયર સાધનો ઉમેરો',
  welcomeBullet2: 'ટેકનિશિયનોને VigilAMC Field એન્ડ્રોઇડ એપ (Google Play) પર આમંત્રિત કરો',
  welcomeBullet3: 'તમારો પ્રથમ અનુપાલન અહેવાલ બનાવો',
  welcomeCta: 'શરૂ કરો',
  welcomeCloseAria: 'સ્વાગત પોપઅપ બંધ કરો',
  welcomeFooter: 'પ્રશ્નો કે પ્રતિસાદ? vigilamc@gmail.com',
};

const DICTIONARY_TA: Partial<AdminDictionary> = {
  navOverview: 'மேலோட்டம் (Overview)',
  navClients: 'வாடிக்கையாளர்கள் & தளங்கள்',
  navEquipment: 'தீயணைப்பு உபகரணங்கள்',
  navInspections: 'ஆய்வுகள் & பணிகள்',
  navFieldTeam: 'களக் குழு & தொழில்நுட்ப வல்லுநர்கள்',
  navReports: 'இணக்க அறிக்கைகள்',
  navSettings: 'அமைப்புகள்',
  digestTitle: 'இன்று உங்கள் கவனம் தேவை',
  digestAllClear: 'எல்லாம் புதுப்பிக்கப்பட்டுள்ளது — சிக்கல்கள் இல்லை 🎯',
  chartTitle: 'இணக்கம் மற்றும் பணி வேகம்',
  inspectionsSubtitle: 'தளத்தில் முடிக்கப்பட்ட ஆய்வுகள் — முடிவுகள் மற்றும் புகைப்படங்கள்.',
  repairsSubtitle: 'பழுதுபார்க்கும் பணிகள் — ஒதுக்குங்கள் மற்றும் முடிக்கவும்.',
  techActive: 'செயலில் (Active)',
  techBlocked: 'தடுக்கப்பட்டது (Blocked)',
  actionSave: 'சேமி',
  actionCancel: 'ரத்து செய்',
  guideInviteTechDesc: 'தொழில்நுட்ப வல்லுநர்கள் Google Play இலிருந்து VigilAMC Field செயலியை நிறுவி இங்கு உருவாக்கிய விவரங்களுடன் உள்நுழைவார்கள்',
  guidePlayStoreLink: 'Google Play இல் பெறுக',
  techSuccessPlayCopy: 'இந்த விவரங்களைப் பகிரவும் — தொழில்நுட்ப வல்லுநர் VigilAMC Field ஆண்ட்ராய்டு செயலியில் (Google Play) உள்நுழைவார்.',
  techPlayStoreHint: 'தொழில்நுட்ப வல்லுநர்கள் VigilAMC Field ஆண்ட்ராய்டு செயலியில் (Google Play) உள்நுழைகிறார்கள்.',
  welcomeEyebrow: '🎉 இலவச சோதனை அணுகல் (FREE TESTING ACCESS)',
  welcomeHeading: 'வரவேற்கிறோம், {firstName}!',
  welcomeHeadingFallback: 'VigilAMC க்கு வரவேற்கிறோம்!',
  welcomeBody: '{agency} இணைந்ததில் மகிழ்ச்சி. VigilAMC தற்போது சோதனை கட்டத்தில் உள்ளது — இந்த சோதனைக் காலத்தில் அனைத்து அம்சங்களுக்கும் உங்களுக்கு முழு இலவச அணுகல் கிடைக்கும். உங்கள் கருத்து தயாரிப்பை மேம்படுத்த உதவும்.',
  welcomeAgencyFallback: 'உங்கள் பணியிடம்',
  welcomeBullet1: 'உங்கள் கட்டிடங்கள் மற்றும் தீயணைப்பு உபகரணங்களைச் சேர்க்கவும்',
  welcomeBullet2: 'VigilAMC Field ஆண்ட்ராய்டு செயலிக்கு (Google Play) தொழில்நுட்ப வல்லுநர்களை அழைக்கவும்',
  welcomeBullet3: 'உங்கள் முதல் இணக்க அறிக்கையை உருவாக்கவும்',
  welcomeCta: 'தொடங்கவும்',
  welcomeCloseAria: 'வரவேற்பு சாளரத்தை மூடு',
  welcomeFooter: 'கேள்விகள் அல்லது கருத்து? vigilamc@gmail.com',
};

const DICTIONARY_TE: Partial<AdminDictionary> = {
  navOverview: 'సమీక్ష (Overview)',
  navClients: 'క్లయింట్లు & భవనాలు',
  navEquipment: 'అగ్నిమాపక సామగ్రి',
  navInspections: 'తనిఖీలు & పనులు',
  navFieldTeam: 'ఫీల్డ్ టీమ్ & టెక్నీషియన్లు',
  navReports: 'నివేదికలు',
  navSettings: 'సెట్టింగ్‌లు',
  digestTitle: 'ఈ రోజు మీ శ్రద్ధ అవసరం',
  digestAllClear: 'అంతా సక్రమంగా ఉంది — ఏ పెండింగ్ లేదు 🎯',
  chartTitle: 'సమ్మతి మరియు ఫీల్డ్ వేగం',
  inspectionsSubtitle: 'సైట్‌లో పూర్తి చేసిన తనిఖీలు — ఫలితాలు మరియు ఫోటోలు.',
  repairsSubtitle: 'మరమ్మతు పనులు — కేటాయించండి మరియు పూర్తి చేయండి.',
  techActive: 'యాక్టివ్ (Active)',
  techBlocked: 'బ్లాక్ చేయబడింది (Blocked)',
  actionSave: 'సేవ్ చేయండి',
  actionCancel: 'రద్దు చేయండి',
  guideInviteTechDesc: 'టెక్నీషియన్లు Google Play నుండి VigilAMC Field ఇన్‌స్టాల్ చేసి, ఇక్కడ సృష్టించిన వివరాలతో సైన్ ఇన్ చేస్తారు',
  guidePlayStoreLink: 'Google Playలో పొందండి',
  techSuccessPlayCopy: 'ఈ వివరాలను షేర్ చేయండి — టెక్నీషియన్ VigilAMC Field ఆండ్రాయిడ్ యాప్ (Google Play)లో సైన్ ఇన్ చేస్తారు.',
  techPlayStoreHint: 'టెక్నీషియన్లు VigilAMC Field ఆండ్రాయిడ్ యాప్ (Google Play)లో సైన్ ఇన్ చేస్తారు.',
  welcomeEyebrow: '🎉 ఉచిత టెస్టింగ్ యాక్సెస్ (FREE TESTING ACCESS)',
  welcomeHeading: 'స్వాగతం, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC కు స్వాగతం!',
  welcomeBody: '{agency} చేరినందుకు సంతోషం. VigilAMC ప్రస్తుతం యాక్టివ్ టెస్టింగ్‌లో ఉంది — ఈ టెస్టింగ్ సమయంలో ప్రతి ఫీచర్‌కు మీ ఖాతాకు పూర్తి ఉచిత యాక్సెస్ లభిస్తుంది. మీ అభిప్రాయం మాకు ఎంతో విలువైనది.',
  welcomeAgencyFallback: 'మీ వర్క్‌స్పేస్',
  welcomeBullet1: 'మీ భవనాలు మరియు అగ్నిమాపక పరికరాలను జోడించండి',
  welcomeBullet2: 'VigilAMC Field ఆండ్రాయిడ్ యాప్ (Google Play) కు టెక్నీషియన్లను ఆహ్వానించండి',
  welcomeBullet3: 'మీ మొదటి సమ్మతి నివేదికను రూపొందించండి',
  welcomeCta: 'ప్రారంభించండి',
  welcomeCloseAria: 'స్వాగత పాపప్ మూసివేయండి',
  welcomeFooter: 'ప్రశ్నలు లేదా అభిప్రాయం? vigilamc@gmail.com',
};

const DICTIONARY_KN: Partial<AdminDictionary> = {
  navOverview: 'ಅವಲೋಕನ (Overview)',
  navClients: 'ಗ್ರಾಹಕರು ಮತ್ತು ಕಟ್ಟಡಗಳು',
  navEquipment: 'ಅಗ್ನಿಶಾಮಕ ಉಪಕರಣಗಳು',
  navInspections: 'ಪರಿಶೀಲನೆ ಮತ್ತು ಕೆಲಸ',
  navFieldTeam: 'ಫೀಲ್ಡ್ ತಂಡ & ತಂತ್ರಜ್ಞರು',
  navReports: 'ವರದಿಗಳು',
  navSettings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  digestTitle: 'ಇಂದು ನಿಮ್ಮ ಗಮನ ಅಗತ್ಯವಿದೆ',
  digestAllClear: 'ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ — ಯಾವುದೇ ಸಮಸ್ಯೆ ಇಲ್ಲ 🎯',
  chartTitle: 'ಅನುಸರಣೆ ಮತ್ತು ಕೆಲಸದ ವೇಗ',
  inspectionsSubtitle: 'ಸ್ಥಳದಲ್ಲಿ ಪೂರ್ಣಗೊಂಡ ತಪಾಸಣೆಗಳು — ಫಲಿತಾಂಶಗಳು ಮತ್ತು ಫೋಟೋಗಳು.',
  repairsSubtitle: 'ದುರಸ್ತಿ ಕೆಲಸಗಳು — ನಿಯೋಜಿಸಿ ಮತ್ತು ಪೂರ್ಣಗೊಳಿಸಿ.',
  techActive: 'ಸಕ್ರಿಯ (Active)',
  techBlocked: 'ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ (Blocked)',
  actionSave: 'ಉಳಿಸಿ',
  actionCancel: 'ರದ್ದುಮಾಡಿ',
  guideInviteTechDesc: 'ತಂತ್ರಜ್ಞರು Google Play ನಿಂದ VigilAMC Field ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ ಇಲ್ಲಿ ರಚಿಸಿದ ವಿವರಗಳೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡುತ್ತಾರೆ',
  guidePlayStoreLink: 'Google Play ನಲ್ಲಿ ಪಡೆಯಿರಿ',
  techSuccessPlayCopy: 'ಈ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ — ತಂತ್ರಜ್ಞರು VigilAMC Field ಆಂಡ್ರಾಯ್ಡ್ ಆಪ್‌ನಲ್ಲಿ (Google Play) ಸೈನ್ ಇನ್ ಮಾಡುತ್ತಾರೆ.',
  techPlayStoreHint: 'ತಂತ್ರಜ್ಞರು VigilAMC Field ಆಂಡ್ರಾಯ್ಡ್ ಆಪ್‌ನಲ್ಲಿ (Google Play) ಸೈನ್ ಇನ್ ಮಾಡುತ್ತಾರೆ.',
  welcomeEyebrow: '🎉 ಉಚಿತ ಪರೀಕ್ಷಾ ಪ್ರವೇಶ (FREE TESTING ACCESS)',
  welcomeHeading: 'ಸ್ವಾಗತ, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC ಗೆ ಸ್ವಾಗತ!',
  welcomeBody: '{agency} ನಮ್ಮೊಂದಿಗೆ ಸೇರಿರುವುದು ಸಂತೋಷ. VigilAMC ಸಕ್ರಿಯ ಪರೀಕ್ಷೆಯಲ್ಲಿದೆ — ಈ ಪರೀಕ್ಷಾ ಅವಧಿಯಲ್ಲಿ ನಿಮ್ಮ ಖಾತೆಗೆ ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಸಂಪೂರ್ಣ ಉಚಿತ ಪ್ರವೇಶ ಸಿಗುತ್ತದೆ. ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆ ಉತ್ಪನ್ನವನ್ನು ರೂಪಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
  welcomeAgencyFallback: 'ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರ',
  welcomeBullet1: 'ನಿಮ್ಮ ಕಟ್ಟಡಗಳು ಮತ್ತು ಅಗ್ನಿಶಾಮಕ ಉಪಕರಣಗಳನ್ನು ಸೇರಿಸಿ',
  welcomeBullet2: 'VigilAMC Field ಆಂಡ್ರಾಯ್ಡ್ ಆಪ್‌ಗೆ (Google Play) ತಂತ್ರಜ್ಞರನ್ನು ಆಹ್ವಾನಿಸಿ',
  welcomeBullet3: 'ನಿಮ್ಮ ಮೊದಲ ಅನುಸರಣೆ ವರದಿಯನ್ನು ರಚಿಸಿ',
  welcomeCta: 'ಪ್ರಾರಂಭಿಸಿ',
  welcomeCloseAria: 'ಸ್ವಾಗತ ವಿಂಡೋ ಮುಚ್ಚಿ',
  welcomeFooter: 'ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಪ್ರತಿಕ್ರಿಯೆ? vigilamc@gmail.com',
};

const DICTIONARY_ML: Partial<AdminDictionary> = {
  navOverview: 'അവലോകനം (Overview)',
  navClients: 'ഉപഭോക്താക്കളും കെട്ടിടങ്ങളും',
  navEquipment: 'അഗ്നിശമന ഉപകരണങ്ങൾ',
  navInspections: 'പരിശോധനകളും ജോലികളും',
  navFieldTeam: 'ഫീൽഡ് ടീം & ടെക്നീഷ്യൻമാർ',
  navReports: 'റിപ്പോർട്ടുകൾ',
  navSettings: 'ക്രമീകരണങ്ങൾ',
  digestTitle: 'ഇന്ന് നിങ്ങളുടെ ശ്രദ്ധ ആവശ്യമാണ്',
  digestAllClear: 'എല്ലാം ശരിയായിരിക്കുന്നു — കുടിശ്ശികയില്ല 🎯',
  chartTitle: 'പാലിക്കലും പുരോഗതിയും',
  inspectionsSubtitle: 'സൈറ്റിൽ പൂർത്തിയാക്കിയ പരിശോധനകൾ — ഫലങ്ങളും ഫോട്ടോകളും.',
  repairsSubtitle: 'അറ്റകുറ്റപ്പണികൾ — നിയോഗിക്കുക, പൂർത്തിയാക്കുക.',
  techActive: 'സജീവം (Active)',
  techBlocked: 'തടഞ്ഞു (Blocked)',
  actionSave: 'സംരക്ഷിക്കുക',
  actionCancel: 'റദ്ദാക്കുക',
  guideInviteTechDesc: 'ടെക്നീഷ്യൻമാർ Google Play-യിൽ നിന്ന് VigilAMC Field ഇൻസ്റ്റാൾ ചെയ്ത് ഇവിടെ നൽകിയ വിവരങ്ങൾ ഉപയോഗിച്ച് സൈൻ ഇൻ ചെയ്യുന്നു',
  guidePlayStoreLink: 'Google Play-യിൽ നേടുക',
  techSuccessPlayCopy: 'ഈ വിവരങ്ങൾ പങ്കിടുക — ടെക്നീഷ്യൻ VigilAMC Field ആൻഡ്രോയിഡ് ആപ്പിൽ (Google Play) സൈൻ ഇൻ ചെയ്യുന്നു.',
  techPlayStoreHint: 'ടെക്നീഷ്യൻമാർ VigilAMC Field ആൻഡ്രോയിഡ് ആപ്പിൽ (Google Play) സൈൻ ഇൻ ചെയ്യുന്നു.',
  welcomeEyebrow: '🎉 സൗജന്യ ടെസ്റ്റിംഗ് ആക്സസ് (FREE TESTING ACCESS)',
  welcomeHeading: 'സ്വാഗതം, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC-യിലേക്ക് സ്വാഗതം!',
  welcomeBody: '{agency} ഞങ്ങളോടൊപ്പം ചേർന്നതിൽ സന്തോഷം. VigilAMC സജീവ ടെസ്റ്റിംഗിലാണ് — ഈ ടെസ്റ്റിംഗ് കാലയളവിൽ എല്ലാ ഫീച്ചറുകളിലേക്കും നിങ്ങൾക്ക് പൂർണ്ണ സൗജന്യ ആക്സസ് ലഭിക്കും. നിങ്ങളുടെ അഭിപ്രായം ഉൽപ്പന്നം മെച്ചപ്പെടുത്താൻ സഹായിക്കുന്നു.',
  welcomeAgencyFallback: 'നിങ്ങളുടെ വർക്ക്‌സ്പേസ്',
  welcomeBullet1: 'നിങ്ങളുടെ കെട്ടിടങ്ങളും അഗ്നിശമന ഉപകരണങ്ങളും ചേർക്കുക',
  welcomeBullet2: 'VigilAMC Field ആൻഡ്രോയിഡ് ആപ്പിലേക്ക് (Google Play) ടെക്നീഷ്യൻമാരെ ക്ഷണിക്കുക',
  welcomeBullet3: 'നിങ്ങളുടെ ആദ്യ കംപ്ലയൻസ് റിപ്പോർട്ട് തയ്യാറാക്കുക',
  welcomeCta: 'ആരംഭിക്കുക',
  welcomeCloseAria: 'സ്വാഗത ഡയലോഗ് അടയ്ക്കുക',
  welcomeFooter: 'ചോദ്യങ്ങളോ അഭിപ്രായങ്ങളോ? vigilamc@gmail.com',
};

const DICTIONARY_BN: Partial<AdminDictionary> = {
  navOverview: 'একনজরে (Overview)',
  navClients: 'ক্লায়েন্ট ও ভবনসমূহ',
  navEquipment: 'অগ্নি নির্বাপক সরঞ্জাম',
  navInspections: 'পরিদর্শন ও কাজ',
  navFieldTeam: 'ফিল্ড টিম ও টেকনিশিয়ান',
  navReports: 'কমপ্লায়েন্স রিপোর্ট',
  navSettings: 'সেটিংস',
  digestTitle: 'আজ আপনার মনোযোগ প্রয়োজন',
  digestAllClear: 'সবকিছু ঠিকঠাক আছে — কোনো বিলম্ব নেই 🎯',
  chartTitle: 'কমপ্লায়েন্স ও কাজের গতি',
  inspectionsSubtitle: 'সাইটে সম্পন্ন করা পরিদর্শন — ফলাফল এবং প্রমাণ।',
  repairsSubtitle: 'মেরামত কাজ — বরাদ্দ করুন এবং সম্পূর্ণ করুন।',
  techActive: 'সক্রিয় (Active)',
  techBlocked: 'ব্লকড (Blocked)',
  actionSave: 'সংরক্ষণ করুন',
  actionCancel: 'বাতিল করুন',
  guideInviteTechDesc: 'টেকনিশিয়ানরা Google Play থেকে VigilAMC Field ইনস্টল করেন এবং এখানে তৈরি করা তথ্য দিয়ে সাইন ইন করেন',
  guidePlayStoreLink: 'Google Play-তে পান',
  techSuccessPlayCopy: 'এই লগইন তথ্য শেয়ার করুন — টেকনিশিয়ান VigilAMC Field অ্যান্ড্রয়েড অ্যাপে (Google Play) সাইন ইন করবেন।',
  techPlayStoreHint: 'টেকনিশিয়ানরা VigilAMC Field অ্যান্ড্রয়েড অ্যাপে (Google Play) সাইন ইন করেন।',
  welcomeEyebrow: '🎉 বিনামূল্যে টেস্টিং অ্যাক্সেস (FREE TESTING ACCESS)',
  welcomeHeading: 'স্বাগতম, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC-তে স্বাগতম!',
  welcomeBody: '{agency}-কে আমাদের সাথে পেয়ে আনন্দিত। VigilAMC বর্তমানে সক্রিয় টেস্টিং পর্যায়ে রয়েছে — এই টেস্টিং চলাকালীন আপনার অ্যাকাউন্ট প্রতিটি ফিচারে সম্পূর্ণ বিনামূল্যে অ্যাক্সেস পাবে। আপনার মতামত আমাদের পণ্যটি আরও উন্নত করতে সাহায্য করবে।',
  welcomeAgencyFallback: 'আপনার ওয়ার্কস্পেস',
  welcomeBullet1: 'আপনার ভবন এবং অগ্নি নির্বাপক সরঞ্জাম যোগ করুন',
  welcomeBullet2: 'VigilAMC Field অ্যান্ড্রয়েড অ্যাপে (Google Play) টেকনিশিয়ানদের আমন্ত্রণ জানান',
  welcomeBullet3: 'আপনার প্রথম কমপ্লায়েন্স রিপোর্ট তৈরি করুন',
  welcomeCta: 'শুরু করুন',
  welcomeCloseAria: 'স্বাগতম পপআপ বন্ধ করুন',
  welcomeFooter: 'প্রশ্ন বা মতামত? vigilamc@gmail.com',
};

const DICTIONARY_PA: Partial<AdminDictionary> = {
  navOverview: 'ਸੰਖੇਪ (Overview)',
  navClients: 'ਗਾਹਕ ਅਤੇ ਇਮਾਰਤਾਂ',
  navEquipment: 'ਅੱਗ ਬੁਝਾਊ ਉਪਕਰਣ',
  navInspections: 'ਨਿਰੀਖਣ ਅਤੇ ਕੰਮ',
  navFieldTeam: 'ਫੀਲਡ ਟੀਮ ਅਤੇ ਤਕਨੀਸ਼ੀਅਨ',
  navReports: 'ਰਿਪੋਰਟਾਂ',
  navSettings: 'ਸੈਟਿੰਗਾਂ',
  digestTitle: 'ਅੱਜ ਤੁਹਾਡੇ ਧਿਆਨ ਦੀ ਲੋੜ ਹੈ',
  digestAllClear: 'ਸਭ ਕੁਝ ਠੀਕ ਹੈ — ਕੋਈ ਬਕਾਇਆ ਨਹੀਂ 🎯',
  chartTitle: 'ਪਾਲਣਾ ਅਤੇ ਕੰਮ ਦੀ ਗਤੀ',
  inspectionsSubtitle: 'ਮੌਕੇ ਤੇ ਪੂਰੇ ਕੀਤੇ ਗਏ ਨਿਰੀਖਣ — ਨਤੀਜੇ ਅਤੇ ਫੋਟੋਆਂ।',
  repairsSubtitle: 'ਮੁਰੰਮਤ ਦੇ ਕੰਮ — ਸੌਂਪੋ ਅਤੇ ਪੂਰਾ ਕਰੋ।',
  techActive: 'ਸਰਗਰਮ (Active)',
  techBlocked: 'ਬਲੌਕ (Blocked)',
  actionSave: 'ਸੰਭਾਲੋ',
  actionCancel: 'ਰੱਦ ਕਰੋ',
  guideInviteTechDesc: 'ਤਕਨੀਸ਼ੀਅਨ Google Play ਤੋਂ VigilAMC Field ਇੰਸਟਾਲ ਕਰਦੇ ਹਨ ਅਤੇ ਇੱਥੇ ਬਣਾਏ ਵੇਰਵਿਆਂ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰਦੇ ਹਨ',
  guidePlayStoreLink: 'Google Play ਤੇ ਪ੍ਰਾਪਤ ਕਰੋ',
  techSuccessPlayCopy: 'ਇਹ ਲੌਗਇਨ ਵੇਰਵੇ ਸਾਂਝੇ ਕਰੋ — ਤਕਨੀਸ਼ੀਅਨ VigilAMC Field ਐਂਡਰਾਇਡ ਐਪ (Google Play) ਤੇ ਸਾਈਨ ਇਨ ਕਰਦਾ ਹੈ।',
  techPlayStoreHint: 'ਤਕਨੀਸ਼ੀਅਨ VigilAMC Field ਐਂਡਰਾਇਡ ਐਪ (Google Play) ਤੇ ਸਾਈਨ ਇਨ ਕਰਦੇ ਹਨ।',
  welcomeEyebrow: '🎉 ਮੁਫ਼ਤ ਟੈਸਟਿੰਗ ਐਕਸੈਸ (FREE TESTING ACCESS)',
  welcomeHeading: 'ਜੀ ਆਇਆਂ ਨੂੰ, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ!',
  welcomeBody: '{agency} ਦਾ ਸਾਡੇ ਨਾਲ ਜੁੜਨ ਤੇ ਸਵਾਗਤ ਹੈ। VigilAMC ਸਰਗਰਮ ਟੈਸਟਿੰਗ ਵਿੱਚ ਹੈ — ਇਸ ਟੈਸਟਿੰਗ ਮਿਆਦ ਦੌਰਾਨ ਤੁਹਾਡੇ ਖਾਤੇ ਨੂੰ ਹਰ ਸਹੂਲਤ ਦੀ ਪੂਰੀ ਮੁਫ਼ਤ ਪਹੁੰਚ ਮਿਲਦੀ ਹੈ। ਤੁਹਾਡਾ ਸੁਝਾਅ ਉਤਪਾਦ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।',
  welcomeAgencyFallback: 'ਤੁਹਾਡਾ ਵਰਕਸਪੇਸ',
  welcomeBullet1: 'ਆਪਣੀਆਂ ਇਮਾਰਤਾਂ ਅਤੇ ਅੱਗ ਬੁਝਾਊ ਉਪਕਰਣ ਸ਼ਾਮਲ ਕਰੋ',
  welcomeBullet2: 'ਤਕਨੀਸ਼ੀਅਨਾਂ ਨੂੰ VigilAMC Field ਐਂਡਰਾਇਡ ਐਪ (Google Play) ਤੇ ਸੱਦਾ ਦਿਓ',
  welcomeBullet3: 'ਆਪਣੀ ਪਹਿਲੀ ਪਾਲਣਾ ਰਿਪੋਰਟ ਤਿਆਰ ਕਰੋ',
  welcomeCta: 'ਸ਼ੁਰੂ ਕਰੋ',
  welcomeCloseAria: 'ਸਵਾਗਤ ਵਿੰਡੋ ਬੰਦ ਕਰੋ',
  welcomeFooter: 'ਸਵਾਲ ਜਾਂ ਸੁਝਾਅ? vigilamc@gmail.com',
};

const DICTIONARY_OR: Partial<AdminDictionary> = {
  navOverview: 'ସମୀକ୍ଷା (Overview)',
  navClients: 'ଗ୍ରାହକ ଓ କୋଠାବାଡ଼ି',
  navEquipment: 'ଅଗ୍ନିଶମନ ଉପକରଣ',
  navInspections: 'ଯାଞ୍ଚ ଓ କାର୍ଯ୍ୟ',
  navFieldTeam: 'ଫିଲ୍ଡ ଟିମ୍ ଓ ଟେକ୍ନିସିଆନ୍',
  navReports: 'ଅନୁପାଳନ ରିପୋର୍ଟ',
  navSettings: 'ସେଟିଙ୍ଗ୍ସ',
  digestTitle: 'ଆଜି ଆପଣଙ୍କ ଦୃଷ୍ଟି ଆବଶ୍ୟକ',
  digestAllClear: 'ସବୁକିଛି ଠିକ୍ ଅଛି — କୌଣସି ସମସ୍ୟା ନାହିଁ 🎯',
  inspectionsSubtitle: 'ସ୍ଥଳରେ ସମ୍ପନ୍ନ ଯାଞ୍ଚ — ଫଳାଫଳ ଓ ଫଟୋ ପ୍ରମାଣ।',
  repairsSubtitle: 'ମରାମତି କାର୍ଯ୍ୟ — ନ୍ୟସ୍ତ କରନ୍ତୁ ଏବଂ ସମାପ୍ତ କରନ୍ତୁ।',
  techActive: 'ସକ୍ରିୟ (Active)',
  techBlocked: 'ବନ୍ଦ (Blocked)',
  actionSave: 'ସାଇତନ୍ତୁ',
  actionCancel: 'ବାତିଲ୍ କରନ୍ତୁ',
  guideInviteTechDesc: 'ଟେକ୍ନିସିଆନ୍ Google Play ରୁ VigilAMC Field ଇନଷ୍ଟଲ୍ କରନ୍ତି ଏବଂ ଏଠାରେ ତିଆରି ତଥ୍ୟରେ ସାଇନ୍ ଇନ୍ କରନ୍ତି',
  guidePlayStoreLink: 'Google Play ରେ ପାଆନ୍ତୁ',
  techSuccessPlayCopy: 'ଏହି লଗଇନ୍ ତଥ୍ୟ ସେୟାର୍ କରନ୍ତୁ — ଟେକ୍ନିସିଆନ୍ VigilAMC Field ଆଣ୍ଡ୍ରଏଡ୍ ଆପ୍ (Google Play) ରେ ସାଇନ୍ ଇନ୍ କରନ୍ତି।',
  techPlayStoreHint: 'ଟେକ୍ନିସିଆନ୍ VigilAMC Field ଆଣ୍ଡ୍ରଏଡ୍ ଆପ୍ (Google Play) ରେ ସାଇନ୍ ଇନ୍ କରନ୍ତି।',
  welcomeEyebrow: '🎉 ମାଗଣା ଟେଷ୍ଟିଂ ଆକ୍ସେସ୍ (FREE TESTING ACCESS)',
  welcomeHeading: 'ସ୍ୱାଗତ, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC କୁ ସ୍ୱାଗତ!',
  welcomeBody: '{agency} ଆମ ସହିତ ଯୋଡ଼ି ହୋଇଥିବାରୁ ଆনନ୍ଦିତ। VigilAMC ବର୍ତ୍ତମାନ ସକ୍ରିୟ ପରୀକ୍ଷଣରେ ଅଛି — ଏହି ପରୀକ୍ଷଣ ସମୟରେ ଆପଣଙ୍କ ଆକାଉଣ୍ଟକୁ ସବୁ ସୁବିଧার ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣା ଆକ୍ସେସ୍ ମିଳିବ। ଆପଣଙ୍କ ମତାମତ ଆମକୁ ସାହାଯ୍ୟ କରିବ।',
  welcomeAgencyFallback: 'ଆପଣଙ୍କ ୱାର୍କସ୍ପେସ୍',
  welcomeBullet1: 'ଆପଣଙ୍କ କୋଠା ଏବଂ ଅଗ୍ନିଶମନ ଉପକରଣ ଯୋଡ଼ନ୍ତୁ',
  welcomeBullet2: 'VigilAMC Field ଆଣ୍ଡ୍ରଏଡ୍ ଆପ୍ (Google Play) କୁ ଟେକ୍ନିସିଆନ୍ ଆମନ୍ତ୍ରଣ କରନ୍ତୁ',
  welcomeBullet3: 'ଆପଣଙ୍କ ପ୍ରଥମ ଅନୁପାଳନ ରିପୋର୍ଟ ପ୍ରସ୍ତୁତ କରନ୍ତୁ',
  welcomeCta: 'ଆରମ୍ଭ କରନ୍ତୁ',
  welcomeCloseAria: 'ସ୍ୱାଗତ ଡାଏଲଗ୍ ବନ୍ଦ କରନ୍ତୁ',
  welcomeFooter: 'ପ୍ରଶ୍ନ କିମ୍ବା ମତାମତ? vigilamc@gmail.com',
};

const DICTIONARY_AS: Partial<AdminDictionary> = {
  navOverview: 'অৱলোকন (Overview)',
  navClients: 'গ্ৰাহক আৰু ভৱনসমূহ',
  navEquipment: 'অগ্নি নিৰ্বাপক সঁজুলি',
  navInspections: 'পৰিদৰ্শন আৰু কাম',
  navFieldTeam: 'ফিল্ড দল আৰু কাৰিকৰ',
  navReports: 'প্ৰতিবেদন',
  navSettings: 'ছেটিংছ',
  digestTitle: 'আজি আপোনাৰ মনোযোগৰ প্ৰয়োজন',
  digestAllClear: 'সকলো ঠিকে আছে — কোনো সমস্যা নাই 🎯',
  inspectionsSubtitle: 'ক্ষেত্ৰত সম্পন্ন কৰা পৰিদৰ্শন — ফলাফল আৰু ছবি।',
  repairsSubtitle: 'মেৰামতিৰ কাম — আৱণ্টন কৰক আৰু সম্পূৰ্ণ কৰক।',
  techActive: 'সক্ৰিয় (Active)',
  techBlocked: 'অৱৰোধ (Blocked)',
  actionSave: 'সংৰক্ষণ কৰক',
  actionCancel: 'বাতিল কৰক',
  guideInviteTechDesc: 'কাৰিকৰসকলে Google Play ৰ পৰা VigilAMC Field ইনষ্টল কৰে আৰু ইয়াত সৃষ্টি কৰা তথ্যৰে ছাইন ইন কৰে',
  guidePlayStoreLink: 'Google Play ত পাওক',
  techSuccessPlayCopy: 'এই লগইন তথ্য শ্বেয়াৰ কৰক — কাৰিকৰে VigilAMC Field এণ্ড্ৰইড এপত (Google Play) ছাইন ইন কৰিব।',
  techPlayStoreHint: 'কাৰিকৰসকলে VigilAMC Field এণ্ড্ৰইড এপত (Google Play) ছাইন ইন কৰে।',
  welcomeEyebrow: '🎉 বিনামূলীয়া টেষ্টিং এক্সেছ (FREE TESTING ACCESS)',
  welcomeHeading: 'স্বাগতম, {firstName}!',
  welcomeHeadingFallback: 'VigilAMC লৈ স্বাগতম!',
  welcomeBody: '{agency} আমাৰ সৈতে যুক্ত হোৱাত আনন্দিত। VigilAMC বৰ্তমান সক্ৰিয় টেষ্টিঙত আছে — এই টেষ্টিং সময়ছোৱাত আপোনাৰ একাউণ্টে প্ৰতিটো সুবিধাৰ সম্পূৰ্ণ বিনামূলীয়া এক্সেছ পাব। আপোনাৰ মতামতে আমাক সহায় কৰিব।',
  welcomeAgencyFallback: 'আপোনাৰ ৱৰ্কস্পেচ',
  welcomeBullet1: 'আপোনাৰ ভৱন আৰু অগ্নি নিৰ্বাপক সঁজুলি যোগ কৰক',
  welcomeBullet2: 'VigilAMC Field এণ্ড্ৰইড এপলৈ (Google Play) কাৰিকৰসকলক আমন্ত্ৰণ জনাওক',
  welcomeBullet3: 'আপোনাৰ প্ৰথম অনুপালন প্ৰতিবেদন প্ৰস্তুত কৰক',
  welcomeCta: 'আৰম্ভ কৰক',
  welcomeCloseAria: 'স্বাগতম পপআপ বন্ধ কৰক',
  welcomeFooter: 'প্ৰশ্ন বা মতামত? vigilamc@gmail.com',
};

const DICTIONARY_UR: Partial<AdminDictionary> = {
  navOverview: 'جائزہ (Overview)',
  navClients: 'کلائنٹس اور عمارتیں',
  navEquipment: 'فائر سیفٹی آلات',
  navInspections: 'معائنہ اور کام',
  navFieldTeam: 'فیلڈ ٹیم اور ٹیکنیشنز',
  navReports: 'رپورٹس',
  navSettings: 'ترتیبات',
  digestTitle: 'آج آپ کی توجہ درکار ہے',
  digestAllClear: 'سب کچھ مکمل ہے — کوئی فوری مسئلہ نہیں 🎯',
  chartTitle: 'تعمیل اور فیلڈ پیشرفت',
  inspectionsSubtitle: 'ٹیکنیشنز کے ذریعہ مکمل کردہ معائنہ — نتائج اور تصدیق۔',
  repairsSubtitle: 'مرمت کے کام — تفویض کریں اور مکمل کریں۔',
  techActive: 'فعال (Active)',
  techBlocked: 'مسدود (Blocked)',
  actionSave: 'محفوظ کریں',
  actionCancel: 'منسوخ کریں',
  guideInviteTechDesc: 'ٹیکنیشنز Google Play سے VigilAMC Field انسٹال کرتے ہیں اور یہاں بنائی گئی اسناد کے ساتھ سائن ان کرتے ہیں',
  guidePlayStoreLink: 'Google Play پر حاصل کریں',
  techSuccessPlayCopy: 'یہ اسناد شیئر کریں — ٹیکنیشن VigilAMC Field اینڈرائیڈ ایپ (Google Play) پر سائن ان کرتا ہے۔',
  techPlayStoreHint: 'ٹیکنیشنز VigilAMC Field اینڈرائیڈ ایپ (Google Play) پر سائن ان کرتے ہیں۔',
  welcomeEyebrow: '🎉 مفت ٹیسٹنگ رسائی (FREE TESTING ACCESS)',
  welcomeHeading: 'خوش آمدید، {firstName}!',
  welcomeHeadingFallback: 'VigilAMC میں خوش آمدید!',
  welcomeBody: '{agency} کا ہمارے ساتھ شامل ہونا خوشی کی بات ہے۔ VigilAMC فعال ٹیسٹنگ کے مرحلے میں ہے — اس ٹیسٹنگ مدت کے دوران آپ کے اکاؤنٹ کو ہر فیچر تک مکمل مفت رسائی حاصل ہے۔ آپ کی رائے ہمیں پروڈکٹ کو بہتر بنانے میں مدد دیتی ہے۔',
  welcomeAgencyFallback: 'آپ کا ورک اسپیس',
  welcomeBullet1: 'اپنی عمارتیں اور فائر سیفٹی آلات شامل کریں',
  welcomeBullet2: 'ٹیکنیشنز کو VigilAMC Field اینڈرائیڈ ایپ (Google Play) پر مدعو کریں',
  welcomeBullet3: 'اپنی پہلی تعمیل رپورٹ تیار کریں',
  welcomeCta: 'شروع کریں',
  welcomeCloseAria: 'خوش آمدید ونڈو بند کریں',
  welcomeFooter: 'سوالات یا رائے؟ vigilamc@gmail.com',
};

const DICTIONARIES: Record<string, Partial<AdminDictionary>> = {
  en: DICTIONARY_EN,
  hi: DICTIONARY_HI,
  mr: DICTIONARY_MR,
  gu: DICTIONARY_GU,
  ta: DICTIONARY_TA,
  te: DICTIONARY_TE,
  kn: DICTIONARY_KN,
  ml: DICTIONARY_ML,
  bn: DICTIONARY_BN,
  pa: DICTIONARY_PA,
  or: DICTIONARY_OR,
  as: DICTIONARY_AS,
  ur: DICTIONARY_UR,
};

/**
 * Returns a complete dictionary for the given language code with fallback:
 * Selected Language -> Hindi -> English
 */
export function getAdminT(langCode = 'en'): AdminDictionary {
  const code = (langCode || 'en').toLowerCase().trim();
  const direct = DICTIONARIES[code] || {};
  const fallbackHi = DICTIONARIES['hi'] || {};

  const result: any = { ...DICTIONARY_EN };

  // Overlay Hindi for regional closeness if available
  for (const k in fallbackHi) {
    if (fallbackHi[k as keyof AdminDictionary]) {
      result[k] = fallbackHi[k as keyof AdminDictionary];
    }
  }

  // Overlay direct chosen dictionary
  for (const k in direct) {
    if (direct[k as keyof AdminDictionary]) {
      result[k] = direct[k as keyof AdminDictionary];
    }
  }

  // Always fall back to English for any still missing key
  for (const k in DICTIONARY_EN) {
    if (!result[k]) {
      result[k] = DICTIONARY_EN[k as keyof AdminDictionary];
    }
  }

  return result as AdminDictionary;
}

export const adminDictEnglish = DICTIONARY_EN;
export const getAdminDictionary = getAdminT;
