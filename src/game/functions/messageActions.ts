import { PrivateMessage } from '@/types/game';

export const handlePrivateMessage = (action: any, peerId: string, gameActions: any) => {
  const message: PrivateMessage = {
    ...action.message,
    fromId: peerId // Ensure the sender ID is set by the host
  };
  
  try {
    gameActions.sendPrivateMessage(message);
    console.log(`Private message from ${peerId} to ${message.toId}`);
  } catch (error) {
    console.error('Failed to handle private message:', error);
  }
};