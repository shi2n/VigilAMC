export interface PortalDictionary {
  portalTitle: string;
  portalSubtitle: string;
  loginTitle: string;
  loginSubtitle: string;
  loginEmailLabel: string;
  loginBtn: string;
  loginLoading: string;
  loginSentMsg: string;
  loginAgencyLink: string;
  portfolioBuildings: string;
  portfolioAssets: string;
  portfolioCompliance: string;
  portfolioExpiring: string;
  buildingsListTitle: string;
  colBuilding: string;
  colCity: string;
  colCycle: string;
  colStatus: string;
  colLastInspection: string;
  inspectionsHistoryTitle: string;
  colDate: string;
  colTech: string;
  colSummary: string;
  colGauge: string;
  btnViewReport: string;
  btnAcknowledge: string;
  acknowledging: string;
  badgeAcknowledged: string;
  emptyInspections: string;
  contactAgencyPrompt: string;
  footerLogged: string;
  statusOk: string;
  statusDueSoon: string;
  statusOverdue: string;
  signOutBtn: string;
}

export const PORTAL_DICTIONARY_EN: PortalDictionary = {
  portalTitle: 'Client Compliance Portal',
  portalSubtitle: 'Certified Fire Safety AMC & Form-B Statutory Compliance Records',
  loginTitle: 'Client Portal',
  loginSubtitle: 'Sign in with the email your service agency invited',
  loginEmailLabel: 'Official / Society Email Address',
  loginBtn: 'Send Secure Sign-In Link',
  loginLoading: 'Sending magic link...',
  loginSentMsg: 'Sign-in link sent! Please check your inbox and click the link to enter your portal.',
  loginAgencyLink: 'Are you a fire safety service agency? Sign in to the Agency Admin Dashboard →',
  portfolioBuildings: 'Buildings & Towers',
  portfolioAssets: 'Total Fire Assets',
  portfolioCompliance: 'Compliance Score',
  portfolioExpiring: 'Expiring in ≤30 Days',
  buildingsListTitle: 'Monitored Buildings & Sites',
  colBuilding: 'Building Name',
  colCity: 'City / Region',
  colCycle: 'Statutory Cycle',
  colStatus: 'Compliance Status',
  colLastInspection: 'Last Certified Inspection',
  inspectionsHistoryTitle: 'Approved Field Inspection History',
  colDate: 'Inspection Date',
  colTech: 'Field Technician',
  colSummary: 'Findings & Condition',
  colGauge: 'Pressure Gauge',
  btnViewReport: 'View Statutory Form-B Report',
  btnAcknowledge: 'Acknowledge Receipt',
  acknowledging: 'Recording acknowledgement...',
  badgeAcknowledged: 'Acknowledged ✓',
  emptyInspections: 'No certified inspections recorded yet for this facility.',
  contactAgencyPrompt: 'Need scheduled maintenance, testing, or refill? Contact your servicing agency:',
  footerLogged: 'Access is logged · Privacy policy',
  statusOk: 'COMPLIANT',
  statusDueSoon: 'DUE SOON',
  statusOverdue: 'OVERDUE',
  signOutBtn: 'Sign Out',
};

export const PORTAL_DICTIONARY_HI: PortalDictionary = {
  portalTitle: 'ग्राहक अनुपालन पोर्टल',
  portalSubtitle: 'प्रमाणित अग्नि सुरक्षा एएमसी एवं फॉर्म-बी वैधानिक अनुपालन रिकॉर्ड',
  loginTitle: 'क्लाइंट पोर्टल (Client Portal)',
  loginSubtitle: 'अपनी सेवा एजेंसी द्वारा आमंत्रित ईमेल से साइन इन करें',
  loginEmailLabel: 'आधिकारिक / सोसाइटी ईमेल पता',
  loginBtn: 'सुरक्षित साइन-इन लिंक भेजें',
  loginLoading: 'मैजिक लिंक भेजा जा रहा है...',
  loginSentMsg: 'साइन-इन लिंक भेज दिया गया है! कृपया अपना इनबॉक्स देखें और पोर्टल में प्रवेश करने के लिए लिंक पर क्लिक करें।',
  loginAgencyLink: 'क्या आप अग्नि सुरक्षा एजेंसी हैं? एजेंसी एडमिन डैशबोर्ड में साइन इन करें →',
  portfolioBuildings: 'भवन और टावर',
  portfolioAssets: 'कुल अग्निशमन उपकरण',
  portfolioCompliance: 'अनुपालन स्कोर',
  portfolioExpiring: '30 दिनों के भीतर देय',
  buildingsListTitle: 'निगरानी अधीन भवन एवं स्थल',
  colBuilding: 'भवन का नाम',
  colCity: 'शहर / क्षेत्र',
  colCycle: 'वैधानिक चक्र',
  colStatus: 'अनुपालन स्थिति',
  colLastInspection: 'अंतिम प्रमाणित निरीक्षण',
  inspectionsHistoryTitle: 'स्वीकृत फील्ड निरीक्षण इतिहास',
  colDate: 'निरीक्षण तिथि',
  colTech: 'फील्ड तकनीशियन',
  colSummary: 'निष्कर्ष एवं स्थिति',
  colGauge: 'प्रेशर गेज',
  btnViewReport: 'वैधानिक फॉर्म-बी रिपोर्ट देखें',
  btnAcknowledge: 'पावती स्वीकार करें (Acknowledge)',
  acknowledging: 'पावती दर्ज की जा रही है...',
  badgeAcknowledged: 'प्राप्ति स्वीकार ✓',
  emptyInspections: 'इस भवन के लिए अभी तक कोई प्रमाणित निरीक्षण दर्ज नहीं है।',
  contactAgencyPrompt: 'रखरखाव, परीक्षण या रीफिल की आवश्यकता है? अपनी सेवा एजेंसी से संपर्क करें:',
  footerLogged: 'पहुंच लॉग की गई है · गोपनीयता नीति',
  statusOk: 'अनुकूल (OK)',
  statusDueSoon: 'जल्द देय (DUE SOON)',
  statusOverdue: 'समय सीमा समाप्त (OVERDUE)',
  signOutBtn: 'साइन आउट',
};

export function getPortalDictionary(lang: string = 'en'): PortalDictionary {
  if (lang === 'hi') return PORTAL_DICTIONARY_HI;
  return PORTAL_DICTIONARY_EN;
}
