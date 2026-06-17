import React, { useState } from "react";
import { UserStats } from "../types";
import { User, Award, ShieldAlert, Check, Swords, Flame, Sparkles, Map } from "lucide-react";
import { motion } from "motion/react";

interface UserProfileProps {
  stats: UserStats;
  onUpdateProfile: (username: string, inGameId: string) => void;
}

export default function UserProfile({ stats, onUpdateProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(stats.username);
  const [editInGameId, setEditInGameId] = useState(stats.inGameId);

  const handleSave = () => {
    if (!editUsername.trim() || !editInGameId.trim()) return;
    onUpdateProfile(editUsername, editInGameId);
    setIsEditing(false);
  };

  // Safe division helper
  const winRate = ((stats.wins / (stats.matchesPlayed || 1)) * 100).toFixed(1);

  // SVG Line Chart coordinates helper
  // Shows simulated kills over last 5 games
  const killTrend = [12, 4, 8, 14, stats.kills > 15 ? 15 : stats.kills];
  // Chart dimensions: 400x120
  const points = killTrend.map((val, idx) => {
    const x = 30 + idx * 80;
    // Max val in kills is 15 for chart scale mapping
    const y = 98 - (val / 20) * 80;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Left Area: User Avatar / Gamer Card */}
      <div className="md:col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xl relative overflow-hidden h-full">
        {/* Neon back glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500" />
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl" />

        <div className="w-full space-y-4 pt-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600 to-yellow-500 p-1 shadow-lg shadow-orange-950/25">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
                <Flame className="w-10 h-10 text-orange-500" fill="currentColor" />
              </div>
            </div>
            <span className="absolute bottom-0.5 right-0.5 bg-zinc-900 border border-zinc-700 text-yellow-400 p-1 rounded-full shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1.5">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  id="profile-edit-name"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Gamer Name"
                  className="bg-zinc-900 border border-zinc-700 p-2.5 rounded-lg text-xs text-white text-center focus:outline-none focus:border-orange-500 w-full font-bold"
                  maxLength={15}
                />
                <input
                  id="profile-edit-uid"
                  value={editInGameId}
                  onChange={(e) => setEditInGameId(e.target.value)}
                  placeholder="In-Game UID"
                  className="bg-zinc-900 border border-zinc-700 p-2 text-xs text-white text-center focus:outline-none focus:border-orange-500 w-full font-mono"
                  maxLength={12}
                />
                <button
                  id="save-profile-btn"
                  onClick={handleSave}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs py-1.5 rounded uppercase tracking-wider flex items-center justify-center gap-1.5 mt-2 cursor-pointer transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Save Gamer Profile
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-1">
                  <h3 className="font-sans font-extrabold text-xl text-white tracking-tight flex items-center justify-center gap-1.5">
                    {stats.username}
                    <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest animate-pulse flex items-center gap-0.5">
                      ★ Owner
                    </span>
                  </h3>
                  <span className="text-[10px] text-orange-500 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900/60 font-bold uppercase tracking-widest">
                    Verified Creator
                  </span>
                </div>
                <p className="text-zinc-500 text-xs font-semibold font-mono tracking-wide uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-800/80 rounded w-fit mx-auto mt-2">
                  UID: <span className="text-zinc-300">{stats.inGameId}</span>
                </p>
                
                <button
                  id="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-zinc-500 hover:text-orange-500 underline transition-colors pt-2.5"
                >
                  Edit Gamer Credentials
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full pt-8 mt-5 border-t border-zinc-900 flex justify-around text-xs divide-x divide-zinc-900">
          <div className="flex-1 text-center">
            <span className="text-zinc-500 block uppercase tracking-wider text-[10px] font-semibold">Tier Status</span>
            <span className="text-orange-400 font-extrabold uppercase mt-1 block">Grandmaster</span>
          </div>
          <div className="flex-1 text-center">
            <span className="text-zinc-500 block uppercase tracking-wider text-[10px] font-semibold">K/D Grade</span>
            <span className="text-yellow-400 font-extrabold uppercase mt-1 block">S+ Class</span>
          </div>
        </div>
      </div>

      {/* Right Area: Performance Stats Grid & Custom Graph */}
      <div className="md:col-span-2 space-y-6">
        {/* Core numbers grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/60 p-4.5 rounded-2xl shadow-md text-left">
            <Swords className="w-5 h-5 text-orange-500 mb-2.5" />
            <span className="text-zinc-500 text-[11px] font-bold block uppercase tracking-wide">Kill Count</span>
            <span className="text-white text-xl font-extrabold font-mono mt-1 block">{stats.kills}</span>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Lifetime Kills</span>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/60 p-4.5 rounded-2xl shadow-md text-left">
            <Award className="w-5 h-5 text-yellow-500 mb-2.5" />
            <span className="text-zinc-500 text-[11px] font-bold block uppercase tracking-wide">Booyah Wins</span>
            <span className="text-white text-xl font-extrabold font-mono mt-1 block">{stats.wins}</span>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">{winRate}% win rate</span>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/60 p-4.5 rounded-2xl shadow-md text-left">
            <Flame className="w-5 h-5 text-red-500 mb-2.5" />
            <span className="text-zinc-500 text-[11px] font-bold block uppercase tracking-wide">K/D Ratio</span>
            <span className="text-white text-xl font-extrabold font-mono mt-1 block">{stats.kdRatio}</span>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">4.0+ KD Elite Rank</span>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/60 p-4.5 rounded-2xl shadow-md text-left">
            <Map className="w-5 h-5 text-blue-500 mb-2.5" />
            <span className="text-zinc-500 text-[11px] font-bold block uppercase tracking-wide">Favorite Map</span>
            <span className="text-white text-sm font-bold mt-1 block truncate">{stats.favoriteMap}</span>
            <span className="text-[10px] text-zinc-400 mt-0.5 block">Tactical Peak</span>
          </div>
        </div>

        {/* Dynamic hand-crafted custom SVG kill-progress graph */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-orange-500" />
              Tournament Match Kills Performance Trend
            </h4>
            <span className="bg-orange-500/10 text-orange-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
              Last 5 Matches
            </span>
          </div>

          {/* SVG canvas */}
          <div className="w-full bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl flex justify-center">
            <svg viewBox="0 0 380 120" className="w-full h-32 text-orange-500 overflow-visible">
              {/* Grid Lines */}
              <line x1="30" y1="18" x2="350" y2="18" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="30" y1="58" x2="350" y2="58" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="30" y1="98" x2="350" y2="98" stroke="#27272a" strokeWidth="1" />

              {/* Y Axis markings */}
              <text x="15" y="21" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">15</text>
              <text x="15" y="61" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">10</text>
              <text x="15" y="101" fill="#71717a" fontSize="9" textAnchor="middle" fontFamily="monospace">0</text>

              {/* Linear gradient shadow under trend line */}
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <polygon
                points={`30,98 ${points} 350,98`}
                fill="url(#chart-glow)"
              />

              {/* Connecting Line */}
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                points={points}
                className="drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]"
              />

              {/* Coordinate circles */}
              {killTrend.map((val, idx) => {
                const x = 30 + idx * 80;
                const y = 98 - (val / 20) * 80;
                return (
                  <g key={idx}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#ea580c"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="cursor-pointer"
                    />
                    <text
                      x={x}
                      y={y - 9}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {val}k
                    </text>
                    <text
                      x={x}
                      y="114"
                      fill="#71717a"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      Match {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
