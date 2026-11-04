'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin,
  Upload,
  X,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { compressImageToDataUrl } from '@/lib/compressImage';
import type { AdminDictionary } from '@/lib/i18n/admin';

interface FloorPlansModalProps {
  building: any | null;
  onClose: () => void;
  onViewAsset: (eq: any) => void;
  showToast: (msg: string) => void;
  t?: AdminDictionary;
}

function computePinCompliance(eq: any): {
  status: 'OK' | 'DUE_SOON' | 'EXPIRED';
  colorHex: string;
  label: string;
} {
  const now = new Date();
  const dueRaw = eq?.nextDueDate || eq?.refillDueDate || eq?.hydroDueDate;
  const dueDate = dueRaw && !isNaN(new Date(dueRaw).getTime()) ? new Date(dueRaw) : null;
  const diffDays = dueDate
    ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if ((diffDays !== null && diffDays < 0) || eq?.status === 'OVERDUE' || eq?.status === 'DEFECTIVE') {
    return { status: 'EXPIRED', colorHex: '#DC2626', label: 'EXPIRED' };
  }
  if ((diffDays !== null && diffDays <= 30) || eq?.status === 'DUE_SOON') {
    return { status: 'DUE_SOON', colorHex: '#D97706', label: 'DUE SOON' };
  }
  return { status: 'OK', colorHex: '#059669', label: 'OK' };
}

export function FloorPlansModal({
  building,
  onClose,
  onViewAsset,
  showToast,
  t,
}: FloorPlansModalProps) {
  const [floorPlans, setFloorPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Upload new floor plan state
  const [floorLabel, setFloorLabel] = useState('Ground Floor');
  const [uploading, setUploading] = useState(false);

  // Layer toggle chips by asset type (Module H3)
  const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);

  // Click-to-place pin state
  const [pendingClickCoords, setPendingClickCoords] = useState<{ xPct: number; yPct: number } | null>(null);
  const [selectedAssetIdForPin, setSelectedAssetIdForPin] = useState<string>('');

  // Selected pin popover state
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [confirmDeletePinId, setConfirmDeletePinId] = useState<string | null>(null);

  // Dragging pin state
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);
  const planCanvasRef = useRef<HTMLDivElement | null>(null);

  // Pan & Zoom state (Module H4: CSS transform only)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const buildingEquipments: any[] = useMemo(
    () => (Array.isArray(building?.equipments) ? building.equipments : []),
    [building]
  );

  const assetTypes = useMemo(() => {
    const types = new Set<string>();
    for (const eq of buildingEquipments) {
      if (eq?.type) types.add(String(eq.type));
    }
    return Array.from(types);
  }, [buildingEquipments]);

  const fetchPlans = async () => {
    if (!building?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/floor-plans?buildingId=${encodeURIComponent(building.id)}`, {
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(json.floorPlans)) {
        setFloorPlans(json.floorPlans);
        if (json.floorPlans.length > 0 && !selectedPlanId) {
          setSelectedPlanId(json.floorPlans[0].id);
        }
      } else {
        showToast(json.error || 'Failed to load floor plans');
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error loading floor plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (building?.id) {
      fetchPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building?.id]);

  if (!building) return null;

  const activePlan = floorPlans.find((p) => p.id === selectedPlanId) || floorPlans[0] || null;
  const activePins: any[] = Array.isArray(activePlan?.pins) ? activePlan.pins : [];

  const handleUploadPlanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Floor plan image must be ≤ 2MB (PNG or JPEG)');
      return;
    }

    try {
      setUploading(true);
      const dataUrl = await compressImageToDataUrl(file, {
        maxDimension: 1600,
        quality: 0.85,
        mimeType: 'image/webp',
      });

      const res = await fetch('/api/admin/floor-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_PLAN',
          buildingId: building.id,
          floorLabel: floorLabel.trim() || 'Floor Plan',
          imageUrl: dataUrl,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(json.error || 'Failed to upload floor plan');
        return;
      }
      setFloorPlans((prev) => [...prev, json.floorPlan]);
      setSelectedPlanId(json.floorPlan.id);
      showToast(`Floor plan "${json.floorPlan.floorLabel}" uploaded!`);
    } catch (err: any) {
      showToast(err?.message || 'Error uploading floor plan');
    } finally {
      setUploading(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingPinId || !activePlan || !planCanvasRef.current) return;
    const rect = planCanvasRef.current.getBoundingClientRect();
    const xPct = Math.max(2, Math.min(98, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2))));
    const yPct = Math.max(2, Math.min(98, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2))));
    setPendingClickCoords({ xPct, yPct });
    setSelectedAssetIdForPin(buildingEquipments[0]?.id || '');
    setActivePinId(null);
  };

  const handleConfirmPlacePin = async () => {
    if (!activePlan || !pendingClickCoords || !selectedAssetIdForPin) return;
    try {
      const res = await fetch('/api/admin/floor-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_PIN',
          floorPlanId: activePlan.id,
          buildingId: building.id,
          equipmentId: selectedAssetIdForPin,
          xPct: pendingClickCoords.xPct,
          yPct: pendingClickCoords.yPct,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(json.error || 'Failed to place pin');
        return;
      }

      setFloorPlans((prev) =>
        prev.map((p) =>
          p.id === activePlan.id
            ? { ...p, pins: [...(p.pins || []), json.pin] }
            : p
        )
      );
      setPendingClickCoords(null);
      setActivePinId(json.pin.id);
      showToast(`Placed pin for ${json.pin.equipment?.qrCode || 'Asset'}!`);
    } catch (err: any) {
      showToast(err?.message || 'Network error placing pin');
    }
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingPinId || !planCanvasRef.current || !activePlan) return;
    const rect = planCanvasRef.current.getBoundingClientRect();
    const xPct = Math.max(2, Math.min(98, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(2))));
    const yPct = Math.max(2, Math.min(98, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(2))));

    setFloorPlans((prev) =>
      prev.map((p) =>
        p.id === activePlan.id
          ? {
              ...p,
              pins: (p.pins || []).map((pin: any) =>
                pin.id === draggingPinId ? { ...pin, xPct, yPct } : pin
              ),
            }
          : p
      )
    );
  };

  const handlePointerUpCanvas = async () => {
    if (!draggingPinId || !activePlan) return;
    const pinId = draggingPinId;
    setDraggingPinId(null);

    const movedPin = (activePlan.pins || []).find((p: any) => p.id === pinId);
    if (!movedPin) return;

    try {
      const res = await fetch('/api/admin/floor-plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinId: movedPin.id,
          xPct: movedPin.xPct,
          yPct: movedPin.yPct,
        }),
      });
      if (!res.ok) {
        showToast('Failed to save pin position');
        await fetchPlans();
        return;
      }
      showToast(`Pin position saved (${movedPin.xPct}%, ${movedPin.yPct}%)`);
    } catch {
      showToast('Network error saving pin position');
      await fetchPlans();
    }
  };

  const handleDeletePin = async (pinId: string) => {
    if (!activePlan) return;
    const snapshot = [...floorPlans];
    setFloorPlans((prev) =>
      prev.map((p) =>
        p.id === activePlan.id
          ? { ...p, pins: (p.pins || []).filter((pin: any) => pin.id !== pinId) }
          : p
      )
    );
    setConfirmDeletePinId(null);
    setActivePinId(null);

    try {
      const res = await fetch(`/api/admin/floor-plans?pinId=${encodeURIComponent(pinId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setFloorPlans(snapshot);
        showToast('Failed to delete pin');
        return;
      }
      showToast('Pin removed from floor plan');
    } catch {
      setFloorPlans(snapshot);
      showToast('Network error deleting pin');
    }
  };

  const toggleAssetTypeLayer = (typeStr: string) => {
    setHiddenTypes((prev) =>
      prev.includes(typeStr) ? prev.filter((x) => x !== typeStr) : [...prev, typeStr]
    );
  };

  return (
    <div
      data-testid="module-h-floor-plans-modal"
      className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-white border border-[#FED7AA] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-xs text-[#1C1917]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#FED7AA] bg-[#FFF8F2] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E6] border border-[#FED7AA] flex items-center justify-center text-[#C2410C]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                {t?.floorPlansTitle || 'Floor Plans & Asset Pins'} — {building.name}
              </h3>
              <p className="text-[11px] text-[#44403C]">
                {t?.floorPlansClickHint ||
                  'Click anywhere on the floor plan to place an asset pin, or drag existing pins to reposition.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#44403C] hover:text-[#1C1917] hover:bg-[#FFF0E6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls Bar: Floor Tabs + Upload New Plan + Layer Filter Chips */}
        <div className="p-3.5 sm:px-5 border-b border-[#FED7AA] bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Floor selector tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {floorPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                data-testid={`floor-tab-${plan.id}`}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setActivePinId(null);
                  setPendingClickCoords(null);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activePlan?.id === plan.id
                    ? 'bg-[#C2410C] text-white shadow-xs'
                    : 'bg-[#FFF8F2] text-[#44403C] hover:text-[#1C1917] border border-[#FED7AA]'
                }`}
              >
                {plan.floorLabel} ({(plan.pins || []).length} pins)
              </button>
            ))}
          </div>

          {/* Upload Floor Plan Form */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              data-testid="floor-label-input"
              value={floorLabel}
              onChange={(e) => setFloorLabel(e.target.value)}
              placeholder="e.g. Ground Floor / Basement 1"
              className="px-3 py-1.5 rounded-xl bg-[#FFF8F2] border border-[#FED7AA] text-xs text-[#1C1917] w-44"
            />
            <label
              data-testid="upload-floor-plan-label"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold cursor-pointer shadow-xs transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Uploading...' : t?.floorPlansUploadBtn || 'Upload Floor Plan'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleUploadPlanFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Layer Toggle Chips + Status Legend + Zoom Controls */}
        <div className="px-4 py-2.5 bg-[#FFF8F2] border-b border-[#FED7AA] flex flex-wrap items-center justify-between gap-3">
          {/* Layer toggle chips by asset type (Module H3) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold text-[#1C1917] mr-1">
              <Layers className="w-3.5 h-3.5 text-[#C2410C]" />
              Layers:
            </span>
            {assetTypes.map((typeStr) => {
              const hidden = hiddenTypes.includes(typeStr);
              return (
                <button
                  key={typeStr}
                  type="button"
                  data-testid={`layer-chip-${typeStr}`}
                  onClick={() => toggleAssetTypeLayer(typeStr)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                    hidden
                      ? 'bg-white text-[#44403C]/60 border-[#FED7AA] line-through'
                      : 'bg-[#FFF0E6] text-[#C2410C] border-[#C2410C]/40'
                  }`}
                >
                  {typeStr}
                </button>
              );
            })}
          </div>

          {/* Status Legend + Zoom/Pan controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 text-[11px] font-bold text-[#1C1917]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> OK
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> DUE SOON
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> EXPIRED
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white border border-[#FED7AA] rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                className="p-1 rounded-lg hover:bg-[#FFF0E6] text-[#1C1917]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[10px] font-bold">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
                className="p-1 rounded-lg hover:bg-[#FFF0E6] text-[#1C1917]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="p-1 rounded-lg hover:bg-[#FFF0E6] text-[#1C1917]"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Interactive Floor Plan Canvas */}
        <div className="flex-1 overflow-auto p-4 bg-[#FFF8F2]/60 flex items-center justify-center relative min-h-[360px]">
          {loading ? (
            <div className="text-center text-[#44403C] font-semibold">Loading floor plans...</div>
          ) : !activePlan ? (
            <div className="max-w-md text-center space-y-3 p-8 bg-white rounded-2xl border border-dashed border-[#FED7AA]">
              <MapPin className="w-10 h-10 text-[#C2410C] mx-auto" />
              <h4 className="text-sm font-bold text-[#1C1917]">No Floor Plans Uploaded Yet</h4>
              <p className="text-xs text-[#44403C]">
                Enter a floor name above (e.g. &quot;Ground Floor&quot;) and upload a PNG or JPEG schematic (≤ 2MB) to start placing live compliance-colored asset pins.
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-[#FED7AA] bg-white shadow-md max-w-full">
              <div
                ref={planCanvasRef}
                data-testid="floor-plan-canvas"
                onClick={handleCanvasClick}
                onPointerMove={handlePointerMoveCanvas}
                onPointerUp={handlePointerUpCanvas}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'center center',
                  touchAction: 'manipulation',
                }}
                className="relative inline-block select-none cursor-crosshair transition-transform duration-150"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePlan.imageUrl}
                  alt={activePlan.floorLabel}
                  draggable={false}
                  className="max-h-[58vh] w-auto max-w-full block object-contain pointer-events-none"
                />

                {/* Render Asset Pins */}
                {activePins.map((pin: any) => {
                  const eq =
                    buildingEquipments.find((x: any) => x.id === pin.equipmentId) ||
                    pin.equipment ||
                    {};
                  if (eq?.type && hiddenTypes.includes(String(eq.type))) {
                    return null;
                  }
                  const comp = computePinCompliance(eq);
                  const isSelected = activePinId === pin.id;

                  return (
                    <div
                      key={pin.id}
                      data-testid={`floor-pin-${pin.id}`}
                      data-status={comp.status}
                      data-xpct={pin.xPct}
                      data-ypct={pin.yPct}
                      style={{
                        left: `${pin.xPct}%`,
                        top: `${pin.yPct}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePinId(isSelected ? null : pin.id);
                        setPendingClickCoords(null);
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingPinId(pin.id);
                      }}
                      className="absolute z-20 group cursor-grab active:cursor-grabbing"
                    >
                      <div
                        style={{ backgroundColor: comp.colorHex }}
                        className={`w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-black transition-transform ${
                          isSelected ? 'scale-125 ring-4 ring-[#1C1917]/20' : 'hover:scale-110'
                        }`}
                        title={`${eq.qrCode || 'Asset'} — ${comp.label} (${pin.xPct}%, ${pin.yPct}%)`}
                      >
                        ●
                      </div>

                      {/* Pin Popover */}
                      {isSelected && (
                        <div
                          data-testid={`floor-pin-popover-${pin.id}`}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-56 bg-white border border-[#FED7AA] rounded-xl p-3 shadow-xl z-30 space-y-2 text-[11px] text-[#1C1917] cursor-default"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-[#C2410C]">
                              {eq.qrCode || 'Asset'}
                            </span>
                            <span
                              style={{ backgroundColor: comp.colorHex }}
                              className="px-2 py-0.5 rounded-full text-white text-[9px] font-extrabold uppercase"
                            >
                              {comp.label}
                            </span>
                          </div>
                          <div className="font-semibold text-[#1C1917]">
                            {eq.type || 'Extinguisher'} ({eq.capacity || 'Standard'})
                          </div>
                          <div className="text-[#44403C]">
                            Zone: {eq.location || activePlan.floorLabel}
                          </div>
                          <div className="text-[10px] font-mono text-[#44403C]">
                            Coords: {pin.xPct}%, {pin.yPct}%
                          </div>
                          <div className="pt-2 border-t border-[#FED7AA] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onViewAsset(eq);
                              }}
                              className="inline-flex items-center gap-1 text-[#C2410C] font-bold hover:underline cursor-pointer"
                            >
                              <span>View asset</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            {confirmDeletePinId === pin.id ? (
                              <button
                                type="button"
                                data-testid={`confirm-delete-pin-${pin.id}`}
                                onClick={() => handleDeletePin(pin.id)}
                                className="px-2 py-1 rounded bg-[#DC2626] text-white font-bold text-[10px]"
                              >
                                Confirm Delete
                              </button>
                            ) : (
                              <button
                                type="button"
                                data-testid={`delete-pin-${pin.id}`}
                                onClick={() => setConfirmDeletePinId(pin.id)}
                                className="inline-flex items-center gap-1 text-[#DC2626] font-bold hover:underline"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Pending Click-to-Place Asset Picker Popover */}
                {pendingClickCoords && (
                  <div
                    data-testid="place-pin-picker"
                    style={{
                      left: `${pendingClickCoords.xPct}%`,
                      top: `${pendingClickCoords.yPct}%`,
                      transform: 'translate(-50%, -100%)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute z-30 w-64 bg-white border-2 border-[#C2410C] rounded-xl p-3 shadow-2xl space-y-2.5 text-xs text-[#1C1917] cursor-default"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1C1917]">Bind Pin to Building Asset</span>
                      <button
                        type="button"
                        onClick={() => setPendingClickCoords(null)}
                        className="text-[#44403C] hover:text-[#1C1917]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <select
                      data-testid="place-pin-asset-select"
                      value={selectedAssetIdForPin}
                      onChange={(e) => setSelectedAssetIdForPin(e.target.value)}
                      className="w-full rounded-lg bg-[#FFF8F2] border border-[#FED7AA] p-2 text-[#1C1917] font-semibold"
                    >
                      {buildingEquipments.map((eq: any) => {
                        const c = computePinCompliance(eq);
                        return (
                          <option key={eq.id} value={eq.id}>
                            {eq.qrCode} — {eq.type} [{c.label}]
                          </option>
                        );
                      })}
                    </select>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPendingClickCoords(null)}
                        className="px-2.5 py-1 rounded-lg bg-[#FFF8F2] text-[#44403C] font-bold border border-[#FED7AA]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        data-testid="confirm-place-pin-btn"
                        onClick={handleConfirmPlacePin}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Place Pin</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
