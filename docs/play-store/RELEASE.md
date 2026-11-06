# Publishing English Ustad on Google Play

## 1. Make your signing key (once, ever)

Google Play only accepts an app signed with your own key. **If you lose this key or its password you can never update the app.** Keep two backup copies (for example a USB stick and your Google Drive).

In a terminal, in the project's `android` folder:

```
keytool -genkeypair -v -keystore english-ustad-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

It asks for a password (choose a strong one and write it down) and your name/organisation details.

Then create the file `android/keystore.properties` with:

```
storeFile=english-ustad-upload.jks
storePassword=YOUR_PASSWORD
keyAlias=upload
keyPassword=YOUR_PASSWORD
```

Both files stay on your computer only. They are in `android/.gitignore`; never send them to anyone.

## 2. Build the upload file

```
npm run android:aab
```

This runs the tests and the release check, builds the app and writes **`output/English-Ustad.aab`**, the file you upload to Google Play. (`npm run android:apk` still makes the test APK for installing on a phone directly.)

For every new upload, first raise `versionCode` by 1 (and update `versionName`) in `android/app/build.gradle`.

## 3. Put the privacy policy online

Google Play needs a public web address for the privacy policy. Put a contact email in place of `CONTACT_EMAIL` in `docs/play-store/privacy-policy.html`, then host that one file for free, for example on GitHub Pages or Google Sites. Use its address in the Play Console.

## 4. Play Console (play.google.com/console)

1. Create a developer account (one-time US$25). New personal accounts must run a **closed test with at least 12 testers for 14 days** before they can publish to everyone.
2. Create app → name **English Ustad**, default language English, App, Free.
3. **Store listing**: text from `LISTING.md`, icon `play-store-icon-512.png`, feature graphic `feature-graphic-1024x500.png`, at least 2 phone screenshots (`output/phone-screenshots/`).
4. **App content** answers that match this app:
   - Privacy policy: your hosted URL.
   - Ads: **No ads**.
   - Target audience: choose the child age groups you want (e.g. 5–8, 9–12) and 13+ if adults also use it. This places the app under the **Families policy**.
   - Data safety: **No data collected, no data shared.** (Everything stays on the device; the microphone recordings are not sent anywhere.)
   - Content rating: fill in the questionnaire (education, no violence, no user chat, no purchases).
   - Government app: No. Financial features: None. Health: None.
5. **Testing → Closed testing**: upload `English-Ustad.aab`, add your testers' emails, roll out.
6. After the test period: **Production → Create release**, upload the same or a newer `.aab`, send for review.

Google Play App Signing is switched on automatically: Google keeps the final key, and your `upload` key proves the uploads are yours.
