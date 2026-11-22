'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  Flame,
  HelpCircle,
  MapPin,
  Mic,
  MicOff,
  Navigation,
  PenLine,
  Phone,
  RefreshCw,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import { dueChip, formatDisplay } from '@/lib/dates';
import {
  getActionTakenLabel,
  getTaskActionDictionary,
  WORK_ORDER_ACTION_TAKEN_VALUES,
  WorkOrderActionTakenValue,
} from '@/lib/i18n/taskAction';
import {
  formatLocalizedDateTime,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TranslationDictionary,
} from '@/lib/i18n/technician';

export interface TaskEquipmentItem {
  id: string;
  qrCode?: string | null;
  type?: string | null;
  category?: string | null;
  capacity?: string | null;
  location?: string | null;
  floor?: string | null;
  wing?: string | null;
  status?: string | null;
  nextDueDate?: string | Date | null;
  lastServiceDate?: string | Date | null;
  dueState?: string;
  diffDays?: number | null;
  daysOverdue?: number;
  isLinkedToTask?: boolean;
}

export interface TaskSubmitPayload {
  actionTaken: WorkOrderActionTakenValue;
  notes: string;
  photoDataUrl: string | null;
}

interface AssignedTaskDetailViewProps {
  task: any;
  fallbackBuildingEquipments?: any[];
  currentLang: SupportedLanguage;
  t: TranslationDictionary;
  onBack: () => void;
  onStartTask: (task: any) => Promise<void> | void;
  onOpenSubmitModal: () => void;
}

function formatEquipmentTypeLabel(eq: TaskEquipmentItem): string {
  const type = (eq.type || '').trim();
  const cap = (eq.capacity || '').trim();
  if (type && cap) {
    if (cap.toLowerCase().includes(type.toLowerCase())) return cap;
    if (type.toLowerCase().includes(cap.toLowerCase())) return type;
    return `${type} · ${cap}`;
  }
  return cap || type || 'Fire Equipment';
}

function formatEquipmentLocation(eq: TaskEquipmentItem): string {
  const loc = (eq.location || '').trim();
  const floor = (eq.floor || '').trim();
  const wing = (eq.wing || '').trim();
  const parts: string[] = [];
  if (loc) parts.push(loc);
  if (floor && !loc.toLowerCase().includes(floor.toLowerCase())) parts.push(floor);
  if (wing && !loc.toLowerCase().includes(wing.toLowerCase())) parts.push(wing);
  return parts.join(' · ') || '—';
}

export function AssignedTaskDetailView({
  task,
  fallbackBuildingEquipments = [],
  currentLang,
  t,
  onBack,
  onStartTask,
  onOpenSubmitModal,
}: AssignedTaskDetailViewProps) {
  const taskT = useMemo(() => getTaskActionDictionary(currentLang), [currentLang]);

  // Dual enforcement (server-filtered task.taskEquipments + live client-side dueChip filter & sort)
  // Guard 1: linked equipment always shown with its real status
  // Guard 2: zero overdue + no linked -> empty array (honest empty state)
  // Sort: most overdue first (most negative diff first)
  const displayEquipments = useMemo(() => {
    const sourceList: TaskEquipmentItem[] = Array.isArray(task?.taskEquipments)
      ? task.taskEquipments
      : fallbackBuildingEquipments;

    const filtered: Array<TaskEquipmentItem & { _chip: ReturnType<typeof dueChip> }> = [];
    const seen = new Set<string>();

    for (const eq of sourceList) {
      if (!eq?.id || seen.has(eq.id)) continue;
      const chip = dueChip(eq.nextDueDate);
      const isLinked = Boolean(eq.isLinkedToTask || (task?.equipmentId && eq.id === task.equipmentId));
      if (chip.state !== 'EXPIRED' && !isLinked) continue;
      seen.add(eq.id);
      filtered.push({ ...eq, isLinkedToTask: isLinked, _chip: chip });
    }

    // Fallback: ensure task.equipment is never hidden even if missing from cached list
    if (task?.equipment?.id && !seen.has(task.equipment.id)) {
      const chip = dueChip(task.equipment.nextDueDate);
      filtered.push({
        ...task.equipment,
        isLinkedToTask: true,
        _chip: chip,
      });
    }

    filtered.sort((a, b) => {
      const dA = typeof a._chip.diff === 'number' ? a._chip.diff : Number.MAX_SAFE_INTEGER;
      const dB = typeof b._chip.diff === 'number' ? b._chip.diff : Number.MAX_SAFE_INTEGER;
      if (dA !== dB) return dA - dB;
      return String(a.qrCode || a.id).localeCompare(String(b.qrCode || b.id));
    });

    return filtered;
  }, [task, fallbackBuildingEquipments]);

  const overdueCount = useMemo(
    () => displayEquipments.filter((eq) => eq._chip.state === 'EXPIRED').length,
    [displayEquipments]
  );

  const taskChip = useMemo(() => dueChip(task?.dueDate), [task?.dueDate]);
  const isCompleted = task?.status === 'COMPLETED';
  const isCancelled = task?.status === 'CANCELLED';

  const mapDestination =
    task?.building?.latitude && task?.building?.longitude
      ? `${task.building.latitude},${task.building.longitude}`
      : encodeURIComponent(task?.building?.address || task?.building?.name || task?.buildingName || '');
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapDestination}`;

  return (
    <div data-testid="assigned-task-detail-view" className="p-4 space-y-4">
      {/* Top Back Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          data-testid="assigned-task-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl bg-white border border-[#D6D3D1] text-[#1C1917] font-bold text-xs shadow-xs hover:border-[#EA580C] motion-safe:transition-colors motion-safe:duration-150"
        >
          <ArrowLeft className="w-4 h-4 text-[#C2410C]" />
          <span>{taskT.taskBackToTasks}</span>
        </button>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9A3412] bg-[#FEE6E0] border border-[#EA580C]/30 px-2.5 py-1 rounded-full">
          {taskT.taskDetailHeading}
        </span>
      </div>

      {/* Task Summary Card */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-black text-[#1C1917] leading-snug">{task?.title}</h2>
            <div className="flex items-center gap-1.5 text-xs text-[#44403C] font-semibold">
              <Building2 className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
              <span className="truncate">{task?.building?.name || task?.buildingName || 'Facility'}</span>
            </div>
            {task?.building?.address && (
              <div className="flex items-start gap-1.5 text-xs text-[#44403C]">
                <MapPin className="w-3.5 h-3.5 text-[#57534E] shrink-0 mt-0.5" />
                <span className="leading-snug">{task.building.address}</span>
              </div>
            )}
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold font-mono uppercase shrink-0 border ${
              task?.status === 'COMPLETED'
                ? 'bg-white text-[#047857] border-[#059669]'
                : task?.status === 'IN_PROGRESS'
                ? 'bg-[#FFFBEB] text-[#92400E] border-[#D97706]'
                : 'bg-[#FFF8F2] text-[#9A3412] border-[#FED7AA]'
            }`}
          >
            {task?.status}
          </span>
        </div>

        {task?.description && (
          <p className="text-xs text-[#44403C] leading-relaxed bg-[#FFF8F2] border border-[#FED7AA]/70 rounded-xl p-3">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-1.5 text-[#44403C] font-semibold tabular-nums">
            <Calendar className="w-3.5 h-3.5 text-[#57534E]" />
            <span>
              {taskT.taskDueDateLabel}: {task?.dueDate ? formatDisplay(task.dueDate) : '—'}
            </span>
          </div>
          {task?.dueDate && taskChip.state !== 'NONE' && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border tabular-nums ${
                taskChip.state === 'EXPIRED'
                  ? 'bg-white text-[#DC2626] border-[#DC2626]'
                  : taskChip.state === 'DUE_SOON'
                  ? 'bg-[#FFFBEB] text-[#92400E] border-[#D97706]'
                  : 'bg-[#ECFDF5] text-[#047857] border-[#059669]'
              }`}
            >
              {taskChip.state === 'EXPIRED'
                ? taskT.taskDaysOverdue.replace('{n}', String(taskChip.days ?? 0))
                : taskChip.label}
            </span>
          )}
        </div>

        {/* Quick Actions: Start / Navigate / Call */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {!isCompleted && !isCancelled && task?.status !== 'IN_PROGRESS' && (
            <button
              type="button"
              data-testid="assigned-task-start-btn"
              onClick={() => onStartTask(task)}
              className="col-span-2 min-h-[48px] py-2.5 px-4 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 motion-safe:transition-colors motion-safe:duration-150"
            >
              <Flame className="w-4 h-4" />
              <span>{t.startTask}</span>
            </button>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] py-2 px-3 rounded-xl bg-white hover:bg-[#FFF8F2] border border-[#D6D3D1] text-[#1C1917] font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-4 h-4 text-[#C2410C]" />
            <span>{t.navigate}</span>
          </a>
          {task?.contactPhone ? (
            <a
              href={`tel:${task.contactPhone}`}
              className="min-h-[44px] py-2 px-3 rounded-xl bg-white hover:bg-[#FFF8F2] border border-[#D6D3D1] text-[#1C1917] font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Phone className="w-4 h-4 text-[#C2410C]" />
              <span className="truncate">{t.callSite}</span>
            </a>
          ) : (
            <div className="min-h-[44px] py-2 px-3 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-[#44403C] font-semibold text-xs flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#9A3412]" />
              <span>{task?.priority || 'MEDIUM'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Completed Action-Taken Summary Card (when task already completed) */}
      {isCompleted && (
        <div
          data-testid="assigned-task-completed-summary"
          className="bg-white border border-[#059669]/40 rounded-2xl p-4 space-y-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[#047857] font-extrabold text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>{taskT.taskCompletedSummary}</span>
            </div>
            {task?.completedAt && (
              <span className="text-[11px] font-mono text-[#44403C]">
                {formatLocalizedDateTime(task.completedAt, currentLang)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-[#44403C]">{taskT.actionTakenLabel}:</span>
            <span
              data-testid="assigned-task-recorded-action"
              className="px-2.5 py-1 rounded-full bg-[#FEE6E0] text-[#9A3412] border border-[#EA580C]/40 font-extrabold text-xs"
            >
              {getActionTakenLabel(task?.actionTaken, currentLang)}
            </span>
          </div>
          {task?.notes && (
            <div className="text-xs text-[#1C1917] bg-[#FFF8F2] border border-[#FED7AA] rounded-xl p-2.5">
              <span className="font-bold text-[#44403C] block mb-0.5">{t.remarksLabel}:</span>
              <p className="whitespace-pre-wrap break-words">{task.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Overdue Fire Equipment Section (ONLY overdue + linked guard, most overdue first) */}
      <section className="space-y-3" aria-labelledby="task-overdue-heading">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3
              id="task-overdue-heading"
              className="text-sm font-black text-[#1C1917] flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{taskT.taskOverdueEquipmentHeading}</span>
            </h3>
            <p className="text-[11px] text-[#44403C] font-medium mt-0.5">
              {taskT.taskFilterOverdueOnly}
            </p>
          </div>
          {overdueCount > 0 && (
            <span
              data-testid="assigned-task-overdue-count"
              className="px-2.5 py-1 rounded-full bg-white border border-[#DC2626] text-[#DC2626] text-[11px] font-extrabold tabular-nums shrink-0"
            >
              {taskT.taskOverdueCountChip.replace('{n}', String(overdueCount))}
            </span>
          )}
        </div>

        {displayEquipments.length === 0 ? (
          <div
            data-testid="assigned-task-empty-equipment"
            className="bg-white border border-[#FED7AA] rounded-2xl p-6 text-center space-y-2.5 shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] border border-[#059669]/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-[#059669]" />
            </div>
            <p className="text-xs font-bold text-[#1C1917] leading-relaxed">
              {taskT.taskNoOverdueEmpty}
            </p>
          </div>
        ) : (
          <div data-testid="assigned-task-equipment-list" className="space-y-2.5">
            {displayEquipments.map((eq) => {
              const chip = eq._chip;
              const isExpired = chip.state === 'EXPIRED';
              const isDueSoon = chip.state === 'DUE_SOON';
              const typeLabel = formatEquipmentTypeLabel(eq);
              const locationLabel = formatEquipmentLocation(eq);

              return (
                <div
                  key={eq.id}
                  data-testid={`task-overdue-equip-${eq.id}`}
                  data-diff-days={chip.diff ?? ''}
                  data-due-state={chip.state}
                  className={`bg-white rounded-2xl p-3.5 space-y-2 shadow-xs border ${
                    isExpired ? 'border-[#DC2626]/40 border-l-4 border-l-[#DC2626]' : 'border-[#FED7AA]'
                  }`}
                >
                  {/* Top row: Equipment ID + Status / Overdue Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          data-testid="task-equip-id"
                          className="font-mono text-sm font-black text-[#1C1917] break-all"
                        >
                          {eq.qrCode || eq.id}
                        </span>
                        {eq.isLinkedToTask && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FEE6E0] text-[#9A3412] border border-[#EA580C]/30 text-[10px] font-extrabold">
                            {taskT.taskLinkedAssetTag}
                          </span>
                        )}
                      </div>
                      <p data-testid="task-equip-type" className="text-xs font-bold text-[#44403C] mt-0.5">
                        {typeLabel}
                      </p>
                    </div>

                    {/* Overdue / Real Status Badge (EXPIRED #DC2626 ONLY for overdue) */}
                    {isExpired ? (
                      <span
                        data-testid="task-equip-overdue-badge"
                        className="px-2.5 py-1 rounded-full bg-white border border-[#DC2626] text-[#DC2626] text-[11px] font-extrabold tabular-nums shrink-0"
                      >
                        {taskT.taskDaysOverdue.replace('{n}', String(chip.days ?? 0))}
                      </span>
                    ) : isDueSoon ? (
                      <span className="px-2.5 py-1 rounded-full bg-[#FFFBEB] border border-[#D97706] text-[#92400E] text-[11px] font-extrabold tabular-nums shrink-0">
                        {chip.label}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#059669] text-[#047857] text-[11px] font-extrabold tabular-nums shrink-0">
                        {chip.label}
                      </span>
                    )}
                  </div>

                  {/* Direct Detail Rows (Location + Due Date — no extra tap needed) */}
                  <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-stone-100 text-xs text-[#44403C]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
                      <span data-testid="task-equip-location" className="font-medium leading-snug">
                        <span className="text-[#57534E] font-semibold">{taskT.taskLocationLabel}: </span>
                        <span className="text-[#1C1917] font-semibold">{locationLabel}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#57534E] shrink-0" />
                      <span data-testid="task-equip-duedate" className="font-medium">
                        <span className="text-[#57534E] font-semibold">{taskT.taskDueDateLabel}: </span>
                        <span className={isExpired ? 'text-[#DC2626] font-extrabold' : 'text-[#1C1917] font-semibold'}>
                          {eq.nextDueDate ? formatDisplay(eq.nextDueDate) : 'No due date set'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Primary Complete & Submit CTA */}
      {!isCompleted && !isCancelled && (
        <div className="pt-2">
          <button
            type="button"
            data-testid="open-task-submit-modal-btn"
            onClick={onOpenSubmitModal}
            className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 motion-safe:transition-colors motion-safe:duration-150"
          >
            <FileCheck2 className="w-5 h-5" />
            <span>{taskT.taskCompleteSubmitBtn}</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface TaskCompleteSubmitModalProps {
  task: any;
  currentLang: SupportedLanguage;
  t: TranslationDictionary;
  submitting: boolean;
  onClose: () => void;
  onCapturePhotoFile: (file: File) => Promise<string | null>;
  onCapturePhotoNative?: () => Promise<string | null>;
  isNativePlatform: boolean;
  onSubmit: (payload: TaskSubmitPayload) => Promise<boolean>;
}

const ACTION_PILL_ICONS: Record<WorkOrderActionTakenValue, React.ComponentType<{ className?: string }>> = {
  NO_ACTION: CheckCircle2,
  REFILLED: Flame,
  REPLACED: RefreshCw,
  SERVICED: Wrench,
  MISSING: HelpCircle,
  OTHER: PenLine,
};

export function TaskCompleteSubmitModal({
  task,
  currentLang,
  t,
  submitting,
  onClose,
  onCapturePhotoFile,
  onCapturePhotoNative,
  isNativePlatform,
  onSubmit,
}: TaskCompleteSubmitModalProps) {
  const taskT = useMemo(() => getTaskActionDictionary(currentLang), [currentLang]);

  // Default selected = "No action needed" (ALWAYS visible)
  const [actionTaken, setActionTaken] = useState<WorkOrderActionTakenValue>('NO_ACTION');
  const [remarks, setRemarks] = useState<string>(task?.notes || '');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const remarksInputRef = useRef<HTMLTextAreaElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // When "Other" is selected, activate & focus remarks field
  useEffect(() => {
    if (actionTaken === 'OTHER') {
      requestAnimationFrame(() => {
        remarksInputRef.current?.focus();
      });
    } else {
      setValidationError(null);
    }
  }, [actionTaken]);

  const isOtherInvalid = actionTaken === 'OTHER' && remarks.trim().length < 4;

  const handleToggleMic = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
      recognition.lang = langMeta?.bcp47 || 'hi-IN';
      recognition.onstart = () => setIsListeningMic(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setRemarks((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListeningMic(false);
      };
      recognition.onerror = () => setIsListeningMic(false);
      recognition.onend = () => setIsListeningMic(false);
      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  const handleCameraClick = async () => {
    if (isNativePlatform && onCapturePhotoNative) {
      setProcessingPhoto(true);
      try {
        const result = await onCapturePhotoNative();
        if (result) setPhotoDataUrl(result);
      } finally {
        setProcessingPhoto(false);
      }
    } else {
      photoInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingPhoto(true);
    try {
      const result = await onCapturePhotoFile(file);
      if (result) setPhotoDataUrl(result);
    } finally {
      setProcessingPhoto(false);
    }
  };

  const handleConfirm = async () => {
    if (actionTaken === 'OTHER' && remarks.trim().length < 4) {
      setValidationError(taskT.actionOtherRemarksRequired);
      remarksInputRef.current?.focus();
      return;
    }
    setValidationError(null);
    await onSubmit({
      actionTaken,
      notes: remarks.trim(),
      photoDataUrl,
    });
  };

  return (
    <div
      data-testid="task-complete-submit-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-submit-modal-title"
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white border border-[#FED7AA] rounded-t-3xl sm:rounded-3xl max-w-md w-full mx-auto p-5 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#FED7AA]">
          <div className="min-w-0">
            <h3 id="task-submit-modal-title" className="text-base font-black text-[#1C1917]">
              {taskT.taskSubmitModalTitle}
            </h3>
            <p className="text-xs font-semibold text-[#44403C] truncate mt-0.5">
              {task?.title} · {task?.building?.name || task?.buildingName || ''}
            </p>
          </div>
          <button
            type="button"
            data-testid="close-task-submit-modal-btn"
            disabled={submitting}
            onClick={onClose}
            aria-label={t.close || 'Close'}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-stone-100 text-[#1C1917] hover:bg-stone-200 flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. ACTION-TAKEN SELECTOR (ALWAYS VISIBLE, ABOVE PHOTO & REMARKS, DEFAULT = NO_ACTION) */}
        <div className="space-y-2" data-testid="action-taken-selector">
          <span className="text-xs font-extrabold text-[#1C1917] uppercase tracking-wider block">
            {taskT.actionTakenLabel}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {WORK_ORDER_ACTION_TAKEN_VALUES.map((val) => {
              const Icon = ACTION_PILL_ICONS[val];
              const isSelected = actionTaken === val;
              const label = getActionTakenLabel(val, currentLang);

              return (
                <button
                  key={val}
                  type="button"
                  data-testid={`action-taken-pill-${val}`}
                  aria-pressed={isSelected}
                  onClick={() => setActionTaken(val)}
                  className={`min-h-[46px] px-3 py-2 rounded-xl text-left text-xs flex items-center gap-2 motion-safe:transition-colors motion-safe:duration-150 ${
                    isSelected
                      ? 'bg-[#FEE6E0] border-2 border-[#EA580C] text-[#9A3412] font-extrabold shadow-xs'
                      : 'bg-white border border-[#D6D3D1] text-[#1C1917] font-bold hover:border-[#EA580C]/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-[#9A3412]' : 'text-[#57534E]'
                    }`}
                  />
                  <span className="leading-tight break-words">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. PHOTO EVIDENCE (BELOW ACTION-TAKEN SELECTOR) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#44403C] uppercase tracking-wider block">
            {t.capturePhoto}
          </span>

          {photoDataUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#D6D3D1] shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoDataUrl} alt="Task photo proof" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => setPhotoDataUrl(null)}
                className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-[#1C1917]/85 text-white text-xs font-bold"
              >
                {t.retakePhoto}
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={processingPhoto}
                onClick={handleCameraClick}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#FFF8F2] border-2 border-dashed border-[#FED7AA] hover:border-[#C2410C] text-[#1C1917] font-bold text-xs flex items-center justify-center gap-2 motion-safe:transition-colors motion-safe:duration-150"
              >
                <Camera className="w-4 h-4 text-[#C2410C]" />
                <span>{processingPhoto ? t.stampingPhoto : t.capturePhoto}</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. REMARKS + VOICE MIC (OPTIONAL EXCEPT "OTHER" >= 4 CHARS) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="task-submit-remarks"
              className="text-xs font-bold text-[#1C1917] flex items-center gap-1"
            >
              <span>{t.remarksLabel}</span>
              {actionTaken === 'OTHER' && (
                <span className="text-[#9A3412] font-extrabold" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={handleToggleMic}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 min-h-[36px] border ${
                isListeningMic
                  ? 'bg-[#C2410C] text-white border-[#C2410C]'
                  : 'bg-[#FFF8F2] text-[#9A3412] border-[#FED7AA]'
              }`}
            >
              {isListeningMic ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isListeningMic ? t.micListening : 'Mic'}</span>
            </button>
          </div>
          <textarea
            id="task-submit-remarks"
            ref={remarksInputRef}
            data-testid="task-submit-remarks-input"
            rows={3}
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (validationError && e.target.value.trim().length >= 4) {
                setValidationError(null);
              }
            }}
            required={actionTaken === 'OTHER'}
            placeholder={
              actionTaken === 'OTHER' ? taskT.actionOtherPlaceholder : t.remarksPlaceholder
            }
            className={`w-full px-3 py-2.5 rounded-xl bg-white border text-[#1C1917] text-xs placeholder-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#C2410C] ${
              validationError || isOtherInvalid
                ? 'border-[#EA580C] bg-[#FFF8F2]/50'
                : 'border-[#D6D3D1]'
            }`}
          />
          {(validationError || isOtherInvalid) && (
            <p
              data-testid="other-remarks-error"
              role="alert"
              className="text-xs font-bold text-[#9A3412] flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#C2410C]" />
              <span>{validationError || taskT.actionOtherRemarksRequired}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          data-testid="confirm-task-submit-btn"
          disabled={submitting || processingPhoto || isOtherInvalid}
          onClick={handleConfirm}
          className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed motion-safe:transition-colors motion-safe:duration-150"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.submitting}</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>{taskT.taskSubmitConfirmBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
