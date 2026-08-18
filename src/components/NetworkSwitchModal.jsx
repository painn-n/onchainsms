import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

export function NetworkSwitchModal({
  isOpen,
  onSwitchNetwork,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-popover border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-heading text-foreground">
            <AlertTriangle className="w-5 h-5 text-[#00B88A]" />
            Wrong network
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Use Robinhood Chain or Base. Switch to Robinhood Chain to continue.
          </p>

          <div className="p-4 rounded-md bg-muted border border-border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required</span>
                <span className="text-foreground font-mono">Robinhood Chain</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-foreground font-mono">Mainnet</span>
              </div>
            </div>
          </div>

          <Button onClick={onSwitchNetwork} className="w-full">
            Switch to Robinhood Chain
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
