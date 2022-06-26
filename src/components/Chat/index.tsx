import React from "react";
import { IChat, IDM } from "../../typings/db";
import { ChatWrapper } from "./styles";
import gravatar from "gravatar";
import dayjs from "dayjs";

interface Props {
  data: IDM | IChat;
}

function Chat({ data }: Props) {
  const user = "Sender" in data ? data.Sender : data.User;
  return (
    <ChatWrapper>
      <div className="chat-img">
        <img
          src={gravatar.url(user.email, { s: "36px", d: "retro" })}
          alt={user.nickname}
        />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format("h:mm A")}</span>
        </div>
        <p>{data.content}</p>
      </div>
    </ChatWrapper>
  );
}

export default Chat;
