const maxTries = 6
const wordLength = 5
let gameRunning = false
let challengeWordId
let challengeWord
let currentRow
let currentCol
let lastColumnIfLastActionWasTypeLetterElseUndefined
let localStorageObject = {
    'stats': {
        'played': 0,
        'won': 0,
        'lost': 0,
        'aborted': 0,
        'winRate': 0.00,
        'currentStreak': 0,
        'maxStreak': 0,
        'dist': [0,0,0,0,0,0]
    },
    'history': []
}

document.addEventListener('DOMContentLoaded', function () {

    if (localStorage.getItem('rijecvic') == null) {
        updateLocalStorage()
    }
    localStorageObject = JSON.parse(localStorage.getItem('rijecvic'))

    document.getElementById('new').addEventListener('click', () => startGame())
    initPhysicalKeyboard()
    startGame()
}, false)

function updateLocalStorage(result) {
    if (result !== undefined) {
        localStorageObject.history.push({
            'time': new Date().toISOString(),
            'wordId': challengeWordId,
            'word': challengeWord,
            'result': result,
            'try': currentRow+1
        })

        if (localStorageObject.history.length > 100)
            localStorageObject.history.shift()
    
        const stats = localStorageObject.stats
        stats.played++
    
        if (result == 'win') {
            stats.won++
            stats.currentStreak++
            if (stats.currentStreak > stats.maxStreak)
                stats.maxStreak = stats.currentStreak
            stats.dist[currentRow]++
        } else if (result == 'lost') {
            stats.lost++
            stats.currentStreak = 0
        } else if (result == 'aborted') {
            stats.aborted++
            stats.currentStreak = 0
        }
        stats.winRate = stats.won / stats.played
    }

    localStorage.setItem('rijecvic', JSON.stringify(localStorageObject))
}

function asciify(string) {
    const replacements = { 'Ǉ':'LJ', 'Ǌ':'NJ', 'Ǆ':'DŽ' }

    for (const r in replacements) {
        string = string.replace(r, replacements[r])
    }
    return string
}

function initPhysicalKeyboard() {

    const keyLetterCodes = {
        'KeyE': 'E', 'KeyR': 'R', 'KeyT': 'T', 'KeyY': 'Z', 'KeyU': 'U', 'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P', 'BracketLeft': 'Š', 'BracketRight': 'Đ',
        'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L', 'Semicolon': 'Č', 'Quote': 'Ć', 'Backslash': 'Ž',
        'KeyX': 'Ǆ', 'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B', 'KeyN': 'N', 'KeyM': 'M', 'Comma': 'Ǉ', 'Period': 'Ǌ',
    }
    const keySpecialCodes = {
        'Backspace': 'delete', 'Enter': 'enter', 'Escape': 'clear',  'F9': 'new',
        'ArrowLeft': 'moveLeft', 'ArrowRight': 'moveRight', 'Home': 'home', 'End': 'end'
    }

    document.addEventListener('keydown', function (e) {

        if (!gameRunning && e.code != 'Escape')
            return

        if (e.code == 'Enter' || e.code == 'Space')
            e.preventDefault()

        if (e.code in keyLetterCodes)
            typedLetter(keyLetterCodes[e.code])
        else if (e.code in keySpecialCodes)
            clickedOrTypedSpecial(keySpecialCodes[e.code])
    });
}

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

function initBoard() {

    let board = document.getElementById('board')
    board.replaceChildren()
    
    for (let row = 0; row < maxTries; row++) {

        let tileRow = document.createElement('div')
        tileRow.classList.add('tile-row')

        for (let t = 0; t < wordLength; t++) {
            let tile = document.createElement('div')
            tile.classList.add('tile')
            tile.addEventListener('click', function() {
                if (gameRunning && row == currentRow)
                    setCursor(row, t)
                lastColumnIfLastActionWasTypeLetterElseUndefined = undefined
            })
            tileRow.appendChild(tile)
        }
        board.appendChild(tileRow)
    }
}

function clickedLetter(letter) {
    if (!gameRunning) return

    lastColumnIfLastActionWasTypeLetterElseUndefined = undefined

    insertLetter(letter)
}

function typedLetter(letter) {
    if (!gameRunning) return

    if (lastColumnIfLastActionWasTypeLetterElseUndefined !== undefined) {
        const firstLetter = getTile(currentRow, lastColumnIfLastActionWasTypeLetterElseUndefined).dataset.letter
        if (firstLetter == 'D' && letter == 'Ž') {
            writeTile(currentRow, lastColumnIfLastActionWasTypeLetterElseUndefined, 'Ǆ')
            return
        } else if (firstLetter == 'L' && letter == 'J') {
            writeTile(currentRow, lastColumnIfLastActionWasTypeLetterElseUndefined, 'Ǉ')
            return
        } else if (firstLetter == 'N' && letter == 'J') {
            writeTile(currentRow, lastColumnIfLastActionWasTypeLetterElseUndefined, 'Ǌ')
            return
        }
    }

    lastColumnIfLastActionWasTypeLetterElseUndefined = currentCol;

    insertLetter(letter)
}

function insertLetter(letter) {
    writeTile(currentRow, currentCol, letter)

    if (currentCol < wordLength-1)
        setCursor(currentRow, currentCol+1)
}

function clickedOrTypedSpecial(what) {

    lastColumnIfLastActionWasTypeLetterElseUndefined = undefined

    if (what == 'new') {
        startGame()
        return
    }

    if (!gameRunning)
        return

    if (what == 'delete') {
        if (currentCol > 0 && currentCol <= wordLength-1 && getTile(currentRow, currentCol).dataset.letter == '')
            setCursor(currentRow, currentCol-1)
        writeTile(currentRow, currentCol, '')
    } else if (what == 'clear') {
        for (let c = 0; c < wordLength; c++) {
            writeTile(currentRow, c, '')
        }
        setCursor(currentRow, 0)
    } else if (what == 'moveLeft') {
        if (currentCol > 0)
            setCursor(currentRow, currentCol-1)
    } else if (what == 'moveRight') {
        if (currentCol < wordLength-1)
            setCursor(currentRow, currentCol+1)
    } else if (what == 'home') {
        setCursor(currentRow, 0)
    } else if (what == 'end') {
        setCursor(currentRow, wordLength-1)
    } else if (what == 'enter') {
        submitWord()
    }
}

function startGame() {

    lastColumnIfLastActionWasTypeLetterElseUndefined = undefined
    initBoard()
    initOnscreenKeyboard()

    if (gameRunning && currentRow > 0)
        updateLocalStorage('aborted')

    challengeWordId = Math.floor(Math.random() * challengeWords5.length)
    challengeWord = challengeWords5[challengeWordId].toUpperCase()
    challengeWordId += 50000
    document.getElementById('word-id').innerText = '#' + challengeWordId

    currentCol = 0
    currentRow = 0
    setCursor(0, 0)
    
    displayMessage('Započeta je nova igra. Sretno!', 'unused', 1500)

    gameRunning = true;
}

function submitWord() {

    let guess = ''

    for (let c = 0; c < wordLength; c++) {
        const tile = getTile(currentRow, c);
        const letter = tile.dataset.letter;
        if (letter === undefined || letter == '') {
            displayMessage('Upišite cijelu riječ!', 'yellow', 1500)
            return
        }

        guess += letter
    }

    if (!dictionary.includes(guess)) {
        displayMessage(`Riječ ${asciify(guess)} ne postoji u rječniku!`, 'yellow', 2500)
        return
    }

    const result = writeTileRow(currentRow, guess, challengeWord)

    if (result == 'win') {
        gameRunning = false
        displayMessage(`Bravo, pogodili ste riječ u ${currentRow+1}. pokušaju!`, 'green') //TODO: 🟩🟨⬛
    } else if (result == 'lost') {
        gameRunning = false
        displayMessage(`Niste pogodili riječ u ${maxTries} pokušaja. Tražena riječ bila je ${asciify(challengeWord)}.`, 'yellow')
    }

    if (result == 'win' || result == 'lost') {
        updateLocalStorage(result)
    }

    setCursor(currentRow+1, 0)
}

function setCursor(row, col) {

    getTile(currentRow, currentCol).classList.remove('current')
    
    if (row >= maxTries) {
        gameRunning = false
        currentCol = 0
        currentRow = 0
        return
    }
    
    currentRow = row
    currentCol = col
    getTile(currentRow, currentCol).classList.add('current')
}


function getTile(row, col) {
    return document.getElementById('board').children.item(row).children.item(col)
}

function writeTile(row, col, character, color) {
    let tile = getTile(row,col)
    tile.innerHTML = asciify(character)
    tile.dataset.letter = character

    if (typeof color !== 'undefined') {
        tile.dataset.color = color
        paintKey(character, color)
    }
}

function paintKey(character, color) {
    let key = document.getElementById('key' + character)
    if (key.dataset.color == 'green')
        return
    if (key.dataset.color == 'yellow' && color == 'green')
        key.dataset.color = 'green'
    else if (key.dataset.color == 'unused')
        key.dataset.color = color
}

function writeTileRow(row, string, correctString) {

    if (typeof correctString === 'string') {
        correctString = correctString.split('')
    }

    for (let i = 0; i < string.length; i++) {

        if (string[i] == correctString[i]) {
            writeTile(row, i, string[i], 'green')
            correctString[i] = '!'
        }
    }

    for (let i = 0; i < string.length; i++) {

        if (correctString[i] != '!') {
            const index = correctString.indexOf(string[i])

            if (index > -1) {
                writeTile(row, i, string[i], 'yellow')
                correctString[index] = '?'
            } else {
                writeTile(row, i, string[i], 'gray')
            }
        }
    }

    if (correctString.every(char => char == '!'))
        return 'win'
    else if (row == maxTries-1)
        return 'lost'
    else
        return 'continue'
}

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
