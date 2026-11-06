# Automatic starting-level check

New learners enter Find my level from guest setup or after a new nickname is added. Home also has a Find my level / Resume my check / See my level entry. The route is #/level-check.

The adaptive check contains five stages of five questions: letters and first words; short words; spelling and word patterns; sentences; short-story comprehension. It starts with the easiest stage, advances after at least four correct answers including the typed answer, and stops at the first stage needing practice. It therefore takes 5?25 questions, without a timer. Learners may skip a question or choose to begin at Level 1 without taking the check.

Finishing saves the recommendation and immediately opens the first lesson of the recommended First Steps level. No lessons are marked completed and no XP or stars are granted. Level 5 is the highest recommendation even after all questions are correct. This is a starting-point screen, not a CEFR, pronunciation, listening, or speaking assessment.

Each learner has an independent versioned checkpoint, including submitted answers and the current typed draft. Existing local progress backups include the checkpoint and result. Recommendation and course placement are recomputed and validated from answers on restore; out-of-order completion and mismatched destination data are rejected. Retaking the check keeps completed lessons and scores.

The answer buttons shuffle consistently per learner. Typed questions use the shared QWERTY keyboard; sentence questions check capitals and the full stop. Correct answers are not shown during testing. English questions have Pakistani Pashto instruction support.

Implementation: src/ustad/startingAssessment.js (bank/scoring/validation), StartingAssessment.jsx (flow), startingAssessment.css, firstSteps/state.js (placement validation), engine.js (backup field), App.jsx (newcomer and destination routing).

Active application installation: C:/Users/sajid/Downloads/project/ENGLISH OSTAD. The current workspace contains the feature source and installer scripts/install-starting-assessment.mjs. Original course content, answer keys, scores and completion records are preserved.
