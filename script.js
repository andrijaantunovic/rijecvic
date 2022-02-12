let lastColumnIfLastActionWasTypeLetterElseUndefined // still here, still ugly...

let currentGame

class HistoricalEntry {
    constructor(startTime, wordId, word, result, tryy, guesses) {
        this.startTime = startTime,
        this.endTime = new Date().toISOString(),
        this.wordId = wordId,
        this.word = word,
        this.result = result,
        this.try = tryy
        this.guesses = guesses
    }
}

class Game {

    maxTries
    wordLength
    challengeWordId
    challengeWord
    rows = []
    draft = []
    currentRow
    currentCol
    running = false
    restoring = false
    startTime

    initBoard() {

        let board = document.getElementById('board')
        board.replaceChildren()
        
        for (let row = 0; row < this.maxTries; row++) {
    
            let tileRow = document.createElement('div')
            tileRow.classList.add('tile-row')
    
            for (let t = 0; t < this.wordLength; t++) {
                let tile = document.createElement('div')
                tile.classList.add('tile')
                tile.dataset.letter = ''
                tile.addEventListener('click', function() {
                    if (currentGame.running && row == currentGame.currentRow)
                        currentGame.moveTo(t)
                    lastColumnIfLastActionWasTypeLetterElseUndefined = undefined
                })
                tileRow.appendChild(tile)
            }
            board.appendChild(tileRow)
        }
    }

    initNew(maxTries, wordLength, wordId) {

        this.maxTries = maxTries
        this.wordLength = wordLength
        this.rows = new Array(maxTries).fill(null)
        this.draft = new Array(wordLength).fill(null)
        this.currentRow = 0
        this.currentCol = 0

        this.initBoard()
        initOnscreenKeyboard()

        if (wordId === undefined) {
            const gameHistory = loadGameHistoryFromLocalStorage()
            do {
                this.challengeWordId = Math.floor(Math.random() * challengeWords[wordLength].length) + 10000*wordLength
                this.challengeWord = challengeWords[wordLength][this.challengeWordId-10000*this.wordLength].toUpperCase()
            } while (gameHistory && gameHistory.length*1.5 <= challengeWords[wordLength].length && gameHistory.some(g => g.word == this.challengeWord))
        } else {
            this.challengeWordId = wordId
            this.challengeWord = challengeWords[wordLength][this.challengeWordId-10000*this.wordLength].toUpperCase()
        }
        document.getElementById('word-id').innerText = '#' + this.challengeWordId

        this.startTime = new Date().toISOString()
        displayMessage('Započeta je nova igra. Sretno!', 'unused', 1500)

        this.running = true
        this.moveTo(0, 0)
    }

    restoreFromLocalStorage() {
        
        const savedGameJson = localStorage.getItem('rijecvic.saved')
        if (savedGameJson == null)
            return false

        const savedGame = JSON.parse(savedGameJson)

        this.restoring = true
        
        this.maxTries = savedGame.maxTries
        this.wordLength = savedGame.wordLength
        this.challengeWordId = savedGame.challengeWordId
        document.getElementById('word-id').innerText = '#' + this.challengeWordId
        this.challengeWord = savedGame.challengeWord
        this.startTime = savedGame.startTime

        this.initBoard()
        initOnscreenKeyboard()

        this.currentRow = 0
        this.currentCol = 0
        savedGame.rows.forEach((row, i) => {
            if (row) {
                this.rows[i] = row
                this.writeRow(row.split(''))
            }
        })
        this.moveTo(savedGame.currentCol)
        this.draft = new Array(this.wordLength).fill(null)
        savedGame.draft.forEach((letter, i) => {
            this.write(letter, i)
        })

        displayMessage('Nastavljamo spremljenu igru. Sretno!', 'yellow', 3000)
        this.restoring = false
        
        this.running = true

        return true
    }

    lastCol() {
        return this.currentCol >= this.wordLength
    }

    saveGameStateToLocalStorage() {
        if (this.restoring)
            return
        localStorage.setItem('rijecvic.saved', JSON.stringify(this))
    }

    moveTo(column, row = this.currentRow) {
        if (!this.running && !this.restoring) return

        if (column >= 0 && column < this.wordLength) {
            const tileMovingFrom = getTile(this.currentRow, this.currentCol)
            const tileMovingTo = getTile(row, column)
            this.currentCol = column
            this.currentRow = row
            tileMovingFrom.classList.remove('current')
            tileMovingTo.classList.add('current')
            this.saveGameStateToLocalStorage()
        }
    }
    moveLeft()    { this.moveTo(this.currentCol-1)    }
    moveRight()   { this.moveTo(this.currentCol+1)    }
    moveHome()    { this.moveTo(0)                    }
    moveEnd()     { this.moveTo(this.wordLength-1)    }
    moveNextRow() { this.moveTo(0, this.currentRow+1) }

    removeCursorFrame() {
        getTile(this.currentRow, this.currentCol).classList.remove('current')
    }

    write(letter, column = this.currentCol) {
        if (!this.running && !this.restoring) return

        this.draft[column] = letter ? letter : null
        setTile(this.currentRow, column, letter ? letter : '')
        this.saveGameStateToLocalStorage()
    }

    delete() {
        if (!this.running) return

        if (this.draft[this.currentCol] == null)
            this.moveLeft()
        this.draft[this.currentCol] = null
        setTile(this.currentRow, this.currentCol, '')
        this.saveGameStateToLocalStorage()
    }

    clear() {
        if (!this.running) return

        this.draft.forEach(d => d = '')
        for (let c = 0; c < this.wordLength; c++) {
            this.draft[c] = null
            setTile(this.currentRow, c, '')
        }
        this.moveTo(0)
        this.saveGameStateToLocalStorage()
    }

    submitWord() {
        if (!this.running) return

        if (this.draft.some(c => c == null)) {
            displayMessage('Upišite cijelu riječ!', 'yellow', 1500)
            return
        }
        const guess = this.draft.join('')
        if (!dictionary[this.wordLength].includes(guess)) {
            displayMessage(`Riječ ${guess} ne postoji u rječniku!`, 'yellow', 2500)
            return
        }

        this.rows[this.currentRow] = guess
        const draftCopy = [...this.draft]
        this.draft.fill(null)
        this.writeRow(draftCopy)
    }

    writeRow(letters) {
        let comparingWord = this.challengeWord.split('')

        letters.forEach((letter, i) => {
            if (letter == comparingWord[i]) {
                setTile(this.currentRow, i, letter, 'green')
                comparingWord[i] = '!'
            }
        })
        letters.forEach((letter, i) => {
            if (letter && comparingWord[i] != '!') {
                const ci = comparingWord.indexOf(letter)
                if (ci > -1) {
                    setTile(this.currentRow, i, letter, 'yellow')
                    comparingWord[ci] = '?'
                } else {
                    setTile(this.currentRow, i, letter, 'gray')
                }
            }
        })

        if (comparingWord.every(c => c == '!'))
            this.win()
        else if (this.currentRow == this.maxTries-1)
            this.lose()
        else {
            this.moveNextRow()
            this.saveGameStateToLocalStorage()
        }
    }

    win() {
        displayMessage(`Bravo, pogodili ste riječ u ${this.currentRow+1}. pokušaju!`, 'green')
        this.completion('won')
    }

    lose() {
        displayMessage(`Niste pogodili riječ u ${this.maxTries} pokušaja. Tražena riječ bila je ${asciify(this.challengeWord)}.`, 'yellow')
        this.completion('lost')
    }

    abort() {
        if (!this.running || this.currentRow <= 0)
            return
        this.completion('aborted')
    }

    completion(result) {

        this.removeCursorFrame()
        this.running = false

        const gameHistory = loadGameHistoryFromLocalStorage()
        const gameStats = loadGameStatsFromLocalStorage()

        gameHistory.push(new HistoricalEntry(this.startTime, this.challengeWordId, this.challengeWord, result, this.currentRow, this.rows))

        if (gameHistory.length > 250)
            gameHistory.shift()

        gameStats.played++
        if (result == 'won') {
            gameStats.won++
            gameStats.currentStreak++
            if (gameStats.currentStreak > gameStats.maxStreak)
                gameStats.maxStreak = gameStats.currentStreak
            gameStats.dist[this.currentRow]++
        } else if (result == 'lost') {
            gameStats.lost++
            gameStats.currentStreak = 0
        } else if (result == 'aborted') {
            gameStats.aborted++
            gameStats.currentStreak = 0
        }
        gameStats.winRate = gameStats.won / gameStats.played

        updateGameHistoryInLocalStorage(gameHistory)
        updateGameStatsInLocalStorage(gameStats)
        clearSavedGameFromLocalStorage()
    }

}



// -------- ON WEBSITE LOAD --------

document.addEventListener('DOMContentLoaded', function () {

    convertDeprecatedLocalStorage()

    document.getElementById('new').addEventListener('click', () => newGame())
    initPhysicalKeyboard()

    currentGame = new Game()

    if (!currentGame.restoreFromLocalStorage())
        currentGame.initNew(6, 5)
    
}, false)



// -------- INTIALIZE PHYSICAL KEYBOARD --------

function initPhysicalKeyboard() {

    const keyLetterCodes = {
        'KeyE': 'E', 'KeyR': 'R', 'KeyT': 'T', 'KeyY': 'Z', 'KeyU': 'U', 'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P', 'BracketLeft': 'Š', 'BracketRight': 'Đ',
        'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L', 'Semicolon': 'Č', 'Quote': 'Ć', 'Backslash': 'Ž',
        'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B', 'KeyN': 'N', 'KeyM': 'M'
    }
    const keySpecialCodes = {
        'Backspace': 'delete', 'Enter': 'enter', 'Escape': 'clear', 'F9': 'new',
        'ArrowLeft': 'moveLeft', 'ArrowRight': 'moveRight', 'Space': 'moveRight', 'Home': 'home', 'End': 'end'
    }

    document.addEventListener('keydown', function (e) {

        if ((!currentGame || !currentGame.running) && e.code != 'F9')
            return

        if (e.code == 'Enter' || e.code == 'Space')
            e.preventDefault()

        if (e.code in keyLetterCodes)
            typedLetter(keyLetterCodes[e.code])
        else if (e.code in keySpecialCodes)
            clickedOrTypedSpecial(keySpecialCodes[e.code])
    });
}



// -------- ON-SCREEN KEYBOARD --------

function initOnscreenKeyboard() {
    const keys = ['<ERTZUIOPŠĐ', 'ASDFGHJKLČĆŽ', ' ǄCVBNMǇǊ>']
    
    const keyboard = document.getElementById('keyboard')
    keyboard.replaceChildren()

    keys.forEach(r => {
        
        const row = document.createElement('div')
        row.classList.add('row')

        r.split('').forEach(c => {
            let key
            if (c == '<')
                key = createOnScreenKey('delete-key', ['key', 'delete-key'], 'BRIŠI', () => clickedOrTypedSpecial('delete'))
            else if (c == '>')
                key = createOnScreenKey('enter-key', ['key', 'enter-key'], 'ENTER', () => clickedOrTypedSpecial('enter'))
            else if (c != ' ')
                key = createOnScreenKey('key' + c, ['key'], asciify(c), () => clickedLetter(c))
            else
                key = createOnScreenDummyKey()

            row.appendChild(key)
        })

        keyboard.appendChild(row)
    });
}

function createOnScreenKey(id, classes, text, onclick) {
    let key = document.createElement('button')
    key.id = id
    key.classList.add(...classes)
    key.innerHTML = text
        key.addEventListener('click', onclick)
    key.dataset.color = 'unused'
    return key
}

function createOnScreenDummyKey() {
    let key = document.createElement('button')
    key.style.visibility = 'hidden'
    return key
}

function paintKey(letter, color) {
    let key = document.getElementById('key' + letter)
    if (key.dataset.color == 'green')
        return
    if (key.dataset.color == 'yellow' && color == 'green')
        key.dataset.color = 'green'
    else if (key.dataset.color == 'unused')
        key.dataset.color = color
}


// -------- TILE MANIPULATION --------

function getTile(row, col) {
    return document.getElementById('board').children.item(row).children.item(col)
}

function setTile(row, column, letter, color) {
    const tile = getTile(row, column)
    tile.dataset.letter = letter
    tile.innerHTML = asciify(letter)
    if (color) {
        tile.dataset.color = color
        paintKey(letter, color)
    }
}



// -------- EVENTS --------

function clickedLetter(letter) {
    if (!currentGame || !currentGame.running) return

    lastColumnIfLastActionWasTypeLetterElseUndefined = undefined

    insertLetter(letter)
}

function typedLetter(letter) {
    if (!currentGame || !currentGame.running) return

    if (lastColumnIfLastActionWasTypeLetterElseUndefined !== undefined) {

        const firstLetter = getTile(currentGame.currentRow, lastColumnIfLastActionWasTypeLetterElseUndefined).dataset.letter
        if (firstLetter == 'D' && letter == 'Ž') {
            currentGame.write('Ǆ', lastColumnIfLastActionWasTypeLetterElseUndefined)
            return
        } else if (firstLetter == 'L' && letter == 'J') {
            currentGame.write('Ǉ', lastColumnIfLastActionWasTypeLetterElseUndefined)
            return
        } else if (firstLetter == 'N' && letter == 'J') {
            currentGame.write('Ǌ', lastColumnIfLastActionWasTypeLetterElseUndefined)
            return
        }
    }

    lastColumnIfLastActionWasTypeLetterElseUndefined = currentGame.currentCol;

    insertLetter(letter)
}

function insertLetter(letter) {
    currentGame.write(letter)
    currentGame.moveRight()
}

function clickedOrTypedSpecial(what) {

    lastColumnIfLastActionWasTypeLetterElseUndefined = undefined

    if (what == 'new') {
        newGame()
        return
    }

    if (!currentGame.running)
        return

    if (what == 'delete')
        currentGame.delete()
    else if (what == 'clear')
        currentGame.clear()
    else if (what == 'moveLeft')
        currentGame.moveLeft()
    else if (what == 'moveRight')
        currentGame.moveRight()
    else if (what == 'home')
        currentGame.moveHome()
    else if (what == 'end')
        currentGame.moveEnd()
    else if (what == 'enter')
        currentGame.submitWord()
}

function newGame() {
    currentGame.abort()
    currentGame = new Game()
    currentGame.initNew(6, 5)
}

// -------- ASCIIFY --------

function asciify(string) {
    if (!string)
        return ''
    
    const replacements = { 'Ǉ':'LJ', 'Ǌ':'NJ', 'Ǆ':'DŽ' }

    for (const r in replacements) {
        string = string.replace(r, replacements[r])
    }
    return string
}



// -------- MESSAGE DISPLAY FUNCTIONS --------

let timerId

function displayMessage(message, color, timeout) {
    clearTimeout(timerId)

    document.getElementById('message').innerText = message
    document.getElementById('message-container').dataset.color = color

    if (timeout)
        timerId = setTimeout(hideMessage, timeout)
}

function hideMessage() {
    document.getElementById('message').innerText = ''
    delete document.getElementById('message-container').dataset.color
}



// -------- LOCAL STORAGE HELPER FUNCTIONS --------

function loadGameHistoryFromLocalStorage() {
    const historyJson = localStorage.getItem('rijecvic.history')
    if (historyJson)
        return JSON.parse(historyJson)
    else
        return []
}

function loadGameStatsFromLocalStorage() {
    const statsJson = localStorage.getItem('rijecvic.stats')
    if (statsJson)
        return JSON.parse(statsJson)
    else
        return {
            'played': 0,
            'won': 0,
            'lost': 0,
            'aborted': 0,
            'winRate': 0.00,
            'currentStreak': 0,
            'maxStreak': 0,
            'dist': [0,0,0,0,0,0]
        }
}

function updateGameHistoryInLocalStorage(gameHistory) {
    localStorage.setItem('rijecvic.history', JSON.stringify(gameHistory))
}

function updateGameStatsInLocalStorage(gameStats) {
    localStorage.setItem('rijecvic.stats', JSON.stringify(gameStats))
}

function clearSavedGameFromLocalStorage() {
    localStorage.removeItem('rijecvic.saved')
}

function convertDeprecatedLocalStorage() {
    if (localStorage.getItem('rijecvic') != null) {

        const legacyObject = JSON.parse(localStorage.getItem('rijecvic'))
        localStorage.setItem('rijecvic.stats', JSON.stringify(legacyObject.stats))
        legacyObject.history.forEach(h => {
            if (h.result == 'win')
                h.result = 'won'
            h.startTime = null
            h.endTime = h.time
            delete h.time
            h.guesses = null
        })
        localStorage.setItem('rijecvic.history', JSON.stringify(legacyObject.history))
        localStorage.removeItem('rijecvic')
    }
}

function cheat() {
    return currentGame.challengeWord
}
