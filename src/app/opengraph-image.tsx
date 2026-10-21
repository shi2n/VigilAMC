import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VigilAMC — Fire Safety AMC & Compliance Software India';
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
          backgroundColor: '#0A2540',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), linear-gradient(135deg, #0A2540 0%, #0F172A 100%)',
          backgroundSize: '40px 40px, 100% 100%',
          color: '#ffffff',
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
              backgroundColor: 'rgba(0, 119, 182, 0.25)',
              border: '1px solid rgba(0, 180, 216, 0.4)',
              color: '#90E0EF',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span>FIRE SAFETY AMC &amp; COMPLIANCE SOFTWARE • INDIA</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#38BDF8',
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
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Never Miss a Compliance</span>
            <span style={{ color: '#38BDF8' }}>Deadline Again</span>
          </div>

          <div
            style={{
              fontSize: '24px',
              fontWeight: 500,
              lineHeight: 1.4,
              color: '#94A3B8',
              maxWidth: '960px',
            }}
          >
            GPS &amp; Photo-Verified Inspections • Instant Defect Quotes • 1-Click Form-B Reports
          </div>
        </div>

        {/* Bottom brand bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#0077B6',
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
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }}>VigilAMC</span>
              <span style={{ fontSize: '14px', color: '#64748B' }}>
                Built for Fire Protection AMC Agencies &amp; Contractors
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              fontWeight: 600,
              color: '#E2E8F0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34D399',
              }}
            >
              <span>NBC 2016 &amp; Form-B Ready</span>
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
