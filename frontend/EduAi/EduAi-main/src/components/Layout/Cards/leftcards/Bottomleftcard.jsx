import Button from "../../../Button/Button";
import Card3D from "../../Card3D/Card3D";
import { CalendarOutlined } from "@ant-design/icons";
import AnimatedList from "../../../Animations/AnimatedList";

const Bottomleftcard = () => {
  const data = [
    {
      title: "Advanced Calculus",
      time: "2:00 PM",
    },
    {
      title: "Linear Algebra",
      time: "3:30 PM",
    },
    {
      title: "Discrete Mathematics",
      time: "5:00 PM",
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
    <Card3D
      title="Your Study Plan Today"
      className="pt-0"
      icon={<CalendarOutlined />}
      chatperson={<Button title={"View full Schedule"} />}
    >
      <div className="Study-Palnner-Head flex flex-col gap-2">
        <h4>Today's Focus</h4>
        <AnimatedList
          items={items}
          onItemSelect={(item, index) => console.log(item, index)}
         
          enableArrowNavigation={true}
          displayScrollbar={true}
          className="flex justify-between Study-Palnner-Body max-w-full"
        />
      </div>
    </Card3D>
  );
};

export default Bottomleftcard;
