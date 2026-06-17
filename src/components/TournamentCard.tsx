import React from "react";
import { Tournament } from "../types";
import { Trophy, Calendar, Users, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface TournamentCardProps {
  key?: string;
  tournament: Tournament;
  onSelect: (id: string) => void;
  isRegistered: boolean;
}

export default function TournamentCard({ tournament, onSelect, isRegistered }: TournamentCardProps) {
  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case "Upcoming":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "Ongoing":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse";
      case "Completed":
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30";
    }
  };

  const modeBadge = (mode: Tournament['gameMode']) => {
    switch (mode) {
      case "Squad":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
      case "Duo":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Solo":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
  };

  return (
    <motion.div
      id={`tournament-card-${tournament.id}`}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-xl group flex flex-col h-full"
    >
      {/* Tournament Banner Image */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent z-10" />
        <img
          src={tournament.imageUrl}
          alt={tournament.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges on Top of Image */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider backdrop-blur-sm ${getStatusColor(tournament.status)}`}>
            {tournament.status}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider backdrop-blur-sm ${modeBadge(tournament.gameMode)}`}>
            {tournament.gameMode}
          </span>
        </div>

        {/* Live Indicator blinker (only for live) */}
        {tournament.status === "Ongoing" && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            LIVE
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between z-10">
        <div>
          <h3 className="font-sans font-bold text-lg text-white group-hover:text-orange-400 transition-colors duration-250 leading-snug">
            {tournament.title}
          </h3>
          <p className="text-zinc-400 text-sm mt-1.5 line-clamp-2">
            {tournament.description}
          </p>

          {/* Quick specs grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div className="flex items-center gap-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/40">
              <Trophy className="w-4 h-4 text-orange-500 shrink-0" />
              <div>
                <span className="text-zinc-500 block">Prize Pool</span>
                <span className="text-white font-semibold">{tournament.prizePool}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/40">
              <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-zinc-500 block">Entry Fee</span>
                <span className="text-emerald-400 font-semibold">{tournament.registrationFee}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/40">
              <Users className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <span className="text-zinc-500 block">Registered</span>
                <span className="text-white font-semibold">
                  {tournament.registeredCount ?? 0} / {tournament.maxTeams} Teams
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800/40">
              <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
              <div>
                <span className="text-zinc-500 block">Map</span>
                <span className="text-white font-semibold">{tournament.map}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-800/85">
          <div className="flex items-center gap-2.5 text-xs text-zinc-400 mb-3.5">
            <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">{tournament.schedule}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {isRegistered ? (
              <span className="w-full text-center text-xs py-2 px-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wider">
                ✓ Registered
              </span>
            ) : (
              <span className="text-xs text-zinc-500 font-medium">
                {tournament.maxTeams - tournament.registeredCount} Slots remaining
              </span>
            )}
            
            <button
              id={`btn-select-tournament-${tournament.id}`}
              onClick={() => onSelect(tournament.id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors whitespace-nowrap"
            >
              Enter Hub
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
