const maxTries = 6
const wordLength = 5
let gameRunning = false
let word
let currentRow
let currentCol
let possibleKeyboardDigraph = false

document.addEventListener('DOMContentLoaded', function () {

    initPhysicalKeyboard()

    startGame()

    document.getElementById('new').addEventListener('click', () => startGame())

}, false)

function asciify(string) {
    const replacements = { 'Ǉ':'LJ', 'Ǌ':'NJ', 'Ǆ':'DŽ' }

    for (const r in replacements) {
        string = string.replace(r, replacements[r])
    }

    return string
}

function initKeyboard() {
    const keys = ['<ERTZUIOPŠĐ', 'ASDFGHJKLČĆŽ', ' ǄCVBNMǇǊ>']
    
    let keyboard = document.getElementById('keyboard')
    keyboard.innerHTML = ''

    keys.forEach(r => {
        
        let row = document.createElement('div')
        row.classList.add('row')

        r.split('').forEach(c => {
            if (c == '<') {
                let key = document.createElement('button')
                key.id = 'delete-key'
                key.classList.add('key', 'delete-key')
                key.innerHTML = 'BRIŠI'
                key.addEventListener('click', () => clicktypeSpecial('delete'))
                key.dataset.color = 'unused'
                row.appendChild(key)
            }
            else if (c == '>') {
                let key = document.createElement('button')
                key.id = 'enter-key'
                key.classList.add('key', 'enter-key')
                key.innerHTML = 'ENTER'
                key.addEventListener('click', () => clicktypeSpecial('enter'))
                key.dataset.color = 'unused'
                row.appendChild(key)
            }
            else {
                let key = document.createElement('button')
                key.classList.add('key')
                let letter = c
                key.id = 'key' + letter
                key.innerHTML = asciify(letter)
                if (letter != ' ')
                    key.addEventListener('click', () => clicktypeLetter(letter))
                key.dataset.color = 'unused'
                row.appendChild(key)
            }
        })

        keyboard.appendChild(row)
    });

}

function initPhysicalKeyboard() {

    const keyLetterCodes = {
        'KeyE': 'E', 'KeyR': 'R', 'KeyT': 'T', 'KeyY': 'Z', 'KeyU': 'U', 'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P', 'BracketLeft': 'Š', 'BracketRight': 'Đ',
        'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L', 'Semicolon': 'Č', 'Quote': 'Ć', 'Backslash': 'Ž',
        /*'KeyZ': 'Z',*/ 'KeyX': 'Ǆ', 'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B', 'KeyN': 'N', 'KeyM': 'M', 'Comma': 'Ǉ', 'Period': 'Ǌ',
    }
    const keySpecialCodes = {
        'Backspace': 'delete', 'Enter': 'enter',
        'Digit1': 'focus1', 'Digit2': 'focus2', 'Digit3': 'focus3', 'Digit4': 'focus4', 'Digit5': 'focus5',
        'Digit6': 'focus6', 'Digit7': 'focus7', 'Digit8': 'focus8', 'Digit9': 'focus9', 'Digit0': 'focus10',
        'ArrowLeft': 'moveLeft', 'ArrowRight': 'moveRight', 'Home': 'home', 'End': 'end', 'Escape': 'new'
    }

    document.addEventListener('keydown', function (e) {

        if (!gameRunning && e.code != 'Escape')
            return

        if (e.code == 'Enter' || e.code == 'Space')
            e.preventDefault()

        if (e.code in keyLetterCodes) {
            possibleKeyboardDigraph = true
            clicktypeLetter(keyLetterCodes[e.code])
        }
        else if (e.code in keySpecialCodes)
            clicktypeSpecial(keySpecialCodes[e.code])
        else
            console.log('unhandled keyboard event ' + e.code + ' ' + e.key)
    });
}

function initBoard() {

    let board = document.getElementById('board')
    board.innerHTML = ''

    for (let row = 0; row < maxTries; row++) {

        let tileRow = document.createElement('div')
        tileRow.classList.add('tile-row')

        for (let t = 0; t < wordLength; t++) {
            let tile = document.createElement('div')
            tile.classList.add('tile')
            tile.addEventListener('click', function() {
                if (gameRunning && row == currentRow)
                    setCursor(row, t)
            })
            tileRow.appendChild(tile)
        }
        board.appendChild(tileRow)
    }
}

function clicktypeLetter(letter) {

    console.log('clicked or typed ' + letter + '   (asciified: ' + asciify(letter) + '), possibleKeyboardDigraph:'+possibleKeyboardDigraph)

    if (!gameRunning)
        return

    if (possibleKeyboardDigraph && currentCol >= 1 && (letter == 'J' || letter == 'Ž')) {
        
        // TODO: doesn't work when trying to type digraph into second-to-last column if the last column already has a letter

        const lastColWritten = currentCol == wordLength-1 && getTile(currentRow, currentCol).dataset.letter !== undefined && getTile(currentRow, currentCol).dataset.letter != ''
        
        const prevLetter = getTile(currentRow, lastColWritten? currentCol : currentCol-1).dataset.letter

        if (prevLetter == 'D' && letter == 'Ž') {
            letter = 'Ǆ'
            if (!lastColWritten)
                currentCol--
        } else if (prevLetter == 'L' && letter == 'J') {
            letter = 'Ǉ'
            if (!lastColWritten)
                currentCol--
        } else if (prevLetter == 'N' && letter == 'J') {
            letter = 'Ǌ'
            if (!lastColWritten)
                currentCol--
        }
    }

    possibleKeyboardDigraph = false

    writeTile(currentRow, currentCol, letter)

    if (currentCol < wordLength-1)
        setCursor(currentRow, currentCol+1)
}

function clicktypeSpecial(what) {
    console.log('clicked or typed ' + what)

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

    initBoard()
    initKeyboard()

    word = words[Math.floor(Math.random() * words.length)].toUpperCase()
    currentCol = 0
    currentRow = 0
    setCursor(0, 0)
    
    gameRunning = true;

}

function submitWord() {

    let guess = ''

    for (let c = 0; c < wordLength; c++) {
        const tile = getTile(currentRow, c);
        const letter = tile.dataset.letter;
        if (letter === undefined || letter == '') {
            //alert('Upišite cijelu riječ!')
            return
        }

        guess += letter
    }

    if (!dictionary.includes(guess)) {
        alert('Riječ ne postoji u rječniku!')
        return
    }

    const result = writeTileRow(currentRow, guess, word)

    if (result == 'win') {
        gameRunning = false
        alert(`Bravo, pogodili ste riječ u ${currentRow+1}. pokušaju!`) //TODO: 🟩🟨⬛
    } else if (result == 'lost') {
        gameRunning = false
        alert(`Niste pogodili riječ u ${maxTries} pokušaja. Tražena riječ bila je ${word}.`)
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
    console.log('writing tile ' + row + ',' + col + ': ' + tile)
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
    if (key.dataset.color == 'unused')
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
