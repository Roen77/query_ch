import React, { useCallback } from "react";
import ChatBox from "../../components/ChatBox";
import useInput from "../../hooks/useInput";
import { Container, Header } from "./styles";

function Channel() {
  const [chat, onChangeChat, setChat] = useInput("");
  const onSubmitForm = useCallback((e: any) => {
    e.preventDefault();
    setChat("");
  }, []);
  return (
    <Container>
      <Header>채널!</Header>
      {/* <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        fetchNext={fetchNextPage}
        isReachingEnd={isReachingEnd}
      /> */}
      <ChatBox
        chat={chat}
        onChangeChat={onChangeChat}
        onSubmitForm={onSubmitForm}
      />
    </Container>
  );
}

export default Channel;
