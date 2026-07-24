"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

const TYPE_CONFIG = {
  success: {
    bg: "var(--acid)",
    textColor: "var(--ink)",
    icon: CheckCircle2,
    shadow: "var(--acid)",
  },
  error: {
    bg: "var(--hotpink)",
    textColor: "#fff",
    icon: XCircle,
    shadow: "var(--hotpink)",
  },
  warning: {
    bg: "var(--sunset)",
    textColor: "#fff",
    icon: AlertTriangle,
    shadow: "var(--sunset)",
  },
  info: {
    bg: "var(--electric)",
    textColor: "#fff",
    icon: Info,
    shadow: "var(--electric)",
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed top-4 right-4 left-4 z-[200] flex flex-col items-end gap-3 sm:left-auto sm:w-96">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, x: 60, scale: 0.9, rotate: 2 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto relative w-full overflow-hidden"
            >
              <div
                className="flex items-start gap-3 rounded-2xl border-[3px] border-[var(--ink)] p-4 pr-12 shadow-[5px_5px_0_0_var(--ink)]"
                style={{ background: config.bg, color: config.textColor }}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-[2px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)]"
                >
                  <Icon size={18} strokeWidth={3} className="text-[var(--ink)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-black uppercase tracking-wide leading-tight">
                    {toast.title || (toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Oops!' : toast.type === 'warning' ? 'Heads Up' : 'Note')}
                  </div>
                  <div className="mt-1 text-sm font-bold leading-relaxed opacity-95">
                    {toast.message}
                  </div>
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl border-[2px] border-[var(--ink)] bg-white shadow-[2px_2px_0_0_var(--ink)] transition-all hover:bg-[var(--ink)] hover:text-white active:scale-90"
                title="Dismiss"
                style={{ minWidth: "32px", minHeight: "32px" }}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
