import React, { useCallback, useEffect, useRef } from "react";
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
import { useParams } from "react-router-dom";
import fetcher from "../../utils/fetcher";
import ChatBox from "../../components/ChatBox";
import { IDM } from "../../typings/db";
import { AxiosError } from "axios";
import request from "../../api/api";
import ChatList from "../../components/ChatList";
import makeSection from "../../utils/makeSection";
import Scrollbars from "react-custom-scrollbars-2";
import useSocket from "../../hooks/useSocket";
import { toast } from "react-toastify";
function DirectMessage() {
  const queryClient = useQueryClient();
  const scrollbarRef = useRef<Scrollbars>(null);
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const [socket] = useSocket(workspace);
  const { data: userData } = useQuery(
    ["workspace", workspace, "users", id],
    () => fetcher({ queryKey: `/api/workspaces/${workspace}/users/${id}` })
  );
  const { data: myData } = useQuery("user", () =>
    fetcher({ queryKey: "/api/users" })
  );

  const {
    data: chatData,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<IDM[]>(
    ["workspace", workspace, "dm", id, "chat"],
    ({ pageParam = 0 }: any) =>
      fetcher({
        // queryKey: `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
        queryKey: `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${
          pageParam + 1
        }`,
      }),
    {
      getNextPageParam: (lastPage: any, pages: any) => {
        console.log("다음 파라미터", lastPage, pages.length);
        if (lastPage.length === 0) return;
        return pages.length;
      },
      // staleTime: 5000,
    }
  );
  const [chat, onChangeChat, setChat] = useInput("");
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
        `/api/workspaces/${workspace}/dms/${id}/chats`,
        {
          content: data.content,
        },
        { withCredentials: true }
      );
    },
    {
      onMutate(mutateData: any) {
        queryClient.setQueryData<InfiniteData<IDM[]>>(
          ["workspace", workspace, "dm", id, "chat"],
          //@ts-ignore
          (data: any) => {
            console.log(data?.pageParams, "datatat mutatettatmtmt params");
            const newPages = data?.pages.slice() || [];
            newPages[0].unshift({
              id: (data?.pages[0][0]?.id || 0) + 1,
              content: mutateData.content,
              SenderId: myData.id,
              Sender: myData,
              ReceiverId: userData.id,
              Receiver: userData,
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
        //캐시된 모든 페이지의 데이터를 가져옴...??
        // queryClient.refetchQueries(["workspace", workspace, "dm", id, "chat"]);
      },
    }
  );

  const onMessage = useCallback(
    (data: IDM) => {
      // id는 상대방 아이디
      if (data.SenderId === Number(id) && myData.id !== Number(id)) {
        queryClient.setQueryData<InfiniteData<IDM[]>>(
          ["workspace", workspace, "dm", id, "chat"],
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
            }, 100);
          } else {
            toast.success("새 메시지가 도착했습니다.", {
              onClick() {
                scrollbarRef.current?.scrollToBottom();
              },
              closeOnClick: true,
            });
          }
        }
      }
    },
    [workspace, id, myData.id, queryClient]
  );

  useEffect(() => {
    socket?.on("dm", onMessage);
    console.log("socket dm", onMessage);
    return () => {
      socket?.off("dm", onMessage);
    };
  }, [socket, onMessage]);

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.pages.length === 1) {
      setTimeout(() => {
        scrollbarRef.current?.scrollToBottom();
      }, 100);
    }
  }, [chatData]);

  const onSubmitForm = useCallback(
    (e: any) => {
      e.preventDefault();
      console.log(chat, "ccc");
      if (chat?.trim() && chatData) {
        mutation.mutate({ content: chat });
        // request
        //   .post(
        //     `/api/workspaces/${workspace}/dms/${id}/chats`,
        //     {
        //       content: chat,
        //     },
        //     { withCredentials: true }
        //   )
        //   .then(() => {
        //     // queryClient.refetchQueries([
        //     //   "workspace",
        //     //   workspace,
        //     //   "dm",
        //     //   id,
        //     //   "chat",
        //     // ]);
        //     // setChat("");
        //   })
        //   .catch((err) => console.log("err", err));
      }
    },

    [mutation, chat, chatData]
  );
  if (!userData || !myData) {
    return null;
  }

  const chatSections = makeSection(
    chatData ? chatData.pages.flat().reverse() : []
  );
  console.log(chatData, "chatdata  dddddd");
  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(userData.email, { s: "24px", d: "retro" })}
          alt={userData.nickname}
        />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        // //@ts-ignore
        // chatData={chatData?.pages[0] || []}
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

export default DirectMessage;
