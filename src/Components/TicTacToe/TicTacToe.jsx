import React, { useState, useRef, useEffect } from 'react';
import './TicTacToe.css';

const MultiPlayerTicTacToe = () => {
  const [playerCount, setPlayerCount] = useState(2);
  const [boardSize, setBoardSize] = useState(3);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameBoard, setGameBoard] = useState([]);
  const [scores, setScores] = useState({});
  const [lock, setLock] = useState(false);
  const [winningCells, setWinningCells] = useState([]); 
  const titleRef = useRef(null);

  const getPlayerSymbol = (index) => String.fromCharCode(65 + index);

  const getBoardSize = (players) => {
    if (players <= 3) return 3;
    return 6; 
  };

  const initializeBoard = (size) => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(" "));
    setGameBoard(newBoard);
    setCurrentPlayer(0);
    setLock(false);
    setWinningCells([]); 
    if (titleRef.current) {
      titleRef.current.innerHTML = "Multi-Player Tic Tac Toe";
    }
  };

  const initializeScores = (count) => {
    const newScores = {};
    for (let i = 0; i < count; i++) {
      newScores[getPlayerSymbol(i)] = 0;
    }
    setScores(newScores);
  };

  useEffect(() => {
    const savedScores = localStorage.getItem("ticTacToeScores");
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    } else {
      initializeScores(playerCount);
    }
    const newSize = getBoardSize(playerCount);
    setBoardSize(newSize);
    initializeBoard(newSize);
  }, [playerCount]);

  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    const newSize = getBoardSize(count);
    setBoardSize(newSize);
    initializeScores(count);
    initializeBoard(newSize);
  };
  const checkWin = (board, row, col, symbol) => {
    const size = board.length;
    const winCondition = size === 3 ? 3 : 4;
    for (let c = 0; c <= size - winCondition; c++) {
      let count = 0;
      let winningCells = [];
      for (let i = 0; i < winCondition; i++) {
        if (board[row][c + i] === symbol) {
          count++;
          winningCells.push([row, c + i]);
        }
      }
      if (count === winCondition) return winningCells;
    }
    for (let r = 0; r <= size - winCondition; r++) {
      let count = 0;
      let winningCells = [];
      for (let i = 0; i < winCondition; i++) {
        if (board[r + i][col] === symbol) {
          count++;
          winningCells.push([r + i, col]);
        }
      }
      if (count === winCondition) return winningCells;
    }
    for (let r = 0; r <= size - winCondition; r++) {
      for (let c = 0; c <= size - winCondition; c++) {
        let count = 0;
        let winningCells = [];
        for (let i = 0; i < winCondition; i++) {
          if (board[r + i][c + i] === symbol) {
            count++;
            winningCells.push([r + i, c + i]);
          }
        }
        if (count === winCondition) return winningCells;
      }
    }
    for (let r = 0; r <= size - winCondition; r++) {
      for (let c = size - 1; c >= winCondition - 1; c--) {
        let count = 0;
        let winningCells = [];
        for (let i = 0; i < winCondition; i++) {
          if (board[r + i][c - i] === symbol) {
            count++;
            winningCells.push([r + i, c - i]);
          }
        }
        if (count === winCondition) return winningCells;
      }
    }

    return null;
  };

  const handleCellClick = (row, col) => {
    if (lock || gameBoard[row][col] !== " ") return;

    const newBoard = gameBoard.map(r => [...r]);
    const symbol = getPlayerSymbol(currentPlayer);
    newBoard[row][col] = symbol;
    setGameBoard(newBoard);

    const winningSequence = checkWin(newBoard, row, col, symbol);
    if (winningSequence) {
      setLock(true);
      setWinningCells(winningSequence); 
      titleRef.current.innerHTML = `Player ${symbol} Wins!`;
      const newScores = { ...scores };
      newScores[symbol]++;
      setScores(newScores);
      localStorage.setItem("ticTacToeScores", JSON.stringify(newScores));
    } else if (newBoard.every(row => row.every(cell => cell !== " "))) {
      setLock(true);
      titleRef.current.innerHTML = "It's a Draw!";
    } else {
      setCurrentPlayer((currentPlayer + 1) % playerCount);
    }
  };

  const resetGame = () => {
    initializeBoard(boardSize);
  };

  const resetScores = () => {
    const newScores = {};
    for (let i = 0; i < playerCount; i++) {
      newScores[getPlayerSymbol(i)] = 0;
    }
    setScores(newScores);
    localStorage.removeItem("ticTacToeScores");
  };

  return (
    <div className="container">
      <h1 className="title" ref={titleRef}>Multi-Player Tic Tac Toe</h1>
      
      <div className="controls">
        <select 
          className="player-select"
          value={playerCount}
          onChange={(e) => handlePlayerCountChange(Number(e.target.value))}
        >
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
          <option value={5}>5 Players</option>
        </select>
      </div>

      <div className="scoreboard">
        {Object.entries(scores).map(([player, score]) => (
          <div key={player} className={`score ${player === getPlayerSymbol(currentPlayer) ? 'active' : ''}`}>
            Player {player}: {score}
          </div>
        ))}
      </div>

      <div className="board">
        {gameBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => {
              const isWinningCell = winningCells.some(([r, c]) => r === rowIndex && c === colIndex);
              return (
                <div
                  key={colIndex}
                  className={`boxes ${cell !== " " ? "filled" : ""} ${isWinningCell ? "winning-cell" : ""}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell !== " " && <span className="player-symbol">{cell}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="button-container">
        <button className="reset" onClick={resetGame}>Reset Game</button>
        <button className="resets" onClick={resetScores}>Reset Scores</button>
      </div>
    </div>
  );
};

export default MultiPlayerTicTacToe;
