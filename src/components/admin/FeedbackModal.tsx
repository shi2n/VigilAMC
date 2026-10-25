'use client';
import { toast } from 'sonner';

import React, { useState } from 'react';
import { X, MessageSquare, Star, Send, CheckCircle2, Loader2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function FeedbackModal({ isOpen, onClose, userEmail }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [confusingText, setConfusingText] = useState('');
  const [missingFeatures, setMissingFeatures] = useState('');
  const [fairPrice, setFairPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          confusingText,
          missingFeatures,
          fairPrice,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setConfusingText('');
        setMissingFeatures('');
        setFairPrice('');
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback. Please try again.', { duration: 5500 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Close feedback modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your suggestions go directly to our product team to help make VigilAMC simple and fast for every agency in India.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FFF0E6] text-[#C2410C]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Give Feedback</h3>
                <p className="text-xs text-slate-500">
                  Help us make VigilAMC simpler for your daily operations.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                How easy is the dashboard to use?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What is confusing or hard to find?
              </label>
              <textarea
                rows={2}
                value={confusingText}
                onChange={(e) => setConfusingText(e.target.value)}
                placeholder="e.g. It was not clear how to assign a technician..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#C2410C] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                What feature or button is missing?
              </label>
              <textarea
                rows={2}
                value={missingFeatures}
                onChange={(e) => setMissingFeatures(e.target.value)}
                placeholder="e.g. A quick way to print customer AMC quotation..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#C2410C] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional: What monthly or yearly price feels fair for your agency?
              </label>
              <input
                type="text"
                value={fairPrice}
                onChange={(e) => setFairPrice(e.target.value)}
                placeholder="e.g. ₹999/month, ₹5,000/year, or Pay per building"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#C2410C] outline-none transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#C2410C] hover:bg-[#1C1917] rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
