'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderCell(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function disableContextMenu() {
    const noContext = document.getElementById('noContextMenu');

    noContext.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
}