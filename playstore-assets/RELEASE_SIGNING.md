# Android Release Signing & Build Guide — Google Play

This guide contains the exact steps and commands for the owner to generate an **Upload Keystore**, sign the release artifact, and build the Google Play **Android App Bundle (`.aab`)**.

> [!IMPORTANT]
> **SIGN THESE SECRETS — NEVER COMMIT TO GIT:**
> The keystore file (`*.keystore`, `*.jks`) and your keystore passwords MUST NEVER be committed to Git or shared in public channels. They are already added to `.gitignore`. Keep them securely stored in 1Password, Bitwarden, or your agency password vault.

---

## 1. Generate Upload Keystore (One-Time Owner Action)

Run this command in your local terminal:

```bash
keytool -genkey -v -keystore vigilamc-upload-key.keystore -alias vigilamc-field -keyalg RSA -keysize 2048 -validity 10000
```

When prompted:
- **Keystore Password:** Choose a strong password (e.g. 24+ characters).
- **First and Last Name:** `VigilAMC Technologies`
- **Organizational Unit:** `Field Engineering`
- **Organization Name:** `VigilAMC Technologies`
- **City / Locality:** `New Delhi`
- **State / Province:** `Delhi`
- **Two-letter Country Code:** `IN`
- Confirm `yes`.

Save the resulting `vigilamc-upload-key.keystore` file in a secure location outside the repository (or in `android/app/` if keeping local-only, as it is gitignored).

---

## 2. Configure Signing in `android/app/build.gradle` (Local-Only or CI)

To sign locally without committing credentials, place a `keystore.properties` file in `android/` (which is gitignored):

```properties
storeFile=../vigilamc-upload-key.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=vigilamc-field
keyPassword=YOUR_KEY_PASSWORD
```

And in `android/app/build.gradle`:

```groovy
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 3. Build Google Play Production App Bundle (.aab)

Run:

```bash
cd android
./gradlew bundleRelease
```

The output bundle will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

Upload this file directly to the **Google Play Console** under:
**Release > Testing > Internal testing** (or Production).

---

## 4. Build Test APK for Physical Phone Testing

If you want to install directly onto a physical Android device or field tablet for QA:

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at:
`android/app/build/outputs/apk/release/app-release-unsigned.apk` (or signed APK).

Install onto device via ADB:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

---

## 5. Google Play App Signing
When creating your app in the Google Play Console:
1. Go to **Release > Setup > App integrity**.
2. Opt in to **Play App Signing** (recommended).
3. Google will verify the upload using your upload keystore and re-sign with Google's protected app signing key before distributing to technicians.
