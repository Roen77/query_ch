import React from 'react'
import { ChatZone, Section, StickyHeader } from './styles';

function ChatList() {
  return (
    <ChatZone>
    {/* <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
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
    </Scrollbars> */}
  </ChatZone>
  )
}

export default ChatList