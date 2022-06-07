import React from "react";
import { Modal } from "react-bootstrap";

const XpModal = (props) => {
  return (
    <Modal
      show={props.show}
      onHide={props.handleClose}
      animation={false}
      keyboard={true}
      className={props.className}
    >
      {props.children}
    </Modal>
  );
};

export default XpModal;
