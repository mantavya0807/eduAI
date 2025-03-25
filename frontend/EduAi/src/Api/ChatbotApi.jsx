import { useState, useEffect } from "react";
import { Input, Modal, Spin, message as AntMessage } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import manthinkingvatar from "/manthinkingvatar.svg";
import { LoadingOutlined } from "@ant-design/icons";
import Topleftcard from "../components/Layout/Cards/leftcards/Topleftcard";

const Chatbot = () => {
  // State variables
  const [message, setMessage] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [botResponse, setBotResponse] = useState("");
  const [specialAnimation, setSpecialAnimation] = useState(false);
  const [waitingForDate, setWaitingForDate] = useState(false);
  const [calendarEvent, setCalendarEvent] = useState("");
  const [calendar, setCalendar] = useState({});
  const [suggestedDates, setSuggestedDates] = useState([]);
  const [waitingForTime, setWaitingForTime] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionId, setSessionId] = useState("default-session");
  
  // Initialize session ID on component mount
  useEffect(() => {
    // Generate a unique session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // If waiting for date input, process it as a date
    if (waitingForDate) {
      handleDateInput(message);
      return;
    }

    setIsUserModalOpen(true);
    setBotResponse("");
    setIsBotModalOpen(true);
    setLoading(true);

    // Handle calendar-related queries locally
    if (message.toLowerCase().includes("schedule")) {
      handleScheduleRequest();
      return;
    }

    if (message.toLowerCase().includes("calendar")) {
      handleCalendarViewRequest();
      return;
    }

    // Send other queries to the backend
    try {
      const response = await sendToBackend(message);
      setBotResponse(response);
    } catch (error) {
      console.error("Error sending request to backend:", error);
      setBotResponse("Sorry, I encountered an error while processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendToBackend = async (userMessage) => {
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      return data.response || "No response from the server.";
    } catch (error) {
      // If backend fails, fallback to Gemini API
      return await fallbackToGemini(userMessage);
    }
  };

  const fallbackToGemini = async (userMessage) => {
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
            contents: [{ parts: [{ text: userMessage }] }],
          }),
        }
      );

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    } catch (error) {
      console.error("Gemini fallback error:", error);
      return "I'm unable to process your request right now. Please try again later.";
    }
  };

  const handleScheduleRequest = () => {
    // Suggest some dates
    const dates = getSuggestedDates();
    setSuggestedDates(dates);
    setBotResponse(
      `Sure! Here are some dates you can choose from: ${dates.join(", ")}`
    );
    setWaitingForDate(true);
    setCalendarEvent(message); // Store the event details
    setLoading(false);
  };

  const handleCalendarViewRequest = () => {
    setSpecialAnimation(true);
    setLoading(false);
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
    storeEventInLocalStorage(calendarEvent, date);
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

  const storeEventInLocalStorage = (event, date) => {
    const keyword = event.split(" ")[0];
    const currentTime = new Date().toISOString();
    
    // Store more comprehensive event data
    const eventData = {
      keyword,
      fullEvent: event,
      date,
      time: currentTime,
    };
    
    // Get existing events or initialize empty array
    const existingEvents = JSON.parse(localStorage.getItem("scheduledEvents") || "[]");
    existingEvents.push(eventData);
    
    // Save back to localStorage
    localStorage.setItem("scheduledEvents", JSON.stringify(existingEvents));
    
    // Also maintain backward compatibility
    localStorage.setItem("scheduledEvent", JSON.stringify({ keyword, time: currentTime }));
  };

  // Function to reset conversation with backend
  const resetConversation = async () => {
    try {
      await fetch("http://localhost:5000/api/reset-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId
        }),
      });
      console.log("Conversation reset successfully");
    } catch (error) {
      console.error("Error resetting conversation:", error);
    }
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