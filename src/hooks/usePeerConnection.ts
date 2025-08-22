import { useState, useRef, useCallback, useEffect } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Player } from '@/types/game';

export const usePeerConnection = (isHost: boolean, roomId?: string) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<Map<string, DataConnection>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const peerId = useRef<string>('');
  const messageHandlers = useRef<Map<string, (data: any, peerId: string) => void>>(new Map());

  const initializePeer = useCallback(() => {
    try {
      const newPeer = new Peer(isHost ? roomId : undefined, {
        host: 'peerjs-server.herokuapp.com', // Free PeerJS server
        port: 443,
        secure: true,
        debug: 2
      });

      newPeer.on('open', (id) => {
        peerId.current = id;
        setIsConnected(true);
        setConnectionError(null);
        console.log('Peer connected with ID:', id);
      });

      newPeer.on('error', (error) => {
        console.error('Peer error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      if (isHost) {
        // Host listens for incoming connections
        newPeer.on('connection', (conn) => {
          setupConnection(conn);
        });
      }

      setPeer(newPeer);
      return newPeer;
    } catch (error) {
      console.error('Failed to initialize peer:', error);
      setConnectionError('Failed to initialize connection');
      return null;
    }
  }, [isHost, roomId]);

  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on('open', () => {
      setConnections(prev => new Map(prev.set(conn.peer, conn)));
      console.log('Connection established with:', conn.peer);
    });

    conn.on('data', (data: any) => {
      console.log('Received data from', conn.peer, ':', data);
      const handler = messageHandlers.current.get(data.type);
      if (handler) {
        handler(data, conn.peer);
      }
    });

    conn.on('close', () => {
      setConnections(prev => {
        const newConnections = new Map(prev);
        newConnections.delete(conn.peer);
        return newConnections;
      });
      console.log('Connection closed with:', conn.peer);
    });

    conn.on('error', (error) => {
      console.error('Connection error with', conn.peer, ':', error);
    });
  }, []);

  const connectToHost = useCallback((hostId: string) => {
    if (!peer) return false;

    try {
      const conn = peer.connect(hostId);
      setupConnection(conn);
      return true;
    } catch (error) {
      console.error('Failed to connect to host:', error);
      setConnectionError('Failed to connect to room');
      return false;
    }
  }, [peer, setupConnection]);

  const broadcastMessage = useCallback((message: any) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }, [connections]);

  const sendMessage = useCallback((targetPeerId: string, message: any) => {
    const conn = connections.get(targetPeerId);
    if (conn && conn.open) {
      conn.send(message);
      return true;
    }
    return false;
  }, [connections]);

  const registerMessageHandler = useCallback((messageType: string, handler: (data: any, peerId: string) => void) => {
    messageHandlers.current.set(messageType, handler);
  }, []);

  const unregisterMessageHandler = useCallback((messageType: string) => {
    messageHandlers.current.delete(messageType);
  }, []);

  const getConnectedPeers = useCallback(() => {
    return Array.from(connections.keys());
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

  // Initialize peer on mount
  useEffect(() => {
    initializePeer();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    peer,
    peerId: peerId.current,
    connections: Array.from(connections.values()),
    connectedPeerIds: getConnectedPeers(),
    isConnected,
    connectionError,
    actions: {
      connectToHost,
      broadcastMessage,
      sendMessage,
      registerMessageHandler,
      unregisterMessageHandler,
      disconnect
    }
  };
};