export const handleVoteCast = (action: any, peerId: string, gameActions: any) => {
  gameActions.castVote(action.targetId, peerId);
  console.log(`Vote cast by ${peerId} for ${action.targetId}`);
};