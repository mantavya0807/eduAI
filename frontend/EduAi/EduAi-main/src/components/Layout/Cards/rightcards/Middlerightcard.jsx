import Card3D from "../../Card3D/Card3D";
import {
  UserSwitchOutlined,
  AntDesignOutlined,
  UserOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Tooltip, Button } from "antd";
import CustomButton from "../../../Button/Button";

const Middlerightcard = () => {
  const chatpeople = (
    <Avatar.Group
      max={{
        count: 2,
        style: { color: "#f56a00", backgroundColor: "#fde3cf" },
      }}
    >
      <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=2" />
      <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
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
  );

  return (
    <Card3D
      title="Study Groups & Friends"
      icon={<UserSwitchOutlined />}
      chatperson={chatpeople}
    >
      <div className="">
        <Card className="!p-0 !bg-[#202025] !border-0 !rounded-lg !shadow-none !mt-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-[14px] text-[#FBBA61]">
                Physics Study Group
              </h1>
              <span className="text-[12px] text-[#566272]">
                Next Session in 2 hours
              </span>
            </div>
            <div>
              <Button
                style={{
                  background: "#474747a1",
                  border: "none",
                  boxShadow: "none",
                  fontSize: "12px",
                  padding: "12px",
                  color: "#9ba8b9",
                }}
                type="primary"
              >
                4 online
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-3 flex justify-between">
          <div>
            <p className="text-[#FBBA61] text-[12px] flex items-center">
              Active Study Session Available
            </p>

            <p className="text-[#566272] text-[12px] flex items-center">
              <CoffeeOutlined className="mr-2" />
              Join Quantum Physics Discussion
            </p>
          </div>

          <CustomButton title={"Join Study Group"} />
        </div>
      </div>
    </Card3D>
  );
};

export default Middlerightcard;
