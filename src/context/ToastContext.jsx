import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const styles = {
  success: { icon: CheckCircle2, classes: 'border-green-500/30 text-green-600 dark:text-green-400' },
  error: { icon: XCircle, classes: 'border-red-500/30 text-red-600 dark:text-red-400' },
  info: { icon: Info, classes: 'border-hive-yellow/40 text-hive-yellow' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast stack - fixed above mobile bottom nav, top-right on desktop */}
      <div className="fixed z-[100] bottom-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-6 md:left-auto md:right-6 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm px-4 md:px-0">
        {toasts.map((t) => {
          const meta = styles[t.type] || styles.info;
          const Icon = meta.icon;
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 bg-white dark:bg-hive-panel border ${meta.classes} rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-[fadeIn_0.15s_ease-out]`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1 text-gray-800 dark:text-gray-100">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
