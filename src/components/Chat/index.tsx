import React, { memo, useMemo } from "react";
import { IChat, IDM } from "../../typings/db";
import { ChatWrapper } from "./styles";
import gravatar from "gravatar";
import dayjs from "dayjs";
import regexifyString from "regexify-string";
import { Link, useParams } from "react-router-dom";

interface Props {
  data: IDM | IChat;
}

function Chat({ data }: Props) {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const user = "Sender" in data ? data.Sender : data.User;
  //캐싱을 하고 캐싱을 풀 조건을 디펜던시에 적어준다고 생각하면 됨
  const result = useMemo(
    () =>
      regexifyString({
        input: data.content,
        // 모든 글자 한개 이상
        // \d는 숫자, +는 1개 이상 ?는 0개나 1개, * 이 0개이상 g는 모두 찾기
        //|\n/g, 에서 | 는 또는을 의미하고 \n은 줄바꿈
        pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
        decorator(match, index) {
          const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;
          if (arr) {
            return (
              <Link
                key={match + index}
                to={`/workspace/${workspace}/dm/${arr[2]}`}
              >
                @{arr[1]}
              </Link>
            );
          }
          return <br key={index} />;
        },
      }),
    [data.content, workspace]
  );
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
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
}

export default memo(Chat);
