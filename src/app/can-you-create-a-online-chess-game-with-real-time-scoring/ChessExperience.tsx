"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Chess, type Move, type Square } from "chess.js";
import {
  Clipboard,
  Crown,
  FlipHorizontal2,
  History,
  RotateCcw,
  Share2,
  Signal,
  Trophy,
  Undo2,
} from "lucide-react";

const pieceGlyphs: Record<string, string> = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};

const pieceValues: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

type Score = {
  white: number;
  black: number;
  balance: number;
};

type RoomPayload = {
  fen: string;
  at: number;
};

function squareFrom(row: number, column: number, flipped: boolean) {
  const fileIndex = flipped ? 7 - column : column;
  const rank = flipped ? row + 1 : 8 - row;
  return `${"abcdefgh"[fileIndex]}${rank}` as Square;
}

function boardSquares(flipped: boolean) {
  return Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, column) => squareFrom(row, column, flipped))
  );
}

function scoreGame(chess: Chess): Score {
  const captured = chess.history({ verbose: true }).reduce(
    (total, move) => {
      if (move.captured) {
        if (move.color === "w") total.white += pieceValues[move.captured];
        if (move.color === "b") total.black += pieceValues[move.captured];
      }
      return total;
    },
    { white: 0, black: 0 }
  );

  return {
    ...captured,
    balance: captured.white - captured.black,
  };
}

function statusFor(chess: Chess) {
  if (chess.isCheckmate()) {
    return `${chess.turn() === "w" ? "Black" : "White"} wins by checkmate`;
  }
  if (chess.isDraw()) return "Draw";
  if (chess.isCheck()) return `${chess.turn() === "w" ? "White" : "Black"} is in check`;
  return `${chess.turn() === "w" ? "White" : "Black"} to move`;
}

function clockText(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function ChessExperience() {
  const [fen, setFen] = useState(() => new Chess().fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [roomCode] = useState("BOARD1");
  const [copied, setCopied] = useState(false);

  const chess = useMemo(() => new Chess(fen), [fen]);
  const score = useMemo(() => scoreGame(chess), [chess]);
  const legalTargets = useMemo(() => {
    if (!selected) return new Set<Square>();
    return new Set(chess.moves({ square: selected, verbose: true }).map((move) => move.to));
  }, [chess, selected]);
  const moves = chess.history({ verbose: true });
  const grid = boardSquares(flipped);
  const roomKey = `ideamuses-chess-${roomCode}`;
  const elapsed = clockText(seconds);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel(roomKey);
    const payload: RoomPayload = { fen, at: Date.now() };
    localStorage.setItem(roomKey, JSON.stringify(payload));
    channel.postMessage(payload);

    channel.onmessage = (event: MessageEvent<RoomPayload>) => {
      if (event.data?.fen && event.data.fen !== fen) {
        setFen(event.data.fen);
        setSelected(null);
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== roomKey || !event.newValue) return;
      const next = JSON.parse(event.newValue) as RoomPayload;
      if (next.fen && next.fen !== fen) {
        setFen(next.fen);
        setSelected(null);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      channel.close();
      window.removeEventListener("storage", onStorage);
    };
  }, [fen, roomKey]);

  function updateGame(next: Chess) {
    setFen(next.fen());
    setSelected(null);
  }

  function chooseSquare(square: Square) {
    const piece = chess.get(square);

    if (selected && legalTargets.has(square)) {
      const next = new Chess(fen);
      next.move({ from: selected, to: square, promotion: "q" });
      updateGame(next);
      return;
    }

    if (piece?.color === chess.turn()) {
      setSelected(square);
      return;
    }

    setSelected(null);
  }

  function resetGame() {
    updateGame(new Chess());
  }

  function undoMove() {
    const next = new Chess(fen);
    next.undo();
    updateGame(next);
  }

  async function copyRoom() {
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    await navigator.clipboard.writeText(url.toString());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <main className="live-chess">
      <div className="live-chess-shell">
        <header className="live-chess-header">
          <Link href="/" className="live-chess-brand" aria-label="ideamuses home">
            <Crown aria-hidden="true" />
            ideamuses
          </Link>
          <div className="live-chess-room">
            <Signal aria-hidden="true" />
            <span>{roomCode}</span>
          </div>
        </header>

        <section className="live-chess-layout" aria-label="Live score chess board">
          <div className="live-chess-stage">
            <div className="live-chess-scorebar" aria-label="Scoreboard">
              <div className="live-chess-player white">
                <span>White</span>
                <strong>{score.white}</strong>
              </div>
              <div className="live-chess-status">
                <span>{elapsed}</span>
                <strong>{statusFor(chess)}</strong>
              </div>
              <div className="live-chess-player black">
                <span>Black</span>
                <strong>{score.black}</strong>
              </div>
            </div>

            <div className="live-chess-board" role="grid" aria-label="Chess board">
              {grid.flat().map((square) => {
                const piece = chess.get(square);
                const dark = (square.charCodeAt(0) + Number(square[1])) % 2 === 1;
                const active = selected === square;
                const legal = legalTargets.has(square);
                const lastMove = moves.at(-1);
                const recent = lastMove?.from === square || lastMove?.to === square;

                return (
                  <button
                    className={[
                      "live-chess-square",
                      dark ? "dark" : "light",
                      active ? "active" : "",
                      legal ? "legal" : "",
                      recent ? "recent" : "",
                    ].join(" ")}
                    key={square}
                    onClick={() => chooseSquare(square)}
                    role="gridcell"
                    type="button"
                    aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`}
                  >
                    <span className={`piece ${piece?.color === "w" ? "white-piece" : "black-piece"}`}>
                      {piece ? pieceGlyphs[`${piece.color}${piece.type}`] : ""}
                    </span>
                    <small>{square}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="live-chess-control" aria-label="Game controls">
            <div className="live-chess-lead">
              <Trophy aria-hidden="true" />
              <span>Material</span>
              <strong>
                {score.balance === 0
                  ? "Even"
                  : `${score.balance > 0 ? "White" : "Black"} +${Math.abs(score.balance)}`}
              </strong>
            </div>

            <div className="live-chess-actions">
              <button type="button" onClick={() => setFlipped((value) => !value)} title="Flip board">
                <FlipHorizontal2 aria-hidden="true" />
                <span>Flip</span>
              </button>
              <button type="button" onClick={undoMove} disabled={moves.length === 0} title="Undo move">
                <Undo2 aria-hidden="true" />
                <span>Undo</span>
              </button>
              <button type="button" onClick={resetGame} title="Reset game">
                <RotateCcw aria-hidden="true" />
                <span>Reset</span>
              </button>
              <button type="button" onClick={copyRoom} title="Copy room link">
                {copied ? <Clipboard aria-hidden="true" /> : <Share2 aria-hidden="true" />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>

            <div className="live-chess-panel">
              <div className="live-chess-panel-title">
                <History aria-hidden="true" />
                <span>Moves</span>
              </div>
              <ol className="live-chess-moves">
                {moves.length ? (
                  moves.map((move: Move, index) => (
                    <li key={`${move.lan}-${index}`}>
                      <span>{Math.floor(index / 2) + 1}{index % 2 === 0 ? "." : "..."}</span>
                      <strong>{move.san}</strong>
                    </li>
                  ))
                ) : (
                  <li className="empty">New game</li>
                )}
              </ol>
            </div>

            <div className="live-chess-feed">
              <span>Realtime</span>
              <strong>{chess.isGameOver() ? "Final" : "Synced"}</strong>
              <p>{chess.fen()}</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
