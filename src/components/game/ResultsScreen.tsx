import { useEffect, useState } from "react";
import { DEFAULT_GAME_CONFIG, GameState, Player } from "@/types/game";
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
import ActionSummary from "./ActionSummary";

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
  const [timeRemaining, setTimeRemaining] = useState(
    DEFAULT_GAME_CONFIG.resultsDuration
  );

  // Helper function to determine if a player is a winner
  const isPlayerWinner = (
    player: Player,
    winner: string | undefined
  ): boolean => {
    if (!winner) return false;

    switch (winner) {
      case "Spy":
        return player.role === "Spy";
      case "Assassin":
        return player.role === "Assassin";
      case "Guests":
        return player.role === "Guest" || player.role === "Watcher";
      default:
        return false;
    }
  };

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

  const revealedPlayer = gameState.players.find(
    (p) => p.id === gameState.revealedPlayer
  );
  const activePlayers = gameState.players.filter((p) => !p.isRevealed);
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
    // Determine if current player is a winner
    const isWinner = isPlayerWinner(currentPlayer, gameState.winner);

    return (
      <div className="min-h-screen bg-gradient-deep p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="mysterious-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">
                {isWinner ? "Victory!" : "Defeat"}
              </CardTitle>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {isWinner ? (
                  <>
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <span className="text-2xl font-bold text-green-600">
                      {gameState.winner} Win!
                    </span>
                  </>
                ) : (
                  <>
                    <Skull className="w-8 h-8 text-red-500" />
                    <span className="text-2xl font-bold text-red-600">
                      {gameState.winner} Win!
                    </span>
                  </>
                )}
              </div>
              {isWinner && (
                <p className="text-green-600 font-semibold">
                  Congratulations! You have achieved your objective.
                </p>
              )}
              {!isWinner && (
                <p className="text-red-600 font-semibold">
                  Better luck next time. The shadows have claimed you.
                </p>
              )}
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
                    {revealedPlayer ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {revealedPlayer.fakeName} ({revealedPlayer.name})
                          </span>
                          <Badge variant="destructive">
                            {revealedPlayer.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Received {voteCounts[revealedPlayer.id] || 0} votes
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No player was revealed
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
                      {activePlayers.map((player) => (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-2 rounded ${
                            player.id === currentPlayer.id
                              ? isWinner
                                ? "bg-green-100 border border-green-300"
                                : "bg-red-100 border border-red-300"
                              : ""
                          }`}
                        >
                          <span
                            className={
                              player.id === currentPlayer.id ? "font-bold" : ""
                            }
                          >
                            {player.fakeName}{" "}
                            {player.id === currentPlayer.id && "(You)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Summary */}
              {gameState.actionResults &&
                gameState.actionResults.length > 0 && (
                  <ActionSummary actionResults={gameState.actionResults} />
                )}

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
            {/* Revealed Player Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserX className="w-5 h-5" />
                  <span>Revealed Player</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revealedPlayer ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                      <div>
                        <h3 className="text-xl font-bold">
                          {revealedPlayer.fakeName} ({revealedPlayer.name})
                        </h3>
                        <p className="text-muted-foreground">
                          has been revealed
                        </p>
                      </div>
                      <Badge
                        variant="destructive"
                        className="text-lg px-3 py-1"
                      >
                        {revealedPlayer.role}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Votes received:</span>
                        <span className="ml-2">
                          {voteCounts[revealedPlayer.id] || 0}
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
                    No player was revealed
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
                          {player?.fakeName || "Unknown"}{" "}
                          {playerId === currentPlayer.id && "(You)"}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {votes} vote{votes !== 1 ? "s" : ""}
                          </span>
                          {playerId === gameState.revealedPlayer && (
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
                  <span>Active Players ({activePlayers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {activePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-2 bg-muted/20 rounded"
                    >
                      <span
                        className={
                          player.id === currentPlayer.id ? "font-bold" : ""
                        }
                      >
                        {player.fakeName}{" "}
                        {player.id === currentPlayer.id && "(You)"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Summary */}
            {gameState.actionResults && gameState.actionResults.length > 0 && (
              <ActionSummary actionResults={gameState.actionResults} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsScreen;
