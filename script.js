const GameBoard = (() => {
    const board = [];

    const resetBoard = () => {
        for (let i = 0; i < 9; i++) board[i] = null;
    };

    const isTaken = (i) => board[i] !== null;

    const placeInput = (i, player) => { board[parseInt(i)] = player; };

    const getBoard = () => [...board];

    const checkWinner = () => {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let [a, b, c] of wins) {
            if (board[a] && board[a] === board[b] && board[b] === board[c]) {
                return [a, b, c];
            }
        }
        return null;
    };

    const checkDraw = () => board.every(cell => cell !== null);

    return { resetBoard, isTaken, placeInput, getBoard, checkWinner, checkDraw };
})();

const Display = (() => {
    const renderBoard = (winCells = []) => {
        const board = GameBoard.getBoard();
        const boxes = document.querySelectorAll('.input-box');
        boxes.forEach((box, i) => {
            box.innerHTML = '';
            box.className = 'input-box';
            if (board[i] === 'X') {
                box.innerHTML = 'X';
                box.firstChild && (box.firstChild.className = 'mark-x');
                const span = document.createElement('span');
                span.textContent = 'X';
                span.className = 'mark-x';
                box.innerHTML = '';
                box.appendChild(span);
                box.classList.add('taken');
            } else if (board[i] === 'O') {
                const span = document.createElement('span');
                span.textContent = 'O';
                span.className = 'mark-o';
                box.appendChild(span);
                box.classList.add('taken');
            }
            if (winCells.includes(i)) box.classList.add('win-cell');
        });
    };

    const setStatus = (msg, cls = '') => {
        const el = document.getElementById('status');
        el.textContent = msg;
        el.className = 'status ' + cls;
    };

    const setButton = (label) => {
        document.getElementById('start-btn').textContent = label;
    };

    const showWinOverlay = (show) => {
        document.getElementById('win-overlay').classList.toggle('show', show);
    };

    return { renderBoard, setStatus, setButton, showWinOverlay };
})();

const GameController = (() => {
    let currentPlayer, player1, player2, gameover, started;
    let scores = { X: 0, O: 0, D: 0 };

    const updateScores = () => {
        document.getElementById('score-x').textContent = scores.X;
        document.getElementById('score-o').textContent = scores.O;
        document.getElementById('score-d').textContent = scores.D;
    };

    const handleStart = () => {
        gameover = false;
        started = true;
        GameBoard.resetBoard();
        player1 = 'X';
        player2 = 'O';
        currentPlayer = player1;
        Display.renderBoard();
        Display.setButton('RESTART');
        Display.setStatus(`PLAYER 1 (X) TURN`, 'player-x');
        Display.showWinOverlay(false);
    };

    const handleRestart = () => {
        started = false;
        gameover = false;
        GameBoard.resetBoard();
        Display.renderBoard();
        Display.setButton('START');
        Display.setStatus('PRESS START', 'idle');
        Display.showWinOverlay(false);
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const handleCellClick = (e) => {
        if (!started || gameover) return;
        const index = parseInt(e.target.closest('.input-box').id);
        if (isNaN(index)) return;
        if (GameBoard.isTaken(index)) {
            Display.setStatus('ALREADY TAKEN! TRY AGAIN', 'invalid');
            return;
        }

        GameBoard.placeInput(index, currentPlayer);
        const winCells = GameBoard.checkWinner();

        if (winCells) {
            Display.renderBoard(winCells);
            scores[currentPlayer]++;
            updateScores();
            Display.setStatus(`PLAYER ${currentPlayer === 'X' ? '1' : '2'} (${currentPlayer}) WINS! 🏆`, 'winner');
            Display.showWinOverlay(true);
            gameover = true;
            return;
        }

        if (GameBoard.checkDraw()) {
            Display.renderBoard();
            scores.D++;
            updateScores();
            Display.setStatus('DRAW! GREAT MATCH!', 'draw');
            gameover = true;
            return;
        }

        Display.renderBoard();
        switchPlayer();
        const pNum = currentPlayer === 'X' ? '1' : '2';
        Display.setStatus(`PLAYER ${pNum} (${currentPlayer}) TURN`, `player-${currentPlayer.toLowerCase()}`);
    };

    //Events
    document.getElementById('game-board').addEventListener('click', (e) => {
        const box = e.target.closest('.input-box');
        if (box) handleCellClick({ target: box });
    });

    document.getElementById('start-btn').addEventListener('click', () => {
        if (!started) handleStart();
        else handleRestart();
    });

    return {};
})();