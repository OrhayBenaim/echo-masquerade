import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useHost } from '@/hooks/useHost';
import { useClient } from '@/hooks/useClient';
import { Player } from '@/types/game';
import GameLobby from '@/components/game/GameLobby';
import GameBoard from '@/components/game/GameBoard';
import RoleCard from '@/components/game/RoleCard';
import { useToast } from '@/hooks/use-toast';

const Game = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isHost = searchParams.has('host');
  const playerName = searchParams.get('player');
  
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showRoleCard, setShowRoleCard] = useState(false);

  // Redirect if no roomId
  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }
  }, [roomId, navigate]);

  const hostHook = useHost(roomId || '');
  const clientHook = useClient();

  const gameHook = isHost ? hostHook : clientHook;
  const { gameState, echoes, privateMessages, isConnected, connectionError } = gameHook;

  // Handle client connection
  useEffect(() => {
    if (!isHost && roomId && playerName && !isConnected) {
      clientHook.actions.connectToHost(roomId);
    }
  }, [isHost, roomId, playerName, isConnected, clientHook]);

  // Handle successful connection and join game
  useEffect(() => {
    if (!isHost && isConnected && playerName && !currentPlayer) {
      // Set up current player for client
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: playerName,
        isHost: false,
        isAlive: true
      };
      setCurrentPlayer(newPlayer);
      
      // Send join message immediately after connection
      clientHook.actions.joinGame(playerName);
    }
  }, [isHost, isConnected, playerName, currentPlayer, clientHook]);

  // Handle host setup
  useEffect(() => {
    if (isHost && !currentPlayer) {
      const hostPlayer: Player = {
        id: 'host',
        name: 'Host',
        isHost: true,
        isAlive: true
      };
      setCurrentPlayer(hostPlayer);
      
      if ('actions' in hostHook && 'addPlayer' in hostHook.actions) {
        hostHook.actions.addPlayer(hostPlayer);
      }
    }
  }, [isHost, currentPlayer, hostHook]);

  // Handle role assignment phase
  useEffect(() => {
    if (gameState.phase === 'role-assignment' && currentPlayer?.role) {
      setShowRoleCard(true);
      setTimeout(() => {
        setShowRoleCard(false);
      }, 5000);
    }
  }, [gameState.phase, currentPlayer?.role]);

  const handleStartGame = () => {
    if (isHost && 'actions' in hostHook && 'startGame' in hostHook.actions) {
      hostHook.actions.startGame();
    }
  };

  const handleCastVote = (targetId: string) => {
    if (isHost && 'actions' in hostHook && 'castVote' in hostHook.actions) {
      hostHook.actions.castVote(targetId, currentPlayer?.id || '');
    } else {
      clientHook.actions.castVote(targetId);
    }
  };

  const handleSendPrivateMessage = (message: any) => {
    if (isHost && 'actions' in hostHook && 'sendPrivateMessage' in hostHook.actions) {
      hostHook.actions.sendPrivateMessage(message);
    } else {
      clientHook.actions.sendPrivateMessage(message);
    }
  };

  // Show connection error
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-deep p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Connection Error</h1>
          <p className="text-muted-foreground mb-4">{connectionError}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Show role card during role assignment
  if (showRoleCard && currentPlayer?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-deep p-4">
        <RoleCard role={currentPlayer.role} isRevealed={true} />
      </div>
    );
  }

  // Show game board during gameplay
  if (gameState.phase !== 'lobby' && currentPlayer) {
    return (
      <GameBoard
        gameState={gameState}
        currentPlayer={currentPlayer}
        echoes={echoes}
        privateMessages={privateMessages}
        sentMessagesThisRound={0}
        onSendPrivateMessage={handleSendPrivateMessage}
        onCastVote={handleCastVote}
      />
    );
  }

  // Show lobby
  return (
    <GameLobby
      isHost={isHost}
      roomId={roomId || ''}
      players={gameState.players}
      onCreateRoom={() => {}}
      onJoinRoom={() => {}}
      onStartGame={handleStartGame}
    />
  );
};

export default Game;