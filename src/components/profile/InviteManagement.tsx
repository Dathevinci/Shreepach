"use client";

import { useState, useEffect } from "react";
import { Key, Copy, CheckCircle } from "lucide-react";
import { isAdmin, isLeadDev } from "@/lib/admin";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/components/ui/Toast";

export default function InviteManagement() {
  const { user } = useUser();
  const { toast } = useToast();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const INVITE_COST = 1000;

  const fetchInvites = async () => {
    if (!user) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      // We pass the user id via auth header or body. Wait, the backend expects `authenticate` middleware.
      // Let's check how other requests in useUser authenticate. They don't seem to pass a token?
      // Wait, in useUser.ts there's no token passing, maybe it just expects the client to pass the user id?
      const res = await fetch(`${API_URL}/api/invites`, {
         headers: {
            "Authorization": `Bearer ${localStorage.getItem("davinci_token") || user.id}` // A quick hack if there's no JWT
         }
      });
      const data = await res.json();
      if (data.success) {
        setInvites(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [user]);

  const generateInvite = async () => {
    setGenerating(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/invites`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("davinci_token") || user?.id}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setInvites([data.data, ...invites]);
        toast("Invite key generated successfully!", "success");
      } else {
        toast(data.message || "Failed to generate invite.", "error");
      }
    } catch (err) {
      toast("Error generating invite.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const buyInvite = async () => {
    setBuying(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/invites/purchase`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${user?.id}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvites([data.data, ...invites]);
        toast(data.cost > 0 ? `Invite bought for ${data.cost.toLocaleString()} Arise Points!` : "Invite generated!", "success");
        // Reflect the new balance everywhere (navbar, profile) immediately.
        if (typeof data.arisePoints === "number") {
          const stored = localStorage.getItem("davinci_user");
          if (stored) {
            try {
              const u = JSON.parse(stored);
              u.arisePoints = data.arisePoints;
              localStorage.setItem("davinci_user", JSON.stringify(u));
              window.dispatchEvent(new Event("davinci_user_updated"));
            } catch {}
          }
        }
      } else {
        toast(data.message || "Couldn't buy invite.", "error");
      }
    } catch (err) {
      toast("Error buying invite.", "error");
    } finally {
      setBuying(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast("Copied to clipboard", "success");
  };

  if (!user) return null;

  const isDejavuh = isLeadDev(user);
  const isStaff = isAdmin(user);
  const canGenerate = isDejavuh || invites.length === 0;

  return (
    <div className="max-w-2xl bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#2b2d42] flex items-center justify-center border border-indigo-500/30 shadow-lg">
          <Key className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Invite Management</h2>
          <p className="text-slate-400 text-sm">
            {isDejavuh ? "Lead Developer overrides enabled. Generate unlimited keys." : "Generate your single invite key to invite a friend."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={generateInvite}
          disabled={!canGenerate || generating}
          className="w-full bg-indigo- hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
        >
          {generating ? "Generating..." : "Generate Invite Key"}
        </button>

        {!isStaff && (
          <>
            <button
              onClick={buyInvite}
              disabled={buying || (user.arisePoints || 0) < INVITE_COST}
              className="w-full bg-white/5 hover:bg-white/10 border border-indigo-500/40 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50"
            >
              {buying ? "Buying…" : `Buy Extra Invite — ${INVITE_COST.toLocaleString()} AP`}
            </button>
            <p className="text-xs text-slate-500 text-center">
              You have <span className="text-indigo-300 font-semibold">{(user.arisePoints || 0).toLocaleString()}</span> Arise Points.
            </p>
          </>
        )}

        {loading ? (
          <div className="text-slate-400 text-sm text-center py-4">Loading invites...</div>
        ) : invites.length > 0 ? (
          <div className="mt-6 space-y-3">
            <h3 className="text-slate-300 font-bold mb-2">Your Invite Keys</h3>
            {invites.map((invite) => (
              <div key={invite.id} className="bg-black/20 border border-white/5 p-4 rounded-lg flex items-center justify-between group">
                <div>
                  <div className="text-lg font-mono font-bold text-white tracking-widest">{invite.code}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span className={invite.isUsed ? "text-red-400" : "text-emerald-400"}>
                      {invite.isUsed ? "Used" : "Available"}
                    </span>
                    <span>•</span>
                    <span>{new Date(invite.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(invite.code)}
                  className="text-slate-400 hover:text-white transition p-2 bg-white/5 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Copy to clipboard"
                >
                  {copiedCode === invite.code ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm text-center py-4">You haven't generated any invites yet.</div>
        )}
      </div>
    </div>
  );
}
