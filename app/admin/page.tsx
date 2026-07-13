"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { 
  Check, 
  X, 
  Loader2, 
  ShieldAlert, 
  RefreshCw, 
  Search, 
  Eye, 
  Download, 
  DollarSign, 
  Users, 
  AlertCircle,
  FileText,
  QrCode,
  Utensils,
  Gift,
  ScanLine
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  ticket_count: number;
  price_paid: number;
  screenshot_path: string;
  screenshot_url: string | null;
  status: "pending" | "approved" | "rejected";
  ticket_code: string | null;
  rejection_reason: string | null;
  checked_in?: boolean;
  checked_in_at?: string | null;
  food_claimed?: boolean;
  food_claimed_at?: string | null;
  goodie_claimed?: boolean;
  goodie_claimed_at?: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  
  // Dashboard Data States
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [dataError, setDataError] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // View Mode State
  const [viewMode, setViewMode] = useState<"registrations" | "scanner">("registrations");

  // Scanner States
  const [activeScanAction, setActiveScanAction] = useState<"check_in" | "food" | "goodie">("check_in");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    already_claimed?: boolean;
    message: string;
    ticket?: Ticket;
  } | null>(null);
  const [manualTicketCode, setManualTicketCode] = useState("");
  const [isScanSubmitting, setIsScanSubmitting] = useState(false);

  // Scanner Lock Refs
  const isProcessingRef = useRef(false);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Action/Modal States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Fetch Tickets on mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchTickets();
    }
  }, [isLoaded, user]);

  const fetchTickets = async () => {
    setIsLoading(true);
    setDataError("");
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets(data.tickets);
        setIsAuthorized(true);
      } else if (res.status === 403) {
        setIsAuthorized(false);
      } else {
        setDataError(data.error || "Failed to load registrations.");
      }
    } catch (err) {
      console.error(err);
      setDataError("A network error occurred while fetching registrations.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Ticket Action (Approve / Reject)
  const handleTicketAction = async (ticketId: string, action: "approve" | "reject") => {
    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: action === "reject" ? rejectionReason : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update local state smoothly
        setTickets(prev =>
          prev.map(t => {
            if (t.id === ticketId) {
              return {
                ...t,
                status: action === "approve" ? "approved" : "rejected",
                ticket_code: action === "approve" ? data.ticketCode : null,
                rejection_reason: action === "reject" ? rejectionReason : null,
              };
            }
            return t;
          })
        );
        setSelectedTicket(null);
        setShowRejectForm(false);
        setRejectionReason("");
      } else {
        alert(data.error || "Action failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process ticket action due to network error.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (tickets.length === 0) return;

    const headers = ["Date", "Name", "Email", "Phone", "Category", "Quantity", "Price Paid", "Status", "Ticket Code", "Rejection Reason"];
    const rows = tickets.map(t => [
      new Date(t.created_at).toLocaleString(),
      `"${t.name.replace(/"/g, '""')}"`,
      t.email,
      t.phone,
      t.category,
      t.ticket_count,
      t.price_paid,
      t.status,
      t.ticket_code || "",
      t.rejection_reason ? `"${t.rejection_reason.replace(/"/g, '""')}"` : ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tedxiceas_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process scanned code
  const handleProcessScan = async (code: string, actionType: "check_in" | "food" | "goodie") => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Cooldown check: prevent scanning the exact same code twice within 3 seconds
    const now = Date.now();
    if (cleanCode === lastScannedCodeRef.current && (now - lastScanTimeRef.current) < 3000) {
      return;
    }

    if (isProcessingRef.current || isScanSubmitting) return;

    isProcessingRef.current = true;
    setIsScanSubmitting(true);
    setScanResult(null);

    // Update refs for last scanned code and time
    lastScannedCodeRef.current = cleanCode;
    lastScanTimeRef.current = now;

    try {
      const res = await fetch("/api/admin/tickets/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_code: cleanCode,
          action: actionType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setScanResult({
          success: data.success,
          already_claimed: data.already_claimed,
          message: data.message,
          ticket: data.ticket,
        });

        // Refresh metrics and database lists
        fetchTickets();
      } else {
        setScanResult({
          success: false,
          message: data.error || "Failed to process scan.",
        });
      }
    } catch (err) {
      console.error("Scan submission error:", err);
      setScanResult({
        success: false,
        message: "Network error occurred while processing scan.",
      });
    } finally {
      isProcessingRef.current = false;
      setIsScanSubmitting(false);
      setManualTicketCode("");
    }
  };

  // Setup html5-qrcode raw scanner
  useEffect(() => {
    if (viewMode !== "scanner") return;

    let scannerInstance: any = null;
    let isScanning = false;

    import("html5-qrcode")
      .then((lib) => {
        scannerInstance = new lib.Html5Qrcode("qr-reader");

        scannerInstance.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            handleProcessScan(decodedText, activeScanAction);
          },
          (errorMessage: string) => {
            // Quietly ignore scan errors
          }
        )
        .then(() => {
          isScanning = true;
        })
        .catch((err: any) => {
          console.warn("Failed starting with environment facingMode, trying user facingMode:", err);
          // Try user facingMode (e.g. front camera if environment camera is not available)
          scannerInstance.start(
            { facingMode: "user" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText: string) => {
              handleProcessScan(decodedText, activeScanAction);
            },
            (errorMessage: string) => {
              // Quietly ignore
            }
          )
          .then(() => {
            isScanning = true;
          })
          .catch((fallbackErr: any) => {
            console.error("Failed fallback camera start:", fallbackErr);
          });
        });
      })
      .catch((err) => {
        console.error("Error loading html5-qrcode library:", err);
      });

    return () => {
      if (scannerInstance) {
        if (isScanning) {
          scannerInstance.stop().catch((err: any) => {
            console.error("Failed to stop scanner:", err);
          });
        }
      }
    };
  }, [viewMode, activeScanAction]);

  // Metrics Calculations
  const metrics = {
    totalRevenue: tickets
      .filter(t => t.status === "approved")
      .reduce((sum, t) => sum + t.price_paid, 0),
    totalTicketsSold: tickets
      .filter(t => t.status === "approved")
      .reduce((sum, t) => sum + t.ticket_count, 0),
    pendingCount: tickets.filter(t => t.status === "pending").length,
    approvedCount: tickets.filter(t => t.status === "approved").length,
    rejectedCount: tickets.filter(t => t.status === "rejected").length,
    checkedInCount: tickets.filter(t => t.checked_in).reduce((sum, t) => sum + t.ticket_count, 0),
    foodClaimedCount: tickets.filter(t => t.food_claimed).reduce((sum, t) => sum + t.ticket_count, 0),
    goodieClaimedCount: tickets.filter(t => t.goodie_claimed).reduce((sum, t) => sum + t.ticket_count, 0),
  };

  // Filter Tickets
  const filteredTickets = tickets.filter(t => {
    const matchesTab = activeTab === "all" || t.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      t.name.toLowerCase().includes(searchLower) ||
      t.email.toLowerCase().includes(searchLower) ||
      t.phone.includes(searchLower) ||
      (t.ticket_code && t.ticket_code.toLowerCase().includes(searchLower));
    
    return matchesTab && matchesSearch;
  });

  // Render Loader while checking session status
  if (!isLoaded || (isLoading && isAuthorized === null)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#EB0028]" size={40} />
      </div>
    );
  }

  // Render Access Denied for unauthorized Clerk users
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('/noise.svg')" }}></div>
        <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black opacity-80 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-zinc-950/60 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl text-center space-y-6"
        >
          {/* Corner Decors */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#EB0028]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#EB0028]"></div>

          <ShieldAlert className="mx-auto text-[#EB0028]" size={48} />
          
          <div>
            <h1 className="font-orbitron font-black text-2xl tracking-tight text-white">
              ACCESS <span className="text-[#EB0028]">DENIED</span>
            </h1>
            <p className="text-xs uppercase tracking-widest text-white/50 font-orbitron mt-2">
              Unauthorized Account
            </p>
          </div>

          <p className="font-clash text-sm text-white/60 leading-relaxed">
            Your logged-in account (<strong>{user?.primaryEmailAddress?.emailAddress}</strong>) is not listed in the authorized administrators list.
          </p>

          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <UserButton />
            <span className="text-[10px] text-white/40">Switch accounts above to login as admin</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: "url('/noise.svg')" }}></div>
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black opacity-80 pointer-events-none"></div>

      {/* Navigation */}
      <header className="relative z-10 border-b border-white/10 bg-black/60 backdrop-blur-md px-6 md:px-12 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-orbitron font-bold text-xl md:text-2xl tracking-wide">
            TEDx<span className="text-[#EB0028]">ICEAS</span> <span className="text-white/60 font-light text-sm ml-2 hidden sm:inline">Admin Panel</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-zinc-900 border border-white/10 p-1 rounded-lg">
            <button
              onClick={() => {
                setViewMode("registrations");
                setScanResult(null);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "registrations"
                  ? "bg-[#EB0028] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Registrations
            </button>
            <button
              onClick={() => {
                setViewMode("scanner");
                setScanResult(null);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "scanner"
                  ? "bg-[#EB0028] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Scanners
            </button>
          </div>

          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="p-2 border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <UserButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-10 space-y-8">
        
        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-6 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-orbitron font-black text-emerald-400 mt-2">
                ₹{metrics.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <DollarSign size={22} />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-6 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Tickets Approved</p>
              <h3 className="text-3xl font-orbitron font-black text-white mt-2">
                {metrics.totalTicketsSold}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-white/80 border border-white/10">
              <Users size={22} />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-6 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Pending Approval</p>
              <h3 className={`text-3xl font-orbitron font-black mt-2 ${metrics.pendingCount > 0 ? "text-amber-400 animate-pulse" : "text-white/60"}`}>
                {metrics.pendingCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <AlertCircle size={22} />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-6 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Rejected Requests</p>
              <h3 className="text-3xl font-orbitron font-black text-red-400 mt-2">
                {metrics.rejectedCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
              <X size={22} />
            </div>
          </div>
        </section>

        {/* Database Error Alert */}
        {dataError && (
          <div className="p-4 bg-red-950/30 border border-red-500/40 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{dataError}</span>
          </div>
        )}

        {/* Table & Controls Section */}
        {viewMode === "scanner" ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Scanner Stream / Input */}
            <div className="lg:col-span-7 bg-zinc-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
              
              {/* Mode Selectors */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900 border border-white/5 rounded-xl">
                {[
                  { type: "check_in", label: "Check-in", icon: QrCode },
                  { type: "food", label: "Food Pass", icon: Utensils },
                  { type: "goodie", label: "Goodie Pass", icon: Gift },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.type}
                      onClick={() => {
                        setActiveScanAction(mode.type as any);
                        setScanResult(null);
                      }}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        activeScanAction === mode.type
                          ? "bg-[#EB0028] text-white shadow-md"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon size={14} />
                      <span className="text-[10px] sm:text-xs text-center">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Camera Scanner Box */}
              <div className="relative border border-white/10 rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center p-4 min-h-[300px]">
                <div id="qr-reader" className="w-full max-w-[400px] overflow-hidden rounded-lg"></div>
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 py-1.5 px-3 rounded-full text-[10px] tracking-wide text-white/70 uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#EB0028] animate-ping"></span>
                  Scanner Live
                </div>
              </div>

              {/* Manual input fallback */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Manual Ticket Code Input
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualTicketCode.trim()) {
                      handleProcessScan(manualTicketCode, activeScanAction);
                    }
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={manualTicketCode}
                    onChange={(e) => setManualTicketCode(e.target.value)}
                    placeholder="e.g. TEDX-ICEAS-A1B2C3"
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg py-3 px-4 text-white font-mono placeholder-white/30 uppercase tracking-wider focus:outline-none focus:border-[#EB0028] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isScanSubmitting || !manualTicketCode.trim()}
                    className="px-6 bg-[#EB0028] hover:bg-[#c30020] disabled:bg-zinc-800 disabled:text-white/30 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm uppercase tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {isScanSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
                  </button>
                </form>
              </div>
            </div>

            {/* Scanner Status / Scanned Attendee Results */}
            <div className="lg:col-span-5 bg-zinc-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between min-h-[400px]">
              <div className="space-y-6">
                <h3 className="font-orbitron font-bold text-sm text-white/50 uppercase tracking-wider border-b border-white/10 pb-3">
                  Scan Status & Details
                </h3>

                {scanResult ? (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Status Indicator */}
                    <div className={`p-4 border rounded-xl flex items-start gap-3 ${
                      scanResult.success 
                        ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
                        : scanResult.already_claimed
                        ? "bg-amber-950/20 border-amber-500/20 text-amber-400"
                        : "bg-red-950/20 border-red-500/20 text-red-400"
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {scanResult.success ? (
                          <Check size={20} className="stroke-[3]" />
                        ) : (
                          <X size={20} className="stroke-[3]" />
                        )}
                      </div>
                      <div>
                        <p className="font-clash font-bold text-sm uppercase tracking-wide">
                          {scanResult.success 
                            ? "Scan Success" 
                            : scanResult.already_claimed
                            ? "Already Claimed"
                            : "Scan Failed"}
                        </p>
                        <p className="text-xs mt-1 text-white/80 leading-normal">
                          {scanResult.message}
                        </p>
                      </div>
                    </div>

                    {/* Scanned Ticket Information */}
                    {scanResult.ticket && (
                      <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-4 space-y-3 font-clash text-sm text-white/80">
                        <h4 className="font-orbitron text-xs text-white/50 uppercase tracking-wider pb-1.5 border-b border-white/5">
                          Attendee Information
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase">Name</span>
                            <span className="font-bold text-white text-base">{scanResult.ticket.name}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase">Category</span>
                            <span className="font-semibold uppercase tracking-wider bg-[#EB0028]/10 border border-[#EB0028]/25 text-[#EB0028] text-[9px] px-2 py-0.5 rounded w-fit inline-block">
                              {scanResult.ticket.category}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase">Quantity</span>
                            <span className="font-bold text-white text-base">Admit {scanResult.ticket.ticket_count}</span>
                          </div>
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase">Ticket Code</span>
                            <span className="font-mono text-emerald-400 font-bold">{scanResult.ticket.ticket_code}</span>
                          </div>
                          <div className="col-span-2 border-t border-white/5 pt-3 grid grid-cols-3 gap-2 text-center text-[9px] font-bold uppercase tracking-wider">
                            <div className={`p-1.5 rounded border ${
                              scanResult.ticket.checked_in
                                ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-900 border-white/5 text-white/30"
                            }`}>
                              Entry check-in
                            </div>
                            <div className={`p-1.5 rounded border ${
                              scanResult.ticket.food_claimed
                                ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-900 border-white/5 text-white/30"
                            }`}>
                              Food Pass
                            </div>
                            <div className={`p-1.5 rounded border ${
                              scanResult.ticket.goodie_claimed
                                ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-900 border-white/5 text-white/30"
                            }`}>
                              Goodie Pass
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-20 space-y-3 text-white/30">
                    <ScanLine size={32} className="stroke-[1.5]" />
                    <p className="font-clash text-xs">
                      Scan a QR code or enter a code manually to display results here.
                    </p>
                  </div>
                )}
              </div>

              {/* Summary statistics */}
              <div className="bg-zinc-900 border border-white/5 rounded-xl p-4 mt-6">
                <h4 className="font-orbitron text-[10px] text-white/40 uppercase tracking-widest mb-3">
                  Live Attendance Summary
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center font-clash text-xs">
                  <div className="space-y-1">
                    <span className="text-white/40 text-[9px] block uppercase tracking-wider">Checked In</span>
                    <span className="font-orbitron font-bold text-lg text-emerald-400">{metrics.checkedInCount}</span>
                  </div>
                  <div className="space-y-1 border-x border-white/5">
                    <span className="text-white/40 text-[9px] block uppercase tracking-wider">Food Claimed</span>
                    <span className="font-orbitron font-bold text-lg text-white">{metrics.foodClaimedCount}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white/40 text-[9px] block uppercase tracking-wider">Goodies Claimed</span>
                    <span className="font-orbitron font-bold text-lg text-white">{metrics.goodieClaimedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-zinc-950/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl flex flex-col min-h-[500px]">
            {/* Controls Bar */}
            <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950/20">
              {/* Tabs */}
              <div className="flex gap-1.5 p-1 bg-zinc-900 border border-white/5 rounded-lg w-fit">
                {["pending", "approved", "rejected", "all"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer
                      ${activeTab === tab 
                        ? "bg-[#EB0028] text-white shadow-md" 
                        : "text-white/50 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search and Export */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attendee or code..."
                    className="w-full bg-zinc-900 border border-white/5 hover:border-white/15 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/35 focus:outline-none focus:border-[#EB0028] transition-colors"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  disabled={tickets.length === 0}
                  className="inline-flex items-center gap-2 border border-white/10 hover:border-white/30 hover:bg-white/5 px-4 py-2.5 rounded-lg text-white font-semibold text-xs transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  title="Export to CSV"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-x-auto">
              {isLoading ? (
                <div className="h-96 flex flex-col items-center justify-center text-white/50 gap-2">
                  <Loader2 className="animate-spin text-[#EB0028]" size={36} />
                  <p className="text-sm">Loading registrations...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-white/45 gap-2">
                  <FileText size={40} className="text-white/20" />
                  <p className="text-sm font-semibold">No registrations found</p>
                </div>
              ) : (
                <table className="w-full text-left font-clash text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-zinc-950/40 text-xs font-bold uppercase tracking-wider text-white/50 select-none">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Attendee</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Qty</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Ticket Code</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-white/60 text-xs">
                          <span className="block font-semibold">
                            {new Date(ticket.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-white/40">
                            {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-white">{ticket.name}</div>
                          <div className="text-xs text-white/50 mt-0.5 select-all">{ticket.email}</div>
                          <div className="text-xs text-white/50 font-mono mt-0.5 select-all">{ticket.phone}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${ticket.category === "Faculty" 
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }
                          `}>
                            {ticket.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold">{ticket.ticket_count}</td>
                        <td className="py-4 px-6 font-bold text-white/90 font-mono">₹{ticket.price_paid}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border
                            ${ticket.status === "approved" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : ticket.status === "rejected"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            }
                          `}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-emerald-400 font-bold">
                          {ticket.ticket_code || (
                            <span className="text-xs text-white/30 italic">Pending check</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="inline-flex items-center gap-1 bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Review Lightbox Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm overflow-y-auto"
            onClick={() => {
              if (!isActionLoading) setSelectedTicket(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTicket(null)}
                disabled={isActionLoading}
                className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer z-10"
              >
                <X size={20} />
              </button>

              {/* Left Side: Screenshot Image */}
              <div className="flex-1 bg-black border-r border-white/5 flex items-center justify-center p-4 min-h-[300px] max-h-[550px] md:max-h-[none]">
                {selectedTicket.screenshot_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedTicket.screenshot_url}
                    alt="Uploaded payment proof screenshot"
                    className="max-w-full max-h-[500px] object-contain rounded select-none animate-fadeIn"
                  />
                ) : (
                  <div className="text-white/40 text-center space-y-2">
                    <AlertCircle size={36} className="mx-auto text-amber-500" />
                    <p className="text-xs">No screenshot image url available.</p>
                  </div>
                )}
              </div>

              {/* Right Side: details and actions */}
              <div className="w-full md:w-[360px] p-6 flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#EB0028] font-orbitron">
                      Verification Panel
                    </span>
                    <h3 className="text-lg font-orbitron font-bold text-white mt-0.5">
                      Verify Transaction
                    </h3>
                  </div>

                  <div className="space-y-4 border-t border-b border-white/5 py-4 my-4 font-sans text-xs">
                    <div>
                      <span className="text-white/40 block">Attendee Name</span>
                      <span className="text-sm font-semibold text-white">{selectedTicket.name}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Email Address</span>
                      <span className="font-semibold text-white select-all">{selectedTicket.email}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Phone Number</span>
                      <span className="font-semibold text-white font-mono select-all">{selectedTicket.phone}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-white/40 block">Category</span>
                        <span className="font-semibold text-white">{selectedTicket.category}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">Quantity</span>
                        <span className="font-semibold text-white">{selectedTicket.ticket_count} Ticket(s)</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-white/40 block">Total Amount Expected</span>
                      <span className="text-lg font-bold text-[#EB0028] font-orbitron">₹{selectedTicket.price_paid}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Registration Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block mt-1
                        ${selectedTicket.status === "approved" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : selectedTicket.status === "rejected"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }
                      `}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    {selectedTicket.ticket_code && (
                      <div>
                        <span className="text-white/40 block">Ticket Code</span>
                        <span className="text-sm font-mono font-bold text-emerald-400 select-all">{selectedTicket.ticket_code}</span>
                      </div>
                    )}
                    {selectedTicket.rejection_reason && (
                      <div>
                        <span className="text-white/40 block text-red-400">Rejection Reason</span>
                        <span className="text-xs italic text-red-300">{selectedTicket.rejection_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Block */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  {selectedTicket.status === "pending" ? (
                    <>
                      {showRejectForm ? (
                        <div className="space-y-3 animate-fadeIn">
                          <label className="block text-[10px] font-semibold uppercase text-red-400">
                            Reason for rejection:
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. UPI Transaction reference ID does not match..."
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#EB0028] h-20 resize-none"
                            disabled={isActionLoading}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setShowRejectForm(false);
                                setRejectionReason("");
                              }}
                              disabled={isActionLoading}
                              className="bg-transparent border border-white/10 hover:border-white/20 py-2 rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleTicketAction(selectedTicket.id, "reject")}
                              disabled={isActionLoading || !rejectionReason.trim()}
                              className="bg-red-600 hover:bg-red-700 text-white py-2 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isActionLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                "Confirm Reject"
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setShowRejectForm(true)}
                            disabled={isActionLoading}
                            className="border border-red-500/30 hover:border-red-500 bg-red-950/10 hover:bg-[#EB0028]/10 text-red-400 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => handleTicketAction(selectedTicket.id, "approve")}
                            disabled={isActionLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isActionLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <>
                                <Check size={14} />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/25 py-3 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                    >
                      Close Review
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
