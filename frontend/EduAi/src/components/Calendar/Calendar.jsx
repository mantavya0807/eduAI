import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";

const Calendar = ({ openBigCalendar, setEvents }) => {
  const today = new Date();
  const [startDate, setStartDate] = useState(today);
  const [activeDay, setActiveDay] = useState(format(today, "yyyy-MM-dd"));
  const [scheduledEvent, setScheduledEvent] = useState(null);

  useEffect(() => {
    // Fetch scheduled event from local storage
    const storedEvent = localStorage.getItem("scheduledEvent");
    if (storedEvent) {
      setScheduledEvent(JSON.parse(storedEvent));
    }
  }, []);

  function generateTasks(fullDate) {
    const taskOptions = [];

    // Check if the stored event matches the current date
    const eventKeyword =
      scheduledEvent &&
      format(new Date(scheduledEvent.time), "yyyy-MM-dd") === fullDate
        ? scheduledEvent.keyword
        : null;

    return eventKeyword
      ? [eventKeyword, ...taskOptions].sort(() => 0.5 - Math.random())
      : taskOptions;
  }

  const days = Array.from({ length: 4 }, (_, i) => {
    const date = addDays(startDate, i);
    const fullDate = format(date, "yyyy-MM-dd");

    return {
      day: format(date, "d"),
      name: format(date, "EEE"),
      fullDate,
      tasks: generateTasks(fullDate),
    };
  });

  const handleDateClick = (fullDate, tasks) => {
    setActiveDay(fullDate);
    setEvents((prevEvents) => ({ ...prevEvents, [fullDate]: tasks }));
    openBigCalendar();
  };

  return (
    <div className="rounded-2xl w-full max-w-2xl">
      <div className="flex gap-4 p-1.5 items-center justify-around overflow-auto working-dates">
        {days.map(({ day, name, fullDate, tasks }) => (
          <div
            className="flex flex-col items-center h-36 justify-between gap-2"
            key={fullDate}
          >
            <div className="overflow-y-auto flex flex-col items-center max-h-[2.7rem] scrollbar-hidden">
              {tasks.map((task, index) => (
                <span
                  key={index}
                  className={`inline-block px-3 py-1 rounded-full text-xs mt-1 ${
                    task === "Research"
                      ? "bg-blue-100 text-blue-700"
                      : task === "Wireframe"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {task}
                </span>
              ))}
            </div>

            <div
              className={`p-[1rem] h-[5.5rem] rounded-[4rem] max-w-max text-center cursor-pointer transition-all bg-[#8080800a] transform hover:scale-102 hover:bg-purple-100`}
              onClick={() => handleDateClick(fullDate, tasks)}
            >
              <div className="text-lg font-bold text-gray-800 mb-2">{day}</div>
              <div className="text-sm text-gray-600 mb-3">{name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
