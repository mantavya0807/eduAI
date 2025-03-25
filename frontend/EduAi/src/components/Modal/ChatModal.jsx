import { Modal, Spin } from "antd";

const ChatModal = ({ isOpen, chatHistory, onClose, loading }) => {
  return (
    <Modal  title="Chat Response" open={isOpen} onCancel={onClose} footer={null}  >
      <div className="bg-transparent "  style={{ maxHeight: "400px", overflowY: "auto" }}>
        {chatHistory.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
        {loading && <Spin />}
      </div>
    </Modal>
  );
};

export default ChatModal;
