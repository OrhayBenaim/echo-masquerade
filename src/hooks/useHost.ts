import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Peer, { DataConnection } from "peerjs";
import { useGameState } from "./useGameState";
import * as gameFunctions from "@/game/functions";
import { Player } from "@/types/game";
import { faker } from "@faker-js/faker";

export const useHost = (roomId: string, isHost: boolean) => {
  const peer = useRef<Peer | null>(null);
  const [connections, setConnections] = useState<Map<string, DataConnection>>(
    new Map()
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const gameStateHook = useGameState(true);
  const { gameState, echoes, privateMessages, messagesSentThisRound, actions } =
    gameStateHook;

  const initializePeer = useCallback(() => {
    try {
      const newPeer = new Peer(roomId, {
        debug: 2,
      });

      newPeer.on("open", (id) => {
        setIsConnected(true);
        setConnectionError(null);
      });

      newPeer.on("error", (error) => {
        setConnectionError(error.message);
        setIsConnected(false);
      });

      newPeer.on("connection", (conn) => {
        setupConnection(conn);
      });

      peer.current = newPeer;
      return newPeer;
    } catch (error) {
      console.error("Failed to initialize host peer:", error);
      setConnectionError("Failed to initialize connection");
      return null;
    }
  }, [roomId]);

  const broadcastToClients = useCallback(
    (message: any) => {
      connections.forEach((conn) => {
        if (conn.open) {
          conn.send(message);
          conn.send({
            type: "messages-sent-this-round",
            messagesSentThisRound: messagesSentThisRound[conn.peer || ""],
          });
        }
      });
    },
    [connections, messagesSentThisRound]
  );

  const broadcastSync = useCallback(() => {
    const syncMessage = {
      type: "game-state-sync",
      gameState,
      echoes,
      privateMessages,
    };

    console.log("Host broadcasting sync:", syncMessage);
    broadcastToClients(syncMessage);
  }, [gameState, echoes, privateMessages, broadcastToClients]);

  const setupConnection = useCallback(
    (conn: DataConnection) => {
      conn.on("open", () => {
        setConnections((prev) => new Map(prev.set(conn.peer, conn)));
        console.log(`Player connected: ${conn.peer}`);

        // Send current game state to new player
        broadcastSync();
      });

      conn.on("data", (data: any) => {
        handleClientAction(data, conn.peer);
      });

      conn.on("close", () => {
        setConnections((prev) => {
          const newConnections = new Map(prev);
          newConnections.delete(conn.peer);
          return newConnections;
        });

        console.log(`Player disconnected: ${conn.peer}`);
        // Remove player from game and broadcast update
        actions.removePlayer(conn.peer);
      });

      conn.on("error", (error) => {
        console.error("Connection error with", conn.peer, ":", error);
      });
    },
    [actions, broadcastSync]
  );

  const handleClientAction = useCallback(
    (action: any, peerId: string) => {
      console.log(`Host received action: ${action.type} from ${peerId}`);

      switch (action.type) {
        case "player-join":
          gameFunctions.handlePlayerJoin(
            action,
            peerId,
            peerId === peer.current?.id,
            actions
          );
          break;
        case "vote-cast":
          gameFunctions.handleVoteCast(action, peerId, actions);
          break;
        case "private-message":
          gameFunctions.handlePrivateMessage(action, peerId, actions);
          break;
        case "action-submit":
          gameFunctions.handleActionSubmit(action, peerId, actions);
          break;
        default:
          console.warn("Unknown action type:", action.type);
      }
    },
    [actions, broadcastSync, peer.current]
  );

  const disconnect = useCallback(() => {
    connections.forEach((conn) => conn.close());
    if (peer.current) {
      peer.current.destroy();
    }
    setConnections(new Map());
    peer.current = null;
    setIsConnected(false);
  }, [peer.current, connections]);

  const joinGame = useCallback(
    (playerName: string) => {
      const player: Player = {
        id: peer.current?.id || "",
        name: playerName || "host",
        fakeName: faker.book.author() || "host",
        isHost: true,
        isAlive: true,
        isRevealed: false,
      };
      actions.addPlayer(player);
    },
    [actions, peer.current]
  );

  const currentPlayer = useMemo(() => {
    return gameState.players.find((player) => player.id === peer.current?.id);
  }, [gameState, peer.current]);

  // Broadcast game state updates when state changes
  useEffect(() => {
    if (isConnected && connections.size > 0 && isHost) {
      broadcastSync();
    }
  }, [
    gameState,
    echoes,
    privateMessages,
    isConnected,
    connections.size,
    broadcastSync,
    isHost,
  ]);

  // Initialize peer on mount
  useEffect(() => {
    if (isHost) {
      initializePeer();
    }

    return () => {
      disconnect();
    };
  }, [isHost]);

  const sentMessagesThisRound = useMemo(() => {
    return messagesSentThisRound[peer.current?.id || ""] || 0;
  }, [messagesSentThisRound, peer.current?.id]);

  return {
    gameState,
    echoes,
    privateMessages,
    sentMessagesThisRound,
    isConnected,
    connectionError,
    connectedPlayers: Array.from(connections.keys()),
    currentPlayer,
    actions: {
      ...actions,
      castVote: (targetId: string) => {
        actions.castVote(targetId, peer.current?.id || "");
      },
      joinGame,
      broadcastToClients,
      broadcastSync,
      disconnect,
    },
  };
};
