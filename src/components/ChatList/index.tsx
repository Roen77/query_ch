import React, { useCallback, useRef } from "react";
import { IChannel, IDM, IUser } from "../../typings/db";
import Chat from "../Chat";
import { ChatZone } from "./styles";
import { Scrollbars } from "react-custom-scrollbars-2";

interface Props {
  chatData?: IDM[];
}

function ChatList({ chatData }: Props) {
  console.log(chatData, "ccccccccccccc");
  const scrollbarRef = useRef(null);
  const onScroll = useCallback(() => {}, []);
  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {chatData?.map((chat) => (
          <Chat key={chat.id} data={chat} />
        ))}
      </Scrollbars>
    </ChatZone>
  );
}

export default ChatList;
