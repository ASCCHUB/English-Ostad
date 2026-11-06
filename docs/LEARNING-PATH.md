# One learning path (approved 2026-10-28)

The source of truth is `src/ustad/learningPath.js`. Nothing was deleted: old content is extra practice inside the
matching class, or left off the map as a duplicate of a course lesson.

## 10 classes

| Class | Content | Opens |
|---|---|---|
| 1 | First Steps Level 1 (33 lessons) + 7 "Listen and say" topic units | from the start |
| 2 | Level 2 (26 lessons) + 5 reading topic units | after Class 1 (lesson by lesson) |
| 3 | Level 3 (28 lessons) + 5 reading topic units | after Class 2 |
| 4 | Levels 4–5 (23 lessons) + 5 sentence topic units | after Class 3 |
| 5–10 | Old adventure Classes 5–10, unchanged | after the 110-lesson course (or a grown-up unlocks, or the learner was placed there) |

## Old content → new place

| Old | New |
|---|---|
| Meet your friends, A/B/C, ABC review (path) | Duplicate of Class 1 letter lessons: off the map |
| Old Class 1: Colours, shapes & counting | Class 1 extra practice; Class 1 topic units |
| Old Class 1: Hello, new friends | Class 4 extra practice |
| Old Class 2: Animal picnic, My family & my day, My classroom & numbers | Class 1 extra practice; Class 1 topic units |
| Old Class 3: I am happy, Things I like | Class 4 extra practice |
| Old Class 3: This is a cat | Duplicate of L4-03: off the map |
| Old Class 4: Build a little word | Duplicate of Class 2: off the map |
| Old Class 4: A sentence, a little story; Questions we can ask | Class 4 extra practice |
| Old class reviews (Starter–Builder) | Off the map (the course reviews replace them); still open from the old trail |
| Alphabet (A–Z browser) | Class 1 extra practice ("All letters A–Z") |
| Word families (8) | Class 2 extra practice |
| Spelling school (185 words) | Class 2 and 3 extra practice: only words the child can read by the end of that class |
| Sentence workshop (21) | Readable by the end of Class 4 → Class 4; past/future → Class 6; the rest → Class 5 |
| Read & understand (12) | Readable by the end of Class 4 → Class 4; the rest → Class 5 |
| Story corner (6) | The Lost Star → Class 5; the other five → Class 4 if every line is readable, otherwise Class 5 |
| Picture words, Discover | Topics library |
| Adult spelling | Parent area → Adult mode |

"Readable" uses the course rule: decodable with sound patterns taught by then, or an exception word taught by then
(`readableBy` in `learningPath.js`).

## Games (25)

| Class | Games |
|---|---|
| 1 | Letter Hunt, Sound Safari, Feed the Animal, Number Adventure, Help Fox Find the Apple |
| 2 | Word Train |
| 3 | Color Garden |
| 4 | Sentence Builder, Story Detective, Everyday English |
| 6 | Time Machine, Compare Contest, Future Planner |
| 7 | Have You Ever?, Reason Bridge, Advice Desk |
| 8 | Meanwhile, Who/Which/Where, Polite Pro |
| 9 | What If?, News Desk, Message Relay |
| 10 | Idiom Island, Debate Club, Tense Detective |

The Play page shows only games for the current and completed classes.

## Navigation

Bottom bar: **Learn** (greeting, one big Continue, the 10-class map) · **Topics** · **Play** · **My Stars**.
Top bar: language, theme, parent area (settings, recordings, Adult mode).

## Topics

12 topics: colours, numbers 1–20, shapes, days, months, family, body, animals, food, clothes, weather, school.
Not yet reached = listen only (picture, English audio, Pashto meaning, say it). Reached = listen + games.
A word is printed for reading only when `readableBy` allows it at that point. New Pashto (shapes, numbers 11–20,
days, months, bottom-bar labels) is a draft marked check.
