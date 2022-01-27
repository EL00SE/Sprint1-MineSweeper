'use strict'

const BOMB = '💣';
const FLAG = '🚩';
const SMILE = '😀';
const BLOWUP = '🤯';
const WINNER = '😎';
const HP = '❤️';

var gDiff = 1;
var gFirstClick;
var gBoard;
var gLives = 1;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};
setBeginner();
init();

function init() {
    disableContextMenu();
    document.getElementById("smileyBtn").innerText = SMILE;
    gFirstClick = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gBoard = buildBoard();
    renderBoard(gBoard);
    document.getElementById("timer").innerText = 0;
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    return board;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (board[i][j].isMine) board[i][j].minesAroundCount = 0;
            else negsCount(board, i, j);
        }
    }
}

function negsCount(board, row, col) {
    var count = 0;
    var rowStart = 0;
    var rowEnd = board.length - 1;
    var colStart = 0;
    var colEnd = board[0].length - 1;
    if (row > 0) rowStart = row - 1;
    if (row < board.length - 1) rowEnd = row + 1;
    if (col > 0) colStart = col - 1;
    if (col < board[0].length - 1) colEnd = col + 1;
    for (var i = rowStart; i <= rowEnd; i++)
        for (var j = colStart; j <= colEnd; j++)
            if (board[i][j].isMine) count++;
    board[row][col].minesAroundCount = count;
}

function renderBoard() {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '\t<tr>\n';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var id = i + ',' + j
            strHTML += `<td id=${id} class="cell" onMouseDown=readMouse(this,${i},${j})></td>\n`
        }
        strHTML += '\t</tr>\n'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.board-container');
    elContainer.innerHTML = strHTML;
}

function readMouse(elCell, i, j) {
    if (gGame.isOn || gFirstClick) {
        var rightclick;
        var e = window.event;
        if (e.which) rightclick = (e.which == 3);
        else if (e.button) rightclick = (e.button == 2);
        if (rightclick) cellMarked(elCell, i, j)
        else cellClicked(elCell, i, j);
        checkGameOver();
    }
}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown)
        return;
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        gBoard[i][j].isShown = false;
        elCell.innerText = '';
        gGame.markedCount--;

    } else {
        gBoard[i][j].isMarked = true;
        gBoard[i][j].isShown = true;
        elCell.innerText = FLAG;
        gGame.markedCount++
    }
}

function cellClicked(elCell, i, j) {
    if (gFirstClick) {
        var l = gLevel.MINES;
        while (l > 0) {
            var rowIdx = getRandomIntInclusive(0, (gLevel.SIZE - 1));
            var colIdx = getRandomIntInclusive(0, (gLevel.SIZE - 1));
            if (!gBoard[rowIdx][colIdx].isMine) {
                if ((rowIdx === i) && (colIdx === j)) continue;
                gBoard[rowIdx][colIdx].isMine = true;
                l--;
            }
        }
        gGame.isOn = true;
        setMinesNegsCount(gBoard);
        setTimer();
        gFirstClick = false;
    }
    if (gGame.isOn) {
        if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return;
        if (gBoard[i][j].isMine) {
            elCell.innerText = BOMB;
            gLives--;
            setLives(gLives);
            gBoard[i][j].isShown = true;
            gGame.shownCount++;
            elCell.classList.add("shown");
        } else if (gBoard[i][j].minesAroundCount > 0) {
            elCell.innerText = gBoard[i][j].minesAroundCount;
            colorNumbers(elCell, i, j)
            gBoard[i][j].isShown = true;
            gGame.shownCount++;
            elCell.classList.add("shown");
        }
        else if (gBoard[i][j].minesAroundCount === 0) {
            expandShown(gBoard, elCell, i, j);
        }

    }
}

function colorNumbers(elCell, i, j) {
    var num = gBoard[i][j].minesAroundCount;
    switch (num) {
        case 1:
            elCell.classList.add("cell-one");
            break;
        case 2:
            elCell.classList.add("cell-two");
            break;
        case 3:
            elCell.classList.add("cell-three");
            break;
        case 4:
            elCell.classList.add("cell-four");
            break;
        case 5:
            elCell.classList.add("cell-five");
            break;
        case 6:
            elCell.classList.add("cell-six");
            break;
        case 7:
            elCell.classList.add("cell-seven");
            break;
        case 8:
            elCell.classList.add("cell-eight");
            break;
    }
}

function checkGameOver() {
    if (gLives === 0) {
        gGame.isOn = false;
        document.getElementById("smileyBtn").innerText = BLOWUP;
        return;
    }
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        gGame.isOn = false;
        document.getElementById("smileyBtn").innerText = WINNER;
        // setScore();
        return;
    }
}
//Bonus: recursive expansion!
function expandShown(board, elCell, i, j) {
    if (board[i][j].isMine || board[i][j].isShown || board[i][j].isMarked) return;
    if ((board[i][j].minesAroundCount > 0)) {
        gBoard[i][j].isShown = true;
        elCell.innerText = gBoard[i][j].minesAroundCount;
        colorNumbers(elCell, i, j);
        gGame.shownCount++;
        elCell.classList.add("shown");
        return;
    }
    if (board[i][j].minesAroundCount === 0) {
        gBoard[i][j].isShown = true;
        colorNumbers(elCell, i, j);
        gGame.shownCount++;
        elCell.classList.add("shown")
        var iDown = i + 1;
        var jRight = j + 1
        var iUp = i - 1;
        var jLeft = j - 1;
        if (iDown < gLevel.SIZE) {
            expandShown(board, document.getElementById(`${iDown},${j}`), iDown, j);
            if (jRight < gLevel.SIZE)
                expandShown(board, document.getElementById(`${iDown},${jRight}`), iDown, jRight);
            if (jLeft >= 0)
                expandShown(board, document.getElementById(`${iDown},${jLeft}`), iDown, jLeft);
        }
        if (jRight < gLevel.SIZE)
            expandShown(board, document.getElementById(`${i},${jRight}`), i, jRight);
        if (jLeft >= 0)
            expandShown(board, document.getElementById(`${i},${jLeft}`), i, jLeft);
        if (iUp >= 0) {
            expandShown(board, document.getElementById(`${iUp},${j}`), iUp, j);
            if (jRight < gLevel.SIZE)
                expandShown(board, document.getElementById(`${iUp},${jRight}`), iUp, jRight);
            if (jLeft >= 0)
                expandShown(board, document.getElementById(`${iUp},${jLeft}`), iUp, jLeft);
        }
    }
    return;
}

function clickSmiley() {
    setDiff(gDiff)
    init();
}

function setDiff(gDiff) {
    if (gDiff === 1)
        setBeginner()
    if (gDiff === 2)
        setIntermediate();
    if (gDiff === 3)
        setExpert();
}

function setBeginner() {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    gLives = 1;
    gDiff = 1;
    gGame.isOn = false;
    setLives(1);
    init();
}

function setIntermediate() {
    gLevel.SIZE = 8;
    gLevel.MINES = 12;
    gLives = 2;
    gDiff = 2;
    gGame.isOn = false;
    setLives(2);
    init();
}

function setExpert() {
    gLevel.SIZE = 12;
    gLevel.MINES = 30;
    gLives = 3;
    gDiff = 3;
    gGame.isOn = false;
    setLives(3);
    init();
}

function setLives(count) {
    var str = '';
    for (var i = 0; i < count; i++)
        str += HP;
    document.getElementById("liveBox").innerText = str;
}

function setTimer() {
    var x = setInterval(function () {
        if (!gGame.isOn) clearInterval(x);
        document.getElementById("timer").innerText = gGame.secsPassed++;

    }, 1000);
}

// function setScore() {
//     localStorage.setItem("name","time")
//     localStorage.name=prompt("Enter your name");
//     localStorage.time=gGame.secsPassed;
//     var highScore=Infinity;
//     for (var score in localStorage.getItem("time"))
//         if (highScore>score) highScore=score;
//     document.getElementById("highScore").innerText = localStorage.getItem("time").name;
// }