"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, Bot, Gavel, TrendingUp, BellRing, Wallet,
  Clock, CheckCircle2, Activity, Sparkles, Plus, Search,
  ChevronRight, ArrowRight, Timer
} from "lucide-react";

function CountdownTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const calculate = () => {
            const diff = new Date(endTime).getTime() - Date.now();
            if (diff <= 0) return "Ended";

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            setIsUrgent(h < 24);

            if (h > 24) {
                const days = Math.floor(h / 24);
                const remainingHours = h % 24;
                return `${days}d ${remainingHours}h ${m}m`;
            }
            if (h > 0) return `${h}h ${m}m ${s}s`;
            return `${m}m ${s}s`;
        };

        setTimeLeft(calculate());
        const timer = setInterval(() => setTimeLeft(calculate()), 1000);
        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className={`flex items-center gap-1.5 rounded-full border-[2px] border-[var(--ink)] px-2.5 py-1 font-display text-[10px] font-black shadow-[2px_2px_0_0_var(--ink)] transition-colors
            ${isUrgent ? 'bg-[var(--hotpink)] text-white animate-pulse' : 'bg-[var(--acid)] text-[var(--ink)]'}`}>
            <Timer className="h-3 w-3" strokeWidth={3} />
            {timeLeft}
        </div>
    );
}
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

function BuyerDashboardContent() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const searchParams = useSearchParams();
  
  const [stats, setStats] = useState({ activeBids: 0, itemsWon: 0, totalSpent: 0, savedItems: 0, walletBalance: 0 });
  const [activeBids, setActiveBids] = useState([]);
  const [wonBids, setWonBids] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Re-fetch user balance after a successful deposit return
  useEffect(() => {
    if (searchParams?.get('deposit') === 'success') {
      checkAuth();
      api('/api/buyer/dashboard/stats')
        .then((res) => {
          if (res?.success) setStats(res.data);
        })
        .catch((err) => console.error("Failed to refetch stats:", err));
      // Clean up URL param without re-render
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, checkAuth]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) < 5) {
      alert("Minimum deposit is $5");
      return;
    }
    setDepositLoading(true);
    try {
      const res = await api('/api/buyer/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(depositAmount) }),
      });
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        alert("Failed to create deposit checkout session.");
      }
    } catch (err) {
      alert(err.message || "Failed to initiate deposit");
    } finally {
      setDepositLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, bidsRes, wonRes, ordersRes] = await Promise.all([
          api('/api/buyer/dashboard/stats'),
          api('/api/buyer/bids/active'),
          api('/api/buyer/bids/won'),
          api('/api/buyer/orders')
        ]);

        if (statsRes?.success) setStats(statsRes.data);
        if (bidsRes?.success) setActiveBids(bidsRes.bids || []);
        if (wonRes?.success) setWonBids(wonRes.bids || []);
        if (ordersRes?.success) setOrders(ordersRes.data || []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Background fetch for AI Picks
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const recsRes = await api('/api/buyer/ai-picks');
        if (recsRes?.success) setRecommendations(recsRes.data || []);
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setRecsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  // Background fetch for Activity Feed
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const actRes = await api('/api/buyer/activity');
        if (actRes?.success) setActivity(actRes.data || []);
      } catch (error) {
        console.error("Failed to load activity:", error);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard TopBar */}
      <div className="sticky top-0 z-40 border-b-[3px] border-[var(--ink)] bg-white/90 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-black md:text-3xl tracking-tight">Dashboard</h1>
            <span className="hidden items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-xs font-bold uppercase shadow-[2px_2px_0_0_var(--ink)] md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ink)]" />
              Agent Active
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            {/* Wallet Balance - clickable to open deposit form */}
            <button
              onClick={() => setDepositOpen(!depositOpen)}
              title="Click to deposit funds"
              className="hidden md:flex items-center gap-3 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-4 py-2 shadow-[3px_3px_0_0_var(--ink)] cursor-pointer group hover:bg-[var(--electric)] hover:text-white hover:shadow-[4px_4px_0_0_var(--ink)] transition-all hover:-translate-y-0.5"
            >
              <Wallet className="h-4 w-4 shrink-0 group-hover:text-[var(--acid)] transition-colors" strokeWidth={2.5} />
              <div className="text-left">
                <div className="text-[9px] font-black uppercase tracking-widest opacity-60">Wallet</div>
                <div className="font-display text-base font-black leading-none">
                  ${(user?.walletBalance ?? stats?.walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </button>
            <div className="hidden md:block h-8 w-px bg-[var(--ink)]/20" />
            <div className="hidden text-right md:block">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink)]/50">Total Spent</div>
              <div className="font-display text-xl font-black">${stats?.totalSpent?.toLocaleString() || 0}</div>
            </div>
            <Link href={`/profile/${user?.id || user?._id}`} className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] overflow-hidden shadow-[2px_2px_0_0_var(--ink)] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--ink)]">
              <div className="font-display font-black text-white text-xl">{user?.firstName?.[0] || 'U'}</div>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        
        {/* Welcome & Stats Row */}
        <div className="grid gap-6 md:grid-cols-4 lg:gap-8">
          <div className="brutal-lg col-span-1 flex flex-col justify-between bg-[var(--ink)] p-8 text-white md:col-span-2 shadow-[8px_8px_0_0_var(--acid)]">
            <div>
              <h2 className="font-display text-4xl font-black md:text-5xl">Welcome back, <span className="text-[var(--acid)]">{(user?.lastName && user.lastName.length <= 12) ? user.lastName : 'Buyer'}.</span></h2>
              <p className="mt-3 text-lg text-white/80 font-medium">You have {stats?.activeBids || 0} active bids closing soon. The market is hot.</p>
            </div>
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => setDepositOpen(!depositOpen)}
                className="flex items-center gap-2 rounded-xl border-[3px] border-[var(--electric)] bg-[var(--electric)] px-6 py-3 font-display text-base font-black uppercase text-[var(--ink)] shadow-[4px_4px_0_0_var(--electric)] transition-transform hover:-translate-y-1 active:translate-y-0"
              >
                Deposit Funds <ArrowUpRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="brutal-lg flex flex-col justify-center bg-[var(--sunset)] p-6 shadow-[6px_6px_0_0_var(--ink)] transition-transform hover:-translate-y-1 relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)]">
                <Gavel className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <ArrowUpRight className="h-6 w-6 opacity-50" />
            </div>
            <div>
              <div className="font-display text-5xl font-black text-[var(--ink)]">
                {Number(stats?.itemsWon || 0)}
              </div>
              <div className="mt-1 text-sm font-bold uppercase text-[var(--ink)]/80 tracking-wide">Total Auctions Won</div>
            </div>

            {/* Quick Preview of Won Items */}
            {wonBids.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 z-20 hidden group-hover:block pointer-events-none">
                    <div className="brutal bg-white p-4 space-y-3 shadow-[8px_8px_0_0_var(--ink)]">
                        <p className="text-[10px] font-black uppercase tracking-widest border-b-[2px] border-dashed border-[var(--ink)]/20 pb-2">Recent Wins</p>
                        {wonBids.slice(0, 3).map(bid => (
                            <div key={bid.id} className="flex items-center gap-3">
                                <img src={bid.auction?.images?.[0]} className="h-10 w-10 rounded-lg border-[2px] border-[var(--ink)] object-cover" alt="" />
                                <span className="text-xs font-bold line-clamp-1">{bid.auction?.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <div className="brutal-lg flex flex-col justify-center bg-[var(--acid)] p-6 shadow-[6px_6px_0_0_var(--ink)] transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)]">
                <Activity className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <TrendingUp className="h-6 w-6 opacity-50" />
            </div>
            <div>
              <div className="font-display text-5xl font-black">{stats?.activeBids || 0}</div>
              <div className="mt-1 text-sm font-bold uppercase text-[var(--ink)]/80 tracking-wide">Active Bids</div>
            </div>
          </div>
        </div>

        {/* Deposit Modal */}
        <AnimatePresence>
          {depositOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 overflow-hidden"
            >
              <div className="brutal bg-white p-6 md:p-8">
                <h3 className="font-display text-2xl font-black mb-4">Add Funds to Wallet</h3>
                <form onSubmit={handleDeposit} className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="number" 
                    placeholder="Amount (USD, min $5)" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    min="5"
                    disabled={depositLoading}
                    className="flex-1 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-6 py-4 font-display text-xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30" 
                  />
                  <button 
                    type="submit"
                    disabled={depositLoading}
                    className="rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-8 py-4 font-display text-lg font-black uppercase text-white shadow-[4px_4px_0_0_var(--hotpink)] transition-transform hover:-translate-y-1 disabled:opacity-50"
                  >
                    {depositLoading ? "Redirecting..." : "Proceed to Payment"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Recommendations - Full Width Section */}
        <section className="mt-16">
          <div className="mb-8 flex items-center justify-between border-b-[4px] border-[var(--ink)] pb-4">
            <h3 className="font-display text-3xl font-black flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] text-white shadow-[2px_2px_0_0_var(--ink)]">
                <Sparkles className="h-5 w-5" />
              </span>
              AI Picks: Tailored For You
            </h3>
            <Link href="/buyer/ai-picks" className="flex items-center gap-1 font-display text-sm font-black uppercase text-[var(--ink)] hover:text-[var(--hotpink)] hover:underline decoration-2 underline-offset-4 transition-colors">
              Explore All <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recsLoading ? (
              <div className="brutal bg-white p-12 text-center font-bold text-[var(--ink)]/60 col-span-full animate-pulse">
                <Sparkles size={48} className="mx-auto mb-4 opacity-20 animate-spin" />
                Scanning radar for tailormade picks...
              </div>
            ) : recommendations?.length === 0 ? (
              <div className="brutal bg-white p-12 text-center font-bold text-[var(--ink)]/60 col-span-full">
                <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                No recommendations yet. Start browsing to unlock AI picks!
              </div>
            ) : (
              recommendations?.slice(0, 4).map((pick, i) => (
                <Link href={`/auction/${pick.id}`} key={i} className="block brutal overflow-hidden bg-white hover:-translate-y-2 transition-all group shadow-[6px_6px_0_0_var(--ink)] hover:shadow-[10px_10px_0_0_var(--hotpink)]">
                  <div className="relative aspect-square overflow-hidden border-b-[3px] border-[var(--ink)]">
                    <img src={pick.image} alt={pick.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute right-3 top-3 flex items-center justify-center h-10 w-10 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] shadow-[3px_3px_0_0_var(--ink)]">
                      <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/40 mb-2">{pick.category}</div>
                    <h4 className="font-display text-xl font-black leading-tight mb-4 group-hover:text-[var(--hotpink)] transition-colors line-clamp-2 h-12">{pick.title}</h4>
                    <div className="flex justify-between items-end border-t-[2px] border-dashed border-[var(--ink)]/20 pt-4">
                      <div>
                        <div className="text-[9px] uppercase font-black tracking-widest text-[var(--ink)]/40 mb-1">Current Bid</div>
                        <div className="font-display text-2xl font-black text-[var(--hotpink)]">${(pick.currentPrice || pick.startingPrice)?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Operational Grid */}
        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          
          {/* Active Bids */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Needs Payment Section */}
            {orders?.filter(o => o.status === 'pending').length > 0 && (
              <section>
                <div className="mb-6 flex items-center justify-between border-b-[4px] border-[var(--ink)] pb-4">
                  <h3 className="font-display text-3xl font-black flex items-center gap-3 text-[var(--hotpink)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--hotpink)] text-white shadow-[2px_2px_0_0_var(--ink)]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    Needs Payment
                  </h3>
                </div>
                
                <div className="space-y-5">
                  {orders.filter(o => o.status === 'pending').map((order, i) => (
                    <motion.div 
                      key={order._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="brutal group relative flex flex-col justify-between overflow-hidden bg-white p-5 md:flex-row md:items-center hover:-translate-y-1 transition-transform border-[4px] border-[var(--hotpink)] shadow-[6px_6px_0_0_var(--hotpink)]"
                    >
                      <div className="ml-4 flex items-center gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--background)] font-display text-sm font-black shadow-[2px_2px_0_0_var(--ink)] overflow-hidden">
                          <img src={order.auction?.images?.[0] || 'https://via.placeholder.com/150'} alt="Item" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-display text-xl font-black leading-tight group-hover:underline decoration-[3px] underline-offset-4">{order.auction?.title}</div>
                          <div className="mt-1 text-sm font-bold text-[var(--hotpink)] flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Due: {new Date(order.expiresAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-[var(--ink)] pt-4 md:mt-0 md:border-none md:pt-0 md:justify-end md:gap-8">
                        <div className="text-left md:text-right">
                          <div className="text-xs font-bold uppercase tracking-widest text-[var(--ink)]/60">Amount Due</div>
                          <div className="font-display text-2xl font-black">${order.amount?.toLocaleString() || 0}</div>
                        </div>
                        <button 
                          onClick={async () => {
                            try {
                              const res = await api('/api/payments/create-checkout', { method: 'POST', body: JSON.stringify({ orderId: order._id }) });
                              if (res.success) window.location.href = res.url;
                            } catch (err) { alert('Failed to initiate payment'); }
                          }}
                          className="rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] px-6 py-3 font-display text-base font-black uppercase text-white shadow-[4px_4px_0_0_var(--ink)] transition-transform hover:-translate-y-1"
                        >
                          Pay Now
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-6 flex items-center justify-between border-b-[4px] border-[var(--ink)] pb-4">
                <h3 className="font-display text-3xl font-black flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white shadow-[2px_2px_0_0_var(--ink)]">
                    <Clock className="h-5 w-5" />
                  </span>
                  Your Active Bids
                </h3>
                <Link href="/bids" className="flex items-center gap-1 font-display text-sm font-black uppercase text-[var(--ink)] hover:text-[var(--electric)] hover:underline decoration-2 underline-offset-4 transition-colors">
                  View All <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </Link>
              </div>
              
              <div className="space-y-5">
                {activeBids?.length === 0 ? (
                  <div className="brutal bg-white p-8 text-center text-[var(--ink)]/60 font-bold uppercase tracking-widest">
                    No active bids found.
                  </div>
                ) : (
                  activeBids?.map((bid, i) => (
                    <motion.div 
                      key={bid.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="brutal group relative flex flex-col justify-between overflow-hidden bg-white p-5 md:flex-row md:items-center hover:-translate-y-1 transition-transform"
                    >
                      <div className="absolute left-0 top-0 h-full w-3" style={{ background: bid.status === 'winning' ? 'var(--acid)' : 'var(--hotpink)' }} />
                      <div className="ml-4 flex items-center gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--background)] font-display text-sm font-black shadow-[2px_2px_0_0_var(--ink)] overflow-hidden">
                          <img src={bid.auction?.images?.[0] || 'https://via.placeholder.com/150'} alt="Item" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-display text-xl font-black leading-tight group-hover:underline decoration-[3px] underline-offset-4">{bid.auction?.title}</div>
                          <div className="mt-2">
                            <CountdownTimer endTime={bid.auction?.endTime} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-[var(--ink)] pt-4 md:mt-0 md:border-none md:pt-0 md:justify-end md:gap-8">
                        <div className="text-left md:text-right">
                          <div className="text-xs font-bold uppercase tracking-widest text-[var(--ink)]/60">Your Bid</div>
                          <div className="font-display text-2xl font-black">${bid.amount?.toLocaleString() || 0}</div>
                        </div>
                        <div className={`flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] px-4 py-2 font-display text-sm font-black uppercase shadow-[2px_2px_0_0_var(--ink)] ${bid.status === 'winning' ? 'bg-[var(--acid)]' : 'bg-[var(--hotpink)] text-white'}`}>
                          {bid.status === 'winning' ? <CheckCircle2 className="h-4 w-4" /> : <BellRing className="h-4 w-4 animate-bounce" />}
                          {bid.status}
                        </div>
                        {bid.status === 'outbid' && (
                          <button className="rounded-xl border-[3px] border-[var(--ink)] bg-[var(--ink)] px-5 py-2 font-display text-sm font-black uppercase text-white shadow-[2px_2px_0_0_var(--electric)] transition-transform hover:-translate-y-0.5">
                            Raise
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-4">
            <section className="brutal-lg overflow-hidden bg-[var(--electric)] shadow-[6px_6px_0_0_var(--ink)] sticky top-28">
              <div className="flex items-center justify-between border-b-[4px] border-[var(--ink)] bg-[var(--ink)] px-6 py-5 text-white">
                <h3 className="font-display text-2xl font-black flex items-center gap-3">
                  <Activity className="h-6 w-6 text-[var(--acid)]" /> Signal
                </h3>
              </div>
              <div className="space-y-4 p-6 bg-[var(--background)] max-h-[600px] overflow-y-auto custom-scrollbar">
                {activityLoading ? (
                  <div className="text-center font-bold text-[var(--ink)]/60 py-10 uppercase tracking-widest animate-pulse">Receiving signals...</div>
                ) : activity?.length === 0 ? (
                  <div className="text-center font-bold text-[var(--ink)]/60 py-10 uppercase tracking-widest">Silence on the wire</div>
                ) : (
                  activity?.map((item, i) => (
                    <div key={item.id} className="rounded-2xl border-[3px] border-[var(--ink)] bg-white p-5 shadow-[4px_4px_0_0_var(--ink)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${item.type === 'won' ? 'bg-[var(--acid)]' : item.type === 'outbid' ? 'bg-[var(--hotpink)]' : 'bg-[var(--electric)]'}`} />
                      <div className="text-[10px] font-black uppercase tracking-widest text-[var(--ink)]/40 mb-2">{new Date(item.time).toLocaleTimeString()}</div>
                      <p className="font-bold text-sm leading-snug">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

        </div>
      </main>
    </>
  );
}

export default function BuyerDashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--electric)] text-white shadow-[4px_4px_0_0_var(--ink)] animate-pulse">
                    <Activity className="h-8 w-8 animate-spin" />
                </div>
            </div>
        }>
            <BuyerDashboardContent />
        </Suspense>
    );
}
