import { useEffect, useState } from "react";
import { GameState, Player } from "@/types/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, Crown, Skull, Clock, Users } from "lucide-react";

interface ResultsScreenProps {
  gameState: GameState;
  currentPlayer: Player;
  onContinueToNextRound?: () => void;
  onReturnToLobby?: () => void;
}

const ResultsScreen = ({
  gameState,
  currentPlayer,
  onContinueToNextRound,
  onReturnToLobby,
}: ResultsScreenProps) => {
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    if (gameState.phase === "results") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (gameState.phase === "game-over") {
              onReturnToLobby?.();
            } else {
              onContinueToNextRound?.();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.phase, onContinueToNextRound, onReturnToLobby]);

  const eliminatedPlayer = gameState.players.find(
    (p) => p.id === gameState.eliminatedPlayer
  );
  const alivePlayers = gameState.players.filter((p) => p.isAlive);
  const voteCounts = Object.values(gameState.votes).reduce((acc, targetId) => {
    acc[targetId] = (acc[targetId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (gameState.phase === "game-over") {
    return (
      <div className="min-h-screen bg-gradient-deep p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="mysterious-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Game Over</CardTitle>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Crown className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {gameState.winner} Win!
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Final Results */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserX className="w-5 h-5" />
                      <span>Revealed Player</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {eliminatedPlayer ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {eliminatedPlayer.fakeName} ({eliminatedPlayer.name}
                            )
                          </span>
                          <Badge variant="destructive">
                            {eliminatedPlayer.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Received {voteCounts[eliminatedPlayer.id] || 0} votes
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No player was reveaked
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Survivors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {alivePlayers.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between"
                        >
                          <span
                            className={
                              player.id === currentPlayer.id ? "font-bold" : ""
                            }
                          >
                            {player.fakeName}
                          </span>
                          <Badge variant="secondary">{player.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button onClick={onReturnToLobby} size="lg">
                  Return to Lobby
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-deep p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="mysterious-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Voting Results</CardTitle>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="text-lg">
                Next round in {formatTime(timeRemaining)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Elimination Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserX className="w-5 h-5" />
                  <span>Eliminated Player</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eliminatedPlayer ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                      <div>
                        <h3 className="text-xl font-bold">
                          {eliminatedPlayer.name}
                        </h3>
                        <p className="text-muted-foreground">
                          has been eliminated
                        </p>
                      </div>
                      <Badge
                        variant="destructive"
                        className="text-lg px-3 py-1"
                      >
                        {eliminatedPlayer.role}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Votes received:</span>
                        <span className="ml-2">
                          {voteCounts[eliminatedPlayer.id] || 0}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Total votes:</span>
                        <span className="ml-2">
                          {Object.keys(gameState.votes).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No player was eliminated
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Vote Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Vote Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(voteCounts).map(([playerId, votes]) => {
                    const player = gameState.players.find(
                      (p) => p.id === playerId
                    );
                    return (
                      <div
                        key={playerId}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded"
                      >
                        <span
                          className={
                            playerId === currentPlayer.id ? "font-bold" : ""
                          }
                        >
                          {player?.name || "Unknown"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {votes} vote{votes !== 1 ? "s" : ""}
                          </span>
                          {playerId === gameState.eliminatedPlayer && (
                            <Skull className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Survivors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Survivors ({alivePlayers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {alivePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 bg-muted/20 rounded"
                    >
                      <span
                        className={
                          player.id === currentPlayer.id ? "font-bold" : ""
                        }
                      >
                        {player.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {player.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsScreen;
