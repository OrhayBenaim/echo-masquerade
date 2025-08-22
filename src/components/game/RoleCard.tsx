import { Role, ROLE_DESCRIPTIONS, WIN_CONDITIONS } from '@/types/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Sword, Users, UserX } from 'lucide-react';

interface RoleCardProps {
  role: Role;
  isRevealed: boolean;
}

const roleIcons = {
  Spy: UserX,
  Guest: Users,
  Assassin: Sword,
  Watcher: Eye
};

const roleColors = {
  Spy: "destructive",
  Guest: "default", 
  Assassin: "outline",
  Watcher: "secondary"
} as const;

const RoleCard = ({ role, isRevealed }: RoleCardProps) => {
  const Icon = roleIcons[role];
  
  if (!isRevealed) {
    return (
      <Card className="max-w-md mx-auto mysterious-shadow animate-masquerade-pulse">
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-masquerade flex items-center justify-center mx-auto">
              <span className="text-2xl">🎭</span>
            </div>
            <p className="text-muted-foreground">Revealing your role...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto mysterious-shadow">
      <CardHeader className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-masquerade flex items-center justify-center mx-auto">
          <Icon className="w-10 h-10 text-primary-foreground" />
        </div>
        <div>
          <CardTitle className="text-2xl">{role}</CardTitle>
          <Badge variant={roleColors[role]} className="mt-2">
            Your Secret Role
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2 text-primary">Your Mission:</h4>
          <CardDescription className="text-sm">
            {ROLE_DESCRIPTIONS[role]}
          </CardDescription>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2 text-secondary">Win Condition:</h4>
          <CardDescription className="text-sm">
            {WIN_CONDITIONS[role]}
          </CardDescription>
        </div>

        {role === 'Spy' && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              🤝 Work with other spies to eliminate guests
            </p>
          </div>
        )}

        {role === 'Guest' && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary font-medium">
              🛡️ Trust carefully - anyone could be a threat
            </p>
          </div>
        )}

        {role === 'Assassin' && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-accent font-medium">
              🎯 You have one target - choose your moment wisely
            </p>
          </div>
        )}

        {role === 'Watcher' && (
          <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <p className="text-sm text-secondary font-medium">
              👁️ Observe everyone - you're the guests' best hope
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleCard;