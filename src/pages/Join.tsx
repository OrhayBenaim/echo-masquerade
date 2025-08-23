import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dice6 } from "lucide-react";
import { faker } from "@faker-js/faker";
import MasqueradeLogo from "@/components/game/MasqueradeLogo";

const Join = () => {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  const generateRandomName = useCallback(() => {
    const randomName = faker.person.fullName();
    setPlayerName(randomName);
  }, []);

  const handleJoinRoom = useCallback(() => {
    if (roomId.trim() && playerName.trim()) {
      navigate(
        `/${roomId.trim().toUpperCase()}?player=${encodeURIComponent(
          playerName.trim()
        )}`
      );
    }
  }, [roomId, playerName, navigate]);

  return (
    <div className="min-h-screen bg-gradient-deep flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <MasqueradeLogo />

        <Card className="backdrop-blur border-accent/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Game</CardTitle>
            <CardDescription>
              Enter the Room ID to join the masquerade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerName">Your Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="playerName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="text-center flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generateRandomName}
                    className="shrink-0"
                    title="Generate random name"
                  >
                    <Dice6 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="Enter Room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="text-center font-mono text-lg tracking-wider"
                />
              </div>

              <Button
                onClick={handleJoinRoom}
                className="w-full"
                size="lg"
                disabled={!roomId.trim() || !playerName.trim()}
              >
                Join Masquerade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Join;
