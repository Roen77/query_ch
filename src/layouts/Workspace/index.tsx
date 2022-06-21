import axios from 'axios';
import React, { useCallback,  } from 'react'
import { useQuery, useQueryClient } from 'react-query';
import { Navigate, Route, Routes } from 'react-router-dom';
import fetcher from '../../utils/fetcher';
import { Channels, Chats, Header, MenuScroll, ProfileImg, RightMenu, WorkspaceName, Workspaces, WorkspaceWrapper } from './styles';
import gravatar from 'gravatar'
import loadable from '@loadable/component';
type Props = {
    children?: React.ReactNode
  };


  const Channel = loadable(() => import('../../pages/Channel'))
const DirectMessage = loadable(() => import('../../pages/DirectMessage'))

// function Workspace({children}:Props) {
function Workspace() {
    const queryClient = useQueryClient();
    const { data } = useQuery(
        "user",
        () => fetcher({ queryKey: "http://localhost:3105/api/users", log:'workspace' }),{
          staleTime :2000
        }

      );
    // const { data: data1} = useQuery(
    //     "user",
    //     () => fetcher({ queryKey: "http://localhost:3105/api/users", log:'workspace' })
    //   );
    // const { data: data2} = useQuery(
    //     "user",
    //     () => fetcher({ queryKey: "http://localhost:3105/api/users", log:'workspace' })
    //   );
    // const { data: data3} = useQuery(
    //     "user",
    //     () => fetcher({ queryKey: "http://localhost:3105/api/users", log:'workspace' })
    //   );
    const onLogout = useCallback(
      () => {
        axios.post("http://localhost:3105/api/users/logout",null,{
            withCredentials:true
        }).then(() => {
          // 쿼리의 캐시된 데이터를 즉시 업데이트하는 데 사용할 수 있는 동기 함수로써
          //로그아웃 후,캐시된 데이터를 초기화시켜줌 (로그아웃 했으니 사용자 정보를 초기화시킴)
            queryClient.setQueryData('user', () => null);
          });
      },
      [queryClient]
)
if(!data){
  return <Navigate to="/login"/>
}
  return (
   <div>
     <Header>
        <RightMenu>
          <span>
            <ProfileImg src={gravatar.url(data.nickname,{s:'26',d:'retro'})} alt={data.nickname} />
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>tt</Workspaces>
        <Channels>
          <WorkspaceName>-_-</WorkspaceName>
          <MenuScroll>scroll</MenuScroll>
        </Channels>
        <Chats>
        <Routes>
          <Route path='channel/:channel' element={<Channel/>} />
          <Route path='dm/:id' element={<DirectMessage/>} />
        </Routes>
        </Chats>
      </WorkspaceWrapper>
   </div>

  )
}

export default Workspace