import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import GameLobby from "@/components/game/GameLobby";
import GameBoard from "@/components/game/GameBoard";
import RoleCard from "@/components/game/RoleCard";
import { useToast } from "@/hooks/use-toast";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useHost } from "@/hooks/useHost";
import { PrivateMessage } from "@/types/game";

const Game = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isHost = searchParams.has("host");
  const playerName = searchParams.get("player");

  const [showRoleCard, setShowRoleCard] = useState(false);

  // Redirect if no roomId
  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }
  }, [roomId, navigate]);

  const gameHook = usePeerConnection({ isHost, roomId: roomId });

  const {
    gameState,
    echoes,
    privateMessages,
    sentMessagesThisRound,
    isConnected,
    connectionError,
    currentPlayer,
  } = gameHook;

  useEffect(() => {
    if (isConnected) {
      gameHook.actions.joinGame(playerName || "");
    }
  }, [isConnected, playerName, isHost]);

  // Handle role assignment phase
  useEffect(() => {
    if (gameState.phase === "role-assignment" && currentPlayer?.role) {
      setShowRoleCard(true);
      setTimeout(() => {
        setShowRoleCard(false);
      }, 5000);
    }
  }, [gameState.phase, currentPlayer?.role]);

  const handleStartGame = () => {
    if (isHost) {
      (gameHook as ReturnType<typeof useHost>).actions.startGame();
    }
  };

  const handleCastVote = (targetId: string) => {
    // if (isHost && 'actions' in hostHook && 'castVote' in hostHook.actions) {
    //   hostHook.actions.castVote(targetId, currentPlayer?.id || '');
    // } else {
    //   clientHook.actions.castVote(targetId);
    // }
  };

  const handleSendPrivateMessage = (message: PrivateMessage) => {
    gameHook.actions.sendPrivateMessage(message);
  };

  // Show connection error
  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-deep p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Connection Error
          </h1>
          <p className="text-muted-foreground mb-4">{connectionError}</p>
          <button
            onClick={() => navigate("/")}
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
        <RoleCard role={currentPlayer.role} players={gameState.players} />
      </div>
    );
  }

  // Show game board during gameplay
  if (gameState.phase !== "lobby" && currentPlayer) {
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
      roomId={roomId || ""}
      players={gameState.players}
      onCreateRoom={() => {}}
      onJoinRoom={() => {}}
      onStartGame={handleStartGame}
    />
  );
};

export default Game;
