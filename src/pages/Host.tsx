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
import MasqueradeLogo from "@/components/game/MasqueradeLogo";
import { Dice6 } from "lucide-react";
import { faker } from "@faker-js/faker";

const Host = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");

  const generateRandomName = useCallback(() => {
    const randomName = faker.person.fullName();
    setPlayerName(randomName);
  }, []);

  const generateRoomId = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const handleCreateRoom = useCallback(() => {
    const newRoomId = generateRoomId();
    navigate(
      `/${newRoomId}?host=true&player=${encodeURIComponent(playerName.trim())}`
    );
  }, [generateRoomId, navigate, playerName]);

  return (
    <div className="min-h-screen bg-gradient-deep flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <MasqueradeLogo />

        <Card className="backdrop-blur border-accent/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Host Game</CardTitle>
            <CardDescription>Create or join a room as the host</CardDescription>
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
              <Button
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="w-full"
                size="lg"
              >
                Create New Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Host;
