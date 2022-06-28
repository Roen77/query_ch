import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Container, DragOver, Header } from './styles'
import gravatar from 'gravatar';
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import { useParams } from 'react-router-dom';
import fetcher from '../../utils/fetcher';
import ChatList from '../../components/ChatList';
import ChatBox from '../../components/ChatBox';
import useInput from '../../hooks/useInput';
import { IDM } from '../../typings/db';
import request from '../../api/api';
import { AxiosError } from 'axios';
import makeSection from '../../utils/makeSection';
import Scrollbars from 'react-custom-scrollbars-2'
import _ from 'lodash'
import useSocket from '../../hooks/useSocket';
import { toast, ToastContainer } from 'react-toastify';


function DirectMessage() {
  const queryClient = useQueryClient()
  const scrollbarRef = useRef<Scrollbars>(null)
  const [dragOver, setDragOver] = useState(false);
  const [chat,onChangeChat,setChat] = useInput("")
    const { workspace, id } = useParams<{ workspace: string; id: string }>();
    const [socket,disconnect] = useSocket(workspace)
    const { data: userData } = useQuery(['workspace', workspace, 'users', id], () =>
    fetcher({ queryKey: `/api/workspaces/${workspace}/users/${id}`,log:'dm-member' }),
  );
  const { data: myData } = useQuery('user', () => fetcher({ queryKey: '/api/users',log:'dm-user' }));

  //fetchNextPage를 해야 pageParam이 알아서 증가함...?
  const {data:chatData, fetchNextPage} = useInfiniteQuery<IDM[]>(["workspace", workspace,'dm',id,"chat"], ({pageParam = 0}) => fetcher({ queryKey: `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${
       pageParam + 1
     }`,log:'directMessage infinite'}), {getNextPageParam:(lastPage, pages) => {
      console.log(lastPage,'last', 'pages:', pages)
      if(lastPage.length === 0) return
      return pages.length

     }})

    //mutaion
  const mutation = useMutation<IDM,AxiosError,{content:string}>((data) =>
   request.post(
      `/api/workspaces/${workspace}/dms/${id}/chats`,
      {
        content: data.content,
      },
      { withCredentials: true }
    )
  ,{
    onError(error:any,_,context:any){
      queryClient.setQueryData(["workspace", workspace, "dm", id, "chat"], context.previousTodos)
      console.log('test err errrrr',error,context)
    },
    onMutate: async (mutateData:any) => {
      await queryClient.cancelQueries(["workspace",workspace,'dm',id,'chat'])

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(["workspace",workspace,'dm',id,'chat'])

      console.log('cccc test onMutate mutaionData',mutateData)

      // setQueryData 를 하지 않아도 작동은 잘됨
      queryClient.setQueryData<InfiniteData<IDM[]>>(["workspace",workspace,'dm',id,'chat'], (data:any) => {
        const newPages = _.cloneDeep(data?.pages) || [];
        // unshift() 메서드는 새로운 요소를 배열의 맨 앞쪽에 추가하고, 새로운 길이를 반환합니다.
        //  newPages[0] 이 최신데이터인디 다음페이지가 어떻게 쌓이는지 확인필요
        //아마 옵티미스틱 ui를...?
        newPages[0].unshift({
          id: (data?.pages[0][0]?.id || 0) + 1,
          content:mutateData.content,
          SenderId:myData.id,
          Sender:myData,
          ReceiverId:userData.id,
          Receiver:userData,
          createdAt : new Date()
        })
        console.log(newPages,'newnew')
      setTimeout(()=>{
        scrollbarRef.current?.scrollToBottom();
      },0)
      console.log(previousTodos,'prev')
        return {
          pageParams:data?.pageParams || [],
          pages:newPages,
        }
      })
      return {previousTodos}
    },
    onSettled: () => {
      console.log("test settled")
      //성공하든 실패하든 데이터 가져오기
         queryClient.refetchQueries(["workspace", workspace, "dm", id, "chat"]);
      // queryClient.invalidateQueries(["workspace", workspace, "dm", id, "chat"])
    },
    onSuccess(){
      //성공한후 챗데이터 초기화 옵티미스틱?이 되는지확인해야할듯..
      console.log("test success")
      setChat("")
      // 성공하고나서 데이터 다시 갱신
      // queryClient.refetchQueries(["workspace", workspace, "dm", id, "chat"]);
      // queryClient.invalidateQueries(["workspace", workspace, "dm", id, "chat"])
    },
  })

  const isEmpty = chatData?.pages[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData?.pages[chatData?.pages.length - 1]?.length < 20) || false;

  // 받아온데이터로 어떻게할것인가
  const onMessage = useCallback((data:IDM)=>{

    console.log('받아온 데이터?', data)
//     ReceiverId: 1
// Sender: {id: 1, email: 'a@a.com', nickname: 'ron', password: '$2b$12$NxN/LMcYZ8XiSpXtw/euYucMtJhyH1JwwwSjPjr/JpxuHGcVGpGR.', createdAt: '2022-06-21T02:13:34.000Z', …}
// SenderId: 1
// WorkspaceId: 1
// content: "내용전송"
// createdAt: "2022-06-28T02:24:51.000Z"
// id: 92
// updatedAt: "2022-06-28T02:24:51.000Z"
  // id는 상대방 아이디 즉 나아닌 다른사람일때만
  // 즉 메세지가 왔을때 갱신이 필요
if(data.SenderId === Number(id) && myData.id !== Number(id)) {
  console.log("prev dm socket완료")
  queryClient.setQueryData( ["workspace", workspace, "dm", id, "chat"], (prev:any) => {
    const newPages = _.cloneDeep(prev?.pages) || [];
    console.log('prev', newPages)
    newPages[0].unshift(data)
    return {
      pageParams:prev?.pageParams || [],
      pages:newPages
    }
  })

  if(scrollbarRef.current){
    // 요소를 끝까지 내렸는지 판별하는 법
    if(scrollbarRef.current.getScrollHeight() <
    scrollbarRef.current.getClientHeight() +
      scrollbarRef.current.getScrollTop() +
      150){
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

  },[id, myData.id, queryClient, workspace])



   useEffect(()=>{
    socket?.on('dm', onMessage)
    return () => {
      socket?.off("dm",onMessage)
    }
   },[socket, onMessage])
  //로딩시 스크롤바 제일 아래로..
  useEffect(()=> {
    if(chatData?.pages.length === 1){
      scrollbarRef.current?.scrollToBottom();
    }
  },[chatData])

  console.log(chatData,'chat 확인')
  const onSubmitForm = useCallback((e:React.FormEvent)=>{
    e.preventDefault()
    if(chat.trim() && chatData ){
      mutation.mutate({content:chat})
      // mutation.mutate({content:chat},{
      //   onError(error, variables, context:any) {
      //     console.log("test cccc eror", context, error, variables)
      //     queryClient.setQueryData(["workspace", workspace, "dm", id, "chat"], context.previousTodos)
      //   },
      //   onSettled(){
      //     console.log('test cccc, setteld')
      //   },
      //   onSuccess(){
      //     console.log('test cccc, success')
      //     queryClient.invalidateQueries(["workspace", workspace, "dm", id, "chat"])
      //   }
      // })

    }
    },[chat, chatData,mutation])
    // chatData?.pages[0], chatData?.pages.flat()

    const onDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        console.log(e.dataTransfer ,'dr');
        // e.dataTransfer
        // dropEffect: "none"
        // effectAllowed: "all"
        // files: FileList {length: 0}
        // items: DataTransferItemList {length: 0}
        // types: []
        // [[Prototype]]: DataTransfer
        const formData = new FormData();
        if(e.dataTransfer.items){
          for(let i = 0; i < e.dataTransfer.items.length ; i++){
              if(e.dataTransfer.items[i].kind === 'file'){
                const file = e.dataTransfer.items[i].getAsFile();
                console.log("items dr ... file[" + i + "].name = " + (file as File).name);
                formData.append("image", (file as File));
              }
          }
        }else {
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            console.log(
              "files dr ... file[" + i + "].name = " + e.dataTransfer.files[i].name
            );
            formData.append("image", e.dataTransfer.files[i]);
          }
        }
        request
        .post(`/api/workspaces/${workspace}/dms/${id}/images`, formData, {
          withCredentials: true,
        })
        .then(() => {
          setDragOver(false);
          queryClient.refetchQueries([
            "workspace",
            workspace,
            "dm",
            id,
            "chat",
          ]);
        });
      },
      [queryClient, workspace,id]
    );
    const onDragOver = useCallback((e:any)=>{
      e.preventDefault();
      console.log('onDragOver dr')
      setDragOver(true)
    },[])

    const chatSections = makeSection(chatData? chatData.pages.flat().reverse():[])
  if(!userData || !myData){
    return null
  }
  return (
    //onDragStart로하면 안됨
    <Container onDrop = {onDrop} onDragOver= {onDragOver}>
    <Header>
      <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
      <span>{userData.nickname}</span>
    </Header>
    {/* <ChatList chatData={chatData?.pages[0] || []}/> */}
    <ChatList  chatSections ={ chatSections } ref = {scrollbarRef} fetchNext = {fetchNextPage} isReachingEnd = {isReachingEnd} />
    <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
    {dragOver && <DragOver>업로드!</DragOver>}
  </Container>
  )
}

export default DirectMessage