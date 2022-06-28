import React, { useCallback } from "react";
import { useQuery } from "react-query";
import ChannelList from "../../components/ChannelList";
import ChatBox from "../../components/ChatBox";
import useInput from "../../hooks/useInput";
import fetcher from "../../utils/fetcher";
import { Container, Header } from "./styles";

function Channel() {

  const [chat,onChangeChat, setChat] = useInput("")

  const onSubmitForm = useCallback((e:React.FormEvent)=>{
    e.preventDefault();
    setChat("");
  },[])
  return (
    <Container>
      <Header>채널!</Header>
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
    </Container>
  );
}

export default Channel;
