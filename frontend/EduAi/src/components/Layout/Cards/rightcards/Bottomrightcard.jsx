import React, { useState } from "react";
import Card3D from "../../Card3D/Card3D";
import { CommentOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Tooltip, Input, Button } from "antd";

const Bottomrightcard = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "I’m leaning toward computer science",
      sender: "Sofia",
      isUser: false,
    },
    { id: 2, text: "Great job, Guys Keep it up", sender: "You", isUser: true },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sender: "You",
          isUser: true,
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <Card3D title="Chat" icon={<CommentOutlined />}>
      {/* Chat messages */}
      <div
        className="chat-message-container"
        style={{ maxHeight: "75px", overflowY: "auto" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.isUser ? "row-reverse" : "row",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <Avatar
              style={{
                backgroundColor: msg.isUser ? "#1677ff" : "#f56a00",
                margin: "0 10px",
              }}
              icon={msg.isUser ? <UserOutlined /> : null}
              src={
                !msg.isUser
                  ? "https://api.dicebear.com/7.x/miniavs/svg?seed=1"
                  : ""
              }
            />
            <div
              style={{
                background: msg.isUser
                  ? "linear-gradient(to right, #5DF9FF, #D8FF4C)"
                  : "#fff",
                padding: "3px 8px",
                borderRadius: "15px",
                color: msg.isUser ? "#000" : "#000",
                maxWidth: "70%",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Field */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          paddingTop: "10px",
        }}
      >
        <Input
          className="message-input-person"
          placeholder="Message ..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPressEnter={sendMessage}
          style={{
            flex: 1,
            marginRight: "10px",
            borderRadius: "10px",
            backgroundColor: "#1f1f1f",
            color: "white",
            boxShadow: " none",
            border: "none",
            height: "2.3rem",
          }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={sendMessage}
        />
      </div>
    </Card3D>
  );
};

export default Bottomrightcard;
