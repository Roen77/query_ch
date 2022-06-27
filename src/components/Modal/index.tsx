import React, { useCallback } from "react";
import { CloseModalButton, CreateModal } from "./styles";

interface Props {
  show: boolean;
  onCloseModal: () => void;
  children?: React.ReactNode;
}

function Modal({ children, show, onCloseModal }: Props) {
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);
  if (!show) {
    return null;
  }
  //부모 눌러도 닫히고 버튼을 눌러도 닫힘
  return (
    <CreateModal onClick={onCloseModal}>
      <div onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateModal>
  );
}

export default Modal;
