
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Move {
  from: string;
  to: string;
  piece: PieceType;
  color: Color;
  san: string;
  captured?: PieceType;
}

export interface GameState {
  fen: string;
  history: Move[];
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  winner: Color | 'draw' | null;
}

export interface AnalysisResult {
  evaluation: string;
  bestMove: string;
  commentary: string;
  suggestedLine: string[];
}
