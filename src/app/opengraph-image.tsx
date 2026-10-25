import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VigilAMC - Fire Safety AMC & Compliance Software India';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 70px',
          backgroundColor: '#FFFFFF',
          backgroundImage:
            'radial-gradient(circle at 80% 35%, rgba(234, 88, 12, 0.14) 0%, rgba(255, 140, 66, 0.06) 45%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #FFF8F2 100%)',
          color: '#1C1917',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar with pill and branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: '#FFF4EC',
              border: '1px solid #FED7AA',
              color: '#C2410C',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span>FIRE SAFETY AMC &amp; COMPLIANCE SOFTWARE - INDIA</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#C2410C',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <span>vigilamc.com</span>
          </div>
        </div>

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '58px',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#1C1917',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Never Miss a Fire Compliance</span>
            <span style={{ color: '#EA580C' }}>Deadline Again</span>
          </div>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 500,
              lineHeight: 1.4,
              color: '#44403C',
              maxWidth: '960px',
            }}
          >
            Live GPS Proof &bull; Photo Evidence &bull; Client Signatures &bull; Compliance Reports in 1 Tap
          </div>
        </div>

        {/* Bottom brand bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px solid #FED7AA',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '9999px',
                backgroundImage: 'linear-gradient(135deg, #FF8C42 0%, #EA580C 55%, #C2410C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 900,
                color: '#FFFFFF',
              }}
            >
              V
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#1C1917' }}>VigilAMC</span>
              <span style={{ fontSize: '14px', color: '#44403C' }}>
                Fire safety AMC software - tracked, proven, reported.
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#FAFAF9',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#1C1917',
                border: '1px solid #C2410C',
                color: '#FAFAF9',
              }}
            >
              <span>190 Hrs &amp; Rs.96,000 Saved / Year</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
