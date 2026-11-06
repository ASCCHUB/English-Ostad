# iPhone installation and offline use

The Android APK cannot install on an iPhone. Share the hosted website URL with
iPhone users through WhatsApp. A signed native iOS app is a separate distribution.

## For families

1. Open the website link in Safari. From WhatsApp, choose Open in Safari first.
2. Choose Safari's Share button, then Add to Home Screen, then Add.
3. Open English Ustad from its Home Screen icon and choose the student's name.
4. Stay online until Home shows **Lessons saved for offline use**. If needed,
   tap **Save lessons offline** and keep the app open while it finishes.
5. Lessons, pictures, writing, student profiles and saved progress can then be
   used without an internet connection. Updates need internet.

English audio depends on an installed English device voice. Pashto and pure
letter-sound audio require available approved recordings. Missing recordings
are not created by downloading the app. Browser storage can be cleared by the
user or the system; keep a progress backup and reopen online to restore a pack
if the app reports that lessons are no longer saved.

## GitHub Pages for ASCCHUB/English-Ostad

The repository was empty and Pages was disabled when checked during this task.
The intended URL after publication is:

https://ascchub.github.io/English-Ostad/

This URL is not live merely because these files exist locally.

The repository includes `.github/workflows/pages.yml`. In GitHub, open
Settings → Pages and set Source to **GitHub Actions**. Upload/push the project
source to `main`; the workflow tests, builds and publishes the web app.

To prepare the same Pages artifact locally:

```sh
npm ci
node scripts/build-pages.mjs
```

The static website is written to `output/github-pages`. It includes the
`/English-Ostad/` asset paths, web manifest, icons, service worker and complete
offline manifest. Keep HTTPS enabled. Do not share a localhost URL or the APK
with someone who needs to install the iPhone web app.

## Verification

The production app and Pages subfolder were tested in Playwright WebKit with
an iPhone 17 sized viewport (402 × 874 CSS pixels). The test disconnects the
browser, reloads the app and advances a lesson, and checks for missing assets
and browser errors. This is a browser-engine check, not a physical iPhone test
or a signed native iOS build.

Apple instructions: https://support.apple.com/guide/iphone/iphea86e5236/ios
Native distribution: https://developer.apple.com/testflight/
