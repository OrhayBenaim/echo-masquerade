export const handleSkipRound = (
  action: any,
  peerId: string,
  gameActions: any
) => {
  console.log(`Host received skip-round action from ${peerId}`);
  gameActions.registerSkipRound(action.playerId);
};
