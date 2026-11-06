# iPhone app: what is needed

The iOS project is ready in `ios/` (Capacitor 8, Swift Package Manager, no CocoaPods). An iPhone app can only be
compiled and signed on macOS, so it is built either on a Mac or in a cloud Mac service.

## You need

1. **Apple Developer Program membership**: US$99 per year (developer.apple.com/programs). It must be active before any
   build can be installed on an iPhone through TestFlight or the App Store.
2. **One of:**
   - **A Mac with Xcode** (latest version from the Mac App Store), or
   - **A cloud build (no Mac):** Codemagic (codemagic.io). `codemagic.yaml` in this folder is ready. The free tier
     includes monthly build minutes.
3. **Signing:** with Codemagic, create an App Store Connect API key (App Store Connect → Users and Access → Integrations),
   add it in Codemagic as an integration named `english_ustad_asc`, and Codemagic creates and manages the certificate
   and provisioning profile. On a Mac, Xcode's "Automatically manage signing" with your team does the same.
4. **App record:** in App Store Connect create the app with bundle id `com.englishustad.app` (the same as Android).

## Build

- **Codemagic:** connect the project's Git repository, choose the `ios-testflight` workflow and start it. The build
  appears in TestFlight; install TestFlight on the iPhone to test it.
- **Mac:** `npm ci && npm run build && npx cap sync ios && npx cap open ios`, then in Xcode choose your team and press Run
  (a cable-connected iPhone) or Product → Archive (TestFlight / App Store).

## Already set up

- App name "English Ustad", icon and splash screen.
- Child recording controls are removed; no microphone permission is requested.
- Sound unlocks on the first tap (iPhone rule); the replay buttons stay visible if a sound is still blocked.
- English voice: the best voice on the device (Pakistani or Indian English, then Enhanced/Premium voices, US, British),
  never Apple's novelty voices. Pashto plays only your recordings.

## Without an app (works today)

On iPhone, open the web version in **Safari** → Share → **Add to Home Screen**. It opens full screen like an app and
saves lessons offline after the complete pack finishes. Wait for the Home screen confirmation before disconnecting. See IPHONE-WEB-INSTALL.md.
