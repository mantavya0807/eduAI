import { Card, Button } from "antd";
import { BulbOutlined } from "@ant-design/icons";

const QuizNotification = () => {
  return (
    <Card className="quiz-card">
      <div className="quiz-header">
        <BulbOutlined className="quiz-icon" />
        <div>
          <strong>Ready to Test Your Skills?</strong>
          <p className="quiz-topic">Topic - DSA</p>
        </div>
      </div>
      <p className="quiz-text">
        Your next challenge awaits! Participate in the Ultimate Quiz to test your knowledge and climb the leaderboard.
      </p>
      <Button type="primary" size="small">Start</Button>
    </Card>
  );
};

export default QuizNotification;
