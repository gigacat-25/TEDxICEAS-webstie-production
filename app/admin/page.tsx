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
  ScanLine,
  Fingerprint,
  Pencil,
  Mail,
  Send,
  Sparkles,
  CheckSquare,
  Square,
  Paperclip,
  Trash2,
  File
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
  usn?: string | null;
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
  const [viewMode, setViewMode] = useState<"registrations" | "scanner" | "usns" | "email">("registrations");

  // Selected Ticket IDs for Emailing
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  // Email Broadcast Form States
  const [emailSubject, setEmailSubject] = useState("Important Announcement | TEDxICEAS 🎤");
  const [emailTitle, setEmailTitle] = useState("Official Event Update");
  const [emailMessage, setEmailMessage] = useState(
    "Hello {{name}},\n\nWe are thrilled to share an important update regarding TEDxICEAS!\n\nYour official entry ticket code is {{ticket_code}}. Please make sure to keep this email or a screenshot of your ticket code handy when arriving at the venue.\n\nWe look forward to welcoming you!"
  );
  const [emailCtaText, setEmailCtaText] = useState("View Event Roadmap");
  const [emailCtaUrl, setEmailCtaUrl] = useState("https://tedxiceas.in/roadmap");
  const [recipientMode, setRecipientMode] = useState<"all" | "selected" | "custom" | "test">("all");
  const [customEmailsInput, setCustomEmailsInput] = useState("");
  const [testEmailInput, setTestEmailInput] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showSendConfirmModal, setShowSendConfirmModal] = useState(false);
  const [emailSendResult, setEmailSendResult] = useState<{
    success: boolean;
    message: string;
    totalCount?: number;
    successCount?: number;
    failureCount?: number;
    errors?: any[];
  } | null>(null);
  const [emailAttachments, setEmailAttachments] = useState<Array<{ name: string; size: number; type: string; base64: string }>>([]);
  const [includeQRCode, setIncludeQRCode] = useState(true);

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
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  // Scanner Lock Refs
  const isProcessingRef = useRef(false);
  const lastScannedCodeRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Action/Modal States
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Settings / Seat Capacity States
  const [totalSeats, setTotalSeats] = useState<number>(100);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [newCapacityInput, setNewCapacityInput] = useState<string>("100");
  const [isSavingCapacity, setIsSavingCapacity] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.success && data.total_seats) {
        setTotalSeats(data.total_seats);
        setNewCapacityInput(String(data.total_seats));
      }
    } catch (err) {
      console.error("Failed to fetch admin settings:", err);
    }
  };

  const handleSaveCapacity = async () => {
    const val = parseInt(newCapacityInput, 10);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid seat capacity (positive number).");
      return;
    }

    setIsSavingCapacity(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_seats: val }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTotalSeats(data.total_seats);
        setShowCapacityModal(false);
        alert(`Successfully updated total seat capacity to ${data.total_seats}!`);
      } else {
        alert(data.error || "Failed to update seat capacity.");
      }
    } catch (err) {
      console.error("Save capacity error:", err);
      alert("Network error occurred while saving seat capacity.");
    } finally {
      setIsSavingCapacity(false);
    }
  };

  // USN Management States
  const [usnList, setUsnList] = useState<{ usn: string; created_at: string }[]>([]);
  const [isUsnLoading, setIsUsnLoading] = useState(false);
  const [bulkUsnInput, setBulkUsnInput] = useState("");
  const [usnSearchQuery, setUsnSearchQuery] = useState("");
  const [isUploadingUsn, setIsUploadingUsn] = useState(false);

  useEffect(() => {
    if (isLoaded && user && viewMode === "usns") {
      fetchUsns();
    }
  }, [isLoaded, user, viewMode]);

  const fetchUsns = async () => {
    setIsUsnLoading(true);
    try {
      const res = await fetch("/api/admin/usns");
      const data = await res.json();
      if (res.ok && data.success) {
        setUsnList(data.usns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUsnLoading(false);
    }
  };

  const handleBulkUsnUpload = async () => {
    if (!bulkUsnInput.trim()) return;
    setIsUploadingUsn(true);
    try {
      const splitUsns = bulkUsnInput
        .split(/[\n,\s]+/)
        .map((u) => u.trim().toUpperCase())
        .filter(Boolean);

      if (splitUsns.length === 0) {
        alert("Please enter at least one valid USN.");
        return;
      }

      const res = await fetch("/api/admin/usns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usns: splitUsns }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Successfully authorized ${splitUsns.length} USNs!`);
        setBulkUsnInput("");
        fetchUsns();
      } else {
        alert(data.error || "Failed to upload USNs.");
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred while uploading USNs.");
    } finally {
      setIsUploadingUsn(false);
    }
  };

  // Approved tickets filter for email broadcast targeting
  const approvedTickets = tickets.filter((t) => t.status === "approved");

  const toggleSelectAllApproved = () => {
    const approvedIds = approvedTickets.map((t) => t.id);
    if (selectedTicketIds.length === approvedIds.length && approvedIds.length > 0) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(approvedIds);
    }
  };

  const toggleSelectTicket = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentTotalSize = emailAttachments.reduce((sum, item) => sum + item.size, 0);

    Array.from(files).forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        alert(`File '${file.name}' exceeds the 3MB per-file size limit. Please attach a smaller file or compress it.`);
        return;
      }

      if (currentTotalSize + file.size > 4.5 * 1024 * 1024) {
        alert(`Total combined attachments size exceeds 4.5MB. Please remove some attachments before adding '${file.name}'.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        setEmailAttachments((prev) => [
          ...prev,
          { name: file.name, size: file.size, type: file.type, base64 },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setEmailAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendEmailBroadcast = async (isTestMode = false) => {
    setIsSendingEmail(true);
    setEmailSendResult(null);

    const totalAttachmentBytes = emailAttachments.reduce((acc, curr) => acc + curr.size, 0);
    if (totalAttachmentBytes > 4.5 * 1024 * 1024) {
      setIsSendingEmail(false);
      alert("Total attached files size exceeds 4.5MB. Please reduce attachment sizes before sending.");
      return;
    }

    const mode = isTestMode ? "test" : recipientMode;
    const splitCustomEmails = customEmailsInput
      .split(/[\n,\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/tickets/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          title: emailTitle,
          message: emailMessage,
          ctaText: emailCtaText,
          ctaUrl: emailCtaUrl,
          recipientMode: mode,
          selectedTicketIds: mode === "selected" ? selectedTicketIds : [],
          customEmails: mode === "custom" ? splitCustomEmails : [],
          testEmail: isTestMode ? (testEmailInput || user?.primaryEmailAddress?.emailAddress) : "",
          includeQRCode,
          attachments: emailAttachments.map((att) => ({
            filename: att.name,
            content: att.base64,
            contentType: att.type,
          })),
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = {
          success: false,
          error: res.status === 504
            ? "Server Timeout (504): The broadcast request took too long to complete. Please try sending in smaller selected batches or reduce attachment file sizes."
            : `Server returned HTTP status ${res.status}.`,
        };
      }

      if (res.ok && data.success) {
        setEmailSendResult({
          success: true,
          message: data.message || `Successfully sent email broadcast!`,
          totalCount: data.totalCount,
          successCount: data.successCount,
          failureCount: data.failureCount,
          errors: data.errors,
        });
        setShowSendConfirmModal(false);
      } else {
        setEmailSendResult({
          success: false,
          message: data.error || "Failed to send email broadcast.",
        });
      }
    } catch (err: any) {
      console.error("Broadcast email error:", err);
      const isFetchError = err?.name === "TypeError" || err?.message?.includes("fetch");
      setEmailSendResult({
        success: false,
        message: isFetchError
          ? "Network/payload size limit error. If you attached large files, please compress or reduce attachment sizes (max 4.5MB combined total)."
          : (err?.message || "An unexpected error occurred while sending email broadcast."),
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDeleteUsn = async (usnToDelete: string) => {
    if (!confirm(`Are you sure you want to remove USN '${usnToDelete}' from the pre-authorized list?`)) return;
    try {
      const res = await fetch(`/api/admin/usns?usn=${encodeURIComponent(usnToDelete)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsns();
      } else {
        alert(data.error || "Failed to delete USN.");
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred while deleting the USN.");
    }
  };

  // Fetch Tickets on mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchTickets();
    }
  }, [isLoaded, user]);

  const fetchTickets = async () => {
    setIsLoading(true);
    setDataError("");
    fetchSettings();
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
      setIsScanSubmitting(false);
      setManualTicketCode("");
      setIsPaused(true);
      isPausedRef.current = true;
    }
  };

  const handleScanNext = () => {
    setScanResult(null);
    setManualTicketCode("");
    setIsPaused(false);
    isPausedRef.current = false;
    isProcessingRef.current = false;
    lastScannedCodeRef.current = null;
    lastScanTimeRef.current = 0;
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
            if (isPausedRef.current) return;
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
              if (isPausedRef.current) return;
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
            <button
              onClick={() => {
                setViewMode("usns");
                setScanResult(null);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === "usns"
                  ? "bg-[#EB0028] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              USNs
            </button>
            <button
              onClick={() => {
                setViewMode("email");
                setScanResult(null);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "email"
                  ? "bg-[#EB0028] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Mail size={12} />
              <span>Send Emails</span>
            </button>
          </div>

          <button
            onClick={() => {
              setNewCapacityInput(String(totalSeats));
              setShowCapacityModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            title="Edit Amount of Tickets Available"
          >
            <Pencil size={13} />
            <span className="hidden sm:inline">Set Ticket Limit ({totalSeats})</span>
          </button>

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
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-orbitron font-black text-emerald-400 mt-1.5">
                ₹{metrics.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between shadow-lg relative group">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Seat Capacity</p>
                <button
                  onClick={() => {
                    setNewCapacityInput(String(totalSeats));
                    setShowCapacityModal(true);
                  }}
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 p-1 rounded transition-colors cursor-pointer"
                  title="Edit Total Seat Capacity"
                >
                  <Pencil size={12} />
                </button>
              </div>
              <h3 className="text-2xl font-orbitron font-black text-amber-400 mt-1.5">
                {metrics.totalTicketsSold + metrics.pendingCount} <span className="text-xs font-normal text-white/50">/ {totalSeats}</span>
              </h3>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-2 overflow-hidden border border-white/10">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-[#EB0028] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round(((metrics.totalTicketsSold + metrics.pendingCount) / totalSeats) * 100))}%` }}
                />
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Approved</p>
              <h3 className="text-2xl font-orbitron font-black text-white mt-1.5">
                {metrics.totalTicketsSold}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/80 border border-white/10">
              <Check size={20} />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Pending</p>
              <h3 className={`text-2xl font-orbitron font-black mt-1.5 ${metrics.pendingCount > 0 ? "text-amber-400 animate-pulse" : "text-white/60"}`}>
                {metrics.pendingCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <AlertCircle size={20} />
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-white/10 rounded-xl p-5 backdrop-blur-sm flex items-center justify-between shadow-lg">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Rejected</p>
              <h3 className="text-2xl font-orbitron font-black text-red-400 mt-1.5">
                {metrics.rejectedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
              <X size={20} />
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
                <div id="qr-reader" className={`w-full max-w-[400px] overflow-hidden rounded-lg transition-all duration-300 ${isPaused ? "blur-md opacity-40 scale-95 pointer-events-none" : ""}`}></div>
                
                {isPaused ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-20 p-6 text-center space-y-4 animate-fadeIn">
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-full text-white/50">
                      <ScanLine size={32} />
                    </div>
                    <div>
                      <h4 className="font-orbitron font-bold text-white uppercase tracking-wider text-sm">Scanner Paused</h4>
                      <p className="text-white/40 text-xs mt-1">Review the scan details and click the button to continue scanning</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="px-6 py-2.5 bg-[#EB0028] hover:bg-[#c30020] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-[#EB0028]/20"
                    >
                      Scan Next Ticket
                    </button>
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 py-1.5 px-3 rounded-full text-[10px] tracking-wide text-white/70 uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#EB0028] animate-ping"></span>
                    Scanner Live
                  </div>
                )}
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

                    {/* Scan Next Button in details view */}
                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="w-full py-3 bg-[#EB0028] hover:bg-[#c30020] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-[#EB0028]/10"
                    >
                      <ScanLine size={14} />
                      <span>Scan Next Ticket</span>
                    </button>
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
        ) : viewMode === "usns" ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* USN Bulk Upload Box */}
            <div className="lg:col-span-5 bg-zinc-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6 flex flex-col relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#EB0028]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#EB0028]"></div>
              
              <div className="space-y-1">
                <h3 className="font-orbitron font-bold text-lg text-white uppercase tracking-wide flex items-center gap-2">
                  <Fingerprint className="text-[#EB0028]" size={20} />
                  Authorize USNs
                </h3>
                <p className="text-xs text-white/50 font-clash">
                  Add student University Seat Numbers (USNs) to allow them to purchase tickets at student pricing.
                </p>
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 font-orbitron">
                    Paste USNs in Bulk
                  </label>
                  <textarea
                    rows={8}
                    value={bulkUsnInput}
                    onChange={(e) => setBulkUsnInput(e.target.value)}
                    placeholder="Enter USNs separated by commas, spaces, or newlines&#10;e.g.&#10;1MS21CS001&#10;1MS21CS002, 1MS21CS003"
                    className="w-full flex-1 min-h-[180px] bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#EB0028] transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleBulkUsnUpload}
                  disabled={isUploadingUsn || !bulkUsnInput.trim()}
                  className="w-full bg-[#EB0028] hover:bg-[#c30020] disabled:bg-zinc-800 disabled:text-white/40 text-white font-orbitron font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUploadingUsn ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving USNs...
                    </>
                  ) : (
                    <span>Add to Authorized List</span>
                  )}
                </button>
              </div>
            </div>

            {/* USN List Table */}
            <div className="lg:col-span-7 bg-zinc-950/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col min-h-[400px] relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#EB0028]"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#EB0028]"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="space-y-1">
                  <h3 className="font-orbitron font-bold text-lg text-white uppercase tracking-wide">
                    Authorized List ({usnList.length})
                  </h3>
                  <p className="text-xs text-white/50 font-clash">
                    Search and manage allowed student identifiers.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-white/40">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search USN..."
                    value={usnSearchQuery}
                    onChange={(e) => setUsnSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#EB0028] transition-colors"
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-y-auto max-h-[450px] mt-4 scrollbar-thin scrollbar-thumb-white/10">
                {isUsnLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center text-white/50 gap-2">
                    <Loader2 className="animate-spin text-[#EB0028]" size={28} />
                    <p className="text-xs">Loading authorized list...</p>
                  </div>
                ) : usnList.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-white/45 gap-2">
                    <Fingerprint size={32} className="text-white/20" />
                    <p className="text-xs font-semibold">No USNs authorized yet</p>
                  </div>
                ) : (
                  <table className="w-full text-left font-clash text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-white/40 select-none">
                        <th className="py-2.5 px-4 font-orbitron">USN</th>
                        <th className="py-2.5 px-4 font-orbitron">Date Added</th>
                        <th className="py-2.5 px-4 font-orbitron text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {usnList
                        .filter((u) => u.usn.toLowerCase().includes(usnSearchQuery.toLowerCase()))
                        .map((u) => (
                          <tr key={u.usn} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-4 font-bold text-white tracking-wider">{u.usn}</td>
                            <td className="py-3 px-4 text-white/50 text-[10px]">
                              {new Date(u.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4 text-right font-orbitron">
                              <button
                                onClick={() => handleDeleteUsn(u.usn)}
                                className="text-red-500 hover:text-red-400 font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        ) : viewMode === "email" ? (
          <section className="bg-zinc-950/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-8 relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#EB0028]"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#EB0028]"></div>

            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#EB0028]/10 border border-[#EB0028]/30 text-[#EB0028] text-xs font-mono font-bold uppercase tracking-wider">
                    Approved Ticket Holders Only
                  </span>
                  <span className="text-xs text-white/40 font-mono">
                    {approvedTickets.length} Approved Attendees
                  </span>
                </div>
                <h2 className="text-2xl font-orbitron font-bold text-white mt-2 flex items-center gap-2">
                  <Mail className="text-[#EB0028]" size={24} />
                  <span>Email Broadcast Studio</span>
                </h2>
                <p className="text-xs text-white/50 font-clash mt-1">
                  Compose and dispatch official announcements styled with the website's dark TEDx red/black visual theme.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSendEmailBroadcast(true)}
                  disabled={isSendingEmail}
                  className="px-4 py-2.5 bg-zinc-900 border border-white/15 hover:border-white/40 hover:bg-white/5 rounded-xl text-xs font-semibold uppercase tracking-wider text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Send preview email to your admin address"
                >
                  {isSendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-amber-400" />}
                  <span>Send Test Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSendConfirmModal(true)}
                  disabled={isSendingEmail || (!emailSubject.trim() || !emailMessage.trim())}
                  className="px-5 py-2.5 bg-[#EB0028] hover:bg-[#c30020] rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center gap-2 shadow-lg shadow-[#EB0028]/20 cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>Broadcast Email</span>
                </button>
              </div>
            </div>

            {/* Main Content Grid: Form (Left) vs Live Theme Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Email Configuration Form */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Recipient Selection */}
                <div className="space-y-3 bg-zinc-900/60 border border-white/10 p-5 rounded-xl">
                  <label className="block text-xs font-bold uppercase tracking-wider font-orbitron text-white/70">
                    Target Recipients (Approved Tickets Only)
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRecipientMode("all")}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        recipientMode === "all"
                          ? "bg-[#EB0028]/15 border-[#EB0028] text-white font-bold"
                          : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <div className="font-bold">All Approved ({approvedTickets.length})</div>
                      <div className="text-[10px] text-white/40 mt-0.5">Send to every confirmed registrant</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecipientMode("selected")}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        recipientMode === "selected"
                          ? "bg-[#EB0028]/15 border-[#EB0028] text-white font-bold"
                          : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <div className="font-bold">Selected Rows ({selectedTicketIds.length})</div>
                      <div className="text-[10px] text-white/40 mt-0.5">Checked rows in table</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecipientMode("custom")}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        recipientMode === "custom"
                          ? "bg-[#EB0028]/15 border-[#EB0028] text-white font-bold"
                          : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <div className="font-bold">Custom Emails</div>
                      <div className="text-[10px] text-white/40 mt-0.5">Specify custom email addresses</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecipientMode("test")}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        recipientMode === "test"
                          ? "bg-[#EB0028]/15 border-[#EB0028] text-white font-bold"
                          : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <div className="font-bold">Test Mode</div>
                      <div className="text-[10px] text-white/40 mt-0.5">Single preview test email</div>
                    </button>
                  </div>

                  {/* Conditional Recipient Inputs */}
                  {recipientMode === "custom" && (
                    <div className="mt-3">
                      <label className="block text-[11px] text-white/60 mb-1 font-mono">
                        Enter approved recipient email addresses (comma or newline separated):
                      </label>
                      <textarea
                        rows={3}
                        value={customEmailsInput}
                        onChange={(e) => setCustomEmailsInput(e.target.value)}
                        placeholder="attendee1@example.com, attendee2@example.com..."
                        className="w-full bg-black border border-white/15 rounded-lg p-3 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#EB0028]"
                      />
                    </div>
                  )}

                  {recipientMode === "test" && (
                    <div className="mt-3">
                      <label className="block text-[11px] text-white/60 mb-1 font-mono">
                        Target Test Email Address:
                      </label>
                      <input
                        type="email"
                        value={testEmailInput}
                        onChange={(e) => setTestEmailInput(e.target.value)}
                        placeholder={user?.primaryEmailAddress?.emailAddress || "admin@example.com"}
                        className="w-full bg-black border border-white/15 rounded-lg p-3 text-xs text-white font-mono placeholder-white/20 focus:outline-none focus:border-[#EB0028]"
                      />
                    </div>
                  )}
                </div>

                {/* Email Content Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider font-orbitron text-white/70 mb-1.5">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Important Announcement | TEDxICEAS 🎤"
                      className="w-full bg-zinc-900 border border-white/15 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#EB0028]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider font-orbitron text-white/70 mb-1.5">
                      Banner Header Title
                    </label>
                    <input
                      type="text"
                      value={emailTitle}
                      onChange={(e) => setEmailTitle(e.target.value)}
                      placeholder="Official Event Update"
                      className="w-full bg-zinc-900 border border-white/15 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#EB0028]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider font-orbitron text-white/70">
                        Message Content *
                      </label>
                      <div className="flex gap-1 items-center">
                        <span className="text-[10px] text-white/40 mr-1">Insert placeholder:</span>
                        {["{{name}}", "{{ticket_code}}", "{{category}}"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setEmailMessage((prev) => prev + " " + tag)}
                            className="px-1.5 py-0.5 bg-white/5 hover:bg-white/15 rounded border border-white/10 text-[10px] font-mono text-amber-400 cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={7}
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/15 rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-[#EB0028] font-sans leading-relaxed"
                    />
                    <p className="text-[10px] text-white/40 mt-1">
                      Separate paragraphs with double line breaks. Personalized fields will auto-populate for each attendee.
                    </p>
                  </div>

                  {/* Call to Action Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/40 p-4 rounded-xl border border-white/5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider font-orbitron text-white/60 mb-1">
                        Button Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={emailCtaText}
                        onChange={(e) => setEmailCtaText(e.target.value)}
                        placeholder="View Event Roadmap"
                        className="w-full bg-black border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#EB0028]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider font-orbitron text-white/60 mb-1">
                        Button Target URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={emailCtaUrl}
                        onChange={(e) => setEmailCtaUrl(e.target.value)}
                        placeholder="https://tedxiceas.in/roadmap"
                        className="w-full bg-black border border-white/15 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#EB0028]"
                      />
                    </div>
                  </div>

                  {/* QR Code Embed Toggle */}
                  <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold uppercase tracking-wider font-orbitron text-white/90 flex items-center gap-1.5 cursor-pointer">
                        <QrCode size={16} className="text-[#EB0028]" />
                        <span>Include Attendee QR Code & Entry Badge</span>
                      </label>
                      <p className="text-[11px] text-white/40 font-clash">
                        Embeds recipient's unique entry QR code image & ticket code for venue check-in.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIncludeQRCode((prev) => !prev)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center shrink-0 ${
                        includeQRCode ? "bg-[#EB0028] justify-end" : "bg-zinc-800 justify-start"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md block"></span>
                    </button>
                  </div>

                  {/* File Attachments Upload Box */}
                  <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider font-orbitron text-white/70 flex items-center gap-1.5">
                        <Paperclip size={14} className="text-[#EB0028]" />
                        <span>Email Attachments ({emailAttachments.length})</span>
                      </label>

                      <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-xs font-semibold uppercase tracking-wider text-white transition-all cursor-pointer inline-flex items-center gap-1.5">
                        <Paperclip size={12} />
                        <span>Add Files</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileAttachment}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {emailAttachments.length === 0 ? (
                      <p className="text-[11px] text-white/40 italic">
                        No files attached. You can attach PDFs, images, or documents (max 10MB per file).
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {emailAttachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 bg-black/60 border border-white/10 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <File size={14} className="text-amber-400 shrink-0" />
                              <span className="font-mono text-white truncate">{file.name}</span>
                              <span className="text-[10px] text-white/40 font-mono">
                                ({(file.size / 1024).toFixed(0)} KB)
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-white/5 rounded transition-colors cursor-pointer"
                              title="Remove attachment"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Live Website-Themed Email Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider font-orbitron text-white/70 flex items-center gap-1.5">
                    <Eye size={14} className="text-[#EB0028]" />
                    <span>Live Theme Visual Preview</span>
                  </label>
                  <span className="text-[10px] text-white/40 font-mono">Theme: Dark Obsidian & TED Red</span>
                </div>

                {/* Live Email HTML Container */}
                <div className="bg-[#0a0a0a] border border-white/15 rounded-2xl p-4 md:p-6 shadow-2xl overflow-hidden text-left">
                  
                  <div className="max-w-[500px] mx-auto bg-[#121212] border border-[#262626] rounded-xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="bg-black p-6 text-center border-b-2 border-[#EB0028]">
                      <h1 className="text-2xl font-black tracking-tight text-white m-0">
                        TED<span className="text-[#EB0028]">x</span><span className="font-light text-white">ICEAS</span>
                      </h1>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-1 font-semibold">
                        x = independently organized TED event
                      </p>
                    </div>

                    {/* Banner Title */}
                    {emailTitle && (
                      <div className="bg-[#171717] px-6 py-4 border-b border-[#262626] text-center">
                        <h2 className="text-base font-bold text-white m-0">{emailTitle}</h2>
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="p-6 space-y-4 text-sm text-zinc-300">
                      <p className="font-semibold text-white">Hello Alex (Sample Recipient),</p>
                      
                      {emailMessage.split(/\n\s*\n/).filter(Boolean).map((p, idx) => (
                        <p key={idx} className="leading-relaxed text-zinc-300 whitespace-pre-wrap">
                          {p.replace(/\{\{\s*name\s*\}\}/gi, "Alex")
                            .replace(/\{\{\s*ticket_code\s*\}\}/gi, "TEDX-8821-SAMPLE")
                            .replace(/\{\{\s*category\s*\}\}/gi, "Student")}
                        </p>
                      ))}

                      {/* Sample QR Code Entry Card */}
                      {includeQRCode && (
                        <div className="text-center my-6">
                          <div className="inline-block bg-[#171717] border-2 border-dashed border-[#EB0028] p-5 rounded-xl shadow-lg">
                            <p className="text-[10px] uppercase font-bold text-zinc-400 m-0 mb-2 tracking-widest">
                              Your Ticket Entry QR Code
                            </p>
                            <img
                              src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=TEDX-8821-SAMPLE"
                              alt="Ticket Entry QR Code"
                              className="w-36 h-36 mx-auto border-4 border-white rounded-lg block shadow-md"
                            />
                            <p className="text-[9px] uppercase text-zinc-500 mt-2 mb-0 tracking-wider">
                              Ticket Code
                            </p>
                            <h3 className="text-lg font-mono font-bold text-[#EB0028] m-0 tracking-wider">
                              TEDX-8821-SAMPLE
                            </h3>
                          </div>
                        </div>
                      )}

                      {/* Sample Ticket Badge */}
                      <div className="bg-[#171717] border border-[#262626] border-l-4 border-l-[#EB0028] rounded-lg p-4 my-4">
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <span className="text-zinc-400">Attendee:</span>
                          <span className="text-white font-semibold">Alex</span>
                          <span className="text-zinc-400">Category:</span>
                          <span className="text-white font-semibold">Student</span>
                          <span className="text-zinc-400">Ticket Code:</span>
                          <span className="text-[#EB0028] font-mono font-bold">TEDX-8821-SAMPLE</span>
                        </div>
                      </div>

                      {/* Sample CTA Button */}
                      {emailCtaText && emailCtaUrl && (
                        <div className="text-center my-6">
                          <span className="inline-block bg-[#EB0028] text-white font-bold text-xs uppercase px-6 py-3 rounded-md tracking-wider shadow-lg shadow-[#EB0028]/30">
                            {emailCtaText}
                          </span>
                        </div>
                      )}

                      {/* Sample Attachments Badge */}
                      {emailAttachments.length > 0 && (
                        <div className="mt-4 p-3 bg-[#171717] border border-[#262626] rounded-lg text-xs space-y-1.5">
                          <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                            <Paperclip size={12} className="text-[#EB0028]" />
                            <span>Attachments ({emailAttachments.length} file{emailAttachments.length > 1 ? "s" : ""})</span>
                          </div>
                          <div className="space-y-1 pl-1">
                            {emailAttachments.map((att, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                                <File size={11} className="text-amber-400" />
                                <span className="truncate">{att.name}</span>
                                <span className="text-[10px] text-zinc-500">({(att.size / 1024).toFixed(0)} KB)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-[#262626] text-xs text-zinc-400">
                        Best regards,<br/>
                        <strong className="text-white">The TEDxICEAS Team</strong>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[#09090b] p-4 text-center border-t border-[#1f1f23] text-[10px] text-zinc-500">
                      <p className="m-0">Official announcement from TEDxICEAS</p>
                      <p className="m-0 text-zinc-600 font-mono mt-1">&copy; 2026 TEDxICEAS. All rights reserved.</p>
                    </div>
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
              <div className="flex items-center gap-3">
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

                {/* Email Selected Tickets Quick Action */}
                {selectedTicketIds.length > 0 && (
                  <button
                    onClick={() => {
                      setRecipientMode("selected");
                      setViewMode("email");
                    }}
                    className="inline-flex items-center gap-2 bg-[#EB0028] hover:bg-[#c30020] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    <Mail size={13} />
                    <span>Email ({selectedTicketIds.length}) Selected</span>
                  </button>
                )}
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
                      <th className="py-4 px-4 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAllApproved}
                          title="Select/Deselect all approved tickets"
                          className="text-white/50 hover:text-white transition-colors cursor-pointer"
                        >
                          {selectedTicketIds.length > 0 && selectedTicketIds.length === approvedTickets.length ? (
                            <CheckSquare size={16} className="text-[#EB0028]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Attendee</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Qty</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Ticket Code</th>
                      <th className="py-4 px-6">Claimed</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 text-center">
                          {ticket.status === "approved" ? (
                            <button
                              type="button"
                              onClick={() => toggleSelectTicket(ticket.id)}
                              className="text-white/50 hover:text-white transition-colors cursor-pointer"
                            >
                              {selectedTicketIds.includes(ticket.id) ? (
                                <CheckSquare size={16} className="text-[#EB0028]" />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          ) : (
                            <span className="text-white/10">—</span>
                          )}
                        </td>
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
                          {ticket.usn && (
                            <div className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono font-bold tracking-wider select-all">
                              USN: {ticket.usn}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${ticket.category === "Faculty" || ticket.category === "Attendees"
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
                        <td className="py-4 px-6">
                          {ticket.status === "approved" ? (
                            <div className="flex gap-2">
                              {/* Checked In */}
                              <span
                                title={ticket.checked_in && ticket.checked_in_at ? `Checked In: ${new Date(ticket.checked_in_at).toLocaleTimeString()}` : "Not Checked In"}
                                className={`p-1.5 rounded border transition-colors inline-block ${
                                  ticket.checked_in
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-zinc-900 border-white/5 text-white/20"
                                }`}
                              >
                                <Users size={12} />
                              </span>
                              {/* Food Claimed */}
                              <span
                                title={ticket.food_claimed && ticket.food_claimed_at ? `Food claimed: ${new Date(ticket.food_claimed_at).toLocaleTimeString()}` : "Food not claimed"}
                                className={`p-1.5 rounded border transition-colors inline-block ${
                                  ticket.food_claimed
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-zinc-900 border-white/5 text-white/20"
                                }`}
                              >
                                <Utensils size={12} />
                              </span>
                              {/* Goodies Claimed */}
                              <span
                                title={ticket.goodie_claimed && ticket.goodie_claimed_at ? `Goodie claimed: ${new Date(ticket.goodie_claimed_at).toLocaleTimeString()}` : "Goodies not claimed"}
                                className={`p-1.5 rounded border transition-colors inline-block ${
                                  ticket.goodie_claimed
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : "bg-zinc-900 border-white/5 text-white/20"
                                }`}
                              >
                                <Gift size={12} />
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-white/20">—</span>
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
                    {selectedTicket.usn ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex flex-col gap-0.5">
                        <span className="text-amber-400/80 text-[10px] uppercase font-bold tracking-wider font-orbitron">Verified Student USN</span>
                        <span className="text-base font-mono font-black text-amber-300 select-all tracking-wider">{selectedTicket.usn}</span>
                      </div>
                    ) : (
                      (selectedTicket.category === "Student" || selectedTicket.category === "Impact College Students") && (
                        <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <span className="text-red-400/90 text-xs font-medium block">USN Not Recorded / General Registration</span>
                        </div>
                      )
                    )}
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



      {/* Edit Seat Capacity Modal */}
      <AnimatePresence>
        {showCapacityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
            onClick={() => {
              if (!isSavingCapacity) setShowCapacityModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCapacityModal(false)}
                disabled={isSavingCapacity}
                className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase font-bold tracking-widest text-[#EB0028] font-orbitron">
                  Event Settings
                </span>
                <h3 className="text-xl font-orbitron font-bold text-white mt-1">
                  Edit Amount of Tickets Available
                </h3>
                <p className="text-xs text-white/50 font-clash mt-1">
                  Set the total quantity of tickets/seats available for TEDxICEAS 2026. This value immediately updates public booking rules and seat limits.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 font-orbitron mb-1.5">
                    Total Seat Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCapacityInput}
                    onChange={(e) => setNewCapacityInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 rounded-xl p-4 text-xl font-orbitron font-bold text-amber-400 focus:outline-none focus:border-[#EB0028]"
                  />
                  <p className="text-[11px] text-white/40 font-clash mt-1.5">
                    Currently reserved: <strong className="text-white">{metrics.totalTicketsSold + metrics.pendingCount}</strong> seats.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowCapacityModal(false)}
                  disabled={isSavingCapacity}
                  className="w-full bg-transparent border border-white/20 hover:border-white text-white font-clash py-3 rounded-lg text-xs font-semibold uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCapacity}
                  disabled={isSavingCapacity || !newCapacityInput.trim()}
                  className="w-full bg-[#EB0028] hover:bg-[#c30020] text-white font-clash py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingCapacity ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Capacity</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast Email Confirmation Modal */}
      <AnimatePresence>
        {showSendConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
            onClick={() => {
              if (!isSendingEmail) setShowSendConfirmModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSendConfirmModal(false)}
                disabled={isSendingEmail}
                className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase font-bold tracking-widest text-[#EB0028] font-orbitron">
                  Confirm Broadcast Dispatch
                </span>
                <h3 className="text-xl font-orbitron font-bold text-white mt-1 flex items-center gap-2">
                  <Mail className="text-[#EB0028]" size={20} />
                  <span>Send Email Broadcast?</span>
                </h3>
                <p className="text-xs text-white/50 font-clash mt-1">
                  Please review recipient targeting and email details before triggering the broadcast.
                </p>
              </div>

              <div className="space-y-3 bg-zinc-900/60 border border-white/5 p-4 rounded-xl text-xs font-clash">
                <div className="flex justify-between">
                  <span className="text-white/50">Target Mode:</span>
                  <span className="font-bold text-white uppercase font-mono">{recipientMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Recipients Count:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {recipientMode === "all"
                      ? `${approvedTickets.length} Approved Attendees`
                      : recipientMode === "selected"
                      ? `${selectedTicketIds.length} Selected Attendees`
                      : recipientMode === "custom"
                      ? `${customEmailsInput.split(/[\n,\s]+/).filter(Boolean).length} Custom Addresses`
                      : "1 Test Address"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Subject Line:</span>
                  <span className="font-semibold text-white truncate max-w-[240px]">{emailSubject}</span>
                </div>
                {emailAttachments.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Attachments:</span>
                    <span className="font-bold text-amber-400 font-mono">
                      {emailAttachments.length} file(s) ({emailAttachments.map(a => a.name).join(", ")})
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                <strong>Notice:</strong> Emails will be sent using the official TEDx website dark/red visual template. Make sure your SMTP credentials are active.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowSendConfirmModal(false)}
                  disabled={isSendingEmail}
                  className="w-full bg-transparent border border-white/20 hover:border-white text-white font-clash py-3 rounded-lg text-xs font-semibold uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendEmailBroadcast(false)}
                  disabled={isSendingEmail}
                  className="w-full bg-[#EB0028] hover:bg-[#c30020] text-white font-clash py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Confirm & Send</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Delivery Result Modal */}
      <AnimatePresence>
        {emailSendResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
            onClick={() => setEmailSendResult(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 my-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEmailSendResult(null)}
                className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-2">
                {emailSendResult.success ? (
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                    <Check size={24} />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 mx-auto">
                    <AlertCircle size={24} />
                  </div>
                )}
                
                <h3 className="text-xl font-orbitron font-bold text-white">
                  {emailSendResult.success ? "Broadcast Complete" : "Broadcast Failed"}
                </h3>
                <p className="text-xs text-white/60 font-clash leading-relaxed">
                  {emailSendResult.message}
                </p>
              </div>

              {emailSendResult.errors && emailSendResult.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-left max-h-40 overflow-y-auto text-[11px] font-mono space-y-1">
                  <div className="font-bold text-red-400">Failed Deliveries:</div>
                  {emailSendResult.errors.map((err, i) => (
                    <div key={i} className="text-red-300">
                      {err.email}: {err.error}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setEmailSendResult(null)}
                className="w-full bg-[#EB0028] hover:bg-[#c30020] text-white font-clash py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Summary
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
