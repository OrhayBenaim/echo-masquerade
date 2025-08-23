import { Player } from "@/types/game";
import { faker } from "@faker-js/faker";

export const handlePlayerJoin = (
  action: any,
  peerId: string,
  isHost: boolean,
  gameActions: any
) => {
  const newPlayer: Player = {
    id: peerId,
    name: action.playerName,
    fakeName: faker.book.author() || "host",
    isHost: isHost,
    isAlive: true,
  };

  gameActions.addPlayer(newPlayer);
};
