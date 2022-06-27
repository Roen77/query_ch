import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router";
import { NavLink, useLocation } from "react-router-dom";
import { IUser } from "../../typings/db";
import fetcher from "../../utils/fetcher";

interface Props {
  member: IUser;
  isOnline: boolean;
}
const EachDM = ({ member, isOnline }: Props) => {
  const queryClient = useQueryClient();
  const { workspace } = useParams<{ workspace?: string }>();
  const location = useLocation();
  const { data: userData } = useQuery<IUser>(
    "user",
    () => fetcher({ queryKey: "/api/users", log: "workspace-dmlist-user" }),
    {}
  );
  const date = localStorage.getItem(`${workspace}-${member.id}`) || 0;
  const { data: count } = useMutation<number>("read_dm", () =>
    fetcher({
      queryKey: userData
        ? `/api/workspaces/${workspace}/dms/${member.id}/unreads?after=${date}`
        : "",
    })
  );

  useEffect(() => {
    if (location.pathname === `/workspace/${workspace}/dm/${member.id}`) {
      // mutate(0);
      queryClient.refetchQueries("read_dm");
    }
  }, [queryClient, location.pathname, workspace, member]);

  return (
    <NavLink
      key={member.id}
      className={({ isActive }) => (isActive ? "selected" : undefined)}
      to={`/workspace/${workspace}/dm/${member.id}`}
    >
      <i
        className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
          isOnline
            ? "c-presence--active c-icon--presence-online"
            : "c-icon--presence-offline"
        }`}
        aria-hidden="true"
        data-qa="presence_indicator"
        data-qa-presence-self="false"
        data-qa-presence-active="false"
        data-qa-presence-dnd="false"
      />
      <span className={count && count > 0 ? "bold" : undefined}>
        {member.nickname}
      </span>
      {member.id === userData?.id && <span> (나)</span>}
      {(count && count > 0 && <span className="count">{count}</span>) || null}
    </NavLink>
  );
};

export default EachDM;
