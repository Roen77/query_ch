import React, { useCallback, useState } from 'react'
import { useQuery } from 'react-query';
import { NavLink, useParams } from 'react-router-dom';
import { IChannel, IUser } from '../../typings/db';
import fetcher from '../../utils/fetcher';
import { CollapseButton } from '../DMList/styles';
import EachChannel from '../EachChannel';

function ChannelList() {
    const {workspace} = useParams<{workspace? :string}>();
    const { data: userData } = useQuery<IUser | false>('user', () => fetcher({ queryKey: '/api/users', log:'workspace - chatList-user' }), {});
    const { data: channelData } = useQuery<IChannel[]>(
        ['workspace', workspace, 'channel'],
        () => fetcher({ queryKey: `/api/workspaces/${workspace}/channels`,log:'workspace - chatList-channel' }),
        {
          enabled: !!userData,
        },
      );
      const [channelCollapse, setChannelCollapse] = useState(false);

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
            <span>Channels</span>
          </h2>
          <div>
            {!channelCollapse && channelData?.map(channel => {
              return <EachChannel key={channel.id} channel = {channel}/>
            })}
          </div>
        </>
      );
}

export default ChannelList