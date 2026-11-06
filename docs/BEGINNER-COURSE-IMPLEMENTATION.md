# First Steps beginner course — implementation

Implemented in the running **ENGLISH OSTAD** project on 26 October 2026. This is a separate cumulative beginner course; the existing classes, 44-lesson path, adult course, profiles and saved progress are retained.

## Open the course

On Home or Classes, choose **د شروع نه انګلیزي**. The main button continues the first unfinished activity, including saved tiles or a partially answered check. Direct routes are `#/beginner` for the map and `#/beginner-lesson/0` for the first lesson. Unfinished lessons reopen at the saved activity, ready to continue. Leaving the window or app stops sound but does not pause the lesson; the Pause button is the learner's choice.

There are five levels, 79 lessons and 1,065 configured task screens. Activities cover letter names versus sounds, upper/lower matching, letter finding, guided tracing or ordered tap points, early blending, spelling, missing graphemes, word changes, sentence building, capitalization/spacing/full stops, read-along, story order, comprehension and conversation. Letter browsing stays A–Z while teaching follows the approved sound order. Simple scene illustrations identify people, objects, actions, feelings and locations. Some picture cues use emoji; these are not a complete set of bespoke realistic story illustrations.

## Review and audio status: important

Approval to implement Phase 1 did **not** approve the English/Pashto linguistics or recordings. All original review fields remain pending. No native voice recordings were supplied or fabricated.

Ordinary English words and letter names can use an installed English device voice. Pure phonemes, phoneme sequences and Lower Dir Pashto never fall back to reading IPA through speech synthesis. Sound-dependent answers require delivery of the prompt; clicking Continue or listening to a different word does not satisfy it.

Until reviewed recordings are supplied, use **For parents → grown-up gate → First Steps beginner course → Live adult reader**. A supervising adult reads missing prompts without showing the answer; the prompt is hidden before the child answers. Mastery records identify this as live-reader use. This enables supervised learning; the course is **not yet a fully narrated, child-only course**. Pashto text and separate instruction/help replay controls remain available.

**Answer directly (current behaviour, chosen by the user).** The sounds an activity needs count as heard as soon as it opens, so the child can answer straight away and Next works without tapping speakers first. A question's English sound plays once by itself when it has a voice; 🔊 buttons stay for replaying English. Clips with no recording are silent and show no message. Pashto play buttons (instruction replay, hint replay, speakers beside Pashto lines) are hidden until a recording exists for that line; Pashto help still shows the Pashto text. A child can therefore answer sound questions without hearing the sound until recordings are added; Live adult reader remains available.

The existing parent area uses its existing child-deterrent maths gate. Placement checks assess every preceding level with five questions, at least four correct first responses and constructed output; skipped lessons remain available but are not falsely marked mastered. Leaving an unfinished placement check restarts that placement check. Core lesson checkpoints remain intact.

## Gates, hints and replay

Each core check has five items. Passing requires at least 80%, a correct constructed response, and any required letter-name/sound domains or sentence item. First wrong responses remain wrong even if the learner later copies the modeled answer. Pronunciation help for an answer during a check marks that item assisted. Picture-name introductions and replaying the question are prompt delivery, not answer assistance.

After one error, show a specific hint. After two, show a model. A failed check keeps the next lesson locked and revisits practice before a new check round. Old check mistakes and modeled-answer counters are cleared for the new round. Answer positions change between rounds while remaining stable when resuming the same attempt. No lives or negative sounds are used. Finite quizzes cannot make chance success mathematically impossible.

Mastery certificates are separate from replay checkpoints. Replaying does not remove earned mastery, relock later lessons or award duplicate completion points. Watching/reading a model alone never awards lesson mastery.

## Device-only progress and backups

The user selected device-only progress. **This course does not upload progress or create learning accounts.**

Every accepted interaction writes a validated synchronous checkpoint before the UI advances. It is mirrored to IndexedDB, with a coalesced local recovery journal. The `outbox` store name is reserved locally; there is no network sync sender. If IndexedDB is unavailable, the synchronous browser checkpoint remains available. If that synchronous write fails, the activity does not advance and a storage message is shown.

The existing `english-ustad-v1` profile key is retained, with a validated `firstSteps` field. Auxiliary keys use `first-steps-checkpoint:<learnerId>`. On startup, newer valid recovery snapshots are merged before Home and export use the profile. Learners remain isolated. The parent area's existing export/restore includes the course; explicit validated restore clears stale recovery mirrors first.

Saved state includes task cursor, ordered completed task IDs, first responses, retries, tile identities/placements, trace strokes/dots, delivered prompts and check history. Reopening resumes the same task. Speech is stopped on pause, page exit, window blur or hidden document; nothing is auto-submitted and the lesson is not paused by leaving the window. Tracing samples are bounded to avoid unbounded backup growth.

## Supply reviewed recordings

The original Phase 1 manifest contains 364 recording entries. Four interface-specific Pashto hints are kept separately in `src/ustad/firstSteps/uiContent.json`, also pending review. The combined **368-entry** recording list is `docs/beginner-course-phase2/audio-recording-list.csv`.

1. Have native English/phonics and Lower Dir reviewers approve the scripts and sign-off fields before publishing claims of approval.
2. Record pure sustained consonants where appropriate and clipped stops without an added vowel. Record the two `th` and two `oo` sounds distinctly; `x`, `qu`, and final `le` have explicit sequence notes. Do not record the literal IPA characters as speech.
3. Put files under `public/audio/first-steps/` with stable recording IDs, for example `public/audio/first-steps/en-<id>.mp3`.
4. In `public/first-steps-audio.json`, set the matching ID's `file` to its `/audio/first-steps/...` URL, `status` to `ready`, and `reviewStatus` to `approved` **only after review**. Existing ready overrides are preserved by the installer.
5. Optional alignment is an array of `{startMs,endMs,charIndex}` in that entry. Word highlighting uses these delivered timings, or actual device speech boundary events. It does not fabricate timing when a voice does not emit boundaries.
6. Run `npm run build`. The offline generator includes the recording manifest and approved ready audio files; missing referenced files fail the build. Save the offline pack in the app. Device voices may still depend on their provider/network.

All course audio uses the existing global sound owner: new speech/recordings cancel the previous clip; stale callbacks cannot advance tasks. Global mute applies. A speech timeout returns an error rather than pretending a prompt finished.

## Source and extending content

`docs/beginner-course-phase1/curriculum.json` and its audio manifest remain the canonical approved-draft sources. The running project's existing `scripts/build-first-steps.mjs` produces `course.json` and `outline.json`; `npm run first-steps:check` checks source consistency. Renderer-only hint scripts and the sentence-conventions binding are separate in `uiContent.json`.

Reusable modules live in `src/ustad/firstSteps/`: `tasks.js` compiles supported activity configurations; `state.js` owns gates and backup validation; `store.js` handles local saves; `audio.js` bridges reviewed clips/device words; `FirstSteps.jsx` renders maps/activities/parent settings; `Trace.jsx` and `scenes.js` render practice cues. The course screen/data chunk is lazy-loaded. Builds still report large JavaScript chunks, including the existing application bundle.

New lessons using supported activity types can be authored as data and rebuilt without adding a screen. Append compatible lessons with stable IDs. Editing an existing task sequence or changing content versions requires an explicit saved-progress migration; do not discard old checkpoints. New text, pictures, tracing guides and audio retain pending review until signed off.

## Verification and limits

- 127 automated tests pass, including full cumulative traversal of all 79 lessons, gate failures/retries, stale/double input, same-task tile resume, parent placement, independent construction, backup rejection, per-learner isolation, replay/points, local persistence fallback, and canonical-source consistency.
- Server-rendered checks pass for all 1,065 task views, map/lesson entry, parent settings, Home entry, visible image paths, backup integration, route bounds, and pending phoneme/Pashto audio behavior.
- The production build and offline-manifest generation pass.

No live browser was connected. These checks do **not** establish actual touch/canvas behavior, browser speech timing, real IndexedDB transaction behavior, low-end Android performance, or visual layout on devices. Native language/phonetic review, real voice recordings and a supervised child/device pilot remain required before release as an independently narrated course.

Commands: `npm test`, `npm run first-steps:check`, `node scripts/verify-first-steps.mjs`, `npm run build`.
