import React, {
  forwardRef,
  MutableRefObject,
  useCallback,
  useRef,
} from "react";
import { IChannel, IChat, IDM, IUser } from "../../typings/db";
import Chat from "../Chat";
import { ChatZone, Section, StickyHeader } from "./styles";
import { Scrollbars } from "react-custom-scrollbars-2";
import { InfiniteQueryObserverResult } from "react-query";

interface Props {
  chatSections: { [key: string]: (IDM | IChat)[] };
  fetchNext: () => Promise<InfiniteQueryObserverResult>;
  isReachingEnd: boolean;
}

const ChatList = forwardRef<Scrollbars, Props>(
  ({ chatSections, fetchNext, isReachingEnd }, scrollRef) => {
    const onScroll = useCallback(
      (values: any) => {
        console.log("scroll", values.scrollHeight);
        if (values.scrollTop === 0 && !isReachingEnd) {
          fetchNext().then(() => {
            // 스크롤 위치 유지
            const current = (scrollRef as MutableRefObject<Scrollbars>)
              ?.current;
            console.log(
              "가장 위",
              current.getScrollHeight(),
              values.scrollHeight
            );
            if (current) {
              setTimeout(() => {
                //settimeout으로 딜레이줌..
                current.scrollTop(
                  current.getScrollHeight() - values.scrollHeight
                );
              }, 0);
            }
          });
        }
      },

      [fetchNext, scrollRef, isReachingEnd]
    );
    return (
      <ChatZone>
        <Scrollbars
          className="ttt"
          autoHide
          ref={scrollRef}
          onScrollFrame={onScroll}
        >
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
);

export default ChatList;
