import { PrivateMessage } from '@/types/game';

export const joinGame = (sendToHost: (action: any) => boolean, playerName: string) => {
  return sendToHost({
    type: 'player-join',
    playerName
  });
};

export const castVote = (sendToHost: (action: any) => boolean, targetId: string) => {
  return sendToHost({
    type: 'vote-cast',
    targetId
  });
};

export const sendPrivateMessage = (sendToHost: (action: any) => boolean, message: PrivateMessage) => {
  return sendToHost({
    type: 'private-message',
    message
  });
};