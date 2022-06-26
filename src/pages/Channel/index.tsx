import React, { useCallback } from "react";
import { useQuery } from "react-query";
import ChatBox from "../../components/ChatBox";
import useInput from "../../hooks/useInput";
import fetcher from "../../utils/fetcher";
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
