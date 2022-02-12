# Riječvić [➡️ Play here](https://andrijaantunovic.github.io/rijecvic/)

Riječvić is my take on a Wordle clone for Croatian language.

## Current features
* Just like the original Wordle, the entire game is written in JavaScript and runs client-side (no backend)
* Responsive - sizes adequately for portrait screens (smartphones and tablets)
* Full on-screen keyboard and full physical keyboard support (including backspace, Esc to clear input, arrow keys, home/end keys)
* Specific tiles (letters) can be selected by clicking/tapping on them
* Two arrays ("databases") for words: a larger one for words which are accepted as guesses, and a smaller one from which challenge words are picked (challenge pool)
* Challenge words are picked manually by me from the larger database (not complete)
* Handles Croatian digraphs (dž, lj, nj) properly (they provided a unique challenge that I wanted to tackle, which is why I decided to create a Croatian Wordle clone instead of an English one)
  * Digraphs are stored as *Latin Extended-B* UNICODE characters and treated as a single letter
  * On-screen keyboard has dedicated keys for digraphs
  * When typing from a physical keyboard, D+Ž, L+J and N+J sequences are recognized and combined into a single tile
  * Because not many fonts support them, wherever they are displayed to the user, digraphs are "ASCIIfied" ie. converted to two ordinary characters
* Each game result is saved to Local storage, which will be used to display statistics
* Currently running game is also saved to Local storage on every action, which makes it possible to refresh or close the browser and come back later to resume playing from the same state. This also ensures that every "new game" is counted in statistics as a loss for the current unfinished game (ie. giving up on a word isn't possible by simply refreshing the browser). Of course, with this being a client-side game, it's impossible to prevent all "cheating", but **with a couple of preconditions** (user never clears or modifies the Local storage and doesn't cheat using DevTools/dev console or looking at or changing the source code) the game should be resistant to exploits (either intentional or accidental).

Dictionary is based on projects [rjecnik-hrvatskih-jezika](https://github.com/gigaly/rjecnik-hrvatskih-jezika) and [hunspell-hr](https://github.com/krunose/hunspell-hr)

## Planned features (ToDo)
* Displaying statistics and game history
* Expanding the challenge pool
* Help / how to play
* Play a specific word by ID
* The copy-as-emojis-to-share-on-twitter thing
* 4/6/7 letter variants (maybe?)
* Rework responsive design (maybe using a formula that takes screen aspect ratio into account and scales the interface smoothly instead of having several predefined media queries)

---
### You can play Riječvić [HERE](https://andrijaantunovic.github.io/rijecvic/) (GitHub Pages)
---

Known "competitors" at the time of writing :)
* [Riječek](https://kveez.com/hr/rijecek/) (no keyboard input, one word per day)
* [Crodle](https://www.learncroatian.eu/crodle) (treats digraphs as separate letters, one word per day)
* [Rječkaš?](https://www.rjeckas.com/) (one word per day)
* [Wordle.hr](https://wordle.hr/) (treats digraphs as separate letters, one word per day)

(from [Wordles of the World](https://rwmpelstilzchen.gitlab.io/wordles/#contact))
