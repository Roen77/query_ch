import React, { useCallback } from 'react'
import { Container, Header } from './styles'
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


function DirectMessage() {
  const queryClient = useQueryClient()
  const [chat,onChangeChat,setChat] = useInput("")
    const { workspace, id } = useParams<{ workspace: string; id: string }>();
    const { data: userData } = useQuery(['workspace', workspace, 'users', id], () =>
    fetcher({ queryKey: `/api/workspaces/${workspace}/users/${id}`,log:'dm-member' }),
  );
  const { data: myData } = useQuery('user', () => fetcher({ queryKey: '/api/users',log:'dm-user' }));

  //fetchNextPage를 해야 pageParam이 알아서 증가함...?
  const {data:chatData} = useInfiniteQuery<IDM[]>(["workspace", workspace,'dm',id,"chat"], ({pageParam = 0}) => fetcher({ queryKey: `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${
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
      // queryClient.setQueryData('todos', context.previousTodos)
      console.log('test err errrrr',error,context)
    },
    onMutate: async (mutateData:any) => {
      await queryClient.cancelQueries(["workspace",workspace,'dm',id,'chat'])

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(["workspace",workspace,'dm',id,'chat'])

      console.log('cccc test onMutate mutaionData',mutateData)

      // setQueryData 를 하지 않아도 작동은 잘됨
      queryClient.setQueryData<InfiniteData<IDM[]>>(["workspace",workspace,'dm',id,'chat'], (data:any) => {
        const newPages = data?.pages.slice() || [];
        // unshift() 메서드는 새로운 요소를 배열의 맨 앞쪽에 추가하고, 새로운 길이를 반환합니다.
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

        return {
          pageParams:data?.pageParams || [],
          pages:newPages,
        }
      })
      setChat("")
      return {previousTodos}
    },
    onSettled: () => {
      console.log("test settled")
      //성공하든 실패하든 데이터 가져오기
      queryClient.invalidateQueries(["workspace", workspace, "dm", id, "chat"])
    },
    onSuccess(){
      console.log("test success")
      // 성공하고나서 데이터 다시 갱신
      // queryClient.refetchQueries(["workspace", workspace, "dm", id, "chat"]);
      // queryClient.invalidateQueries(["workspace", workspace, "dm", id, "chat"])
    },
  })

  console.log(mutation.isError,'errorr 확인')
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
  if(!userData || !myData){
    return null
  }
  return (
    <Container>
    <Header>
      <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
      <span>{userData.nickname}</span>
    </Header>
    <ChatList/>
    <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
  </Container>
  )
}

export default DirectMessage