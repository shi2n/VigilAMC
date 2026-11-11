'use client';

import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface StartupDirectoryBadgesProps {
  variant?: 'glass' | 'footer';
}

interface DirectoryItem {
  name: string;
  label: string;
  href: string;
  renderLogo: (sizeClass?: string) => React.ReactNode;
}

const DIRECTORIES: DirectoryItem[] = [
  {
    name: 'BetaList',
    label: 'Verified Startup',
    href: 'https://betalist.com',
    renderLogo: (sizeClass = 'w-7 h-7') => (
      /* Official BetaList 3-bar geometric mark from betalist.com */
      <span
        className={`${sizeClass} rounded-lg bg-[#111111] p-1.5 flex items-center justify-center shrink-0 shadow-sm`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" className="w-full h-full" fill="none">
          <rect x="0" y="1" width="12" height="4" rx="0.5" fill="#FFFFFF" />
          <rect x="0" y="8" width="20" height="4" rx="0.5" fill="#FFFFFF" />
          <rect x="0" y="15" width="20" height="4" rx="0.5" fill="#FFFFFF" />
        </svg>
      </span>
    ),
  },
  {
    name: 'Product Hunt',
    label: 'Featured Launch',
    href: 'https://www.producthunt.com',
    renderLogo: (sizeClass = 'w-7 h-7') => (
      /* Official Product Hunt #DA552F P mark */
      <span className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm`} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="#DA552F"
            d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0z"
          />
          <path
            fill="#FFFFFF"
            d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.801 0-.993-.805-1.799-1.801-1.799zm0 6h-3.405V18H7.801V6h5.804c2.319 0 4.2 1.88 4.2 4.199 0 2.321-1.881 4.201-4.201 4.201z"
          />
        </svg>
      </span>
    ),
  },
  {
    name: 'Indie Hackers',
    label: 'Verified Startup',
    href: 'https://www.indiehackers.com',
    renderLogo: (sizeClass = 'w-7 h-7') => (
      /* Official Indie Hackers #0E2439 IH mark */
      <span className={`${sizeClass} rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-sm`} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <rect width="24" height="24" rx="4" fill="#0E2439" />
          <path
            fill="#FFFFFF"
            d="M5.4 7.2v9.6h2.4V7.2H5.4Zm5.4 0v9.6h2.4v-3.6h3v3.6h2.4V7.2h-2.4v3.6h-3V7.2h-2.4Z"
          />
        </svg>
      </span>
    ),
  },
  {
    name: 'SideProjectors',
    label: 'Verified Project',
    href: 'https://www.sideprojectors.com',
    renderLogo: (sizeClass = 'w-7 h-7') => (
      /* Official SideProjectors lightning bolt logo from sideprojectors.com/img/logo.png */
      <span
        className={`${sizeClass} rounded-lg bg-[#1C1917] p-1 flex items-center justify-center shrink-0 shadow-sm`}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/badges/sideprojectors-logo.png"
          alt="SideProjectors official logo"
          width={24}
          height={24}
          className="w-full h-full object-contain"
        />
      </span>
    ),
  },
  {
    name: 'LaunchIgniter',
    label: 'Verified Startup',
    href: 'https://launchigniter.com/',
    renderLogo: (sizeClass = 'w-7 h-7') => (
      /* Official LaunchIgniter SVG from launchigniter.com/icon.svg */
      <span className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm`} aria-hidden="true">
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <circle cx="16" cy="16" r="16" fill="#f87315" />
          <path
            d="M12.5 18.5a2.5 2.5 0 002.5-2.5c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"
            fill="#ffffff"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    ),
  },
  {
    name: 'PeerPush',
    label: 'Verified Launch',
    href: 'https://peerpush.com/',
    renderLogo: (sizeClass = 'w-7 h-7') => (
      /* Official PeerPush SVG from peerpush.com/logo.svg */
      <span className={`${sizeClass} rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-sm`} aria-hidden="true">
        <svg viewBox="0 0 1072 1071" fill="none" className="w-full h-full">
          <path
            d="M214.37 0H856.97C975.27 0 1071.17 95.9 1071.17 214.2V856.8C1071.17 975.1 975.27 1071 856.97 1071H214.37C96.07 1071 0.170044 975.1 0.170044 856.8V214.2C0.170044 95.9 96.07 0 214.37 0Z"
            fill="#000000"
          />
          <path
            d="M718.48 342.94C710.72 339.91 702.74 337.38 694.49 335.46C675.07 253.81 601.55 192.89 514.07 192.89H234.27V432.9V563.75V806.57V878.1H305.8H371.83H443.36V806.57V701.31H651.62C753.85 701.31 837.05 618.12 837.05 515.88C837.06 437.2 787.81 369.8 718.48 342.94ZM305.81 264.43H514.07C559.74 264.43 599.25 291.5 617.4 330.46C624.17 345.04 627.96 361.27 627.96 378.33C627.96 386.42 627.14 394.34 625.48 401.99C614.59 453.49 568.75 492.23 514.06 492.23H443.35V401.99H602.81C604.9 394.45 605.95 386.47 605.95 378.33C605.95 360.83 601 344.38 592.47 330.46H371.83V492.23H305.8V432.92V264.43H305.81ZM651.63 629.78H443.36V585.76H371.83V637.87V701.31V806.57H305.8V563.75H371.83H443.36H514.07C605.08 563.75 681.01 497.83 696.58 411.22C703.68 414.3 710.45 418.04 716.72 422.5C746.21 443.08 765.53 477.25 765.53 515.87C765.53 578.72 714.41 629.78 651.63 629.78Z"
            fill="#FFFFFF"
          />
        </svg>
      </span>
    ),
  },
];

const MARQUEE_CSS = `
@keyframes vigilStartupMarquee {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
.vigil-startup-marquee-track {
  display: flex;
  width: max-content;
  animation: vigilStartupMarquee 28s linear infinite;
  will-change: transform;
}
.vigil-startup-marquee-track:hover {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .vigil-startup-marquee-track {
    animation: none !important;
    transform: none !important;
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;
  }
}
`;

export function StartupDirectoryBadges({ variant = 'glass' }: StartupDirectoryBadgesProps) {
  if (variant === 'footer') {
    return (
      <div
        data-testid="footer-startup-badges"
        className="pt-6 mt-6 border-t border-[#FED7AA]/40 flex flex-col gap-3 overflow-hidden"
      >
        <style dangerouslySetInnerHTML={{ __html: MARQUEE_CSS }} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Verified &amp; Featured Startup On</span>
          </div>
          <span className="text-[11px] text-[#57534E] font-medium">
            Official launch directory recognition
          </span>
        </div>

        <div className="relative overflow-hidden py-1.5">
          {/* Left & Right Subtle Edge Fade Masks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-[#FFF8F2] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-[#FFF8F2] to-transparent"
          />

          <div className="vigil-startup-marquee-track items-center gap-3">
            {[0, 1].map((loopIdx) => (
              <div
                key={loopIdx}
                aria-hidden={loopIdx === 1 ? 'true' : undefined}
                className="flex items-center gap-3 pr-3"
              >
                {/* Official Fazier Launch Badge */}
                <a
                  href="https://fazier.com/launches/vigilamc.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={loopIdx === 1 ? -1 : undefined}
                  className="inline-flex items-center rounded-xl bg-white px-2.5 py-1.5 shadow-sm border border-[#FED7AA]/60 hover:-translate-y-0.5 transition-transform shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
                    width={120}
                    alt="Fazier badge"
                    className="h-7 w-auto"
                  />
                </a>

                {DIRECTORIES.map((dir) => (
                  <a
                    key={`${dir.name}-${loopIdx}`}
                    href={dir.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={loopIdx === 1 ? -1 : undefined}
                    className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF4EC] border border-[#FED7AA]/60 shadow-sm transition-all hover:-translate-y-0.5 shrink-0"
                  >
                    {dir.renderLogo('w-6 h-6')}
                    <span className="flex flex-col leading-none">
                      <span className="text-[9px] uppercase tracking-wider text-[#C2410C] font-bold">
                        {dir.label}
                      </span>
                      <span className="text-xs font-bold text-[#1C1917] mt-0.5">{dir.name}</span>
                    </span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="verified-startup-badges-band"
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
      }}
      className="glass-panel border border-[#FED7AA] rounded-2xl p-6 sm:p-7 mb-10 sm:mb-12 shadow-[0_12px_36px_-12px_rgba(232,89,12,0.12)] overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: MARQUEE_CSS }} />

      <div className="text-center max-w-2xl mx-auto mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0E6] border border-[#FED7AA] text-[11px] font-bold uppercase tracking-wider text-[#C2410C] mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Verified Startup Directories</span>
        </div>
        <h3 className="font-display font-bold text-base sm:text-lg text-[#1C1917]">
          Verified Startup on BetaList, Fazier, Product Hunt, Indie Hackers, SideProjectors, LaunchIgniter &amp; PeerPush
        </h3>
      </div>

      {/* Moving Marquee Showcase with Official Logos */}
      <div className="relative overflow-hidden py-2 -mx-2 sm:-mx-4">
        {/* Left & Right Soft Fade Masks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-[#FFF9F5] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-[#FFF9F5] to-transparent"
        />

        <div
          data-testid="startup-badges-marquee-track"
          className="vigil-startup-marquee-track items-center gap-4"
        >
          {[0, 1].map((loopIdx) => (
            <div
              key={loopIdx}
              aria-hidden={loopIdx === 1 ? 'true' : undefined}
              className="flex items-center gap-4 pr-4"
            >
              {/* Official Fazier Launch Badge */}
              <a
                href="https://fazier.com/launches/vigilamc.com"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={loopIdx === 1 ? -1 : undefined}
                className="inline-flex items-center justify-center rounded-xl bg-white border border-[#FED7AA] px-3.5 py-2 shadow-sm hover:border-[#EA580C] hover:-translate-y-1 hover:shadow-md transition-all shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
                  width={120}
                  alt="Fazier badge"
                  className="h-9 w-auto"
                />
              </a>

              {DIRECTORIES.map((dir) => (
                <a
                  key={`${dir.name}-${loopIdx}`}
                  href={dir.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={loopIdx === 1 ? -1 : undefined}
                  className="group inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#FED7AA] shadow-sm hover:border-[#EA580C] hover:-translate-y-1 hover:shadow-md transition-all shrink-0"
                >
                  {dir.renderLogo('w-8 h-8')}
                  <span className="flex flex-col text-left leading-tight">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#C2410C] flex items-center gap-1">
                      {dir.label}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#EA580C]" />
                    </span>
                    <span className="text-sm font-bold text-[#1C1917]">{dir.name}</span>
                  </span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
