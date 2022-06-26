import React, { useCallback, useState } from "react";
import { useQuery } from "react-query";
import { NavLink, useParams } from "react-router-dom";
import { IChannel, IDM, IUser } from "../../typings/db";
import fetcher from "../../utils/fetcher";
import Chat from "../Chat";
import { CollapseButton } from "../DMList/styles";
import { ChatZone } from "./styles";

interface Props {
  chatData?: IDM[];
}

function ChatList({ chatData }: Props) {
  console.log(chatData, "ccccccccccccc");
  return (
    <ChatZone>
      {chatData?.map((chat) => (
        <Chat key={chat.id} data={chat} />
      ))}
    </ChatZone>
  );
}

export default ChatList;
