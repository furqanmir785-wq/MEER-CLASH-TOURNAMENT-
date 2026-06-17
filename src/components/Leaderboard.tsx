import React, { useMemo } from "react";
import { Tournament, Registration, Match, TeamStanding } from "../types";
import { Trophy, ShieldAlert, Award, Star, ListOrdered, Calendar } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardProps {
  tournament: Tournament;
  registrations: Registration[];
  matches: Match[];
}

export default function Leaderboard({ tournament, registrations, matches }: LeaderboardProps) {
  // Aggregate standings
  const standings: TeamStanding[] = useMemo(() => {
    const statsMap: Record<string, TeamStanding> = {};

    // Initialize all approved registrations
    registrations
      .filter((reg) => reg.status === "Approved")
      .forEach((reg) => {
        statsMap[reg.teamName] = {
          teamName: reg.teamName,
          matchesPlayed: 0,
          kills: 0,
          placementPoints: 0,
          killPoints: 0,
          totalPoints: 0,
          rankings: [],
          booyahs: 0
        };
      });

    // Populate using completed matches
    const completedMatches = matches.filter((m) => m.status === "Completed" && m.results && m.results.length > 0);
    
    completedMatches.forEach((match) => {
      match.results?.forEach((result) => {
        // If team wasn't initialized (e.g. was deleted or added directly by host)
        if (!statsMap[result.teamName]) {
          statsMap[result.teamName] = {
            teamName: result.teamName,
            matchesPlayed: 0,
            kills: 0,
            placementPoints: 0,
            killPoints: 0,
            totalPoints: 0,
            rankings: [],
            booyahs: 0
          };
        }

        const teamStats = statsMap[result.teamName];
        teamStats.matchesPlayed += 1;
        teamStats.kills += result.kills;
        teamStats.placementPoints += result.placementPoints;
        teamStats.killPoints += result.killPoints;
        teamStats.totalPoints += result.totalPoints;
        teamStats.rankings.push(result.rank);
        if (result.rank === 1) {
          teamStats.booyahs += 1;
        }
      });
    });

    // Convert map to array and sort by: Total Points descending, then Kills descending, then Booyahs descending
    return Object.values(statsMap).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.kills !== a.kills) {
        return b.kills - a.kills;
      }
      return b.booyahs - a.booyahs;
    });
  }, [registrations, matches]);

  // Top 3 for Podium
  const topThree = useMemo(() => {
    return standings.slice(0, 3);
  }, [standings]);

  // Remaining standings
  const tableStandings = useMemo(() => {
    return standings.slice(3);
  }, [standings]);

  if (standings.length === 0) {
    return (
      <div className="bg-zinc-900/60 p-10 rounded-2xl border border-zinc-800 text-center text-zinc-400 space-y-3">
        <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto" />
        <h3 className="font-bold text-white text-lg">No Standings Available</h3>
        <p className="text-sm max-w-sm mx-auto">
          Match logs have not been entered yet, or there are no approved team registrations for this tournament.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dynamic 3D-Like Gaming Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 max-w-2xl mx-auto gap-4 pt-8 pb-4 items-end px-3">
          {/* 2nd Place */}
          {topThree[1] ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2.5 text-center">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-zinc-700 text-white border border-zinc-600 font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shadow-md">
                  Rank 2
                </span>
                <Award className="w-11 h-11 text-zinc-300 mx-auto drop-shadow-[0_0_10px_rgba(212,212,216,0.2)]" />
                <span className="text-sm font-bold text-zinc-200 mt-2 block truncate max-w-[100px] sm:max-w-none">
                  {topThree[1].teamName}
                </span>
                <span className="text-zinc-400 text-xs mt-0.5 block font-mono">
                  {topThree[1].totalPoints} Pts
                </span>
              </div>
              {/* Podium Column */}
              <div className="w-full h-24 bg-gradient-to-t from-zinc-800/80 to-zinc-700/60 border-t border-zinc-500/20 rounded-t-xl flex items-center justify-center shadow-lg">
                <span className="font-black text-white/10 text-4xl font-mono">2</span>
              </div>
            </motion.div>
          ) : (
            <div />
          )}

          {/* 1st Place (Center) */}
          {topThree[0] ? (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3.5 text-center z-10 w-full">
                <span className="absolute -top-4.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white border border-orange-500 font-bold text-[11px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-lg shadow-orange-950 animate-bounce">
                  🏆 Booyah
                </span>
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                <span className="text-base font-extrabold text-white mt-2 block truncate max-w-[110px] sm:max-w-none">
                  {topThree[0].teamName}
                </span>
                <span className="text-yellow-400 text-sm mt-0.5 block font-bold font-mono">
                  {topThree[0].totalPoints} Pts
                </span>
              </div>
              {/* Podium Column */}
              <div className="w-full h-32 bg-gradient-to-t from-orange-600/60 via-orange-500/40 to-orange-500/10 border-t-2 border-orange-500/40 rounded-t-xl flex flex-col items-center justify-center shadow-xl shadow-orange-950/20">
                <span className="font-black text-white/15 text-5xl font-mono leading-none">1</span>
                <span className="text-[10px] text-orange-300 font-bold uppercase tracking-widest mt-1">
                  {topThree[0].booyahs} Win{topThree[0].booyahs !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          ) : (
            <div />
          )}

          {/* 3rd Place */}
          {topThree[2] ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2.5 text-center">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-zinc-800 text-white border border-zinc-700 font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shadow-md">
                  Rank 3
                </span>
                <Award className="w-10 h-10 text-amber-650 mx-auto drop-shadow-[0_0_10px_rgba(217,119,6,0.2)]" />
                <span className="text-sm font-bold text-zinc-300 mt-2 block truncate max-w-[100px] sm:max-w-none">
                  {topThree[2].teamName}
                </span>
                <span className="text-zinc-400 text-xs mt-0.5 block font-mono">
                  {topThree[2].totalPoints} Pts
                </span>
              </div>
              {/* Podium Column */}
              <div className="w-full h-18 bg-gradient-to-t from-zinc-800/60 to-zinc-850/40 border-t border-zinc-600/10 rounded-t-xl flex items-center justify-center shadow-md">
                <span className="font-black text-white/5 text-3xl font-mono">3</span>
              </div>
            </motion.div>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Complete Rankings Grid Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-sans font-bold text-white text-sm flex items-center gap-2 uppercase tracking-wider">
            <ListOrdered className="w-4 h-4 text-orange-500" />
            Competitive Standings
          </h3>
          <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest font-mono">
            {matches.filter(m => m.status === 'Completed').length} / {matches.length} Maps played
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/80 bg-zinc-900/15 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 text-center w-12"># Rank</th>
                <th className="py-3 px-4">Squad / Team</th>
                <th className="py-3 px-3 text-center">Played</th>
                <th className="py-3 px-3 text-center">Booyah!</th>
                <th className="py-3 px-3 text-center">Total Kills</th>
                <th className="py-3 px-3 text-center">Place Pts</th>
                <th className="py-3 px-3 text-center">Kill Pts</th>
                <th className="py-3 px-4 text-right pr-6">Total Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs font-medium">
              {standings.map((team, idx) => {
                const rank = idx + 1;
                const isPodium = rank <= 3;
                
                return (
                  <tr 
                    key={team.teamName} 
                    className={`hover:bg-zinc-900/35 transition-colors ${
                      isPodium ? "bg-orange-950/5 text-white" : "text-zinc-300"
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      {rank === 1 ? (
                        <span className="inline-block bg-yellow-500 text-black font-extrabold w-5 h-5 rounded flex items-center justify-center text-[10px]">1</span>
                      ) : rank === 2 ? (
                        <span className="inline-block bg-zinc-400 text-black font-extrabold w-5 h-5 rounded flex items-center justify-center text-[10px]">2</span>
                      ) : rank === 3 ? (
                        <span className="inline-block bg-amber-650 text-black font-extrabold w-5 h-5 rounded flex items-center justify-center text-[10px]">3</span>
                      ) : (
                        <span className="text-zinc-500 font-bold font-mono">{rank}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[150px] sm:max-w-xs">{team.teamName}</span>
                        {team.booyahs > 0 && Array.from({ length: team.booyahs }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">{team.matchesPlayed}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-yellow-500 font-mono">{team.booyahs}</td>
                    <td className="py-3.5 px-3 text-center font-mono">{team.kills}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-zinc-400">{team.placementPoints}</td>
                    <td className="py-3.5 px-3 text-center font-mono text-zinc-400">{team.killPoints}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold font-mono text-sm text-orange-400 pr-6">
                      {team.totalPoints}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
