import type { Metadata } from "next";
import { ChessExperience } from "./ChessExperience";
import "./chess.css";

export const metadata: Metadata = {
  title: "Live Score Chess | ideamuses",
  description: "A playable online chess prototype with legal moves, live room state, and real-time material scoring."
};

export default function OnlineChessGamePage() {
  return <ChessExperience />;
}
