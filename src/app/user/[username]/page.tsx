"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Clock, Star, TrendingUp, Compass, Settings, Check, X, Shield, Users, Zap, User as UserIcon, Code2, Sparkles, Crown, Feather, Flame, Leaf, UserPlus, UserMinus, Eye, Heart, ListFilter } from 'lucide-react';
import BioRenderer from '@/components/profile/BioRenderer';
import { parseBio } from "@/lib/bioUtils";
import { useUser, User } from "@/hooks/useUser";
import FollowListModal from "@/components/profile/FollowListModal";
import ImagePreviewModal from "@/components/ui/ImagePreviewModal";
import ArisePointHistoryModal from "@/components/profile/ArisePointHistoryModal";
import UnlimitedVoid from "@/components/ui/UnlimitedVoid";
import SettingsModal from "@/components/profile/SettingsModal";
import LevelBadge from "@/components/profile/LevelBadge";
import { AvatarDecoration, hasFrameRing } from "@/components/profile/AvatarDecoration";
import { ProfileEffect } from "@/components/profile/ProfileEffect";
import { calculateLevel, calculateProgressPercent, xpForNextLevel } from "@/lib/levels";
import { isAdmin, isLeadDev, displayArisePoints } from "@/lib/admin";
import { nameColorClass } from "@/lib/cosmetics";
import { isCrimsonChosen } from "@/components/profile/CrimsonRealm";
import { motion, AnimatePresence } from "framer-motion";
import { getRankTheme } from "@/lib/ranks";
import { Code2 as IconCode2, ShieldAlert, Sparkles as IconSparkles, Crown as IconCrown, Flame as IconFlame, Zap as IconZap, Compass as IconCompass, Leaf as IconLeaf, ArrowUpRight, Feather as IconFeather, Eye as IconEye } from "lucide-react";
const ICON_MAP: Record<string, any> = { Code2: IconCode2, ShieldAlert, Sparkles: IconSparkles, Crown: IconCrown, Flame: IconFlame, Zap: IconZap, Compass: IconCompass, Leaf: IconLeaf, ArrowUpRight, Feather: IconFeather, Eye: IconEye };
import { useToast } from "@/components/ui/Toast";
import PageTransition from "@/components/layout/PageTransition";
import QuickViewModal from "@/components/ui/QuickViewModal";
import LoadingScreen from "@/components/ui/LoadingScreen";
import TrailerModal from "@/components/ui/TrailerModal";
import { getYouTubeId, getAnimeDetailsAniList } from "@/lib/jikan";
import { ChevronDown } from "lucide-react";
import AnimeStatusBadge from "@/components/anime/AnimeStatusBadge";
import TrackerButton from "@/components/anime/TrackerButton";
import { useAnimeStatus } from "@/hooks/useAnimeStatus";

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isLoaded: currentUserLoaded, followUser, unfollowUser } = useUser();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState<{ title: string; users: any[] } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPointHistory, setShowPointHistory] = useState(false);
  const [showDomainExpansion, setShowDomainExpansion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Which tracker sections are expanded ("See all").
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Live tracker for the current user, so status edits on your own profile
  // re-file cards into the right section immediately.
  const { tracked: liveTracked } = useAnimeStatus();

  const [activeAnime, setActiveAnime] = useState<any | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loadingAnimeId, setLoadingAnimeId] = useState<number | null>(null);

  const handleOpenQuickView = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) {
      toast("This title isn't linked to a database entry yet.", "error");
      return;
    }
    setLoadingAnimeId(id);
    try {
      // These IDs are AniList IDs, so query AniList directly (Jikan/MAL uses
      // different IDs and rate-limits our production traffic).
      const data = await getAnimeDetailsAniList(id);
      if (data) {
        setActiveAnime(data);
        setShowQuickView(true);
      } else {
        toast("Failed to load anime details.", "error");
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load anime details.", "error");
    } finally {
      setLoadingAnimeId(null);
    }
  };


  useEffect(() => {
    // Only fetch once currentUserLoaded is true, so we don't fetch without currentUserId
    if (!currentUserLoaded) return;
    
    const fetchUser = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      try {
        const url = currentUser ? `${API_URL}/api/users/username/${username}?currentUserId=${currentUser.id}` : `${API_URL}/api/users/username/${username}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProfileUser(data.data);
          setWatchlist(data.data.watchlist || []);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchUser();
  }, [username, currentUserLoaded, currentUser?.id]);

  // Group the tracker by status (Watching / Watched / Waiting / Interested).
  // This MUST run before the early returns below — otherwise the hook count
  // changes between the loading and loaded renders, which crashes with
  // "Rendered more hooks than during the previous render."
  const activeItems = watchlist;
  const groupedItems = useMemo(() => {
    // Backend enum + live-tracker labels -> the section name shown on screen.
    const SECTION_FOR: Record<string, string> = {
      WATCHING: "Watching", WATCHED: "Watched", FINISHED: "Watched",
      WAITING: "Waiting", INTERESTED: "Interested", DROPPED: "Dropped",
    };
    const selfView = !!currentUser && currentUser.id === profileUser?.id;

    const groups: Record<string, typeof activeItems> = {};
    activeItems.forEach(item => {
      // On your own profile, prefer the live tracker status so status edits
      // re-file the card instantly; otherwise use the fetched item's status.
      const raw = (selfView && liveTracked[item.anilistId]?.status) || item.status || "";
      const section = SECTION_FOR[String(raw).toUpperCase()] || "Other";
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
    });

    const order = ["Watching", "Watched", "Waiting", "Interested", "Dropped", "Other"];
    const rank = (s: string) => { const i = order.indexOf(s); return i === -1 ? 99 : i; };
    return Object.entries(groups).sort((a, b) => rank(a[0]) - rank(b[0]));
  }, [activeItems, liveTracked, currentUser, profileUser]);

  if (loading || !currentUserLoaded) return <LoadingScreen message="Loading profile" />;
  if (!profileUser) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">User not found</div>;

  const isFollowing = currentUser?.following?.some((f: any) => f.followingId === profileUser.id);
  const isSelf = currentUser?.id === profileUser.id;

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast("You must be logged in to follow users.", "error");
      return;
    }
    if (isFollowing) {
      // Optimistic: drop the follower count now; the button flips via useUser.
      // The network call runs in the background (no await = no UI stall).
      setProfileUser(prev => prev ? { ...prev, followers: prev.followers?.filter((f: any) => f.followerId !== currentUser.id) } : prev);
      unfollowUser(profileUser.id);
    } else {
      // Optimistic follower count + instant button; sync in the background.
      setProfileUser(prev => prev ? { ...prev, followers: [...(prev.followers || []), { followerId: currentUser.id }] } : prev);

      // TRIGGER UNLIMITED VOID FOR LEAD DEV
      if (isLeadDev(profileUser)) {
        setShowDomainExpansion(true);
      }

      followUser(profileUser.id);
    }
  };

  const rankTheme = getRankTheme(profileUser.arisePoints, profileUser.username);
  const RankIcon = rankTheme.badgeIcon ? ICON_MAP[rankTheme.badgeIcon] : null;
  const { cleanBio, backgroundUrl } = profileUser ? parseBio(profileUser.bio || "", profileUser.arisePoints || 0, profileUser.username) : { cleanBio: "", backgroundUrl: null };

  // Level is driven by XP (separate from the Arise Points currency).
  // Lead Dev and Admins are pinned to the max level (10).
  const currentXp = profileUser.xp || 0;
  const isProfileAdmin = isAdmin(profileUser);
  const isProfileLeadDev = isLeadDev(profileUser);
  const currentLevel = (isProfileLeadDev || isProfileAdmin) ? 10 : calculateLevel(currentXp);
  const nextXp = xpForNextLevel(currentLevel);
  const progressPercent = (isProfileLeadDev || isProfileAdmin) ? 100 : calculateProgressPercent(currentXp);

  // Banner style: "cover" = a header strip on the card (Twitter-style);
  // anything else = the full-screen background image. Chosen by the profile owner.
  const coverMode = (profileUser as any).bannerStyle === "cover" && !!profileUser.bannerUrl;
  // Donor-exclusive: "Māna-Yood-Sushāī" is always wrapped in the Crimson Realm,
  // and nobody else can wear it — even if the field is set by hand.
  const crimsonChosen = isCrimsonChosen(profileUser.username);
  const effectiveEffect = crimsonChosen
    ? "effect_crimson"
    : profileUser.activeEffect === "effect_crimson"
      ? undefined
      : profileUser.activeEffect;
  const isCrimson = effectiveEffect === "effect_crimson";
  const crimsonName = "text-transparent bg-clip-text bg-[linear-gradient(to_right,#fecaca,#ef4444,#8b0000,#ef4444,#fecaca)] drop-shadow-[0_0_10px_rgba(255,0,0,0.6)]";
  // The rare Déjà vu Card turns the whole profile amethyst-purple.
  // The extreme-rare Voltaic Ascension turns the whole profile amethyst-purple.
  const isDejaVu = effectiveEffect === "effect_ascension";
  // The extreme-rare Monarch's Tempest drenches it in storm blue instead.
  const isTempest = effectiveEffect === "effect_tempest";
  const tempestName = "text-transparent bg-clip-text bg-[linear-gradient(to_right,#bae6fd,#38bdf8,#818cf8,#38bdf8,#bae6fd)] drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]";
  // The extreme-rare Fog of History crowns it in mist-grey and cosmic gold.
  const isFool = effectiveEffect === "effect_fool";
  const foolName = "text-transparent bg-clip-text bg-[linear-gradient(to_right,#e2e8f0,#fde68a,#f59e0b,#fde68a,#e2e8f0)] drop-shadow-[0_0_10px_rgba(245,158,11,0.55)]";
  // The extreme-rare Evernight's Blessing bathes it in crimson-moon twilight.
  const isEvernight = effectiveEffect === "effect_evernight";
  const evernightName = "text-transparent bg-clip-text bg-[linear-gradient(to_right,#e2e8f0,#fda4af,#e11d48,#fda4af,#e2e8f0)] drop-shadow-[0_0_10px_rgba(225,29,72,0.55)]";
  // When a bought frame (or the Voltaic ring) is equipped, drop the rank/role
  // border + glow so it doesn't override the frame the user chose.
  const ringOverridesRank = hasFrameRing((profileUser as any).activeFrame, effectiveEffect);
  const avatarBorderClass = ringOverridesRank ? "border-[#141414]" : `${rankTheme.borderClass} ${rankTheme.glowClass}`;
  const dejaVuName = "text-transparent bg-clip-text bg-[linear-gradient(to_right,#ddd6fe,#a855f7,#e879f9,#a855f7,#ddd6fe)] drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]";

  return (
    <PageTransition>
      <div className="relative min-h-screen pt-24 pb-12 text-white overflow-hidden">

      {/* Full-screen banner background (only in "full" mode) */}
      <div className="fixed inset-0 z-0 bg-[#09090b] overflow-hidden">
        {profileUser?.bannerUrl && !coverMode ? (
          <>
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src={profileUser.bannerUrl}
              alt="Background Banner"
              style={{ objectPosition: `center ${(profileUser as any).bannerPosition ?? 50}%` }}
              className="w-full h-full object-cover"
            />
            {/* Gentle darken toward the bottom so lower content stays readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/5 via-[#09090b]/25 to-[#09090b]/85"></div>
          </>
        ) : (
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-12"
      >
        
        {/* Profile Header — Discord/Twitter-style cover on top */}
        <div className={`relative rounded-3xl mb-10 shadow-2xl border overflow-hidden ${rankTheme.bgCardClass} ${isCrimson ? "!border-red-600/50 shadow-[0_0_45px_rgba(255,0,0,0.35)]" : isDejaVu ? "!border-purple-500/50 shadow-[0_0_45px_rgba(168,85,247,0.4)]" : isTempest ? "!border-sky-500/50 shadow-[0_0_45px_rgba(56,189,248,0.35)]" : isFool ? "!border-amber-500/40 shadow-[0_0_45px_rgba(245,158,11,0.3)]" : isEvernight ? "!border-rose-500/40 shadow-[0_0_45px_rgba(225,29,72,0.3)]" : ""}`}>
          {backgroundUrl && (
            <>
              <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundUrl})` }}
              />
              <div className="absolute inset-0 z-0 bg-black/75 pointer-events-none" />
            </>
          )}

          {/* Discord-style Profile Effect — plays across the whole card on open */}
          <ProfileEffect effect={effectiveEffect} />

          {/* Cover header strip (only in "cover" mode) — melts into the card */}
          {coverMode && (
            <div className="relative z-[1] w-full h-32 sm:h-40 md:h-52">
              <img
                src={profileUser.bannerUrl}
                alt="Cover banner"
                style={{ objectPosition: `center ${(profileUser as any).bannerPosition ?? 50}%` }}
                className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,#000_25%,transparent_95%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_25%,transparent_95%)]"
              />
            </div>
          )}

          <div className={`relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 w-full px-8 pb-8 ${coverMode ? "pt-0" : "pt-8"}`}>
            <div
              className={`relative cursor-pointer ${coverMode ? "-mt-20 md:-mt-24" : ""}`}
              onClick={() => profileUser.avatar && setPreviewImage(profileUser.avatar)}
            >
              {profileUser.avatar ? (
                <motion.img
                  layoutId="profile-avatar"
                  src={profileUser.avatar}
                  alt="Avatar"
                  className={`w-32 h-32 rounded-full object-cover border-4 bg-[#141414] transition-all duration-300 relative z-10 ${avatarBorderClass}`}
                />
              ) : (
                <motion.div
                  layoutId="profile-avatar"
                  className={`w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center text-4xl font-black border-4 transition-all duration-300 relative z-10 ${avatarBorderClass}`}
                >
                  {profileUser.username.charAt(0).toUpperCase()}
                </motion.div>
              )}
              <AvatarDecoration frame={(profileUser as any).activeFrame} effect={effectiveEffect} size="lg" />
              {profileUser.arisePoints !== undefined && (
                <div className="absolute -bottom-2 -right-2 z-20">
                  <LevelBadge xp={isProfileLeadDev ? Infinity : (isProfileAdmin ? 511000 : (profileUser.xp || 0))} size="lg" className="shadow-[0_4px_20px_rgba(0,0,0,0.8)] border-[#141414]" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left z-10 mb-2 flex-1 w-full">
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2 relative">
                {profileUser.activeEffect === 'effect_sparkles' && (
                  <div className="absolute -inset-4 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping left-10 top-2"></div>
                    <div className="absolute w-1.5 h-1.5 bg-yellow-200 rounded-full animate-pulse right-10 top-0"></div>
                    <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping left-20 bottom-0"></div>
                    <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse right-20 bottom-2"></div>
                  </div>
                )}
                <h1 className={`text-4xl font-black drop-shadow-lg pr-6 pb-2 leading-relaxed break-words relative z-10 
                  ${profileUser.activeFont === 'font_cyber' ? 'font-mono tracking-widest' : ''} 
                  ${profileUser.activeFont === 'font_pixel' ? 'font-serif tracking-tight' : ''} 
                  ${isCrimson ? crimsonName : isDejaVu ? dejaVuName : isTempest ? tempestName : isFool ? foolName : isEvernight ? evernightName : (nameColorClass(profileUser.activeColor) || rankTheme.textGradient)}`}>
                  {profileUser.username}
                </h1>
                
                {isProfileAdmin || isProfileLeadDev ? (
                  <div className={`shrink-0 px-3 py-1 rounded-full flex items-center gap-1 ${rankTheme.badgeClass}`}>
                    {RankIcon && <RankIcon className="w-4 h-4" />}
                    <span className="text-xs font-black tracking-wider uppercase">
                      {rankTheme.title}
                    </span>
                  </div>
                ) : profileUser.activeRole === 'role_watcher' ? (
                  <div className="shrink-0 px-3 py-1 rounded-full flex items-center gap-1 bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-black tracking-wider uppercase">The Watcher</span>
                  </div>
                ) : profileUser.activeRole === 'role_elite' ? (
                  <div className="shrink-0 px-3 py-1 rounded-full flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Star className="w-4 h-4" />
                    <span className="text-xs font-black tracking-wider uppercase">Elite</span>
                  </div>
                ) : rankTheme.title ? (
                  <div className={`shrink-0 px-3 py-1 rounded-full flex items-center gap-1 ${rankTheme.badgeClass}`}>
                    {RankIcon && <RankIcon className="w-4 h-4" />}
                    <span className="text-xs font-black tracking-wider uppercase">
                      {rankTheme.title}
                    </span>
                  </div>
                ) : null}

                {profileUser.activeTag === 'tag_og' && (
                  <div className="shrink-0 px-3 py-1 rounded-full flex items-center gap-1 bg-red-500/20 text-red-400">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-black tracking-wider uppercase">OG</span>
                  </div>
                )}
                {profileUser.activeTag === 'tag_weeb' && (
                  <div className="shrink-0 px-3 py-1 rounded-full flex items-center gap-1 bg-pink-500/20 text-pink-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-black tracking-wider uppercase">Weeb Lord</span>
                  </div>
                )}
                
              </div>
              
              {/* Level Progress Bar */}
              <div className="w-full max-w-md bg-black/40 rounded-full h-2.5 mt-2 mb-1 border border-white/10 relative overflow-hidden mx-auto md:mx-0">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
                <div className="absolute inset-0 bg-white/5 opacity-30 mix-blend-overlay"></div>
              </div>
              <div className="flex justify-between w-full max-w-md text-[10px] font-bold text-slate-400 mb-3 px-1 tracking-wider uppercase mx-auto md:mx-0">
                <span>{(isProfileLeadDev || isProfileAdmin) ? "MAX LEVEL" : `${currentXp.toLocaleString()} XP`}</span>
                <span>{currentLevel >= 10 ? "LVL 10 (MAX)" : `${nextXp.toLocaleString()} XP (Next LVL)`}</span>
              </div>
              
              <BioRenderer bio={cleanBio || "No bio set."} className="text-indigo-200 font-medium drop-shadow-md max-w-xl mx-auto md:mx-0" />
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm font-bold text-slate-300">
                <button 
                  onClick={() => setModalData({ title: 'Followers', users: (profileUser.followers || []).map((f: any) => f.follower) })}
                  className="hover:text-white hover:underline transition"
                >
                  <span>{(profileUser.followers || []).length} Followers</span>
                </button>
                <button 
                  onClick={() => setModalData({ title: 'Following', users: (profileUser.following || []).map((f: any) => f.following) })}
                  className="hover:text-white hover:underline transition"
                >
                  <span>{(profileUser.following || []).length} Following</span>
                </button>
                  <span className={`ml-2 drop-shadow-md font-black ${rankTheme.textColorClass}`}>
                  ✧ {displayArisePoints(profileUser)} Arise Points
                  </span>
              </div>
            </div>
            
            {!isSelf && currentUser && (
              <div className="z-10 mb-2 flex gap-2">

                <button 
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition shadow-xl ${isFollowing ? "bg-white/10 hover:bg-red-/20 hover:text-red-400 text-white" : "bg-indigo- hover:bg-indigo-500 text-white"}`}
                >
                  {isFollowing ? (
                    <><UserMinus className="w-5 h-5" /> Unfollow</>
                  ) : profileUser?.following?.some((f: any) => f.followingId === currentUser.id) ? (
                    <><UserPlus className="w-5 h-5" /> Follow Back</>
                  ) : (
                    <><UserPlus className="w-5 h-5" /> Follow</>
                  )}
                </button>
              </div>
            )}
            {isSelf && (
              <div className="z-10 mb-2 flex gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition shadow-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Settings className="w-5 h-5" /> Settings
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Section */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Compass className="w-6 h-6 text-indigo-400" />
          {profileUser.username}'s Collection
        </h2>

        <div className="bg-white/5 border border-white/10 p-1 rounded-lg flex w-fit mb-8">
          <div className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold bg-indigo-600 text-white shadow-md">
            <Compass className="w-4 h-4" /> Tracker
            <span className="text-xs font-bold bg-black/30 text-slate-200 px-1.5 py-0.5 rounded-full">{watchlist.length}</span>
          </div>
        </div>

        {activeItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium bg-white/5 rounded-2xl border border-white/10">
            This user hasn't tracked any anime yet!
          </div>
        ) : (
          <div className="space-y-10">
            {groupedItems.map(([section, items]) => {
              const isExpanded = !!expandedSections[section];
              const displayedItems = isExpanded ? items : items.slice(0, 6);
              const hasMore = items.length > 6;

              return (
                <div key={section} className="space-y-4">
                  {/* Section title (tracker status) with count */}
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white tracking-wide">{section}</h3>
                    <span className="text-xs font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">{items.length}</span>
                  </div>

                  {/* Uniform poster grid (all cards are 2:3, so a real grid
                      animates far more smoothly than CSS multi-column). */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    <AnimatePresence>
                      {displayedItems.map((item, i) => {
                        // On expand, only the newly-revealed cards cascade in;
                        // the first 6 keep their keys and never re-animate.
                        const revealIndex = isExpanded ? Math.max(0, i - 6) : i;
                        return (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
                          transition={{ duration: 0.35, delay: Math.min(revealIndex * 0.035, 0.35), ease: [0.16, 1, 0.3, 1] }}
                          key={item.id}
                          style={{ willChange: "transform, opacity" }}
                          className="relative group rounded-xl overflow-hidden shadow-lg border border-white/10 cursor-pointer block text-left bg-white/5 w-full"
                          onClick={(e) => handleOpenQuickView(e, item.anilistId)}
                        >
                          <div className="w-full aspect-[2/3] relative">
                            <img 
                              src={(item.coverImage || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&q=80")} 
                              alt={item.title || "Anime"} 
                              loading="lazy" 
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Status: editable picker on your own profile, read-only badge otherwise */}
                            <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                              {isSelf ? (
                                <TrackerButton
                                  anime={{
                                    mal_id: item.anilistId,
                                    title: item.title,
                                    images: { jpg: { large_image_url: item.coverImage, image_url: item.coverImage, small_image_url: item.coverImage } },
                                    genres: item.genre ? [{ name: item.genre }] : [],
                                  } as any}
                                  variant="compact"
                                />
                              ) : (
                                <AnimeStatusBadge status={item.status || "Unknown"} />
                              )}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                              <h3 className="text-white font-bold text-sm md:text-base drop-shadow-md line-clamp-2">
                                {item.title || "Unknown Anime"}
                              </h3>
                            </div>
                            
                            {/* Quick View Button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenQuickView(e, item.anilistId); }}
                              className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center rounded-full hover:bg-white hover:text-black transition-colors z-20 opacity-0 group-hover:opacity-100"
                            >
                              {loadingAnimeId === item.anilistId ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* See More Button */}
                  {hasMore && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))}
                        className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium text-slate-300 hover:text-white"
                      >
                        <span>{isExpanded ? "Show Less" : `See All ${items.length}`}</span>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
      </motion.div>

      {/* Trailer Modal */}
      <TrailerModal 
        videoId={showTrailer && activeAnime ? getYouTubeId(activeAnime.trailer) : null} 
        onClose={() => setShowTrailer(false)} 
      />

      {/* Quick View Modal */}
      {showQuickView && activeAnime && (
        <QuickViewModal 
          anime={activeAnime} 
          onClose={() => setShowQuickView(false)} 
          onPlayTrailer={() => setShowTrailer(true)} 
        />
      )}

      {modalData && (
        <FollowListModal
          title={modalData.title}
          users={modalData.users}
          onClose={() => setModalData(null)}
        />
      )}

      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          altText={`${profileUser.username}'s Avatar`}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {showPointHistory && (
        <ArisePointHistoryModal
          userId={profileUser.id}
          onClose={() => setShowPointHistory(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          user={profileUser}
          onClose={() => setShowSettings(false)}
          onUpdate={(data: any) => setProfileUser({ ...profileUser, ...data })}
        />
      )}

      {showDomainExpansion && (
        <UnlimitedVoid onComplete={() => setShowDomainExpansion(false)} />
      )}
    </div>
    </PageTransition>
  );
}
