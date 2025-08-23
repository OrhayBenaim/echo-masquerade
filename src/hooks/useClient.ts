import { useState, useRef, useCallback, useEffect } from "react";
import Peer, { DataConnection } from "peerjs";
import { GameState, Echo, PrivateMessage, Player } from "@/types/game";
import * as gameActions from "@/game/actions";

export const useClient = (roomId: string, isHost: boolean) => {
  const peer = useRef<Peer | null>(null);
  const hostConnection = useRef<DataConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    phase: "lobby",
    round: 0,
    timeRemaining: 0,
    players: [],
    votes: {},
    roomId: "",
  });

  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);

  const peerId = useRef<string>("");

  const initializePeer = useCallback(() => {
    try {
      const newPeer = new Peer(undefined, {
        debug: 2,
      });

      newPeer.on("open", (id) => {
        peerId.current = id;
        setIsConnected(true);
      });

      newPeer.on("error", (error) => {
        setConnectionError(error.message);
        setIsConnected(false);
      });

      peer.current = newPeer;
      return newPeer;
    } catch (error) {
      console.error("Failed to initialize client peer:", error);
      setConnectionError("Failed to initialize connection");
      return null;
    }
  }, []);

  const connectToHost = useCallback(
    (roomId: string) => {
      return new Promise<DataConnection>((resolve, reject) => {
        if (!peer.current) {
          reject(new Error("Peer not initialized"));
          return;
        }

        try {
          const conn = peer.current.connect(roomId);

          conn.on("open", () => {
            hostConnection.current = conn;
            setConnectionError(null);
          });

          conn.on("data", (data: any) => {
            console.log("Client received:", data.type);
            handleHostMessage(data);
            resolve(conn);
          });

          conn.on("close", () => {
            hostConnection.current = null;
            setIsConnected(false);
          });

          conn.on("error", (error) => {
            console.error("Connection error:", error);
            setConnectionError("Connection failed");
            setIsConnected(false);
          });
        } catch (error) {
          console.error("Failed to connect to host:", error);
          setConnectionError("Failed to connect to room");
          reject(error);
        }
      });
    },
    [peer.current]
  );

  const handleHostMessage = useCallback((message: any) => {
    switch (message.type) {
      case "game-state-sync":
        console.log("Client syncing game state:", message.gameState);
        setCurrentPlayer(
          message.gameState.players.find(
            (player: Player) => player.id === peerId.current
          ) || null
        );
        setGameState(message.gameState);
        setEchoes(message.echoes || []);
        setPrivateMessages(message.privateMessages || []);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }, []);

  const sendToHost = async (action: any) => {
    let connection = hostConnection.current;
    if (!connection || !connection.open) {
      connection = await connectToHost(roomId);
    }
    if (connection && connection.open) {
      console.log("Client sending action:", action.type);
      connection.send(action);
      return true;
    }
    console.warn("Cannot send to host: connection not open");
    return false;
  };

  const disconnect = useCallback(() => {
    if (hostConnection.current) {
      hostConnection.current.close();
    }
    if (peer.current) {
      peer.current.destroy();
    }
    hostConnection.current = null;
    peer.current = null;
    setIsConnected(false);
  }, [peer.current, hostConnection.current]);

  // Initialize peer on mount
  useEffect(() => {
    if (!isHost) {
      initializePeer();
    }

    return () => {
      disconnect();
    };
  }, [isHost]);

  return {
    gameState,
    echoes,
    privateMessages,
    isConnected,
    connectionError,
    currentPlayer,
    actions: {
      joinGame: (playerName: string) =>
        gameActions.joinGame(sendToHost, playerName),
      castVote: (targetId: string) =>
        gameActions.castVote(sendToHost, targetId),
      sendPrivateMessage: (message: PrivateMessage) =>
        gameActions.sendPrivateMessage(sendToHost, message),
      disconnect,
    },
  };
};
