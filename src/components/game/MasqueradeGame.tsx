import { useState, useEffect, useCallback } from 'react';
import { Player, PrivateMessage } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';
import { usePeerConnection } from '@/hooks/usePeerConnection';
import GameLobby from './GameLobby';
import RoleCard from './RoleCard';
import GameBoard from './GameBoard';
import { useToast } from '@/hooks/use-toast';

const MasqueradeGame = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [showRoleCard, setShowRoleCard] = useState(false);

  const { toast } = useToast();

  const gameStateHook = useGameState(isHost);
  const { gameState, echoes, privateMessages, sentMessagesThisRound, actions } = gameStateHook;

  const peerConnection = usePeerConnection(isHost, roomId);
  const { isConnected, connectionError, actions: peerActions } = peerConnection;

  // Handle peer-to-peer messages
  useEffect(() => {
    if (!peerConnection.peer) return;

    const handleGameStateUpdate = (data: any) => {
      if (data.type === 'game-state-update') {
        actions.setGameState(data.gameState);
      }
    };

    const handlePlayerJoined = (data: any, peerId: string) => {
      if (data.type === 'player-join') {
        const newPlayer: Player = {
          id: peerId,
          name: data.playerName,
          isHost: false,
          isAlive: true
        };
        actions.addPlayer(newPlayer);
        
        toast({
          title: "Player Joined",
          description: `${data.playerName} joined the masquerade`,
        });
      }
    };

    const handlePrivateMessage = (data: any) => {
      if (data.type === 'private-message') {
        // Note: In a real implementation, you'd want to verify the sender
        // and ensure the message is actually private between the sender and receiver
      }
    };

    const handleVoteCast = (data: any, peerId: string) => {
      if (data.type === 'vote-cast' && isHost) {
        actions.castVote(data.targetId, peerId);
      }
    };

    peerActions.registerMessageHandler('game-state-update', handleGameStateUpdate);
    peerActions.registerMessageHandler('player-join', handlePlayerJoined);
    peerActions.registerMessageHandler('private-message', handlePrivateMessage);
    peerActions.registerMessageHandler('vote-cast', handleVoteCast);

    return () => {
      peerActions.unregisterMessageHandler('game-state-update');
      peerActions.unregisterMessageHandler('player-join');
      peerActions.unregisterMessageHandler('private-message');
      peerActions.unregisterMessageHandler('vote-cast');
    };
  }, [peerConnection.peer, isHost, actions, peerActions, toast]);

  // Broadcast game state updates when host
  useEffect(() => {
    if (isHost && isConnected) {
      peerActions.broadcastMessage({
        type: 'game-state-update',
        gameState
      });
    }
  }, [gameState, isHost, isConnected, peerActions]);

  const handleCreateRoom = useCallback(() => {
    const newRoomId = actions.generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    
    const hostPlayer: Player = {
      id: 'host',
      name: 'Host',
      isHost: true,
      isAlive: true
    };
    
    setCurrentPlayer(hostPlayer);
    actions.addPlayer(hostPlayer);
    actions.setGameState(prev => ({ ...prev, roomId: newRoomId }));
  }, [actions]);

  const handleJoinRoom = useCallback((roomId: string, playerName: string) => {
    setRoomId(roomId);
    setIsHost(false);
    
    // Try to connect to the host
    const success = peerActions.connectToHost(roomId);
    
    if (success) {
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: playerName,
        isHost: false,
        isAlive: true
      };
      
      setCurrentPlayer(newPlayer);
      
      // Send join message to host
      setTimeout(() => {
        peerActions.broadcastMessage({
          type: 'player-join',
          playerName: playerName
        });
      }, 1000);
      
      toast({
        title: "Joining Room",
        description: "Connecting to the masquerade...",
      });
    } else {
      toast({
        title: "Connection Failed",
        description: "Could not connect to room. Please check the Room ID.",
        variant: "destructive"
      });
    }
  }, [peerActions, toast]);

  const handleStartGame = useCallback(() => {
    if (!isHost) return;
    
    actions.startGame();
    setShowRoleCard(true);
    
    // Hide role card after 5 seconds
    setTimeout(() => {
      setShowRoleCard(false);
    }, 5000);
  }, [isHost, actions]);

  const handleSendPrivateMessage = useCallback((message: PrivateMessage) => {
    try {
      actions.sendPrivateMessage(message);
      
      // Send message via peer connection
      peerActions.sendMessage(message.toId, {
        type: 'private-message',
        message
      });
    } catch (error: any) {
      toast({
        title: "Message Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [actions, peerActions, toast]);

  const handleCastVote = useCallback((targetId: string) => {
    if (!currentPlayer) return;
    
    actions.castVote(targetId, currentPlayer.id);
    
    // Send vote to host if not host
    if (!isHost) {
      peerActions.broadcastMessage({
        type: 'vote-cast',
        targetId
      });
    }
  }, [currentPlayer, actions, isHost, peerActions]);

  // Show connection error
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-deep p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Connection Error</h1>
          <p className="text-muted-foreground mb-4">{connectionError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show role card during role assignment phase
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
        sentMessagesThisRound={sentMessagesThisRound}
        onSendPrivateMessage={handleSendPrivateMessage}
        onCastVote={handleCastVote}
      />
    );
  }

  // Show lobby
  return (
    <GameLobby
      isHost={isHost}
      roomId={roomId}
      players={gameState.players}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      onStartGame={handleStartGame}
    />
  );
};

export default MasqueradeGame;