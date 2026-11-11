import React from 'react';

/**
 * Signature Fire-Safety City Skyline Strip
 * Handcrafted flat-vector silhouette representing a city protected by VigilAMC fire safety.
 *
 * Three depth layers:
 * - Back (#FF8C42, opacity 0.75): distant urban silhouette, communication mast, distant towers.
 * - Middle (#EA580C): low row-houses, Fire Station with bay doors & observation tower,
 *   3 residential society towers with balcony grids, modern office tower with external
 *   zigzag fire escape, industrial warehouse with clean chimney, school with bell-tower,
 *   and water tower with lattice structure.
 * - Front (#C2410C): ground line, friendly side-view fire truck, street lamps, trees,
 *   and fire hydrants.
 *
 * Single micro-animation: Fire-station observation tower beacon pulses with a 2.4s ease-in-out cycle.
 * Strictly disabled under prefers-reduced-motion.
 */
export function SkylineStrip({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full h-[140px] sm:h-[160px] md:h-[180px] overflow-hidden select-none pointer-events-none ${className}`}
    >
      <style>{`
        @keyframes fireStationBeaconPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .animate-beacon-pulse {
          transform-origin: 315px 44px;
          animation: fireStationBeaconPulse 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-beacon-pulse {
            animation: none !important;
            opacity: 0.9 !important;
            transform: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 1440 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
        className="w-full h-full block"
        role="img"
      >
        <defs>
          {/* Subtle depth gradients for layers */}
          <linearGradient id="backLayerGrad" x1="0" y1="50" x2="0" y2="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF8C42" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="midLayerGrad" x1="0" y1="20" x2="0" y2="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#D94E07" />
          </linearGradient>
          <linearGradient id="frontLayerGrad" x1="0" y1="120" x2="0" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
        </defs>

        {/* ══════════════════════════════════════════════════════
            LAYER 1: BACK LAYER (#FF8C42, opacity ~0.75)
            Distant cityscape blocks, backdrop towers, antennas
        ══════════════════════════════════════════════════════ */}
        <g fill="url(#backLayerGrad)">
          {/* Left distant low blocks */}
          <rect x="0" y="132" width="70" height="33" />
          <rect x="60" y="122" width="55" height="43" />
          <polygon points="60,122 87,108 115,122" />
          
          {/* Behind Fire Station: distant mid-rise buildings */}
          <rect x="155" y="92" width="50" height="73" />
          <rect x="195" y="80" width="42" height="85" />
          <rect x="230" y="98" width="55" height="67" />
          <rect x="270" y="88" width="38" height="77" />
          
          {/* Distant telecom mast */}
          <line x1="216" y1="58" x2="216" y2="80" stroke="#FF8C42" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="210" y1="64" x2="222" y2="64" stroke="#FF8C42" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="212" y1="70" x2="220" y2="70" stroke="#FF8C42" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Behind Residential Towers: High-rise silhouettes */}
          <rect x="360" y="70" width="55" height="95" />
          <polygon points="360,70 387,55 415,70" />
          <rect x="500" y="60" width="40" height="105" />
          <rect x="630" y="55" width="45" height="110" />
          <rect x="735" y="68" width="48" height="97" />

          {/* Behind Office Tower: angled skyline silhouettes */}
          <rect x="850" y="48" width="42" height="117" />
          <polygon points="850,48 892,60 892,165 850,165" />
          <rect x="915" y="75" width="45" height="90" />
          <rect x="950" y="65" width="40" height="100" />

          {/* Behind Warehouse & Industrial Area: distant chimneys and power grid */}
          <rect x="1065" y="85" width="52" height="80" />
          <rect x="1150" y="78" width="48" height="87" />
          <polygon points="1150,78 1174,62 1198,78" />

          {/* Right edge distant skyline & gentle hillside silhouette */}
          <rect x="1275" y="88" width="46" height="77" />
          <rect x="1360" y="70" width="50" height="95" />
          <rect x="1400" y="95" width="40" height="70" />
        </g>

        {/* ══════════════════════════════════════════════════════
            LAYER 2: MIDDLE LAYER (#EA580C)
            Main buildings: Fire station, Residential towers,
            Office tower with fire escape, Warehouse, School, Water tower
        ══════════════════════════════════════════════════════ */}
        <g fill="url(#midLayerGrad)">
          {/* 1. Low row-houses cluster (x: 20 to 125) */}
          <g id="row-houses">
            {/* House 1: pitched roof */}
            <rect x="22" y="128" width="44" height="37" />
            <polygon points="18,128 44,112 70,128" />
            <rect x="52" y="104" width="7" height="14" /> {/* Chimney */}
            {/* House 2: flat decorative roof */}
            <rect x="66" y="122" width="54" height="43" />
            <rect x="62" y="119" width="62" height="4" rx="1" />
            {/* Cutout windows on row-houses (in light footer bg tone) */}
            <rect x="30" y="136" width="10" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            <rect x="46" y="136" width="10" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            <rect x="76" y="128" width="12" height="14" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            <rect x="98" y="128" width="12" height="14" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            {/* Front door */}
            <rect x="88" y="148" width="10" height="17" rx="1" fill="#C2410C" />
          </g>

          {/* 2. FIRE STATION (Hero of the strip, x: 125 to 350) */}
          <g id="fire-station">
            {/* Main station garage block (x: 125 to 285) */}
            <rect x="125" y="106" width="160" height="59" />
            {/* Parapet cornice */}
            <rect x="120" y="102" width="170" height="5" rx="1" />
            <rect x="175" y="96" width="60" height="7" rx="1" /> {/* Center decorative pediment */}

            {/* Bay Doors (large roll-up doors with horizontal slat ribs) */}
            {/* Bay 1 (x: 140 to 198) */}
            <rect x="140" y="118" width="58" height="47" rx="3" fill="#FFF8F2" fillOpacity="0.9" />
            <rect x="144" y="122" width="50" height="43" rx="2" fill="#C2410C" />
            {/* Horizontal shutter slats */}
            <line x1="144" y1="130" x2="194" y2="130" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="144" y1="138" x2="194" y2="138" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="144" y1="146" x2="194" y2="146" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="144" y1="154" x2="194" y2="154" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            {/* Glass transom window strip above bay 1 */}
            <rect x="148" y="124" width="42" height="4" rx="1" fill="#FEF08A" fillOpacity="0.8" />

            {/* Bay 2 (x: 212 to 270) */}
            <rect x="212" y="118" width="58" height="47" rx="3" fill="#FFF8F2" fillOpacity="0.9" />
            <rect x="216" y="122" width="50" height="43" rx="2" fill="#C2410C" />
            <line x1="216" y1="130" x2="266" y2="130" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="216" y1="138" x2="266" y2="138" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="216" y1="146" x2="266" y2="146" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            <line x1="216" y1="154" x2="266" y2="154" stroke="#FFF8F2" strokeWidth="1.5" strokeOpacity="0.5" />
            <rect x="220" y="124" width="42" height="4" rx="1" fill="#FEF08A" fillOpacity="0.8" />

            {/* Upper station windows */}
            <rect x="150" y="110" width="38" height="4" rx="1" fill="#FFF8F2" fillOpacity="0.75" />
            <rect x="222" y="110" width="38" height="4" rx="1" fill="#FFF8F2" fillOpacity="0.75" />

            {/* Hose / Observation Tower (hero height x: 285 to 345, y: 52 to 165) */}
            {/* Tower shaft */}
            <rect x="294" y="80" width="42" height="85" />
            {/* Intermediate stringer / ladder slits */}
            <rect x="312" y="92" width="6" height="14" rx="1" fill="#FFF8F2" fillOpacity="0.8" />
            <rect x="312" y="116" width="6" height="14" rx="1" fill="#FFF8F2" fillOpacity="0.8" />
            <rect x="312" y="140" width="6" height="14" rx="1" fill="#FFF8F2" fillOpacity="0.8" />

            {/* Flared Observation Deck (x: 285 to 345, y: 62 to 80) */}
            <polygon points="294,80 285,68 345,68 336,80" />
            <rect x="282" y="66" width="66" height="4" rx="1" fill="#C2410C" />
            {/* Observation glass window band */}
            <rect x="288" y="70" width="54" height="7" rx="1" fill="#FEF08A" fillOpacity="0.9" />
            {/* Window divider mullions */}
            <line x1="298" y1="70" x2="298" y2="77" stroke="#EA580C" strokeWidth="1.5" />
            <line x1="308" y1="70" x2="308" y2="77" stroke="#EA580C" strokeWidth="1.5" />
            <line x1="318" y1="70" x2="318" y2="77" stroke="#EA580C" strokeWidth="1.5" />
            <line x1="328" y1="70" x2="328" y2="77" stroke="#EA580C" strokeWidth="1.5" />

            {/* Tower Pyramid Roof / Cap */}
            <polygon points="280,66 315,50 350,66" />
            
            {/* Beacon pedestal */}
            <rect x="311" y="46" width="8" height="5" rx="1" fill="#C2410C" />

            {/* AMBER BEACON PULSE (Hero Micro-Animation) */}
            <g className="animate-beacon-pulse">
              {/* Outer pulsing glow aura */}
              <circle cx="315" cy="44" r="10" fill="#F59E0B" fillOpacity="0.3" />
              <circle cx="315" cy="44" r="6" fill="#FBBF24" fillOpacity="0.6" />
              {/* Beacon core bulb */}
              <circle cx="315" cy="44" r="3.5" fill="#FFF" />
              {/* Radiating beacon beams */}
              <line x1="315" y1="32" x2="315" y2="37" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
              <line x1="324" y1="36" x2="320" y2="39" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="306" y1="36" x2="310" y2="39" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="327" y1="44" x2="322" y2="44" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="303" y1="44" x2="308" y2="44" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          </g>

          {/* 3. THREE RESIDENTIAL SOCIETY TOWERS (x: 410 to 760) — VigilAMC's Core Client! */}
          <g id="residential-society-towers">
            {/* Residential Tower 1 (x: 410 to 510, y: 46 to 165) */}
            <g>
              <rect x="412" y="48" width="96" height="117" rx="1" />
              <rect x="408" y="44" width="104" height="4" rx="1" />
              {/* Lift room & rooftop water tank */}
              <rect x="438" y="34" width="44" height="10" rx="1" />
              {/* Balcony Grids (5 tiers) */}
              {[60, 80, 100, 120, 140].map((yTier) => (
                <g key={`t1-${yTier}`}>
                  {/* Left balcony slab & railing */}
                  <rect x="418" y={yTier} width="38" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.9" />
                  <rect x="419" y={yTier + 1} width="36" height="4" fill="#C2410C" />
                  <line x1="424" y1={yTier + 5} x2="424" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="431" y1={yTier + 5} x2="431" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="438" y1={yTier + 5} x2="438" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="445" y1={yTier + 5} x2="445" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <rect x="424" y={yTier - 6} width="26" height="6" rx="0.5" fill="#FEF08A" fillOpacity="0.8" />

                  {/* Right balcony slab & railing */}
                  <rect x="464" y={yTier} width="38" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.9" />
                  <rect x="465" y={yTier + 1} width="36" height="4" fill="#C2410C" />
                  <line x1="470" y1={yTier + 5} x2="470" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="477" y1={yTier + 5} x2="477" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="484" y1={yTier + 5} x2="484" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="491" y1={yTier + 5} x2="491" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <rect x="470" y={yTier - 6} width="26" height="6" rx="0.5" fill="#FEF08A" fillOpacity="0.8" />
                </g>
              ))}
              {/* Society ground entrance */}
              <rect x="446" y="152" width="28" height="13" rx="1" fill="#C2410C" />
            </g>

            {/* Residential Tower 2 (Tallest Central Society Tower, x: 525 to 645, y: 22 to 165) */}
            <g>
              <rect x="528" y="24" width="114" height="141" rx="1" />
              {/* Stepped Architectural Crown */}
              <rect x="555" y="14" width="60" height="10" rx="1" />
              <rect x="572" y="8" width="26" height="6" rx="1" fill="#C2410C" />
              <rect x="522" y="22" width="126" height="4" rx="1" />
              {/* Central vertical divider mullions */}
              <rect x="582" y="26" width="6" height="139" fill="#C2410C" />

              {/* 6 Balcony tiers with continuous railing bands */}
              {[38, 58, 78, 98, 118, 138].map((yTier) => (
                <g key={`t2-${yTier}`}>
                  {/* Left Balcony */}
                  <rect x="534" y={yTier} width="44" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.9" />
                  <rect x="535" y={yTier + 1} width="42" height="3" fill="#C2410C" />
                  <line x1="540" y1={yTier + 4} x2="540" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="548" y1={yTier + 4} x2="548" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="556" y1={yTier + 4} x2="556" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="564" y1={yTier + 4} x2="564" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <rect x="538" y={yTier - 5} width="36" height="5" rx="0.5" fill="#FEF08A" fillOpacity="0.8" />

                  {/* Right Balcony */}
                  <rect x="592" y={yTier} width="44" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.9" />
                  <rect x="593" y={yTier + 1} width="42" height="3" fill="#C2410C" />
                  <line x1="598" y1={yTier + 4} x2="598" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="606" y1={yTier + 4} x2="606" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="614" y1={yTier + 4} x2="614" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="622" y1={yTier + 4} x2="622" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <rect x="596" y={yTier - 5} width="36" height="5" rx="0.5" fill="#FEF08A" fillOpacity="0.8" />
                </g>
              ))}
              {/* Grand Society Entrance Lobby */}
              <rect x="568" y="150" width="34" height="15" rx="2" fill="#C2410C" />
              <rect x="573" y="153" width="24" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.9" />
            </g>

            {/* Residential Tower 3 (x: 655 to 755, y: 52 to 165) */}
            <g>
              <rect x="660" y="52" width="94" height="113" rx="1" />
              <rect x="656" y="48" width="102" height="4" rx="1" />
              <rect x="690" y="38" width="34" height="10" rx="1" fill="#C2410C" />
              {/* Antenna / lightning arrestor */}
              <line x1="707" y1="26" x2="707" y2="38" stroke="#EA580C" strokeWidth="2" />
              {/* Balconies (5 tiers) */}
              {[64, 84, 104, 124, 144].map((yTier) => (
                <g key={`t3-${yTier}`}>
                  <rect x="668" y={yTier} width="78" height="12" rx="1" fill="#FFF8F2" fillOpacity="0.9" />
                  <rect x="670" y={yTier + 1} width="74" height="3" fill="#C2410C" />
                  <line x1="678" y1={yTier + 4} x2="678" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="688" y1={yTier + 4} x2="688" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="698" y1={yTier + 4} x2="698" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="708" y1={yTier + 4} x2="708" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="718" y1={yTier + 4} x2="718" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <line x1="728" y1={yTier + 4} x2="728" y2={yTier + 12} stroke="#C2410C" strokeWidth="1" />
                  <rect x="676" y={yTier - 6} width="62" height="6" rx="0.5" fill="#FEF08A" fillOpacity="0.8" />
                </g>
              ))}
            </g>
          </g>

          {/* 4. MODERN OFFICE TOWER WITH EXTERNAL ZIG-ZAG FIRE ESCAPE (x: 775 to 925) */}
          <g id="office-tower-with-fire-escape">
            {/* Slanted modern roofline: from (775, 30) down to (875, 52) */}
            <polygon points="775,30 875,52 875,165 775,165" />
            <polygon points="772,28 878,51 876,55 770,32" fill="#C2410C" />

            {/* Vertical glass facade stripes */}
            {[788, 804, 820, 836, 852].map((xStripe) => (
              <rect
                key={`mullion-${xStripe}`}
                x={xStripe}
                y="58"
                width="8"
                height="102"
                fill="#FEF08A"
                fillOpacity="0.8"
              />
            ))}

            {/* EXTERNAL ZIG-ZAG FIRE ESCAPE STAIRCASE (Distinctive Fire Safety Element, x: 875 to 920) */}
            {/* Structural vertical steel columns */}
            <rect x="878" y="55" width="3" height="110" fill="#C2410C" />
            <rect x="918" y="55" width="3" height="110" fill="#C2410C" />

            {/* Landings & Zig-Zag Diagonal Stair Flights */}
            {/* Landing 1 (y: 65) */}
            <rect x="876" y="65" width="46" height="3" fill="#C2410C" />
            <line x1="878" y1="65" x2="918" y2="85" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
            {/* Landing 2 (y: 85) */}
            <rect x="876" y="85" width="46" height="3" fill="#C2410C" />
            <line x1="918" y1="85" x2="878" y2="105" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
            {/* Landing 3 (y: 105) */}
            <rect x="876" y="105" width="46" height="3" fill="#C2410C" />
            <line x1="878" y1="105" x2="918" y2="125" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
            {/* Landing 4 (y: 125) */}
            <rect x="876" y="125" width="46" height="3" fill="#C2410C" />
            <line x1="918" y1="125" x2="878" y2="145" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
            {/* Landing 5 (y: 145) & Ground Drop Stair (y: 145 to 165) */}
            <rect x="876" y="145" width="46" height="3" fill="#C2410C" />
            <line x1="878" y1="145" x2="912" y2="165" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />

            {/* Fire exit doors on each floor opening to fire escape */}
            {[60, 80, 100, 120, 140].map((yDoor) => (
              <rect key={`exit-${yDoor}`} x="868" y={yDoor} width="7" height="12" rx="0.5" fill="#FFF8F2" fillOpacity="0.9" />
            ))}
          </g>

          {/* 5. INDUSTRIAL WAREHOUSE + CHIMNEY (Clean air - NO smoke! x: 980 to 1180) */}
          <g id="industrial-warehouse">
            {/* Tall Chimney (x: 992 to 1018, y: 55 to 165, tapering gently) */}
            <polygon points="996,56 1014,56 1018,165 992,165" />
            {/* Chimney top rim band */}
            <rect x="993" y="52" width="24" height="4" rx="1" fill="#C2410C" />
            {/* Clean air: NO smoke paths! */}

            {/* Warehouse 3-Sawtooth Roof Structure (x: 1025 to 1175, y: 110 to 165) */}
            <polygon points="
              1025,165 1025,124 1070,110 1070,124 1115,110 1115,124 1160,110 1175,124 1175,165
            " />
            {/* Clerestory glass window rows on vertical sawtooth facets */}
            <rect x="1066" y="112" width="4" height="12" fill="#FEF08A" fillOpacity="0.8" />
            <rect x="1111" y="112" width="4" height="12" fill="#FEF08A" fillOpacity="0.8" />
            <rect x="1156" y="112" width="4" height="12" fill="#FEF08A" fillOpacity="0.8" />

            {/* Warehouse large cargo roll-up loading bay door */}
            <rect x="1038" y="132" width="54" height="33" rx="2" fill="#C2410C" />
            <rect x="1042" y="136" width="46" height="29" fill="#FFF8F2" fillOpacity="0.85" />
            <line x1="1042" y1="144" x2="1088" y2="144" stroke="#C2410C" strokeWidth="1" />
            <line x1="1042" y1="152" x2="1088" y2="152" stroke="#C2410C" strokeWidth="1" />
            <line x1="1042" y1="160" x2="1088" y2="160" stroke="#C2410C" strokeWidth="1" />

            {/* Square ventilation windows */}
            <rect x="1108" y="136" width="14" height="10" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            <rect x="1132" y="136" width="14" height="10" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
          </g>

          {/* 6. ELEVATED WATER TOWER (Fire-water reserve, x: 1205 to 1285, y: 52 to 165) */}
          <g id="water-tower">
            {/* Water Tank Reservoir (y: 52 to 90) */}
            <polygon points="1215,62 1245,46 1275,62" /> {/* Conical roof */}
            <rect x="1212" y="62" width="66" height="26" rx="2" /> {/* Tank cylinder */}
            <rect x="1208" y="86" width="74" height="5" rx="1" fill="#C2410C" /> {/* Tank bottom ring */}
            <circle cx="1245" cy="74" r="5" fill="#FFF8F2" fillOpacity="0.85" /> {/* Gauge indicator */}

            {/* Open Steel Lattice Legs & Cross-Bracing Structure */}
            {/* 4 Angled legs */}
            <line x1="1218" y1="90" x2="1206" y2="165" stroke="#C2410C" strokeWidth="3" />
            <line x1="1232" y1="90" x2="1226" y2="165" stroke="#C2410C" strokeWidth="2.5" />
            <line x1="1258" y1="90" x2="1264" y2="165" stroke="#C2410C" strokeWidth="2.5" />
            <line x1="1272" y1="90" x2="1284" y2="165" stroke="#C2410C" strokeWidth="3" />
            {/* Central standpipe (water supply pipe) */}
            <rect x="1242" y="90" width="6" height="75" fill="#EA580C" />

            {/* Horizontal lattice beams */}
            <line x1="1214" y1="115" x2="1276" y2="115" stroke="#C2410C" strokeWidth="2" />
            <line x1="1210" y1="140" x2="1280" y2="140" stroke="#C2410C" strokeWidth="2" />

            {/* X-Cross bracing */}
            <line x1="1218" y1="90" x2="1276" y2="115" stroke="#C2410C" strokeWidth="1.2" strokeOpacity="0.85" />
            <line x1="1272" y1="90" x2="1214" y2="115" stroke="#C2410C" strokeWidth="1.2" strokeOpacity="0.85" />
            <line x1="1214" y1="115" x2="1280" y2="140" stroke="#C2410C" strokeWidth="1.2" strokeOpacity="0.85" />
            <line x1="1276" y1="115" x2="1210" y2="140" stroke="#C2410C" strokeWidth="1.2" strokeOpacity="0.85" />
            <line x1="1210" y1="140" x2="1284" y2="165" stroke="#C2410C" strokeWidth="1.2" strokeOpacity="0.85" />
            <line x1="1280" y1="140" x2="1206" y2="165" stroke="#C2410C" strokeWidth="1.2" strokeOpacity="0.85" />

            {/* Concrete foundation footings */}
            <rect x="1202" y="161" width="8" height="4" rx="0.5" fill="#9A3412" />
            <rect x="1280" y="161" width="8" height="4" rx="0.5" fill="#9A3412" />
          </g>

          {/* 7. SCHOOL BLOCK WITH BELL-TOWER / CUPOLA (x: 1300 to 1420) */}
          <g id="school-block">
            {/* School Main Building */}
            <rect x="1312" y="108" width="108" height="57" rx="1" />
            <rect x="1308" y="104" width="116" height="4" rx="1" fill="#C2410C" />
            {/* Arched windows */}
            {[1320, 1338, 1380, 1398].map((xWin) => (
              <g key={`sch-win-${xWin}`}>
                <rect x={xWin} y="118" width="12" height="16" rx="2" fill="#FEF08A" fillOpacity="0.85" />
                <path d={`M${xWin},124 A6,6 0 0,1 ${xWin + 12},124 Z`} fill="#EA580C" />
              </g>
            ))}
            {/* School Entrance */}
            <rect x="1352" y="146" width="24" height="19" rx="1" fill="#C2410C" />
            <rect x="1356" y="150" width="16" height="15" rx="1" fill="#FFF8F2" fillOpacity="0.9" />

            {/* Central Bell-Tower / Cupola (x: 1350 to 1378, y: 72 to 104) */}
            <rect x="1352" y="86" width="24" height="18" fill="#EA580C" />
            <polygon points="1348,86 1364,72 1380,86" fill="#C2410C" />
            {/* Bell arch aperture & bell silhouette */}
            <rect x="1358" y="90" width="12" height="12" rx="4" fill="#FFF8F2" fillOpacity="0.9" />
            {/* Bell shape */}
            <path d="M1362,96 C1362,93 1366,93 1366,96 L1368,100 L1360,100 Z" fill="#C2410C" />
          </g>
        </g>

        {/* ══════════════════════════════════════════════════════
            LAYER 3: FRONT LAYER (#C2410C)
            Ground line, friendly fire truck silhouette, street lamps,
            hydrants, and trees
        ══════════════════════════════════════════════════════ */}
        <g fill="url(#frontLayerGrad)">
          {/* Continuous Ground Line Base across bottom */}
          <rect x="0" y="165" width="1440" height="15" />
          <line x1="0" y1="165" x2="1440" y2="165" stroke="#9A3412" strokeWidth="1" />

          {/* FRIENDLY SIDE-VIEW FIRE TRUCK (x: 785 to 945, y: 132 to 165) */}
          <g id="fire-truck">
            {/* Main Truck Body & Cab (x: 792 to 940) */}
            {/* Rear Equipment Body */}
            <rect x="838" y="132" width="102" height="26" rx="2" fill="#C2410C" />
            {/* Front Driver Cab */}
            <path d="M802,138 L814,132 L838,132 L838,158 L794,158 L794,146 Z" fill="#C2410C" />
            <rect x="792" y="152" width="6" height="6" rx="1" fill="#9A3412" /> {/* Front bumper */}

            {/* Cab Windshield & Side Window */}
            <polygon points="804,139 815,134 825,134 825,144 802,144" fill="#FEF08A" fillOpacity="0.9" />
            <rect x="828" y="134" width="8" height="10" rx="1" fill="#FEF08A" fillOpacity="0.9" />

            {/* Red / Amber Emergency Siren Lightbar on Cab Roof */}
            <rect x="814" y="128" width="12" height="4" rx="1.5" fill="#EF4444" />
            <circle cx="817" cy="130" r="1.5" fill="#FEF08A" />
            <circle cx="823" cy="130" r="1.5" fill="#38BDF8" />

            {/* Equipment Body Shutter Compartments (3 roll-up bays) */}
            <rect x="842" y="135" width="28" height="21" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            <line x1="842" y1="140" x2="870" y2="140" stroke="#C2410C" strokeWidth="1" />
            <line x1="842" y1="145" x2="870" y2="145" stroke="#C2410C" strokeWidth="1" />
            <line x1="842" y1="150" x2="870" y2="150" stroke="#C2410C" strokeWidth="1" />

            <rect x="874" y="135" width="28" height="21" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            <line x1="874" y1="140" x2="902" y2="140" stroke="#C2410C" strokeWidth="1" />
            <line x1="874" y1="145" x2="902" y2="145" stroke="#C2410C" strokeWidth="1" />
            <line x1="874" y1="150" x2="902" y2="150" stroke="#C2410C" strokeWidth="1" />

            <rect x="906" y="135" width="30" height="21" rx="1" fill="#FFF8F2" fillOpacity="0.85" />
            <line x1="906" y1="140" x2="936" y2="140" stroke="#C2410C" strokeWidth="1" />
            <line x1="906" y1="145" x2="936" y2="145" stroke="#C2410C" strokeWidth="1" />
            <line x1="906" y1="150" x2="936" y2="150" stroke="#C2410C" strokeWidth="1" />

            {/* Overhead Mounted Extension Ladder */}
            <rect x="844" y="127" width="88" height="4" rx="1" fill="#9A3412" />
            <line x1="844" y1="127" x2="932" y2="127" stroke="#FFF8F2" strokeWidth="1" strokeOpacity="0.9" />
            <line x1="844" y1="131" x2="932" y2="131" stroke="#FFF8F2" strokeWidth="1" strokeOpacity="0.9" />
            {[852, 862, 872, 882, 892, 902, 912, 922].map((xRung) => (
              <line key={`ladder-rung-${xRung}`} x1={xRung} y1="127" x2={xRung} y2="131" stroke="#FFF8F2" strokeWidth="1" />
            ))}

            {/* Fire Truck Wheels with Wheel Wells and Rims */}
            {/* Front Wheel (x: 814) */}
            <circle cx="814" cy="158" r="9" fill="#1C1917" />
            <circle cx="814" cy="158" r="5" fill="#FFF8F2" />
            <circle cx="814" cy="158" r="2.5" fill="#EA580C" />

            {/* Rear Tandem Wheels (x: 894 & 920) */}
            <circle cx="894" cy="158" r="9" fill="#1C1917" />
            <circle cx="894" cy="158" r="5" fill="#FFF8F2" />
            <circle cx="894" cy="158" r="2.5" fill="#EA580C" />

            <circle cx="920" cy="158" r="9" fill="#1C1917" />
            <circle cx="920" cy="158" r="5" fill="#FFF8F2" />
            <circle cx="920" cy="158" r="2.5" fill="#EA580C" />
          </g>

          {/* PUNCTUATION: FIRE HYDRANTS (Detailed side-ports, 5-sided nut cap, base flange) */}
          {[
            { x: 108, key: 'hydrant-1' },
            { x: 388, key: 'hydrant-2' },
            { x: 766, key: 'hydrant-3' },
            { x: 1294, key: 'hydrant-4' },
          ].map(({ x, key }) => (
            <g key={key} id={key}>
              {/* Flange base */}
              <rect x={x - 6} y="162" width="12" height="3" rx="0.5" fill="#9A3412" />
              {/* Barrel column */}
              <rect x={x - 4} y="151" width="8" height="11" rx="1" fill="#C2410C" />
              {/* Bonnet top dome */}
              <path d={`M${x - 4},151 A4,4 0 0,1 ${x + 4},151 Z`} fill="#C2410C" />
              {/* Operating nut on top */}
              <rect x={x - 2} y="145" width="4" height="3" rx="0.5" fill="#FEF08A" />
              {/* Side nozzle outlets */}
              <rect x={x - 7} y="153" width="3" height="4" rx="0.5" fill="#FEF08A" />
              <rect x={x + 4} y="153" width="3" height="4" rx="0.5" fill="#FEF08A" />
            </g>
          ))}

          {/* PUNCTUATION: STREET LAMPS (Curved posts with lantern globes) */}
          {[
            { x: 366, key: 'lamp-1' },
            { x: 518, key: 'lamp-2' },
            { x: 650, key: 'lamp-3' },
            { x: 965, key: 'lamp-4' },
            { x: 1192, key: 'lamp-5' },
            { x: 1422, key: 'lamp-6' },
          ].map(({ x, key }) => (
            <g key={key} id={key}>
              <rect x={x - 1} y="130" width="2" height="35" fill="#C2410C" />
              <rect x={x - 3} y="162" width="6" height="3" rx="1" fill="#9A3412" />
              <path d={`M${x},130 Q${x - 5},124 ${x - 8},128`} fill="none" stroke="#C2410C" strokeWidth="1.5" />
              <circle cx={x - 8} cy="130" r="2.5" fill="#FEF08A" fillOpacity="0.95" />
              <path d={`M${x},130 Q${x + 5},124 ${x + 8},128`} fill="none" stroke="#C2410C" strokeWidth="1.5" />
              <circle cx={x + 8} cy="130" r="2.5" fill="#FEF08A" fillOpacity="0.95" />
            </g>
          ))}

          {/* PUNCTUATION: ROUND URBAN TREES & SHRUBS */}
          {[
            { x: 12, r: 8, key: 'tree-1' },
            { x: 118, r: 7, key: 'tree-2' },
            { x: 378, r: 6.5, key: 'tree-3' },
            { x: 754, r: 7.5, key: 'tree-4' },
            { x: 978, r: 8, key: 'tree-5' },
            { x: 1298, r: 7, key: 'tree-6' },
            { x: 1432, r: 8.5, key: 'tree-7' },
          ].map(({ x, r, key }) => (
            <g key={key} id={key}>
              <rect x={x - 1.5} y={165 - r * 1.4} width="3" height={r * 1.4} fill="#9A3412" />
              <circle cx={x} cy={165 - r * 1.5} r={r} fill="#C2410C" />
              <circle cx={x - r * 0.3} cy={165 - r * 1.7} r={r * 0.5} fill="#EA580C" fillOpacity="0.8" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
