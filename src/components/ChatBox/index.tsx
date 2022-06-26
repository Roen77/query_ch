import React, { useCallback, useEffect, useRef } from "react";
import {
  ChatArea,
  EachMention,
  Form,
  MentionsTextarea,
  SendButton,
  Toolbox,
} from "./styles";
import autosize from "autosize";
import { Mention, SuggestionDataItem } from "react-mentions";
import { useQuery } from "react-query";
import { IUser } from "../../typings/db";
import fetcher from "../../utils/fetcher";
import { useParams } from "react-router-dom";
import gravatar from "gravatar";

interface Props {
  chat: string;
  onSubmitForm: (e: any) => void;
  onChangeChat: (e: any) => void;
  placeholder?: string;
}

function ChatBox({ chat, onSubmitForm, onChangeChat, placeholder }: Props) {
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData } = useQuery<IUser | false>(
    "user",
    () => fetcher({ queryKey: "/api/users" }),
    {}
  );
  const { data: memberData } = useQuery<IUser[]>(
    ["workspace", workspace, "member"],
    () => fetcher({ queryKey: `/api/workspaces/${workspace}/members` }),
    {
      enabled: !!userData,
    }
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeydownChat = useCallback(
    (e: any) => {
      console.log("key chatbox", e.key, e.key === "Enter");
      if (e.key === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [onSubmitForm]
  );

  const renderSuggestion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focus: boolean
    ): React.ReactNode => {
      if (!memberData) return;
      return (
        <EachMention focus={focus}>
          <img
            src={gravatar.url(memberData[index].email, {
              s: "20px",
              d: "retro",
            })}
            alt={memberData[index].nickname}
          />
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [memberData]
  );
  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeydownChat}
          placeholder={placeholder}
          //@ts-ignore
          inputRef={textareaRef}
          allowSuggestionsAboveCursor
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={
              memberData?.map((v) => ({
                id: String(v.id),
                display: String(v.nickname),
              })) || []
            }
            renderSuggestion={renderSuggestion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={
              "c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send" +
              (chat?.trim() ? "" : " c-texty_input__button--disabled")
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i
              className="c-icon c-icon--paperplane-filled"
              aria-hidden="true"
            />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
}

export default ChatBox;
