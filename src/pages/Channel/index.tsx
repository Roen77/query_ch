import React, { useCallback, useEffect, useRef, useState } from "react";
import { Container, Header } from "./styles";
import gravatar from "gravatar";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import useInput from "../../hooks/useInput";
import { Navigate, useParams } from "react-router-dom";
import fetcher from "../../utils/fetcher";
import ChatBox from "../../components/ChatBox";
import { IChannel, IChat, IDM, IUser } from "../../typings/db";
import { AxiosError } from "axios";
import request from "../../api/api";
import ChatList from "../../components/ChatList";
import makeSection from "../../utils/makeSection";
import Scrollbars from "react-custom-scrollbars-2";
import useSocket from "../../hooks/useSocket";
import { toast } from "react-toastify";
function Channel() {
  const queryClient = useQueryClient();
  const scrollbarRef = useRef<Scrollbars>(null);
  const { workspace, channel } = useParams<{
    workspace: string;
    channel: string;
  }>();
  const [socket] = useSocket(workspace);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const { data: myData } = useQuery("user", () =>
    fetcher({ queryKey: "/api/users" })
  );

  const { data: channelData } = useQuery<IChannel>(
    ["workspace", workspace, "channel", channel, "chat"],
    () =>
      fetcher({ queryKey: `/api/workspaces/${workspace}/channels/${channel}` })
  );

  const [chat, onChangeChat, setChat] = useInput("");
  console.log("chaneldata", channelData);
  const {
    data: chatData,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<IChat[]>(
    ["workspace", workspace, "channel", channel, "chat", 1],
    ({ pageParam = 0 }: any) =>
      fetcher({
        // queryKey: `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
        queryKey: `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${
          pageParam + 1
        }`,
      }),
    {
      getNextPageParam: (lastPage: any, pages: any) => {
        console.log("다음 파라미터", lastPage, pages.length);
        if (lastPage.length === 0) return;
        return pages.length;
      },
    }
  );
  const { data: channelMembersData } = useQuery<IUser[]>(
    ["workspace", workspace, "channel", channel, "member"],
    () =>
      fetcher({
        queryKey: `/api/workspaces/${workspace}/channels/${channel}/members`,
      }),
    {
      enabled: !!myData,
    }
  );
  const isEmpty = chatData?.pages[0]?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (chatData && chatData?.pages[chatData?.pages.length - 1]?.length < 20) ||
    false;

  // const { mutate, isLoading, isError, error, isSuccess } = useMutation(newTodo => {
  //   return axios.post<TodoType>('/todos', newTodo);
  // });

  const mutation = useMutation<IDM, AxiosError, { content: string }>(
    (data) => {
      return request.post(
        `/api/workspaces/${workspace}/channels/${channel}/chats`,
        {
          content: data.content,
        },
        { withCredentials: true }
      );
    },
    {
      onMutate(mutateData: any) {
        queryClient.setQueryData<InfiniteData<IDM[]>>(
          ["workspace", workspace, "channel", channel, "chat", 1],
          //@ts-ignore
          (data: any) => {
            console.log(data?.pageParams, "datatat mutatettatmtmt params");
            const newPages = data?.pages.slice() || [];
            newPages[0].unshift({
              id: (data?.pages[0][0]?.id || 0) + 1,
              content: mutateData.content,
              UserId: myData.id,
              User: myData,
              ChannelId: (channelData as IChannel).id,
              Channel: channelData,
              createdAt: new Date(),
            });
            return {
              pageParams: data?.pageParams || [],
              pages: newPages,
            };
          }
        );
        setChat("");
        scrollbarRef.current?.scrollToBottom();
      },
      onError(error: any) {
        console.error(error, "error");
      },
      onSuccess() {
        queryClient.refetchQueries([
          "workspace",
          workspace,
          "channel",
          channel,
          "chat",
          1,
        ]);
      },
    }
  );

  const onMessage = useCallback(
    (data: IChat) => {
      // id는 상대방 아이디
      if (
        data.Channel.name === channel &&
        (data.content.startsWith("uploads\\") || data.UserId !== myData?.id)
      ) {
        queryClient.setQueryData<InfiniteData<IChat[]>>(
          ["workspace", workspace, "channel", channel, "chat", 1],
          (prev) => {
            const newPages = prev?.pages.slice() || [];
            newPages[0].unshift(data);
            return {
              pageParams: prev?.pageParams || [],
              pages: newPages,
            };
          }
        );
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() +
              scrollbarRef.current.getScrollTop() +
              150
          ) {
            console.log("scrollToBottom!", scrollbarRef.current?.getValues());
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 50);
          }
        }
      }
    },
    [channel, myData, queryClient, workspace]
  );

  useEffect(() => {
    socket?.on("message", onMessage);
    return () => {
      socket?.off("message", onMessage);
    };
  }, [socket, onMessage]);

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.pages.length === 1) {
      console.log("toBottomWhenLoaded", scrollbarRef.current);
      setTimeout(() => {
        console.log("scrollbar", scrollbarRef.current);
        scrollbarRef.current?.scrollToBottom();
      }, 500);
    }
  }, [chatData]);

  const onSubmitForm = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log(chat, "ccc");
      if (chat?.trim() && chatData && channelData) {
        mutation.mutate({ content: chat });
      }
    },

    [mutation, chat, chatData, channelData]
  );

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const chatSections = makeSection(
    chatData ? chatData.pages.flat().reverse() : []
  );

  if (!myData) {
    return null;
  }

  if (!channelData) {
    return <Navigate to={`/workspace/${workspace}/channel/일반`} />;
  }

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i
              className="c-icon p-ia__view_header__button_icon c-icon--add-user"
              aria-hidden="true"
            />
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        fetchNext={fetchNextPage}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox
        chat={chat}
        onChangeChat={onChangeChat}
        onSubmitForm={onSubmitForm}
      />
    </Container>
  );
}

export default Channel;
