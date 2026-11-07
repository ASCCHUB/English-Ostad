# Audio

**Release decision (2026-11-01): the app ships with the device's standard voice and no studio recordings.** English is spoken by the device voice. Pashto is shown as text only (its speaker buttons stay hidden). Pure letter sounds show their letters or letter names, and a grown-up can still record them in the Parent area. Recordings remain optional: add them later with the steps below and they take over automatically. `npm run release:check` no longer requires them.

All sound goes through `src/ustad/soundEngine.js`:

- **English** words and sentences use the device's English voice. The best natural British voice is picked automatically; learners can choose another in *Themes & display → Sounds and voice*.
- **Pashto** plays only recordings of a Lower Dir (Malakand) speaker. Device Pashto voices are never used, because they speak other accents. Until a line is recorded, its speaker button shows as pending (dashed outline) and tapping it says "Pashto audio is not ready yet. Please read the text." The text is always shown.
- **Chimes and background music** are generated in the browser. There are no sound files to download.
- **Only one voice at a time.** A new word or Pashto line stops the previous one. Music goes quiet while anything is spoken, and a celebration waits until narration has finished.
- **Settings** (voice, automatically play instructions, sound effects, background music, pause all sound, chosen English voice) are saved per learner. Music and automatic instructions are off by default.

## Recording the Pashto

All the app's Pashto is in `src/ustad/locales/ps.js`. Each line has an id such as `ps-6a1b8e6f`, and its recording is the file with that name.

1. Open `docs/pashto-recording-list.csv` in Excel or Google Sheets. It lists every line with its file name, the Pashto to read, the English, and a priority:
   - **1**: menus, buttons and approved lines (record these first)
   - **2**: instructions, hints and feedback
   - **3**: word meanings for Pashto help
   - **4**: lesson explanations and example sentences
2. Record each line exactly as written, in a quiet room, and save it as `.mp3` with the file name from the list, for example `ps-6a1b8e6f.mp3`.
3. Put the files in `public/audio/ps/`.
4. Run `npm run pashto:audio`. It marks every line with a recording as ready and tells you about any file whose name matches no line.
5. Run `npm run build`. Recordings are included in the offline pack.

If you change a line's Pashto in `ps.js`, record that line again: the file has to match the text on screen.

## Changing the Pashto wording

Edit `src/ustad/locales/ps.js` directly. Each line has:

- `ps` (Pashto), `rps` (Roman Pashto)
- `status`: `approved` (you approved it), `converted` (style rules applied), `check` (waiting for your review; `checks` says why), `kept` (no change was needed)
- `audio`: `pending` or `ready` (set by `npm run pashto:audio`)

The style rules are in `src/ustad/pashtoStyle.js`. `scripts/build-pashto-locale.mjs` built `ps.js` once from the older text; don't run it again, or hand edits are lost (it refuses unless you pass `--force`).

## Letter sounds and blending: recorded only

Device speech (TTS) is used only for whole words, letter names and sentences. Pure letter sounds and slow blends must be human recordings, because device voices add a vowel ("suh" instead of "sss").

- `docs/beginner-course-phase1/audio-manifest.json` gives every letter-sound clip an `artistCue` (for example "sss, like a snake. Not "suh", not "ess"."). It also has one `blend_stretched` clip per blending word (36 words, for example "s–a–t → sat"). `node scripts/extend-audio-manifest.mjs` adds them and is safe to run again. It also rewrites `docs/beginner-course-phase2/audio-recording-list.csv` with an Artist cue column. Then run `npm run first-steps:build`.
- Playback order for a clip: a reviewed studio recording, then a grown-up's home recording on this device, then device speech (words and letter names only). If none of these is available, the sound's letters are shown instead of a button.
- **Home recordings**: Parent area → "Record the letter sounds yourself". There is one row per sound (40) and per slow blend (36), each with its cue. Use Record, Play and Delete. Clips are stored in IndexedDB (`english-ostad-home-recordings`), stay on the device, and are not uploaded or included in backups. Code: `src/ustad/firstSteps/homeRecordings.js` and `HomeRecorder.jsx`.
- Blend steps show **Blend slowly** once that word's slow-blend clip has a recording. It is optional and is not needed to continue.

## Pakistani English voice (pre-recorded, added 2026-11-06)

Children in Pakistan understand a Pakistani accent more easily, so the app's English can be pre-recorded with Microsoft's Pakistani English neural voice (Uzma, female, or Asad, male).

1. Create a free Azure "Speech" resource (portal.azure.com → Create a resource → Speech; the free F0 tier covers this app). Copy **Key 1** and the **Region**.
2. Add them to `.env.local` (this file stays on your computer; never share or commit it):
   ```
   AZURE_SPEECH_KEY=...
   AZURE_SPEECH_REGION=centralindia
   ```
3. `npm run voice:pk -- --limit=20` (test), then `npm run voice:pk` (everything: about 4,600 lines and 129,000 characters, inside the free monthly allowance). Use `--voice=asad` for the male voice, and `--force` to record everything again.
4. `npm run build`, then build the APK.

Clips go to `public/audio/en-pk/` with an index in `public/en-pk-voice.json`. The line list comes from `scripts/speech-texts.mjs` (course words and sentences, letter names, games, word library). Add any missing line to `scripts/speech-extra.txt`. The voice is the **Recommended** choice in Sounds and voice. A line without a clip uses the phone's best English voice (Pakistani, then Indian, then others). Letter **sounds** are never generated by this script: they still need human recordings. The voice speed setting slows clips down too.

On Android the device-voice fallback now uses the phone's installed voices (previously always American English). "Get more English voices" in Sounds and voice opens the phone's voice download page (choose English (India)).

## Urdu speech (added 2026-11-07)

See `docs/URDU.md`. Urdu help lines can be spoken by a recorded Pakistani Urdu voice (`npm run voice:pk -- --lang=ur`) or the device's Urdu voice.
