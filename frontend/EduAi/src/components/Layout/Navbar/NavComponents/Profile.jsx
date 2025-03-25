import React from "react";
import { Avatar, Space } from "antd";

const Profile = () => (
  <Space size={16} wrap>
    <Avatar
      size={{ xs: 24, sm: 32, md: 40, lg: 40, xl: 40 }}
      style={{
        backgroundColor: "#fde3cf",
        color: "#f56a00",
      }}
      className="hidden lg:inline-block"
    >
      U
    </Avatar>
  </Space>
);

export default Profile;
