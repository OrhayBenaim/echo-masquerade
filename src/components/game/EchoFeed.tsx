import { Echo } from '@/types/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scroll, Eye, Clock, AlertTriangle } from 'lucide-react';

interface EchoFeedProps {
  echoes: Echo[];
}

const echoTypeIcons = {
  RoleHint: Eye,
  EventTease: Clock,
  AlibiFrame: AlertTriangle
};

const echoTypeColors = {
  RoleHint: "default",
  EventTease: "secondary", 
  AlibiFrame: "destructive"
} as const;

const EchoFeed = ({ echoes }: EchoFeedProps) => {
  if (echoes.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-muted-foreground">
            <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No echoes have arrived yet...</p>
            <p className="text-sm mt-2">Whispers and secrets will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="mysterious-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scroll className="w-5 h-5" />
            <span>Echoes of Truth & Deception</span>
          </CardTitle>
          <CardDescription>
            Some whispers carry truth, others lead astray...
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {echoes.map((echo) => {
          const Icon = echoTypeIcons[echo.type];
          return (
            <Card 
              key={echo.id} 
              className="mysterious-shadow animate-mysterious-float hover:scale-105 elegant-transition cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-masquerade flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={echoTypeColors[echo.type]} className="text-xs">
                        {echo.type.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Round {echo.round}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed italic">
                      "{echo.content}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Remember:</strong> Not all echoes speak truth. 
            Some are mere shadows designed to mislead...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EchoFeed;