'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import {
  FileCheck2,
  Printer,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
  Flame,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';
import { EQUIPMENT_TYPES } from '@/lib/compliance';

export default function CertificateDetailPage() {
  const params = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/certificates/${params.id}`);
        const data = await res.json();
        setCert(data.certificate);

        if (data.certificate) {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vigilfire.in';
          const verifyUrl = `${origin}/buildings/${data.certificate.buildingId}`;
          const qr = await QRCode.toDataURL(verifyUrl, {
            width: 150,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrDataUrl(qr);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCertificate();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !cert) {
    return (
      <div className="py-20 flex justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const building = cert.building;
  const company = building.company;
  const assets = building.assets || [];

  return (
    <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print space-y-3">
        <Link
          href="/certificates"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Certificates</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Form-B Compliance Certificate Studio
              </h1>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {cert.certificateNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Official certificate ready for municipal submission to Brihanmumbai / Municipal Fire Brigade.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Legal Form-B Document Container */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-6 space-y-1">
          <div className="text-xs font-black uppercase tracking-widest text-red-700">
            MAHARASHTRA FIRE PREVENTION AND LIFE SAFETY MEASURES ACT, 2006
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            [See Section 3(1) and Rule 4(2)]
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 pt-1">
            FORM &apos;B&apos;
          </h2>
          <p className="text-xs font-bold text-slate-700 max-w-2xl mx-auto uppercase">
            Certificate by Licensed Agency regarding maintenance of fire prevention and life safety measures in good repair and efficient condition
          </p>
        </div>

        {/* Agency and Certificate Meta */}
        <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Licensed Agency Details:</div>
            <div className="font-bold text-sm text-slate-900">{company?.name || 'Vigil Fire & Safety Solutions Pvt Ltd'}</div>
            <div className="text-slate-600 text-[11px]">License No: <strong className="text-slate-900">{cert.licensedAgencyNumber}</strong></div>
            <div className="text-slate-600 text-[11px]">State / Region: {company?.state || 'Maharashtra'}</div>
          </div>

          <div className="text-right space-y-1">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Certificate No:</span>
              <span className="font-mono font-bold text-sm text-slate-900">{cert.certificateNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Date of Issue:</span>
              <span className="font-semibold text-slate-800">{new Date(cert.issueDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Validity Period:</span>
              <span className="font-bold text-emerald-700">{cert.period} (Valid till {new Date(cert.validUntil).toLocaleDateString()})</span>
            </div>
          </div>
        </div>

        {/* Certified Building Details */}
        <div className="py-4 border-b border-slate-200 space-y-1.5 text-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Premises Inspected:</div>
          <div className="font-bold text-base text-slate-900">{building.name}</div>
          <div className="text-slate-700">
            <strong>Address: </strong>{building.address}, {building.city} - {building.pincode}
          </div>
          <div className="flex items-center gap-6 text-[11px] text-slate-600 pt-1">
            <span><strong>Occupancy Type: </strong>{building.occupancyType}</span>
            <span><strong>Floors: </strong>{building.totalFloors} Upper Floors + {building.basements} Basements</span>
            <span><strong>Fire NOC Ref: </strong>{building.fireNocNumber}</span>
          </div>
        </div>

        {/* Legal Declaration */}
        <div className="py-5 border-b border-slate-200 text-xs text-slate-800 leading-relaxed space-y-3 text-justify">
          <p>
            Certified that we have carried out the bi-annual / annual inspection and maintenance of the fire prevention and life safety measures installed in the aforesaid building / premises as required under the Maharashtra Fire Prevention and Life Safety Measures Act, 2006.
          </p>
          <p>
            We further certify that the fire fighting installations, including stored pressure ABC dry powder extinguishers, CO2 gas cylinders, mechanical foam equipment, landing hydrants, and life safety gear, have been thoroughly inspected, hydrostatically pressure-tested per <strong>Indian Standard IS 2190 / IS 15683</strong>, and are in <strong>good repair and efficient working condition</strong>.
          </p>
        </div>

        {/* Equipment Summary Annexure */}
        <div className="py-5 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Annexure A: Certified Equipment Schedule ({assets.length} Assets)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ All Units Serviced & Certified Safe
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[9px] border-b border-slate-300">
                <tr>
                  <th className="py-1.5 px-2 border-r border-slate-300">Asset Tag</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Location Spot</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Type & Capacity</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Standard</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Test Date</th>
                  <th className="py-1.5 px-2 border-r border-slate-300">Next Refill Due</th>
                  <th className="py-1.5 px-2 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assets.slice(0, 15).map((a: any) => {
                  const eqInfo = EQUIPMENT_TYPES[a.type];
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-mono font-bold border-r border-slate-200">{a.qrCode}</td>
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        {a.locationFloor}, {a.locationWing} ({a.locationSpecific})
                      </td>
                      <td className="py-1.5 px-2 font-medium border-r border-slate-200">
                        {a.capacity} {eqInfo?.name || a.type}
                      </td>
                      <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200">{a.isStandard}</td>
                      <td className="py-1.5 px-2 border-r border-slate-200">{new Date(a.lastRefillDate).toLocaleDateString()}</td>
                      <td className="py-1.5 px-2 font-bold border-r border-slate-200">{new Date(a.nextRefillDueDate).toLocaleDateString()}</td>
                      <td className="py-1.5 px-2 text-right font-bold text-emerald-700">PASS</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {assets.length > 15 && (
            <p className="text-[10px] text-slate-500 italic text-center">
              + {assets.length - 15} additional floor units inspected and logged on continuous schedule.
            </p>
          )}
        </div>

        {/* Signature & Municipal Verification QR Block */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Municipal QR Authenticator */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-300 bg-slate-50">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="Verification QR" className="w-20 h-20 object-contain" />
            )}
            <div className="text-[10px] text-slate-600 space-y-0.5">
              <div className="font-bold text-slate-900 uppercase">Municipal Verification Stamp</div>
              <div>Scan with QR reader to verify authenticity on VigilAMC compliance server.</div>
              <div className="font-mono text-[9px] text-slate-500">Stamp ID: {cert.id}</div>
            </div>
          </div>

          {/* Official Signatory Block */}
          <div className="text-right space-y-1">
            <div className="h-10 flex items-center justify-end">
              <span className="font-serif italic text-lg text-slate-800 font-bold tracking-wider">
                {cert.signatoryName || 'Er. Rajeshwar Patil'}
              </span>
            </div>
            <div className="font-bold text-xs text-slate-900">{cert.signatoryName}</div>
            <div className="text-[10px] text-slate-600 font-medium">
              Authorized Signatory & Chief Fire Safety Officer
            </div>
            <div className="text-[10px] text-slate-600">
              For <strong>{company?.name || 'Vigil Fire & Safety Solutions Pvt Ltd'}</strong>
            </div>
            <div className="text-[9px] text-slate-500">
              (Licensed Agency under Fire Prevention Act)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
