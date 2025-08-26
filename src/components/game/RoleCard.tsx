import { Player, Role, ROLE_DESCRIPTIONS, WIN_CONDITIONS } from "@/types/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Sword, Users, UserX, Clock } from "lucide-react";

interface RoleCardProps {
  role: Role;
  players: Player[];
  timeRemaining?: number;
}

const roleIcons = {
  Spy: UserX,
  Guest: Users,
  Assassin: Sword,
  Watcher: Eye,
};

const roleColors = {
  Spy: "destructive",
  Guest: "default",
  Assassin: "outline",
  Watcher: "secondary",
} as const;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const RoleCard = ({ role, players, timeRemaining = 0 }: RoleCardProps) => {
  const Icon = roleIcons[role];

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
          <div className="flex items-center justify-center space-x-2 mt-3">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm">
              Game starts in {formatTime(timeRemaining)}
            </span>
          </div>
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

        {role === "Spy" && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              🤝 Work with other spies to reveal the target
            </p>
            <p className="text-sm text-destructive font-medium">
              {players.filter((p) => p.role === "Spy").length} spies (
              {players
                .filter((p) => p.role === "Spy")
                .map((p) => p.fakeName)
                .join(", ")}
              )
            </p>
          </div>
        )}

        {role === "Guest" && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary font-medium">
              🛡️ Trust carefully - anyone could be a threat
            </p>
          </div>
        )}

        {role === "Assassin" && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-accent font-medium">
              🎯 You have one target - choose your moment wisely
            </p>
          </div>
        )}

        {role === "Watcher" && (
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
