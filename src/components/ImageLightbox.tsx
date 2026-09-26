'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ShieldCheck, Download, Calendar } from 'lucide-react';

export interface LightboxImage {
  src: string;
  title: string;
  category: string;
  description: string;
  building: string;
  auditDate: string;
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

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Lightbox Container */}
      <div
        className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
          aria-label="Close image preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview Column */}
        <div className="relative md:w-3/5 bg-slate-950 flex items-center justify-center p-4 min-h-[320px] md:min-h-[500px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage.src}
            alt={currentImage.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80';
            }}
          />

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-[#0077B6] text-white transition-colors shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-[#0077B6] text-white transition-colors shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image counter indicator */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Metadata Details Column */}
        <div className="p-6 md:w-2/5 flex flex-col justify-between bg-white text-slate-800 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-ocean-50 text-[#0077B6] text-xs font-bold border border-ocean-200">
                {currentImage.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Audit Log
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#023E8A] tracking-tight">
              {currentImage.title}
            </h3>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Audited on: <strong>{currentImage.auditDate}</strong>
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="text-slate-600">
                Facility / Site: <strong className="text-slate-800">{currentImage.building}</strong>
              </p>
              <p className="text-slate-600">
                Compliance Standard: <strong className="text-slate-800">NFPA 10 &amp; NBC 2016 Part 4</strong>
              </p>
            </div>

            <div className="mt-4 text-sm text-slate-600 leading-relaxed">
              {currentImage.description}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              VigilAMC Digital Verification Engine
            </span>
            <button
              onClick={() => window.open(currentImage.src, '_blank')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0077B6] hover:text-[#023E8A] bg-ocean-50 hover:bg-ocean-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              Full Size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
