import { useState, useEffect } from "react";
import { GameState, Player, Echo, PrivateMessage } from "@/types/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MessageCircle, Users, Vote, Scroll } from "lucide-react";
import EchoFeed from "./EchoFeed";
import PrivateChat from "./PrivateChat";
import VotingPanel from "./VotingPanel";
import ActionPanel from "./ActionPanel";
import ActionSummary from "./ActionSummary";

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player;
  echoes: Echo[];
  privateMessages: PrivateMessage[];
  sentMessagesThisRound: number;
  onSendPrivateMessage: (message: PrivateMessage) => void;
  onCastVote: (targetId: string) => void;
  onSubmitAction?: (
    type: "watch" | "assassinate" | "extract",
    targetId?: string
  ) => void;
  onSkipRound?: () => void;
}

const GameBoard = ({
  gameState,
  currentPlayer,
  echoes,
  privateMessages,
  sentMessagesThisRound,
  onSendPrivateMessage,
  onCastVote,
  onSubmitAction,
  onSkipRound,
}: GameBoardProps) => {
  const [activeTab, setActiveTab] = useState("echoes");

  // Auto-navigate to the appropriate tab when game phase changes
  useEffect(() => {
    // Map game phases to corresponding tabs
    const phaseToTabMap = {
      lobby: "echoes",
      "role-assignment": "echoes",
      round: "echoes",
      voting: "voting",
      action: "action",
      results: "echoes",
      "game-over": "echoes",
    };

    // Set active tab based on current phase
    if (phaseToTabMap[gameState.phase]) {
      setActiveTab(phaseToTabMap[gameState.phase]);
    }
  }, [gameState.phase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const activePlayers = gameState.players.filter((p) => !p.isRevealed);

  return (
    <div className="min-h-screen bg-gradient-deep p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Header */}
        <Card className="mysterious-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-lg">
                  Day {gameState.round}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">
                    {formatTime(gameState.timeRemaining)}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  onClick={onSkipRound}
                  disabled={gameState.skippedRound?.[currentPlayer.id]}
                >
                  {gameState.skippedRound?.[currentPlayer.id]
                    ? `${Object.keys(gameState.skippedRound).length}/${
                        activePlayers.length
                      }`
                    : "Skip Round"}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{activePlayers.length} Active</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="echoes"
                  className="flex items-center space-x-2"
                >
                  <Scroll className="w-4 h-4" />
                  <span>Echoes</span>
                  {echoes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {echoes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Messages</span>
                  {privateMessages.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {privateMessages.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="voting"
                  className="flex items-center space-x-2"
                >
                  <Vote className="w-4 h-4" />
                  <span>Voting</span>
                </TabsTrigger>
                <TabsTrigger
                  value="action"
                  className="flex items-center space-x-2"
                >
                  <Scroll className="w-4 h-4" />
                  <span>Action</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="echoes">
                <EchoFeed echoes={echoes} />
              </TabsContent>

              <TabsContent value="messages">
                <PrivateChat
                  messages={privateMessages}
                  currentPlayer={currentPlayer}
                  players={activePlayers}
                  sentMessagesThisRound={sentMessagesThisRound}
                  onSendMessage={onSendPrivateMessage}
                />
              </TabsContent>

              <TabsContent value="voting">
                {gameState.phase === "voting" ? (
                  <VotingPanel
                    players={activePlayers}
                    currentPlayer={currentPlayer}
                    votes={gameState.votes}
                    onCastVote={onCastVote}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-48">
                      <div className="text-center text-muted-foreground">
                        <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Voting will begin when the round ends</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="action">
                {gameState.phase === "action" ? (
                  <div className="space-y-4">
                    <ActionPanel
                      players={activePlayers}
                      currentPlayer={currentPlayer}
                      actions={gameState.actions}
                      onSubmitAction={(type, targetId) =>
                        onSubmitAction?.(type, targetId)
                      }
                    />
                    {gameState.actionResults &&
                      gameState.actionResults.length > 0 && (
                        <ActionSummary
                          actionResults={gameState.actionResults}
                        />
                      )}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-48">
                      <div className="text-center text-muted-foreground">
                        <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Action phase occurs between rounds</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Status */}
            <Card className="mysterious-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary animate-masquerade-pulse" />
                  <span>Your Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">
                    {currentPlayer.fakeName} ({currentPlayer.name})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <Badge variant="outline">{currentPlayer.role}</Badge>
                </div>
                {currentPlayer.target && (
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <Badge variant="destructive">{currentPlayer.target}</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge
                    variant={
                      !currentPlayer.isRevealed ? "default" : "destructive"
                    }
                  >
                    {!currentPlayer.isRevealed ? "Active" : "Revealed"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Players List */}
            <Card className="mysterious-shadow">
              <CardHeader>
                <CardTitle>All Players</CardTitle>
                <CardDescription>
                  {activePlayers.length} active,{" "}
                  {gameState.players.length - activePlayers.length} revealed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        !player.isRevealed
                          ? "bg-muted/30"
                          : "bg-destructive/10 opacity-60"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            !player.isRevealed ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            player.isRevealed && "line-through"
                          }`}
                        >
                          {player.fakeName}
                        </span>
                      </div>
                      {gameState.votes[player.id] &&
                        gameState.phase === "voting" && (
                          <Badge variant="outline" className="text-xs">
                            Voted
                          </Badge>
                        )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Phase Info */}
            <Card className="mysterious-shadow">
              <CardHeader>
                <CardTitle>Current Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="w-full justify-center py-2"
                  >
                    {gameState.phase === "round"
                      ? "Day"
                      : gameState.phase.charAt(0).toUpperCase() +
                        gameState.phase.slice(1)}
                  </Badge>
                  {gameState.phase === "round" && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">
                        Discuss, investigate, and prepare for voting
                      </p>
                    </div>
                  )}
                  {gameState.phase === "voting" && (
                    <p className="text-sm text-muted-foreground text-center">
                      Cast your vote to reveal a player
                    </p>
                  )}
                  {gameState.phase === "action" && (
                    <p className="text-sm text-muted-foreground text-center">
                      Perform your role's special action
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
