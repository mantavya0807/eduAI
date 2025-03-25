import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip } from "antd";
const Search = () => (
  <Flex gap="small" vertical>
    <Flex wrap gap="small">
      <Tooltip title="search">
        <Button
          shape="circle"
          variant="outlined"
          size="large"
          icon={<SearchOutlined />}
        />
      </Tooltip>
    </Flex>
  </Flex>
);
export default Search;
