import { useState, useRef, useCallback, useEffect } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Player } from '@/types/game';
import { useGameState } from './useGameState';
import * as gameFunctions from '@/game/functions';

export const useHost = (roomId: string) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<Map<string, DataConnection>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const peerId = useRef<string>('');
  const gameStateHook = useGameState(true);
  const { gameState, echoes, privateMessages, sentMessagesThisRound, actions } = gameStateHook;

  const initializePeer = useCallback(() => {
    try {
      const newPeer = new Peer(roomId, {
        host: 'peerjs-server.herokuapp.com',
        port: 443,
        secure: true,
        debug: 2
      });

      newPeer.on('open', (id) => {
        peerId.current = id;
        setIsConnected(true);
        setConnectionError(null);
        console.log('Host peer connected with ID:', id);
      });

      newPeer.on('error', (error) => {
        console.error('Host peer error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      newPeer.on('connection', (conn) => {
        setupConnection(conn);
      });

      setPeer(newPeer);
      return newPeer;
    } catch (error) {
      console.error('Failed to initialize host peer:', error);
      setConnectionError('Failed to initialize connection');
      return null;
    }
  }, [roomId]);

  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on('open', () => {
      setConnections(prev => new Map(prev.set(conn.peer, conn)));
      console.log('Player connected:', conn.peer);
      
      // Send current game state to new player
      conn.send({
        type: 'game-state-sync',
        gameState,
        echoes,
        privateMessages
      });
    });

    conn.on('data', (data: any) => {
      console.log('Host received action:', data.type, 'from', conn.peer);
      handleClientAction(data, conn.peer);
    });

    conn.on('close', () => {
      setConnections(prev => {
        const newConnections = new Map(prev);
        newConnections.delete(conn.peer);
        return newConnections;
      });
      
      // Remove player from game
      actions.removePlayer(conn.peer);
      console.log('Player disconnected:', conn.peer);
    });

    conn.on('error', (error) => {
      console.error('Connection error with', conn.peer, ':', error);
    });
  }, [gameState, echoes, privateMessages, actions]);

  const handleClientAction = useCallback((action: any, peerId: string) => {
    switch (action.type) {
      case 'player-join':
        gameFunctions.handlePlayerJoin(action, peerId, actions);
        break;
      case 'vote-cast':
        gameFunctions.handleVoteCast(action, peerId, actions);
        break;
      case 'private-message':
        gameFunctions.handlePrivateMessage(action, peerId, actions);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }, [actions]);

  const broadcastToClients = useCallback((message: any) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }, [connections]);

  const disconnect = useCallback(() => {
    connections.forEach((conn) => conn.close());
    if (peer) {
      peer.destroy();
    }
    setConnections(new Map());
    setPeer(null);
    setIsConnected(false);
  }, [peer, connections]);

  // Broadcast game state updates
  useEffect(() => {
    if (isConnected && connections.size > 0) {
      broadcastToClients({
        type: 'game-state-update',
        gameState,
        echoes,
        privateMessages
      });
    }
  }, [gameState, echoes, privateMessages, isConnected, connections.size, broadcastToClients]);

  // Initialize peer on mount
  useEffect(() => {
    initializePeer();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    gameState,
    echoes,
    privateMessages,
    sentMessagesThisRound,
    isConnected,
    connectionError,
    connectedPlayers: Array.from(connections.keys()),
    actions: {
      ...actions,
      broadcastToClients,
      disconnect
    }
  };
};