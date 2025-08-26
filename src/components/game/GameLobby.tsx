import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Play, UserPlus, Crown } from "lucide-react";
import { Player, DEFAULT_GAME_CONFIG } from "@/types/game";
import { useToast } from "@/hooks/use-toast";
import MasqueradeLogo from "./MasqueradeLogo";

interface GameLobbyProps {
  isHost: boolean;
  roomId: string;
  players: Player[];
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string, playerName: string) => void;
  onStartGame: () => void;
  onPlayerNameChange?: (name: string) => void;
}

const GameLobby = ({
  isHost,
  roomId,
  players,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
}: GameLobbyProps) => {
  const [joinRoomId, setJoinRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(!isHost);
  const { toast } = useToast();

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast({
        title: "Room ID Copied!",
        description: "Share this ID with your friends to join the game.",
      });
    } catch {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the Room ID.",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim() || !playerName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Room ID and your name.",
        variant: "destructive",
      });
      return;
    }
    onJoinRoom(joinRoomId.trim().toUpperCase(), playerName.trim());
  };

  const handleStartGame = () => {
    if (players.length < DEFAULT_GAME_CONFIG.minPlayers) {
      toast({
        title: "Not Enough Players",
        description: `Need at least ${DEFAULT_GAME_CONFIG.minPlayers} players to start.`,
        variant: "destructive",
      });
      return;
    }
    onStartGame();
  };

  if (!roomId && !showJoinForm) {
    // Initial screen
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-deep p-4">
        <Card className="w-full max-w-md mysterious-shadow">
          <CardHeader className="text-center space-y-4">
            <MasqueradeLogo />
            <CardDescription className="text-center text-muted-foreground">
              A game of secrets, whispers, and cryptic echoes for 5-14 players
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="masquerade"
              size="lg"
              className="w-full"
              onClick={onCreateRoom}
            >
              <Crown className="w-5 h-5" />
              Create Room
            </Button>
            <Button
              variant="mystical"
              size="lg"
              className="w-full"
              onClick={() => setShowJoinForm(true)}
            >
              <UserPlus className="w-5 h-5" />
              Join Room
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showJoinForm && !roomId) {
    // Join room form
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-deep p-4">
        <Card className="w-full max-w-md mysterious-shadow">
          <CardHeader className="text-center">
            <MasqueradeLogo />
            <CardTitle>Join the Masquerade</CardTitle>
            <CardDescription>
              Enter the Room ID and choose your alias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Room ID</label>
              <Input
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-wider"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowJoinForm(false)}
                className="w-full"
              >
                Back
              </Button>
              <Button
                variant="masquerade"
                onClick={handleJoinRoom}
                className="w-full"
              >
                Join Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Room lobby with players
  return (
    <div className="min-h-screen bg-gradient-deep p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <MasqueradeLogo />
        </div>

        {isHost && (
          <Card className="mysterious-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-secondary" />
                  <span>Room Created</span>
                </span>
                <Badge variant="secondary" className="text-lg font-mono">
                  {roomId}
                </Badge>
              </CardTitle>
              <CardDescription>
                Share this Room ID with your friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="gold"
                onClick={handleCopyRoomId}
                className="w-full"
              >
                <Copy className="w-4 h-4" />
                Copy Room ID
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mysterious-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Players ({players.length})</span>
              </span>
              <div className="flex space-x-2">
                <Badge
                  variant={
                    players.length >= DEFAULT_GAME_CONFIG.minPlayers
                      ? "default"
                      : "destructive"
                  }
                >
                  Min: {DEFAULT_GAME_CONFIG.minPlayers}
                </Badge>
                <Badge variant="outline">
                  Max: {DEFAULT_GAME_CONFIG.maxPlayers}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-3 h-3 rounded-full bg-primary animate-masquerade-pulse" />
                  <span className="text-sm font-medium truncate">
                    {player.fakeName}
                  </span>
                </div>
              ))}
            </div>

            {isHost && players.length >= DEFAULT_GAME_CONFIG.minPlayers && (
              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="masquerade"
                  size="lg"
                  onClick={handleStartGame}
                  className="w-full"
                >
                  <Play className="w-5 h-5" />
                  Begin the Masquerade
                </Button>
              </div>
            )}

            {isHost && players.length < DEFAULT_GAME_CONFIG.minPlayers && (
              <div className="mt-4 text-center text-muted-foreground">
                Waiting for {DEFAULT_GAME_CONFIG.minPlayers - players.length}{" "}
                more players...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameLobby;
