'use client';
import { toast } from 'sonner';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
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
  FileDown,
  Minus,
  Info,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import {
  IMPORT_CONFIGS,
  ImportType,
  DuplicateStrategy,
  matchColumnsToFields,
  generateSampleWorkbook,
  generateSampleCsv,
  getTemplateFilename,
  getOrderedTemplateFields,
  generateErrorReportWorkbook,
} from '@/lib/excelImport';
import { AdminDictionary, getAdminDictionary } from '@/lib/i18n/admin';

interface ImportModalProps {
  isOpen: boolean;
  isMinimized?: boolean;
  initialType?: ImportType;
  onClose: () => void;
  onMinimize?: () => void;
  onSuccess?: () => void;
  t?: AdminDictionary;
}

type WizardStep =
  | 'CHOOSE_TYPE'
  | 'UPLOAD_FILE'
  | 'MAP_COLUMNS'
  | 'PREVIEW_STRATEGY'
  | 'PROCESSING'
  | 'COMPLETED';

export function ImportModal({
  isOpen,
  isMinimized,
  initialType = 'FIRE_ASSETS',
  onClose,
  onMinimize,
  onSuccess,
  t,
}: ImportModalProps) {
  const dict = t || getAdminDictionary('en');
  const prefersReducedMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState<'WIZARD' | 'HISTORY'>('WIZARD');
  const [currentStep, setCurrentStep] = useState<WizardStep>('CHOOSE_TYPE');
  const [selectedType, setSelectedType] = useState<ImportType>(initialType);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('SKIP');

  // B1: Collapsible "❓ How to import" help panel (closed by default; open state persisted in modal)
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guidePreviewType, setGuidePreviewType] = useState<ImportType>(initialType);
  const [openTooltipHeader, setOpenTooltipHeader] = useState<string | null>(null);

  // File & Parsing state
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>({});
  const [dragActive, setDragActive] = useState(false);
  const [mappingErrorBanner, setMappingErrorBanner] = useState<string | null>(null);

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

  const handleSafeClose = () => {
    const isDirty =
      file !== null ||
      currentStep === 'MAP_COLUMNS' ||
      currentStep === 'PREVIEW_STRATEGY' ||
      currentStep === 'PROCESSING';
    if (isDirty) {
      if (
        !window.confirm(
          "You have an import draft in progress. Discard it? (You can use 'Minimize' to keep your work.)"
        )
      ) {
        return;
      }
    }
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      const startType = initialType || 'BUILDINGS';
      setSelectedType(startType);
      setGuidePreviewType(startType);
      setCurrentStep('CHOOSE_TYPE');
      setMappingErrorBanner(null);
    }
  }, [isOpen, initialType]);

  useEffect(() => {
    setGuidePreviewType(selectedType);
  }, [selectedType]);

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
      toast.error('Could not load import history logs.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const currentConfig = IMPORT_CONFIGS[selectedType];

  // Compute unmapped required and optional fields for Step 3 (B3)
  const mappedFieldKeys = useMemo(() => {
    return new Set(Object.values(columnMapping).filter(Boolean) as string[]);
  }, [columnMapping]);

  const unmappedRequiredFields = useMemo(() => {
    return currentConfig.fields.filter((f) => f.required && !mappedFieldKeys.has(f.key));
  }, [currentConfig.fields, mappedFieldKeys]);

  const unmappedOptionalFields = useMemo(() => {
    return currentConfig.fields.filter((f) => !f.required && !mappedFieldKeys.has(f.key));
  }, [currentConfig.fields, mappedFieldKeys]);

  if (!isOpen) return null;

  // B2: Client-side Excel (.xlsx) template download reusing `xlsx`
  const handleDownloadExcelTemplate = (targetType: ImportType = selectedType) => {
    try {
      const wb = generateSampleWorkbook(targetType);
      const fname = getTemplateFilename(targetType, 'xlsx');
      XLSX.writeFile(wb, fname);
      toast.success(`Downloaded ${fname}`);
    } catch (err: any) {
      console.error('Failed to generate Excel template:', err);
      toast.error('Failed to download Excel template');
    }
  };

  // B2: Client-side CSV (.csv) template download reusing `xlsx`
  const handleDownloadCsvTemplate = (targetType: ImportType = selectedType) => {
    try {
      const csvContent = generateSampleCsv(targetType);
      const fname = getTemplateFilename(targetType, 'csv');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fname);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${fname}`);
    } catch (err: any) {
      console.error('Failed to generate CSV template:', err);
      toast.error('Failed to download CSV template');
    }
  };

  // Handle file drop / upload
  const handleFileChange = async (uploadedFile: File) => {
    if (!uploadedFile) return;

    if (uploadedFile.size > 10 * 1024 * 1024) {
      toast.error(
        'File size exceeds 10MB limit. Please upload a smaller file or split into parts.',
        { duration: 5500 }
      );
      return;
    }

    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setMappingErrorBanner(null);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      // Prefer "Data" sheet if present (e.g. from official template), otherwise first sheet
      const targetSheetName =
        workbook.SheetNames.find((n) => n.trim().toLowerCase() === 'data') ||
        workbook.SheetNames[0];
      const worksheet = workbook.Sheets[targetSheetName];

      const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: '',
        raw: false,
      });

      // Filter out completely blank trailing rows
      const jsonData = rawJson.filter((row) =>
        Object.values(row).some((val) => String(val ?? '').trim() !== '')
      );

      if (jsonData.length === 0) {
        toast.error('Spreadsheet is empty. Please upload a file with data rows.', {
          duration: 5500,
        });
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
      toast.error(
        'Could not read Excel file. Please ensure it is a valid .xlsx, .xls, or .csv file.',
        { duration: 5500 }
      );
    }
  };

  // Perform Server Pre-Validation (with B3 required-field guard)
  const handleProceedToValidation = async () => {
    if (unmappedRequiredFields.length > 0) {
      const firstMissing = unmappedRequiredFields[0];
      const msg = dict.importRequiredUnmappedError.replace('{field}', firstMissing.label);
      setMappingErrorBanner(msg);
      toast.error(msg, { duration: 5500 });
      return;
    }

    setMappingErrorBanner(null);

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
        toast.error(data.error || 'Validation failed', { duration: 5500 });
        return;
      }

      setValidationResult(data);
      setCurrentStep('PREVIEW_STRATEGY');
    } catch (e: any) {
      console.error(e);
      toast.error('Error validating spreadsheet data: ' + e.message, { duration: 5500 });
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
    XLSX.writeFile(
      wb,
      `Import_Errors_${selectedType}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
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
    setMappingErrorBanner(null);
  };

  // B1: Collapsible "❓ How to import" Guide Panel (shared across Select Type, Upload, and Mapping steps)
  const guideConfig = IMPORT_CONFIGS[guidePreviewType];
  const guideOrderedFields = getOrderedTemplateFields(guidePreviewType);
  const guideExampleRow = guideConfig.sampleRows[0] || {};

  const renderHowToImportPanel = () => (
    <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF8F2] overflow-hidden">
      <button
        type="button"
        data-testid="import-guide-toggle-btn"
        aria-expanded={isGuideOpen}
        onClick={() => setIsGuideOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#FFF0E6] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-[#1C1917]">
            {dict.importHowToButton}
          </span>
          <span className="text-[11px] font-semibold text-[#9A3412] bg-[#FFF0E6] px-2 py-0.5 rounded-full border border-[#C2410C]/30">
            6-Step Guide &amp; Field Formats
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-[#9A3412]">
          <span>{isGuideOpen ? 'Hide guide' : 'Show guide'}</span>
          {isGuideOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {isGuideOpen && (
        <div
          data-testid="import-guide-panel"
          className={`px-4 pb-4 pt-2 border-t border-[#FED7AA] space-y-4 bg-white text-[#1C1917] ${
            prefersReducedMotion ? '' : 'animate-in fade-in duration-150'
          }`}
        >
          {/* 6 Numbered Steps */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#9A3412] mb-2">
              {dict.importHowToTitle}
            </h4>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {[
                { num: 1, text: dict.importStep1 },
                { num: 2, text: dict.importStep2 },
                { num: 3, text: dict.importStep3 },
                { num: 4, text: dict.importStep4 },
                { num: 5, text: dict.importStep5 },
                { num: 6, text: dict.importStep6 },
              ].map((st) => (
                <li
                  key={st.num}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]"
                >
                  <span className="w-5 h-5 rounded-full bg-[#C2410C] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {st.num}
                  </span>
                  <span className="text-[#1C1917] font-medium leading-snug">{st.text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Per-Type Field Rules Table */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#9A3412]">
                {dict.importFieldRulesTitle}
              </h4>
              <div className="flex items-center gap-1 flex-wrap">
                {(['CLIENTS', 'BUILDINGS', 'INSPECTIONS', 'FIRE_ASSETS', 'TECHNICIANS', 'WORK_ORDERS'] as ImportType[]).map(
                  (tKey) => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setGuidePreviewType(tKey)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        guidePreviewType === tKey
                          ? 'bg-[#C2410C] text-white'
                          : 'bg-[#FFF8F2] text-[#44403C] hover:text-[#1C1917] border border-[#FED7AA]'
                      }`}
                    >
                      {IMPORT_CONFIGS[tKey].plural}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="border border-[#FED7AA] rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF8F2] text-[#1C1917] uppercase text-[10px] font-bold border-b border-[#FED7AA]">
                  <tr>
                    <th className="py-2 px-3">Column Header</th>
                    <th className="py-2 px-3">Rule</th>
                    <th className="py-2 px-3">Accepted Format</th>
                    <th className="py-2 px-3">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FED7AA]/60 bg-white">
                  {guideOrderedFields.map((f) => (
                    <tr key={f.key} className="hover:bg-[#FFF8F2]">
                      <td className="py-2 px-3 font-bold text-[#1C1917]">{f.label}</td>
                      <td className="py-2 px-3">
                        {f.required ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF0E6] text-[#9A3412] border border-[#C2410C]/30">
                            Mandatory
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#059669]/30">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[#44403C]">
                        {f.acceptedFormat ||
                          (f.enumValues
                            ? f.enumValues.join(' | ')
                            : f.type === 'date'
                            ? 'DD/MM/YYYY or YYYY-MM-DD'
                            : 'Free text')}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[#1C1917]">
                        {String(f.example)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Example Row Summary + Quick Format Reference */}
            <div className="p-2.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-[11px] text-[#44403C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong className="text-[#1C1917]">Example {guideConfig.singular} Row: </strong>
                <span className="font-mono text-[#1C1917]">
                  {guideOrderedFields
                    .map((f) => `${f.label}: "${guideExampleRow[f.label] ?? f.example}"`)
                    .join(' • ')}
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownloadExcelTemplate(guidePreviewType)}
                  className="px-2.5 py-1 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-[11px]"
                >
                  .xlsx
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCsvTemplate(guidePreviewType)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FFF0E6] text-[#1C1917] border border-[#C2410C]/40 font-bold text-[11px]"
                >
                  .csv
                </button>
              </div>
            </div>
          </div>

          {/* Common Issues & Support Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] space-y-1 text-xs">
              <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>{dict.importCommonIssuesTitle}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-[#44403C]">
                <li>{dict.importIssueAutoMatch}</li>
                <li>{dict.importIssueDuplicates}</li>
                <li>{dict.importIssueLimits}</li>
                <li>
                  Accepted formats: dates <strong className="text-[#1C1917]">DD/MM/YYYY</strong> &amp; ISO{' '}
                  <strong className="text-[#1C1917]">YYYY-MM-DD</strong>; phone{' '}
                  <strong className="text-[#1C1917]">10-digit</strong>; address{' '}
                  <strong className="text-[#1C1917]">free text</strong>; compliance cycle e.g.{' '}
                  <strong className="text-[#1C1917]">&quot;Half-Yearly Form-B&quot;</strong>,{' '}
                  <strong className="text-[#1C1917]">&quot;Yearly&quot;</strong>.
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex flex-col justify-between text-xs">
              <div className="space-y-1">
                <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Need Agency Onboarding Support?</span>
                </div>
                <p className="text-[11px] text-[#44403C]">
                  Download our ready-to-fill Excel (.xlsx) or CSV (.csv) templates with pre-configured headers and sample Indian compliance rows.
                </p>
              </div>
              <div className="pt-2 font-bold text-[#9A3412]">
                <a
                  href="mailto:vigilamc@gmail.com"
                  className="underline hover:text-[#1C1917]"
                >
                  {dict.importSupportLine}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      data-testid="import-excel-modal"
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 ${
        isMinimized ? 'hidden' : ''
      }`}
    >
      <div className="relative w-full max-w-4xl bg-white border border-[#FED7AA] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-[#1C1917]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#FED7AA] bg-[#FFF8F2] shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] border border-[#C2410C]/30 flex items-center justify-center text-[#1C1917] font-bold shadow-sm shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-[#C2410C]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-[#1C1917] flex items-center gap-2 flex-wrap">
                <span>Excel Data Import Engine</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#9A3412] border border-[#C2410C]/30 uppercase font-bold">
                  Production Mode
                </span>
              </h2>
              <p className="text-xs text-[#44403C] truncate sm:whitespace-normal">
                Bulk ingest existing client records, building assets, and field inspections with duplicate protection.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              data-testid="import-audit-history-btn"
              onClick={() => setActiveTab(activeTab === 'WIZARD' ? 'HISTORY' : 'WIZARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeTab === 'HISTORY'
                  ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-sm'
                  : 'bg-white hover:bg-[#FFF0E6] text-[#1C1917] border-[#FED7AA]'
              }`}
            >
              <History className="w-3.5 h-3.5 text-[#C2410C]" />
              <span className="hidden sm:inline">Audit History</span>
            </button>
            {onMinimize && (
              <button
                type="button"
                data-testid="import-modal-minimize-btn"
                onClick={onMinimize}
                title="Minimize (keep my work)"
                aria-label="Minimize (keep my work)"
                className="w-8 h-8 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#44403C] hover:text-[#C2410C] border border-[#FED7AA] flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              data-testid="import-modal-close-btn"
              onClick={handleSafeClose}
              title="Close"
              aria-label="Close"
              className="w-8 h-8 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#44403C] hover:text-[#1C1917] border border-[#FED7AA] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === 'HISTORY' ? (
            /* AUDIT HISTORY VIEW */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1C1917]">
                    Spreadsheet Import Audit Trail
                  </h3>
                  <p className="text-xs text-[#44403C]">
                    Historical logs of all bulk data imports for your agency (latest 50 batches).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchHistory}
                  disabled={loadingHistory}
                  className="px-3 py-1.5 rounded-xl bg-[#FFF8F2] hover:bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] text-xs font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#C2410C] ${loadingHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-16 text-center text-[#44403C] flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#C2410C]" />
                  <p className="text-xs font-semibold text-[#1C1917]">Loading audit logs...</p>
                </div>
              ) : historyLogs.length === 0 ? (
                <div className="p-12 text-center bg-[#FFF8F2] rounded-2xl border border-[#FED7AA]">
                  <History className="w-10 h-10 mx-auto text-[#C2410C] mb-2" />
                  <p className="text-sm font-bold text-[#1C1917]">No import batches on record</p>
                  <p className="text-xs text-[#44403C] mt-1">
                    Complete your first Excel import using the wizard.
                  </p>
                </div>
              ) : (
                <div className="border border-[#1C1917] rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FFF8F2] text-[#1C1917] uppercase text-[10px] font-bold border-b border-[#FED7AA]">
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
                    <tbody className="divide-y divide-[#292524] bg-[#1C1917] text-white">
                      {historyLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#292524]">
                          <td className="py-2.5 px-3 font-mono text-[#E7E5E4]">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#FED7AA]">
                            {log.entityType || log.type}
                          </td>
                          <td
                            className="py-2.5 px-3 font-medium text-white truncate max-w-[140px]"
                            title={log.filename}
                          >
                            {log.filename || 'Spreadsheet Upload'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#292524] text-[#FFF8F2] border border-[#44403C]">
                              {log.strategy || 'SKIP'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-[#6EE7B7]">
                            +{log.imported || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-[#FCD34D]">
                            {log.updated || 0}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-[#FCA5A5]">
                            {log.failed || 0}
                          </td>
                          <td className="py-2.5 px-3 text-[#E7E5E4] truncate max-w-[120px]">
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
            <div className="space-y-5">
              {/* Step Bar */}
              <div className="flex items-center justify-between px-1 sm:px-2 text-xs gap-1 overflow-x-auto">
                {[
                  { step: 'CHOOSE_TYPE' as WizardStep, label: '1. Select Type' },
                  { step: 'UPLOAD_FILE' as WizardStep, label: '2. Upload File' },
                  { step: 'MAP_COLUMNS' as WizardStep, label: '3. Map Columns' },
                  { step: 'PREVIEW_STRATEGY' as WizardStep, label: '4. Strategy & Preview' },
                  { step: 'COMPLETED' as WizardStep, label: '5. Summary' },
                ].map((s, idx) => {
                  const isActive =
                    currentStep === s.step ||
                    (s.step === 'PREVIEW_STRATEGY' && currentStep === 'PROCESSING');
                  const isCompleted =
                    (s.step === 'CHOOSE_TYPE' && currentStep !== 'CHOOSE_TYPE') ||
                    (s.step === 'UPLOAD_FILE' &&
                      ['MAP_COLUMNS', 'PREVIEW_STRATEGY', 'PROCESSING', 'COMPLETED'].includes(
                        currentStep
                      )) ||
                    (s.step === 'MAP_COLUMNS' &&
                      ['PREVIEW_STRATEGY', 'PROCESSING', 'COMPLETED'].includes(currentStep)) ||
                    (s.step === 'PREVIEW_STRATEGY' &&
                      ['PROCESSING', 'COMPLETED'].includes(currentStep)) ||
                    (s.step === 'COMPLETED' && currentStep === 'COMPLETED');

                  const canClickStep =
                    s.step === 'CHOOSE_TYPE' ||
                    (s.step === 'UPLOAD_FILE' && currentStep !== 'PROCESSING');

                  return (
                    <button
                      key={s.step}
                      type="button"
                      disabled={!canClickStep}
                      onClick={() => {
                        if (canClickStep) setCurrentStep(s.step);
                      }}
                      className={`flex items-center gap-2 py-1 px-1.5 rounded-lg transition-colors ${
                        canClickStep ? 'cursor-pointer hover:bg-[#FFF8F2]' : 'cursor-default'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors shrink-0 ${
                          isActive
                            ? 'bg-[#C2410C] text-white shadow-sm'
                            : isCompleted
                            ? 'bg-[#ECFDF5] text-[#065F46] border border-[#059669]/40'
                            : 'bg-[#FFF8F2] text-[#44403C] border border-[#FED7AA]'
                        }`}
                      >
                        {isCompleted && !isActive ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <span
                        className={`hidden sm:inline font-bold ${
                          isActive
                            ? 'text-[#1C1917] underline decoration-[#C2410C] decoration-2 underline-offset-4'
                            : isCompleted
                            ? 'text-[#065F46]'
                            : 'text-[#44403C]'
                        }`}
                      >
                        {s.label.split('. ')[1]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* STEP 1: CHOOSE DATA TYPE */}
              {currentStep === 'CHOOSE_TYPE' && (
                <div className="space-y-4">
                  {/* B1: Collapsible "❓ How to import" Guide Panel */}
                  {renderHowToImportPanel()}

                  <div className="text-center max-w-md mx-auto space-y-1">
                    <h3 className="text-base font-bold text-[#1C1917]">
                      What data would you like to import?
                    </h3>
                    <p className="text-xs text-[#44403C]">
                      Select a record type to upload your file, or download an official Excel/CSV template first.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        type: 'CLIENTS' as ImportType,
                        title: 'Clients & Societies',
                        desc: 'Customer accounts, RWA societies, facility groups, and primary SPOCs.',
                        icon: Users,
                      },
                      {
                        type: 'BUILDINGS' as ImportType,
                        title: 'Buildings & Towers',
                        desc: 'Premises addresses, tower names, city/region, and compliance cycles.',
                        icon: Building2,
                      },
                      {
                        type: 'INSPECTIONS' as ImportType,
                        title: 'Past Inspections',
                        desc: 'Historical inspection audits, pressure gauge logs, and pass/fail records.',
                        icon: ClipboardList,
                      },
                      {
                        type: 'FIRE_ASSETS' as ImportType,
                        title: 'Fire Equipment Inventory',
                        desc: 'Extinguishers, hydrants, hose reels, asset tags, and service due dates.',
                        icon: Flame,
                      },
                      {
                        type: 'TECHNICIANS' as ImportType,
                        title: 'Field Technicians',
                        desc: 'Technician accounts, employee badge codes, and assigned territories.',
                        icon: Wrench,
                      },
                      {
                        type: 'WORK_ORDERS' as ImportType,
                        title: 'Work Orders',
                        desc: 'Open maintenance jobs, corrective refilling tasks, and target deadlines.',
                        icon: Layers,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedType === item.type;
                      return (
                        <div
                          key={item.type}
                          data-testid={`import-type-card-${item.type}`}
                          onClick={() => {
                            setSelectedType(item.type);
                            setCurrentStep('UPLOAD_FILE');
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#FFF0E6] border-[#C2410C] shadow-sm'
                              : 'bg-[#FFF8F2] border-[#FED7AA] hover:border-[#C2410C]/60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-[#C2410C] border border-[#FED7AA]">
                                <Icon className="w-5 h-5" />
                              </div>
                              {isSelected && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C2410C] text-white">
                                  Selected
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-[#1C1917] mb-1">{item.title}</h4>
                            <p className="text-[11px] text-[#44403C] leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          {/* B2: Per-type Download Excel template (primary) + Download CSV template (secondary) */}
                          <div
                            className="pt-2 border-t border-[#FED7AA] flex flex-col gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              data-testid={`download-excel-template-${item.type}`}
                              onClick={() => handleDownloadExcelTemplate(item.type)}
                              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-[11px] font-bold transition-colors shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{dict.importDownloadExcelTemplate}</span>
                            </button>
                            <button
                              type="button"
                              data-testid={`download-csv-template-${item.type}`}
                              onClick={() => handleDownloadCsvTemplate(item.type)}
                              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] border border-[#C2410C]/40 text-[11px] font-bold transition-colors"
                            >
                              <FileDown className="w-3.5 h-3.5 text-[#C2410C]" />
                              <span>{dict.importDownloadCsvTemplate}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      data-testid="proceed-to-upload-btn"
                      onClick={() => setCurrentStep('UPLOAD_FILE')}
                      className="px-5 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <span>Continue with {currentConfig.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: UPLOAD FILE & DOWNLOAD TEMPLATE */}
              {currentStep === 'UPLOAD_FILE' && (
                <div className="space-y-5">
                  {/* B1: Collapsible "❓ How to import" Guide Panel */}
                  {renderHowToImportPanel()}

                  {/* Selected Entity Banner */}
                  <div className="p-4 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#C2410C]/30 flex items-center justify-center text-[#C2410C] font-bold shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[#44403C]">Importing Into:</div>
                        <div className="text-sm font-bold text-[#1C1917]">
                          {currentConfig.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        data-testid="upload-step-download-xlsx"
                        onClick={() => handleDownloadExcelTemplate(selectedType)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold transition-all shadow-xs"
                        title="Download Excel template (.xlsx) with Data & How to use sheets"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{dict.importDownloadExcelTemplate}</span>
                      </button>

                      <button
                        type="button"
                        data-testid="upload-step-download-csv"
                        onClick={() => handleDownloadCsvTemplate(selectedType)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] border border-[#C2410C]/40 text-xs font-bold transition-all"
                        title="Download CSV template (.csv)"
                      >
                        <FileDown className="w-3.5 h-3.5 text-[#C2410C]" />
                        <span>{dict.importDownloadCsvTemplate}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep('CHOOSE_TYPE')}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] text-xs font-bold"
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
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-[#C2410C] bg-[#FFF0E6]'
                        : 'border-[#C2410C]/40 bg-[#FFF8F2] hover:border-[#C2410C] hover:bg-[#FFF0E6]/60'
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

                    <div className="w-14 h-14 rounded-2xl bg-[#FFF0E6] border border-[#C2410C]/30 text-[#C2410C] flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-7 h-7" />
                    </div>

                    <h3 className="text-base font-bold text-[#1C1917] mb-1">
                      {fileName ? fileName : 'Choose an Excel or CSV file, or drag & drop here'}
                    </h3>
                    <p className="text-xs text-[#44403C] max-w-md mx-auto">
                      Supports{' '}
                      <span className="text-[#9A3412] font-bold">.xlsx</span>,{' '}
                      <span className="text-[#9A3412] font-bold">.xls</span>, and{' '}
                      <span className="text-[#9A3412] font-bold">.csv</span> up to 10MB (handles
                      500 to 20,000+ rows smoothly in 100-row batches).
                    </p>
                  </div>

                  {/* Field Guidance Notes */}
                  <div className="p-4 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] space-y-2 text-xs">
                    <div className="font-bold text-[#1C1917] flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-[#C2410C]" />
                      <span>Data Format Guidelines for {currentConfig.plural}:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[#44403C] text-[11px]">
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
                  {/* B1: Collapsible "❓ How to import" Guide Panel */}
                  {renderHowToImportPanel()}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#FED7AA]">
                    <div>
                      <h3 className="text-base font-bold text-[#1C1917]">Smart Column Mapping</h3>
                      <p className="text-xs text-[#44403C]">
                        We matched your file headers with VigilAMC database fields. Review and adjust any mapping below.
                      </p>
                    </div>

                    {/* A2: Total Rows Detected with high-contrast #1C1917 value on #FFF8F2 */}
                    <div
                      data-testid="total-rows-detected"
                      className="text-xs font-semibold text-[#44403C] bg-[#FFF8F2] px-3 py-1.5 rounded-xl border border-[#FED7AA] shrink-0"
                    >
                      {dict.importTotalRowsDetected}{' '}
                      <strong
                        data-testid="total-rows-detected-value"
                        className="text-[#1C1917] font-mono font-black"
                      >
                        {rawRows.length}
                      </strong>
                    </div>
                  </div>

                  {/* Mapping Table: Dark charcoal rows (#1C1917) with high-contrast inputs (#1C1917 on #FFF8F2) */}
                  <div className="border border-[#1C1917] rounded-2xl overflow-hidden max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FFF8F2] text-[#1C1917] uppercase text-[10px] font-bold border-b border-[#FED7AA] sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3">Spreadsheet Column Header</th>
                          <th className="py-2.5 px-3">Sample Value (Row 1)</th>
                          <th className="py-2.5 px-3">VigilAMC Target Field</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#292524] bg-[#1C1917] text-white">
                        {rawHeaders.map((header) => {
                          const mappedKey = columnMapping[header];
                          const matchedField = currentConfig.fields.find(
                            (f) => f.key === mappedKey
                          );
                          const sampleVal =
                            rawRows[0] &&
                            rawRows[0][header] !== undefined &&
                            String(rawRows[0][header]).trim() !== ''
                              ? String(rawRows[0][header])
                              : '—';
                          const isTooltipOpen = openTooltipHeader === header;

                          const tooltipText = matchedField
                            ? `${matchedField.label}: ${matchedField.description} • Format: ${
                                matchedField.acceptedFormat || 'Free text'
                              } • Example: "${matchedField.example}"`
                            : `Unmapped column "${header}". Choose a VigilAMC Target Field or leave as Do Not Import (${dict.importOptionalUnmappedHint}).`;

                          return (
                            <tr key={header} className="hover:bg-[#292524] transition-colors">
                              <td className="py-2.5 px-3 font-bold text-white">{header}</td>
                              <td
                                className="py-2.5 px-3 font-mono text-[11px] text-[#E7E5E4] truncate max-w-[180px]"
                                title={sampleVal}
                              >
                                {sampleVal}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  {/* A1: Value text #1C1917 on #FFF8F2 (16.63:1), unmapped placeholder #44403C on #FFF8F2 (9.76:1) */}
                                  <select
                                    aria-label={`Target field for ${header}`}
                                    data-testid={`mapping-select-${header}`}
                                    value={mappedKey || ''}
                                    onChange={(e) => {
                                      const val = e.target.value || null;
                                      setColumnMapping({
                                        ...columnMapping,
                                        [header]: val,
                                      });
                                      setMappingErrorBanner(null);
                                    }}
                                    style={{
                                      color: mappedKey ? '#1C1917' : '#44403C',
                                      backgroundColor: '#FFF8F2',
                                    }}
                                    className={`w-full bg-[#FFF8F2] border border-[#FED7AA] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#EA580C] ${
                                      mappedKey ? 'text-[#1C1917]' : 'text-[#44403C]'
                                    }`}
                                  >
                                    <option
                                      value=""
                                      style={{ color: '#44403C', backgroundColor: '#FFF8F2' }}
                                    >
                                      — Do Not Import ({dict.importOptionalUnmappedHint}) —
                                    </option>
                                    {currentConfig.fields.map((f) => (
                                      <option
                                        key={f.key}
                                        value={f.key}
                                        style={{ color: '#1C1917', backgroundColor: '#FFF8F2' }}
                                      >
                                        {f.label} {f.required ? '*Required*' : '(Optional)'}
                                      </option>
                                    ))}
                                  </select>

                                  {/* B3: ⓘ Tooltip button describing field + example value */}
                                  <div className="relative shrink-0">
                                    <button
                                      type="button"
                                      data-testid={`mapping-tooltip-btn-${header}`}
                                      title={tooltipText}
                                      aria-label={`Field info for ${header}`}
                                      onClick={() =>
                                        setOpenTooltipHeader(isTooltipOpen ? null : header)
                                      }
                                      className="w-6 h-6 rounded-lg bg-[#292524] hover:bg-[#44403C] text-[#FED7AA] flex items-center justify-center transition-colors"
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                    {isTooltipOpen && (
                                      <div
                                        role="tooltip"
                                        className="absolute right-0 top-7 z-30 w-64 p-2.5 rounded-xl bg-[#FFF8F2] text-[#1C1917] border border-[#C2410C] shadow-xl text-[11px] space-y-1"
                                      >
                                        {matchedField ? (
                                          <>
                                            <div className="font-bold text-[#1C1917]">
                                              {matchedField.label}{' '}
                                              <span className="text-[#9A3412]">
                                                ({matchedField.required ? 'Required' : 'Optional'})
                                              </span>
                                            </div>
                                            <p className="text-[#44403C]">
                                              {matchedField.description}
                                            </p>
                                            <div className="font-mono text-[10px] text-[#1C1917] bg-white px-2 py-1 rounded border border-[#FED7AA]">
                                              Example: &quot;{String(matchedField.example)}&quot;
                                            </div>
                                          </>
                                        ) : (
                                          <p className="text-[#44403C]">
                                            This spreadsheet column is unmapped and{' '}
                                            <strong className="text-[#1C1917]">
                                              {dict.importOptionalUnmappedHint}
                                            </strong>
                                            .
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {matchedField ? (
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                      matchedField.required
                                        ? 'bg-[#FED7AA] text-[#1C1917] border border-[#EA580C]'
                                        : 'bg-[#D1FAE5] text-[#064E3B] border border-[#059669]'
                                    }`}
                                  >
                                    {matchedField.required ? 'Mandatory' : 'Optional'}
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#292524] text-[#E7E5E4] border border-[#44403C]">
                                    Ignored ({dict.importOptionalUnmappedHint})
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* B3: Required unmapped blocking banner */}
                  {(unmappedRequiredFields.length > 0 || mappingErrorBanner) && (
                    <div
                      data-testid="unmapped-required-alert"
                      role="alert"
                      className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#DC2626]/40 text-[#991B1B] text-xs space-y-1"
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                        <span>
                          {mappingErrorBanner ||
                            dict.importRequiredUnmappedError.replace(
                              '{field}',
                              unmappedRequiredFields[0]?.label || 'Required field'
                            )}
                        </span>
                      </div>
                      {unmappedRequiredFields.length > 1 && (
                        <ul className="list-disc list-inside text-[11px] pl-1 space-y-0.5">
                          {unmappedRequiredFields.map((f) => (
                            <li key={f.key}>
                              {dict.importRequiredUnmappedError.replace('{field}', f.label)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* B3: Optional unmapped fields hint */}
                  {unmappedOptionalFields.length > 0 && (
                    <div
                      data-testid="unmapped-optional-hint"
                      className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-xs text-[#44403C] flex items-center gap-2 flex-wrap"
                    >
                      <Info className="w-4 h-4 text-[#C2410C] shrink-0" />
                      <span>
                        Optional unmapped fields ({dict.importOptionalUnmappedHint}):{' '}
                        <strong className="text-[#1C1917]">
                          {unmappedOptionalFields.map((f) => f.label).join(', ')}
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('UPLOAD_FILE')}
                      className="px-4 py-2 rounded-xl bg-[#FFF8F2] hover:bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] text-xs font-bold flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      data-testid="verify-and-preview-btn"
                      aria-disabled={unmappedRequiredFields.length > 0 || isValidating}
                      onClick={handleProceedToValidation}
                      disabled={isValidating}
                      className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                        unmappedRequiredFields.length > 0
                          ? 'bg-[#FFF0E6] text-[#9A3412] border border-[#C2410C]/40 cursor-not-allowed'
                          : 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-md'
                      }`}
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
                    <div className="p-3.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
                      <span className="text-[10px] font-bold text-[#44403C] uppercase">
                        Total Rows
                      </span>
                      <div className="text-xl font-black text-[#1C1917]">
                        {validationResult.totalRows}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#059669]/40">
                      <span className="text-[10px] font-bold text-[#065F46] uppercase">
                        Ready to Import
                      </span>
                      <div className="text-xl font-black text-[#065F46]">
                        {validationResult.validCount}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#D97706]/40">
                      <span className="text-[10px] font-bold text-[#92400E] uppercase">
                        Duplicates Detected
                      </span>
                      <div className="text-xl font-black text-[#92400E]">
                        {validationResult.duplicateCount}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/40">
                      <span className="text-[10px] font-bold text-[#991B1B] uppercase">
                        Syntax Errors
                      </span>
                      <div className="text-xl font-black text-[#991B1B]">
                        {validationResult.invalidCount}
                      </div>
                    </div>
                  </div>

                  {/* Duplicate Strategy Radio Selector */}
                  <div className="p-4 rounded-2xl bg-[#FFF8F2] border border-[#FED7AA] space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917] flex-wrap">
                      <span>Duplicate Handling Strategy:</span>
                      <span className="text-[11px] font-normal text-[#44403C]">
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
                              ? 'bg-[#FFF0E6] border-[#C2410C] text-[#1C1917] shadow-xs'
                              : 'bg-white border-[#FED7AA] text-[#1C1917] hover:border-[#C2410C]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="duplicateStrategy"
                              value={strat.id}
                              checked={duplicateStrategy === strat.id}
                              onChange={() => setDuplicateStrategy(strat.id)}
                              className="accent-[#C2410C]"
                            />
                            <span className="font-bold text-xs text-[#1C1917]">{strat.title}</span>
                          </div>
                          <p className="text-[10px] text-[#44403C] mt-1 pl-5">{strat.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sample Rows Preview Table */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1C1917]">
                        Data Preview (First 8 Rows):
                      </span>
                      <span className="text-[#44403C] text-[11px]">
                        Red highlights indicate validation errors
                      </span>
                    </div>

                    <div className="border border-[#1C1917] rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#FFF8F2] text-[#1C1917] uppercase text-[9px] font-bold border-b border-[#FED7AA] sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Row</th>
                            <th className="py-2 px-3">Status</th>
                            {currentConfig.fields.slice(0, 4).map((f) => (
                              <th key={f.key} className="py-2 px-3">
                                {f.label}
                              </th>
                            ))}
                            <th className="py-2 px-3">Issues / Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#292524] bg-[#1C1917] text-white">
                          {validationResult.evaluatedRows.slice(0, 8).map((r: any) => (
                            <tr key={r.rowNumber} className="hover:bg-[#292524]">
                              <td className="py-2 px-3 font-mono font-bold text-[#E7E5E4]">
                                #{r.rowNumber}
                              </td>
                              <td className="py-2 px-3 font-semibold">
                                {!r.isValid ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FEF2F2] text-[#991B1B] font-bold">
                                    <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
                                    <span>Error</span>
                                  </span>
                                ) : r.isDuplicate ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFFBEB] text-[#92400E] font-bold">
                                    <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                                    <span>Duplicate</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                                    <span>Valid</span>
                                  </span>
                                )}
                              </td>
                              {currentConfig.fields.slice(0, 4).map((f) => (
                                <td
                                  key={f.key}
                                  className="py-2 px-3 font-medium text-white truncate max-w-[140px]"
                                >
                                  {r.parsedData[f.key] !== null && r.parsedData[f.key] !== undefined
                                    ? String(r.parsedData[f.key])
                                    : '—'}
                                </td>
                              ))}
                              <td className="py-2 px-3 text-[10px] max-w-[200px] truncate">
                                {r.errors.length > 0 ? (
                                  <span className="text-[#FCA5A5] font-semibold">
                                    {r.errors.join(', ')}
                                  </span>
                                ) : r.warnings.length > 0 ? (
                                  <span className="text-[#FCD34D] font-semibold">
                                    {r.warnings.join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-[#6EE7B7] font-semibold">Ready</span>
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
                      type="button"
                      onClick={() => setCurrentStep('MAP_COLUMNS')}
                      className="px-4 py-2 rounded-xl bg-[#FFF8F2] hover:bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] text-xs font-bold flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Mapping</span>
                    </button>

                    <button
                      type="button"
                      data-testid="start-bulk-import-btn"
                      onClick={handleExecuteBatch}
                      className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs shadow-md flex items-center gap-2 transition-all"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Start Bulk Import ({validationResult.totalRows} Rows)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5A: LIVE BATCH EXECUTION PROGRESS */}
              {currentStep === 'PROCESSING' && (
                <div className="py-12 space-y-6 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF0E6] border border-[#C2410C]/30 text-[#C2410C] flex items-center justify-center mx-auto shadow-sm">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#1C1917]">
                      Importing into Database...
                    </h3>
                    <p className="text-xs text-[#44403C]">{progressMessage}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-[#FFF8F2] rounded-full h-3 overflow-hidden p-0.5 border border-[#FED7AA]">
                      <div
                        className="bg-[#C2410C] h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono font-bold text-[#44403C]">
                      <span>
                        {batchStats.imported +
                          batchStats.updated +
                          batchStats.skipped +
                          batchStats.failed}{' '}
                        / {batchStats.totalRows} Processed
                      </span>
                      <span className="text-[#9A3412]">{progressPercent}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5B: COMPLETED RESULTS & ERROR REPORT DOWNLOAD */}
              {currentStep === 'COMPLETED' && (
                <div className="space-y-6 text-center max-w-lg mx-auto py-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#059669]/30 text-[#059669] flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-[#1C1917]">
                      Import Process Complete!
                    </h3>
                    <p className="text-xs text-[#44403C]">
                      The batch execution has concluded. All successful records have been written directly to your VigilAMC database.
                    </p>
                  </div>

                  {/* Result Metric Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                    <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#059669]/40">
                      <span className="text-[10px] font-bold text-[#065F46] uppercase">
                        Newly Created
                      </span>
                      <div className="text-lg font-black text-[#065F46]">
                        +{batchStats.imported}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#D97706]/40">
                      <span className="text-[10px] font-bold text-[#92400E] uppercase">
                        Updated
                      </span>
                      <div className="text-lg font-black text-[#92400E]">
                        {batchStats.updated}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA]">
                      <span className="text-[10px] font-bold text-[#44403C] uppercase">
                        Skipped
                      </span>
                      <div className="text-lg font-black text-[#1C1917]">
                        {batchStats.skipped}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/40">
                      <span className="text-[10px] font-bold text-[#991B1B] uppercase">
                        Failed
                      </span>
                      <div className="text-lg font-black text-[#991B1B]">
                        {batchStats.failed}
                      </div>
                    </div>
                  </div>

                  {/* Download Error Report if there are failures */}
                  {collectedErrors.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#DC2626]/40 text-left space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 text-[#991B1B] text-xs font-bold">
                          <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                          <span>{collectedErrors.length} record(s) could not be imported</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDownloadErrorReport}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Download Error Report (.xlsx)</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-[#44403C]">
                        The error report contains original spreadsheet row data, specific rejection reasons, and suggested corrections so you can adjust and re-upload.
                      </p>
                    </div>
                  )}

                  {/* Done / Close Actions */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2.5 rounded-xl bg-[#FFF8F2] hover:bg-[#FFF0E6] text-[#1C1917] border border-[#FED7AA] font-bold text-xs"
                    >
                      Import Another File
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-xs shadow-md"
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
