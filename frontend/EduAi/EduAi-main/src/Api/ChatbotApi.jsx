import { useState } from "react";
import { Input, Modal, Spin, message as AntMessage } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import manthinkingvatar from "/manthinkingvatar.svg";
import { LoadingOutlined } from "@ant-design/icons";
import Topleftcard from "../components/Layout/Cards/leftcards/Topleftcard";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [botResponse, setBotResponse] = useState("");
  const [specialAnimation, setSpecialAnimation] = useState(false);
  const [waitingForDate, setWaitingForDate] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState("");
  const [calendar, setCalendar] = useState({}); // Stores scheduled events
  const [suggestedDates, setSuggestedDates] = useState([]); // Store suggested dates
  const [waitingForTime, setWaitingForTime] = useState(false); // Wait for time input
  const [selectedDate, setSelectedDate] = useState(""); // Stores selected date
  const [selectedTime, setSelectedTime] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // If waiting for date input, process it as a date instead
    if (waitingForDate) {
      handleDateInput(message);
      return;
    }

    setIsUserModalOpen(true);
    setBotResponse("");
    setIsBotModalOpen(true);
    setLoading(true);

    if (message.toLowerCase().includes("schedule")) {
      // Suggest some dates
      const dates = getSuggestedDates();
      setSuggestedDates(dates);
      setBotResponse(
        `Sure! Here are some dates you can choose from: ${dates.join(", ")}`
      );
      setWaitingForDate(true);
      setCalendarEvent(message); // Store the event details
      setLoading(false);
      return;
    }

    if (message.toLowerCase().includes("calendar")) {
      setSpecialAnimation(true);
      setLoading(false);
      return;
    }

    try {
      const API_KEY = "AIzaSyCtWBHsghRR094V6znk4mrNt83iojyUN0I";
      if (!API_KEY) throw new Error("Missing API key");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }],
          }),
        }
      );

      const data = await response.json();
      const botMessage =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI.";
      setBotResponse(botMessage);
    } catch (error) {
      setBotResponse("Something went wrong, please try again.");
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateInput = (date) => {
    setWaitingForDate(false);
    setSuggestedDates([]);

    if (!isValidDate(date)) {
      setBotResponse("Oops! That doesn't seem like a valid date. Try again.");
      return;
    }

    setCalendar((prev) => ({ ...prev, [date]: calendarEvent }));
    setBotResponse(`📅 Event added on ${date}: "${calendarEvent}"`);
    AntMessage.success(`Event scheduled for ${date}`);
    storeEventInLocalStorage(calendarEvent);
    setMessage("");
    setCalendarEvent("");
  };

  const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

  const getSuggestedDates = () => {
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i + 1);
      return nextDate.toISOString().split("T")[0];
    });
  };

  const storeEventInLocalStorage = (event) => {
    const keyword = event.split(" ")[0];
    const currentTime = new Date().toISOString();
    localStorage.setItem(
      "scheduledEvent",
      JSON.stringify({ keyword, time: currentTime })
    );
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {/* Input Field */}
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          waitingForDate ? "Enter the date (YYYY-MM-DD)..." : "Ask Edu Ai..."
        }
        onPressEnter={handleSendMessage}
        style={{
          width: "100%",
          marginBottom: "20px",
          height: "50px",
          backgroundColor: "#1a1a1a",
          color: "white",
          border: "1px solid #9e9e9e52",
          borderRadius: "50px",
        }}
        className="custom-input"
      />

      <div className="!bg-violet-700">
        {/* User Message Modal */}
        <AnimatePresence>
          {isUserModalOpen && (
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Modal
                open={isUserModalOpen}
                onCancel={() => setIsUserModalOpen(false)}
                footer={null}
                closable={false}
                style={{
                  top: 100,
                  zIndex: 1000,
                  width: "40rem",
                  marginLeft: "3rem",
                }}
              >
                <div className="flex items-center gap-5">
                  <img className="max-w-11" src={manthinkingvatar} alt="" />
                  <p className="user-message-response">{message}</p>
                </div>
              </Modal>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bot Response Modal */}
        <AnimatePresence>
          {isBotModalOpen && (
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Modal
                open={isBotModalOpen}
                onCancel={() => setIsBotModalOpen(false)}
                footer={null}
                closable={false}
                loading={loading}
                style={{
                  top: 215,
                  zIndex: 999,
                  width: "50rem",
                  marginLeft: "3rem",
                }}
              >
                {loading ? (
                  <Spin
                    indicator={<LoadingOutlined spin />}
                    style={{ color: "green" }}
                  />
                ) : (
                  <p className="bot-message-response">{botResponse}</p>
                )}
              </Modal>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special Animation Modal */}
        <AnimatePresence>
          {specialAnimation && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Modal
                open={specialAnimation}
                onCancel={() => setSpecialAnimation(false)}
                footer={null}
                style={{ top: 200, zIndex: 1001, marginRight: 0 }}
                className="calendar-modal-special"
              >
                <Topleftcard />
              </Modal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chatbot;
