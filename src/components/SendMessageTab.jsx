import { Send, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { isAddress } from 'viem';

export function SendMessageTab({
  isConnected,
  walletAddress,
  networkName,
  onConnect,
  onSendMessage,
  recipient,
  setRecipient,
  message,
  setMessage,
  isSending,
}) {
  const isValidAddress = (address) => isAddress(address);

  const handleSend = async () => {
    if (!isValidAddress(recipient) || !message.trim()) return;
    await onSendMessage(recipient, message);
  };

  const handleClear = () => {
    setRecipient('');
    setMessage('');
  };

  const recipientAddressValidationIcon = recipient ? (
    isValidAddress(recipient) ? (
      <CheckCircle2 className="w-5 h-5 text-primary" />
    ) : (
      <XCircle className="w-5 h-5 text-destructive" />
    )
  ) : null;

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[500px] px-4">
        <div className="text-center space-y-4 p-8 rounded-lg bg-card border border-border max-w-md w-full">
          <Send className="w-8 h-8 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <h3 className="text-xl font-heading text-foreground">Connect wallet</h3>
          <p className="text-muted-foreground text-sm">
            MetaMask, Rabby, Robinhood Wallet, or any EVM wallet.
          </p>
          <Button onClick={onConnect} className="w-full sm:w-auto">
            Connect wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="space-y-6">
        <div className="p-6 sm:p-8 rounded-lg bg-card border border-border space-y-6">
          <div>
            <h2 className="text-2xl font-heading text-foreground mb-1">Send message</h2>
            <p className="text-muted-foreground text-sm">
              Public note to any 0x address on {networkName || 'Robinhood Chain or Base'}.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Your address</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={walletAddress || ""}
                  readOnly
                  className="bg-muted border-border text-foreground font-mono cursor-default"
                  aria-label="Sender wallet address"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-foreground">
                Recipient
              </Label>
              <div className="relative">
                <Input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground pr-12 font-mono focus-visible:ring-ring"
                  aria-label="Recipient wallet address"
                />
                {recipientAddressValidationIcon && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {recipientAddressValidationIcon}
                  </div>
                )}
              </div>
              {recipient && !isValidAddress(recipient) && (
                <p className="text-sm text-destructive" role="alert">Invalid address</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-foreground">
                  Message
                </Label>
                <span className="text-sm text-muted-foreground font-mono">
                  {message.length}/500
                </span>
              </div>
              <Textarea
                id="message"
                placeholder="Message text"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setMessage(e.target.value);
                  }
                }}
                rows={6}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none focus-visible:ring-ring"
                aria-label="Message content"
              />
            </div>

            <div className="rounded-md border border-border bg-muted p-3">
              <p className="text-sm text-foreground">
                Fee: <span className="font-mono">0.00025 ETH</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Fee and message go in one transaction.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleSend}
                disabled={!isValidAddress(recipient) || !message.trim() || isSending}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send message
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                disabled={isSending}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {message && (
          <div className="p-5 rounded-lg bg-card border border-border space-y-3">
            <h3 className="text-base font-heading text-foreground">Preview</h3>
            <div className="p-4 rounded-md bg-muted border border-border">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">From</span>
                <span className="font-mono text-foreground">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-foreground">
                  {recipient || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground">
                  {new Date().toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-foreground whitespace-pre-wrap break-words">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
