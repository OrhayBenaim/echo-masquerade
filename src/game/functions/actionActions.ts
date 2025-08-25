export const handleActionSubmit = (
  action: any,
  peerId: string,
  gameActions: any
) => {
  console.log(`Host received action: ${action.type} from ${peerId}`);
  gameActions.submitAction(action.playerId, action.action);
};
