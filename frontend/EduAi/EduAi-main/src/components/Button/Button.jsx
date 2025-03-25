const Button = ({ title, onClick }) => {
  return (
    <div
      className="mt-3 Chat-ai-btn cursor-pointer hover:scale-105 transform duration-300"
      onClick={onClick} // Attach the onClick event
    >
      <span>{title}</span>
    </div>
  );
};

export default Button;
