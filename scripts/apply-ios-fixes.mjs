#!/usr/bin/env node
/**
 * Idempotent helper for the Mac/Xcode project (`ios/App`).
 * Applies Task A (WKAppBoundDomains + limitsNavigationsToAppBoundDomains)
 * and Task B (Remote notifications background mode, APNs entitlements, AppDelegate token forwarding).
 */
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const infoPlistPath = path.join(root, 'ios', 'App', 'App', 'Info.plist');
const appDelegatePath = path.join(root, 'ios', 'App', 'App', 'AppDelegate.swift');
const entitlementsPath = path.join(root, 'ios', 'App', 'App', 'App.entitlements');

if (!fs.existsSync(infoPlistPath)) {
  console.error(`[apply-ios-fixes] Could not find ${infoPlistPath}. Run this on the Mac where ios/App exists.`);
  process.exit(1);
}

// 1. Patch Info.plist: WKAppBoundDomains + UIBackgroundModes (remote-notification)
let plist = fs.readFileSync(infoPlistPath, 'utf8');

if (!plist.includes('<key>WKAppBoundDomains</key>')) {
  const wkBlock = `\t<key>WKAppBoundDomains</key>\n\t<array>\n\t\t<string>vigilamc.vercel.app</string>\n\t\t<string>vigilamc.com</string>\n\t\t<string>www.vigilamc.com</string>\n\t</array>\n</dict>`;
  plist = plist.replace(/<\/dict>\s*<\/plist>\s*$/, `${wkBlock}\n</plist>\n`);
  console.log('[apply-ios-fixes] Added WKAppBoundDomains to Info.plist');
} else {
  console.log('[apply-ios-fixes] WKAppBoundDomains already present in Info.plist');
}

if (!plist.includes('<string>remote-notification</string>')) {
  if (plist.includes('<key>UIBackgroundModes</key>')) {
    plist = plist.replace(
      /<key>UIBackgroundModes<\/key>\s*<array>/,
      `<key>UIBackgroundModes</key>\n\t<array>\n\t\t<string>remote-notification</string>`
    );
  } else {
    const bgBlock = `\t<key>UIBackgroundModes</key>\n\t<array>\n\t\t<string>remote-notification</string>\n\t</array>\n</dict>`;
    plist = plist.replace(/<\/dict>\s*<\/plist>\s*$/, `${bgBlock}\n</plist>\n`);
  }
  console.log('[apply-ios-fixes] Added UIBackgroundModes (remote-notification) to Info.plist');
} else {
  console.log('[apply-ios-fixes] UIBackgroundModes (remote-notification) already present in Info.plist');
}

fs.writeFileSync(infoPlistPath, plist, 'utf8');

// 2. Patch AppDelegate.swift: didRegisterForRemoteNotificationsWithDeviceToken & didFailToRegisterForRemoteNotificationsWithError
if (fs.existsSync(appDelegatePath)) {
  let swift = fs.readFileSync(appDelegatePath, 'utf8');
  if (!swift.includes('capacitorDidRegisterForRemoteNotifications')) {
    const methods = `
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}
`;
    swift = swift.replace(/\}\s*$/, methods);
    fs.writeFileSync(appDelegatePath, swift, 'utf8');
    console.log('[apply-ios-fixes] Added APNs token forwarding methods to AppDelegate.swift');
  } else {
    console.log('[apply-ios-fixes] AppDelegate.swift already forwards APNs tokens to Capacitor');
  }
}

// 3. Ensure App.entitlements exists with aps-environment
if (!fs.existsSync(entitlementsPath)) {
  const ent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>aps-environment</key>
\t<string>development</string>
</dict>
</plist>
`;
  fs.writeFileSync(entitlementsPath, ent, 'utf8');
  console.log('[apply-ios-fixes] Created App.entitlements with aps-environment');
} else {
  console.log('[apply-ios-fixes] App.entitlements already exists');
}

console.log('[apply-ios-fixes] Done! Next: run `npx cap sync ios` and build in Xcode.');
