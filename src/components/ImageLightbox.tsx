'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ShieldCheck, CheckCircle2, MapPin, Gauge, Clock } from 'lucide-react';

export interface LightboxImage {
  id?: string;
  src?: string;
  title: string;
  category: string;
  description: string;
  building: string;
  auditDate: string;
  specs?: string;
  checks?: string[];
  reading?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Lightbox Container */}
      <div
        className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview Column */}
        <div className="relative md:w-3/5 bg-gradient-to-br from-[#061121] via-[#0A1A33] to-[#040C1A] text-white flex flex-col items-center justify-center p-6 sm:p-8 min-h-[300px]">
          {/* Visual UI Inspection Stamped Card */}
          <div className="w-full max-w-sm rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {current.category}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                {current.reading || 'VERIFIED'}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-base text-white">{current.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{current.building}</p>
            </div>

            {current.specs && (
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200">
                {current.specs}
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1 text-[11px] font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Inspection Standard:</span>
                <span className="text-slate-300">IS 2190 &bull; NBC Part 4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verification:</span>
                <span className="text-emerald-400">GPS &bull; Timestamp &bull; Photo</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-[#0077B6] text-white transition-colors shadow-lg cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-[#0077B6] text-white transition-colors shadow-lg cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full">
            {currentIndex + 1} of {images.length}
          </div>
        </div>

        {/* Details Column */}
        <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-[#0077B6] tracking-wider">
                {current.category}
              </span>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-1">
                {current.title}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {current.description}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-[#0077B6] shrink-0" />
                <span>{current.building}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-[#0077B6] shrink-0" />
                <span>{current.auditDate}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageLightbox;
