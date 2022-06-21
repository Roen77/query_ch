import axios from 'axios';
import React, { useCallback, VFC } from 'react'
import { useQuery, useQueryClient } from 'react-query';
import { Navigate } from 'react-router-dom';
import fetcher from '../../utils/fetcher';

type Props = {
    children?: React.ReactNode
  };

function Workspace({children}:Props) {
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
    <button onClick={onLogout}>로그아웃</button>
    {children}
    </div>

  )
}

export default Workspace