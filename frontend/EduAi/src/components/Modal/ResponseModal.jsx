const ResponseModal = ({ isOpen, message, loading, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal response-modal">
        <div className="modal-content">
          <span className="close-btn" onClick={onClose}>&times;</span>
          {loading ? <p className="loading-text">Fetching response...</p> : <p className="bot-message">{message}</p>}
        </div>
      </div>
    );
  };
  
  export default ResponseModal;
  