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
  const [messagesSentThisRound, setMessagesSentThisRound] = useState({});
  const spyTarget = useRef<string | null>(null);

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
    const hasAssassin = players.length >= 5;
    const hasWatcher = players.length >= 5;

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

    return shuffled
      .map((player, index) => ({
        ...player,
        role: roleAssignments[index],
        target: undefined,
        isAlive: true,
        isRevealed: false,
      }))
      .map((player, _, pl) => ({
        ...player,
        target: getTarget(player, player.role, pl),
      }));
  }, []);

  const getTarget = useCallback(
    (currentPlayer: Player, role: Role, players: Player[]) => {
      if (role !== "Spy" && role !== "Assassin") {
        return undefined;
      }
      if (role === "Spy" && spyTarget.current) {
        return spyTarget.current;
      }
      let target: Player | undefined;
      while (!target) {
        const randomIndex = Math.floor(Math.random() * players.length);
        if (players[randomIndex].id !== currentPlayer.id) {
          if (role === "Spy" && players[randomIndex].role === "Spy") {
            continue;
          }
          target = players[randomIndex];
        }
      }
      if (role === "Spy") {
        spyTarget.current = target.name;
      }
      return target.name;
    },
    [spyTarget.current]
  );

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
    const singleEcho = generateSingleEcho(newRound);
    setEchoes((prev) => [...prev, singleEcho]);

    setMessagesSentThisRound({});

    setGameState((prev) => ({
      ...prev,
      phase: "round",
      round: newRound,
      timeRemaining: DEFAULT_GAME_CONFIG.roundDuration,
      votes: {},
      actions: {},
    }));

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 0) {
          clearInterval(timerRef.current!);
          // Start voting phase timer
          timerRef.current = setInterval(() => {
            setGameState((prevState) => {
              if (prevState.phase !== "voting") {
                clearInterval(timerRef.current!);
                return prevState;
              }

              if (prevState.timeRemaining <= 0) {
                clearInterval(timerRef.current!);
                return processVotingResults(prevState);
              }
              return {
                ...prevState,
                timeRemaining: prevState.timeRemaining - 1,
              };
            });
          }, 1000);
          return {
            ...prev,
            phase: "voting",
            timeRemaining: DEFAULT_GAME_CONFIG.votingDuration,
          };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [gameState, isHost, generateSingleEcho]);

  // Resolve action phase effects in order: Watcher -> Assassin -> Spy
  const processActions = useCallback((state: GameState): GameState => {
    const actions = state.actions || {};
    let players = [...state.players];
    let winner: string | undefined = undefined;
    let phase: GameState["phase"] | undefined = undefined;
    const actionResults: Array<{
      actorName: string;
      actorFakeName: string;
      action: string;
      targetName?: string;
      targetFakeName?: string;
      result: string;
    }> = [];

    const isActive = (pId: string) =>
      players.find((p) => p.id === pId && !p.isRevealed);

    // 1) Watchers get notified if target acted
    Object.entries(actions).forEach(([actorId, act]) => {
      const actor = players.find((p) => p.id === actorId);
      if (!actor || actor.role !== "Watcher" || !act.targetId) return;
      if (!isActive(actorId)) return;

      const target = players.find((p) => p.id === act.targetId);
      if (!target) return;

      const targetAction = actions[act.targetId];
      if (targetAction) {
        // Watcher detected action
        actionResults.push({
          actorName: actor.name,
          actorFakeName: actor.fakeName,
          action: "watched",
          targetName: target.name,
          targetFakeName: target.fakeName,
          result: "detected movement",
        });

        // Notify watcher via echo
        const echo: Echo = {
          id: `echo-watch-${state.round}-${actorId}`,
          content: `The watcher sensed movement around ${target.fakeName}'s room`,
          type: "EventTease",
          isTruth: true,
          round: state.round,
        };
        setEchoes((prev) => [...prev, echo]);
      } else {
        // Watcher saw nothing
        actionResults.push({
          actorName: actor.name,
          actorFakeName: actor.fakeName,
          action: "watched",
          targetName: target.name,
          targetFakeName: target.fakeName,
          result: "saw nothing",
        });
      }
    });

    // 2) Assassin kills their target
    Object.entries(actions).forEach(([actorId, act]) => {
      const actor = players.find((p) => p.id === actorId);
      if (!actor || actor.role !== "Assassin" || !act.targetId) return;
      if (!isActive(actorId) || !isActive(act.targetId)) return;

      const target = players.find((p) => p.id === act.targetId);
      if (!target) return;

      players = players.map((p) =>
        p.id === act.targetId ? { ...p, isRevealed: true } : p
      );

      actionResults.push({
        actorName: actor.name,
        actorFakeName: actor.fakeName,
        action: "assassinated",
        targetName: target.name,
        targetFakeName: target.fakeName,
        result: "target eliminated",
      });

      // Notify watcher via echo
      const echo: Echo = {
        id: `echo-watch-${state.round}-${actorId}`,
        content: `${target.fakeName} was found dead in their room`,
        type: "EventTease",
        isTruth: true,
        round: state.round,
      };
      setEchoes((prev) => [...prev, echo]);

      if (target.name === actor.target) {
        winner = "Assassin";
        phase = "game-over";
      }
    });

    // 3) Spy extracts info

    // Object.entries(actions).forEach(([actorId, act]) => {
    //   const actor = players.find((p) => p.id === actorId);
    //   if (!actor || actor.role !== "Spy" || !act.targetId) return;
    //   if (!isActive(actorId) || !isActive(act.targetId)) return;

    //   const target = players.find((p) => p.id === act.targetId);
    //   if (!target) return;

    //   // If target is actor's true target -> success
    //   if (actor.target === target.name) {
    //     actionResults.push({
    //       actorName: actor.name,
    //       actorFakeName: actor.fakeName,
    //       action: "extracted information from",
    //       targetName: target.name,
    //       targetFakeName: target.fakeName,
    //       result: "successfully obtained secrets",
    //     });

    //     const echo: Echo = {
    //       id: `echo-extract-${state.round}-${actorId}`,
    //       content: `${actor.fakeName} extracted secret from ${target.fakeName}`,
    //       type: "RoleHint",
    //       isTruth: true,
    //       round: state.round,
    //     };
    //     setEchoes((prev) => [...prev, echo]);
    //   } else {
    //     // Spy caught
    //     players = players.map((p) =>
    //       p.id === actorId ? { ...p, isRevealed: true } : p
    //     );

    //     actionResults.push({
    //       actorName: actor.name,
    //       actorFakeName: actor.fakeName,
    //       action: "attempted to extract from",
    //       targetName: target.name,
    //       targetFakeName: target.fakeName,
    //       result: "was caught and revealed",
    //     });

    //     // If no assassin or more spies remain -> game ends (Guests win)
    //     const remainingSpies = players.filter(
    //       (p) => p.role === "Spy" && !p.isRevealed
    //     );
    //     const remainingAssassins = players.filter(
    //       (p) => p.role === "Assassin" && !p.isRevealed
    //     );
    //     if (remainingAssassins.length === 0 && remainingSpies.length <= 1) {
    //       winner = "Guests";
    //       phase = "game-over";
    //     }
    //   }
    // });

    return {
      ...state,
      players,
      winner,
      phase: phase || state.phase,
      actions: {},
      actionResults,
    };
  }, []);

  // Start action phase (between results and next round)
  const startActionPhase = useCallback(() => {
    if (!isHost) return;

    // Only active (not revealed) players can act
    setGameState((prev) => ({
      ...prev,
      phase: "action",
      timeRemaining: DEFAULT_GAME_CONFIG.actionDuration,
      actions: {},
    }));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.phase !== "action") {
          clearInterval(timerRef.current!);
          return prev;
        }
        if (prev.timeRemaining <= 0) {
          clearInterval(timerRef.current!);
          // Process actions then transition to results phase to show action summary
          const processed = processActions(prev);
          if (processed.winner && processed.phase === "game-over") {
            return processed;
          }
          // Show action results for 5 seconds before starting next round
          setTimeout(() => {
            startRound();
          }, 5000);
          return { ...processed, phase: "results", timeRemaining: 5 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [isHost, processActions, startRound]);

  // Players submit actions during action phase
  const submitAction = useCallback(
    (
      playerId: string,
      action: { type: "watch" | "assassinate" | "extract"; targetId?: string }
    ) => {
      setGameState((prev) => {
        if (prev.phase !== "action") return prev;
        const next = {
          ...prev,
          actions: { ...(prev.actions || {}), [playerId]: action },
        };

        // If all eligible players submitted, process early
        const activePlayers = next.players.filter((p) => !p.isRevealed);
        const actors = activePlayers.filter(
          (p) => p.role === "Watcher" || p.role === "Assassin"
        );
        const submittedCount = Object.keys(next.actions || {}).length;
        if (submittedCount >= actors.length) {
          // process immediately, then transition to results phase to show action summary
          const processed = processActions(next);
          if (processed.winner && processed.phase === "game-over") {
            return processed;
          }
          // Show action results for 5 seconds before starting next round
          setTimeout(() => {
            startRound();
          }, 5000);
          return { ...processed, phase: "results", timeRemaining: 5 };
        }
        return next;
      });
    },
    [processActions, startRound]
  );

  const startVotingPhase = useCallback(() => {
    if (!isHost) return;

    setGameState((prev) => ({
      ...prev,
      phase: "voting",
      timeRemaining: DEFAULT_GAME_CONFIG.votingDuration,
      votes: {},
    }));

    // Start voting timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.phase !== "voting") {
          clearInterval(timerRef.current!);
          return prev;
        }

        if (prev.timeRemaining <= 0) {
          clearInterval(timerRef.current!);
          return processVotingResults(prev);
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  }, [isHost]);

  const processVotingResults = useCallback((gameState: GameState) => {
    const activePlayers = gameState.players.filter((p) => !p.isRevealed);
    const totalVotes = Object.keys(gameState.votes).length;
    const totalActivePlayers = activePlayers.length;

    // If everyone voted or timer expired, process results
    if (totalVotes >= totalActivePlayers || gameState.timeRemaining <= 0) {
      // Count votes
      const voteCounts: Record<string, number> = {};
      Object.values(gameState.votes).forEach((targetId) => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      });

      // Find player with most votes
      let revealedPlayerId: string | undefined;
      let maxVotes = 0;

      Object.entries(voteCounts).forEach(([playerId, votes]) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          revealedPlayerId = playerId;
        }
      });

      // If there's a tie, randomly select one
      if (!revealedPlayerId) {
        const tiedPlayers = Object.entries(voteCounts)
          .filter(([_, votes]) => votes === maxVotes)
          .map(([playerId]) => playerId);

        if (tiedPlayers.length > 0) {
          revealedPlayerId =
            tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
        }
      }

      // Mark player as revealed
      const updatedPlayers = gameState.players.map((player) =>
        player.id === revealedPlayerId
          ? { ...player, isRevealed: true }
          : player
      );

      // Check win conditions
      const activePlayers = updatedPlayers.filter((p) => !p.isRevealed);
      const spies = activePlayers.filter((p) => p.role === "Spy");
      const assassins = activePlayers.filter((p) => p.role === "Assassin");
      const revealedPlayerName = gameState.players.find(
        (p) => p.id === revealedPlayerId
      )?.name;

      let winner: string | undefined;
      let gamePhase: GameState["phase"] = "results";

      // Check if all spies and assassins are eliminated (Guests/Watchers win)
      if (spies.length === 0 && assassins.length === 0) {
        winner = "Guests";
        gamePhase = "game-over";
      }

      // Check if spy revealed their target
      else if (revealedPlayerId && spies.length > 0) {
        const spy = spies.find((a) => a.target === revealedPlayerName);
        if (spy) {
          winner = "Spy";
          gamePhase = "game-over";
        }
      }
      // Check if only 2 players remain
      else if (activePlayers.length === 2) {
        const [player1, player2] = activePlayers;

        // Spy vs their target
        if (player1.role === "Spy" && player1.target === player2.name) {
          winner = "Spy";
          gamePhase = "game-over";
        } else if (player2.role === "Spy" && player2.target === player1.name) {
          winner = "Spy";
          gamePhase = "game-over";
        }

        // Only guests and watchers remain
        else if (
          (player1.role === "Guest" || player1.role === "Watcher") &&
          (player2.role === "Guest" || player2.role === "Watcher")
        ) {
          winner = "Guests";
          gamePhase = "game-over";
        }
      }

      return {
        ...gameState,
        phase: gamePhase,
        players: updatedPlayers,
        revealedPlayer: revealedPlayerId,
        winner,
        timeRemaining: 0,
      };
    }

    return gameState;
  }, []);

  const castVote = useCallback(
    (targetId: string, voterId: string) => {
      setGameState((prev) => {
        const newState = {
          ...prev,
          votes: { ...prev.votes, [voterId]: targetId },
        };

        // Check if everyone has voted
        const activePlayers = prev.players.filter((p) => !p.isRevealed);
        const totalVotes = Object.keys(newState.votes).length;
        const totalActivePlayers = activePlayers.length;

        if (totalVotes >= totalActivePlayers) {
          // Process voting results immediately
          return processVotingResults(newState);
        }

        return newState;
      });
    },
    [processVotingResults]
  );

  const sendPrivateMessage = useCallback(
    (message: PrivateMessage) => {
      if (
        messagesSentThisRound[message.fromId] >=
        DEFAULT_GAME_CONFIG.maxPrivateMessagesPerRound
      ) {
        throw new Error("Maximum messages per round reached");
      }

      setPrivateMessages((prev) => [...prev, message]);
      setMessagesSentThisRound((prev) => ({
        ...prev,
        [message.fromId]: (prev[message.fromId] || 0) + 1,
      }));
    },
    [messagesSentThisRound]
  );

  const addPlayer = useCallback((player: Player) => {
    setGameState((prev) => ({
      ...prev,
      players: [...prev.players, { ...player, isRevealed: false }],
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
      setGameState((prev) => ({
        ...prev,
        phase: "action",
        timeRemaining: DEFAULT_GAME_CONFIG.actionDuration,
      }));
      startRound();
    }, 5000);
  }, [gameState.players, isHost, assignRoles, startRound]);

  return {
    gameState,
    echoes,
    privateMessages,
    messagesSentThisRound,
    actions: {
      generateRoomId,
      addPlayer,
      removePlayer,
      startGame,
      startRound,
      startActionPhase,
      startVotingPhase,
      submitAction,
      castVote,
      sendPrivateMessage,
      setGameState,
    },
  };
};
