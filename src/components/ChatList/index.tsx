import React, { useCallback, useRef } from "react";
import { IChannel, IDM, IUser } from "../../typings/db";
import Chat from "../Chat";
import { ChatZone, Section, StickyHeader } from "./styles";
import { Scrollbars } from "react-custom-scrollbars-2";

interface Props {
  chatSections: { [key: string]: IDM[] };
}

function ChatList({ chatSections }: Props) {
  const scrollbarRef = useRef(null);
  const onScroll = useCallback(() => {}, []);
  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
}

export default ChatList;
