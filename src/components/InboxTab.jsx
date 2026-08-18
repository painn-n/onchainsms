import { useState } from 'react';
import { Search, RefreshCw, Copy, Check, Inbox as InboxIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function InboxTab({
  messages,
  onRefresh,
  onMarkAsRead,
  isRefreshing,
  lookupAddress,
  onLookupAddressChange,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleCopy = (address, id) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(Number(timestamp) * 1000);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-5">
        <div className="p-4 rounded-lg bg-card border border-border space-y-2">
          <label htmlFor="wallet-lookup" className="text-sm text-foreground">Look up address</label>
          <div className="flex gap-3">
            <Input
              id="wallet-lookup"
              value={lookupAddress}
              onChange={(event) => onLookupAddressChange(event.target.value)}
              placeholder="0x..."
              className="font-mono bg-background border-border"
            />
            <Button onClick={onRefresh} disabled={isRefreshing}>
              Look up
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Notes for any address are public.</p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sender or message"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="icon"
            aria-label="Refresh messages"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-0 rounded-lg border border-border bg-card overflow-hidden divide-y divide-border">
          {filteredMessages.map((msg, index) => {
            const isExpanded = expandedId === `msg-${index}`;
            const messagePreview = msg.message.length > 150 ? msg.message.substring(0, 150) + '...' : msg.message;
            const needsExpand = msg.message.length > 150;

            return (
              <div
                key={index}
                className={`p-5 bg-card hover:bg-muted/40 transition-colors duration-200 ${
                  !msg.isRead ? 'border-l-2 border-l-primary' : ''
                }`}
                onClick={() => {
                  if (!msg.isRead) {
                    onMarkAsRead(index);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(msg.sender, `copy-${index}`);
                      }}
                      className="font-mono text-sm text-foreground hover:text-[#00B88A] transition-colors flex items-center gap-2 group cursor-pointer"
                    >
                      <span>{truncateAddress(msg.sender)}</span>
                      {copiedId === `copy-${index}` ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                    {!msg.isRead && (
                      <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-md shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 font-mono">
                    {getRelativeTime(msg.timestamp)}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-foreground text-sm whitespace-pre-wrap break-words">
                    {isExpanded ? msg.message : messagePreview}
                  </p>
                  {needsExpand && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(`msg-${index}`);
                      }}
                      className="flex items-center gap-1 text-sm text-[#00B88A] hover:text-foreground transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-16 space-y-3 border border-border rounded-lg bg-card">
            <InboxIcon className="w-10 h-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm">
              {messages.length === 0 ? 'No messages for this address.' : 'No messages match your search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
