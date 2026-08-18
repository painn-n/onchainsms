import { useState } from 'react';
import { Search, RefreshCw, Copy, Check, SendHorizonal, ExternalLink, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function SentTab({
  messages,
  onRefresh,
  isRefreshing,
  explorerUrl,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const viewOnExplorer = (txHash) => {
    window.open(`${explorerUrl}/tx/${txHash}`, '_blank', 'noopener,noreferrer');
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px] px-4">
        <div className="text-center space-y-4 p-8 max-w-md w-full border border-border rounded-lg bg-card">
          <SendHorizonal className="w-10 h-10 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <h3 className="text-xl font-heading text-foreground">No sent messages</h3>
          <p className="text-sm text-muted-foreground">
            Messages you send appear here.
          </p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search recipient or message"
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
              <div key={index} className="p-5 bg-card hover:bg-muted/40 transition-colors duration-200">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-muted-foreground">To</span>
                    <button
                      onClick={() => handleCopy(msg.recipient, `copy-${index}`)}
                      className="font-mono text-sm text-foreground hover:text-[#00B88A] transition-colors flex items-center gap-2 group cursor-pointer"
                    >
                      <span>{truncateAddress(msg.recipient)}</span>
                      {copiedId === `copy-${index}` ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 font-mono">
                    {getRelativeTime(msg.timestamp)}
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="text-foreground text-sm whitespace-pre-wrap break-words">
                    {isExpanded ? msg.message : messagePreview}
                  </p>
                  {needsExpand && (
                    <button
                      onClick={() => toggleExpand(`msg-${index}`)}
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

                  {msg.txHash && explorerUrl && (
                    <div className="flex items-center justify-between pt-3 border-t border-border gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Tx</span>
                        <button
                          onClick={() => handleCopy(msg.txHash, `tx-${index}`)}
                          className="font-mono text-sm text-muted-foreground hover:text-[#00B88A] transition-colors flex items-center gap-2 group cursor-pointer"
                        >
                          <span>{truncateAddress(msg.txHash)}</span>
                          {copiedId === `tx-${index}` ? (
                            <Check className="w-3 h-3 text-primary" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </div>
                      <Button
                        onClick={() => viewOnExplorer(msg.txHash)}
                        variant="ghost"
                        size="sm"
                        className="text-[#00B88A] hover:text-foreground h-8"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Explorer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 border border-border rounded-lg bg-card">
            <p className="text-muted-foreground text-sm">No messages match your search.</p>
          </div>
        )}

        <div className="p-3 rounded-md bg-muted border border-border flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#00B88A] shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Stored messages cannot be edited or deleted.
          </p>
        </div>
      </div>
    </div>
  );
}
