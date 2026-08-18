import { Send, Inbox, SendHorizonal } from 'lucide-react';
import { Badge } from './ui/badge';

export function TabNavigation({
  activeTab,
  onTabChange,
  unreadCount,
  sentCount,
  isMobile,
}) {
  const tabs = [
    {
      id: 'send',
      label: 'Send Message',
      icon: Send,
      badge: null,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'sent',
      label: 'Sent',
      icon: SendHorizonal,
      badge: sentCount > 0 ? sentCount : null,
    },
  ];

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-md relative cursor-pointer transition-colors duration-200 ease-out ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  {tab.badge !== null && (
                    <Badge className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center px-1 bg-primary text-primary-foreground text-xs border-none rounded-md">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-heading">{tab.label.split(' ')[0]}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary transition-colors duration-200 ease-out" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 relative cursor-pointer font-heading text-sm transition-colors duration-200 ease-out ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <Badge className="ml-1 h-5 min-w-5 flex items-center justify-center px-1.5 bg-primary text-primary-foreground text-xs border-none rounded-md">
                    {tab.badge}
                  </Badge>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-colors duration-200 ease-out" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
