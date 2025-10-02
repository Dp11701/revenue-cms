import { Modal, type ModalProps } from "antd";

export const BasicModal = (
  props: {
    open: boolean;
    onCancel: () => void;
    children: React.ReactNode;
    title: string;
    isLoading: boolean;
  } & ModalProps
) => {
  return (
    <Modal
      {...props}
      title={props.title}
      onCancel={props.onCancel}
      open={props.open}
      loading={props.isLoading}
      className="max-w-2xl min-h-[300px]"
      footer={null}
    >
      {props.children}
    </Modal>
  );
};
