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
    } else if (what == 'new') {
        startGame()
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

const words = [
'afekt','afera','agava','agent','agrum','ajvar','akord','akter','alarm','album','aleja','alibi','alkar','aǉkav','ameba','amper','anđeo','aneks','anion','anoda',
'aorta','apoen','arena','arhiv','aroma','arsen','astma','ateǉe','atlas','autić','autor','avion','babun','bacač','bačen','bačva','badem','bager','bajka','bakar',
'balav','balet','balon','banda','banka','barba','barel','barem','barka','barok','barun','barut','basna','batak','bazen','bazga','bedem','berač','berba','beton',
'biber','bijeg','bijel','bijes','biǉar','biǉeg','biǉka','birač','biser','bista','bitak','bitka','bizon','blato','blizu','bluza','bočni','bodež','bodǉa','bogaǉ',
'bogat','bolid','boǉka','bomba','bonus','borac','borba','bozon','Božić','braća','brada','brana','brati','brava','brčić','breme','breza','briga','brkat','brkǉa',
'brlog','brtva','bruto','bubaǌ','buǆet','bukva','bunar','bunda','burek','burza','busen','bušač','butan','butik','ceker','celer','cesta','cezar','cezij','cifra',
'cijel','cijev','cikla','cimer','cimet','cinik','cipal','cista','citat','civil','crkva','crpka','crtač','crtež','crtić','crven','crvić','čađav','čagaǉ','čajni',
'čakra','čamac','čapǉa','časak','časni','čavao','čekić','čelik','čelni','čeǉad','čemer','čeoni','čepić','češaǉ','češer','četka','čežǌa','čičak','čipka','čitač',
'čitav','čizma','čoban','čopor','čorba','čudak','čupav','čuvan','čuvar','čuven','čvrst','ćelav','ćevap','ćorak','ćorav','ćošak','dabar','dagǌa','dakle','dalek',
'daǉǌi','danak','danas','darak','daska','dašak','dativ','datum','davež','deblo','dečko','dekan','dekor','delta','demon','denar','derbi','deset','desni','detaǉ',
'devet','diler','dinar','dingo','dioba','dioda','disko','divan','divǉi','dizač','dizel','djeca','djelo','djeva','dlaka','dobit','dobro','doček','dodir','dogma',
'dojam','dojka','dokaz','dolar','domar','domet','donos','doseg','dosje','dotok','dovod','drama','droga','drška','druid','drvce','držač','dubok','dućan','dugme',
'duhan','dukat','dupin','dušik','dvica','ǆepar','ǆepić','ǆoint','ǆoker','đubre','edikt','efekt','egzil','ekipa','ekran','elisa','emajl','endem','enzim','epika',
'epoha','etapa','etaža','etika','fakin','farma','farsa','fazan','fešta','fetiš','fetus','fikus','filet','firma','flora','flota','fluid','fluor','fokus','fonem',
'forma','forum','fosil','foton','frape','fraza','frend','freon','front','frula','funta','futur','gajba','gajde','galeb','galij','galon','gamad','garav','gazda',
'genij','genom','gepek','geslo','gesta','glava','gluma','gǉiva','gǌida','golać','golem','golub','gomoǉ','gonič','gorak','gorje','gospa','gošća','gotov','govno',
'govor','gozba','građa','grana','graǌe','grbav','greda','grejp','griǌa','gripa','griva','grmǉe','grozd','gruda','grupa','gudač','gulag','gulaš','gumen','gurač',
'gusar','guska','gusle','gužva','haiku','hajka','haker','harač','harem','hašiš','hauba','helij','heǉda','heroj','hidra','himna','hitac','hlače','hokej','horda',
'horor','hotel','hrana','hrast','hrbat','hrčak','hrušt','hrvač','human','humor','humus','hvala','ideal','ideja','idila','idiom','igrač','ikona','imela','inćun',
'ishod','iskaz','iskra','islam','ispad','ispis','ispit','istek','istok','istup','izdah','izgon','izlaz','izlet','izlog','izlov','izǉev','izmet','iznad','iznos',
'izraz','izrod','izvan','izvid','izvod','izvor','izvoz','jadni','jahač','jahta','jakna','jalov','jamac','jarac','jarak','jasen','jasle','javni','javor','jecaj',
'ječam','jedan','jedro','jedva','jelen','jelka','jesen','jesti','jetra','jezik','jeziv','ježić','jučer','junak','juriš','jurta','jutro','južni','kabel','kadar',
'kadet','kafić','kajak','kakao','kalež','kalif','kalup','kaǉen','kamen','kamin','kanal','kanǆa','kanon','kanta','kaǌon','kapak','kapar','kaput','karat','karma',
'karta','kasta','kašaǉ','kavez','kazan','kečap','kečka','kefir','kičma','kifla','kilav','kiosk','kipar','kipić','kiseo','kisik','kišni','klada','klapa','klasa',
'klati','klaun','klica','klika','klima','klinč','kliše','klopa','klupa','kǉast','kǉova','kǉuse','kǌiga','koala','kobra','kocka','koćar','kodon','kofer','kojot',
'kokos','kokoš','kokot','kolac','kolač','kolaž','koleǆ','kolut','koǉač','komad','kombi','komet','konac','konop','konto','konus','koǌic','koǌić','kopač','kopar',
'kopča','kopǉe','kopno','korak','koraǉ','korov','korpa','korzo','kosac','košer','košǌa','kotač','kotao','kotar','kovač','kozak','kozar','kožar','krađa','krama',
'kramp','krava','krcat','krčma','kreda','krema','krilo','kriza','krmak','krmeǉ','kroše','krpeǉ','kruna','krzno','kubik','kugla','kuhar','kukac','kukoǉ','kulak',
'kulen','kumče','kumin','kunić','kupac','kupač','kupeǉ','kupka','kupǌa','kupon','kupus','kurir','kušač','kušǌa','kutak','kutić','kutni','kvaka','kvarc','kvark',
'kvart','kvota','kvrga'].map(word => word.toUpperCase());

const dictionary = [
'Adela','adept','Adolf','afekt','afera','Afgan','afiks','agapa','Agata','agava','agens','agent','Agram','agrar','agrum','ajvar','akant','akord','akril','akson',
'akter','aktiv','alarm','alast','alaun','albin','album','aleja','alias','alibi','Alija','Alisa','alkar','alkin','aloja','Alojz','Alžir','aǉkav','Aǉmaš','Aǉoša',
'amaro','ambar','ambis','ambra','ameba','amper','ampir','anđel','anđeo','aneks','Anica','anion','Anita','anoda','Antej','Anton','Antun','aorta','apage','apeks',
'apoen','Apolo','april','arara','arbun','areal','arena','argon','Argus','arhiv','Ariel','arija','aroma','Arpad','arsen','Artur','ASEAN','asker','asket','aspik',
'aspra','astat','Astek','astma','Asuan','asura','ataše','ateǉe','Atena','atest','atila','atlas','atlet','atona','Atrej','atrij','audio','augur','autić','autor',
'avans','avers','avion','AVNOJ','Azija','azoik','azola','Aztek','babac','Babić','babǉi','babun','bacač','bacil','bačen','bačić','Bačka','bački','bačva','badaǉ',
'badaǌ','Badel','badem','badǉe','badǌi','bager','baget','bagoš','bagra','baguš','bahat','bajam','bajer','bajka','bajni','bajta','bakar','bakǉa','balav','balet',
'balon','balun','banak','Banat','banda','banka','bantu','baran','baraž','barba','barel','barem','barij','baril','barit','barka','barok','baron','barun','barut',
'basna','Basra','bašča','Baška','batak','batić','batik','bazar','bazen','bazga','bazni','bečki','bećar','bedak','bedem','bedro','begeš','bekeš','belaj','belot',
'benav','benǆo','Benin','berač','berba','beril','besan','beton','bezok','bezub','bibav','biber','bičić','bičji','bidon','bigot','Bihać','bijeg','bijel','bijen',
'bijes','bilin','biǉar','biǉeg','biǉka','biǉni','binar','biped','birač','biret','biser','bismo','bista','bitak','bitka','bitni','bivak','bivol','bivši','bizam',
'bizon','bjaše','bjehu','bjeǉi','bješe','blaǌa','blato','blaži','blend','blizu','bliži','bluna','bluza','bǉeđi','bočat','bočni','boćar','bodac','boden','bodež',
'bodǉa','bodri','bodul','bofor','bogac','bogaǉ','bogat','bogme','Bojan','bojen','bojev','bojna','bojni','bokal','bolid','bolni','bolta','boǉar','boǉka','bomba',
'bonus','borac','borak','borba','bordo','Borej','borić','borik','Boris','borje','Borna','borni','boršč','Bosna','bosti','botel','bozon','Božić','božji','božur',
'braća','brada','brana','brati','brava','brčić','bređi','breme','breza','brica','brico','briga','Briǌe','brioš','brkat','brkǉa','brlog','bronh','brtva','bruka',
'bruto','brvaǉ','brvno','brzac','brzak','bubaǌ','bučje','bučni','budak','budem','budeš','Budim','budni','Budva','buǆet','buđen','bugar','buhač','bujad','bujni',
'bujon','bukač','buket','bukov','bukva','buǉav','bunar','bunda','burag','burek','burin','burma','burni','bursa','burza','busen','bušač','bušan','bušel','bušen',
'butan','butik','butni','Buzet','caklo','carev','carić','Cazin','cedar','CEFTA','ceker','cekin','cekum','celer','cener','cepin','cerek','cerij','cerje','cesar',
'cesta','cezar','cezij','cibet','cifra','cigan','cigin','cigla','cijan','cijeđ','cijel','cijep','cijev','cijuk','cikla','cikot','cilik','ciǉni','cimer','cimet',
'cinik','cipal','Cipar','cipli','cirus','cista','citat','citra','civil','crkva','crnac','crnka','crǌak','crpao','crpem','crpeš','crpka','crpla','crpni','crtač',
'crtež','crtić','crvak','crven','crvić','curak','Čabar','čador','čađav','čagaǉ','čajni','čakir','čakra','čalma','čamac','čanak','čapǉa','čarda','čarka','časak',
'časni','čaška','čavao','čavka','Čazma','Čečen','čedni','čekač','čekić','čelik','čelni','čeǉad','čemer','čeoni','čepić','čerek','čerga','česma','češaǉ','češaǌ',
'češći','češer','češki','četin','četka','četni','čežǌa','čibuk','čičak','Čifut','čigra','činel','čiǌen','čioda','Čiovo','čipka','čirić','čišći','čitač','čitav',
'čitki','čizma','čoban','čokot','čoper','čopor','čorba','čučaǌ','čudak','čudni','čujni','čulni','čunak','čupav','čuvan','čuvar','čuven','čvrst','ćelav','ćevap',
'ćilim','ćopav','ćorak','ćorav','ćosav','ćošak','ćumez','ćuška','dabar','dadem','dadeš','dadne','dadoh','dagǌa','dakle','dalek','daǉǌi','Damir','Danac','danak',
'danas','Dante','darak','Dario','daska','dašak','dašće','dašći','dašto','dativ','datum','davač','davež','David','davni','Davor','debeo','debil','deblo','debǉi',
'dečko','Dedal','Dedić','deist','dekan','dekor','Delfi','delta','demon','denar','dendi','denga','derač','derbi','derle','deset','desni','detaǉ','devet','dezen',
'dični','diler','diǉem','diǉka','dimni','dinar','dingo','Dinka','Dinko','dioba','dioda','Diona','dioni','dipol','disco','disko','dišni','divaǉ','divan','divit',
'divǉi','divni','dizač','dizel','djeca','djelo','djeva','dlaka','dnima','dobit','dobni','dobri','dobro','doček','dočim','dodir','dogma','dojam','dojen','dojka',
'dokad','dokaz','dokle','dokon','dokud','dolac','Dolac','dolar','dolet','domak','domar','domet','donde','donos','dopis','dosad','doseg','dosje','dosta','došli',
'dotad','dotle','dotok','dovde','dovod','dovoz','doziv','drača','draga','drama','Drava','draži','dreka','drmeš','Drniš','droga','droǉa','drozd','drski','dršće',
'dršći','dršću','drška','drugi','druid','drvar','Drvar','drvce','drven','drvǉe','drvni','drzak','držač','držak','dubǉi','dubok','dućan','dugme','duhač','duhan',
'dukat','duǉen','Dunav','dupin','dupke','dupli','dupǉa','dušak','Dušan','dušik','dušni','dužni','dvaju','dvama','dveri','dvica','dvije','dviju','dvoga','dvoji',
'dvoma','dvori','ǆepar','ǆepić','ǆepni','ǆezva','ǆihad','ǆoger','ǆoint','ǆokej','ǆoker','đačić','đakon','đavao','đubar','đubre','Đurđa','Đurin','edikt','Edita',
'efekt','egida','egzil','ekcem','ekipa','ekran','ekson','elisa','elita','emajl','Emina','endem','Eneja','Enver','enzim','eparh','epika','epoha','erato','erbij',
'Erdeǉ','Erdut','Ervin','Eshil','Eskim','Ester','estet','etapa','etaža','etida','etika','etnik','etnos','Eugen','eunuh','fagot','fakin','fakir','falus','farba',
'farma','farsa','farsi','fatum','Faust','fazan','fazni','fazon','feder','fenol','feǌer','Ferdo','fešta','fetiš','fetus','fetva','fićuk','fijuk','fikus','filek',
'filet','Filip','filir','Finac','finiš','finta','firer','firma','fitiǉ','fjord','flaša','fleka','flert','floem','flora','flota','fluid','fluks','fluor','foaje',
'Fobos','fokus','fondi','fonem','forma','forte','forum','fosil','foton','Fraǌo','frape','fraza','frend','freon','Freud','front','frtaǉ','frula','funta','futur',
'Gacka','gadni','gajba','gajde','gajen','galeb','galge','galij','galon','galop','gamad','garav','garda','garež','gasiv','gašen','gatka','gaučo','gauss','gavan',
'gavez','gavun','gazda','gažen','gđica','gegav','gejša','geler','genij','genom','gepek','germa','geslo','gesta','gibak','gibaǌ','gibon','gilda','gipki','gizda',
'glađu','glanc','glava','glede','glina','globa','glosa','gluma','gluon','gluši','gǉiva','gnoza','gǌida','gǌili','gǌiti','Gogoǉ','gojen','gojni','golać','golem',
'golet','golub','goǉak','gomoǉ','gonič','goǌen','gorak','Goran','gorči','goriv','gorje','gorki','gorǌi','gospa','gošća','gotov','govno','govor','gozba','graba',
'građa','graja','grana','graǌe','grbav','grčen','grčki','grdni','grdǌa','greda','grejp','Greta','grgeč','Grgur','griǉa','griǌa','gripa','griva','griža','grlat',
'grlce','grlen','grlić','grǉak','grǉen','grmak','grmaǉ','grmaš','grmić','grmǉe','grogi','groza','grozd','gruda','grunt','grupa','gubac','gubav','guber','gudač',
'gugut','gulag','gulaš','guǉen','gumen','gumno','guǌac','gurač','gurav','gurka','gusak','gusan','gusar','guska','gusle','gušav','gušče','gušći','gušen','gutač',
'gužva','gvaǉa','gverc','gvirc','Gvozd','habit','hahar','haiku','Haiti','hajda','hajde','hajka','hajmo','hajte','haker','halav','halon','halva','hamam','harač',
'harem','harfa','Hasan','Hasid','hasij','hašiš','haški','hauba','HDSSB','helij','heǉda','Herod','heroj','Hetit','hidra','hiǆra','hihot','himba','himen','himna',
'hindi','hiǌen','hiper','hipik','hitac','hitin','hitni','hitǌa','hitri','hlače','hoćeš','hodač','hodǌa','hođah','hokej','Homer','homić','honda','horda','horor',
'Horus','hotel','hrana','hrast','hrbat','hrčak','hrđav','hrpta','hrpte','hrpti','hrptu','hrušt','hrvač','Hrvat','htjet','hučni','huǉen','humak','human','humor',
'humus','hunta','husar','hvala','ičega','ičemu','ičiji','ideal','ideja','idila','idiom','idiot','idući','iđahu','iđaše','igalo','igdje','iglen','iglun','igrač',
'ikada','ikako','ikamo','ikoga','ikoji','ikome','ikomu','ikona','Ilica','Iliǆa','Ilija','Ilova','imade','imati','imela','inače','inćun','indij','Indra','Indus',
'ingot','inoča','input','Irska','irski','irvas','ishod','iskan','iskaz','iskon','iskop','iskra','islam','ispad','ispis','ispit','ispod','ispuh','istek','istok',
'Istra','istrt','istup','isuti','itrij','ivica','Ivona','izaći','izboj','izbor','izdah','izgon','izići','Izida','izlaz','izlet','izlog','izlov','izǉev','izmak',
'izmet','iznad','iznos','izraz','izrez','izrod','izuti','izvan','izvid','izvod','izvor','izvoz','ižeti','jadić','jadni','jagma','jahač','jahta','jajar','jajce',
'jajni','jakna','Jakob','Jakov','jalni','jalov','Jalta','jamac','jamni','Janez','Janko','jaǌac','jaǌen','Japan','Japod','jarac','jarak','jaram','jaran','jardi',
'jarić','jarki','Jarun','jasen','jasle','jasni','jašen','jatak','javni','javor','jebač','jeben','jecaj','jecav','ječam','jedak','jedan','jeden','jedri','jedro',
'jedva','jelek','jelen','jelka','jelov','Jemen','jenki','jesam','jesen','jesmo','jeste','jesti','Ješua','jetki','jetra','jezda','jezik','jeziv','ježić','jidiš',
'jodid','jodni','joint','Josip','Jošua','jučer','Julia','Julij','junac','junak','Juraj','juren','juriš','jurta','jušni','jutan','juten','jutro','južni','kabao',
'kabel','Kačić','kaćun','kadar','kadet','kadli','kadri','kađen','kafić','Kafka','kagan','Kairo','kajak','kajda','kajla','kakao','kakav','kakvi','kalaj','Kaleb',
'kalem','kalež','kalfa','kalif','kalij','kalup','kaǉav','kaǉen','kamen','kamin','kamiš','Kamov','kanal','kanat','kanda','kanǆa','kanon','kanta','kaǌon','kapak',
'kapar','kapǉa','kaput','karat','kargo','Karla','karma','karta','kasač','kasni','kasta','kašaǉ','katar','katni','Katon','katun','kavez','kavga','kazan','kazna',
'kečap','kečka','kefir','kegla','Kemal','Keops','kepec','keson','kibic','kibla','kicoš','kičma','kićen','kifla','Kijev','kikot','kilav','Kinez','kinin','kiǌen',
'kiosk','kipar','kiper','kipić','kirǌa','kiseo','kisik','kišni','kišni','kivni','klada','klapa','Klara','klasa','klati','klaun','kleče','kleti','klica','klika',
'klima','klinč','kliše','klopa','klupa','kǉast','kǉova','kǉuka','kǉuse','kneže','kǌiga','koala','kobac','kobni','kobra','kocka','kočen','kočni','koćar','kodni',
'kodon','kofer','kojot','kokos','kokoš','kokot','kolac','kolač','kolan','kolar','kolaž','koleǆ','kolet','kolni','kolor','kolos','kolut','koǉač','koǉen','koǉeš',
'komad','kombi','komeš','komet','Komin','konac','konak','Kongo','konop','konto','konus','koǌak','koǌar','koǌic','koǌić','kopač','kopar','kopča','kopǉe','kopno',
'kopun','korak','koral','koraǉ','koren','korov','korpa','korzo','kosac','kosač','kosat','kosir','kosni','košen','košer','košić','košǌa','kotac','kotač','kotao',
'kotar','Kotor','kotur','kotva','kovač','kovit','kozak','kozar','kozer','kozji','kozle','kožar','kožni','kožuh','kožun','kraba','kraći','krađa','krama','kramp',
'kraul','krava','krcat','krčag','krčen','krčki','krčma','kreda','krema','Kremǉ','Kreol','Kreta','krhki','krilo','Krist','kriti','kriza','križa','krmak','krmče',
'krmeǉ','krmen','krmni','krǌak','krǌen','kroki','kroše','kroza','krpar','krpeǉ','krpen','krpež','krpǉa','krsni','kršen','kršni','krući','kruna','krvav','krvni',
'krzno','kubik','kubni','kubus','kucač','kucaj','kučka','kućni','kuđen','kufer','kugla','kuhar','kukac','kukoǉ','kulak','kulen','kuluk','kumče','kumin','kumir',
'kumis','kunić','kupac','kupač','kupan','kupeǉ','kupka','kupǌa','kupon','kupus','kurac','Kuran','kuren','kurij','kurir','kurji','kurva','kusav','kušač','kušǌa',
'kutak','kutić','kutni','kužni','kvaka','kvant','kvarc','kvark','kvart','kvazi','kvirc','kvota','kvrga','labav','Labin','labud','lađar','lafet','lager','lagum',
'lagva','lahor','lajav','lakaj','lakat','lakej','lakom','lakši','lampa','lanac','lanen','lanut','lapis','lapor','larga','largo','larma','larva','laser','lasju',
'laska','lasta','lauda','Laura','lavež','lavić','lavǉi','lavor','Lazar','lažac','lažni','lažov','leden','leđen','leđni','legat','leglo','Lejla','lelek','lemeš',
'lemur','lenta','Leǌin','lepet','lepra','letač','letak','letni','letva','ležaj','Liban','libar','libor','libra','licej','ličen','lički','lični','lider','ligǌa',
'lihva','lijek','lijen','lijep','lijes','lijev','liker','limar','limen','limes','limfa','limit','limun','lipaǌ','lipid','lipik','lipov','lirik','lisac','liska',
'lisni','lista','lišaj','lišce','lišće','lišen','litij','litra','Litva','livac','liven','lizač','lizin','lizol','logor','logos','lojni','lokal','lokna','lokot',
'lokva','lomiv','lomni','lonac','lopoč','lopov','lopta','losos','Lošiǌ','lotos','lovac','lovaš','lovni','lovor','ložač','ložen','loživ','lubin','lučac','lučen',
'Lučić','lučki','lučni','luđak','lugar','luger','lukav','lumen','lunar','lupan','lupar','lupež','lutak','lutka','lutǌa','ǉečiv','ǉekar','ǉepši','ǉetni','ǉetos',
'ǉevač','ǉevak','ǉeven','ǉigav','ǉiǉan','ǉubak','ǉubav','ǉućen','ǉupki','ǉuska','ǉutić','ǉutit','ǉutǌa','macan','Maceǉ','mačak','Maček','mačić','mačji','mačka',
'mačor','madam','madež','Mađar','magla','magma','maher','majka','major','majur','makac','makar','makǉa','makro','malac','malen','maler','malko','malne','Malta',
'maǉav','mamac','mamut','manga','mango','manir','manta','maǌak','Maria','marka','Marko','marni','marod','marof','Marta','marva','marža','masen','maser','masiv',
'maska','maslo','mason','mašna','mašta','Matej','Mateo','mater','Matoš','mazač','mazga','maziv','mazni','mazut','mažen','mečka','medar','meden','medij','medni',
'međaš','mekan','meket','mekši','melem','melez','melon','melos','memla','menta','menza','mesar','mesni','mesti','metak','metal','metan','metar','meten','metež',
'metil','metiǉ','metla','metro','mezij','mezon','mider','mijeh','mikro','Milan','Miloš','miner','minus','miraz','miren','mirha','miris','Mirko','mirni','mirta',
'mirza','misal','misao','misni','mišar','mišić','mišji','miška','mišǉu','mitar','mitra','mjera','mlada','mladi','mlađi','mlaka','Mleci','mǉeti','mnogi','mnome',
'mǌeǌe','močen','moćni','model','modem','modni','modri','modul','modus','mogah','mogao','mogla','mogle','mogli','moglo','mogni','mogoh','moguć','mogul','Mohač',
'moher','mokri','molba','moǉac','moǉen','momak','momče','monah','moped','moral','moren','mosni','Mosor','mošǌa','mošus','motel','motet','motiv','motka','motor',
'mozak','mozgu','možda','možeš','mraše','mraže','mrena','mreža','mrgod','mrkli','mrkov','mrkva','mrǉav','mrmor','mrski','mrsni','mršav','mrtav','mrtvi','mrzak',
'mrzli','mržǌa','mucav','mučen','mučki','mučni','mućak','mućen','mućka','mudri','mukli','mulac','mulat','muǉav','mungo','mural','murva','musav','musti','muški',
'mutav','mutež','mutni','muzej','mužar','mužen','mužić','mužǌa','naboj','nabor','nacrt','načas','načet','način','naćve','Nadir','nadme','nadmu','nadro','nadru',
'naǆak','nađen','nafta','nagao','nagib','nagli','nagon','naići','naime','najam','nakit','nakon','nakot','nalaz','nalet','nalič','nalik','nalog','naǉev','namah',
'namaz','namet','namot','nanio','nanos','naoko','napad','napet','napis','napoj','napol','napon','napor','napuh','Napuǉ','narav','narod','nasad','nasip','nasrt',
'našit','natru','nauka','navod','navoj','navoz','navrh','nazad','nazal','nazeb','naziv','nazor','nažao','nečeg','nečem','nečim','nećak','nećeš','nefin','negda',
'nehaj','nehat','nejač','nejak','nekad','nekoć','nekud','neman','nemar','nemio','nemir','nemoć','nemoj','Nenad','Nepal','nepce','nepun','nerad','nered','nesit',
'nesti','nešto','netko','netom','neven','nevin','neživ','ničeg','ničim','nijem','nikad','nikal','nikao','nikim','nikog','nikom','nikud','nimfa','ninǆa','nisam',
'niska','niski','nismo','niste','nišan','ništa','nitko','nitna','nitni','nizak','Nobel','noćas','noćca','noćni','nogar','nogat','nokat','nomad','norma','nosač',
'nosat','nosić','nosiv','nosni','nošen','nošǌa','notar','notes','notni','novac','novak','nožić','nožni','nuđen','nujni','nulti','nužda','nužni','ǌedra','ǌegov',
'ǌezin','ǌežni','ǌihaj','ǌihov','ǌiska','ǌušen','ǌuška','OAPEC','obaju','obala','obdan','obići','obiǉe','obiti','objed','oblak','oblik','oblog','obnoć','oboji',
'oboma','obrat','obraz','obred','obris','obrok','obrub','obruč','obrva','obuća','obući','obuka','obuti','obzir','obzor','ocean','octen','očale','očica','očiju',
'očima','očǌak','odade','odaja','odati','odbor','odemo','odete','odgoj','odjek','odjel','odǉev','odmah','odmak','odmor','odnos','odoka','odora','odoše','odran',
'odraz','odred','odrod','odron','odsad','odsut','oduka','odveć','odvod','odvoz','odziv','oglas','oglav','ogled','ogǌen','Ohrid','ojači','ojaǌe','okana','okice',
'oklop','okolo','okret','okrug','oksid','oktan','oktet','okuka','okvir','olaki','olein','Olimp','olovo','oltar','oluja','omaći','omama','omaǌi','omara','omega',
'omjer','omlet','omski','onako','onamo','ončas','ondje','oniks','onime','oniži','onomu','onuda','općen','opeći','opeka','opera','ophod','opiti','opkop','oprez',
'opseg','opšav','opšit','optok','oputa','oraći','orada','orati','orden','oreći','oreǌe','oreol','Orfej','organ','Orion','oriti','orkan','orlić','orlov','ormar',
'ornat','ortak','oruđe','osama','oseka','osica','osiǌi','osion','osjet','oslić','oslon','oslov','Osman','osmij','osoba','osuda','osuti','osvit','osvrt','oštri',
'otada','otale','otamo','otare','otari','otaru','otava','oteći','otepe','otepi','otepu','oteti','otići','otkad','otkaz','otkos','otkud','otkup','otpad','otpis',
'otpor','otprt','otrem','otrla','otrov','otući','otuda','otvor','ovako','ovamo','ovčar','ovčji','ovdje','oveći','ovime','oviti','ovjes','ovlaš','ovnov','ovomu',
'ovrha','ovuda','ozdol','ozimi','ožeći','ožeme','ožmem','pacer','packa','pačić','pačji','paćen','padež','pagan','pajac','pajzl','pakao','paket','palac','palež',
'palma','paǉba','paǉen','pamet','pampa','pamuk','panda','panǆa','panel','papak','papar','papir','Papuk','paraf','parba','paren','parić','parip','Paris','Pariz',
'parni','paroh','pasat','pasaž','pasiv','pasji','paska','pasoš','pasta','pasti','pasuǉ','pasus','pašče','paški','pašta','patak','pater','patka','patǌa','patos',
'pauza','Pavao','Pavla','Pavle','Pavlu','pazar','Pazin','pazuh','pažen','pažǌa','pčela','pecar','pečat','pečen','pećar','pedaǉ','peder','Pegaz','pegla','pehar',
'pekar','pelin','pelir','pelud','peǉar','penal','penis','peǌač','pepeo','perač','perad','perce','perec','Perin','periš','perje','perla','peron','Perun','perut',
'pesos','pešće','Pešta','petak','Petar','petit','petǉa','petni','Petra','pička','pijan','pijuk','pijun','pikǌa','pilar','Pilat','pilav','pilić','pilon','pilot',
'piǉak','piǉar','piǉen','pinkl','pinta','piǌol','pipac','pipak','pipav','Piran','pirat','Pirej','pirit','pisac','pisač','pisak','pisar','pismo','pista','Pišta',
'pitač','pitki','pitom','piton','pivar','pivce','pivot','pizda','pizma','pjega','pjena','plaća','plast','plašt','plata','plato','plaža','pleća','pleme','plići',
'plima','Pliva','ploča','ploha','pluća','pluto','pǉeva','poček','počet','počev','podij','podli','podni','podug','poema','pogan','pogon','pohod','pojac','pojam',
'pojas','pojen','pokal','pokaz','poker','pokoj','pokoǉ','pokop','pokus','polen','polet','polio','polip','polis','polka','polog','poǉak','poǉar','pomak','pomet',
'Pomet','pomni','pomǌa','pomoć','pomol','pomor','pompa','ponad','pončo','ponio','ponoć','ponor','ponos','Popaj','popis','poput','porat','poraz','Poreč','pored',
'poren','porez','poriv','porno','porod','porok','porta','porub','posao','posip','posni','posto','posve','pošta','potez','potih','potka','potok','potom','potop',
'potre','potrt','pouka','povez','povik','povit','povod','povoj','povrh','pozer','poziv','pozli','pozni','pozor','požar','požet','praǉa','prase','prati','prčen',
'prdac','prdež','preči','preći','pređa','preko','prelo','preǉa','prema','presa','preša','prezl','prgav','prhki','prhut','priča','prići','pride','prija','prima',
'princ','prior','prišt','prkno','prkos','prǉav','prǌak','prǌav','proba','proći','proja','proso','prost','prota','prova','proza','prsat','prsni','pršić','pršut',
'prten','pruće','pruga','prvak','pržen','pržun','pseći','pseto','psiha','psina','pssst','ptica','ptiče','pucač','pucaǌ','pučan','pućen','puder','puhač','pukli',
'pulen','pulpa','pumpa','punac','punđa','punkt','puǌač','puǌen','pupak','pupav','puran','purin','pusta','pušač','puška','putar','puten','putić','putni','puzav',
'pužni','rabat','rabin','raboš','račić','račji','račun','račva','radar','radić','radij','radin','radni','radǌa','radon','rađen','rafal','ragbi','rahli','Rajna',
'rajon','rakar','rakǉa','rakun','rampa','ranac','ranar','ranka','raǌav','raǌen','raǌiv','rapir','rarog','rasad','rasap','rasni','rasol','rasti','raški','rašǉa',
'rašpa','ratan','ratar','ratni','Ravel','ravni','razni','razor','razum','ražaǌ','ražen','rbina','rebro','rebus','rečen','redak','redar','redni','redov','ređen',
'reful','regal','Regoč','reket','rekuć','relej','reǉef','remen','renij','renta','repat','reper','repić','repni','rerna','reski','resor','retor','reuma','rever',
'revir','revni','rezač','rezak','rezon','režaǌ','režim','ribar','ribež','ribič','ribiz','ribǉi','riđan','riječ','rikša','rilce','Rilke','risač','ritam','riter',
'rival','riven','rizik','rizom','rjeđi','robǉe','robni','robot','ročni','rodeo','rodij','rodni','Rodos','rođak','rođen','rogač','rogat','rogoz','rohav','rojen',
'rojta','roker','rolna','roman','Romeo','romon','romor','ronac','rosni','rošen','rotor','rovac','rovač','rovaš','Roviǌ','rovka','rozga','rubac','rubaǉ','rubin',
'rubǉa','rubǉe','rubni','ručak','ručka','ručni','rudar','rudni','Ruđer','rugač','ruglo','ruina','rujni','rukav','rulet','rumen','Rumuǌ','runda','ruǌav','ruski',
'rušen','rutav','ružen','ružni','rzati','sabat','sabǉa','sabor','sačma','sadni','sadǌa','sadra','sađen','safir','sajam','sajla','sakat','salaš','saldo','salon',
'salpa','salsa','salto','salva','samac','samar','samba','samit','Samoa','samrt','samur','sanak','santa','saǌač','saǌar','saǌiv','saǌke','sapet','sapun','saraj',
'sarin','sarma','saski','satan','saten','satić','satir','satni','satrh','satro','satrt','sauna','Savao','savez','saziv','sažet','scena','sebar','sebra','sedam',
'sedef','sedlo','sedmi','seksi','sekta','selam','selce','selci','selen','Selim','seǉak','seǉen','semit','senat','seoba','seoce','sepsa','serum','servo','seter',
'sezam','sfera','shema','Sibir','sićan','sidro','sifon','Siget','sijač','Sijam','sijed','sijev','silaz','silni','silos','Sinaj','sinci','sinče','singl','sinko',
'sinku','sinoć','sinus','sipki','sipǌa','sirac','sirač','sirak','siren','sirot','sirov','sirup','Sisak','sisar','sisat','sišli','sitar','sitni','sivac','sjati',
'sječa','sjeći','sjeme','sjena','sjeta','skala','skalp','skamp','skaut','skela','skica','skide','skija','sklad','sklek','sklon','sklop','skoba','Skrad','skrit',
'skroz','skuša','skuta','slađi','slajd','slama','slaǌe','slast','slati','slava','sleći','sleng','slika','slina','sliti','sloga','slovo','sluga','sǉeme','smaći',
'smeće','smeđi','smiǉe','smion','smjer','smoci','smoći','Smoje','Smoji','Smoju','smola','smrad','smrča','smrću','snaći','snaga','snaha','snovi','sobar','sobni',
'sočni','sodar','sokak','sokna','sokol','Solin','solni','Solun','soǉen','somić','somun','sonar','sonda','sonet','sorta','sošni','spali','speći','spiǉa','spjev',
'splav','splet','Split','spona','spora','sport','spram','sprej','sprud','sprva','spust','srati','Srbin','srčan','srdiš','srdit','srǆba','sreća','srǌak','srpaǌ',
'stade','stado','staja','start','stati','staza','steći','stega','stela','steǉa','steon','stepa','stera','Stevo','stići','Stipo','stjeg','stoik','stoka','stopa',
'stoti','strah','stran','stres','stric','strip','strka','strog','stroj','strop','strug','struk','stuba','stvar','stvor','Suada','sučev','sućut','sudac','Sudan',
'sudar','sudba','sudǌi','suđen','suhǉi','sukno','sukǌa','sukob','sukus','sulud','Sumer','sumǌa','sunce','sunit','Supek','super','supka','surka','surla','surov',
'sushi','sušac','Sušak','sušaǌ','sušen','sušiv','sušni','sušti','Sutla','suton','sutra','suvag','suzni','sužaǌ','sužen','svađa','svaki','svast','svega','svemu',
'sveza','svila','svima','svime','sviǌa','svita','sviti','svjež','svomu','svota','svrab','svrha','svući','svuda','šajka','šakač','šakal','šaǉiv','šaman','šamar',
'šamot','šanac','šansa','šapat','šapka','šapta','šarac','šaraf','šaran','šaren','šarka','šarov','šarun','šarža','šašav','šator','šećer','šegrt','šekel','Šenoa',
'šepav','šeret','šerif','šerpa','šešir','šetač','šetni','šetǌa','ševar','šiber','šibǉe','šifon','šifra','šijit','šikan','šiǉak','šiǉat','šiǉen','Šimin','šiǌel',
'šipak','šipka','širen','širit','širok','šišač','šiška','škamp','škare','škart','škija','škoda','škola','škrga','škrip','škrob','škuda','škuǉa','škuna','škura',
'škver','šlapa','šǉaka','šǉiva','šǉuka','šnala','šnita','šofer','šogor','šogun','šojka','Šokac','Šolta','špaga','špena','špica','špigl','špiǉa','Špiro','šport',
'štaka','štala','štand','šteka','štene','šteta','štift','štivo','štono','štrik','štuka','štula','šugav','Šuica','šumar','šumni','šumor','šunka','šupak','šupǉi',
'šušaǌ','šuška','šutke','šutǌa','Švaba','švaǉa','šveǉa','šverc','švorc','tabak','taban','tabla','tabor','tacna','tačke','tački','Tadić','tajac','tajen','tajga',
'tajna','tajni','taksa','taksi','takvi','talac','talar','talij','talir','talog','talon','taǉen','taǉiv','Tamil','tamni','tanac','tanan','tanga','tango','tanin',
'tanki','taǌen','TAǊUG','taǌur','tapir','tarac','tarem','tareš','tarni','tarok','tarot','Tatar','tavan','tažen','tečaj','tečni','tegla','tekst','tekut','telac',
'telal','telić','telur','temeǉ','tempo','Temza','tenda','tenis','tenor','tepav','tepen','tepih','terca','teren','teret','terme','termo','teror','tesar','tesla',
'teški','tetak','Tetis','tetka','Teuta','Tezej','tezga','težak','težǌa','theta','thora','Tiber','Tibet','tifus','tigar','tihan','tijek','tikov','tikva','tilda',
'timar','timin','Timor','tinel','tinta','tiǌac','tipka','Tirol','tisak','Tisno','tisov','tišma','titan','Titov','tjeme','tkaǉa','tkati','tkivo','tlaka','tmast',
'tmica','tmina','tobom','tobož','točak','točen','točka','točni','Tokaj','tokar','Tokio','Tomac','Tomić','toner','tonik','tonus','topao','topaz','topić','topiv',
'topli','topot','topuz','toraǌ','torba','torij','torta','torus','torzo','total','totem','tovar','tovni','traka','trakt','trans','trasa','trava','trbuh','trčka',
'treći','trema','trend','treǌe','trgić','trgla','trgli','trglo','trgoh','trica','trija','triju','triko','trima','triom','trkač','trnac','trnak','trǌak','troga',
'Troja','troji','trpki','trpni','Trsat','trsje','trska','truba','truli','truǌe','trupa','trust','trven','trzaj','trzav','tržen','tržni','tubus','tucet','tučak',
'tučen','tuđin','tukac','tukan','tulij','tulum','tuǉac','tuǉak','tuǉan','tuǉen','tumač','tumor','tumul','tunel','Tunis','tupan','tupav','tupǉi','turbe','turbo',
'turci','turke','tutaǌ','tutor','Tuzla','tužba','tužen','tužni','tvoga','tvoji','tvome','tvomu','tvrđi','ubiti','ubrus','ubrzo','učilo','učiti','učtiv','udade',
'udaja','udati','udbaš','udica','udjel','udova','ufati','uglas','uglat','ugled','uglom','Ugǉan','ugǉen','ugǉik','ugoda','ugriz','uhoda','uklet','ukoso','ukras',
'ukriž','ukrug','Ulciǌ','ulema','ulica','uliti','ulkus','uloga','ultra','uludo','uǉast','uǉiti','umaći','umalo','umiti','umnik','umǌak','umrli','UNFPA','UNHCR',
'unići','unija','unski','unuče','unuka','uǌkav','uočen','upala','upeći','upeti','upiti','upliv','upola','upora','uputa','urban','ureći','urica','urlik','urota',
'usana','ushit','usima','usjek','usjev','uskok','uskrs','usmen','usnen','usnik','uspon','usput','usred','ustav','ustuk','usuti','ušara','ušesa','ušica','ušiti',
'ušǉiv','uštap','uštrb','utaja','uteći','utiha','utrem','utrka','utrla','utrli','utući','uvala','uveče','uveli','uviti','uvjet','uvući','uzaći','uzdah','uzduh',
'uzduž','uzeti','uzgoj','uzgon','uzica','uzići','uziti','uzlaz','uzlet','uzmak','uznik','uznio','uzrok','uzvik','užeći','užina','uživo','užiže','vabac','vađen',
'vagaš','vagon','vajda','vajni','vakuf','valić','valni','vaǉak','vaǉda','vapaj','vapno','varan','varav','varen','varka','varoš','vašar','vatra','vazal','vazda',
'važni','večer','vedri','vegan','velik','velim','veliš','velna','velom','velur','veǉko','Veǉko','veoma','vepar','vergl','veseo','veslo','Vesna','vesta','vesti',
'vezač','vezen','vezir','vezni','Vezuv','vični','vidar','video','vidik','vidje','vidni','vidra','viđen','vigaǌ','vihor','vijak','vijek','vikač','vikar','vinar',
'vince','vinil','Vinko','vinov','viǌak','viola','virus','visak','viski','Visla','visok','višak','viški','Višnu','višǌa','Višǌa','višǌi','vitak','vitao','vitez',
'vitki','vitlo','vizir','vižla','vižle','vjeđa','vjeke','vjera','vješt','vlada','vlaga','vlaji','vlast','voćar','voćka','voćni','voden','vodič','vodik','vodni',
'vođen','vojak','Vojko','vojna','vojni','vokal','volan','volar','volej','Volga','volić','volta','voǉen','voǉka','voǉni','vosak','votka','vozač','vozar','vozni',
'vožen','vožǌa','vrana','vrata','Vrbas','vrbik','vrbov','vrcav','vrčić','vreća','vreli','vrelo','vreǌe','vreva','vrgaǌ','vrhǌe','vrije','vriju','vrimo','vrite',
'vriti','vrlet','vrpca','vrsni','vrsta','vršak','vršen','vršni','vrtan','vrtić','vrtni','vrtǌa','vruci','vruǉa','vrzin','vučak','vučen','vučić','vučji','vučko',
'vučni','vulva','vunen','zabat','zabit','Zabok','začas','začet','začin','zadah','zadak','zadan','Zadar','zadat','zadǌi','zadrt','zahod','zajam','zajeb','zajeo',
'zakon','zakup','zalaz','zalet','zalog','zalud','zaǉev','zamah','zamak','zamet','zamka','zamor','zanat','zanos','zaova','zapad','zapah','zapet','zapis','zapor',
'zapru','zapuh','zarad','zarez','zaron','zarub','zasad','zasun','zašto','zatim','zaton','zator','zatrt','zavod','zavoj','zavor','zavri','zaziv','zazor','zbiǉa',
'zbiti','zbjeg','zbrda','zbrka','zbroj','zdaǌe','zdola','zdrav','zdrug','zebǌa','zebra','zecom','zečić','zečji','zefir','zelen','zelot','zemǉa','zemni','Zemun',
'zenit','Zenon','zglob','zgoda','zgura','zidar','zidić','zidni','ziđem','zijan','zijev','zimus','zipka','Zlata','zlato','zloba','zloća','zmija','znači','znati',
'zoben','zobun','zombi','Zoran','Zorka','zorni','zraka','zreli','zreǌe','zriti','zrnat','zrnce','zubac','zubar','zubat','zubić','zubǉa','zubni','zujav','zuluf',
'zulum','zvati','zveka','zvono','žabac','žabar','žabǉi','žagor','žaket','žalac','žalba','žaǉen','žamor','žaǌem','žaǌeš','žaoka','žarač','žaren','žarki','žarni',
'žbica','žbuka','žbuǌe','ždral','žedni','Žeǉka','Žeǉko','žeǉni','žemǉa','ženik','ženka','žeǌen','Žepče','žešći','žeton','žetva','žezlo','žežen','žicar','žičan',
'žični','židak','Židov','žilav','žilet','žilni','žitak','žiteǉ','žitki','žitni','živac','živad','živaǉ','živež','živǉi','život','žižak','žlica','žnora','žohar',
'žrtva','žrvaǌ','žubor','žučni','žudni','žudǌa','žuđen','žuǉav','župan','župni','žurba','žuren','žurni','žvala'].map(word => word.toUpperCase());