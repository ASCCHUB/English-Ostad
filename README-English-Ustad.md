# English Ustad – Learn English in Pashto & Urdu

English Ustad (briefly called Little Explorers) is a local-first English learning app for Pashto-speaking children. The storybook design and guided adventure extension are implemented in the app; see [adventure screens, interactions and limitations](docs/LITTLE-EXPLORERS-ADVENTURE.md). The active app uses the installed React/Vite setup. Previous mobile-shop source files remain in the workspace but are not imported by English Ustad.

The app name is **Pashto to English: Learn & Play**. Its backpack-and-book icon appears in navigation, the browser favicon and phone installation icons. The editable high-resolution source is `public/pashto-english-icon.png`; run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/generate-app-icons.ps1` to regenerate the PNG sizes and legacy SVG wrappers. The maskable variant adds safe padding for circular/adaptive launcher masks.

## Realistic artwork

The welcome scenes, game cards and rewards now use more lifelike fox, rabbit and turtle characters, with natural fur, eyes, whiskers, scales and shell detail. The backpack/book icon uses realistic fabric, stitching, paper and metal materials. These fantasy learning scenes retain the existing layouts and colours.

The five edited sources are `public/explorers/welcome.png`, `public/explorers/welcome-mobile.png`, `public/explorers/game-scenes.png`, `public/explorers/rewards.png` and `public/pashto-english-icon.png`. Rewards retain alpha transparency. Built-in image generation was used; the [full prompts and asset inventory](output/design/realistic-art-prompts.json) are saved in the workspace. Original cartoon assets are preserved in `output/design/original-cartoon-art/`. Regenerate app-icon sizes using the existing PowerShell icon script after changing the icon source.

The avatar picker also uses realistic portrait thumbnails at `public/explorers/avatar-fox.png`, `avatar-bunny.png` and `avatar-turtle.png`, replacing the previous emoji. Full-resolution masters and [built-in image-generation prompts](output/design/avatar-portrait-prompts.json) are saved under `output/design/`. Run `scripts/generate-avatar-thumbnails.ps1` to regenerate the 256px thumbnails.

## Start the app

```sh
npm install
npm run dev -- --host 127.0.0.1
```

For the offline-capable production version:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Open the localhost URL printed by Vite. No API keys, environment variables, accounts, or backend are required. The old shop environment settings are not used.

## Guided cartoon adventures

- **One learning path** (`src/ustad/pathModel.js`, `PathScreens.jsx`): 44 lessons in order, from Meet your new friends and A, B, C to the advanced classes. Each class ends with a review adventure. Lessons mix suitable activities (watch, listen and tap, match, trace, say it, quiz, building games, key ideas) rather than repeating one format. The next lesson unlocks after the current one is finished. Wrong answers get a hint, then fewer choices. Lessons that needed retries are offered as extra practice, and later lessons bring back one earlier question.
- **Urdu and Pashto everywhere:** when a support language is chosen, every heading, button, instruction, hint, dashboard label and lesson explanation shows its Urdu/Pashto/Roman line under the English. Hand-placed translations come from `Explain`/`Translation`; everything else is added automatically by `src/ustad/supportLayer.js` from the dictionary in `supportCopy.js` (plus `supportScreens.js` and `supportAdvanced.js`), which also handles counters such as "STEP 2 OF 6". Answer choices and English practice lists stay English so practice is not given away. `npm run audit:language` renders every screen and every lesson step and fails if any English line lacks a translation.
- **Home → Continue My Adventure** opens the next unfinished activity; the step is saved after every activity and restored after reload or Take a break. The adventure map (`#/journey`) labels each lesson Completed, Continue here, Up next or Unlocks later, and shows what was learned and earned badges. Grown-ups set the starting class (Home class) or unlock every lesson in the parent area.
- **Home · Classes · Play · My Stars** navigation, with prominent Stories and Discover portals.
- Ten ability-based classes in four stages (Beginner, Elementary, Intermediate, Advanced; roughly CEFR Pre-A1 to C1), 30 themed units, forest maps and a Watch → Listen → Join in → Play → Review flow. Units from class 6 upward add key ideas, playable example sentences and their own check question.
- 24 games with examples, tap/tile answers, hints, retries and celebrations. Twelve practical Discover activities. The ten-question starting check can suggest any class.
- **Picture words** (`#/picture-words`): 185 illustrated words in 18 groups, with Look & learn cards, Name the picture, Find the picture and Letter puzzle rounds. Pictures animate (still when reduced motion is on), answers feed the word review schedule, and meanings appear in the chosen support language.
- Beginner instructions, questions, answer choices, hints, feedback, unit text, Discover activities, story questions and story lines show Pashto/Urdu support directly under the English (`src/ustad/supportCopy.js`, draft, needs native review). Advanced units translate their titles and explanations; key-idea lists and advanced games are English-only for now.
- Six scene-based stories, class/topic filters, narration controls and word highlighting when the device provides timing.
- Guest introduction, optional starting check, parent-selected home class, three avatars, captions, reduced motion and session reminders.
- Parent dashboard separates scenes explored from correctly answered activities and flags revision. Optional record/play-back is off by default, parent-controlled and kept only in page memory.

These are brief illustrated CSS animations and a beginner course extension. Native-reviewed support-language audio and full device/media verification remain pending. See the [implementation and state guide](docs/LITTLE-EXPLORERS-ADVENTURE.md).

## Backgrounds and display

Use the sun/moon button in the header to switch light and dark mode. Open **Themes & display** in the sidebar or footer to choose Light, Dark or System and one of four illustrated backgrounds: Cloud Meadow, Forest Trail, Peach Sunrise or Starlight. System mode tracks device changes. Choices are saved per learner and included in progress backups; older backups receive safe defaults. Background artwork is local CSS/SVG and works offline.

Dark mode covers learning cards, maps, games, quizzes, stories, parent settings and navigation while keeping character illustrations colourful. Render checks cover all 12 mode/background combinations across the main screens. Actual visual contrast and phone-layout review still need a connected browser.

## Adult spelling and vocabulary

Open **Adult spelling** on Home or the sidebar, or visit `#/adult-spelling`. The adult course contains **360 words across six levels**, from short everyday vocabulary to advanced spelling. Each entry includes an English meaning, a real-life example, spelling guidance, missing-letter practice, listen-and-write recall and sentence-gap practice. Filter by level, length, word/meaning, completion and due revision. Progress, scores and review dates save per learner and survive backups. The course supports the existing background and dark-mode settings.

See [adult course details and limitations](docs/ADULT-SPELLING-COURSE.md). Full adult-dictionary Pashto/Urdu translation is not included; existing translated meanings are offered where available. Run `node scripts/verify-adult-ui.mjs` for course rendering checks.

## What is implemented

- Responsive learning home, nine curriculum areas, progress, games, offline pack and parent controls. Parent and offline controls are accessible in the phone header.
- English-only mode plus optional Pashto, Roman Pashto, Urdu and Roman Urdu, with a simultaneous-language option. Navigation, curriculum titles and core quiz instructions include support-language text. English words retain their original spelling and direction; Pashto/Urdu translations have their own RTL direction.
- A–Z uppercase/lowercase examples, common-sound notes (including letters with multiple sounds), letter-name audio, and finger/mouse tracing with clear/retry.
- 100 searchable illustrated vocabulary entries across 16 categories, with pronunciation guides and all four support-language meanings. Vocabulary pictures use device emoji. The welcome, home, map, games and rewards use locally bundled 3D character illustrations. Neither depends on external image servers.
- 16 phonics lessons: short vowels, selected long-vowel/silent-e pairs, sh/ch/th/ph, blends, word families and sound contrasts including v/w and ship/sheep. Support-language notes accompany English mouth-position guidance.
- 15 everyday speaking phrases and 12 short reading sentences, with full-sentence, slow and individual-word playback. Speaking uses listen/repeat self-practice, with optional parent-enabled recording/playback. No automated pronunciation score is claimed.
- 21 grammar lessons with examples, translations, audio and sentence construction: am/is/are, have/has, a/an, plurals, this/that/these/those, present/past/future examples, negatives, questions, prepositions, possession and adjectives.
- Six illustrated stories with multilingual text, vocabulary and three comprehension questions each. English questions can be read aloud.
- Typed and on-screen-keyboard spelling, picture and audio quizzes, letter recognition, missing-letter challenges, tap/drag letter ordering, sentence ordering, memory matching, and a repeatable daily picture challenge.
- Quiz corrections are shown after submission, with correct answers, gentle feedback, scores and review words. One submission is recorded per question/attempt. Question and option order are shuffled without duplicate questions or broken keys.
- Level-dependent quizzes: Little Learner uses words up to four letters, Beginner up to six, Young Explorer uses all words and ten-question sessions. The other levels use five-question sessions. All teaching lessons remain available.
- Due-word review includes even one due word and fills the remaining questions appropriately. Correct practice moves words through new, learning, practicing and confident; confidence requires five correct answers. Wrong answers get a shorter review interval.
- Separate learner progress: completed lessons, words, quiz history, spelling/listening accuracy, active practice minutes, daily goals, streaks, points and lesson/word resume. Repeated completion does not grant the same lesson's points twice. Today's goal is independent of prior days.
- Parent gate, nickname-only learner profiles, level and goal settings, JSON progress export and strict validated restore. Invalid nested backup data does not replace good progress. Unreadable existing saved data is copied to a recovery key before a fresh profile is created.
- A generated production offline manifest and service worker cache all core HTML, bundled code/styles and install metadata. Installation fails if a required file cannot download. The offline screen saves/verifies every listed file and reports interrupted downloads or unavailable service workers. Versioned caches prevent accidental deletion of unrelated app caches.
- Touch targets, keyboard buttons, focus styles, reduced-motion styles, a runtime error screen, and no advertising, analytics or tracking. Optional microphone clips are local and temporary.

## Detailed learning studio

Open **Your learning studio** on Home or Learn.

- **Spelling school:** 100 six-step lessons: meaning and audio, letter groups and spelling tips, missing letters, letter building, listen-and-spell, and word use. Available matching sentence examples appear in the final step.
- **Sentence workshop:** 21 six-step lessons explaining word jobs, capitals and punctuation, followed by missing words, word ordering, whole-sentence writing and read-back. Corrections check the practiced example, rather than arbitrary free writing.
- **Word families:** eight endings with four example words each, listening, comparison and typed recall.
- **Read & understand:** 12 four-step readings with tappable word audio, useful small words, comprehension questions and read-aloud practice.

Correct an answer before moving forward. First-try scores remain accurate after retries. Each learner keeps a checkpoint for the most recently opened lesson in each course; submitted answers and unlocked stages survive reload and backup restore. Unsubmitted text and tile arrangements are not saved. Completion earns points once per lesson. New instructions support all five language settings and are included in the draft language review pack.

## What still needs human/device review

**The course is an expanded beginner release, not a complete elementary curriculum or an expert-verified language product.**

The Pashto wording now targets everyday **Swat / Dir / Malakand** speech, selected by the user. See [regional revision notes](docs/PASHTO-REGIONAL-REVISION.md) for examples and source scopes. Pashto, Urdu and transliterations are drafts. A fluent Pakistani Pashto speaker and an Urdu teacher must check natural wording, regional vocabulary, romanization and meaning before children rely on the course. Source records are marked `needs-native-review`; this is not a claim of verification.

A review pack is provided in `docs/english-ustad-language-review.json`. A reviewer can annotate corrections there; apply accepted changes to the corresponding source modules, regenerate the pack and rerun checks:

```sh
node scripts/export-ustad-review.mjs
```

English audio is genuine browser speech synthesis, restricted to available English voices and preferring en-GB. Playback quality and availability depend on installed voices. Some voices require internet. Letter-name and whole-word/sentence audio are implemented; isolated phoneme recordings are not provided. There are no downloaded speech recordings, third-party TTS credentials or speech-recognition services. Temporary child voice clips are optional and are never uploaded.

The UI includes support-language labels and learning content, but extended explanations, some buttons and feedback still use English. The optional level setting changes quiz word length/session size; it is not a diagnostic or adaptive curriculum. Six stories and selected grammar examples do not replace a complete teaching programme. Tracing offers visual self-comparison; handwriting recognition and letter-formation scoring are not implemented. The older guided reader highlights tapped words. The new story player synchronizes highlighting when the device voice provides word-boundary events, and otherwise leaves captions unhighlighted. Pictures depend on device emoji support; the English word remains available if a glyph is missing.

Progress stays in this browser and is not synchronized across devices. Clearing site data or storage eviction removes progress and cached lessons. Export a backup first. A nickname can be used instead of a child's full name. The adult arithmetic gate is a deterrent for young children, not account authentication. Up to 20 learner profiles can be created on a device.

The production offline worker and download behavior pass simulated Cache API/service-worker tests. **Real browser offline, audio, touch and visual tests are still pending:** this environment reports no connected browser. Optional Google fonts can fall back to local system fonts when offline.

## Checks

```sh
npm test
node scripts/verify-ustad-ui.mjs
npm run build
```

- 87 automated checks pass: complete content, answer keys, scoring, review intervals, level filtering, deterministic daily practice, profile isolation, backup validation, daily goals, streaks, resume data, spelling stats, pack verification, failure recovery, and simulated service-worker installation/offline requests/cache updates.
- React rendering checks pass for every item and stage of the four guided courses, completion summaries, all six Little Explorers screens, retained learning activities, the featured story, parent gate, translations and five quiz modes in all six presentation settings, including English only. They verify mixed text direction and that quiz corrections stay hidden before submission. Server rendering does not exercise event handlers, effects, touch or browser speech.
- Production build passes. The build creates `dist/offline-manifest.json` and embeds the matching version in `dist/sw.js`.
- Real-browser verification remains pending because no browser is connected. The production home, service worker, bundled code and illustration files are checked over HTTP; the worker version matches the generated manifest.

Before release, open the production preview, verify the English voice, complete/retry each activity, switch language modes, test the phone layout and adult gate, export/restore a backup, save the offline pack, disable internet, reload and confirm lessons and progress remain available.

## Source layout

- `src/main.jsx`: app entry and production worker registration.
- `src/ustad/App.jsx`: navigation, learner settings, word/alphabet/spelling screens and saved state.
- `src/ustad/PracticeQuiz.jsx`: interactive picture/listening/letter/missing/ordering quizzes.
- `src/ustad/AdventureScreens.jsx`, `adventureContent.js`, `adventureEngine.js`, `adventureSettings.js`, `AdventureMedia.jsx`, `useNarration.js`, `adventure.css`: classes, games, Discover, story/speaking players, accessibility, media and parent settings.
- `src/ustad/StudyCourses.jsx`, `studyContent.js`, `studyEngine.js`, `studyValidation.js`, `study.css`: guided spelling, sentences, reading, word families and validated checkpoints.
- `src/ustad/LessonLibraries.jsx`: grammar and story learning activities.
- `src/ustad/content.js`, `curriculum.js`, `i18n.js`: editable learning content and translations.
- `src/ustad/shared.jsx`, `style.css`: reusable multilingual components and responsive styling.
- `src/ustad/engine.js`: profiles, answer generation, difficulty, review, backup validation and scoring.
- `src/ustad/offline.js`, `public/sw.js`: offline-pack verification and worker.
- `src/ustad/*.test.js`, `scripts/verify-ustad-ui.mjs`: automated checks.
- `scripts/offline-manifest.mjs`: production precache generation.

Deploy the generated `dist` folder to static HTTPS hosting. No external site has been published as part of this local task.

## Help Fox Find the Apple

Open **Play → Play with Fox**, or `#/fox-game`. The complete apple lesson introduces Fox, demonstrates the word, waits for a selection from apple/ball/book, offers a gentle retry hint, animates a correct pickup, and reviews the word. **Save and finish** records completion and unlocks the next activity. The same controller also powers red, rabbit, three, and book lessons, in that order.

The garden uses a locally generated articulated Three.js fox with a blue backpack, blinking eyes, breathing, walking limbs, tail motion, and a smile. This is a procedural cartoon rig; it does not use a cinematic fur model or recorded character animation. Three.js loads separately when the garden opens. A lightweight 2D garden reuses the existing fox portrait and object illustrations. WebGL initialization failure, context loss, or sustained low frame rate switches to 2D without resetting the lesson; a manual switch is also available.

Controls include pause/resume, replay instructions, restart, mute, captions, reduced motion, and Pashto help. Switching away from the window pauses the lesson. Resuming repeats the current instruction safely. Restoring an interrupted introduction returns to Start, an interrupted hint returns to choosing, and an interrupted celebration returns to review. Synchronous input gating and narration cancellation protect against repeated taps. Completion points are awarded once per learner and activity, including after reload or replay.

English narration uses an installed device voice. Word highlighting follows supported speech boundary events and a separate target-word utterance; silent mode highlights the demonstration and offers Continue. Missing or failed speech also offers readable captions and Continue. Optional Pashto playback appears only when a real `ps` voice is installed; text help is always available. The short Pakistani Pashto help phrases are editable in `foxLessonModel.js` and still need a Lower Dir speaker's review before claiming regional approval. Device voices can require internet even when lesson assets are saved offline.

Implementation: `FoxAppleGame.jsx`, `foxScene3d.js`, `foxLessonModel.js`, `foxProgress.js`, and `foxGame.css`. Checkpoints remain inside the existing learner backup. Run `npm test`, `node scripts/verify-fox-ui.mjs`, and `npm run build` for state/progress, server-rendered UI, and production checks. The Fox checks cover wrong answers, double taps, stale callbacks, pause, safe recovery, validation, independent progress, completion deduplication, unlocks, all five lesson configurations, and rig geometry. Server rendering checks 40 lesson/checkpoint combinations and navigation. These checks do not exercise actual browser speech, WebGL rendering, frame-rate fallback, touch, or visual layout; those still require device verification.




## First Steps beginner course
The approved-draft five-level course is implemented at #/beginner, with 79 lessons, activity-level device-only progress, gated checks and parent placement. See [implementation and recording instructions](docs/BEGINNER-COURSE-IMPLEMENTATION.md). Native phoneme/Pashto recordings and native review remain pending; supervised Live adult reader mode is available in the gated parent area.
