import React from "react";
import { BellOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip } from "antd";
const Bell = () => (
  <Flex gap="small" vertical>
    <Flex wrap gap="small">
      <Tooltip title="Notification">
        <Button shape="circle" size="large" icon={<BellOutlined />} />
      </Tooltip>
    </Flex>
  </Flex>
);
export default Bell;
