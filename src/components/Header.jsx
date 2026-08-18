import { useState } from 'react';
import { Moon, Sun, Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function Header({
  walletAddress,
  isConnected,
  walletConnectors,
  onConnect,
  onDisconnect,
  networkName,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/onchain-sms-logo.svg" alt="" className="w-8 h-8" />
          <h1 className="text-xl font-heading font-semibold tracking-tight text-foreground">
            Onchain <span className="text-[#00B88A]">SMS</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background">
              <div className="w-1.5 h-1.5 rounded-md bg-primary" />
              <span className="text-sm font-mono text-muted-foreground">
                {networkName}
              </span>
            </div>
          )}

          <Button
            onClick={onToggleDarkMode}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Button
            onClick={onOpenSettings}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {!isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Connect wallet</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                {walletConnectors.map((connector) => (
                  <DropdownMenuItem
                    key={connector.uid}
                    onClick={() => onConnect(connector)}
                    className="text-foreground hover:bg-muted cursor-pointer"
                  >
                    {connector.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="font-mono"
                >
                  {truncateAddress(walletAddress)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    setShowDropdown(false);
                  }}
                  className="text-foreground hover:bg-muted cursor-pointer"
                >
                  Copy address
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onDisconnect();
                    setShowDropdown(false);
                  }}
                  className="text-foreground hover:bg-muted cursor-pointer"
                >
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
