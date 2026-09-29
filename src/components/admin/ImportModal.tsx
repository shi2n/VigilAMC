'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  ArrowRight,
  ArrowLeft,
  Layers,
  Building2,
  Users,
  Flame,
  ClipboardList,
  Wrench,
  HelpCircle,
  Check,
  History,
  FileDown
} from 'lucide-react';
import {
  IMPORT_CONFIGS,
  ImportType,
  DuplicateStrategy,
  matchColumnsToFields,
  generateErrorReportWorkbook,
} from '@/lib/excelImport';

interface ImportModalProps {
  isOpen: boolean;
  initialType?: ImportType;
  onClose: () => void;
  onSuccess?: () => void;
}

type WizardStep = 'CHOOSE_TYPE' | 'UPLOAD_FILE' | 'MAP_COLUMNS' | 'PREVIEW_STRATEGY' | 'PROCESSING' | 'COMPLETED';

export function ImportModal({
  isOpen,
  initialType = 'FIRE_ASSETS',
  onClose,
  onSuccess,
}: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<'WIZARD' | 'HISTORY'>('WIZARD');
  const [currentStep, setCurrentStep] = useState<WizardStep>('CHOOSE_TYPE');
  const [selectedType, setSelectedType] = useState<ImportType>(initialType);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('SKIP');

  // File & Parsing state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>({});
  const [dragActive, setDragActive] = useState(false);

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    totalRows: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
    evaluatedRows: any[];
  } | null>(null);

  // Execution & Progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [batchStats, setBatchStats] = useState({
    totalRows: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  });
  const [collectedErrors, setCollectedErrors] = useState<any[]>([]);

  // History state
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        setSelectedType(initialType);
        setCurrentStep('UPLOAD_FILE');
      } else {
        setCurrentStep('CHOOSE_TYPE');
      }
    }
  }, [isOpen, initialType]);

  // Fetch import history when switching to HISTORY tab
  useEffect(() => {
    if (isOpen && activeTab === 'HISTORY') {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/admin/import/history');
      const data = await res.json();
      if (data.history) {
        setHistoryLogs(data.history);
      }
    } catch (e) {
      console.error('Error fetching import history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  const currentConfig = IMPORT_CONFIGS[selectedType];

  // Template download trigger
  const handleDownloadTemplate = () => {
    window.location.href = `/api/admin/import/template?type=${selectedType}`;
  };

  // Handle file drop / upload
  const handleFileChange = async (uploadedFile: File) => {
    if (!uploadedFile) return;

    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller file or split into parts.');
      return;
    }

    setFile(uploadedFile);
    setFileName(uploadedFile.name);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: '',
        raw: false,
      });

      if (jsonData.length === 0) {
        alert('Spreadsheet is empty. Please upload a file with data rows.');
        return;
      }

      const headers = Object.keys(jsonData[0]);
      setRawHeaders(headers);
      setRawRows(jsonData);

      // Auto map columns
      const autoMapping = matchColumnsToFields(headers, currentConfig);
      setColumnMapping(autoMapping);

      setCurrentStep('MAP_COLUMNS');
    } catch (err: any) {
      console.error('Failed to parse file:', err);
      alert('Could not read Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.');
    }
  };

  // Perform Server Pre-Validation
  const handleProceedToValidation = async () => {
    try {
      setIsValidating(true);
      const res = await fetch('/api/admin/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          rows: rawRows,
          columnMapping,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Validation failed');
        return;
      }

      setValidationResult(data);
      setCurrentStep('PREVIEW_STRATEGY');
    } catch (e: any) {
      console.error(e);
      alert('Error validating spreadsheet data: ' + e.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Execute Non-Blocking Batches (Chunks of 100 rows)
  const handleExecuteBatch = async () => {
    if (!validationResult) return;

    setCurrentStep('PROCESSING');
    setIsProcessing(true);
    setProgressPercent(0);
    setBatchStats({
      totalRows: validationResult.evaluatedRows.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    });
    setCollectedErrors([]);

    const rowsToProcess = validationResult.evaluatedRows;
    const CHUNK_SIZE = 100;
    const totalChunks = Math.ceil(rowsToProcess.length / CHUNK_SIZE);

    let cumulativeImported = 0;
    let cumulativeUpdated = 0;
    let cumulativeSkipped = 0;
    let cumulativeFailed = 0;
    const allErrors: any[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, rowsToProcess.length);
      const chunkRows = rowsToProcess.slice(start, end);
      const isFinalChunk = i === totalChunks - 1;

      setProgressMessage(
        `Processing records ${start + 1} to ${end} of ${rowsToProcess.length}...`
      );

      try {
        const res = await fetch('/api/admin/import/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedType,
            duplicateStrategy,
            rows: chunkRows,
            filename: fileName,
            isFinalChunk,
            batchSummary: {
              totalRows: rowsToProcess.length,
              cumulativeImported,
              cumulativeUpdated,
              cumulativeSkipped,
              cumulativeFailed,
            },
          }),
        });

        const data = await res.json();
        if (res.ok) {
          cumulativeImported += data.importedCount || 0;
          cumulativeUpdated += data.updatedCount || 0;
          cumulativeSkipped += data.skippedCount || 0;
          cumulativeFailed += data.failedCount || 0;

          if (Array.isArray(data.errors)) {
            allErrors.push(...data.errors);
          }
        } else {
          cumulativeFailed += chunkRows.length;
          chunkRows.forEach((r) => {
            allErrors.push({
              rowNumber: r.rowNumber,
              originalData: r.originalData,
              errorReason: data.error || 'Server processing error',
              suggestedCorrection: 'Check data formats and retry.',
            });
          });
        }
      } catch (err: any) {
        cumulativeFailed += chunkRows.length;
        chunkRows.forEach((r) => {
          allErrors.push({
            rowNumber: r.rowNumber,
            originalData: r.originalData,
            errorReason: err.message || 'Network error during batch',
            suggestedCorrection: 'Ensure network connection is stable and retry.',
          });
        });
      }

      setBatchStats({
        totalRows: rowsToProcess.length,
        imported: cumulativeImported,
        updated: cumulativeUpdated,
        skipped: cumulativeSkipped,
        failed: cumulativeFailed,
      });

      const percent = Math.round(((i + 1) / totalChunks) * 100);
      setProgressPercent(percent);
    }

    setCollectedErrors(allErrors);
    setIsProcessing(false);
    setCurrentStep('COMPLETED');
    if (onSuccess) {
      onSuccess();
    }
  };

  // Download Error Report Excel
  const handleDownloadErrorReport = () => {
    if (collectedErrors.length === 0) return;
    const wb = generateErrorReportWorkbook(selectedType, collectedErrors);
    XLSX.writeFile(wb, `Import_Errors_${selectedType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Reset Modal
  const handleReset = () => {
    setCurrentStep('CHOOSE_TYPE');
    setFile(null);
    setFileName('');
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping({});
    setValidationResult(null);
    setProgressPercent(0);
    setCollectedErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Excel Data Import Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase">
                  Production Mode
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Bulk ingest existing client records, building assets, and field inspections with duplicate protection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'WIZARD' ? 'HISTORY' : 'WIZARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit History</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'HISTORY' ? (
            /* AUDIT HISTORY VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Spreadsheet Import Audit Trail</h3>
                  <p className="text-xs text-slate-400">Historical logs of all bulk data imports for your agency.</p>
                </div>
                <button
                  onClick={fetchHistory}
                  disabled={loadingHistory}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  <p className="text-xs">Loading audit logs...</p>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <History className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No import batches on record</p>
                  <p className="text-xs mt-1">Complete your first Excel import using the wizard.</p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date &amp; Time</th>
                        <th className="py-2.5 px-3">Data Module</th>
                        <th className="py-2.5 px-3">Source File</th>
                        <th className="py-2.5 px-3">Strategy</th>
                        <th className="py-2.5 px-3 text-right">Added</th>
                        <th className="py-2.5 px-3 text-right">Updated</th>
                        <th className="py-2.5 px-3 text-right">Failed</th>
                        <th className="py-2.5 px-3">Initiated By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {historyLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-300">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-amber-400">
                            {log.entityType || log.type}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-300 truncate max-w-[140px]" title={log.filename}>
                            {log.filename || 'Spreadsheet Upload'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                              {log.strategy || 'SKIP'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-400">
                            +{log.imported || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-cyan-400">
                            {log.updated || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-red-400">
                            {log.failed || 0}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 truncate max-w-[120px]">
                            {log.userEmail || 'Admin'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* WIZARD STEPS */
            <div className="space-y-6">
              {/* Step Bar */}
              <div className="flex items-center justify-between px-2 text-xs">
                {[
                  { step: 'CHOOSE_TYPE', label: '1. Select Type' },
                  { step: 'UPLOAD_FILE', label: '2. Upload File' },
                  { step: 'MAP_COLUMNS', label: '3. Map Columns' },
                  { step: 'PREVIEW_STRATEGY', label: '4. Strategy & Preview' },
                  { step: 'COMPLETED', label: '5. Summary' },
                ].map((s, idx) => {
                  const isActive = currentStep === s.step;
                  const isCompleted =
                    (s.step === 'CHOOSE_TYPE' && currentStep !== 'CHOOSE_TYPE') ||
                    (s.step === 'UPLOAD_FILE' && ['MAP_COLUMNS', 'PREVIEW_STRATEGY', 'PROCESSING', 'COMPLETED'].includes(currentStep)) ||
                    (s.step === 'MAP_COLUMNS' && ['PREVIEW_STRATEGY', 'PROCESSING', 'COMPLETED'].includes(currentStep)) ||
                    (s.step === 'PREVIEW_STRATEGY' && ['PROCESSING', 'COMPLETED'].includes(currentStep)) ||
                    (s.step === 'COMPLETED' && currentStep === 'COMPLETED');

                  return (
                    <div key={s.step} className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <span
                        className={`hidden sm:inline font-semibold ${
                          isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {s.label.split('. ')[1]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: CHOOSE DATA TYPE */}
              {currentStep === 'CHOOSE_TYPE' && (
                <div className="space-y-4">
                  <div className="text-center max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-white">What data would you like to import?</h3>
                    <p className="text-xs text-slate-400">
                      Select the entity type to load schema definitions and auto-matching rules.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        type: 'CLIENTS' as ImportType,
                        title: 'Clients & Societies',
                        desc: 'Customer accounts, RWA societies, facility groups, and primary SPOCs.',
                        icon: Users,
                        color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                      },
                      {
                        type: 'BUILDINGS' as ImportType,
                        title: 'Buildings & Towers',
                        desc: 'Premises addresses, tower names, and Delhi NCR statutory compliance cycles.',
                        icon: Building2,
                        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                      },
                      {
                        type: 'FIRE_ASSETS' as ImportType,
                        title: 'Fire Equipment & QR Tags',
                        desc: 'Extinguishers, hydrants, hose reels, panel tags, and inspection due dates.',
                        icon: Flame,
                        color: 'text-red-400 bg-red-500/10 border-red-500/20',
                      },
                      {
                        type: 'TECHNICIANS' as ImportType,
                        title: 'Field Technicians',
                        desc: 'Technician accounts, employee badge codes, and assigned territories.',
                        icon: Wrench,
                        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                      },
                      {
                        type: 'INSPECTIONS' as ImportType,
                        title: 'Past Inspections',
                        desc: 'Historical inspection audits, pressure gauge logs, and pass/fail records.',
                        icon: ClipboardList,
                        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                      },
                      {
                        type: 'WORK_ORDERS' as ImportType,
                        title: 'Work Orders',
                        desc: 'Open maintenance jobs, corrective refilling tasks, and target deadlines.',
                        icon: Layers,
                        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedType === item.type;
                      return (
                        <div
                          key={item.type}
                          onClick={() => {
                            setSelectedType(item.type);
                            setCurrentStep('UPLOAD_FILE');
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: UPLOAD FILE & DOWNLOAD TEMPLATE */}
              {currentStep === 'UPLOAD_FILE' && (
                <div className="space-y-6">
                  {/* Selected Entity Banner */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Importing Into:</div>
                        <div className="text-sm font-bold text-white">{currentConfig.title}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm"
                        title="Download sample Excel template with official DB column headers"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Download Sample Excel Template</span>
                      </button>

                      <button
                        onClick={() => setCurrentStep('CHOOSE_TYPE')}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                      >
                        Change Type
                      </button>
                    </div>
                  </div>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileChange(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-amber-400 bg-amber-500/5 scale-[1.01]'
                        : 'border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-7 h-7" />
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">
                      {fileName ? fileName : 'Choose an Excel file or drag & drop here'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Supports <span className="text-amber-400 font-semibold">.xlsx</span>,{' '}
                      <span className="text-amber-400 font-semibold">.xls</span>, and{' '}
                      <span className="text-amber-400 font-semibold">.csv</span> up to 10MB (handles 500 to 20,000+ rows smoothly).
                    </p>
                  </div>

                  {/* Field Guidance Notes */}
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Data Format Guidelines for {currentConfig.plural}:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      {currentConfig.guidelines.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* STEP 3: COLUMN MAPPING */}
              {currentStep === 'MAP_COLUMNS' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-bold text-white">Smart Column Mapping</h3>
                      <p className="text-xs text-slate-400">
                        We matched your file headers with VigilAMC database fields. Review and adjust any mapping below.
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                      Total Rows Detected: <strong className="text-white font-mono">{rawRows.length}</strong>
                    </div>
                  </div>

                  <div className="border border-slate-800 rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Spreadsheet Column Header</th>
                          <th className="py-2.5 px-3">Sample Value (Row 1)</th>
                          <th className="py-2.5 px-3">VigilAMC Target Field</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                        {rawHeaders.map((header) => {
                          const mappedKey = columnMapping[header];
                          const matchedField = currentConfig.fields.find((f) => f.key === mappedKey);
                          const sampleVal = rawRows[0] ? String(rawRows[0][header] || '—') : '—';

                          return (
                            <tr key={header} className="hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 font-bold text-white">
                                {header}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
                                {sampleVal}
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={mappedKey || ''}
                                  onChange={(e) => {
                                    const val = e.target.value || null;
                                    setColumnMapping({
                                      ...columnMapping,
                                      [header]: val,
                                    });
                                  }}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                                >
                                  <option value="">— Do Not Import (Ignore) —</option>
                                  {currentConfig.fields.map((f) => (
                                    <option key={f.key} value={f.key}>
                                      {f.label} {f.required ? '*(Required)' : ''}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {matchedField ? (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      matchedField.required
                                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                    }`}
                                  >
                                    {matchedField.required ? 'Mandatory' : 'Optional'}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-500">
                                    Ignored
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentStep('UPLOAD_FILE')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      onClick={handleProceedToValidation}
                      disabled={isValidating}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Validating Records...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify &amp; Preview</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DUPLICATE STRATEGY & VALIDATION PREVIEW */}
              {currentStep === 'PREVIEW_STRATEGY' && validationResult && (
                <div className="space-y-5">
                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Rows</span>
                      <div className="text-xl font-black text-white">{validationResult.totalRows}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Ready to Import</span>
                      <div className="text-xl font-black text-emerald-300">{validationResult.validCount}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">Duplicates Detected</span>
                      <div className="text-xl font-black text-amber-300">{validationResult.duplicateCount}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/40">
                      <span className="text-[10px] font-bold text-red-400 uppercase">Syntax Errors</span>
                      <div className="text-xl font-black text-red-400">{validationResult.invalidCount}</div>
                    </div>
                  </div>

                  {/* Duplicate Strategy Radio Selector */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span>Duplicate Handling Strategy:</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        (When a record matches an existing {currentConfig.singular.toLowerCase()} in your database)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {[
                        {
                          id: 'SKIP' as DuplicateStrategy,
                          title: 'Skip Duplicates (Recommended)',
                          desc: 'Preserve existing DB record unchanged. Safest option.',
                        },
                        {
                          id: 'UPDATE' as DuplicateStrategy,
                          title: 'Update Existing Records',
                          desc: 'Overwrite existing attributes with new spreadsheet values.',
                        },
                        {
                          id: 'CREATE_NEW' as DuplicateStrategy,
                          title: 'Import All As New',
                          desc: 'Create new records regardless of existing matches.',
                        },
                      ].map((strat) => (
                        <label
                          key={strat.id}
                          className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                            duplicateStrategy === strat.id
                              ? 'bg-amber-500/10 border-amber-500/50 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="duplicateStrategy"
                              value={strat.id}
                              checked={duplicateStrategy === strat.id}
                              onChange={() => setDuplicateStrategy(strat.id)}
                              className="accent-amber-500"
                            />
                            <span className="font-bold text-xs">{strat.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 pl-5">{strat.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sample Rows Preview Table */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Data Preview (First 8 Rows):</span>
                      <span className="text-slate-400 text-[11px]">Red highlights indicate validation errors</span>
                    </div>

                    <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] font-bold border-b border-slate-800 sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Row</th>
                            <th className="py-2 px-3">Status</th>
                            {currentConfig.fields.slice(0, 4).map((f) => (
                              <th key={f.key} className="py-2 px-3">{f.label}</th>
                            ))}
                            <th className="py-2 px-3">Issues / Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                          {validationResult.evaluatedRows.slice(0, 8).map((r: any) => (
                            <tr
                              key={r.rowNumber}
                              className={
                                !r.isValid
                                  ? 'bg-red-950/20 text-red-200'
                                  : r.isDuplicate
                                  ? 'bg-amber-950/15 text-slate-200'
                                  : 'hover:bg-slate-800/40 text-slate-300'
                              }
                            >
                              <td className="py-2 px-3 font-mono font-bold text-slate-400">
                                #{r.rowNumber}
                              </td>
                              <td className="py-2 px-3 font-semibold">
                                {!r.isValid ? (
                                  <span className="inline-flex items-center gap-1 text-red-400">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Error</span>
                                  </span>
                                ) : r.isDuplicate ? (
                                  <span className="inline-flex items-center gap-1 text-amber-400">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Duplicate</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Valid</span>
                                  </span>
                                )}
                              </td>
                              {currentConfig.fields.slice(0, 4).map((f) => (
                                <td key={f.key} className="py-2 px-3 font-medium truncate max-w-[140px]">
                                  {r.parsedData[f.key] !== null && r.parsedData[f.key] !== undefined
                                    ? String(r.parsedData[f.key])
                                    : '—'}
                                </td>
                              ))}
                              <td className="py-2 px-3 text-[10px] text-slate-400 max-w-[200px] truncate">
                                {r.errors.length > 0 ? (
                                  <span className="text-red-400">{r.errors.join(', ')}</span>
                                ) : r.warnings.length > 0 ? (
                                  <span className="text-amber-400">{r.warnings.join(', ')}</span>
                                ) : (
                                  <span className="text-emerald-500">Ready</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentStep('MAP_COLUMNS')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Mapping</span>
                    </button>

                    <button
                      onClick={handleExecuteBatch}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Start Bulk Import ({validationResult.totalRows} Rows)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: LIVE BATCH EXECUTION PROGRESS */}
              {currentStep === 'PROCESSING' && (
                <div className="py-12 space-y-6 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Importing into Database...</h3>
                    <p className="text-xs text-slate-400">{progressMessage}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400">
                      <span>{batchStats.imported + batchStats.updated + batchStats.skipped + batchStats.failed} / {batchStats.totalRows} Processed</span>
                      <span className="text-amber-400">{progressPercent}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: COMPLETED RESULTS & ERROR REPORT DOWNLOAD */}
              {currentStep === 'COMPLETED' && (
                <div className="space-y-6 text-center max-w-lg mx-auto py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Import Process Complete!</h3>
                    <p className="text-xs text-slate-400">
                      The batch execution has concluded. All successful records have been written directly to your VigilAMC database.
                    </p>
                  </div>

                  {/* Result Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">Newly Created</span>
                      <div className="text-lg font-black text-emerald-300">+{batchStats.imported}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">Updated</span>
                      <div className="text-lg font-black text-cyan-300">{batchStats.updated}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Skipped</span>
                      <div className="text-lg font-black text-slate-300">{batchStats.skipped}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40">
                      <span className="text-[10px] font-bold text-red-400 uppercase">Failed</span>
                      <div className="text-lg font-black text-red-400">{batchStats.failed}</div>
                    </div>
                  </div>

                  {/* Download Error Report if there are failures */}
                  {collectedErrors.length > 0 && (
                    <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-300 text-xs font-bold">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>{collectedErrors.length} record(s) could not be imported</span>
                        </div>
                        <button
                          onClick={handleDownloadErrorReport}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Download Error Report (.xlsx)</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        The error report contains original spreadsheet row data, specific rejection reasons, and suggested corrections so you can adjust and re-upload.
                      </p>
                    </div>
                  )}

                  {/* Done / Close Actions */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      Import Another File
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
                    >
                      Done &amp; View Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
