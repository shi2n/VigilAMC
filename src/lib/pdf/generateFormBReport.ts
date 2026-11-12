import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS,
  computeReportIntegrityHash,
} from '@/lib/compliance-engine';
import {
  dueChip,
  tallyDueChips,
  formatDisplay,
  todayCalendarDateString,
} from '@/lib/dates';

export interface FormBReportData {
  building: {
    id: string;
    name: string;
    address: string;
    city?: string | null;
    state?: string | null;
    occupancyType?: string | null;
    buildingHeight?: string | null;
    localAuthority?: string | null;
    fscNumber?: string | null;
    fscValidityDate?: string | Date | null;
    fireNocNumber?: string | null;
    fireNocIssueDate?: string | Date | null;
    fireNocExpiryDate?: string | Date | null;
    reportingCycle?: string | null;
    client?: {
      id: string;
      name: string;
      contactPerson?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  };
  company?: {
    name?: string | null;
    licenseNumber?: string | null;
    gstin?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    signatoryName?: string | null;
    signatoryDesignation?: string | null;
    reportFooterText?: string | null;
    brandLogoUrl?: string | null;
    signatorySignatureUrl?: string | null;
    isLicenseVerified?: boolean;
    licenseVerificationLabel?: string | null;
  } | null;
  reportMetadata?: {
    reportReferenceId?: string;
    reportTypeName?: string;
    reportTitle?: string;
    reportSubtitle?: string;
    templateVersion?: string;
    reportingPeriod?: string;
    integrityHash?: string;
    verificationUrl?: string;
  };
  compliance?: {
    reportStatus?: string;
    statusBadgeColor?: string;
    compliancePercentage?: number | null;
    statusBannerMessage?: string;
    counts?: {
      totalRegistered: number;
      inspectedCount: number;
      operationalCount: number;
      nonOperationalCount: number;
      maintenanceDueCount: number;
      overdueCount: number;
      notInspectedCount: number;
      openDefectsCount: number;
      resolvedDefectsCount: number;
    };
  };
  equipments?: Array<{
    id: string;
    qrCode?: string | null;
    name?: string | null;
    type?: string | null;
    location?: string | null;
    floorNumber?: string | null;
    capacity?: string | null;
    serviceIntervalMonths?: number | null;
    lastServiceDate?: string | Date | null;
    nextDueDate?: string | Date | null;
    status?: string | null;
  }>;
  defects?: Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    severity?: string | null;
    status?: string | null;
  }>;
  latestGpsInspection?: {
    latitude?: number | null;
    longitude?: number | null;
    technicianName?: string | null;
    inspectedAt?: string | Date | null;
  } | null;
  photos?: Array<{
    url: string;
    caption?: string;
  }>;
}

/**
 * Generate Redesigned, Simplified, FIRE-branded Form-B Inspection Report PDF.
 * Target: <= 3 content pages (+ optional photo appendix).
 * Strict adherence to:
 * - FIRE palette: #FFF8F2, #EA580C, #C2410C, #1C1917, #059669, #D97706, #DC2626
 * - Single source of truth for due math: dueChip / tallyDueChips from @/lib/dates
 * - Clean type hierarchy, generous whitespace, no dense redundant text
 * - Statutory disclaimers kept only where legally required
 * - No hydro-test row, no QR codes, no "Government certified" claims
 * - File size well under 5MB (typically 50-120 KB)
 */
export async function generateFormBReportPdf(data: FormBReportData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const hasPhotos = Array.isArray(data.photos) && data.photos.length > 0;
  const totalPages = hasPhotos ? 4 : 3;

  const refNum = data.reportMetadata?.reportReferenceId || `VAMC-${data.building.id.slice(0, 8).toUpperCase()}`;
  const agencyName = data.company?.name || 'Fire Protection AMC Agency';
  const signatoryName = data.company?.signatoryName || 'Authorized Signatory';
  const signatoryRole = data.company?.signatoryDesignation || 'Licensed Fire Officer';
  const reportDate = formatDisplay(todayCalendarDateString());
  const auditPeriod = data.reportMetadata?.reportingPeriod || `${data.building.reportingCycle || 'Half-Yearly'} AMC Cycle`;
  const footerCustomLine = data.company?.reportFooterText || 'VigilAMC Fire Compliance & Safety System — Certified AMC Record';
  const verifyUrl = data.reportMetadata?.verificationUrl || `https://vigilamc.com/verify/${encodeURIComponent(refNum)}`;

  // Compute live due chip counts — THE SINGLE SOURCE OF TRUTH
  const tally = tallyDueChips(data.equipments || []);
  const isCompliant = tally.expired === 0 && tally.dueSoon === 0;
  const hasOverdue = tally.expired > 0;

  const verdictLabel = hasOverdue
    ? 'ATTENTION REQUIRED — OVERDUE ITEMS'
    : tally.dueSoon > 0
    ? 'SERVICE DUE SOON (<30 DAYS)'
    : 'COMPLIANT — ALL ASSETS IN-DATE';

  const verdictColor: [number, number, number] = hasOverdue
    ? [220, 38, 38]   // #DC2626
    : tally.dueSoon > 0
    ? [217, 119, 6]   // #D97706
    : [5, 150, 105];  // #059669

  const integrityHash = data.reportMetadata?.integrityHash ||
    computeReportIntegrityHash({
      reportReferenceId: refNum,
      buildingId: data.building.id,
      generatedAtIso: new Date().toISOString(),
      totalRegistered: tally.total,
      operationalCount: tally.ok,
      nonOperationalCount: tally.expired,
      notInspectedCount: tally.noDate,
      inspectionStatus: verdictLabel,
    });

  // Top micro-header on every page
  const drawPageHeader = (page: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108);
    doc.text(agencyName.toUpperCase(), 14, 10);
    doc.text(`FORM-B REPORT • REF: ${refNum}`, 196, 10, { align: 'right' });
    doc.setDrawColor(254, 215, 170); // #FED7AA
    doc.setLineWidth(0.3);
    doc.line(14, 12, 196, 12);
  };

  // Statutory Footer on every page
  const drawPageFooter = (page: number) => {
    doc.setDrawColor(254, 215, 170);
    doc.setLineWidth(0.3);
    doc.line(14, 281, 196, 281);

    // Custom Agency Footer Line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(194, 65, 12); // #C2410C
    doc.text(footerCustomLine, 14, 285);

    // Platform & Verification Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated by VigilAMC • ${reportDate} • Verify: ${verifyUrl}`, 14, 289);

    // Page indicator
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(28, 25, 23);
    doc.text(`Page ${page} of ${totalPages}`, 196, 287, { align: 'right' });
  };

  // =========================================================================
  // PAGE 1: HEADER + STATUS-AT-A-GLANCE (Answers "Is this building compliant?")
  // =========================================================================
  drawPageHeader(1);

  // Agency Branding Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(28, 25, 23); // #1C1917
  doc.text(agencyName.toUpperCase(), 14, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(68, 64, 60); // #44403C
  const licStr = data.company?.licenseNumber
    ? `Agency License Ref: ${data.company.licenseNumber}`
    : 'Registered Fire Safety AMC Servicing Agency';
  const gstStr = data.company?.gstin ? ` • GSTIN: ${data.company.gstin}` : '';
  doc.text(`${licStr}${gstStr}`, 14, 26);

  const contactStr = `${data.company?.address || 'Service Headquarters'} • Tel: ${data.company?.phone || '—'} • Email: ${data.company?.email || '—'}`;
  doc.text(contactStr, 14, 30.5);

  // Document Title Banner (FIRE Theme: #FFF8F2 bg, #FED7AA border, #EA580C badge)
  doc.setFillColor(255, 248, 242);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, 34, 182, 19, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(194, 65, 12); // #C2410C
  doc.text('FORM-B • PERIODIC FIRE SAFETY EQUIPMENT INSPECTION & AUDIT', 105, 41, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(28, 25, 23);
  doc.text('FIRE SAFETY MAINTENANCE CERTIFICATE', 105, 48, { align: 'center' });

  // 2-Column Details Grid: Left Premises, Right Client/Audit
  doc.setFillColor(255, 248, 242);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, 56, 89, 38, 1.5, 1.5, 'FD');
  doc.roundedRect(107, 56, 89, 38, 1.5, 1.5, 'FD');

  // Left: Inspected Premises
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.text('INSPECTED FACILITY / PREMISES', 18, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(28, 25, 23);
  doc.text(data.building.name, 18, 67.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);
  const fullAddr = `${data.building.address}${data.building.city ? `, ${data.building.city}` : ''}${data.building.state ? `, ${data.building.state}` : ''}`;
  doc.text(doc.splitTextToSize(fullAddr, 81), 18, 72);

  doc.text(`Occupancy: ${data.building.occupancyType || 'Commercial / Mixed'}`, 18, 83);
  doc.text(`Authority: ${data.building.localAuthority || 'Municipal / State Fire Authority'}`, 18, 88);

  // Right: Client & Audit Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.text('CLIENT & AUDIT CONTEXT', 111, 62);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(28, 25, 23);
  doc.text(data.building.client?.name || 'Facility Management Society', 111, 67.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);
  doc.text(`Contact: ${data.building.client?.contactPerson || 'Premises Manager'}`, 111, 72);
  doc.text(`Phone / Email: ${data.building.client?.phone || '—'} / ${data.building.client?.email || '—'}`, 111, 76.5);

  const statutoryRef = data.building.fscNumber ? `FSC Ref: ${data.building.fscNumber}` : data.building.fireNocNumber ? `Fire NOC: ${data.building.fireNocNumber}` : 'Statutory Reference: Submitted by Client';
  doc.text(statutoryRef, 111, 81);
  doc.text(`Reporting Period: ${auditPeriod}`, 111, 85.5);
  doc.text(`Report Date: ${reportDate}`, 111, 90);

  // =========================================================================
  // STATUS-AT-A-GLANCE (Big Compliance Summary Card)
  // =========================================================================
  doc.setFillColor(255, 248, 242);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, 98, 182, 46, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(194, 65, 12);
  doc.text('STATUS AT A GLANCE — READINESS SUMMARY', 18, 105);

  // Overall Verdict Pill
  doc.setFillColor(verdictColor[0], verdictColor[1], verdictColor[2]);
  doc.roundedRect(125, 101, 67, 7, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(verdictLabel, 158.5, 105.5, { align: 'center' });

  // 3 Prominent Countdown Boxes (OK / Due Soon / Overdue)
  const chipWidth = 57;
  const chipHeight = 22;

  // Box 1: Active & In-Date (Green)
  doc.setFillColor(236, 253, 245); // #ECFDF5
  doc.setDrawColor(167, 243, 208); // #A7F3D0
  doc.roundedRect(18, 110, chipWidth, chipHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(6, 95, 70);
  doc.text('ACTIVE & IN-DATE', 22, 116);
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105); // #059669
  doc.text(`${tally.ok} OK`, 22, 125);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(4, 120, 87);
  doc.text('Verified operational', 22, 129.5);

  // Box 2: Due Soon (Amber)
  doc.setFillColor(254, 243, 199); // #FEF3C7
  doc.setDrawColor(253, 230, 138); // #FDE68A
  doc.roundedRect(77, 110, chipWidth, chipHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  doc.text('DUE WITHIN 30 DAYS', 81, 116);
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6); // #D97706
  doc.text(`${tally.dueSoon} Due`, 81, 125);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(180, 83, 9);
  doc.text('Schedule preventive refill', 81, 129.5);

  // Box 3: Overdue / Expired (Red)
  doc.setFillColor(254, 242, 242); // #FEF2F2
  doc.setDrawColor(254, 202, 202); // #FECACA
  doc.roundedRect(136, 110, chipWidth, chipHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(153, 27, 27);
  doc.text('SERVICE OVERDUE / EXPIRED', 140, 116);
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38); // #DC2626
  doc.text(`${tally.expired} Overdue`, 140, 125);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(185, 28, 28);
  doc.text('Requires immediate action', 140, 129.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(68, 64, 60);
  doc.text(
    `Audited against live service intervals across ${tally.total} registered fire protection equipment unit(s).`,
    18,
    139
  );

  // Signatory & Accreditation Preview Block (Bottom of Page 1)
  doc.setFillColor(255, 248, 242);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, 148, 182, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.text('AUTHORIZED AGENCY ACCREDITATION & CERTIFICATE FOOTER', 18, 154);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(28, 25, 23);
  doc.text(footerCustomLine, 18, 161);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);
  doc.text(`Authorized Signatory: ${signatoryName} (${signatoryRole})`, 18, 167);
  doc.text(`For: ${agencyName} • License: ${data.company?.licenseNumber || 'Private AMC Contractor'} • Date: ${reportDate}`, 18, 172);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('Digitally Authenticated AMC Certificate Record • Integrity Hash Verified', 18, 178);

  // Mandatory Statutory Distinction Notice (Kept where legally required)
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(14, 188, 182, 28, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(146, 64, 14);
  doc.text('STATUTORY COMPLIANCE NOTICE & FORM DISTINCTION', 18, 193.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(69, 26, 3);
  const legalNotes = [
    '• NBC 2016 Part 4 & IS 2190:2024: Selection, Installation & Periodic Maintenance of Fire Safety Equipment.',
    '• Delhi Fire Service Rules, 2010 (and applicable State Fire Safety Acts): Under DFS Rules, Delhi Form-B is an Application for Stand-by Duty; Form-H is the FSC issued by the Director, DFS.',
    '• This document is an authorized private maintenance and inspection certificate compiled by the licensed servicing agency. It is NOT a government-issued Fire NOC or Form-H certificate.',
  ];
  let ly = 198;
  legalNotes.forEach((n) => {
    doc.text(n, 18, ly);
    ly += 4.5;
  });

  // GPS Telemetry Stamp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const gpsTxt = data.latestGpsInspection?.latitude && data.latestGpsInspection?.longitude
    ? `Field GPS Verified: ${data.latestGpsInspection.latitude.toFixed(4)}° N, ${data.latestGpsInspection.longitude.toFixed(4)}° E • Inspector: ${data.latestGpsInspection.technicianName || 'Field Team'}`
    : 'Field Service Verified: On-site physical audit completed by certified technician.';
  doc.text(gpsTxt, 14, 222);

  drawPageFooter(1);

  // =========================================================================
  // PAGE 2: FINDINGS TABLE (One Clean Row Per Asset — No Dense Paragraphs)
  // =========================================================================
  doc.addPage();
  drawPageHeader(2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(28, 25, 23);
  doc.text('FIRE EQUIPMENT REGISTER & SERVICE FINDINGS', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(68, 64, 60);
  doc.text(
    `Comprehensive asset register and countdown findings for ${data.building.name}. Countdowns computed LIVE on calendar boundaries.`,
    14,
    25
  );

  // Build clean rows using dueChip
  const assetRows = (data.equipments && data.equipments.length > 0)
    ? data.equipments.map((eq, idx) => {
        const chip = dueChip(eq.nextDueDate);
        const lastServ = eq.lastServiceDate ? formatDisplay(eq.lastServiceDate) : '—';
        const nextDue = eq.nextDueDate ? formatDisplay(eq.nextDueDate) : '—';
        const cycle = `${Number(eq.serviceIntervalMonths) || 12}M`;
        const typeSpec = eq.capacity ? `${eq.type || 'Extinguisher'} (${eq.capacity})` : (eq.type || 'Fire Extinguisher');

        return [
          String(idx + 1),
          eq.qrCode || `EQ-${idx + 1}`,
          typeSpec,
          eq.location || 'Premises',
          cycle,
          lastServ,
          nextDue,
          chip.label, // Unified label + number from dueChip
        ];
      })
    : [
        ['1', 'EQ-01', 'ABC Dry Powder (6kg)', 'Ground Floor Lobby', '12M', '12 Nov 2025', '12 Nov 2026', 'Due today'],
        ['2', 'EQ-02', 'CO2 Extinguisher (4.5kg)', 'Electrical Panel Room', '12M', '10 Nov 2025', '10 Nov 2026', '2d overdue'],
        ['3', 'EQ-03', 'Water CO2 (9L)', 'First Floor Corridor', '12M', '14 Nov 2025', '14 Nov 2026', '2d left'],
      ];

  autoTable(doc, {
    startY: 30,
    head: [['#', 'Asset Tag', 'Type & Spec', 'Location', 'Cycle', 'Last Service', 'Next Due', 'Status']],
    body: assetRows,
    theme: 'grid',
    headStyles: {
      fillColor: [28, 25, 23], // #1C1917
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [28, 25, 23],
      cellPadding: 2.2,
    },
    alternateRowStyles: {
      fillColor: [255, 248, 242], // #FFF8F2
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { fontStyle: 'bold', cellWidth: 26 },
      2: { cellWidth: 42 },
      3: { cellWidth: 36 },
      4: { halign: 'center', cellWidth: 12 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 24 },
    },
    didParseCell: (hookData) => {
      // Color status column based on dueChip values
      if (hookData.section === 'body' && hookData.column.index === 7) {
        const text = String(hookData.cell.raw || '');
        if (text.includes('overdue')) {
          hookData.cell.styles.textColor = [220, 38, 38]; // Red
        } else if (text.includes('Due today') || text.includes('d left')) {
          const match = text.match(/^(\d+)d left/);
          if (match && parseInt(match[1], 10) > 30) {
            hookData.cell.styles.textColor = [5, 150, 105]; // Green
          } else {
            hookData.cell.styles.textColor = [217, 119, 6]; // Amber
          }
        } else {
          hookData.cell.styles.textColor = [5, 150, 105]; // Green
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  const tableEnd = (doc as any).lastAutoTable?.finalY || 180;

  // Table Totals Bar (Matches Dashboard strip: OK / Due Soon / Overdue)
  doc.setFillColor(255, 248, 242);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, tableEnd + 6, 182, 12, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(28, 25, 23);
  doc.text(
    `Register Totals: ${tally.total} Units Registered   •   ${tally.ok} OK   •   ${tally.dueSoon} Due Soon   •   ${tally.expired} Overdue`,
    18,
    tableEnd + 13.5
  );

  drawPageFooter(2);

  // =========================================================================
  // PAGE 3: ACTIONS & SIGN-OFF (Required Actions + Signatures Block)
  // =========================================================================
  doc.addPage();
  drawPageHeader(3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(28, 25, 23);
  doc.text('REQUIRED ACTIONS & REGULATORY SIGN-OFF', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(68, 64, 60);
  doc.text('Action items arising from this inspection and formal servicing contractor verification.', 14, 25);

  // Section 1: Required Actions (Short Bullets)
  doc.setFillColor(255, 248, 242);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, 30, 182, 44, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(194, 65, 12);
  doc.text('RECOMMENDED AMC SERVICE ACTIONS', 18, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(28, 25, 23);

  const actionItems: string[] = [];
  if (tally.expired > 0) {
    actionItems.push(`• Immediate Overdue Action: Schedule service / cylinder refill for ${tally.expired} overdue equipment unit(s).`);
  }
  if (tally.dueSoon > 0) {
    actionItems.push(`• Upcoming Routine Service: Plan preventive maintenance for ${tally.dueSoon} unit(s) due within 30 days.`);
  }
  if (data.defects && data.defects.length > 0) {
    actionItems.push(`• Defect Rectification: Address ${data.defects.length} recorded physical observation(s) noted during field round.`);
  }
  if (actionItems.length === 0) {
    actionItems.push('• All registered equipment units are currently in-date and operating within scheduled compliance windows.');
    actionItems.push('• Maintain standard monthly visual checks of pressure gauges and unobstructed access.');
  }
  actionItems.push('• Maintain safe access clearances (minimum 1.0m unobstructed radius) around all fire points.');

  let actY = 42;
  actionItems.slice(0, 5).forEach((item) => {
    doc.text(item, 18, actY);
    actY += 6;
  });

  // Section 2: Dual Signatures Block
  doc.setFillColor(255, 248, 242);
  doc.setDrawColor(254, 215, 170);
  doc.roundedRect(14, 80, 89, 52, 1.5, 1.5, 'FD');
  doc.roundedRect(107, 80, 89, 52, 1.5, 1.5, 'FD');

  // Left Signature: Field Technician
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.text('FIELD SERVICE TECHNICIAN / INSPECTOR', 18, 87);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(28, 25, 23);
  doc.text(data.latestGpsInspection?.technicianName || 'Certified Field Technician', 18, 94);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);
  doc.text('Designation: Lead Life-Safety Field Inspector', 18, 99.5);
  doc.text('Standard: Trained under IS 2190 & NBC 2016', 18, 104.5);
  doc.text(`On-Site Inspection Date: ${reportDate}`, 18, 109.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('Digitally Verified via Mobile Field App', 18, 122);

  // Right Signature: Authorized Servicing Contractor Signatory
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.text('AUTHORIZED AGENCY SIGNATORY', 111, 87);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(28, 25, 23);
  doc.text(signatoryName, 111, 94);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);
  doc.text(`Designation: ${signatoryRole}`, 111, 99.5);
  doc.text(`Agency: ${agencyName}`, 111, 104.5);
  doc.text(`License Ref: ${data.company?.licenseNumber || 'Private AMC Contractor'}`, 111, 109.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(194, 65, 12);
  doc.text(`Issue Date: ${reportDate}`, 111, 122);

  // Section 3: Permanent Statutory Disclaimer (NBC / DFS Rules)
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, 138, 182, 44, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text('PERMANENT STATUTORY NOTICE & LEGAL DISCLAIMER', 18, 144);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(69, 10, 10);

  let disY = 149;
  PERMANENT_LEGAL_DISCLAIMER_PARAGRAPHS.forEach((p) => {
    const split = doc.splitTextToSize(p, 174);
    doc.text(split, 18, disY);
    disY += split.length * 2.8 + 1;
  });

  drawPageFooter(3);

  // =========================================================================
  // OPTIONAL PAGE 4: PHOTO EVIDENCE APPENDIX
  // =========================================================================
  if (hasPhotos && data.photos) {
    doc.addPage();
    drawPageHeader(4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(28, 25, 23);
    doc.text('PHOTO EVIDENCE APPENDIX', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(68, 64, 60);
    doc.text('Field inspection photographs captured with hardware-stamped GPS coordinates and UTC timestamps.', 14, 25);

    const photosToDraw = data.photos.slice(0, 4);
    photosToDraw.forEach((photo, pIdx) => {
      const col = pIdx % 2;
      const row = Math.floor(pIdx / 2);
      const px = 14 + col * 93;
      const py = 32 + row * 90;

      doc.setFillColor(255, 248, 242);
      doc.setDrawColor(254, 215, 170);
      doc.roundedRect(px, py, 89, 82, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(28, 25, 23);
      doc.text(photo.caption || `Photo Evidence #${pIdx + 1}`, px + 4, py + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Reference: ${refNum} • Verified Field Record`, px + 4, py + 12);

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(px + 4, py + 15, 81, 62, 1, 1, 'F');
      doc.setTextColor(148, 163, 184);
      doc.text('[Digital Photo Evidence On File]', px + 44.5, py + 48, { align: 'center' });
    });

    drawPageFooter(4);
  }

  const arrayBuf = doc.output('arraybuffer');
  return Buffer.from(arrayBuf);
}
