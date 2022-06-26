import io from "socket.io-client";
import { useCallback } from "react";

const backUrl = "http://localhost:3105";

const sockets: { [key: string]: SocketIOClient.Socket } = {};
const useSocket = (
  workspace?: string
): [SocketIOClient.Socket | undefined, () => void] => {
  //   console.log("rerender", workspace);
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);
  if (!workspace) {
    return [undefined, disconnect];
  }
  if (!sockets[workspace]) {
    console.log("소켓연결");
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ["websocket"],
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
