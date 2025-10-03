import { Modal, type ModalProps } from "antd";
import React from "react";

export const ConfirmModal = (
  props: {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    okText?: string;
    okType?: "primary" | "danger" | "dashed" | "link" | "text" | "default";
    cancelText?: string;
  } & ModalProps
) => {
  const {
    open,
    onCancel,
    onConfirm,
    title,
    children,
    okText = "OK",
    okType = "primary",
    cancelText = "Cancel",
    ...modalProps
  } = props;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      title={title}
      okText={okText}
      okType={okType}
      cancelText={cancelText}
      className="confirm-modal"
      centered
      {...modalProps}
    >
      <div className="confirm-modal-content">{children}</div>
    </Modal>
  );
};
