# Older Android layout fix

The shipped CSS used media-query ranges such as @media (width<=620px). Older Android System WebViews ignore those queries, leaving the desktop sidebar and its 240px lesson offset visible on narrow phones. The source CSS already had responsive rules, but the production minifier modernized their syntax.

Vite now uses build.cssTarget='chrome61'. Production CSS retains compatible max-width/min-width queries, and compatible color and selector transformations. The existing responsive lesson styling can therefore apply.

The Android packaging script runs scripts/verify-android-css.mjs after every web build. It rejects media-query ranges and checks sidebar display:none and main margin-left:0 at 320, 360, 375, 390, 412, 480 and 600 CSS pixels.

The fix changes layout compatibility only. Existing progress and all-lesson access are retained. Verification covers the compiled CSS and APK signature/assets; the specific Samsung handset still requires the user to install the updated APK to confirm its on-device appearance.
