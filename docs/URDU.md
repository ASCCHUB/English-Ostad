# Urdu help and Urdu speech (added 2026-11-07)

Written for: the person who reviews the app's Urdu, and whoever maintains it.

When a learner chooses **اردو** (or Roman Urdu) as the explanation language, the course, class map and games show Urdu help under the English, instead of Pashto. "All languages" shows both. Instructions have a **🔊** button that speaks the Urdu.

## Where the Urdu is

- `src/ustad/locales/ur.js`: course instructions (all 52), course screens, class map, game screens, game instruction templates (one per skill, added to all 1,000 game questions by `npm run games:build`), course hints and small game lines. **Every line is a draft** waiting for a fluent Urdu teacher's review. English learning words and sound marks (sss, a-a-a) stay in English inside the Urdu.
- Menus and buttons elsewhere already used the Urdu column of `src/ustad/supportCopy.js`.

## Urdu speech

1. A recorded Pakistani Urdu clip (Azure voice `ur-PK-UzmaNeural`, or `--voice=asad`): `npm run voice:pk -- --lang=ur` with the same Azure key as the English voice (about 570 lines and 17,000 characters, inside the free allowance). Files: `public/audio/ur-pk/`, `public/ur-pk-voice.json`.
2. Otherwise the phone's Urdu voice, if it has one (Android: Google voice data for Urdu; Windows Edge: Urdu voices).
3. If neither exists, the 🔊 button is hidden and the Urdu text still shows.

An Urdu voice is never used for English, and an English voice is never used for Urdu. Pashto is still recordings only.
