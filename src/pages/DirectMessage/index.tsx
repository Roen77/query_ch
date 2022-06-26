import React, { useCallback } from "react";
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
function DirectMessage() {
  const queryClient = useQueryClient();
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
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
    ({ pageParam }: any) =>
      fetcher({
        queryKey: `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
        // queryKey: `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${
        //   pageParam + 1
        // }`,
      }),
    {
      getNextPageParam: (lastPage: any, pages: any) => {
        if (lastPage.length === 0) return;
        return pages.length;
      },
    }
  );
  const [chat, onChangeChat, setChat] = useInput("");

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
          (data: any) => {
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
            console.log("data 확인", newPages);
            return {
              pageParams: data?.pageParams || [],
              pages: newPages,
            };
          }
        );
        setChat("");
        // scrollbarRef.current?.scrollToBottom();
      },
      onError(error: any) {
        console.error(error, "error");
      },
      onSuccess() {
        queryClient.refetchQueries(["workspace", workspace, "dm", id, "chat"]);
      },
    }
  );

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
        //     queryClient.refetchQueries([
        //       "workspace",
        //       workspace,
        //       "dm",
        //       id,
        //       "chat",
        //     ]);
        //     setChat("");
        //   })
        //   .catch((err) => console.log("err", err));
      }
    },

    [mutation, chat, chatData]
  );
  console.log("chatdata", chatData);
  if (!userData || !myData) {
    return null;
  }
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
        //@ts-ignore
        chatData={chatData.pages[0]}
        // chatSections={chatSections}
        // ref={scrollbarRef}
        // fetchNext={fetchNextPage}
        // isReachingEnd={isReachingEnd}
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
