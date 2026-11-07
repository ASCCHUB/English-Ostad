# Games (Play)

Written for: whoever maintains the app's content and code next.

## What is there

Five full games, each with **200 questions in 20 levels of 10**. Each level is played as two rounds of five, with a break and summary between them (1,000 questions total).

| Game | Teaches (in order) |
|---|---|
| Letter Hunt | uppercase → lowercase → big/small partners → letters in words → missing letters, before/after |
| Sound Safari | sound→letter → first sounds → last sounds → middle short vowels → blending CVC words |
| Feed the Animal | food and animal names → "Give the rabbit a carrot." → colours → quantities → action words → who eats what → two-step instructions |
| Number Adventure | counting → number↔group → number names → spelling number words → more/fewer/same → patterns → adding to 10 |
| Help Fox Find the Apple | names of things → colours → big/small → under/beside/behind/on/in/in front of → colour + place → true sentence → build the sentence |

Five more games are listed as **Coming soon** with no button: Word Builder, Missing Letter, Picture–Word Match, Sentence Builder, Story Detective. The original 3D Fox lessons are still reachable from the Fox level map ("Visit Fox's 3D garden"). The older short class games are under "Short class games" with their real question counts.

## Files

- `src/ustad/games/content/words.js`: word data (letters, sound groups, accurate animal–food pairs, numbers, Fox objects and positions).
- `src/ustad/games/content/pashto.js`: Pashto (approved lines plus drafts marked `check`).
- `scripts/build-game-bank.mjs` → `src/ustad/games/bank/*.json` (`npm run games:build`, deterministic).
- `src/ustad/games/validateBank.js`, `scripts/check-game-bank.mjs` (`npm run games:check`, also in `npm test`). These check that there are 200 questions per game, the 20×10 levels and 5+5 rounds are complete, keys and content are unique, the answer is among the choices, distractors are wrong and unambiguous (sounds differ, animals don't eat the wrong foods, exactly one Fox scene matches), every picture file and drawing exists, every sound points to a course recording slot, and no spoken text contains a phoneme.
- `src/ustad/games/progress.js`: progress rules (pure, tested in `src/ustad/games.test.js`).
- `GamesHome.jsx` (Play screen), `GameScreen.jsx` (levels, rounds, summary), `GameArt.jsx` + `art.js` (drawn icons, coloured items, Fox scenes), `games.css`.

## Progress rules

- Saved in `profile.games`, separately for each child and each game. It is checked on restore (`validateGames`) and kept in backups.
- Every answer is one of: **first** (right first try, no hint), **hint** (after a hint or one miss) or **shown** (after two misses the app demonstrates). Only *first* counts as learned on your own.
- An unfinished round is saved after every answer, so "Continue playing" resumes it.
- Finishing both rounds of a level unlocks the next level, once. Stars per round: 1 for finishing, +1 for 3 or more first-try answers, +1 for all 5. The best result is kept, so a replay adds only the improvement.
- A round with 2 or more helped answers offers a short **Review** round, clearly labelled. The level map also offers review from earlier mistakes.
- Normal rounds prefer unseen questions. Completed levels stay replayable. Grown-ups can open any level (17 × 4 check).

## Audio

English instructions and words use the device English voice. **Letter sounds play only from real recordings** (course recording slots, or a grown-up's home recordings). Until those exist, Sound Safari shows a key-word picture ("the sound at the start of 🔊 sun") instead of letting the device voice fake a phoneme. Pashto is text only, and its speaker stays hidden until a Lower Dir recording exists. The in-game ⚙ has Voice, Sound effects, Captions and Less motion.

## Pashto

All new Pashto is a draft. See `docs/GAMES-PASHTO-REVIEW.md`.
