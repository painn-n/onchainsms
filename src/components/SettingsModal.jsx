import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export function SettingsModal({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  notifications,
  onToggleNotifications,
  networkName,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-popover border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-foreground">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between p-4 rounded-md bg-card border border-border">
            <div className="space-y-1">
              <Label htmlFor="dark-mode" className="text-foreground cursor-pointer">
                Dark mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Charcoal surface instead of stone
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={onToggleDarkMode}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-md bg-card border border-border">
            <div className="space-y-1">
              <Label htmlFor="notifications" className="text-foreground cursor-pointer">
                Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Toasts for send, sync, and errors
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={onToggleNotifications}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="p-4 rounded-md bg-card border border-border">
            <h3 className="font-heading text-foreground mb-1">About</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Wallet notes on Robinhood Chain and Base.
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network</span>
                <span className="text-foreground font-mono">{networkName}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-muted border border-border flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-[#00B88A] shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              Messages stay on chain. You cannot delete or edit them.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
