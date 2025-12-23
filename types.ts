
export interface Player {
  name: string;
  isCaptain: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  color: string;
}

export interface MatchPlayerStats {
  [playerName: string]: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    wickets: number;
    oversBowled: number;
    ballsBowled: number;
    runsConceded: number;
  }
}

export interface PlayerStats {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
}

export interface BallRecord {
  type: 'legal' | 'extra';
  runs: number;
  isWicket: boolean;
  batsman: string;
  nonStriker: string;
  bowler: string;
}

export interface MatchRecord {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  wicketsA: number;
  oversA: string;
  scoreB: number;
  wicketsB: number;
  oversB: string;
  winner: string;
  date: string;
  playerStats?: MatchPlayerStats;
}

export enum MatchStatus {
  SETUP = 'SETUP',
  INNINGS_1 = 'INNINGS_1',
  INNINGS_2 = 'INNINGS_2',
  RESULT = 'RESULT'
}

export interface PointsTableRow {
  teamName: string;
  played: number;
  won: number;
  points: number;
}
