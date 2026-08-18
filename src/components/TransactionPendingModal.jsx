import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Progress } from './ui/progress';

export function TransactionPendingModal({
  isOpen,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-popover border-border text-foreground">
        <div className="space-y-5 py-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <h3 className="text-xl font-heading text-foreground">Transaction pending</h3>
            <p className="text-sm text-muted-foreground text-center">
              Confirm in your wallet.
            </p>
          </div>

          <Progress value={undefined} className="w-full" />

          <p className="text-sm text-muted-foreground text-center">
            Wait for the wallet prompt and block confirmation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
