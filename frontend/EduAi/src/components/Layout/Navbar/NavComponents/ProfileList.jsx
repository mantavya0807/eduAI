import React from "react";
import { DownOutlined, SettingOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import Profile from "./Profile";

const items = [
  {
    key: "1",
    label: <span className="text-gray-400">My Account</span>,
    disabled: true,
  },
  {
    type: "divider",
  },
  {
    key: "2",
    label: <span className="text-white">Profile</span>,
    extra: <span className="text-gray-400">⌘P</span>,
  },
  {
    key: "3",
    label: <span className="text-white">Billing</span>,
    extra: <span className="text-gray-400">⌘B</span>,
  },
  {
    key: "4",
    label: <span className="text-white">Settings</span>,
    icon: <SettingOutlined className="text-white" />,
    extra: <span className="text-gray-400">⌘S</span>,
  },
];

const Profilelist = () => (
  <Dropdown
    menu={{ items }}
    overlayClassName="custom-dropdown" // Custom CSS for dark mode
  >
    <a onClick={(e) => e.preventDefault()}>
      <Space className="dark:text-white">
        <Profile />
        <DownOutlined className="dark:text-white" />
      </Space>
    </a>
  </Dropdown>
);

export default Profilelist;
