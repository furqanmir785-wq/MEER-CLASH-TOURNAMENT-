export interface Tournament {
  id: string;
  title: string;
  description: string;
  gameMode: 'Squad' | 'Duo' | 'Solo';
  map: 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra' | 'All Maps';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  prizePool: string;
  registrationFee: string;
  maxTeams: number;
  registeredCount: number;
  imageUrl: string;
  organizerId: string;
  organizerName: string;
  schedule: string;
  rules: string[];
  createdAt: number;
}

export interface Player {
  name: string;
  inGameId: string;
}

export interface Registration {
  id: string;
  tournamentId: string;
  teamName: string;
  captainName: string;
  captainInGameId: string;
  captainContact: string;
  members: Player[]; // empty for solo, 1 for duo, 3 for squad (excluding captain)
  status: 'Approved' | 'Pending' | 'Rejected';
  userId: string;
  timestamp: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  map: string;
  schedule: string;
  lobbyId: string;
  lobbyPassword: string;
  status: 'Scheduled' | 'Live' | 'Completed';
  results?: MatchResult[];
}

export interface MatchResult {
  teamName: string;
  rank: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
}

export interface TeamStanding {
  teamName: string;
  matchesPlayed: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  rankings: number[]; // rankings in matches
  booyahs: number;
}

export interface ChatMessage {
  id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  role?: 'player' | 'organizer' | 'viewer';
}

export interface UserStats {
  userId: string;
  username: string;
  inGameId: string;
  tournamentsJoined: number;
  wins: number; // Booyahs
  kills: number;
  matchesPlayed: number;
  kdRatio: number;
  favoriteMap: string;
}
