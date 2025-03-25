const UserMessageModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal user-modal">
        <div className="modal-content">
          <span className="close-btn" onClick={onClose}>&times;</span>
          <p className="user-message">{message}</p>
        </div>
      </div>
    );
  };
  
  export default UserMessageModal;
  