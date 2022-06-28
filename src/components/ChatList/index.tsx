import React, { forwardRef, MutableRefObject, useCallback, useRef } from 'react'
import { IDM } from '../../typings/db';
import Chat from '../Chat';
import { ChatZone, Section, StickyHeader } from './styles';
import { Scrollbars } from "react-custom-scrollbars-2";
import { InfiniteQueryObserverResult } from 'react-query';
interface Props {
  chatSections:{[key:string]:IDM[]}
  fetchNext : () => Promise<InfiniteQueryObserverResult>
  isReachingEnd :boolean
}


const ChatList = forwardRef<Scrollbars, Props>(({chatSections, fetchNext, isReachingEnd}, ref) => {
  const onScroll = useCallback((values:any) => {
    console.log('scroll',values)
    if(values.scrollTop === 0 && !isReachingEnd){
      console.log('가장 위')
      fetchNext().then(()=> {
        const current = (ref as MutableRefObject<Scrollbars>)?.current;

        if(current){
          setTimeout(() => {
            current.scrollTop(current.getScrollHeight() - values.scrollHeight)
          }, 0);
        }
      })
    }
  }, [fetchNext, isReachingEnd, ref]);
  console.log(chatSections,'sections')
  return (
    <ChatZone>
    <Scrollbars autoHide ref={ref} onScrollFrame={onScroll}>
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
  )
})

export default ChatList