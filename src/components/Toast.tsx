import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertIcon, CheckIcon } from "./icons";

// Une seule notification à la fois, 4 s, pilule nuit-raised en bas d’écran (Composants.dc.html).
type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, tone }));
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer.current);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="toast pointer-events-none fixed left-1/2 z-[60] w-max max-w-[calc(100vw-32px)]"
        data-visible={visible || undefined}
      >
        {toast && (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-pill border bg-nuit-raised px-[18px] py-3.5 font-semibold text-ink ${
              toast.tone === "error" ? "border-ember" : "border-line"
            }`}
          >
            {toast.tone === "error" ? <AlertIcon className="text-ember" /> : <CheckIcon className="text-lotus" />}
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
