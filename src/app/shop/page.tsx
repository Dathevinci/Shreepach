"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/layout/PageTransition";
import { useUser } from "@/hooks/useUser";
import { isAdmin, isLeadDev } from "@/lib/admin";
import { useToast } from "@/components/ui/Toast";
import { ShoppingBag, Sparkles, Check, Diamond, Aperture, CircleDot, Orbit, Snowflake, Flame, Sun, Zap, Leaf, Search, X, LayoutGrid, CloudLightning, CloudFog, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvatarDecoration } from "@/components/profile/AvatarDecoration";

import { motion } from "framer-motion";

// The shop is now focused on avatar decorations: animated Frames (rings) and
// Effects (particles around your avatar + a matching flourish across your profile).
const SHOP_ITEMS = [
  // ---- EXTREME RARE ----
  { id: "effect_tempest", type: "effect", rare: true, name: "Monarch's Tempest", description: "The apex artifact. A cel-shaded thundercloud crowns your avatar with lightning flickering inside it while electric arcs snap around the rim — and when anyone opens your profile, a cinematic storm engulfs their ENTIRE screen: pouring parallax rain, branched lightning strikes, and thunder-flash lighting. Dark-fantasy anime, made real.", price: 7500, icon: CloudLightning, color: "text-sky-300", glow: "shadow-[0_0_24px_rgba(56,189,248,0.8)]", gradient: "from-sky-400 via-indigo-600 to-slate-800" },
  { id: "effect_blackhole", type: "effect", rare: true, name: "Event Horizon", description: "A highly detailed Black Hole / Deep Space Galaxy avatar effect. Your avatar becomes the center of an accretion disk while a spiral galaxy orbits around it, consuming doomed stars.", price: 7500, icon: Orbit, color: "text-orange-400", glow: "shadow-[0_0_24px_rgba(255,100,0,0.8)]", gradient: "from-orange-500 via-purple-500 to-black" },
  { id: "effect_fool", type: "effect", rare: true, name: "Fog of History", description: "Above the Grey Fog, at the bronze table. When anyone opens your profile, the endless Grey Fog rolls across their ENTIRE screen — crimson stars of the Tarot Club pulse deep within it, and silver spirit threads snake out of the mist to bind themselves to your avatar, crowned in an abyssal-black and cosmic-gold aura. He is watching.", price: 6000, icon: CloudFog, color: "text-slate-300", glow: "shadow-[0_0_24px_rgba(203,213,225,0.7)]", gradient: "from-slate-400 via-slate-600 to-amber-700" },
  { id: "effect_evernight", type: "effect", rare: true, name: "Evernight's Blessing", description: "The night belongs to Her. When anyone opens your profile, a massive Crimson Moon rises over their ENTIRE screen while the River of Eternal Darkness undulates below — and night-vanilla blossoms drift down like snow, swirling into orbit around your avatar, which rests inside an intertwined silver-and-crimson Aura of Concealment. Sleep. Tranquility. Concealment.", price: 6500, icon: Moon, color: "text-rose-300", glow: "shadow-[0_0_24px_rgba(244,63,94,0.7)]", gradient: "from-rose-400 via-rose-800 to-slate-900" },
  { id: "effect_ascension", type: "effect", rare: true, name: "Voltaic Ascension", description: "The single rarest power in Da Vinci. A storm of amethyst lightning crackles around your avatar while violet smoke pours across your profile — then reality tears open in a warp of light the moment your profile is viewed. Turns your whole profile purple. For the very few.", price: 5000, icon: Zap, color: "text-purple-300", glow: "shadow-[0_0_24px_rgba(168,85,247,0.8)]", gradient: "from-fuchsia-500 via-purple-500 to-indigo-700" },

  // ---- Avatar Frames: an animated ring that spins around your avatar everywhere ----
  { id: "frame_amethyst", type: "frame", name: "Amethyst Halo", description: "A violet-and-magenta ring that slowly spins around your avatar. Shows on your profile, your comments, and the nav bar.", price: 90, icon: Aperture, color: "text-purple-400", glow: "shadow-[0_0_15px_rgba(192,132,252,0.5)]", gradient: "from-purple-500 to-fuchsia-600" },
  { id: "frame_gold", type: "frame", name: "Golden Aureole", description: "A ring of molten gold that rotates around your avatar wherever it appears. Pure prestige.", price: 110, icon: CircleDot, color: "text-amber-400", glow: "shadow-[0_0_15px_rgba(251,191,36,0.5)]", gradient: "from-amber-400 to-orange-600" },
  { id: "frame_ember", type: "frame", name: "Ember Crown", description: "A slowly spinning ring of fire — gold, orange and crimson — that wraps your avatar.", price: 100, icon: Flame, color: "text-red-500", glow: "shadow-[0_0_15px_rgba(239,68,68,0.5)]", gradient: "from-orange-500 to-red-600" },
  { id: "frame_frost", type: "frame", name: "Frost Sigil", description: "A rotating ring of icy cyan and sapphire light that circles your avatar.", price: 100, icon: Snowflake, color: "text-cyan-400", glow: "shadow-[0_0_15px_rgba(34,211,238,0.5)]", gradient: "from-cyan-400 to-blue-600" },
  { id: "frame_verdant", type: "frame", name: "Verdant Ring", description: "A spinning ring of emerald and jade that blooms around your avatar.", price: 90, icon: Orbit, color: "text-emerald-400", glow: "shadow-[0_0_15px_rgba(16,185,129,0.5)]", gradient: "from-emerald-400 to-teal-600" },

  // ---- Avatar Effects: particles around your avatar + a flourish across your profile ----
  { id: "effect_froggie", type: "effect", unique: true, name: "Froggie Frenzy", description: "The cutest thing money can buy. A tiny froggie hops around your avatar everywhere you go — and sprints across your profile going 'ribbit ribbit', with lily pads and pond bubbles. 100% serious. 100% ribbit.", price: 500, icon: Leaf, color: "text-emerald-300", glow: "shadow-[0_0_18px_rgba(52,211,153,0.6)]", gradient: "from-emerald-400 to-lime-500" },
  { id: "effect_aura", type: "effect", name: "Ethereal Aura", description: "A pulsing violet glow breathes around your avatar — and energy ripples across your whole profile when someone opens it.", price: 110, icon: Sun, color: "text-fuchsia-400", glow: "shadow-[0_0_15px_rgba(217,70,239,0.5)]", gradient: "from-fuchsia-400 to-purple-600" },
  { id: "effect_sparkles", type: "effect", name: "Astral Dust", description: "Golden sparkles drift and twinkle around your avatar — and shimmer across your whole profile when someone opens it.", price: 100, icon: Sparkles, color: "text-yellow-300", glow: "shadow-[0_0_15px_rgba(253,224,71,0.5)]", gradient: "from-yellow-300 to-yellow-600" },
  { id: "effect_snow", type: "effect", name: "Winter's Veil", description: "Snowflakes fall gently around your avatar — and drift across your whole profile when someone opens it.", price: 90, icon: Snowflake, color: "text-sky-300", glow: "shadow-[0_0_15px_rgba(125,211,252,0.5)]", gradient: "from-sky-300 to-blue-500" },
  { id: "effect_embers", type: "effect", name: "Cinder Storm", description: "Glowing embers rise around your avatar — and float up across your whole profile when someone opens it.", price: 90, icon: Flame, color: "text-orange-400", glow: "shadow-[0_0_15px_rgba(251,146,60,0.5)]", gradient: "from-orange-400 to-red-600" },
];

export default function ShopPage() {
  const { user, updateProfile, isLoaded } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  // Discovery controls — as the catalog grows these keep everything findable.
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | "rare" | "frame" | "effect">("all");
  const [owned, setOwned] = useState<"all" | "unowned" | "owned">("all");

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 rounded-full border-t-transparent" /></div>;
  // Open to every logged-in user — cosmetics are the main Arise Points sink.
  if (!user) return null; // redirect to home is handled by the effect above

  const getInventoryArray = (type: string) => {
    switch(type) {
      case 'role': return user.purchasedRoles || [];
      case 'tag': return user.purchasedTags || [];
      case 'theme': return user.purchasedThemes || [];
      case 'color': return user.purchasedColors || [];
      case 'font': return user.purchasedFonts || [];
      case 'effect': return user.purchasedEffects || [];
      case 'frame': return user.purchasedFrames || [];
      default: return [];
    }
  };

  const getActiveField = (type: string) => {
    switch(type) {
      case 'role': return user.activeRole;
      case 'tag': return user.activeTag;
      case 'theme': return user.activeTheme;
      case 'color': return user.activeColor;
      case 'font': return user.activeFont;
      case 'effect': return user.activeEffect;
      case 'frame': return user.activeFrame;
      default: return null;
    }
  };

  const handlePurchase = async (item: typeof SHOP_ITEMS[0]) => {
    const isGod = isLeadDev(user);
    
    if (!isGod && (user.arisePoints || 0) < item.price) {
      return toast("Not enough Arise Points!", "error");
    }

    setBuyingId(item.id);
    const newPoints = isGod ? user.arisePoints : (user.arisePoints || 0) - item.price;
    const inventory = getInventoryArray(item.type);
    
    const updatePayload: any = {};
    if (!isGod) {
      updatePayload.arisePoints = newPoints;
    }
    switch(item.type) {
      case 'role': updatePayload.purchasedRoles = [...inventory, item.id]; break;
      case 'tag': updatePayload.purchasedTags = [...inventory, item.id]; break;
      case 'theme': updatePayload.purchasedThemes = [...inventory, item.id]; break;
      case 'color': updatePayload.purchasedColors = [...inventory, item.id]; break;
      case 'font': updatePayload.purchasedFonts = [...inventory, item.id]; break;
      case 'effect': updatePayload.purchasedEffects = [...inventory, item.id]; break;
      case 'frame': updatePayload.purchasedFrames = [...inventory, item.id]; break;
    }

    try {
      await updateProfile(updatePayload);
      toast(`Successfully purchased ${item.name}!`, "success");
    } catch (err) {
      toast("Purchase failed", "error");
    } finally {
      setBuyingId(null);
    }
  };

  const handleToggle = async (item: typeof SHOP_ITEMS[0], isEquipping: boolean) => {
    const updatePayload: any = {};
    const val = isEquipping ? item.id : null;
    switch(item.type) {
      case 'role': updatePayload.activeRole = val; break;
      case 'tag': updatePayload.activeTag = val; break;
      case 'theme': updatePayload.activeTheme = val; break;
      case 'color': updatePayload.activeColor = val; break;
      case 'font': updatePayload.activeFont = val; break;
      case 'effect': updatePayload.activeEffect = val; break;
      case 'frame': updatePayload.activeFrame = val; break;
    }

    try {
      await updateProfile(updatePayload);
      toast(`${isEquipping ? 'Equipped' : 'Unequipped'} ${item.name}`, "success");
    } catch (err) {
      toast("Failed to toggle item", "error");
    }
  };

  const renderCard = (item: typeof SHOP_ITEMS[0], i: number) => {
    const hasItem = getInventoryArray(item.type).includes(item.id);
    const isActive = getActiveField(item.type) === item.id;
    const Icon = item.icon;
    // Frames & the new particle effects render a live preview on a sample avatar
    // so buyers see exactly what they're getting (Discord-style). effect_sparkles
    // keeps its icon (it has separate legacy rendering).
    const isPreviewable = item.type === "frame" || (item.type === "effect" && item.id !== "effect_sparkles");
    const isRare = !!(item as any).rare;
    const isUnique = !!(item as any).unique;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        key={item.id}
        className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 group flex flex-col
          ${isRare
            ? 'bg-gradient-to-b from-purple-500/10 to-fuchsia-500/[0.04] border border-purple-500/40 shadow-[0_0_34px_rgba(168,85,247,0.3)] hover:-translate-y-2 hover:shadow-[0_0_44px_rgba(168,85,247,0.5)]'
            : isUnique
            ? 'bg-gradient-to-b from-emerald-500/10 to-lime-500/[0.04] border border-emerald-500/40 shadow-[0_0_28px_rgba(52,211,153,0.25)] hover:-translate-y-2 hover:shadow-[0_0_38px_rgba(52,211,153,0.4)]'
            : isActive
            ? 'bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.05)]'
            : 'bg-white/[0.02] backdrop-blur-lg border border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.04] hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(99,102,241,0.15)]'}`}
      >
        {/* Subtle gradient overlay on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${item.gradient}`} />

        {/* Rare: living amethyst sheen sweeping across the card */}
        {isRare && (
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(115deg, transparent 30%, rgba(217,70,239,0.14) 50%, transparent 70%)", backgroundSize: "220% 100%" }}
            animate={{ backgroundPosition: ["120% 0%", "-120% 0%"] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative z-10 flex justify-between items-start mb-5">
          {isPreviewable ? (
            <div className="relative w-16 h-16 shrink-0">
              <div className="relative z-10 w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 bg-gradient-to-br from-indigo-500 to-fuchsia-600">
                {user.avatar && <img src={user.avatar} alt="" className="w-full h-full object-cover" />}
              </div>
              <AvatarDecoration
                frame={item.type === "frame" ? item.id : null}
                effect={item.type === "effect" ? item.id : null}
              />
            </div>
          ) : (
            <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner ${item.color} ${item.glow}`}>
              <Icon className="w-7 h-7" />
            </div>
          )}
          {!hasItem && (
            <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-black px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <Diamond className="w-4 h-4" /> {item.price}
            </span>
          )}
          {hasItem && (
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
              <Check className="w-4 h-4" /> Owned
            </span>
          )}
        </div>

        {isRare && (
          <span className="relative z-10 inline-flex items-center gap-1.5 mb-2 w-fit text-[11px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full text-white bg-gradient-to-r from-fuchsia-500 to-purple-600 shadow-[0_0_14px_rgba(217,70,239,0.6)]">
            ✦ Extreme Rare
          </span>
        )}
        {isUnique && (
          <span className="relative z-10 inline-flex items-center gap-1.5 mb-2 w-fit text-[11px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full text-emerald-950 bg-gradient-to-r from-emerald-300 to-lime-300 shadow-[0_0_14px_rgba(52,211,153,0.6)]">
            🐸 Unique
          </span>
        )}
        <h3 className={`relative z-10 text-2xl font-black mb-2 tracking-tight ${item.color}`}>{item.name}</h3>
        <p className="relative z-10 text-slate-400 text-sm mb-8 flex-1 leading-relaxed">{item.description}</p>

        <div className="relative z-10 mt-auto">
          {!hasItem ? (
            <button
              onClick={() => handlePurchase(item)}
              disabled={buyingId === item.id || (!isLeadDev(user) && (user.arisePoints || 0) < item.price)}
              className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2
                ${(!isLeadDev(user) && (user.arisePoints || 0) < item.price)
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] hover:scale-[1.02]'}`}
            >
              {buyingId === item.id ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Acquire"}
            </button>
          ) : (
            <button
              onClick={() => handleToggle(item, !isActive)}
              className={`w-full py-3.5 rounded-xl font-black transition-all duration-300 flex items-center justify-center gap-2 border hover:scale-[1.02]
                ${isActive
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : `bg-white/5 border-white/10 text-white hover:bg-gradient-to-r hover:${item.gradient} hover:border-transparent hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]`}`}
            >
              {isActive ? "Unequip" : "Equip"}
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const SECTIONS = [
    { key: "rare", title: "Extreme Rare", blurb: "The single rarest power on the platform. The whole profile, transformed." },
    { key: "frame", title: "Avatar Frames", blurb: "An animated ring that spins around your avatar — everywhere it appears." },
    { key: "effect", title: "Avatar Effects", blurb: "Floating particles around your avatar, plus a matching flourish across your whole profile." },
  ];

  const sectionItems = (key: string) =>
    key === "rare"
      ? SHOP_ITEMS.filter((it) => (it as any).rare)
      : SHOP_ITEMS.filter((it) => it.type === key && !(it as any).rare);

  const matchesFilters = (item: typeof SHOP_ITEMS[0]) => {
    const q = query.trim().toLowerCase();
    if (q && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
    const has = getInventoryArray(item.type).includes(item.id);
    if (owned === "owned" && !has) return false;
    if (owned === "unowned" && has) return false;
    return true;
  };

  const sectionData = SECTIONS.filter((s) => category === "all" || s.key === category).map((s) => ({
    ...s,
    items: sectionItems(s.key).filter(matchesFilters),
  }));
  const shownCount = sectionData.reduce((n, s) => n + s.items.length, 0);
  const filtersActive = query.trim() !== "" || owned !== "all" || category !== "all";
  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setOwned("all");
  };

  const TABS = [
    { key: "all" as const, label: "All", icon: LayoutGrid, count: SHOP_ITEMS.length },
    { key: "rare" as const, label: "Extreme Rare", icon: Zap, count: sectionItems("rare").length },
    { key: "frame" as const, label: "Frames", icon: Aperture, count: sectionItems("frame").length },
    { key: "effect" as const, label: "Effects", icon: Sparkles, count: sectionItems("effect").length },
  ];

  // What the user is wearing right now — quick glance + one-tap unequip.
  const equippedItems = SHOP_ITEMS.filter((it) => getActiveField(it.type) === it.id);

  return (
    <PageTransition>
      {/* overflow-clip (not hidden) contains the glow blobs WITHOUT creating a
          scroll container, so the sticky shop toolbar below keeps working. */}
      <div className="min-h-screen bg-[#050505] pt-24 pb-24 text-white relative overflow-clip">
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none transform rotate-45" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-6xl font-black flex items-center gap-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-500 drop-shadow-sm mb-2">
                <ShoppingBag className="w-10 h-10 md:w-14 md:h-14 text-fuchsia-500 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" /> 
                Arise Shop
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl">Dress up your avatar with animated frames and effects that follow you across Da Vinci — on your profile, your comments, and the nav bar.</p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.6)]">
                <Diamond className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Your Balance</p>
                <p className="text-2xl font-black text-white">
                  {isLeadDev(user) ? (
                    <span className="text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]">∞ AP</span>
                  ) : (
                    `${user.arisePoints || 0} AP`
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Equipped now — what you're wearing, with one-tap unequip ── */}
          {equippedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5 flex flex-wrap items-center gap-2"
            >
              <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black">Equipped now</span>
              {equippedItems.map((it) => (
                <span
                  key={it.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"
                >
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${it.gradient}`} />
                  {it.name}
                  <button
                    onClick={() => handleToggle(it, false)}
                    title={`Unequip ${it.name}`}
                    className="text-slate-400 transition hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </motion.div>
          )}

          {/* ── Sticky toolbar: search, ownership, category tabs ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-30 mb-8"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0b0b10]/85 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* search */}
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search frames, effects…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-9 text-sm transition placeholder:text-slate-500 focus:border-indigo-500/60 focus:outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {/* ownership segmented control */}
                <div className="flex items-center gap-1 self-start rounded-xl border border-white/10 bg-white/5 p-1 md:self-auto">
                  {(
                    [
                      { key: "all", label: "Everything" },
                      { key: "unowned", label: "For sale" },
                      { key: "owned", label: "Owned" },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setOwned(o.key)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        owned === o.key ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* category tabs */}
              <div className="-mb-0.5 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {TABS.map((t) => {
                  const TabIcon = t.icon;
                  const active = category === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setCategory(t.key)}
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                        active
                          ? "border-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-[0_0_16px_rgba(99,102,241,0.45)]"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-indigo-500/40 hover:text-white"
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      {t.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                          active ? "bg-white/20 text-white" : "bg-white/10 text-slate-400"
                        }`}
                      >
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* results summary when filtering */}
          {filtersActive && (
            <div className="mb-8 flex items-center gap-3 text-sm text-slate-400">
              <span>
                <b className="text-white">{shownCount}</b> item{shownCount === 1 ? "" : "s"} found
              </span>
              <button
                onClick={resetFilters}
                className="font-bold text-indigo-300 underline-offset-2 transition hover:text-white hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* ── Nothing matches ── */}
          {shownCount === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <Sparkles className="h-10 w-10 text-slate-600" />
              <p className="text-lg font-bold text-slate-300">Nothing matches those filters.</p>
              <p className="max-w-sm text-sm text-slate-500">
                Try a different search, or reset the filters to browse the whole collection.
              </p>
              <button
                onClick={resetFilters}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-2.5 font-bold text-white transition hover:scale-[1.03]"
              >
                Show everything
              </button>
            </div>
          )}

          {sectionData.map((section) => {
            const items = section.items;
            if (items.length === 0) return null;
            const isRare = section.key === "rare";
            return (
              <div key={section.key} className="mb-14">
                <div className="mb-6 flex items-center gap-4">
                  <div className={`h-9 w-1.5 rounded-full ${isRare ? "bg-gradient-to-b from-fuchsia-300 to-purple-600 shadow-[0_0_14px_rgba(217,70,239,0.7)]" : "bg-gradient-to-b from-indigo-400 to-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.5)]"}`} />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{section.title}</h2>
                    <p className="text-slate-400 text-sm md:text-base">{section.blurb}</p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {items.map((item, i) => renderCard(item, i))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
