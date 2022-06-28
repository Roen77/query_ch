import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import fetcher from "../../utils/fetcher";
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceModal,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from "./styles";
import gravatar from "gravatar";
import loadable from "@loadable/component";
import Menu from "../../components/Menu";
import { IChannel, IUser } from "../../typings/db";
import Modal from "../../components/Modal";
import { Button, Input, Label } from "../../pages/Signup/styles";
import useInput from "../../hooks/useInput";
import { toast, ToastContainer } from "react-toastify";
import InviteWorkspaceModal from "../../components/InviteWorkspaceModal";
import InviteChannelModal from "../../components/InviteChannelModal";
import CreateChannelModal from "../../components/CreateChannelModal";
import request from "../../api/api";
import ChatList from "../../components/ChannelList";
import DMList from "../../components/DMList";
import ChannelList from "../../components/ChannelList";
import useSocket from "../../hooks/useSocket";
type Props = {
  children?: React.ReactNode;
};

const Channel = loadable(() => import("../../pages/Channel"));
const DirectMessage = loadable(() => import("../../pages/DirectMessage"));

// function Workspace({children}:Props) {
function Workspace() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  // 왼쪽 워크스페이스 생성 모달
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] =
    useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newWorkspace, onChangeNewWorkspace, setNewWorkpsace] = useInput("");
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput("");
  const { workspace } = useParams<{ workspace: string }>();
  //socket
  const [socket, disconnect] = useSocket(workspace)
  const queryClient = useQueryClient();
  const { data: userData } = useQuery<IUser | false>(
    "user",
    () =>
      fetcher({
        queryKey: "/api/users",
        log: "workspace",
      }),
    {
      staleTime: 2000,
    }
  );
  const { data: channelData } = useQuery<IChannel[]>(
    ["workspace", workspace, "channel"],
    () =>
      fetcher({
        queryKey: `/api/workspaces/${workspace}/channels`,
        log: "workspace의 채널 호출",
      }),
    {
      enabled: !!userData,
    }
  );
  // const { data: data1} = useQuery(
  //     "user",
  //     () => fetcher({ queryKey: "/api/users", log:'workspace' })
  //   );

  useEffect(()=>{
    if(channelData && userData && socket){
      console.log('socket login emit')
      socket.emit('login',{
        id:userData.id,
        channels:channelData.map(v=>v.id)
      })
    }
  },[channelData, userData, socket ])

  useEffect(()=>{
    return () => {
      disconnect()
    }
    //workspace 가 변할떄 disconnect시켜주기 위해 넣음
  },[disconnect, workspace])
  const onLogout = useCallback(() => {
    request
      .post("/api/users/logout", null, {
        withCredentials: true,
      })
      .then(() => {
        // 쿼리의 캐시된 데이터를 즉시 업데이트하는 데 사용할 수 있는 동기 함수로써
        //로그아웃 후,캐시된 데이터를 초기화시켜줌 (로그아웃 했으니 사용자 정보를 초기화시킴)
        queryClient.setQueryData("user", () => null);
      });
  }, [queryClient]);

  const onClickProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);
  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);
  const onCloseModal = useCallback(() => {
    console.log("close click")
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, []);
  const onCreateWorkspace = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;
      request
        .post(
          "/api/workspaces",
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          queryClient.refetchQueries("user");
          setShowCreateWorkspaceModal(false);
          setNewWorkpsace("");
          setNewUrl("");
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: "bottom-center" });
        });
    },
    [newWorkspace, newUrl, queryClient, setNewWorkpsace, setNewUrl]
  );

  // 채널 생성
  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);
  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);
  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);
  // const onClickAddChannel = useCallback(() => {}, []);

  if (!userData) {
    return <Navigate to="/login" />;
  }
  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickProfile}>
            <ProfileImg
              src={gravatar.url(userData.nickname, { s: "26", d: "retro" })}
              alt={userData.nickname}
            />
            {showUserMenu && (
              <Menu
                style={{ right: 0, top: 30 }}
                show={showUserMenu}
                onCloseModal={onClickProfile}
              >
                <ProfileModal>
                  <img
                    src={gravatar.url(userData.nickname, {
                      s: "36px",
                      d: "retro",
                    })}
                    alt={userData.nickname}
                  />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
                <WorkspaceButton>
                  {ws.name.slice(0, 1).toUpperCase()}
                </WorkspaceButton>
              </Link>
            );
          })}{" "}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>-_-s</WorkspaceName>
          <MenuScroll>
            <Menu
              show={showWorkspaceModal}
              onCloseModal={toggleWorkspaceModal}
              style={{ top: 95, left: 80 }}
            >
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>
                  워크스페이스에 사용자 초대
                </button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
           <ChannelList/>
           <DMList/>
          </MenuScroll>
        </Channels>
        <Chats>
          <Routes>
            <Route path="channel/:channel" element={<Channel />} />
            <Route path="dm/:id" element={<DirectMessage />} />
          </Routes>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input
              id="workspace"
              value={newWorkspace}
              onChange={onChangeNewWorkspace}
            />
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
          <ToastContainer />
    </div>
  );
}

export default Workspace;
