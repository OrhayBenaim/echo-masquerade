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
        debug: 2
      });

      newPeer.on('open', (id) => {
        peerId.current = id;
        setIsConnected(true);
        setConnectionError(null);
      });

      newPeer.on('error', (error) => {
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

  const broadcastToClients = useCallback((message: any) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }, [connections]);

  const broadcastSync = useCallback(() => {
    const syncMessage = {
      type: 'game-state-sync',
      gameState,
      echoes,
      privateMessages
    };
    
    console.log('Host broadcasting sync:', syncMessage);
    broadcastToClients(syncMessage);
  }, [gameState, echoes, privateMessages, broadcastToClients]);

  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on('open', () => {
      setConnections(prev => new Map(prev.set(conn.peer, conn)));
      console.log(`Player connected: ${conn.peer}`);
      
      // Send current game state to new player
      setTimeout(() => broadcastSync(), 100);
    });

    conn.on('data', (data: any) => {
      handleClientAction(data, conn.peer);
    });

    conn.on('close', () => {
      setConnections(prev => {
        const newConnections = new Map(prev);
        newConnections.delete(conn.peer);
        return newConnections;
      });
      
      console.log(`Player disconnected: ${conn.peer}`);
      // Remove player from game and broadcast update
      actions.removePlayer(conn.peer);
    });

    conn.on('error', (error) => {
      console.error('Connection error with', conn.peer, ':', error);
    });
  }, [actions, broadcastSync]);

  const handleClientAction = useCallback((action: any, peerId: string) => {
    console.log(`Host received action: ${action.type} from ${peerId}`);
    
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
    
    // After processing any action, broadcast updated state
    setTimeout(() => broadcastSync(), 100);
  }, [actions, broadcastSync]);


  const disconnect = useCallback(() => {
    connections.forEach((conn) => conn.close());
    if (peer) {
      peer.destroy();
    }
    setConnections(new Map());
    setPeer(null);
    setIsConnected(false);
  }, [peer, connections]);

  // Broadcast game state updates when state changes
  useEffect(() => {
    if (isConnected && connections.size > 0) {
      broadcastSync();
    }
  }, [gameState, echoes, privateMessages, isConnected, connections.size, broadcastSync]);

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
      broadcastSync,
      disconnect
    }
  };
};