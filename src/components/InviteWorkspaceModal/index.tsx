import axios from "axios";
import React, { FC, useCallback } from "react";
import { useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import { Button, Input, Label } from "../../pages/Signup/styles";
import Modal from "../Modal";

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}
const InviteWorkspaceModal: FC<Props> = ({
  show,
  onCloseModal,
  setShowInviteWorkspaceModal,
}) => {
  const queryClient = useQueryClient();
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const [newMember, onChangeNewMember, setNewMember] = useInput("");

  const onInviteMember = useCallback(
    (e: any) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) {
        return;
      }
    },
    [newMember]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input
            id="member"
            type="email"
            value={newMember}
            onChange={onChangeNewMember}
          />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;
