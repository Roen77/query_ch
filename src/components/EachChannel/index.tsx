import React, { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router";
import { NavLink, useLocation } from "react-router-dom";
import { IChannel, IUser } from "../../typings/db";
import fetcher from "../../utils/fetcher";

interface Props {
  channel: IChannel;
  children?: React.ReactNode;
}
const EachChannel = ({ channel, children }: Props) => {
  const { data: userData } = useQuery<IUser>(
    "user",
    () => fetcher({ queryKey: "/api/users", log: "workspace-dmlist-user" }),
    {}
  );
  const { workspace } = useParams<{ workspace?: string }>();
  const location = useLocation();
  const date = localStorage.getItem(`${workspace}-${channel.name}`) || 0;
  const { data: count } = useMutation<number>("read_message", () =>
    fetcher({
      queryKey: userData
        ? `/api/workspaces/${workspace}/channels/${channel.name}/unreads?after=${date}`
        : "",
    })
  );

  useEffect(() => {
    if (
      location.pathname === `/workspace/${workspace}/channel/${channel.name}`
    ) {
      // mutate(0);
    }
  }, [location.pathname, workspace, channel]);

  return (
    <NavLink
      key={channel.name}
      className={({ isActive }) => (isActive ? "selected" : undefined)}
      to={`/workspace/${workspace}/channel/${channel.name}`}
    >
      <span className={count !== undefined && count > 0 ? "bold" : undefined}>
        # {channel.name}
      </span>
      {count !== undefined && count > 0 && (
        <span className="count">{count}</span>
      )}
    </NavLink>
  );
};

export default EachChannel;
