import { useState } from "react";
import Card3D from "../../Card3D/Card3D";
import { BookOutlined } from "@ant-design/icons";
import Calendar from "../../../Calendar/Calendar";
import BigCalendarComponent from "../../../Calendar/BigCalendarComponent";
import { Modal } from "antd";

const Topleftcard = () => {
  const [isBigCalendarOpen, setIsBigCalendarOpen] = useState(false);
  const [events, setEvents] = useState({});

  return (
    <>
      {/* Main Card with Calendar */}
      <Card3D title="Your Study Companion" icon={<BookOutlined />}>
        <Calendar openBigCalendar={() => setIsBigCalendarOpen(true)} setEvents={setEvents} />
      </Card3D>

      {/* Full-Screen Modal for Big Calendar */}
      <Modal
        open={isBigCalendarOpen}
        onCancel={() => setIsBigCalendarOpen(false)}
        footer={null}
        width="90vw"
        style={{ top: 20 }}
      >
        <BigCalendarComponent events={events} />
      </Modal>
    </>
  );
};

export default Topleftcard;
