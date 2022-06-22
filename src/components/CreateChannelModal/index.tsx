import axios from "axios";
import React, { useCallback, VFC } from "react";
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
  setShowCreateChannelModal: (flag: boolean) => void;
}
const CreateChannelModal = ({
  show,
  onCloseModal,
  setShowCreateChannelModal,
}:Props) => {
  const queryClient = useQueryClient();
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput("");
  const { workspace } = useParams<{ workspace: string; channel: string }>();

  const onCreateChannel = useCallback(
    (e: any) => {
      e.preventDefault();
     request
        .post(
          `/api/workspaces/${workspace}/channels`,
          {
            name: newChannel,
          },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          setShowCreateChannelModal(false);
          queryClient.refetchQueries(["workspace", workspace, "channel"]);
          setNewChannel("");
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: "bottom-center" });
        });
    },
    [
      workspace,
      newChannel,
      queryClient,
      setNewChannel,
      setShowCreateChannelModal,
    ]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널</span>
          <Input
            id="channel"
            value={newChannel}
            onChange={onChangeNewChannel}
          />
        </Label>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
