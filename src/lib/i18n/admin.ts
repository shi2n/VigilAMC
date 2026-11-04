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
