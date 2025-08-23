import { Player } from '@/types/game';

export const handlePlayerJoin = (action: any, peerId: string, gameActions: any) => {
  const newPlayer: Player = {
    id: peerId,
    name: action.playerName,
    isHost: false,
    isAlive: true
  };
  
  gameActions.addPlayer(newPlayer);
};