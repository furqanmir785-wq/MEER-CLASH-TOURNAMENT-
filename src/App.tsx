import React, { useState, useEffect } from "react";
import { 
  Tournament, 
  Registration, 
  Match, 
  MatchResult,
  ChatMessage, 
  UserStats, 
  TeamStanding 
} from "./types";
import { 
  INITIAL_TOURNAMENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_MATCHES, 
  INITIAL_CHAT, 
  INITIAL_USER_STATS 
} from "./mockData";
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from "./firebase";

import TournamentCard from "./components/TournamentCard";
import RegistrationForm from "./components/RegistrationForm";
import Leaderboard from "./components/Leaderboard";
import ChatRoom from "./components/ChatRoom";
import AdminPanel from "./components/AdminPanel";
import UserProfile from "./components/UserProfile";

import { 
  ShieldAlert, 
  Trophy, 
  Flame, 
  Users, 
  BookOpen, 
  CircleDot, 
  User as UserIcon, 
  Eye, 
  Send, 
  MessagesSquare, 
  Sword, 
  Calendar,
  Gamepad2,
  Lock,
  Compass,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'my-teams' | 'career' | 'organizer'>('explore');
  
  // Active Tournament Hub Focus
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [hubTab, setHubTab] = useState<'matches' | 'leaderboard' | 'registrations' | 'chat' | 'rules'>('matches');

  // Triggering squad registration popup
  const [registeringTourneyId, setRegisteringTourneyId] = useState<string | null>(null);

  // Core Data State
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);

  // Seed checking states
  const [dbSynced, setDbSynced] = useState(false);

  // Mock Active User ID
  const currentUser = { id: "user_me", name: userStats.username };

  // ==========================================
  // REAL-TIME FIRESTORE DATA SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    let unsubTournaments = () => {};
    let unsubRegistrations = () => {};
    let unsubMatches = () => {};

    try {
      // 1. Sync & Listen Tournaments
      unsubTournaments = onSnapshot(collection(db, "tournaments"), (snapshot) => {
        if (snapshot.empty) {
          // No tournaments in cloud, seed them from initial list!
          INITIAL_TOURNAMENTS.forEach(async (t) => {
            await setDoc(doc(db, "tournaments", t.id), t);
          });
          setTournaments(INITIAL_TOURNAMENTS);
        } else {
          const list: Tournament[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Tournament);
          });
          // Sort buy date
          list.sort((a, b) => b.createdAt - a.createdAt);
          setTournaments(list);
        }
      }, (error) => {
        console.warn("Firestore collection tournaments error, loading local mock data:", error);
      });

      // 2. Sync & Listen Registrations
      unsubRegistrations = onSnapshot(collection(db, "registrations"), (snapshot) => {
        if (snapshot.empty) {
          INITIAL_REGISTRATIONS.forEach(async (r) => {
            await setDoc(doc(db, "registrations", r.id), r);
          });
          setRegistrations(INITIAL_REGISTRATIONS);
        } else {
          const list: Registration[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Registration);
          });
          setRegistrations(list);
        }
      }, (error) => {
        console.warn("Firestore registrations subscription error:", error);
      });

      // 3. Sync & Listen Matches
      unsubMatches = onSnapshot(collection(db, "matches"), (snapshot) => {
        if (snapshot.empty) {
          INITIAL_MATCHES.forEach(async (m) => {
            await setDoc(doc(db, "matches", m.id), m);
          });
          setMatches(INITIAL_MATCHES);
        } else {
          const list: Match[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Match);
          });
          // Sort by match number
          list.sort((a, b) => a.matchNumber - b.matchNumber);
          setMatches(list);
        }
      }, (error) => {
        console.warn("Firestore matches subscription error:", error);
      });

      setDbSynced(true);
    } catch (e) {
      console.error("Firebase syncing initialization crashed:", e);
      // Failsafe triggers local data binding completely
      setTournaments(INITIAL_TOURNAMENTS);
      setRegistrations(INITIAL_REGISTRATIONS);
      setMatches(INITIAL_MATCHES);
    }

    return () => {
      unsubTournaments();
      unsubRegistrations();
      unsubMatches();
    };
  }, []);

  // 4. Real-time Tournament Chat Synchronizer
  useEffect(() => {
    if (!selectedTournamentId) return;

    let unsubChat = () => {};
    try {
      const chatQuery = query(
        collection(db, "chats"), 
        where("tournamentId", "==", selectedTournamentId)
      );

      unsubChat = onSnapshot(chatQuery, (snapshot) => {
        if (snapshot.empty) {
          // If empty and it is the survival cup, seed initial chat logger
          if (selectedTournamentId === "ff_survival_cup") {
            INITIAL_CHAT.forEach(async (msg) => {
              await setDoc(doc(db, "chats", msg.id), msg);
            });
            setChatMessages(INITIAL_CHAT);
          } else {
            setChatMessages([]);
          }
        } else {
          const list: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
          });
          // Sort chronologically ascending
          list.sort((a, b) => a.timestamp - b.timestamp);
          setChatMessages(list);
        }
      }, (error) => {
        console.warn("Firestore chat log subscription error, fallback local:", error);
        // Fallback local chat filtering
        setChatMessages(INITIAL_CHAT.filter((c) => c.tournamentId === selectedTournamentId));
      });
    } catch (err) {
      console.error("Chat sync error:", err);
    }

    return () => unsubChat();
  }, [selectedTournamentId]);

  // Selected tournament details
  const activeTournament = tournaments.find((t) => t.id === selectedTournamentId) || null;

  // Real-time Chat message sender
  const handleAddNewChatMessage = async (msgText: string) => {
    if (!selectedTournamentId || !currentUser) return;
    try {
      const isOrganizer = activeTournament?.organizerId === "org_me";
      const newMsg: Omit<ChatMessage, "id"> = {
        tournamentId: selectedTournamentId,
        userId: currentUser.id,
        userName: currentUser.name,
        message: msgText,
        timestamp: Date.now(),
        role: isOrganizer ? "organizer" : "player"
      };

      await addDoc(collection(db, "chats"), newMsg);
    } catch (error) {
      console.warn("Cloud chat failed to send. Adding locally:", error);
      const localMsg: ChatMessage = {
        id: "local_" + Math.random().toString(),
        tournamentId: selectedTournamentId,
        userId: currentUser.id,
        userName: currentUser.name,
        message: msgText,
        timestamp: Date.now(),
        role: "player"
      };
      setChatMessages((prev) => [...prev, localMsg]);
    }
  };

  // ==========================================
  // MATCH / TEAM REGISTRATION ACTUATOR
  // ==========================================
  const handleRegisterTeamSubmit = async (regData: Omit<Registration, "id" | "timestamp" | "status" | "userId">) => {
    try {
      const newId = "reg_" + Math.random().toString(36).substr(2, 9);
      const entry: Registration = {
        ...regData,
        id: newId,
        timestamp: Date.now(),
        status: "Pending", // Pending review by Admin Host
        userId: currentUser.id
      };

      // Push to Firestore
      await setDoc(doc(db, "registrations", newId), entry);

      // Increment registeredCount on the tournament
      if (activeTournament) {
        await updateDoc(doc(db, "tournaments", activeTournament.id), {
          registeredCount: (activeTournament.registeredCount ?? 0) + 1
        });
      }

      setRegisteringTourneyId(null);
      alert("Registration submitted! Your squad is currently pending. Organizers will review details immediately.");
    } catch (err) {
      console.error("Failed cloud registration:", err);
      // Local fallback
      const localEntry: Registration = {
        ...regData,
        id: "local_" + Math.random().toString(),
        timestamp: Date.now(),
        status: "Approved", // Auto approve locally
        userId: currentUser.id
      };
      setRegistrations((prev) => [...prev, localEntry]);
      // Update local card
      setTournaments(prev => prev.map(t => t.id === regData.tournamentId ? { ...t, registeredCount: t.registeredCount + 1 } : t));
      setRegisteringTourneyId(null);
    }
  };

  // ==========================================
  // ORGANIZER ACTION DISPATCHERS
  // ==========================================
  const handleHostCreateTournament = async (tourneyObject: Omit<Tournament, "id" | "createdAt" | "registeredCount">) => {
    const id = "tourney_" + Math.random().toString(36).substr(2, 9);
    const newTourney: Tournament = {
      ...tourneyObject,
      id,
      registeredCount: 0,
      createdAt: Date.now()
    };
    await setDoc(doc(db, "tournaments", id), newTourney);
  };

  const handleUpdateRegistrationStatus = async (regId: string, status: Registration['status']) => {
    try {
      await updateDoc(doc(db, "registrations", regId), { status });
    } catch (err) {
      // Local fallback edit
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
    }
  };

  const handleHostCreateMatch = async (matchObject: Omit<Match, "id">) => {
    const id = "match_" + Math.random().toString(36).substr(2, 9);
    const newMatch: Match = {
      ...matchObject,
      id
    };
    await setDoc(doc(db, "matches", id), newMatch);
  };

  const handleSaveMatchResults = async (matchId: string, results: MatchResult[]) => {
    try {
      await updateDoc(doc(db, "matches", matchId), { results, status: "Completed" });
    } catch (err) {
      // Local fallback edit
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, results, status: "Completed" } : m));
    }
  };

  const handleUpdateMatchStatus = async (matchId: string, status: Match['status']) => {
    try {
      await updateDoc(doc(db, "matches", matchId), { status });
    } catch (err) {
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status } : m));
    }
  };

  const handleUpdateMatchLobbyCredentials = async (matchId: string, lobbyId: string, lobbyPassword: string) => {
    try {
      await updateDoc(doc(db, "matches", matchId), { lobbyId, lobbyPassword });
    } catch (err) {
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, lobbyId, lobbyPassword } : m));
    }
  };

  // Profile IGN update action
  const handleUpdateProfile = (username: string, inGameId: string) => {
    setUserStats(prev => ({
      ...prev,
      username,
      inGameId
    }));
  };

  // Filter registrations that user is part of
  const myRegistrations = registrations.filter((reg) => reg.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white antialiased">
      
      {/* 1. TOP PREMIUM NAV HEADER */}
      <header className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-900 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-950/20">
              <Sword className="w-5.5 h-5.5 text-white transform -rotate-12 animate-pulse" />
            </div>
            <div>
              <h1 className="font-sans font-black tracking-tight text-white uppercase text-base sm:text-lg flex items-center gap-1.5 leading-none">
                Free Fire <span className="text-orange-500">Tournament</span>
              </h1>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1 block">Arena Platform v2.4</span>
            </div>
          </div>

          {/* Center Tabs navigation */}
          {selectedTournamentId === null && (
            <nav className="hidden md:flex gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-850">
              <button
                id="tab-btn-explore"
                onClick={() => setActiveTab('explore')}
                className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  activeTab === 'explore'
                    ? "bg-orange-600/90 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Compass className="w-4.5 h-4.5" /> Explore Tournaments
              </button>
              <button
                id="tab-btn-my-teams"
                onClick={() => setActiveTab('my-teams')}
                className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  activeTab === 'my-teams'
                    ? "bg-orange-600/90 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Users className="w-4.5 h-4.5" /> My Signups ({myRegistrations.length})
              </button>
              <button
                id="tab-btn-career"
                onClick={() => setActiveTab('career')}
                className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  activeTab === 'career'
                    ? "bg-orange-600/90 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <UserIcon className="w-4.5 h-4.5" /> Gamer Profiler
              </button>
              <button
                id="tab-btn-organizer"
                onClick={() => setActiveTab('organizer')}
                className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  activeTab === 'organizer'
                    ? "bg-orange-600/90 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Lock className="w-4.5 h-4.5 text-orange-400" /> Host Panel
              </button>
            </nav>
          )}

          {/* Top-Right Gamer Quick Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-orange-500 uppercase tracking-widest font-mono font-bold flex items-center justify-end gap-1">
                ★ OWNER & ADMIN
              </span>
              <p className="text-xs font-black text-white flex items-center gap-1 justify-end">{userStats.username}</p>
            </div>
            <div 
              onClick={() => { setSelectedTournamentId(null); setActiveTab('career'); }}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 font-black text-xs text-orange-500 uppercase tracking-tight flex items-center justify-center cursor-pointer hover:border-orange-500 hover:scale-105 transition-all"
            >
              {userStats.username.substring(0, 2)}
            </div>
          </div>

        </div>

        {/* Mobile quick rail tab (for mobile screens) */}
        {selectedTournamentId === null && (
          <div className="md:hidden flex border-t border-zinc-900 select-none overflow-x-auto whitespace-nowrap scrollbar-none bg-zinc-950/80 backdrop-blur-md justify-between px-3 py-2 divide-x divide-zinc-900">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 py-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-center ${
                activeTab === 'explore' ? "text-orange-500" : "text-zinc-400"
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('my-teams')}
              className={`flex-1 py-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-center ${
                activeTab === 'my-teams' ? "text-orange-500" : "text-zinc-400"
              }`}
            >
              Signups ({myRegistrations.length})
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`flex-1 py-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-center ${
                activeTab === 'career' ? "text-orange-500" : "text-zinc-400"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('organizer')}
              className={`flex-1 py-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-center ${
                activeTab === 'organizer' ? "text-orange-500" : "text-zinc-400"
              }`}
            >
              Host
            </button>
          </div>
        )}
      </header>

      {/* 2. CORE WORKSPACE AND LAYOUT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 transition-all duration-300">
        
        {/* TOURNAMENT EXPLORATION OVERVIEW */}
        {selectedTournamentId === null && (
          <div className="space-y-8">
            
            {/* Promo Banner / Jumbotron */}
            {activeTab === 'explore' && (
              <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/60 p-6 md:p-10 flex flex-col-reverse md:flex-row items-center justify-between gap-8 h-fit bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-orange-950/10">
                <div className="space-y-4 max-w-xl z-25 text-left">
                  <span className="bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                    Garena eSports Tournament League
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight uppercase font-sans">
                    Claim Your Next <span className="bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">Booyah!</span>
                  </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Battle against top regional players in professional custom match lobbies. Log results easily, chat with teammates in real-time, and watch dynamic live league standings calculative system sync instantly!
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4.5 pt-2">
                    <button
                      onClick={() => {
                        // Open prefilled Bermuda tourney
                        setSelectedTournamentId("ff_survival_cup");
                      }}
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider shadow-lg shadow-orange-950/20 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <CircleDot className="w-4 h-4 text-white animate-pulse" /> Play Ongoing Matches
                    </button>
                  </div>
                </div>

                {/* Right side illustration / graphic */}
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-600/10 rounded-full blur-3xl" />
                  <img
                    src="https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=350"
                    alt="Free Fire Battle"
                    referrerPolicy="no-referrer"
                    className="w-48 md:w-60 h-auto rounded-2xl border border-zinc-800 rotate-2 transform hover:rotate-0 transition-transform duration-300"
                  />
                </div>
              </div>
            )}

            {/* TAB PANELS ELEMENT */}
            <div className="transition-all duration-200">
              
              {/* explore tab */}
              {activeTab === 'explore' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <h3 className="font-sans font-black text-white text-base sm:text-lg uppercase tracking-wider flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-orange-500" /> Matches Directory ({tournaments.length})
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                      Select tournament to enter
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((tournament) => {
                      const isReg = registrations.some(r => r.tournamentId === tournament.id && r.userId === currentUser.id);
                      return (
                        <TournamentCard
                          key={tournament.id}
                          tournament={tournament}
                          isRegistered={isReg}
                          onSelect={(id) => {
                            setSelectedTournamentId(id);
                            setHubTab('matches');
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* my-teams tab */}
              {activeTab === 'my-teams' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-900 pb-3">
                    <h3 className="font-sans font-black text-white text-base sm:text-lg uppercase tracking-wider">
                      My Registered Squads & Signups
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      Verify matches schedule, team membership rosters, and host approvals.
                    </p>
                  </div>

                  {myRegistrations.length === 0 ? (
                    <div className="bg-zinc-90 w/20 border border-zinc-900 p-10 rounded-2xl text-center text-zinc-500 space-y-3">
                      <Users className="w-10 h-10 text-zinc-700 mx-auto" />
                      <p className="font-semibold text-zinc-400">No active registrations</p>
                      <p className="text-xs max-w-sm mx-auto">You have not registered for any upcoming matches. Return to Explore, choose an upcoming tournament and register your squad!</p>
                      <button
                        onClick={() => setActiveTab('explore')}
                        className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2 px-4 rounded-lg mt-2.5 cursor-pointer uppercase tracking-wider"
                      >
                        Explore Tournaments
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-6">
                      {myRegistrations.map((reg) => {
                        const tourney = tournaments.find(t => t.id === reg.tournamentId);
                        
                        return (
                          <div key={reg.id} className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                                <div>
                                  <span className="text-[10px] text-zinc-500 font-mono uppercase">Tournament</span>
                                  <h4 className="font-bold text-white text-sm truncate">{tourney?.title || "Free Fire Masters"}</h4>
                                </div>
                                <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                  reg.status === "Approved"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : reg.status === "Pending"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                                }`}>
                                  {reg.status}
                                </span>
                              </div>

                              <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                                <p>Squad Registered: <span className="text-white font-semibold">{reg.teamName}</span></p>
                                <p>Leader: <span className="text-zinc-200 font-medium">{reg.captainName}</span> (ID: {reg.captainInGameId})</p>
                                <p>Teammates: <span className="text-zinc-200">{reg.members.length > 0 ? reg.members.map(m => m.name).join(", ") : "None (Solo/Duo)"}</span></p>
                              </div>
                            </div>

                            <div className="pt-3.5 border-t border-zinc-850 flex items-center justify-between">
                              <span className="text-[11px] text-zinc-500 font-medium">Fee: {tourney?.registrationFee}</span>
                              <button
                                onClick={() => {
                                  setSelectedTournamentId(reg.tournamentId);
                                  setHubTab('matches');
                                }}
                                className="text-xs bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                Enter Hub →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* career stats tab */}
              {activeTab === 'career' && (
                <UserProfile stats={userStats} onUpdateProfile={handleUpdateProfile} />
              )}

              {/* Host organizer tab */}
              {activeTab === 'organizer' && (
                <AdminPanel
                  tournaments={tournaments}
                  registrations={registrations}
                  matches={matches}
                  onCreateTournament={handleHostCreateTournament}
                  onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
                  onCreateMatch={handleHostCreateMatch}
                  onSaveMatchResults={handleSaveMatchResults}
                  onUpdateMatchStatus={handleUpdateMatchStatus}
                  onUpdateMatchLobby={handleUpdateMatchLobbyCredentials}
                />
              )}

            </div>
          </div>
        )}

        {/* TOURNAMENT CONTEXT HUB VIEW (NESTED LOBBY) */}
        {selectedTournamentId !== null && activeTournament && (
          <div className="space-y-6">
            
            {/* Hub Header Back link & Overview parameters */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-orange-950/5">
              <div className="space-y-1.5 text-left">
                <button
                  id="btn-back-hub-explore"
                  onClick={() => setSelectedTournamentId(null)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider pb-1 hover:underline transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to directory
                </button>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-white uppercase leading-none">
                    {activeTournament.title}
                  </h2>
                  <span className="text-[10px] uppercase font-bold bg-orange-600/10 text-orange-400 border border-orange-500/25 py-0.5 px-2 rounded">
                    {activeTournament.gameMode}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs sm:text-sm truncate max-w-sm sm:max-w-xl">
                  {activeTournament.description}
                </p>
              </div>

              {/* Header registrations triggers */}
              <div className="flex items-center gap-3 shrink-0">
                {registrations.some(r => r.tournamentId === activeTournament.id && r.userId === currentUser.id) ? (
                  <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-xl">
                    ✓ Registered
                  </span>
                ) : (
                  <button
                    id="btn-trigger-register-squad"
                    onClick={() => setRegisteringTourneyId(activeTournament.id)}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl uppercase tracking-wider shadow-lg cursor-pointer transition-colors"
                  >
                    Register Squad
                  </button>
                )}
              </div>
            </div>

            {/* NESTED HUB TABS */}
            <div className="flex border-b border-zinc-900 overflow-x-auto whitespace-nowrap gap-1 pb-1">
              <button
                id="hub-tab-matches"
                onClick={() => setHubTab('matches')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  hubTab === 'matches'
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Lobbies & Schedule
              </button>
              <button
                id="hub-tab-leaderboard"
                onClick={() => setHubTab('leaderboard')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  hubTab === 'leaderboard'
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Leaderboard Standings
              </button>
              <button
                id="hub-tab-registrations"
                onClick={() => setHubTab('registrations')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  hubTab === 'registrations'
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Registered Teams ({registrations.filter((r) => r.tournamentId === activeTournament.id && r.status === "Approved").length})
              </button>
              <button
                id="hub-tab-chat"
                onClick={() => setHubTab('chat')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  hubTab === 'chat'
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Lobby Chat
              </button>
              <button
                id="hub-tab-rules"
                onClick={() => setHubTab('rules')}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
                  hubTab === 'rules'
                    ? "border-orange-500 text-white"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Rules & Guidelines
              </button>
            </div>

            {/* NESTED RENDER CONTEXTS */}
            <div className="mt-4 transition-all duration-150">
              
              {/* Hub Matches timeline */}
              {hubTab === 'matches' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
                      Event Match Timeline
                    </h3>
                  </div>

                  {matches.filter((m) => m.tournamentId === activeTournament.id).length === 0 ? (
                    <div className="bg-zinc-900/40 p-10 rounded-2xl border border-zinc-800 text-center text-zinc-500 space-y-2">
                      <Calendar className="w-10 h-10 text-zinc-700 mx-auto" />
                      <p className="font-semibold text-zinc-400">Timeline Empty</p>
                      <p className="text-xs max-w-sm mx-auto">No match timelines have been registered for this event yet. Check back soon or register your squad to trigger lobbies!</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-5">
                      {matches
                        .filter((m) => m.tournamentId === activeTournament.id)
                        .map((match) => (
                          <div 
                            key={match.id} 
                            className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-lg hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                              <div>
                                <h4 className="font-bold text-white text-sm">
                                  Match #{match.matchNumber} ({match.map})
                                </h4>
                                <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                                  {match.schedule}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${
                                match.status === "Completed"
                                  ? "bg-zinc-900 text-zinc-500 border border-zinc-800"
                                  : match.status === "Live"
                                  ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}>
                                {match.status}
                              </span>
                            </div>

                            {/* Room Info details */}
                            <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-3.5 space-y-2 text-xs">
                              <span className="text-[9px] text-orange-400 uppercase font-mono tracking-wide font-bold block">
                                Custom Server Credentials
                              </span>
                              <div className="grid grid-cols-2 gap-1 font-mono">
                                <div className="p-2 bg-zinc-950 rounded border border-zinc-805">
                                  <span className="text-[9px] text-zinc-500 block uppercase font-mono font-bold">Room ID</span>
                                  <span className="text-zinc-200 font-bold">{match.lobbyId || "TBD"}</span>
                                </div>
                                <div className="p-2 bg-zinc-950 rounded border border-zinc-805">
                                  <span className="text-[9px] text-zinc-500 block uppercase font-mono font-bold">Password</span>
                                  <span className="text-zinc-200 font-bold">{match.lobbyPassword || "TBD"}</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-zinc-500 block leading-normal pt-1 pl-0.5">
                                credentials release 15 mins before setup. Join instantly inside Free Fire Custom Match section with credentials!
                              </span>
                            </div>

                            {/* Match results preview if completed */}
                            {match.status === "Completed" && match.results && match.results.length > 0 && (
                              <div className="space-y-1.5 text-xs pt-1">
                                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Map results</span>
                                <div className="divide-y divide-zinc-900 font-medium">
                                  {match.results.slice(0, 3).map((res, i) => (
                                    <div key={i} className="flex justify-between py-1 text-zinc-300">
                                      <span>Rank {res.rank}: {res.teamName}</span>
                                      <span className="font-mono text-orange-400 font-bold">{res.kills} Kills ({res.totalPoints} Pts)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hub Standings / Leaderboard */}
              {hubTab === 'leaderboard' && (
                <Leaderboard 
                  tournament={activeTournament} 
                  registrations={registrations} 
                  matches={matches} 
                />
              )}

              {/* Hub Registered Teams */}
              {hubTab === 'registrations' && (
                <div className="space-y-5">
                  <div className="border-b border-zinc-900 pb-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
                      Approved Squad Rosters
                    </h3>
                  </div>

                  {registrations.filter((r) => r.tournamentId === activeTournament.id && r.status === "Approved").length === 0 ? (
                    <div className="text-center py-10 bg-zinc-90 w/20 border border-zinc-900 rounded-xl">
                      <p className="text-zinc-500 text-xs">No teams have been officially approved yet. Organizers verify rosters constantly!</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {registrations
                        .filter((r) => r.tournamentId === activeTournament.id && r.status === "Approved")
                        .map((reg) => (
                          <div key={reg.id} className="bg-zinc-905 border border-zinc-900 rounded-xl p-4 space-y-2">
                            <h4 className="font-bold text-white text-sm border-b border-zinc-900 pb-1.5">{reg.teamName}</h4>
                            <p className="text-xs text-zinc-400">Captain: <span className="text-zinc-200 font-medium">{reg.captainName}</span></p>
                            
                            {reg.members && reg.members.length > 0 && (
                              <div className="pt-2 text-[11px] text-zinc-400">
                                <span className="text-[10px] text-zinc-500 block uppercase font-semibold mb-1">Roster Members:</span>
                                <div className="space-y-0.5 pl-1.5 border-l border-zinc-800">
                                  {reg.members.map((m, i) => (
                                    <div key={i} className="truncate">• {m.name} ({m.inGameId})</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Hub real-time chat */}
              {hubTab === 'chat' && (
                <div className="max-w-3xl mx-auto">
                  <ChatRoom
                    tournamentId={activeTournament.id}
                    messages={chatMessages}
                    onSendMessage={handleAddNewChatMessage}
                    currentUser={currentUser}
                    organizerId={activeTournament.organizerId}
                  />
                </div>
              )}

              {/* Hub rules list */}
              {hubTab === 'rules' && (
                <div className="max-w-3xl mx-auto bg-zinc-950 border border-zinc-850 p-6 rounded-2xl shadow-xl space-y-6 text-left">
                  <h3 className="text-white font-bold text-base uppercase border-b border-zinc-900 pb-2.5 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    Tournament Rulesbook
                  </h3>

                  <div className="space-y-4">
                    {activeTournament.rules.map((rule, index) => (
                      <div key={index} className="flex gap-3 text-xs leading-relaxed text-zinc-400">
                        <span className="bg-orange-500/10 text-orange-400 font-bold w-6 h-6 flex items-center justify-center rounded-lg border border-orange-500/20 shrink-0">
                          {index + 1}
                        </span>
                        <p className="pt-0.5">{rule}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 mt-6 border-t border-zinc-900 text-xs text-zinc-500 font-medium space-y-2">
                    <p>🏆 <b className="text-zinc-300">Evaluating Standings Rank placements points:</b></p>
                    <p>Rank 1: 12 pts | Rank 2: 9 pts | Rank 3: 8 pts | Rank 4: 7 pts | Rank 5: 6 pts | Rank 6: 5 pts | Rank 7: 4 pts | Rank 8: 3 pts | Rank 9: 2 pts | Rank 10: 1 pt. Kills = 1 pt each.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* 3. FLOATING POPUP SQUAD REGISTRATION MODAL */}
      <AnimatePresence>
        {registeringTourneyId !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 md:p-8 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-4xl py-6"
            >
              {(() => {
                const tourney = tournaments.find(t => t.id === registeringTourneyId);
                if (!tourney) return null;
                return (
                  <RegistrationForm
                    tournament={tourney}
                    userId={currentUser.id}
                    onCancel={() => setRegisteringTourneyId(null)}
                    onSubmit={handleRegisterTeamSubmit}
                  />
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER COLOURED BAR */}
      <footer className="py-6 mt-16 bg-zinc-950 border-t border-zinc-900/80 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 Free Fire Tournament Arena Platform. Managed under Authorized Garena Community Hosts.</p>
          <p className="text-[10px] tracking-wider text-zinc-700 uppercase">Not affiliated or endorsed officially by Garena Corporation.</p>
        </div>
      </footer>

    </div>
  );
}
