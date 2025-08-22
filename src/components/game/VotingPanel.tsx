import { useState } from 'react';
import { Player } from '@/types/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, UserX, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VotingPanelProps {
  players: Player[];
  currentPlayer: Player;
  votes: Record<string, string>;
  onCastVote: (targetId: string) => void;
}

const VotingPanel = ({ players, currentPlayer, votes, onCastVote }: VotingPanelProps) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  const eligibleTargets = players.filter(p => p.id !== currentPlayer.id && p.isAlive);
  const voteCounts = Object.values(votes).reduce((acc, targetId) => {
    acc[targetId] = (acc[targetId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalVotes = Object.keys(votes).length;
  const totalPlayers = players.filter(p => p.isAlive).length;

  const handleVote = () => {
    if (!selectedTarget) {
      toast({
        title: "No Target Selected",
        description: "Please select someone to vote for elimination.",
        variant: "destructive"
      });
      return;
    }

    onCastVote(selectedTarget);
    setHasVoted(true);
    
    toast({
      title: "Vote Cast",
      description: "Your vote has been recorded. May fate guide your choice...",
    });
  };

  const myVote = votes[currentPlayer.id];

  return (
    <div className="space-y-4">
      <Card className="mysterious-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Vote className="w-5 h-5 text-destructive" />
              <span>Elimination Vote</span>
            </div>
            <Badge variant="outline">
              {totalVotes}/{totalPlayers} voted
            </Badge>
          </CardTitle>
          <CardDescription>
            Choose wisely - someone will be eliminated from the masquerade
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myVote ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-lg font-medium mb-2">Vote Cast</p>
              <p className="text-muted-foreground">
                You voted to eliminate <strong>{players.find(p => p.id === myVote)?.name}</strong>
              </p>
              <Badge variant="destructive" className="mt-3">
                Waiting for other players...
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3">
                {eligibleTargets.map((player) => {
                  const voteCount = voteCounts[player.id] || 0;
                  const isSelected = selectedTarget === player.id;
                  
                  return (
                    <div
                      key={player.id}
                      onClick={() => !hasVoted && setSelectedTarget(player.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer elegant-transition ${
                        isSelected
                          ? 'border-destructive bg-destructive/10'
                          : 'border-border hover:border-destructive/50 hover:bg-destructive/5'
                      } ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            isSelected ? 'border-destructive bg-destructive' : 'border-muted-foreground'
                          }`} />
                          <span className="font-medium">{player.name}</span>
                        </div>
                        {voteCount > 0 && (
                          <Badge variant="destructive">
                            {voteCount} vote{voteCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleVote}
                disabled={!selectedTarget || hasVoted}
                className="w-full"
              >
                <UserX className="w-5 h-5" />
                Cast Elimination Vote
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {totalVotes < totalPlayers && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm">
                Waiting for {totalPlayers - totalVotes} more player{totalPlayers - totalVotes !== 1 ? 's' : ''} to vote...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vote Summary */}
      <Card className="mysterious-shadow">
        <CardHeader>
          <CardTitle className="text-sm">Vote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(voteCounts).length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No votes cast yet
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(voteCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([playerId, count]) => {
                  const player = players.find(p => p.id === playerId);
                  return (
                    <div key={playerId} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="text-sm">{player?.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {count} vote{count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingPanel;