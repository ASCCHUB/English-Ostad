# Phase 1 review package

**Approval draft only. Phase 2 has not started. The app is unchanged by this package.**

Start with [the structured curriculum](curriculum.md). The [complete JSON](curriculum.json) is the machine-readable companion, not yet imported by the app.

| Level | Core lessons, including reviews | Main outcome |
|---|---:|---|
| 1: Letters and sounds | 32 | A–Z forms/names, systematic sound order, six cumulative reviews and early modeled blending |
| 2: Blending and first words | 8 | Read short regular words; explicitly learn I, a, the and is |
| 3: Spelling words | 22 | Consonant digraphs, common vowel patterns, adjacent consonants, split digraphs, endings and familiar exception print |
| 4: Phrases and simple sentences | 10 | Build phrases, introductions, descriptions, likes, requests and questions |
| 5: Reading and everyday English | 7 | Understand short stories, order events, complete conversations and build a sentence independently |

Total: **79 lessons, 153 independent word entries, five fully scripted sample lessons, 364 pending recording entries**. Picture vocabulary has a separate oral-introduction registry. These counts describe this deliberately bounded beginner course, not the existing app's entire vocabulary.

Other files:

- [Audio manifest](audio-manifest.json): English letter names, pure sounds/sequences, words/sentences, and Pashto scripts; no recordings or timing alignment exist yet.
- [Recording spreadsheet data](audio-recording-list.csv): the same recording entries for voice artists and reviewers, with UTF-8 Pashto text.
- [Review checklist and sign-off](review-checklist.md): native English, phonics, Lower Dir Pashto and audio review.
- [Design validator](validate-design.mjs): run `node docs/beginner-course-phase1/validate-design.mjs` from this project root. It checks the lesson/unit sequence, independent print word references, declared sound mappings, spellings, activity variety, five-item gates, sample durations, pending review/recording status and referenced recording IDs. It cannot validate native pronunciation, natural Pashto, child comprehension or real app behavior.

## Decisions for Phase 1 approval

1. Keep the alphabet browser in A–Z order, but teach sounds in the specified cumulative order starting s, a, t, p, i.
2. Apply “no untaught sounds” to independent decoding and scored print. Modeled oral picture names and letter names are a separate strand; otherwise a first-letter apple picture cue would be impossible before P/L and the weak final syllable. Hide untaught picture-word labels.
3. Use the existing app's Lower Dir polite-plural style as the drafting baseline, with every new line still pending native approval.
4. Use a consistent British phonics model with documented accent flexibility and explicit exception parts.
5. Interpret “no random-tap passing” as correct first-response scoring, constructed output, fresh retry forms and no Continue-to-pass. A finite choice quiz cannot guarantee zero chance success.

The independent print audit passes. The content is **not native-approved**, audio is **not recorded**, and this is **not a claim of app acceptance-test completion**. Explicit user approval of Phase 1 is required before any Phase 2 implementation.
