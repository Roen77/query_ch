import React, { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query';
import { NavLink, useParams } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import { IUser, IUserWithOnline } from '../../typings/db';
import fetcher from '../../utils/fetcher';
import { CollapseButton } from './styles';

function DMList() {
    const { workspace } = useParams<{ workspace?: string }>();
    const { data: userData } = useQuery<IUser>('user', () => fetcher({ queryKey: '/api/users',log:'workspace-dmlist-user' }), {});

    const { data: memberData } = useQuery<IUserWithOnline[]>(
      ['workspace', workspace, 'member'],
      () => fetcher({ queryKey: `/api/workspaces/${workspace}/members` , log:'workspace-dmlist-member'}),
      { enabled: !!userData },
    );
      const [socket, disconnect] = useSocket(workspace)
    const [channelCollapse, setChannelCollapse] = useState(false);
    const [onlineList, setOnlineList] = useState<number[]>([]);
    // workspace바뀌면 초기화시키기
    useEffect(()=>{
      console.log("DMList: workspace 바꼈다", workspace);
      setOnlineList([]);
    },[workspace])

    useEffect(()=>{
      socket?.on("onlineList", (data:number[])=> {
        setOnlineList(data)
      })
      return () => {
        socket?.off("onlineList")
      }
    },[socket])

    const toggleChannelCollapse = useCallback(() => {
        setChannelCollapse((prev) => !prev);
      }, []);
    return (
        <>
          <h2>
            <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
              <i
                className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
                data-qa="channel-section-collapse"
                aria-hidden="true"
              />
            </CollapseButton>
            <span>Direct Messages</span>
          </h2>
          <div>
            {!channelCollapse &&
              memberData?.map((member) => {
                const isOnline = onlineList.includes(member.id);
                return (
                  <NavLink key={member.id} className={({ isActive }) =>
                  isActive ? "selected" : undefined
                } to={`/workspace/${workspace}/dm/${member.id}`}>
                    <i
                      className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                        isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
                      }`}
                      aria-hidden="true"
                      data-qa="presence_indicator"
                      data-qa-presence-self="false"
                      data-qa-presence-active="false"
                      data-qa-presence-dnd="false"
                    />
                    <span>{member.nickname}</span>
                    {member.id === userData?.id && <span> (나)</span>}
                  </NavLink>
                );
              })}
          </div>
        </>
      );
}

export default DMList