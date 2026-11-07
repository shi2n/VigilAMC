'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Flame,
  ShieldAlert,
  Building,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Info,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/lib/siteConfig';

type RiskLevel = 'low' | 'ordinary' | 'high';
type BuildingType =
  | 'office'
  | 'warehouse'
  | 'factory'
  | 'hospital'
  | 'school'
  | 'residential'
  | 'retail';

interface ExtinguisherTypeRecommendation {
  type: string;
  percentage: number;
  count: number;
  capacity: string;
  reason: string;
}

export default function ExtinguisherCalculatorPage() {
  const [area, setArea] = useState<number>(1000);
  const [floors, setFloors] = useState<number>(2);
  const [risk, setRisk] = useState<RiskLevel>('ordinary');
  const [buildingType, setBuildingType] = useState<BuildingType>('office');
  const [copied, setCopied] = useState(false);

  // Coverage heuristics as per IS 2190:2024 guidance:
  // Low risk: 1 unit per 300 m² (min 2 per floor)
  // Ordinary risk: 1 unit per 200 m² (min 2 per floor)
  // High risk: 1 unit per 100 m² (min 3 per floor)
  const coverageFactor = risk === 'low' ? 300 : risk === 'ordinary' ? 200 : 100;
  const minPerFloor = risk === 'high' ? 3 : 2;
  const calculatedByArea = Math.ceil(area / coverageFactor);
  const calculatedByFloors = floors * minPerFloor;
  const totalRecommended = Math.max(calculatedByArea, calculatedByFloors);

  // Type recommendations based on building type
  const getTypeBreakdown = (
    total: number,
    bType: BuildingType
  ): ExtinguisherTypeRecommendation[] => {
    switch (bType) {
      case 'office': {
        const co2 = Math.max(1, Math.round(total * 0.35));
        const abc = total - co2;
        return [
          {
            type: 'ABC Dry Powder (Mono Ammonium Phosphate 50%)',
            percentage: Math.round((abc / total) * 100),
            count: abc,
            capacity: '4kg / 6kg ISI (IS 15683)',
            reason: 'Multi-purpose protection for Class A combustibles (furniture, files) and general building spaces.',
          },
          {
            type: 'Carbon Dioxide (CO₂ Gas)',
            percentage: Math.round((co2 / total) * 100),
            count: co2,
            capacity: '4.5kg Wheel/Wall Type',
            reason: 'Clean agent residue-free protection for server rooms, electrical panels, UPS, and workstation hubs.',
          },
        ];
      }
      case 'warehouse': {
        const water = Math.max(1, Math.round(total * 0.25));
        const co2 = Math.max(1, Math.round(total * 0.15));
        const abc = Math.max(1, total - water - co2);
        return [
          {
            type: 'ABC Dry Powder',
            percentage: Math.round((abc / total) * 100),
            count: abc,
            capacity: '6kg / 9kg Heavy-Duty',
            reason: 'Primary high-hazard protection across storage racks, loading docks, and combustible cargo.',
          },
          {
            type: 'Water / Water Mist (Gas Cartridge)',
            percentage: Math.round((water / total) * 100),
            count: water,
            capacity: '9 Litres (IS 15683)',
            reason: 'Deep penetrating cooling agent for high-density wooden pallets, cardboard packing, and textiles.',
          },
          {
            type: 'CO₂ Gas Extinguisher',
            percentage: Math.round((co2 / total) * 100),
            count: co2,
            capacity: '4.5kg',
            reason: 'Dedicated protection near battery charging bays, electric forklifts, and distribution boards.',
          },
        ];
      }
      case 'factory': {
        const co2 = Math.max(1, Math.round(total * 0.3));
        const mechanicalFoam = Math.max(1, Math.round(total * 0.25));
        const abc = Math.max(1, total - co2 - mechanicalFoam);
        return [
          {
            type: 'ABC Powder Stored Pressure',
            percentage: Math.round((abc / total) * 100),
            count: abc,
            capacity: '6kg / 9kg',
            reason: 'General fabrication, assembly, and packaging zones.',
          },
          {
            type: 'Mechanical Foam (AFFF)',
            percentage: Math.round((mechanicalFoam / total) * 100),
            count: mechanicalFoam,
            capacity: '9 Litres / 50L Trolley',
            reason: 'Blanketing suppression for Class B hydrocarbon liquids, machine oils, paints, and lubricants.',
          },
          {
            type: 'Carbon Dioxide (CO₂)',
            percentage: Math.round((co2 / total) * 100),
            count: co2,
            capacity: '4.5kg',
            reason: 'Heavy machinery electrical control panels, CNC consoles, and transformer enclosures.',
          },
        ];
      }
      case 'hospital': {
        const co2 = Math.max(1, Math.round(total * 0.4));
        const abc = total - co2;
        return [
          {
            type: 'Clean Agent / ABC Dry Chemical',
            percentage: Math.round((abc / total) * 100),
            count: abc,
            capacity: '4kg / 6kg Clean Agent',
            reason: 'Corridors, wards, and non-critical patient care zones.',
          },
          {
            type: 'CO₂ (Anti-Magnetic / Medical Grade)',
            percentage: Math.round((co2 / total) * 100),
            count: co2,
            capacity: '4.5kg',
            reason: 'Non-conductive safe discharge for MRI/CT suites, ICU monitors, ventilators, and surgical consoles.',
          },
        ];
      }
      case 'residential': {
        const co2 = Math.max(1, Math.round(total * 0.25));
        const abc = total - co2;
        return [
          {
            type: 'ABC Multi-Purpose Powder',
            percentage: Math.round((abc / total) * 100),
            count: abc,
            capacity: '4kg / 6kg ISI Mark',
            reason: 'Lift lobbies, common stairwells, refuge areas, and clubhouse facilities.',
          },
          {
            type: 'CO₂ Gas Extinguisher',
            percentage: Math.round((co2 / total) * 100),
            count: co2,
            capacity: '4.5kg',
            reason: 'Basement electricity meter room, generator set enclosure, and lift machine room.',
          },
        ];
      }
      default: {
        const co2 = Math.max(1, Math.round(total * 0.3));
        const abc = total - co2;
        return [
          {
            type: 'ABC Dry Powder Extinguisher',
            percentage: Math.round((abc / total) * 100),
            count: abc,
            capacity: '6kg ISI Marked',
            reason: 'General Class A, B, and C hazard suppression.',
          },
          {
            type: 'CO₂ Gas Extinguisher',
            percentage: Math.round((co2 / total) * 100),
            count: co2,
            capacity: '4.5kg ISI Marked',
            reason: 'POS terminals, electrical mains, and air-conditioning plant rooms.',
          },
        ];
      }
    }
  };

  const breakdown = getTypeBreakdown(totalRecommended, buildingType);

  const shareableSummary = `
VigilAMC IS 2190 Fire Extinguisher Calculation Summary
------------------------------------------------------
Building Type: ${buildingType.toUpperCase()}
Total Built-up Area: ${area} m² (${floors} floor${floors > 1 ? 's' : ''})
Assessed Risk Level: ${risk.toUpperCase()} Hazard (Coverage: 1 unit per ${coverageFactor} m²)

Recommended Total Extinguishers: ${totalRecommended} Units
Formula: Max(Floors × MinUnits, Ceil(Area / CoverageFactor)) = Max(${floors} × ${minPerFloor}, Ceil(${area} / ${coverageFactor}))

Recommended Mix:
${breakdown.map((b) => `• ${b.count}× ${b.type} (${b.capacity}) — ${b.reason}`).join('\n')}

IS 2190 Travel Distance Guidance: Maximum 15 meters to the nearest unit.

Indicative estimate based on IS 2190 coverage guidance — not statutory advice.
Calculate live at: ${SITE_CONFIG.SITE_URL}/tools/extinguisher-calculator
`.trim();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(shareableSummary);
    setCopied(true);
    toast.success('Calculation summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] text-[#1C1917] flex flex-col selection:bg-orange-100 selection:text-orange-900">
      {/* Header Bar */}
      <header className="border-b border-[#F0E4D8] bg-white/80 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-tile-192.png"
              alt="VigilAMC Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-cover rounded-xl shadow-xs transition-transform group-hover:scale-105"
            />
            <div>
              <span className="font-bold text-base text-[#1C1917] tracking-tight block">VigilAMC</span>
              <span className="text-[10px] text-[#EA580C] font-bold uppercase tracking-wider block">
                Free Fire Tools
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="text-xs font-semibold text-[#44403C] hover:text-[#EA580C] hidden sm:inline-block"
            >
              Book a Demo
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-500/25 transition-colors"
            >
              Start Free Testing
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Intro */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 border border-orange-200 text-[#C2410C] text-xs font-bold rounded-full">
            <Calculator className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Bureau of Indian Standards · IS 2190:2024 (Fifth Revision)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
            Fire Extinguisher Requirement Calculator
          </h1>
          <p className="text-sm text-[#44403C] leading-relaxed">
            Estimate the mandatory quantity and specific types of portable fire extinguishers required for your commercial building, factory, society, or warehouse based on Indian Standard IS 2190 coverage principles.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#F0E4D8] shadow-sm space-y-5">
            <h2 className="text-base font-bold text-[#1C1917] flex items-center gap-2 border-b border-[#F0E4D8] pb-3">
              <Building className="w-4 h-4 text-[#EA580C]" />
              Facility Parameters
            </h2>

            {/* Built-up area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Total Built-Up Area (m²)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={area}
                  onChange={(e) => setArea(Math.max(10, parseInt(e.target.value) || 0))}
                  className="flex-1 p-3 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-sm font-semibold text-[#1C1917] focus:ring-2 focus:ring-[#EA580C] outline-none"
                />
                <span className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-[#44403C] flex items-center">
                  m² ({Math.round(area * 10.764)} sq ft)
                </span>
              </div>
            </div>

            {/* Floors count */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Number of Floors / Fire Compartments
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={floors}
                onChange={(e) => setFloors(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-sm font-semibold text-[#1C1917] focus:ring-2 focus:ring-[#EA580C] outline-none"
              />
              <p className="text-[11px] text-[#78716C]">
                IS 2190 requires a minimum of {minPerFloor} units per floor regardless of area.
              </p>
            </div>

            {/* Hazard / Risk Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Hazard / Risk Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'ordinary', 'high'] as RiskLevel[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRisk(r)}
                    className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                      risk === r
                        ? 'bg-[#EA580C] text-white border-[#EA580C] shadow-sm'
                        : 'bg-[#FFF8F2] text-[#44403C] border-[#E7D6C7] hover:bg-orange-50'
                    }`}
                  >
                    {r} Hazard
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#78716C]">
                Coverage allowance: <strong>1 extinguisher per {coverageFactor} m²</strong>.
              </p>
            </div>

            {/* Building Occupancy Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                Building Occupancy Type
              </label>
              <select
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value as BuildingType)}
                className="w-full p-3 bg-[#FFF8F2] border border-[#E7D6C7] rounded-xl text-xs font-semibold text-[#1C1917] focus:ring-2 focus:ring-[#EA580C] outline-none"
              >
                <option value="office">Commercial Office / IT ITES</option>
                <option value="warehouse">Storage Warehouse / Logistics Hub</option>
                <option value="factory">Industrial Manufacturing / Workshop</option>
                <option value="hospital">Hospital / Diagnostic Clinic</option>
                <option value="school">Educational Institution / School</option>
                <option value="residential">Residential Apartment Society</option>
                <option value="retail">Retail Mall / Departmental Store</option>
              </select>
            </div>
          </div>

          {/* Results Output Column */}
          <div className="lg:col-span-7 space-y-5">
            <div
              data-testid="calculator-output-card"
              className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F0E4D8] shadow-md space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E4D8] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C] block">
                    IS 2190 Coverage Recommendation
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-[#1C1917] tracking-tight">
                      {totalRecommended}
                    </span>
                    <span className="text-sm font-bold text-[#44403C]">Extinguishers Recommended</span>
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="copy-calculation-summary-btn"
                  onClick={handleCopySummary}
                  className="px-3.5 py-2 bg-[#FFF8F2] hover:bg-orange-100 border border-[#FED7AA] text-[#C2410C] text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* On-Page Heuristic Formula */}
              <div
                data-testid="calculator-formula-box"
                className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs space-y-1"
              >
                <span className="font-bold text-[#9A3412] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#EA580C]" /> On-Page Calculation Formula:
                </span>
                <p className="font-mono text-[#1C1917] text-[11px] pl-5">
                  Total = Math.max(Floors × MinUnits, Math.ceil(Area / CoverageFactor))
                  <br />= Math.max({floors} × {minPerFloor}, Math.ceil({area} / {coverageFactor})) = {totalRecommended} units
                </p>
                <p className="text-[11px] text-[#78716C] pl-5">
                  Travel distance requirement: Extinguishers must be located so that travel distance from any point is ≤ 15 meters.
                </p>
              </div>

              {/* Extinguisher Types Mix Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  Suggested Extinguisher Mix &amp; Placement Reasoning
                </h3>

                <div className="space-y-2.5">
                  {breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#FFF8F2] border border-[#E7D6C7] rounded-2xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#1C1917] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                          {item.type}
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#EA580C] text-white rounded-full text-xs font-bold">
                          {item.count} Units ({item.percentage}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-[#78716C] font-semibold">
                        Capacity: {item.capacity}
                      </div>
                      <p className="text-xs text-[#44403C] leading-snug">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Visible Disclaimer (F2) */}
              <div
                data-testid="calculator-disclaimer"
                className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-[#92400E] flex items-start gap-2.5"
              >
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-[#D97706] mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Disclaimer:</strong> Indicative estimate based on IS 2190 coverage guidance — not statutory advice. Consult a licensed fire-safety agency for site-specific requirements.
                </p>
              </div>

              {/* Action Buttons (F3) */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="flex-1 py-3 px-4 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/25 text-center flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Start Free Testing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="flex-1 py-3 px-4 bg-white hover:bg-orange-50 border border-[#FED7AA] text-[#1C1917] font-bold text-xs rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#EA580C]" />
                  <span>Book an Agency Demo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer link */}
      <footer className="mt-auto border-t border-[#F0E4D8] bg-white py-4 px-4 text-center text-xs text-[#78716C]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IS 2190 Code of Practice Selection, Installation and Maintenance of Portable First-Aid Fire Appliances</span>
          <Link href="/privacy" className="hover:text-[#EA580C] underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
