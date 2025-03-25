import Card3D from "../../Card3D/Card3D";
import {
  TagsOutlined,
  AntDesignOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Flex, Progress, Avatar, Divider, Tooltip } from "antd";
import AnimatedList from "../../../Animations/AnimatedList";

const Toprightcard = () => {
  const Priorities = [
    {
      title: "Finish studying for English exam",
    },
    {
      title: "Finish studying for English exam",
    },
    {
      title: "Finish studying for English exam",
    },
  ];

  const items = [
    "Item 1",
    "Item 2",
    "Item 3",
    "Item 4",
    "Item 5",
    "Item 6",
    "Item 7",
    "Item 8",
    "Item 9",
    "Item 10",
  ];
  return (
    <Card3D title="Goals" icon={<TagsOutlined />}>
      <div className="flex justify-between ">
        <div>
          <h1>Top Priorities</h1>
          <div className="Priorities-list">
            <AnimatedList
              items={items}
              onItemSelect={(item, index) => console.log(item, index)}
              enableArrowNavigation={true}
              displayScrollbar={true}
              className="flex justify-between Study-Palnner-Body max-w-full Goals-List"
            />
          </div>
        </div>
        <div>
          <div>
            <h1>Streaks</h1>
            <p>Streak goal: Study for 2 hrs per day</p>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <div>
                <Flex gap="small" wrap>
                  <Progress
                    type="dashboard"
                    percent={75}
                    size={80}
                    strokeColor="#9981FF"
                    format={(percent) => (
                      <span style={{ color: "white" }}>{percent}%</span>
                    )}
                  />
                </Flex>
              </div>
              <div>
                <Avatar.Group>
                  <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
                  <a href="https://ant.design">
                    <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
                  </a>
                  <Tooltip title="Ant User" placement="top">
                    <Avatar
                      style={{ backgroundColor: "#87d068" }}
                      icon={<UserOutlined />}
                    />
                  </Tooltip>
                  <Avatar
                    style={{ backgroundColor: "#1677ff" }}
                    icon={<AntDesignOutlined />}
                  />
                </Avatar.Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card3D>
  );
};

export default Toprightcard;
