import React from "react";
import { Card, Col } from "antd";
import { BookOutlined } from "@ant-design/icons"; // Import an icon
const Testskillscard = () => (
  <Col>
    <Card
      style={{ backgroundColor: "#0D0D0D", color: "white" }}
      headStyle={{ color: "white", borderBottom: "none" }} // Title color & no border
      title={
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOutlined style={{ color: "white", fontSize: "18px" }} />
          Your Study Companion
        </span>
      }
      className="w-96 h-44"
      variant="borderless"
    >
      
    </Card>
  </Col>
);
export default Testskillscard;
