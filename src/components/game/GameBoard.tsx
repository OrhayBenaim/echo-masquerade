import { useState } from 'react';
import { GameState, Player, Echo, PrivateMessage } from '@/types/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MessageCircle, Users, Vote, Scroll } from 'lucide-react';
import EchoFeed from './EchoFeed';
import PrivateChat from './PrivateChat';
import VotingPanel from './VotingPanel';

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: Player;
  echoes: Echo[];
  privateMessages: PrivateMessage[];
  sentMessagesThisRound: number;
  onSendPrivateMessage: (message: PrivateMessage) => void;
  onCastVote: (targetId: string) => void;
}

const GameBoard = ({
  gameState,
  currentPlayer,
  echoes,
  privateMessages,
  sentMessagesThisRound,
  onSendPrivateMessage,
  onCastVote
}: GameBoardProps) => {
  const [activeTab, setActiveTab] = useState('echoes');
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const alivePlayers = gameState.players.filter(p => p.isAlive);
  const currentRoundEchoes = echoes.filter(e => e.round === gameState.round);

  return (
    <div className="min-h-screen bg-gradient-deep p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Header */}
        <Card className="mysterious-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-lg">
                  Round {gameState.round}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">
                    {formatTime(gameState.timeRemaining)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{alivePlayers.length} Alive</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="echoes" className="flex items-center space-x-2">
                  <Scroll className="w-4 h-4" />
                  <span>Echoes</span>
                  {currentRoundEchoes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {currentRoundEchoes.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Messages</span>
                  {privateMessages.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {privateMessages.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="voting" className="flex items-center space-x-2">
                  <Vote className="w-4 h-4" />
                  <span>Voting</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="echoes">
                <EchoFeed echoes={currentRoundEchoes} />
              </TabsContent>

              <TabsContent value="messages">
                <PrivateChat
                  messages={privateMessages}
                  currentPlayer={currentPlayer}
                  players={alivePlayers}
                  sentMessagesThisRound={sentMessagesThisRound}
                  onSendMessage={onSendPrivateMessage}
                />
              </TabsContent>

              <TabsContent value="voting">
                {gameState.phase === 'voting' ? (
                  <VotingPanel
                    players={alivePlayers}
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
                  <span className="font-medium">{currentPlayer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <Badge variant="outline">{currentPlayer.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={currentPlayer.isAlive ? "default" : "destructive"}>
                    {currentPlayer.isAlive ? "Alive" : "Eliminated"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Players List */}
            <Card className="mysterious-shadow">
              <CardHeader>
                <CardTitle>All Players</CardTitle>
                <CardDescription>
                  {alivePlayers.length} alive, {gameState.players.length - alivePlayers.length} eliminated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gameState.players.map((player) => (
                    <div 
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        player.isAlive ? 'bg-muted/30' : 'bg-destructive/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          player.isAlive ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className={`text-sm ${!player.isAlive && 'line-through'}`}>
                          {player.name}
                          {player.isHost && " 👑"}
                        </span>
                      </div>
                      {gameState.votes[player.id] && gameState.phase === 'voting' && (
                        <Badge variant="outline" className="text-xs">Voted</Badge>
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
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    {gameState.phase.charAt(0).toUpperCase() + gameState.phase.slice(1)}
                  </Badge>
                  {gameState.phase === 'round' && (
                    <p className="text-sm text-muted-foreground text-center">
                      Discuss, investigate, and prepare for voting
                    </p>
                  )}
                  {gameState.phase === 'voting' && (
                    <p className="text-sm text-muted-foreground text-center">
                      Cast your vote to eliminate a player
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