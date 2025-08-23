import { useState, useCallback, useRef } from "react";
import {
  GameState,
  Player,
  Role,
  Echo,
  PrivateMessage,
  DEFAULT_GAME_CONFIG,
} from "@/types/game";

export const useGameState = (isHost: boolean) => {
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
  const [sentMessagesThisRound, setSentMessagesThisRound] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateRoomId = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const assignRoles = useCallback((players: Player[]): Player[] => {
    if (players.length < DEFAULT_GAME_CONFIG.minPlayers) {
      throw new Error(
        `Need at least ${DEFAULT_GAME_CONFIG.minPlayers} players`
      );
    }

    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const roleAssignments: Role[] = [];

    // Calculate role distribution based on player count
    const spyCount = Math.max(1, Math.floor(players.length * 0.25));
    const hasAssassin = players.length >= 7;
    const hasWatcher = players.length >= 9;

    // Add roles
    for (let i = 0; i < spyCount; i++) {
      roleAssignments.push("Spy");
    }

    if (hasAssassin) roleAssignments.push("Assassin");
    if (hasWatcher) roleAssignments.push("Watcher");

    // Fill remaining with Guests
    while (roleAssignments.length < players.length) {
      roleAssignments.push("Guest");
    }

    // Shuffle roles and assign
    roleAssignments.sort(() => Math.random() - 0.5);

    return shuffled.map((player, index) => ({
      ...player,
      role: roleAssignments[index],
      isAlive: true,
    }));
  }, []);

  const generateSingleEcho = useCallback((round: number): Echo => {
    const echoTemplates = {
      RoleHint: [
        "A spy whispers in the shadows...",
        "The assassin sharpens their blade...",
        "The watcher's eyes pierce the darkness...",
        "Guests huddle in fearful whispers...",
        "Trust is a luxury none can afford...",
        "Someone here is not who they claim...",
      ],
      EventTease: [
        "A secret meeting was overheard...",
        "Someone was seen where they shouldn't be...",
        "A message was passed in the dark...",
        "Footsteps echo in empty halls...",
        "A mask slips, revealing truth beneath...",
        "The clock ticks toward revelation...",
      ],
      AlibiFrame: [
        "They claimed to be alone, but...",
        "Their story doesn't match the facts...",
        "A witness saw something different...",
        "The timeline doesn't add up...",
        "Their alibi has holes...",
        "Someone lies about their whereabouts...",
      ],
    };

    const types: Array<Echo["type"]> = ["RoleHint", "EventTease", "AlibiFrame"];
    const type = types[Math.floor(Math.random() * types.length)];
    const templates = echoTemplates[type];
    const content = templates[Math.floor(Math.random() * templates.length)];

    // 50% chance of being true for single echoes
    const isTruth = Math.random() > 0.5;

    return {
      id: `echo-${round}-single`,
      content,
      type,
      isTruth,
      round,
    };
  }, []);

  const startRound = useCallback(() => {
    if (!isHost) return;

    const newRound = gameState.round + 1;

    // Generate 1 echo at the start of each round, except the first round
    if (newRound > 1) {
      const singleEcho = generateSingleEcho(newRound);
      setEchoes((prev) => [...prev, singleEcho]);
    }

    setSentMessagesThisRound(0);

    setGameState((prev) => ({
      ...prev,
      phase: "round",
      round: newRound,
      timeRemaining: DEFAULT_GAME_CONFIG.roundDuration,
      votes: {},
    }));

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timerRef.current!);
          return { ...prev, phase: "voting", timeRemaining: 60 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [gameState, isHost, generateSingleEcho]);

  const castVote = useCallback((targetId: string, voterId: string) => {
    setGameState((prev) => ({
      ...prev,
      votes: { ...prev.votes, [voterId]: targetId },
    }));
  }, []);

  const sendPrivateMessage = useCallback(
    (message: PrivateMessage) => {
      if (
        sentMessagesThisRound >= DEFAULT_GAME_CONFIG.maxPrivateMessagesPerRound
      ) {
        throw new Error("Maximum messages per round reached");
      }

      setPrivateMessages((prev) => [...prev, message]);
      setSentMessagesThisRound((prev) => prev + 1);
    },
    [sentMessagesThisRound]
  );

  const addPlayer = useCallback((player: Player) => {
    setGameState((prev) => ({
      ...prev,
      players: [...prev.players, player],
    }));
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== playerId),
    }));
  }, []);

  const startGame = useCallback(() => {
    if (!isHost || gameState.players.length < DEFAULT_GAME_CONFIG.minPlayers)
      return;

    const playersWithRoles = assignRoles(gameState.players);

    setGameState((prev) => ({
      ...prev,
      phase: "role-assignment",
      players: playersWithRoles,
    }));

    // Move to first round after showing roles
    setTimeout(() => {
      setGameState((prev) => ({ ...prev, phase: "round" }));
      startRound();
    }, 5000);
  }, [gameState.players, isHost, assignRoles, startRound]);

  return {
    gameState,
    echoes,
    privateMessages,
    sentMessagesThisRound,
    actions: {
      generateRoomId,
      addPlayer,
      removePlayer,
      startGame,
      startRound,
      castVote,
      sendPrivateMessage,
      setGameState,
    },
  };
};
