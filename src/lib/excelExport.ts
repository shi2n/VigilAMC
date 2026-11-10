import * as XLSX from 'xlsx';
import {
  formatDisplay,
  dueState,
  todayCalendarDateString,
  toDateInputString,
} from './dates';

export interface ExportColumn {
  id: string;
  label: string;
  defaultSelected?: boolean;
  getValue: (item: any) => string | number;
}

export const EXPORT_CONFIGS: Record<
  string,
  {
    title: string;
    filenamePrefix: string;
    sheetName: string;
    statuses: { id: string; label: string }[];
    columns: ExportColumn[];
  }
> = {
  CLIENTS: {
    title: 'Clients & Societies',
    filenamePrefix: 'vigilamc_clients',
    sheetName: 'Clients',
    statuses: [
      { id: 'ALL', label: 'All Clients' },
      { id: 'ACTIVE', label: 'Active Contracts' },
      { id: 'EXPIRING_SOON', label: 'Expiring Soon' },
    ],
    columns: [
      { id: 'name', label: 'Client / Society Name', defaultSelected: true, getValue: (c) => c.name || '—' },
      { id: 'contactPerson', label: 'Contact Person', defaultSelected: true, getValue: (c) => c.contactPerson || '—' },
      { id: 'phone', label: 'Phone', defaultSelected: true, getValue: (c) => c.phone || '—' },
      { id: 'email', label: 'Email', defaultSelected: true, getValue: (c) => c.email || '—' },
      { id: 'buildingsCount', label: 'Total Buildings', defaultSelected: true, getValue: (c) => c.buildings?.length ?? c._count?.buildings ?? 0 },
      { id: 'createdAt', label: 'Registered On', defaultSelected: true, getValue: (c) => c.createdAt ? formatDisplay(c.createdAt) : '—' },
    ],
  },
  BUILDINGS: {
    title: 'Buildings & Towers',
    filenamePrefix: 'vigilamc_buildings',
    sheetName: 'Buildings',
    statuses: [
      { id: 'ALL', label: 'All Statuses' },
      { id: 'COMPLIANT', label: '100% Compliant' },
      { id: 'DUE_SOON', label: 'Due Within 30d' },
      { id: 'OVERDUE', label: 'Overdue' },
    ],
    columns: [
      { id: 'name', label: 'Building / Tower Name', defaultSelected: true, getValue: (b) => b.name || '—' },
      { id: 'clientName', label: 'Client / Society', defaultSelected: true, getValue: (b) => b.client?.name || '—' },
      { id: 'address', label: 'Premises Address', defaultSelected: true, getValue: (b) => b.address || '—' },
      { id: 'complianceCycle', label: 'Compliance Cycle', defaultSelected: true, getValue: (b) => b.complianceCycle || 'Form-B' },
      { id: 'nextFilingDueDate', label: 'Next Filing Due', defaultSelected: true, getValue: (b) => b.nextFilingDueDate ? formatDisplay(b.nextFilingDueDate) : '—' },
      { id: 'totalEquipments', label: 'Total Assets', defaultSelected: true, getValue: (b) => b.totalEquipments ?? b.equipments?.length ?? 0 },
      { id: 'overallStatus', label: 'Compliance Status', defaultSelected: true, getValue: (b) => b.overallStatus || 'COMPLIANT' },
    ],
  },
  FIRE_ASSETS: {
    title: 'Fire Equipment & Assets',
    filenamePrefix: 'vigilamc_fire_assets',
    sheetName: 'Fire Assets',
    statuses: [
      { id: 'ALL', label: 'All Assets' },
      { id: 'COMPLIANT', label: 'Compliant' },
      { id: 'DUE_SOON', label: 'Due Soon' },
      { id: 'OVERDUE', label: 'Overdue' },
    ],
    columns: [
      { id: 'qrCode', label: 'Asset ID', defaultSelected: true, getValue: (a) => a.qrCode || '—' },
      { id: 'building', label: 'Building / Tower', defaultSelected: true, getValue: (a) => a.building?.name || '—' },
      { id: 'type', label: 'Asset Type', defaultSelected: true, getValue: (a) => a.type || '—' },
      { id: 'capacity', label: 'Capacity / Spec', defaultSelected: true, getValue: (a) => a.capacity || '—' },
      { id: 'location', label: 'Location / Floor', defaultSelected: true, getValue: (a) => a.location || '—' },
      { id: 'lastServiceDate', label: 'Last Service Date', defaultSelected: true, getValue: (a) => a.lastServiceDate ? formatDisplay(a.lastServiceDate) : '—' },
      { id: 'nextDueDate', label: 'Next Service Due', defaultSelected: true, getValue: (a) => a.nextDueDate ? formatDisplay(a.nextDueDate) : '—' },
      { id: 'status', label: 'Status', defaultSelected: true, getValue: (a) => {
        const state = dueState(a.nextDueDate);
        return state.state === 'EXPIRED' ? 'OVERDUE' : state.state === 'DUE_SOON' ? 'DUE_SOON' : 'COMPLIANT';
      }},
    ],
  },
  TECHNICIANS: {
    title: 'Technician Staff Roster',
    filenamePrefix: 'vigilamc_technicians',
    sheetName: 'Technicians',
    statuses: [
      { id: 'ALL', label: 'All Technicians' },
      { id: 'ACTIVE', label: 'Active Seat' },
      { id: 'INACTIVE', label: 'Inactive / Archived' },
    ],
    columns: [
      { id: 'fullName', label: 'Full Name', defaultSelected: true, getValue: (t) => t.fullName || '—' },
      { id: 'email', label: 'Email', defaultSelected: true, getValue: (t) => t.email || '—' },
      { id: 'phone', label: 'Phone', defaultSelected: true, getValue: (t) => t.phone || '—' },
      { id: 'employeeId', label: 'Employee ID', defaultSelected: true, getValue: (t) => t.employeeId || '—' },
      { id: 'assignedBuildings', label: 'Assigned Facilities', defaultSelected: true, getValue: (t) => t.assignedBuildings?.map((a: any) => a.building?.name || a.buildingName).filter(Boolean).join(', ') || 'None' },
      { id: 'status', label: 'Seat Status', defaultSelected: true, getValue: (t) => t.status || 'ACTIVE' },
      { id: 'lastLoginAt', label: 'Last Login', defaultSelected: true, getValue: (t) => t.lastLoginAt ? formatDisplay(t.lastLoginAt) : 'Never' },
    ],
  },
  WORK_ORDERS: {
    title: 'Work Orders & Maintenance',
    filenamePrefix: 'vigilamc_work_orders',
    sheetName: 'Work Orders',
    statuses: [
      { id: 'ALL', label: 'All Work Orders' },
      { id: 'OPEN', label: 'Open' },
      { id: 'IN_PROGRESS', label: 'In Progress' },
      { id: 'COMPLETED', label: 'Completed' },
    ],
    columns: [
      { id: 'id', label: 'Order ID', defaultSelected: true, getValue: (w) => w.id?.substring(0, 8) || '—' },
      { id: 'title', label: 'Title / Subject', defaultSelected: true, getValue: (w) => w.title || '—' },
      { id: 'building', label: 'Facility', defaultSelected: true, getValue: (w) => w.building?.name || '—' },
      { id: 'priority', label: 'Priority', defaultSelected: true, getValue: (w) => w.priority || 'MEDIUM' },
      { id: 'status', label: 'Status', defaultSelected: true, getValue: (w) => w.status || 'OPEN' },
      { id: 'assignedTo', label: 'Technician', defaultSelected: true, getValue: (w) => w.assignedTo?.fullName || 'Unassigned' },
      { id: 'dueDate', label: 'Due Date', defaultSelected: true, getValue: (w) => w.dueDate ? formatDisplay(w.dueDate) : '—' },
      { id: 'createdAt', label: 'Created At', defaultSelected: true, getValue: (w) => w.createdAt ? formatDisplay(w.createdAt) : '—' },
    ],
  },
  INSPECTIONS: {
    title: 'Inspection & Service Logs',
    filenamePrefix: 'vigilamc_inspections',
    sheetName: 'Inspections',
    statuses: [
      { id: 'ALL', label: 'All Inspections' },
      { id: 'PASSED', label: 'Passed' },
      { id: 'FAILED', label: 'Action Required' },
    ],
    columns: [
      { id: 'date', label: 'Service Date', defaultSelected: true, getValue: (i) => i.serviceDate ? formatDisplay(i.serviceDate) : (i.createdAt ? formatDisplay(i.createdAt) : '—') },
      { id: 'building', label: 'Facility', defaultSelected: true, getValue: (i) => i.equipment?.building?.name || i.building?.name || '—' },
      { id: 'qrCode', label: 'Asset ID', defaultSelected: true, getValue: (i) => i.equipment?.qrCode || i.qrCode || '—' },
      { id: 'technician', label: 'Technician', defaultSelected: true, getValue: (i) => i.technicianName || i.technician?.fullName || 'Official Inspector' },
      { id: 'status', label: 'Inspection Result', defaultSelected: true, getValue: (i) => i.status || 'PASSED' },
      { id: 'remarks', label: 'Remarks / Findings', defaultSelected: true, getValue: (i) => i.remarks || i.notes || 'Routine check passed' },
    ],
  },
};

export function exportToExcel({
  configKey,
  data,
  selectedColumnIds,
  dateRange,
  statusFilter = 'ALL',
}: {
  configKey: string;
  data: any[];
  selectedColumnIds: string[];
  dateRange?: { from?: string; to?: string };
  statusFilter?: string;
}) {
  const config = EXPORT_CONFIGS[configKey];
  if (!config) throw new Error(`Unknown export configuration: ${configKey}`);

  // 1. Filter by Status
  let filtered = [...data];
  if (statusFilter && statusFilter !== 'ALL') {
    filtered = filtered.filter((item) => {
      if (configKey === 'FIRE_ASSETS') {
        const { state } = dueState(item.nextDueDate);
        const status = state === 'EXPIRED' ? 'OVERDUE' : state === 'DUE_SOON' ? 'DUE_SOON' : 'COMPLIANT';
        return status === statusFilter;
      }
      return item.status === statusFilter || item.overallStatus === statusFilter;
    });
  }

  // 2. Filter by Date Range (if provided)
  if (dateRange?.from || dateRange?.to) {
    const fromStr = dateRange.from ? toDateInputString(dateRange.from) : null;
    const toStr = dateRange.to ? toDateInputString(dateRange.to) : null;

    filtered = filtered.filter((item) => {
      const itemRaw = item.createdAt || item.serviceDate || item.lastServiceDate || item.dueDate;
      if (!itemRaw) return true;
      const itemStr = toDateInputString(itemRaw);
      if (fromStr && itemStr < fromStr) return false;
      if (toStr && itemStr > toStr) return false;
      return true;
    });
  }

  // 3. Select columns
  const activeCols = config.columns.filter((c) => selectedColumnIds.includes(c.id));
  if (activeCols.length === 0) {
    throw new Error('Please select at least one column to export.');
  }

  // 4. Build Rows
  const headers = activeCols.map((c) => c.label);
  const rows = filtered.map((item) => activeCols.map((c) => c.getValue(item)));

  // 5. Build SheetJS Worksheet
  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Auto-fit column widths with padding
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    rows.forEach((r) => {
      const cellVal = String(r[i] ?? '');
      if (cellVal.length > maxLen) {
        maxLen = cellVal.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 14), 48) };
  });
  ws['!cols'] = colWidths;

  // Freeze header row (Row 1)
  ws['!views'] = [{ state: 'frozen', ySplit: 1, activeCell: 'A2' }];

  // 6. Write file
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, config.sheetName);

  const dateStr = todayCalendarDateString();
  const filename = `${config.filenamePrefix}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
