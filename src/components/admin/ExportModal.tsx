'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, X, Check, Calendar, Filter, Download } from 'lucide-react';
import { EXPORT_CONFIGS, exportToExcel } from '@/lib/excelExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultConfigKey?: string;
  initialDataType?: string;
  dataMap: {
    CLIENTS?: any[];
    BUILDINGS?: any[];
    FIRE_ASSETS?: any[];
    TECHNICIANS?: any[];
    WORK_ORDERS?: any[];
    INSPECTIONS?: any[];
    [key: string]: any[] | undefined;
  };
  showToast?: (msg: string) => void;
}

export function ExportModal({
  isOpen,
  onClose,
  defaultConfigKey = 'FIRE_ASSETS',
  initialDataType,
  dataMap,
  showToast,
}: ExportModalProps) {
  const initialKey = initialDataType || defaultConfigKey;
  const [selectedType, setSelectedType] = useState<string>(initialKey);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const key = initialDataType || defaultConfigKey;
    if (key && EXPORT_CONFIGS[key]) {
      setSelectedType(key);
    }
  }, [defaultConfigKey, initialDataType, isOpen]);

  const activeConfig = EXPORT_CONFIGS[selectedType] || EXPORT_CONFIGS['FIRE_ASSETS'];

  useEffect(() => {
    if (activeConfig) {
      setSelectedCols(activeConfig.columns.map((c) => c.id));
      setStatusFilter('ALL');
    }
  }, [selectedType]);

  if (!isOpen) return null;

  const currentDataset = dataMap[selectedType as keyof typeof dataMap] || [];

  const handleToggleCol = (colId: string) => {
    if (selectedCols.includes(colId)) {
      if (selectedCols.length === 1) {
        showToast?.('At least one column must be selected');
        return;
      }
      setSelectedCols(selectedCols.filter((id) => id !== colId));
    } else {
      setSelectedCols([...selectedCols, colId]);
    }
  };

  const handleSelectAllCols = () => {
    setSelectedCols(activeConfig.columns.map((c) => c.id));
  };

  const handleExecuteExport = () => {
    try {
      setExporting(true);
      exportToExcel({
        configKey: selectedType,
        data: currentDataset,
        selectedColumnIds: selectedCols,
        statusFilter,
        dateRange: {
          from: dateFrom || undefined,
          to: dateTo || undefined,
        },
      });
      showToast?.(`Exported ${activeConfig.title} to Excel (.xlsx) successfully!`);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1424] border border-slate-700/80 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export to Excel (.xlsx)</h3>
              <p className="text-xs text-slate-400">Generate a structured spreadsheet from live database records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          
          {/* Data Type Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Data Category</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500"
            >
              {Object.entries(EXPORT_CONFIGS).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.title} ({dataMap[key as keyof typeof dataMap]?.length ?? 0} records)
                </option>
              ))}
            </select>
          </div>

          {/* Filters: Status and Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Status Filter</span>
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:outline-none focus:border-amber-500 text-xs"
              >
                {activeConfig.statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Date Range</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                  className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px] focus:outline-none focus:border-amber-500"
                  title="From Date"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                  className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px] focus:outline-none focus:border-amber-500"
                  title="To Date"
                />
              </div>
            </div>
          </div>

          {/* Column Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Columns to Include ({selectedCols.length})</label>
              <button
                type="button"
                onClick={handleSelectAllCols}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800 max-h-44 overflow-y-auto">
              {activeConfig.columns.map((col) => {
                const isChecked = selectedCols.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-slate-300 hover:text-white transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCol(col.id)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0 focus:outline-none bg-slate-900"
                    />
                    <span className="text-[11px] font-medium">{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={exporting || currentDataset.length === 0}
            onClick={handleExecuteExport}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating XLSX...' : `Export Excel (${currentDataset.length})`}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
