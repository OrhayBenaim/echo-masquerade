import { useClient } from "./useClient";
import { useHost } from "./useHost";

type PeerConnectionProps = {
  isHost: boolean;
  roomId: string;
};

export const usePeerConnection = ({ isHost, roomId }: PeerConnectionProps) => {
  const hostHook = useHost(roomId, isHost);

  const clientHook = useClient(roomId, isHost);

  const gameHook = isHost ? hostHook : clientHook;

  return gameHook;
};
