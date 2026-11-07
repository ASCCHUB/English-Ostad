# Adult spelling and vocabulary

Open **Adult spelling** in the side menu (phones) or the left sidebar (tablets and computers), or go to `#/adult-spelling`. It is not behind the parent check. (Before 2026-11-07 it was reachable only from the Parent area.) The existing children's content remains available. Adult lessons use a quieter layout, English explanations, real-life examples, and the app's background/light/dark settings.

## Vocabulary and progression

There are **1,200 unique adult vocabulary entries**, arranged into six levels of 200 words each. The first 60 of each level are in `src/ustad/adultContent.js`; 140 more per level were added on 2026-11-07 in `src/ustad/adultContentMore.js` (same format: `word|meaning|example`).

| Level | Focus | Examples |
| --- | --- | --- |
| Foundation | Short, useful words | act, job, book, cash |
| Everyday | Familiar words and routines | arrive, borrow, family, office |
| Practical | Work, travel and responsibilities | address, customer, invoice, receive |
| Accuracy | Common spelling challenges | necessary, receipt, separate, successful |
| Professional | Work, study and ideas | assessment, communicate, opportunity, strategy |
| Advanced | More demanding letter patterns | accommodation, conscientious, pronunciation, responsibility |

Words progress from shorter to longer within each level. Levels consider usage and spelling patterns as well as length; they are not an accredited proficiency assessment. Every word has a simple English definition and a complete example sentence containing that exact word.

The library supports level, length, progress, due-review and text/meaning filters, with course order, A–Z, shortest-first and longest-first sorting. It initially shows 24 matching words and can show more. All levels are freely available, including for adults who want to skip the foundations.

## Lesson flow

1. Read the meaning and example; hear the word and example when an English device voice is available.
2. Notice letter positions, memory groups and spelling guidance. Letter groups are not claimed to be syllables or phonemes. Selected tricky words receive specific notes; other words highlight repeated letters, suffix spellings or letter counts.
3. Fill a missing letter and correct any mistake.
4. Listen, cover and write the word. The heading does not disclose the target word. If audio is unavailable, Reveal / Cover supports visual recall. Use a physical or on-screen keyboard.
5. Complete the example sentence using the practised word, then save the lesson.

The course practises British spellings. Selected American/alternative forms are explicitly recognised as standard variants, with a reminder of the target form rather than a claim that the alternative is invalid English. Capitalisation is not assessed in spelling inputs; this is not a grammar checker or free-form writing course.

English meanings and examples are included for all 360 entries. Existing translated vocabulary meanings are available on request where a word matches the app's translated library. Full adult-dictionary Pashto/Urdu translation has not been added or claimed. English narration uses installed voices; no audio recordings are bundled.

## Saved progress

Each learner has an independent `adult` word record and an `adult` lesson checkpoint. Existing `word-N` child records are separate. Missed listen-and-write attempts enter the adult review list immediately. Correct attempts schedule revision after 1, 2, 4 and then up to 7 days. This is a simple practice schedule, not an adaptive proficiency assessment.

The lesson score preserves first attempts after correction. Typing accuracy counts actual listen-and-write submissions, including retries; missing-letter/context tasks are not mixed into that percentage. Lesson completion awards points once per word. Revisiting can record a new practice result without awarding duplicate completion points.

The most recently opened adult lesson's stages and checked answers survive reload and backup restore. Unsubmitted input and reveal state do not persist. Continue resumes unfinished work or finds an uncompleted word, including when someone started with the final word. Use separate learner profiles for different adults/children.

## Source and checks

- `src/ustad/adultContent.js`: editable words, definitions, examples, level descriptions and spelling notes.
- `src/ustad/AdultSpelling.jsx`, `adult.css`: library, level cards, filters, five-stage lessons, feedback and completion.
- `src/ustad/adultPractice.js`: typed attempts, revision scheduling, filters, continuation and strict backup validation.
- Existing `studyEngine.js` / `studyValidation.js`: saved adult lesson checkpoints and completion scoring.
- `src/ustad/adult.test.js`: whole-dataset checks, filters, scoring, revision, old backups, profile isolation and navigation bounds.
- `scripts/verify-adult-ui.mjs`: every word's lesson stages and completion, all language modes, main routes and light/dark rendering.

Run `npm test`, `node scripts/verify-adult-ui.mjs`, and `npm run build`. The generated offline manifest includes the adult course because its data, code and styles are bundled locally. Server-rendered checks do not replace actual keyboard, touch, voice and layout testing in a connected browser.
