import { Tournament, Registration, Match, TeamStanding, ChatMessage, UserStats } from "./types";

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: "ff_major_bermuda",
    title: "Bermuda Clash Squad Masters",
    description: "The ultimate 4v4 Clash Squad battleground. Bring your best squad to dominate the streets of Bermuda. Pro teams and rising stars face off for the title of Clash Squad Masters.",
    gameMode: "Squad",
    map: "Bermuda",
    status: "Upcoming",
    prizePool: "Rs. 150,000 PKR",
    registrationFee: "Free",
    maxTeams: 32,
    registeredCount: 28,
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
    organizerId: "org_esports_pro",
    organizerName: "Garena Elite Leagues",
    schedule: "June 25, 2026 - 6:00 PM (PST)",
    rules: [
      "Character skills: ON",
      "No hacks or third-party tools allowed. Instant DQ.",
      "Gun skins: Attributes OFF",
      "Matches will be played in standard Clash Squad Mode.",
      "All squad members must be registered. Substitutes are not allowed after bracket starts."
    ],
    createdAt: Date.now() - 172800000
  },
  {
    id: "ff_survival_cup",
    title: "Kalahari Desert Survival Cup",
    description: "Welcome to the wasteland! Navigate the ruins, survive the sandstorms, and claim the Booyah in this fast-paced battle royale tournament across Kalahari.",
    gameMode: "Squad",
    map: "Kalahari",
    status: "Ongoing",
    prizePool: "Rs. 300,000 PKR",
    registrationFee: "Rs. 300 PKR",
    maxTeams: 48,
    registeredCount: 48,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    organizerId: "org_booyah_tv",
    organizerName: "Booyah Gaming Labs",
    schedule: "Ongoing - Matches daily at 8:00 PM (PST)",
    rules: [
      "Standard Battle Royale Mode (Squads)",
      "Points calculation: Booyah! = 12 pts, 2nd = 9 pts, 3rd = 8 pts, 4th = 7 pts. Each Kill = 1 pt.",
      "Players must use their registered Free Fire UUIDs.",
      "Lobby ID & password will be shared in the match terminal 15 mins before setup."
    ],
    createdAt: Date.now() - 86400000
  },
  {
    id: "ff_duo_alpine",
    title: "Alpine Duo Snipers Showdown",
    description: "Only double-barrels and snipers! Cooperate with your partner to sneak through the snowy terrain of Alpine and snipe your way to victory.",
    gameMode: "Duo",
    map: "Alpine",
    status: "Completed",
    prizePool: "Rs. 75,000 PKR",
    registrationFee: "Free",
    maxTeams: 24,
    registeredCount: 24,
    imageUrl: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600&auto=format&fit=crop",
    organizerId: "org_esports_pro",
    organizerName: "Garena Elite Leagues",
    schedule: "June 12, 2026 - 4:00 PM (PST)",
    rules: [
      "Only sniper rifles and pistols allowed.",
      "No armor / No vests allowed (Extreme risk mode).",
      "Strict anti-cheat check on match recordings.",
      "Total points across 3 matches decide the winners."
    ],
    createdAt: Date.now() - 432000000
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: "reg_1",
    tournamentId: "ff_survival_cup",
    teamName: "Total Gaming Esports",
    captainName: "Ajjubhai",
    captainInGameId: "998822331",
    captainContact: "+91 98765 43210",
    members: [
      { name: "FozzyB", inGameId: "44332211" },
      { name: "Mafia", inGameId: "88776655" },
      { name: "Delete", inGameId: "11223344" }
    ],
    status: "Approved",
    userId: "user_sim_1",
    timestamp: Date.now() - 45000000
  },
  {
    id: "reg_2",
    tournamentId: "ff_survival_cup",
    teamName: "GodLike Esports",
    captainName: "Naman",
    captainInGameId: "777666555",
    captainContact: "+91 99999 88888",
    members: [
      { name: "Jonathan", inGameId: "10002000" },
      { name: "Zgod", inGameId: "30004000" },
      { name: "Neyo", inGameId: "50006000" }
    ],
    status: "Approved",
    userId: "user_sim_2",
    timestamp: Date.now() - 44000000
  },
  {
    id: "reg_3",
    tournamentId: "ff_survival_cup",
    teamName: "Team Elite FF",
    captainName: "KillerYT",
    captainInGameId: "111222330",
    captainContact: "+91 91234 56789",
    members: [
      { name: "Pahadi", inGameId: "444555666" },
      { name: "Iconic", inGameId: "777888999" },
      { name: "Rockey", inGameId: "333222111" }
    ],
    status: "Approved",
    userId: "user_sim_3",
    timestamp: Date.now() - 43000000
  },
  {
    id: "reg_4",
    tournamentId: "ff_survival_cup",
    teamName: "Orangutan Esports",
    captainName: "Ashwathama",
    captainInGameId: "852963147",
    captainContact: "+91 88877 66655",
    members: [
      { name: "Wonty", inGameId: "741258963" },
      { name: "Jayesh", inGameId: "963258741" },
      { name: "Akshay", inGameId: "159357258" }
    ],
    status: "Approved",
    userId: "user_sim_4",
    timestamp: Date.now() - 42500000
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: "match_survival_1",
    tournamentId: "ff_survival_cup",
    matchNumber: 1,
    map: "Kalahari",
    schedule: "June 16, 2026 - 8:00 PM (IST)",
    lobbyId: "FF_ROOM_8892",
    lobbyPassword: "booyah989",
    status: "Completed",
    results: [
      { teamName: "Total Gaming Esports", rank: 1, kills: 12, placementPoints: 12, killPoints: 12, totalPoints: 24 },
      { teamName: "Team Elite FF", rank: 2, kills: 8, placementPoints: 9, killPoints: 8, totalPoints: 17 },
      { teamName: "GodLike Esports", rank: 3, kills: 10, placementPoints: 8, killPoints: 10, totalPoints: 18 },
      { teamName: "Orangutan Esports", rank: 4, kills: 4, placementPoints: 7, killPoints: 4, totalPoints: 11 }
    ]
  },
  {
    id: "match_survival_2",
    tournamentId: "ff_survival_cup",
    matchNumber: 2,
    map: "Kalahari",
    schedule: "June 17, 2026 - 8:00 PM (IST)",
    lobbyId: "FF_ROOM_9831",
    lobbyPassword: "arena_kalahari",
    status: "Live",
    results: []
  },
  {
    id: "match_survival_3",
    tournamentId: "ff_survival_cup",
    matchNumber: 3,
    map: "Kalahari",
    schedule: "June 18, 2026 - 8:00 PM (IST)",
    lobbyId: "FF_ROOM_待定",
    lobbyPassword: "Wait for Live",
    status: "Scheduled"
  }
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "msg_1",
    tournamentId: "ff_survival_cup",
    userId: "user_sim_1",
    userName: "Ajjubhai_FF",
    message: "GG to Team Elite for that close match! Can't wait for Match 2 tonight.",
    timestamp: Date.now() - 7200000,
    role: "player"
  },
  {
    id: "msg_2",
    tournamentId: "ff_survival_cup",
    userId: "org_booyah_tv",
    userName: "GM_BooyahLobby",
    message: "Lobby details for Match 2 will be updated exactly at 7:45 PM IST in the Matches tab. Make sure your squads join within 10 minutes!",
    timestamp: Date.now() - 5400000,
    role: "organizer"
  },
  {
    id: "msg_3",
    tournamentId: "ff_survival_cup",
    userId: "user_sim_3",
    userName: "Pahadi_Snp",
    message: "Good luck everyone. Bermuda was fun, but Kalahari height advantages are crazy. Hope to see some wild playstyles.",
    timestamp: Date.now() - 3600000,
    role: "player"
  },
  {
    id: "msg_4",
    tournamentId: "ff_survival_cup",
    userId: "viewer_38",
    userName: "SniperPro99",
    message: "Pahadi is going to carry Team Elite with M82B sniper tonight. Calling it now!",
    timestamp: Date.now() - 1800000,
    role: "viewer"
  }
];

export const INITIAL_USER_STATS: UserStats = {
  userId: "user_me",
  username: "Furqan Mir",
  inGameId: "785001122",
  tournamentsJoined: 28,
  wins: 19,
  kills: 485,
  matchesPlayed: 72,
  kdRatio: 6.74,
  favoriteMap: "Kalahari"
};
