import React, { useState } from "react";
import { Tournament, Player, Registration } from "../types";
import { User, Phone, Trophy, CheckSquare, Plus, Trash2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RegistrationFormProps {
  tournament: Tournament;
  onSubmit: (reg: Omit<Registration, "id" | "timestamp" | "status" | "userId">) => Promise<void>;
  onCancel: () => void;
  userId: string;
}

export default function RegistrationForm({ tournament, onSubmit, onCancel, userId }: RegistrationFormProps) {
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainInGameId, setCaptainInGameId] = useState("");
  const [captainContact, setCaptainContact] = useState("");
  const [members, setMembers] = useState<Player[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const requiredTeammates = tournament.gameMode === "Squad" ? 3 : tournament.gameMode === "Duo" ? 1 : 0;

  // Initialize teammate rows on load if they don't exist
  React.useEffect(() => {
    const initial: Player[] = [];
    for (let i = 0; i < requiredTeammates; i++) {
      initial.push({ name: "", inGameId: "" });
    }
    setMembers(initial);
  }, [requiredTeammates]);

  const handleMemberChange = (index: number, key: keyof Player, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [key]: value };
    setMembers(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teamName.trim() && tournament.gameMode !== "Solo") {
      setError("Please enter your team name.");
      return;
    }
    if (!captainName.trim()) {
      setError("Captain name / Player name is required.");
      return;
    }
    if (!captainInGameId.trim()) {
      setError("Captain / Player Free Fire ID is required.");
      return;
    }
    if (!captainContact.trim()) {
      setError("Contact number / Discord handle is required.");
      return;
    }

    // Validate members
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim() || !members[i].inGameId.trim()) {
        setError(`Please fill in all details for Member #${i + 1}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        tournamentId: tournament.id,
        teamName: tournament.gameMode === "Solo" ? captainName : teamName,
        captainName,
        captainInGameId,
        captainContact,
        members
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-4xl mx-auto overflow-hidden shadow-2xl">
      {/* Banner / Header */}
      <div className="relative py-8 px-6 md:px-8 bg-gradient-to-r from-orange-600/20 via-orange-900/10 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <button 
            onClick={onCancel}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors mb-2.5 text-xs font-semibold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Register for {tournament.title}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Mode: <span className="text-orange-400 font-semibold">{tournament.gameMode}</span> | Map: <span className="text-white font-medium">{tournament.map}</span>
          </p>
        </div>
        <div className="hidden md:block">
          <Trophy className="w-16 h-16 text-orange-500/20" />
        </div>
      </div>

      <div className="p-6 md:p-8 grid md:grid-cols-5 gap-8">
        {/* Left Form Area */}
        <form onSubmit={handleFormSubmit} className="md:col-span-3 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Team Profile */}
          {tournament.gameMode !== "Solo" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Team / Squad Name <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Total Gaming Esports"
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500 p-3 rounded-lg text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                required
              />
            </div>
          )}

          {/* Captain details */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4.5 space-y-4">
            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
              <User className="w-4 h-4 text-orange-400" />
              {tournament.gameMode === "Solo" ? "Player / Solo Competitor Info" : "Captain Info"}
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Full Name</label>
                <input
                  id="reg-captain-name"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  placeholder="e.g. Ajay Saini"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 p-2.5 rounded-lg text-white text-sm focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Free Fire UUID <span className="text-xs text-zinc-500">(In-game ID)</span>
                </label>
                <input
                  id="reg-captain-uid"
                  value={captainInGameId}
                  onChange={(e) => setCaptainInGameId(e.target.value)}
                  placeholder="e.g. 998822331"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 p-2.5 rounded-lg text-white text-sm focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Contact Info (WhatsApp, Telegram or Discord ID)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
                <input
                  id="reg-captain-contact"
                  value={captainContact}
                  onChange={(e) => setCaptainContact(e.target.value)}
                  placeholder="e.g. +91 99882 23311 or @ajju_op"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-orange-500 pl-10 pr-4 py-2.5 rounded-lg text-white text-sm focus:outline-none transition-colors"
                  required
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">Required so tournament organizers can send you room lobbies or clarify scores.</span>
            </div>
          </div>

          {/* Members specifications */}
          {members.length > 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4.5 space-y-4">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800 pb-2">
                Squad Members Details ({members.length} Player{members.length > 1 ? "s" : ""})
              </h4>
              
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {members.map((member, index) => (
                  <div key={index} className="grid sm:grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800/60 relative">
                    <span className="absolute -top-2.5 -left-1.5 bg-zinc-800 text-zinc-400 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border border-zinc-700">
                      #{index + 1}
                    </span>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400">In-game Name</label>
                      <input
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                        placeholder="e.g. Mafia_Op"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 p-2 rounded-lg text-white text-xs focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400">In-game UUID</label>
                      <input
                        value={member.inGameId}
                        onChange={(e) => handleMemberChange(index, "inGameId", e.target.value)}
                        placeholder="e.g. 44332211"
                        className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 p-2 rounded-lg text-white text-xs focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-registration-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-50 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-950/20 transition-all flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>
        </form>

        {/* Right Info Sidebar */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-orange-500" />
              Tournament Guidelines
            </h4>
            <div className="text-zinc-400 text-xs space-y-3">
              <p>By registering for this tournament, you agree to the following conditions:</p>
              <ul className="list-disc list-inside space-y-1.5 text-zinc-400 pl-1">
                <li>Double check your Free Fire UUID; wrong IDs will not receive server credit point logs.</li>
                <li>Hacking, cheating, script alterations, or abusing map bugs results in an immediate squad ban.</li>
                <li>A complete match lobby setup is shared in the lobbies tab 15 mins before kick-off.</li>
                <li>Respect the admins and match commentators during communications.</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-5 text-xs space-y-2 text-zinc-400">
            <h5 className="font-semibold text-orange-400 flex items-center gap-1">
              🏆 Prize Pool Structure
            </h5>
            <p>Standings will be updated immediately after every active map session ends. Rewards are disbursed within 24 hours of final score verifications.</p>
            <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800 mt-2 font-mono divide-y divide-zinc-800 space-y-1">
              <div className="flex justify-between py-1 text-white text-[11px] font-sans">
                <span>1st Place (Booyah Core)</span>
                <span className="text-orange-400 font-bold">50% of Pool</span>
              </div>
              <div className="flex justify-between py-1 text-white text-[11px] font-sans pt-1">
                <span>2nd Place (Runner-up)</span>
                <span className="text-zinc-300 font-semibold">30% of Pool</span>
              </div>
              <div className="flex justify-between py-1 text-white text-[11px] font-sans pt-1">
                <span>3rd Place</span>
                <span className="text-amber-600 font-semibold">20% of Pool</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
