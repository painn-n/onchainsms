import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export function Toast({ toasts, onDismiss }) {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        onDismiss(toast.id);
      }, 5000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, onDismiss]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-primary';
      case 'error':
        return 'border-l-destructive';
      case 'warning':
        return 'border-l-amber-500';
      default:
        return 'border-l-border';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md bg-popover border border-border border-l-2 shadow-sm pointer-events-auto toast-enter ${getBorderColor(
            toast.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-foreground font-heading text-sm font-medium">{toast.title}</h4>
              {toast.message && (
                <p className="text-sm text-muted-foreground mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
