// BigCalendarComponent.js
import React from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  setHours,
  setMinutes,
} from "date-fns";
import enUS from "date-fns/locale/en-US";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

const BigCalendarComponent = ({ events }) => {
  return (
    <div className="h-[400px] overflow-hidden rounded-md">
      <BigCalendar
        localizer={localizer}
        events={Object.entries(events).flatMap(([date, tasks]) =>
          tasks.map((task, index) => ({
            title: task,
            start: setHours(setMinutes(new Date(date), index * 30), 9),
            end: setHours(setMinutes(new Date(date), index * 30 + 30), 9),
          }))
        )}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", color: "#333" }}
        className="bg-white text-gray-800 p-4"
      />
    </div>
  );
};

export default BigCalendarComponent;
