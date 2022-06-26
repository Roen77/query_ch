import React, { useCallback, useState } from "react";
import { useQuery } from "react-query";
import { NavLink, useParams } from "react-router-dom";
import { IChannel, IDM, IUser } from "../../typings/db";
import fetcher from "../../utils/fetcher";
import { CollapseButton } from "../DMList/styles";
import { ChatZone } from "./styles";

interface Props {
  chatData: IDM[];
}

function ChatList({ chatData }: Props) {
  const { workspace } = useParams<{ workspace?: string }>();
  const { data: userData } = useQuery<IUser | false>(
    "user",
    () => fetcher({ queryKey: "/api/users", log: "workspace - chatList-user" }),
    {}
  );
  const { data: channelData } = useQuery<IChannel[]>(
    ["workspace", workspace, "channel"],
    () =>
      fetcher({
        queryKey: `/api/workspaces/${workspace}/channels`,
        log: "workspace - chatList-channel",
      }),
    {
      enabled: !!userData,
    }
  );
  const [channelCollapse, setChannelCollapse] = useState(false);

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  return <ChatZone></ChatZone>;
}

export default ChatList;
