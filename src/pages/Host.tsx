import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MasqueradeLogo from '@/components/game/MasqueradeLogo';

const Host = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const generateRoomId = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const handleCreateRoom = useCallback(() => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    navigate(`/${newRoomId}?host=true`);
  }, [generateRoomId, navigate]);

  const handleJoinAsHost = useCallback(() => {
    if (roomId.trim()) {
      navigate(`/${roomId.trim().toUpperCase()}?host=true`);
    }
  }, [roomId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-deep flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <MasqueradeLogo />
        
        <Card className="backdrop-blur border-accent/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Host Game</CardTitle>
            <CardDescription>
              Create or join a room as the host
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button 
                onClick={handleCreateRoom}
                className="w-full"
                size="lg"
              >
                Create New Room
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-accent/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or join existing
                  </span>
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
                onClick={handleJoinAsHost}
                variant="outline"
                className="w-full"
                disabled={!roomId.trim()}
              >
                Join as Host
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Host;