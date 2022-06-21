import React, { CSSProperties, useCallback } from "react";
import { CloseModalButton, CreateMenu } from "./styles";
interface Props {
  children?: React.ReactNode;
  onCloseModal: () => void;
  style: CSSProperties;
  show: boolean;
  closeButton?: boolean;
}
function Menu({ children, style, onCloseModal, show, closeButton }: Props) {
  //바깥누르면 모달 닫히도록
  const stopPropagation = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);
  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {closeButton && (
          <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        )}
        {children}
      </div>
    </CreateMenu>
  );
}

Menu.defaultProps = {
  closeButton: true,
};

export default Menu;
