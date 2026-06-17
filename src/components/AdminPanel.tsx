import React, { useState } from "react";
import { Tournament, Registration, Match, MatchResult, Player } from "../types";
import { Plus, Trash2, Edit3, Settings, ShieldCheck, Check, X, FileSpreadsheet, KeyRound, Radio } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  tournaments: Tournament[];
  registrations: Registration[];
  matches: Match[];
  onCreateTournament: (tournament: Omit<Tournament, "id" | "createdAt" | "registeredCount">) => Promise<void>;
  onUpdateRegistrationStatus: (regId: string, status: Registration['status']) => Promise<void>;
  onCreateMatch: (match: Omit<Match, "id">) => Promise<void>;
  onSaveMatchResults: (matchId: string, results: MatchResult[]) => Promise<void>;
  onUpdateMatchStatus: (matchId: string, status: Match['status']) => Promise<void>;
  onUpdateMatchLobby: (matchId: string, lobbyId: string, lobbyPassword: string) => Promise<void>;
}

export default function AdminPanel({
  tournaments,
  registrations,
  matches,
  onCreateTournament,
  onUpdateRegistrationStatus,
  onCreateMatch,
  onSaveMatchResults,
  onUpdateMatchStatus,
  onUpdateMatchLobby
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'registrations' | 'matches'>('create');
  
  // Create Tournament State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMode, setNewMode] = useState<'Squad' | 'Duo' | 'Solo'>('Squad');
  const [newMap, setNewMap] = useState<Tournament['map']>('All Maps');
  const [newPrize, setNewPrize] = useState("Rs. 150,000 PKR");
  const [newFee, setNewFee] = useState("Free");
  const [newMaxTeams, setNewMaxTeams] = useState(32);
  const [newSchedule, setNewSchedule] = useState("June 30, 2026 - 7:00 PM (PKT)");
  const [newImageUrl, setNewImageUrl] = useState("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Select tournament context for registers/matches
  const [selectedTourneyId, setSelectedTourneyId] = useState(tournaments[0]?.id || "");

  // Create Match State
  const [matchNumber, setMatchNumber] = useState(1);
  const [matchMap, setMatchMap] = useState("Bermuda");
  const [matchSchedule, setMatchSchedule] = useState("June 20, 2026 - 8:00 PM (IST)");
  const [lobbyId, setLobbyId] = useState("");
  const [lobbyPassword, setLobbyPassword] = useState("");

  // Log Match Results State
  const [activeScoreMatchId, setActiveScoreMatchId] = useState<string | null>(null);
  const [scoreResults, setScoreResults] = useState<Omit<MatchResult, "placementPoints" | "killPoints" | "totalPoints">[]>([]);

  // Update Lobby Credentials State
  const [activeLobbyMatchId, setActiveLobbyMatchId] = useState<string | null>(null);
  const [tempLobbyId, setTempLobbyId] = useState("");
  const [tempLobbyPwd, setTempLobbyPwd] = useState("");

  // Presets banners
  const bannerPresets = [
    { name: "Bermuda Street", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600" },
    { name: "Kalahari Wasteland", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600" },
    { name: "Alpine SnowyPeak", url: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=600" }
  ];

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreateTournament({
        title: newTitle,
        description: newDesc,
        gameMode: newMode,
        map: newMap,
        status: "Upcoming",
        prizePool: newPrize,
        registrationFee: newFee,
        maxTeams: Number(newMaxTeams),
        imageUrl: newImageUrl,
        organizerId: "org_me",
        organizerName: "Host Admin Hub",
        schedule: newSchedule,
        rules: [
          "No emulator players allowed unless explicitly agreed.",
          "Must record final match placements screens in case of disputed logs.",
          "Toxicity or verbal slurs leads to instantaneous squad disqualification."
        ]
      });

      setStatusMessage("Tournament Created Successfully! Feel free to view it under Explore.");
      setNewTitle("");
      setNewDesc("");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourneyId) return;

    try {
      await onCreateMatch({
        tournamentId: selectedTourneyId,
        matchNumber: Number(matchNumber),
        map: matchMap,
        schedule: matchSchedule,
        lobbyId: lobbyId || "TBD",
        lobbyPassword: lobbyPassword || "TBD",
        status: "Scheduled"
      });
      setMatchNumber(prev => prev + 1);
      setLobbyId("");
      setLobbyPassword("");
      setStatusMessage("Match added to timeline!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Open scores entry panel
  const handleOpenScoresPanel = (match: Match) => {
    setActiveScoreMatchId(match.id);
    
    // Get all approved registered squads for that tournament
    const approvedTeams = registrations
      .filter((r) => r.tournamentId === match.tournamentId && r.status === "Approved")
      .map((r) => r.teamName);

    // If there are no approved squads, use default registered teams or preset list
    const teamList = approvedTeams.length > 0 ? approvedTeams : ["Total Gaming Esports", "Team Elite FF", "GodLike Esports", "Orangutan Esports"];

    const initialResults = teamList.map((teamName) => {
      // Find historical results if already present, otherwise set default
      const prevResult = match.results?.find((r) => r.teamName === teamName);
      return {
        teamName,
        rank: prevResult?.rank || 1,
        kills: prevResult?.kills || 0
      };
    });

    setScoreResults(initialResults);
  };

  const handleScoreChange = (index: number, key: 'rank' | 'kills', value: number) => {
    const updated = [...scoreResults];
    updated[index] = { ...updated[index], [key]: value };
    setScoreResults(updated);
  };

  const handleSaveScores = async () => {
    if (!activeScoreMatchId) return;

    // Standard Free Fire Point Table Calculation
    const getPlacementPoints = (rank: number) => {
      switch (rank) {
        case 1: return 12; // Booyah!
        case 2: return 9;
        case 3: return 8;
        case 4: return 7;
        case 5: return 6;
        case 6: return 5;
        case 7: return 4;
        case 8: return 3;
        case 9: return 2;
        case 10: return 1;
        default: return 0;
      }
    };

    const finalResults: MatchResult[] = scoreResults.map((item) => {
      const placementPoints = getPlacementPoints(item.rank);
      const killPoints = item.kills * 1; // 1 point per kill
      return {
        ...item,
        placementPoints,
        killPoints,
        totalPoints: placementPoints + killPoints
      };
    });

    try {
      await onSaveMatchResults(activeScoreMatchId, finalResults);
      await onUpdateMatchStatus(activeScoreMatchId, "Completed");
      setActiveScoreMatchId(null);
      setStatusMessage("Match scores logged & standings updated!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    }
  };

  const handleLobbySave = async (matchId: string) => {
    try {
      await onUpdateMatchLobby(matchId, tempLobbyId, tempLobbyPwd);
      setActiveLobbyMatchId(null);
      setStatusMessage("Lobby Room ID & Password updated!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Control Banner */}
      <div className="bg-gradient-to-r from-orange-600/10 via-zinc-950 to-zinc-950 p-6 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-orange-500" />
          Tournament Host & Organizer Hub
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Authorized panel. Create customized tournaments, review user squads, set lobby room credentials, and enter match scores. Placements and standings automatically sync immediately!
        </p>

        {/* Tab Selection */}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
              activeTab === 'create'
                ? "bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/20"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            Create Tournament
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
              activeTab === 'registrations'
                ? "bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/20"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            Manage Squads
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
              activeTab === 'matches'
                ? "bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-950/20"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            Bermuda Lobbies & Scores
          </button>
        </div>
      </div>

      <div className="p-6">
        {statusMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 font-semibold mb-6 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {statusMessage}
          </div>
        )}

        {/* CREATE TOURNAMENT TAB */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateTournament} className="max-w-3xl space-y-5">
            <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
              Step 1: Tournament Parameters
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Tournament Title</label>
                <input
                  id="admin-tourney-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Free Fire All Stars League"
                  className="w-full bg-zinc-900 border border-zinc-805 hover:border-zinc-700 focus:border-orange-500 p-2.5 rounded-lg text-xs text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Map Location</label>
                <select
                  value={newMap}
                  onChange={(e) => setNewMap(e.target.value as Tournament['map'])}
                  className="w-full bg-zinc-900 border border-zinc-805 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Bermuda">Bermuda</option>
                  <option value="Purgatory">Purgatory</option>
                  <option value="Kalahari">Kalahari</option>
                  <option value="Alpine">Alpine</option>
                  <option value="Nexterra">Nexterra</option>
                  <option value="All Maps">All Maps (Cycle)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Details, prize splits, organizer details or custom rules..."
                className="w-full bg-zinc-900 border border-zinc-805 hover:border-zinc-700 focus:border-orange-500 p-3 rounded-lg text-xs text-white h-20 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Game Format Mode</label>
                <select
                  value={newMode}
                  onChange={(e) => setNewMode(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-805 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                >
                  <option value="Squad">Squads (4v4/BR)</option>
                  <option value="Duo">Duo Match</option>
                  <option value="Solo">Solo Showdown</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Tournament Prize Pool</label>
                <input
                  value={newPrize}
                  onChange={(e) => setNewPrize(e.target.value)}
                  placeholder="e.g. Rs. 150,000 PKR"
                  className="w-full bg-zinc-900 border border-zinc-805 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium font-mono">Entry / Registration Fee</label>
                <input
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  placeholder="e.g. Free or Rs. 150/team"
                  className="w-full bg-zinc-900 border border-zinc-805 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Schedule Timeline</label>
                <input
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  placeholder="e.g. June 25, 2026 - 6:00 PM IST"
                  className="w-full bg-zinc-900 border border-zinc-805 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Max Teams Limit</label>
                <input
                  type="number"
                  value={newMaxTeams}
                  onChange={(e) => setNewMaxTeams(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-805 p-2.5 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium block">Cover Banner URL</label>
              <input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Unsplash / external image link"
                className="w-full bg-zinc-900 border border-zinc-805 p-2.5 rounded-lg text-[11px] text-zinc-400 focus:outline-none"
              />
              <div className="flex gap-2 mt-1.5">
                {bannerPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setNewImageUrl(preset.url)}
                    className="text-[9px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-2 py-1 rounded transition-colors"
                  >
                    Preset: {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="admin-create-tournament-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg disabled:opacity-40 shrink-0 cursor-pointer"
            >
              {isSubmitting ? "Generating..." : "Deploy Tournament"}
            </button>
          </form>
        )}

        {/* MANAGE SQUADS REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tournament Selector</h4>
                <select
                  value={selectedTourneyId}
                  onChange={(e) => setSelectedTourneyId(e.target.value)}
                  className="mt-1.5 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white focus:outline-none font-semibold"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.gameMode})</option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-zinc-500 font-medium">
                Approved: <span className="text-emerald-400 font-bold">{registrations.filter(r => r.tournamentId === selectedTourneyId && r.status === "Approved").length} Teams</span> | Pending: <span className="text-amber-500 font-bold">{registrations.filter(r => r.tournamentId === selectedTourneyId && r.status === "Pending").length} Teams</span>
              </div>
            </div>

            {registrations.filter(r => r.tournamentId === selectedTourneyId).length === 0 ? (
              <p className="text-zinc-500 text-xs text-center py-8">No squads have registered for this tournament yet. Encourage players to sign up!</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {registrations
                  .filter((r) => r.tournamentId === selectedTourneyId)
                  .map((reg) => (
                    <div key={reg.id} className="bg-zinc-900 border border-zinc-800/80 p-4.5 rounded-xl space-y-3.5 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                          <h5 className="font-bold text-white text-sm">{reg.teamName}</h5>
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                            reg.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : reg.status === "Pending"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {reg.status}
                          </span>
                        </div>

                        {/* Player credentials */}
                        <div className="mt-3.5 space-y-1.5 text-xs">
                          <p className="text-zinc-400">
                            Captain: <span className="text-white font-semibold">{reg.captainName}</span> ({reg.captainInGameId})
                          </p>
                          <p className="text-zinc-400">
                            Contact: <span className="text-blue-400 font-medium font-mono">{reg.captainContact}</span>
                          </p>
                          
                          {reg.members && reg.members.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-zinc-800/60">
                              <span className="text-[10px] text-zinc-500 block uppercase tracking-wide font-semibold mb-1">Squad Members</span>
                              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
                                {reg.members.map((m, i) => (
                                  <div key={i} className="bg-zinc-950 p-1.5 rounded border border-zinc-805 truncate">
                                    {m.name} ({m.inGameId})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action trigger */}
                      {reg.status !== "Approved" && (
                        <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-850">
                          <button
                            onClick={() => onUpdateRegistrationStatus(reg.id, "Approved")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => onUpdateRegistrationStatus(reg.id, "Rejected")}
                            className="bg-zinc-850 hover:bg-red-650 text-zinc-400 hover:text-white text-xs font-bold py-2 px-3.5 rounded flex items-center justify-center cursor-pointer transition-colors"
                            title="Decline registration"
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* BERMUDA LOBBIES & MATCHES TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tournament Lobbies & Matches Config</h4>
                <select
                  value={selectedTourneyId}
                  onChange={(e) => setSelectedTourneyId(e.target.value)}
                  className="mt-1.5 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-xs text-white focus:outline-none font-semibold"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.map})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-section grid: Create new match Lobby entry */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Form: Add Match */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-orange-500" />
                  Add Match Session
                </h4>

                <form onSubmit={handleCreateMatchSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase font-semibold">Match #</label>
                      <input
                        type="number"
                        value={matchNumber}
                        onChange={(e) => setMatchNumber(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase font-semibold">Map</label>
                      <input
                        value={matchMap}
                        onChange={(e) => setMatchMap(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white"
                        placeholder="e.g. Bermuda"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold">Schedule Time</label>
                    <input
                      value={matchSchedule}
                      onChange={(e) => setMatchSchedule(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white"
                      placeholder="e.g. Today - 8:00 PM (IST)"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold">Pre-set Room ID (Optional)</label>
                    <input
                      value={lobbyId}
                      onChange={(e) => setLobbyId(e.target.value)}
                      placeholder="e.g. FF_ROOM_8812"
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 uppercase font-semibold">Lobby Room Password</label>
                    <input
                      value={lobbyPassword}
                      onChange={(e) => setLobbyPassword(e.target.value)}
                      placeholder="e.g. booyah9"
                      className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-xs text-white focus:outline-none"
                    />
                  </div>

                  <button
                    id="admin-add-match-btn"
                    type="submit"
                    className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white font-bold text-xs py-2 rounded uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Add Match to Timeline
                  </button>
                </form>
              </div>

              {/* Middle & Right lists: Match scoring & Credential Management */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-orange-500" />
                  Active Match Sessions
                </h4>

                {matches.filter(m => m.tournamentId === selectedTourneyId).length === 0 ? (
                  <p className="text-zinc-500 text-xs py-10 text-center bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
                    No matches have been added for this tournament yet. Create one on the left.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {matches
                      .filter((m) => m.tournamentId === selectedTourneyId)
                      .map((match) => (
                        <div key={match.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-white text-xs uppercase tracking-wide">
                                Match #{match.matchNumber} ({match.map})
                              </h5>
                              <p className="text-[11px] text-zinc-400 mt-0.5">{match.schedule}</p>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              match.status === "Completed"
                                ? "bg-zinc-800 text-zinc-400"
                                : match.status === "Live"
                                ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}>
                              {match.status}
                            </span>
                          </div>

                          {/* Room Credentials Showcase & Edit toggle */}
                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-805 flex flex-wrap items-center justify-between gap-3 text-xs">
                            {activeLobbyMatchId === match.id ? (
                              <div className="flex flex-1 items-center gap-2">
                                <input
                                  value={tempLobbyId}
                                  onChange={(e) => setTempLobbyId(e.target.value)}
                                  placeholder="Room ID"
                                  className="bg-zinc-900 border border-zinc-800 text-white p-1 rounded text-xs w-28 text-center uppercase"
                                />
                                <input
                                  value={tempLobbyPwd}
                                  onChange={(e) => setTempLobbyPwd(e.target.value)}
                                  placeholder="Password"
                                  className="bg-zinc-900 border border-zinc-800 text-white p-1 rounded text-xs w-24 text-center"
                                />
                                <button
                                  onClick={() => handleLobbySave(match.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2.5 py-1.5 rounded font-bold cursor-pointer transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setActiveLobbyMatchId(null)}
                                  className="text-zinc-500 hover:text-white text-xs px-1.5 py-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4.5">
                                  <div>
                                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Room ID</span>
                                    <span className="text-zinc-300 font-bold font-mono">{match.lobbyId}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-zinc-500 block uppercase font-mono">Password</span>
                                    <span className="text-zinc-300 font-bold font-mono">{match.lobbyPassword}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveLobbyMatchId(match.id);
                                    setTempLobbyId(match.lobbyId);
                                    setTempLobbyPwd(match.lobbyPassword);
                                  }}
                                  className="text-zinc-400 hover:text-orange-400 font-bold text-[10px] uppercase flex items-center gap-1 shrink-0 pb-1 border-b border-zinc-800 hover:border-orange-500 transition-colors"
                                >
                                  <KeyRound className="w-3.5 h-3.5" /> Edit Room
                                </button>
                              </>
                            )}
                          </div>

                          {/* Scores entries action */}
                          <div className="flex gap-2 justify-end">
                            {match.status !== "Completed" && (
                              <button
                                onClick={() => handleOpenScoresPanel(match)}
                                className="bg-orange-600/90 hover:bg-orange-600 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {match.results && match.results.length > 0 ? "Edit Scores" : "Log Results & Scores"}
                              </button>
                            )}
                            {match.status === "Scheduled" && (
                              <button
                                onClick={() => onUpdateMatchStatus(match.id, "Live")}
                                className="bg-red-600/80 hover:bg-red-650 text-white text-[10px] uppercase font-bold py-1.5 px-3 rounded cursor-pointer transition-colors"
                              >
                                Set Live
                              </button>
                            )}
                            {match.status === "Live" && (
                              <button
                                onClick={() => onUpdateMatchStatus(match.id, "Completed")}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] uppercase font-semibold py-1.5 px-3 rounded cursor-pointer transition-colors"
                              >
                                Set Completed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOG SCORES DIALOG MODAL */}
        <AnimatePresence>
          {activeScoreMatchId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative space-y-4"
              >
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                  Match Results Ledger
                </h3>
                <p className="text-xs text-zinc-400">
                  Enter final standings rank (1 = Booyah!) and total kills for each squad. The server will auto-evaluate points!
                </p>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {scoreResults.map((score, index) => (
                    <div key={score.teamName} className="bg-zinc-900 p-3.5 rounded-lg border border-zinc-805 flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-zinc-300 truncate max-w-[150px]">
                        {score.teamName}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500 uppercase font-mono block">Rank</label>
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={score.rank}
                            onChange={(e) => handleScoreChange(index, "rank", Number(e.target.value))}
                            className="bg-zinc-950 border border-zinc-800 text-xs text-white text-center w-14 py-1 rounded"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500 uppercase font-mono block">Kills</label>
                          <input
                            type="number"
                            min={0}
                            value={score.kills}
                            onChange={(e) => handleScoreChange(index, "kills", Number(e.target.value))}
                            className="bg-zinc-950 border border-zinc-800 text-xs text-white text-center w-14 py-1 rounded"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => setActiveScoreMatchId(null)}
                    className="flex-1 bg-zinc-940 text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 py-2.5 rounded text-xs font-bold uppercase transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveScores}
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded text-xs font-bold uppercase transition-colors shadow-lg"
                  >
                    Confirm & Complete Match
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
