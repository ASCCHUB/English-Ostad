# Little Explorers app design implementation

The six-screen presentation has been implemented as a responsive React experience. Live text, buttons, navigation, lessons and saved progress are separate from the generated illustration assets.

## Screens

- **Welcome** (`#/welcome`): floating-island artwork, fox/bunny/turtle, introduction, start and parent controls. First-visit introduction is remembered using `little-explorers-welcomed`.
- **Home** (`#/home`): learner-specific greeting, audio control, illustrated Continue card, functional ABC/Animals/Colors destinations, real daily goal, The Lost Star, and links to every original subject.
- **Learning journey** (`#/journey`): live lesson map with a dotted forest path, completion checks, current lesson and locked future stops. The map uses actual stored completion IDs, with a five-stop starter route. The full letter library remains accessible.
- **Letter lesson** (`#/alphabet/0`): five steps for each letter: see it, hear it, recognize it, say it, finish. Real progress indicator, letter/word audio, translation, recognition feedback, and saved completion. A uses Apple, B uses Ball, C uses Cat. Full tracing remains under Writing.
- **Games** (`#/games`): illustrated Match pairs, Sound safari, Word builder and Picture quiz cards launch working activities. Missing-letter practice, daily challenge, letter recognition and spelling remain available.
- **My Stars** (`#/progress`): real earned stars, completed activities, earned/goal badges, word review and practice history. Stars equal ten stored learning points. ABC Explorer needs five distinct letter lessons; Animal Friend needs five animal word cards; Story Star needs three stories. The presentation's example counts are not inserted into a child's progress.

The Lost Star is now a three-line multilingual story with vocabulary, audio and three comprehension questions. The story library has six stories. New support-language wording is draft and retains the existing native-review requirement.

## Compatibility

The `english-ustad-v1` progress key and existing word/completion IDs are retained. Existing learner nicknames, completed activities, words, results, levels and backups remain compatible. The new brand does not reset saved progress. Swat/Dir/Malakand Pashto copy and all language choices remain available. Phone navigation is Home / Learn / Play / My Stars, with a matching tablet/desktop sidebar.

`src/ustad/ExplorerScreens.jsx`, `ExplorerArt.jsx`, `explorerModel.js`, `explorerCopy.js` and `explorers.css` implement the new experience. The previous activity stylesheet provides base styles for retained learning exercises. Actual 3D artwork is stored in `public/explorers/`; image loading has a local SVG fox fallback. `output/design/little-explorers-app-art-prompts.txt` records the built-in generation prompts.

The production offline manifest includes all app illustrations. Its version incorporates illustration bytes, so changing artwork updates the offline cache too. The service worker serves cached illustration requests offline. The pack is larger because it includes full-quality character artwork; speech still depends on device voices.

## Validation

- 40 automated tests pass, including existing language, progress, quiz and backup checks, plus journey unlocks, earned badges, route parsing, old-profile compatibility, featured content and offline illustration requests.
- All six screens and retained learning areas pass React rendering checks in each support-language setting. The checks include the parent gate and the featured story. Render checks do not exercise browser effects or pointer interactions.
- The production build passes and generates a versioned manifest containing all illustration assets.
- Browser discovery reports no connected browser. Actual visual appearance, layout at phone widths, touch/canvas/drag behavior, browser back/forward events and speech output still need real-browser verification. No browser screenshot is claimed.

Run `npm test`, `node scripts/verify-ustad-ui.mjs`, `npm run build`, then `npm run preview -- --host 127.0.0.1`.
