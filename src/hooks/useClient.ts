import { useState, useRef, useCallback, useEffect } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { GameState, Echo, PrivateMessage } from '@/types/game';
import * as gameActions from '@/game/actions';

export const useClient = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [hostConnection, setHostConnection] = useState<DataConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'lobby',
    round: 0,
    timeRemaining: 0,
    players: [],
    votes: {},
    roomId: ''
  });
  
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  
  const peerId = useRef<string>('');

  const initializePeer = useCallback(() => {
    try {
      const newPeer = new Peer(undefined, {
        host: 'peerjs-server.herokuapp.com',
        port: 443,
        secure: true,
        debug: 2
      });

      newPeer.on('open', (id) => {
        peerId.current = id;
        console.log('Client peer connected with ID:', id);
      });

      newPeer.on('error', (error) => {
        console.error('Client peer error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      setPeer(newPeer);
      return newPeer;
    } catch (error) {
      console.error('Failed to initialize client peer:', error);
      setConnectionError('Failed to initialize connection');
      return null;
    }
  }, []);

  const connectToHost = useCallback((roomId: string) => {
    if (!peer) return false;

    try {
      const conn = peer.connect(roomId);
      
      conn.on('open', () => {
        setHostConnection(conn);
        setIsConnected(true);
        setConnectionError(null);
        console.log('Connected to host:', roomId);
      });

      conn.on('data', (data: any) => {
        console.log('Client received:', data.type);
        handleHostMessage(data);
      });

      conn.on('close', () => {
        setHostConnection(null);
        setIsConnected(false);
        console.log('Disconnected from host');
      });

      conn.on('error', (error) => {
        console.error('Connection error:', error);
        setConnectionError('Connection failed');
        setIsConnected(false);
      });

      return true;
    } catch (error) {
      console.error('Failed to connect to host:', error);
      setConnectionError('Failed to connect to room');
      return false;
    }
  }, [peer]);

  const handleHostMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'game-state-update':
        setGameState(message.gameState);
        if (message.echoes) setEchoes(message.echoes);
        if (message.privateMessages) setPrivateMessages(message.privateMessages);
        break;
      case 'game-state-sync':
        setGameState(message.gameState);
        setEchoes(message.echoes || []);
        setPrivateMessages(message.privateMessages || []);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }, []);

  const sendToHost = useCallback((action: any) => {
    if (hostConnection && hostConnection.open) {
      hostConnection.send(action);
      return true;
    }
    return false;
  }, [hostConnection]);

  const disconnect = useCallback(() => {
    if (hostConnection) {
      hostConnection.close();
    }
    if (peer) {
      peer.destroy();
    }
    setHostConnection(null);
    setPeer(null);
    setIsConnected(false);
  }, [peer, hostConnection]);

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
    isConnected,
    connectionError,
    actions: {
      connectToHost,
      joinGame: (playerName: string) => gameActions.joinGame(sendToHost, playerName),
      castVote: (targetId: string) => gameActions.castVote(sendToHost, targetId),
      sendPrivateMessage: (message: PrivateMessage) => gameActions.sendPrivateMessage(sendToHost, message),
      disconnect
    }
  };
};