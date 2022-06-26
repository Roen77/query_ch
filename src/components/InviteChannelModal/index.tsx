import React, { FC, useCallback } from "react";
import { useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import request from "../../api/api";
import useInput from "../../hooks/useInput";
import { Button, Input, Label } from "../../pages/Signup/styles";
import Modal from "../Modal";

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
}
const InviteChannelModal: FC<Props> = ({
  show,
  onCloseModal,
  setShowInviteChannelModal,
}) => {
  const queryClient = useQueryClient();
  const { workspace, channel } = useParams<{
    workspace: string;
    channel: string;
  }>();
  const [newMember, onChangeNewMember, setNewMember] = useInput("");

  const onInviteMember = useCallback(
    (e: any) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) {
        return;
      }
      console.log("invite");
      request
        .post(`/api/workspaces/${workspace}/channels/${channel}/members`, {
          email: newMember,
        })
        .then(() => {
          queryClient.refetchQueries([
            "workspace",
            workspace,
            "channel",
            channel,
            "member",
          ]);
          setShowInviteChannelModal(false);
          setNewMember("");
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: "bottom-center" });
        });
    },
    [
      channel,
      newMember,
      queryClient,
      setNewMember,
      setShowInviteChannelModal,
      workspace,
    ]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>채널 멤버 초대</span>
          <Input id="member" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;
