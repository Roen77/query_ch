import { AxiosError } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "react-query";
import { Navigate, useParams } from "react-router-dom";
import request from "../../api/api";
import ChannelList from "../../components/ChannelList";
import ChatBox from "../../components/ChatBox";
import ChatList from "../../components/ChatList";
import useInput from "../../hooks/useInput";
import useSocket from "../../hooks/useSocket";
import { IChannel,  IUser } from "../../typings/db";
import fetcher from "../../utils/fetcher";
import { Container, Header } from "./styles";
import _ from 'lodash'
import Scrollbar from 'react-custom-scrollbars-2'
import makeSection from "../../utils/makeSection";

function Channel() {
  const queryClient = useQueryClient();
  const scrollbarRef = useRef<Scrollbar>(null)
  const {workspace, channel} = useParams<{workspace:string;channel:string}>();
  const [socket, disconnect] = useSocket(workspace)
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const {data:myData} = useQuery("user", ()=> fetcher({queryKey:'/api/users'}))
  //현재 채널 channelData
//   {
//     "id": 1,
//     "name": "일반",
//     "private": false,
//     "createdAt": "2022-06-20T05:28:03.000Z",
//     "updatedAt": "2022-06-20T05:28:03.000Z",
//     "WorkspaceId": 1
// }
  const { data: channelData } = useQuery<IChannel>(
    ["workspace", workspace, "channel", channel, "chat"],
    () =>
      fetcher({ queryKey: `/api/workspaces/${workspace}/channels/${channel}` })
  );
  const {data:chatData, fetchNextPage} = useInfiniteQuery( ["workspace", workspace, "channels", channel, "chat"], ({pageParam = 0})=> fetcher({ queryKey: `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${
    pageParam + 1
  }`}),{
    getNextPageParam:(lastPage:any, pages:any) => {
      if(lastPage.length === 0) return
      return pages.length
    }
  })

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

    const mutation = useMutation<IChannel,AxiosError,{content:string}>(data => {
      return request.post(`/api/workspaces/${workspace}/channels/${channel}/chats`,{content:data.content},{withCredentials:true})
    },{
      onMutate(mutateData:any){
      queryClient.setQueryData(["workspace", workspace, "channels", channel, "chat"], (data:any) => {
        const newPages = _.cloneDeep(data?.pages) || [];
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

      })

      setChat("");
        scrollbarRef.current?.scrollToBottom();
      }, onError(error: any) {
        console.error(error, "error");
      },
      onSuccess() {
        localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        queryClient.refetchQueries([
          "workspace",
          workspace,
          "channels",
          channel,
          "chat",
        ]);
      },
    })

    console.log("channel",channelData)
  const [chat,onChangeChat, setChat] = useInput("")

  useEffect(() => {
    localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
  }, [workspace, channel]);


  const onClickInviteChannel = useCallback(()=>{},[])

  const onSubmitForm = useCallback((e:React.FormEvent)=>{
    e.preventDefault();
    if (chat?.trim() && chatData && channelData) {
      mutation.mutate({ content: chat });
    }
  },[mutation,chat,chatData,channelData])

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
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
    </Container>
  );
}

export default Channel;
