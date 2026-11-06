# Little Explorers: guided cartoon adventures

The attached brief is implemented as a local React app extension. Existing learners, vocabulary, spelling courses, translations and backups remain available. The orange fox, bunny, turtle and six bundled illustration assets are reused throughout.

## Screens and interactions

| Screen | Starting state | Child action and help | Success state |
| --- | --- | --- | --- |
| Home | Current class, next unit, Stories and Discover portals | Continue a class unit or open a library | Previously reviewed units remain revisitable |
| Classes | Five ability-based class cards and real unit progress | Explore a class or try the optional five-question check | Suggested class is shown; a parent chooses the home class |
| Class map | Three themed units on a forest path | Begin the next unit; revisit completed units | Review unlocks the following unit |
| Lesson player | Watch / Listen / Join in / Play / Review strip | Start, pause or replay a brief illustrated scene; listen to narration; tap an object; request a hint | Correct participation opens a game, then a unit review and celebration |
| Games | A worked example and a single stated learning goal | Tap choices or arrange removable tiles; retry with hints; no countdown | All three challenges must be answered correctly before completion is saved |
| Story player | One scene at a time, captions and narration controls | Read, listen, share a prediction, tap words and answer three review questions | Story completion is saved after the questions are answered correctly |
| Discover | Twelve illustrated topic cards | Read/listen to an explanation and answer its practical question | Discovery saved; optional links to counting or tracing |
| My Stars | Existing earned stars, badges and progress | Choose a fox, bunny or turtle avatar freely | Avatar persists per learner |
| Parent dashboard | Existing adult gate | Change home class, session reminder, accessibility, recording, profile, language and quiz settings | Validated local settings and backups retain progress |

Main navigation is **Home · Classes · Play · My Stars**. The original ABC journey and all detailed courses remain reachable through Home and relevant unit practice links.

## Learning content

- Five classes: Starter / First Steps, Beginner / My First Words, Explorer / Words into Sentences, Builder / Read and Understand, and Confident Learner / Speak and Discover.
- Fifteen short themed units, each with teaching, participation, a three-question game and a review question. Units provide links to the larger alphabet, vocabulary, sentence, phonics, reading and speaking libraries. Selected units add illustrated word banks and countable number cards for 1–10 and 11–20.
- Nine games: Letter Hunt, Sound Safari, Feed the Animal, Word Train, Sentence Builder, Color Garden, Number Adventure, Story Detective and Everyday English.
- Twelve Discover topics: counting/addition, shapes, patterns/sorting, comparisons, days/routines, weather/seasons, feelings/kindness, sharing/polite expressions, healthy habits, personal safety, nature, and creative/memory practice.
- Six existing multilingual stories now have a class/topic-filtered corner and a scene-based player. The original story library remains available as well.
- Fifteen speaking models now have a focused listen/repeat screen and optional record/play-back practice.

## Media and accessibility

Animations are short CSS movements of bundled illustrations and scene objects, not rendered cartoons or downloaded videos. A still forest scene remains usable without movement. Scene movement has separate pause/replay controls from narration. Reduced motion works through both the OS preference and parent settings. Question choices stay still.

English narration uses installed device voices. New narration controls are shown only when an enabled English voice is available; text remains usable otherwise. Pause, resume, replay and stop operate on actual speech synthesis. Story word highlighting uses real word-boundary events when the chosen voice supplies them; there is no invented timing. Individual word playback does not highlight a different word in the full sentence.

Captions default to on. If a voice is unavailable, captions remain visible even when the parent disabled them. Help explanations are opened on request. English-only mode suppresses support-language text; all existing Urdu/Pakistani Pashto and Roman modes remain available. Native-reviewed Pashto/Urdu audio has not been supplied, so no support-language audio button is presented. Translations remain drafts requiring fluent review.

Optional recording defaults to off and can be enabled only after the parent gate. The browser requests microphone permission when Record is tapped. Recording stops after at most 30 seconds; Stop, playback, Skip and discard are provided. Streams stop on leaving the page, and clips are held only in memory, never uploaded or backed up. No pronunciation score is generated.

## Progress and compatibility

`english-ustad-v1` remains the storage key. Old backups acquire safe defaults for new settings. Adventure events distinguish `watched` introductions from `demonstrated` activities. Watching grants no points. Correct answers may follow retries; attempts and revision flags are retained, and repeated completions do not grant duplicate points. A later successful first-attempt revision clears that revision flag. This is practice evidence, not a mastery assessment.

Unit milestones survive reloads. Partly finished game questions, scene position, recordings, and unsent answers are not restored; those activities restart. Session reminders use approximate engaged minutes and do not lock or punish the child. Parents choose 5, 10, 15, 20 minutes or no reminder. Existing three quiz-difficulty settings remain separate from the five guided classes.

## Verification and remaining review

Run `npm test`, `node scripts/verify-ustad-ui.mjs`, and `npm run build`. Automated checks cover data keys, route bounds, prerequisite-based starting suggestions, watched/demonstrated distinctions, retries, idempotent points, old-backup migration and settings/profile isolation. React rendering covers all language modes, maps, saved adventure stages, game questions, Discover activities, story players and guided courses.

No browser is connected in this environment. Actual phone/tablet layout, touch input, speech pause/resume, word-boundary timing, microphone permission/denial and offline reload still need device testing. The class structure is an expanded beginner path rather than a complete or teacher-verified primary curriculum. Dedicated phoneme recordings and native-reviewed support-language audio remain future content work.
