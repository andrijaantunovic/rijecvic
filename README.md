# Riječvić [➡️ Play here](https://andrijaantunovic.github.io/rijecvic/)

Riječvić is my take on a Wordle clone for Croatian language.

## Current features
* Responsive - sizes adequately for portrait screens like smartphones and tablets
* Full on-screen keyboard and full physical keyboard support (including backspace, arrow keys, home/end keys, and Esc to restart with a new word)
* Specific tiles (letters) can be selected by clicking/tapping on them
* Just like original Wordle, entire game is written in JavaScript and runs client-side
* Two arrays ("databases") for words: a larger one for words which are accepted as guesses, and a smaller one from which challenge words are picked (challenge pool)
* Challenge words are picked manually by me from the larger database (not complete)
* Handles Croatian digraphs (dž, lj, nj) properly
  * Database contains words with digraphs (they are stored as a single UNICODE character)
  * On-screen keyboard has dedicated keys for digraphs
  * When typing from a physical keyboard, D+Ž, L+J and N+J sequences are recognized and combined into a single character
  * When displayed on screen (either in letter tiles, keyboard, or in a message), digraphs are converted to two ordinary characters (to prevent them from being displayed as a rectangle in case the user doesn't have a compatible font)

Words come from projects [rjecnik-hrvatskih-jezika](https://github.com/gigaly/rjecnik-hrvatskih-jezika) and [hunspell-hr](https://github.com/krunose/hunspell-hr)

## Planned features (ToDo)
* Expanding the challenge pool
* Help / how to play
* Display word ID
* Play a specific word by ID
* The copy-as-emojis-to-share-on-twitter thing
* 4, 6 & 7 letter variants (maybe?)

### Current bugs
* Typing a digraph with keyboard combination into second-to-last tile doesn't work if the last tile already contains a letter
* Message timeout sometimes doesn't work in mobile browsers?

---
### You can play Riječvić [HERE](https://andrijaantunovic.github.io/rijecvic/) (GitHub Pages)
---

Known "competitors" at the time of writing :)
* [Riječek](https://kveez.com/hr/rijecek/) (no keyboard input, one word per day)
* [Crodle](https://www.learncroatian.eu/crodle) (treats digraphs as separate letters, one word per day)
* [Rječkaš?](https://www.rjeckas.com/) (one word per day)
* [Wordle.hr](https://wordle.hr/) (treats digraphs as separate letters, one word per day)

(from [Wordles of the World](https://rwmpelstilzchen.gitlab.io/wordles/#contact))
