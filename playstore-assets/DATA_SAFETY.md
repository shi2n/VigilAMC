# Google Play Console Data Safety Form — Copy-Paste Answers

Use this guide when filling out the mandatory **Data Safety Questionnaire** in the Google Play Console for **VigilAMC Field** (`com.vigilamc.field`).

---

## 1. Data Collection and Security Overview

| Question in Play Console | Answer | Justification |
| :--- | :--- | :--- |
| Does your app collect or share any of the required user data types? | **Yes** | Collects Location, Photos, and Account Info for field inspections. |
| Is all of the user data collected by your app encrypted in transit? | **Yes** | All network traffic uses HTTPS / TLS 1.3 to Supabase / Vercel cloud endpoints. |
| Do you provide a way for users to request that their data be deleted? | **Yes** | Requests can be initiated via agency admins or directly via email (`vigilamc@gmail.com`) per DPDP Act 2023. |

---

## 2. Specific Data Types Collected

### A. Location
1. **Approximate Location** (`ACCESS_COARSE_LOCATION`):
   - **Collected?** Yes
   - **Shared?** No (Never shared with third parties or advertisers)
   - **Processed ephemerally?** No (Stored with inspection record)
   - **Required or Optional?** Required for app functionality
   - **Purposes:**
     - `App functionality` (Proving technician presence at building premise)
     - `Fraud prevention, security, and compliance` (Audit trail for statutory fire safety norms)

2. **Precise Location** (`ACCESS_FINE_LOCATION`):
   - **Collected?** Yes
   - **Shared?** No
   - **Processed ephemerally?** No
   - **Required or Optional?** Required for app functionality
   - **Purposes:**
     - `App functionality` (Burn-in 6-decimal coordinates on inspection evidence photos)
     - `Fraud prevention, security, and compliance` (Verifiable site visit timestamping)

### B. Personal Info
1. **Name:**
   - **Collected?** Yes
   - **Shared?** No
   - **Processed ephemerally?** No
   - **Purposes:** `App functionality`, `Account management` (Technician identity on service audit reports)

2. **Phone Number:**
   - **Collected?** Yes
   - **Shared?** No
   - **Purposes:** `App functionality`, `Account management` (Technician login and critical service dispatch alerts)

3. **User IDs:**
   - **Collected?** Yes (Internal Technician UUID / Employee ID)
   - **Shared?** No
   - **Purposes:** `App functionality`, `Account management`

### C. Photos and Videos
1. **Photos:**
   - **Collected?** Yes (`CAMERA` permission)
   - **Shared?** No (Stored securely in Cloudflare R2 / Supabase cloud storage scoped to the employer agency)
   - **Processed ephemerally?** No
   - **Required or Optional?** Required
   - **Purposes:**
     - `App functionality` (Capturing inspection evidence, extinguisher pressure gauges, and physical defects)
     - `Fraud prevention, security, and compliance` (Tamper-evident service verification)

### D. Device or Other Identifiers
1. **Device or Other Identifiers** (Firebase Cloud Messaging Token):
   - **Collected?** Yes
   - **Shared?** No
   - **Purposes:** `App functionality` (Delivering real-time work order assignment push notifications)

### E. App Info and Performance
1. **Diagnostics / Sync Logs:**
   - **Collected?** Yes (Internal outbox retry counts, sync HTTP status codes)
   - **Shared?** No
   - **Purposes:** `Analytics`, `App functionality` (Troubleshooting offline sync connectivity in basement plant rooms)

---

## 3. Summary for Play Console Reviewers
> "VigilAMC Field is a B2B enterprise field maintenance application for fire safety technicians in India. The app collects location and camera photos exclusively while in use to create statutory compliance records and prevent fraudulent off-site check-ins for critical fire protection equipment (IS 2190 / NBC 2016). No data is sold or shared with third-party advertisers. All data is encrypted in transit via TLS and managed under Indian DPDP Act 2023 regulations."
