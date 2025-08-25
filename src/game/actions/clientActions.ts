import { PrivateMessage } from "@/types/game";

export const joinGame = (
  sendToHost: (action: any) => Promise<boolean>,
  playerName: string
) => {
  return sendToHost({
    type: "player-join",
    playerName,
  });
};

export const castVote = (
  sendToHost: (action: any) => Promise<boolean>,
  targetId: string
) => {
  return sendToHost({
    type: "vote-cast",
    targetId,
  });
};

export const sendPrivateMessage = (
  sendToHost: (action: any) => Promise<boolean>,
  message: PrivateMessage
) => {
  return sendToHost({
    type: "private-message",
    message,
  });
};

export const submitAction = (
  sendToHost: (action: any) => Promise<boolean>,
  playerId: string,
  action: { type: "watch" | "assassinate" | "extract"; targetId?: string }
) => {
  return sendToHost({
    type: "action-submit",
    playerId,
    action,
  });
};
