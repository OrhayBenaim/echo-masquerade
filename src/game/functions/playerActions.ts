import { Player } from "@/types/game";

export const handlePlayerJoin = (
  action: any,
  peerId: string,
  isHost: boolean,
  gameActions: any
) => {
  const newPlayer: Player = {
    id: peerId,
    name: action.playerName,
    isHost: isHost,
    isAlive: true,
  };

  gameActions.addPlayer(newPlayer);
};
