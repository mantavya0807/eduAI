/**
 * EduAI Main Application - Fixed Dual-Panel Layout System
 * Ensures modals always open in dual-panel mode with proper chat integration
 * @author EduAI Development Team
 */

import { useState, useEffect, useRef } from "react";
import NavbarDefault from "./components/Layout/Navbar/Navbar";
import Leftcardlayout from "./components/Layout/Cards/Leftcardlayout";
import Rightcardlayout from "./components/Layout/Cards/Rightcardlayout";
import Chatbot from "./Api/ChatbotApi";
import Aurora from "./components/Animations/Aurora";
import { ConfigProvider, theme, notification } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import TaskEstimator from "./components/TaskEstimator";
import WeeklyPlanner from "./components/WeeklyPlanner";
import PriorityDashboard from "./components/PrioritySettings";
import StudyPeers from "./components/StudyPeers";
import ProgressTracker from "./components/ProgressTracker";
import BigCalendarComponent from "./components/Calendar/BigCalendarComponent";
import DeadlinesModal from "./components/DeadlinesModal";
import ProfileSettingsModal from "./components/ProfileSettings";
import GoalsModal from "./components/GoalsModal";

// Demo data for development
const DEMO_TASKS = [
  { id: 1, name: "CMPSC 132 - Recitation #10", dueDate: "2025-04-12", priority: "high", estimatedTime: 2.5, difficulty: 7, focus: 6, completed: false },
  { id: 2, name: "MATH 230 - 16.1 Homework", dueDate: "2025-04-09", priority: "medium", estimatedTime: 3, difficulty: 8, focus: 7, completed: false },
  { id: 3, name: "Geog 30N - Written Assignment 3", dueDate: "2025-03-24", priority: "high", estimatedTime: 4, difficulty: 6, focus: 8, completed: true },
  { id: 4, name: "CMPSC 360 - HW8", dueDate: "2025-04-25", priority: "medium", estimatedTime: 2, difficulty: 5, focus: 6, completed: false },
  { id: 5, name: "Cmpsc221 - Programming Assignment 5", dueDate: "2025-04-21", priority: "high", estimatedTime: 5, difficulty: 9, focus: 7, completed: false },
];

const WEEKLY_SCHEDULE = {
  "2025-08-28": [
    { title: "CMPSC 132 - Study Session", start_time: "14:00", end_time: "16:00", type: "study", priority: "high" },
    { title: "MATH 230 - Review", start_time: "19:00", end_time: "20:30", type: "study", priority: "medium" }
  ],
  "2025-08-29": [
    { title: "Programming Assignment Work", start_time: "15:00", end_time: "18:00", type: "assignment", priority: "high" }
  ]
};

const STUDY_PEERS = [
  { id: 1, name: "Alex Chen", course: "CMPSC 132", matchPercentage: 87, isOnline: true, avatar: "👨‍💻" },
  { id: 2, name: "Maya Johnson", course: "MATH 230", matchPercentage: 92, isOnline: true, avatar: "👩‍🔬" },
  { id: 3, name: "Jordan Smith", course: "CMPSC 360", matchPercentage: 78, isOnline: false, avatar: "👨‍🎓" }
];

const STUDY_GROUPS = [
  { id: 1, name: "Data Structures Study Group", course: "CMPSC 132", members: 8, nextMeeting: "2025-08-29", topic: "Binary Trees" },
  { id: 2, name: "Calculus Problem Solving", course: "MATH 230", members: 12, nextMeeting: "2025-08-30", topic: "Integration Techniques" }
];

/**
 * Modal configuration with component mapping
 */
const MODAL_CONFIGS = {
  estimator: { 
    title: "Task Estimator", 
    component: TaskEstimator,
    width: "medium",
    description: "Estimate task difficulty and time requirements"
  },
  schedule: { 
    title: "Weekly Planner", 
    component: WeeklyPlanner,
    width: "large",
    description: "Plan and organize your weekly schedule"
  },
  priorities: { 
    title: "Priority Manager", 
    component: PriorityDashboard,
    width: "medium",
    description: "Manage task priorities and urgency settings"
  },
  peers: { 
    title: "Study Peers", 
    component: StudyPeers,
    width: "large",
    description: "Connect with study partners and groups"
  },
  progress: { 
    title: "Progress Tracker", 
    component: ProgressTracker,
    width: "large",
    description: "Track your academic progress and achievements"
  },
  calendar: { 
    title: "Calendar View", 
    component: BigCalendarComponent,
    width: "extra-large",
    description: "Full calendar view with event management"
  },
  deadlines: { 
    title: "Upcoming Deadlines", 
    component: DeadlinesModal,
    width: "medium",
    description: "View and manage upcoming assignment deadlines"
  },
  profile: { 
    title: "Profile Settings", 
    component: ProfileSettingsModal,
    width: "medium",
    description: "Manage your profile and preferences"
  },
  goals: { 
    title: "Academic Goals", 
    component: GoalsModal,
    width: "medium",
    description: "Set and track your academic goals"
  }
};

/**
 * Main Application Component with Fixed Dual-Panel Layout
 */
function App() {
  // Core application state
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [schedule, setSchedule] = useState(WEEKLY_SCHEDULE);
  const [peers, setPeers] = useState(STUDY_PEERS);
  const [studyGroups, setStudyGroups] = useState(STUDY_GROUPS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [recentlyEstimated, setRecentlyEstimated] = useState(false);
  const [recentlyMoved, setRecentlyMoved] = useState(false);
  
  // Layout management state - FORCE dual-panel when modal is active
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [layoutMode, setLayoutMode] = useState("normal"); // normal | dual-panel
  
  // Chat integration state
  const [chatModalIntegration, setChatModalIntegration] = useState(null);
  const [lastModalAction, setLastModalAction] = useState(null);

  /**
   * Force dual-panel layout whenever a modal is active
   */
  useEffect(() => {
    if (activeModal && layoutMode !== "dual-panel") {
      setLayoutMode("dual-panel");
      console.log("🔧 Forcing dual-panel layout for modal:", activeModal);
    }
  }, [activeModal, layoutMode]);

  /**
   * Initialize application with welcome message
   */
  useEffect(() => {
    notification.info({
      message: 'Welcome to EduAI!',
      description: 'Chat normally, or open tools for side-by-side collaboration.',
      placement: 'topRight',
      duration: 4
    });
  }, []);

  /**
   * Handle modal opening with FORCED dual-panel layout
   * @param {string} modalType - Type of modal to open
   * @param {Object} data - Initial data for the modal
   */
  const openModal = (modalType, data = {}) => {
    console.log("🚀 Opening modal:", modalType, "in dual-panel mode");
    
    // FORCE dual-panel layout - this should NEVER open in full mode
    setActiveModal(modalType);
    setModalData(data);
    setLayoutMode("dual-panel");  // ALWAYS dual-panel
    setChatModalIntegration(modalType);

    // Add chat confirmation message
    const confirmationMsg = `Opened ${MODAL_CONFIGS[modalType]?.title || modalType}. You can now control it through chat or interact directly.`;
    setLastModalAction(confirmationMsg);
    
    // Show notification to confirm dual-panel mode
    notification.success({
      message: 'Tool Opened',
      description: `${MODAL_CONFIGS[modalType]?.title} opened in side-by-side mode`,
      placement: 'topRight',
      duration: 2
    });
  };

  /**
   * Close active modal and return to normal layout
   */
  const closeModal = () => {
    const closedModal = MODAL_CONFIGS[activeModal]?.title || "tool";
    setActiveModal(null);
    setModalData({});
    setLayoutMode("normal");
    setChatModalIntegration(null);
    
    // Add chat confirmation message
    setLastModalAction(`Closed ${closedModal}. Returning to normal chat mode.`);
  };

  /**
   * Generate detailed modal context for chatbot
   * @returns {string} - Current modal context data
   */
  const getCurrentModalContext = () => {
    if (!activeModal || !chatModalIntegration) return "";
    
    let context = `Currently viewing: ${MODAL_CONFIGS[activeModal]?.title}\n`;
    
    switch (activeModal) {
      case "peers":
        const onlinePeers = peers.filter(p => p.isOnline);
        context += `Online peers:\n`;
        onlinePeers.forEach(p => {
          context += `- ${p.name} (${p.course}, ${p.matchPercentage}% match)\n`;
        });
        if (onlinePeers.length === 0) {
          context += "- No peers currently online\n";
        }
        context += `\nStudy groups:\n`;
        studyGroups.forEach(g => {
          context += `- ${g.name} (${g.course}) - ${g.members} members, next: ${g.nextMeeting}\n`;
        });
        break;
        
      case "calendar":
        context += `Current schedule data:\n`;
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        // Show today's events
        const todayEvents = schedule[today] || [];
        context += `Today (${today}):\n`;
        if (todayEvents.length > 0) {
          todayEvents.forEach(event => {
            context += `  - ${event.title} (${event.start_time}-${event.end_time}) [${event.priority} priority]\n`;
          });
        } else {
          context += `  - No events scheduled\n`;
        }
        
        // Show tomorrow's events
        const tomorrowEvents = schedule[tomorrowStr] || [];
        context += `Tomorrow (${tomorrowStr}):\n`;
        if (tomorrowEvents.length > 0) {
          tomorrowEvents.forEach(event => {
            context += `  - ${event.title} (${event.start_time}-${event.end_time}) [${event.priority} priority]\n`;
          });
        } else {
          context += `  - No events scheduled\n`;
        }
        
        // Show other dates
        const otherDates = Object.keys(schedule).filter(date => date !== today && date !== tomorrowStr);
        if (otherDates.length > 0) {
          context += `Other scheduled dates: ${otherDates.join(', ')}\n`;
        }
        break;
        
      case "deadlines":
        const upcomingTasks = tasks.filter(t => !t.completed).slice(0, 5);
        context += `Upcoming tasks:\n`;
        upcomingTasks.forEach(t => {
          const daysUntil = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
          context += `- ${t.name} (due: ${t.dueDate}, ${daysUntil} days, ${t.priority} priority)\n`;
        });
        break;
        
      case "estimator":
        if (selectedTask) {
          context += `Selected task: ${selectedTask.name}\n`;
          context += `- Due: ${selectedTask.dueDate}\n`;
          context += `- Priority: ${selectedTask.priority}\n`;
          context += `- Difficulty: ${selectedTask.difficulty || 'unrated'}/10\n`;
          context += `- Focus: ${selectedTask.focus || 'unrated'}/10\n`;
          context += `- Estimated time: ${selectedTask.estimatedTime || 'unset'} hours\n`;
        } else {
          context += `No task selected for estimation\n`;
        }
        break;
        
      case "schedule":
        context += `Weekly schedule overview:\n`;
        const scheduleEntries = Object.entries(schedule);
        if (scheduleEntries.length > 0) {
          scheduleEntries.slice(0, 5).forEach(([date, events]) => {
            context += `${date}: ${events.length} events\n`;
            events.slice(0, 2).forEach(event => {
              context += `  - ${event.title} (${event.start_time}-${event.end_time})\n`;
            });
          });
        } else {
          context += `No scheduled events\n`;
        }
        break;
        
      case "priorities":
        const priorityStats = {
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        };
        context += `Priority distribution:\n`;
        context += `- High priority: ${priorityStats.high} tasks\n`;
        context += `- Medium priority: ${priorityStats.medium} tasks\n`;
        context += `- Low priority: ${priorityStats.low} tasks\n`;
        break;
        
      case "progress":
        const completedTasks = tasks.filter(t => t.completed).length;
        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        context += `Progress overview:\n`;
        context += `- Total tasks: ${tasks.length}\n`;
        context += `- Completed: ${completedTasks}\n`;
        context += `- Completion rate: ${completionRate}%\n`;
        break;
        
      default:
        context += `Modal data: ${JSON.stringify(modalData, null, 2)}\n`;
    }
    
    console.log("🎯 Generated modal context:", context);
    return context;
  };

  /**
   * Handle chat commands that affect modals with IMMEDIATE updates
   * @param {string} command - Chat command
   * @param {Object} params - Command parameters
   * @returns {string} - Confirmation message for chat
   */
  const handleChatModalCommand = (command, params = {}) => {
    console.log("🎯 Processing chat modal command:", command, params);
    let confirmationMessage = "";
    
    switch (command) {
      case "schedule_event":
        // Parse schedule command - "schedule a 2 hrs study session tomorrow"
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const newEvent = {
          title: params.title || params.event || "Study Session",
          start_time: params.start_time || "15:00",
          end_time: params.end_time || "17:00", // Default 2 hours
          type: params.type || "study",
          priority: params.priority || "medium"
        };
        
        // If duration is specified, calculate end time
        if (params.duration) {
          const startHour = parseInt(newEvent.start_time.split(':')[0]);
          const endHour = startHour + parseInt(params.duration);
          newEvent.end_time = `${endHour.toString().padStart(2, '0')}:00`;
        }
        
        const targetDate = params.date || tomorrowStr;
        
        // IMMEDIATELY update the schedule state
        const updatedSchedule = {
          ...schedule,
          [targetDate]: [...(schedule[targetDate] || []), newEvent]
        };
        setSchedule(updatedSchedule);
        console.log("📅 Schedule updated:", updatedSchedule);
        
        confirmationMessage = `✅ Added "${newEvent.title}" to your calendar for ${targetDate} from ${newEvent.start_time} to ${newEvent.end_time}`;
        
        // Force refresh of calendar component if it's open
        if (activeModal === "calendar") {
          setModalData({ ...modalData, forceRefresh: Date.now() });
        }
        break;
        
      case "estimate_task":
        if (selectedTask && activeModal === "estimator") {
          const updatedTasks = tasks.map(task => 
            task.id === selectedTask.id 
              ? { ...task, ...params }
              : task
          );
          setTasks(updatedTasks);
          confirmationMessage = `Updated task "${selectedTask.name}" with new estimates.`;
        }
        break;
        
      case "mark_complete":
        if (params.taskName) {
          const taskToComplete = tasks.find(t => 
            t.name.toLowerCase().includes(params.taskName.toLowerCase())
          );
          if (taskToComplete) {
            const updatedTasks = tasks.map(task =>
              task.id === taskToComplete.id
                ? { ...task, completed: true }
                : task
            );
            setTasks(updatedTasks);
            confirmationMessage = `✅ Marked "${taskToComplete.name}" as complete!`;
          }
        }
        break;
        
      default:
        confirmationMessage = "Command processed.";
    }
    
    // Update last action for chat display
    setLastModalAction(confirmationMessage);
    return confirmationMessage;
  };

  /**
   * Handle task estimation
   */
  const handleTaskEstimate = (difficulty, focus, time) => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, difficulty, focus, estimatedTime: time }
          : task
      );
      setTasks(updatedTasks);
      setRecentlyEstimated(true);
      setTimeout(() => setRecentlyEstimated(false), 3000);
    }
  };

  /**
   * Handle task completion toggle
   */
  const handleToggleComplete = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);

    const task = tasks.find(t => t.id === taskId);
    const action = task.completed ? 'reopened' : 'completed';
    setLastModalAction(`Task "${task.name}" ${action}.`);
  };

  /**
   * Handle task movement/rescheduling
   */
  const handleTaskMove = (taskId, newDate) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, dueDate: newDate } : task
    );
    setTasks(updatedTasks);
    setRecentlyMoved(true);

    const task = tasks.find(t => t.id === taskId);
    setLastModalAction(`Moved "${task.name}" to ${newDate}.`);
    
    setTimeout(() => setRecentlyMoved(false), 3000);
  };

  /**
   * Handle deadline updates
   */
  const handleUpdateDeadline = async (taskId, updates) => {
    setTasks(currentTasks => {
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      );
      return updatedTasks;
    });
    
    notification.success({
      message: 'Deadline Updated',
      description: `Task deadline has been successfully updated.`,
      placement: 'topRight'
    });
  };

  /**
   * Handle task completion
   */
  const handleCompleteTask = async (taskId) => {
    setTasks(currentTasks => {
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      );
      return updatedTasks;
    });
    
    notification.success({
      message: 'Task Completed',
      description: `Task has been marked as completed.`,
      placement: 'topRight'
    });
  };

  /**
   * Render active modal component with proper props
   */
  const renderActiveModal = () => {
    if (!activeModal || !MODAL_CONFIGS[activeModal]) return null;

    const ModalComponent = MODAL_CONFIGS[activeModal].component;
    const commonProps = {
      visible: true,
      onClose: closeModal,
      tasks,
      setTasks,
      schedule,
      setSchedule,
      peers,
      setPeers,
      studyGroups,
      setStudyGroups,
      selectedTask,
      onTaskSelect: setSelectedTask,
      onEstimate: handleTaskEstimate,
      onToggleComplete: handleToggleComplete,
      onTaskMove: handleTaskMove,
      onUpdateDeadline: handleUpdateDeadline,
      onCompleteTask: handleCompleteTask,
      modalData,
      chatCommand: handleChatModalCommand,
      // Calendar-specific props
      onScheduleUpdate: setSchedule,
      events: schedule // Pass schedule as events for BigCalendarComponent
    };

    return <ModalComponent {...commonProps} />;
  };

  // ALWAYS show dual-panel if modal is active - NO EXCEPTIONS
  const currentLayoutMode = activeModal ? "dual-panel" : "normal";

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#ad46ff',
          colorBgBase: '#0a0a0a',
        },
      }}
    >
      <div className="min-h-screen max-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
        {/* Background Aurora Effect */}
        <Aurora />
        
        {/* Navigation */}
        <NavbarDefault />
        
        {/* Main Layout - FORCED dual-panel when modal active */}
        <div className="relative z-10 pt-10 px-3 h-screen max-h-screen overflow-hidden">
          <div className="max-w-full mx-auto h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] overflow-hidden">
            
            <AnimatePresence mode="wait">
              {currentLayoutMode === "normal" ? (
                /* Normal Layout - Full Chat Experience */
                <motion.div
                  key="normal-layout"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-12 gap-3 h-full max-h-full overflow-hidden"
                >
                  {/* Left Sidebar */}
                  <div className="col-span-3 h-full overflow-hidden">
                    <Leftcardlayout
                      tasks={tasks}
                      setTasks={setTasks}
                      selectedTask={selectedTask}
                      setSelectedTask={setSelectedTask}
                      onEstimate={() => openModal("estimator")}
                      onSchedule={() => openModal("schedule")}
                      onPriorities={() => openModal("priorities")}
                      recentlyEstimated={recentlyEstimated}
                      recentlyMoved={recentlyMoved}
                    />
                  </div>

                  {/* Center Chat Area */}
                  <div className="col-span-6 h-full overflow-hidden">
                    <div className="h-full bg-black/20 backdrop-blur-lg rounded-lg border border-gray-700/50 overflow-hidden">
                      <Chatbot
                        tasks={tasks}
                        setTasks={setTasks}
                        schedule={schedule}
                        setSchedule={setSchedule}
                        peers={peers}
                        setPeers={setPeers}
                        studyGroups={studyGroups}
                        setStudyGroups={setStudyGroups}
                        onTaskSelect={setSelectedTask}
                        onOpenModal={openModal}
                        modalIntegration={chatModalIntegration}
                        lastAction={lastModalAction}
                        onChatModalCommand={handleChatModalCommand}
                        getModalContext={getCurrentModalContext}
                      />
                    </div>
                  </div>

                  {/* Right Sidebar */}
                  <div className="col-span-3 h-full overflow-hidden">
                    <Rightcardlayout
                      tasks={tasks}
                      schedule={schedule}
                      peers={peers}
                      studyGroups={studyGroups}
                      onOpenCalendar={() => openModal("calendar")}
                      onOpenDeadlines={() => openModal("deadlines")}
                      onOpenPeers={() => openModal("peers")}
                      onOpenProgress={() => openModal("progress")}
                    />
                  </div>
                </motion.div>
              ) : (
                /* DUAL PANEL MODE - Chat + Modal Side by Side - FORCED */
                <motion.div
                  key="dual-panel-layout"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-10 gap-2 h-full max-h-full overflow-hidden"
                >
                  {/* Compressed Left Sidebar */}
                  <div className="col-span-1 h-full overflow-hidden">
                    <div className="scale-75 origin-top-left h-full overflow-hidden">
                      <Leftcardlayout
                        tasks={tasks}
                        setTasks={setTasks}
                        selectedTask={selectedTask}
                        setSelectedTask={setSelectedTask}
                        onEstimate={() => openModal("estimator")}
                        onSchedule={() => openModal("schedule")}
                        onPriorities={() => openModal("priorities")}
                        recentlyEstimated={recentlyEstimated}
                        recentlyMoved={recentlyMoved}
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* Chat Panel */}
                  <div className="col-span-4 h-full flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-medium">Chat Control</span>
                        <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded text-xs">LIVE</span>
                      </div>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors text-lg"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="flex-1 bg-gray-800/40 backdrop-blur-lg rounded-lg border border-gray-700/50 overflow-hidden min-h-0">
                      <div className="h-full max-h-full flex flex-col">
                        <div className="p-2 border-b border-gray-700/50 flex-shrink-0">
                          <div className="flex items-center space-x-2 text-xs text-gray-300">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                            <span>Connected to {MODAL_CONFIGS[activeModal]?.title.toLowerCase()} - Chat commands will control the tool</span>
                          </div>
                        </div>
                        <div className="flex-1 min-h-0">
                          <Chatbot
                            tasks={tasks}
                            setTasks={setTasks}
                            schedule={schedule}
                            setSchedule={setSchedule}
                            peers={peers}
                            setPeers={setPeers}
                            studyGroups={studyGroups}
                            setStudyGroups={setStudyGroups}
                            onTaskSelect={setSelectedTask}
                            onOpenModal={openModal}
                            modalIntegration={chatModalIntegration}
                            lastAction={lastModalAction}
                            onChatModalCommand={handleChatModalCommand}
                            compact={true}
                            modalData={modalData}
                            getModalContext={getCurrentModalContext}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Panel */}
                  <div className="col-span-5 h-full flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-white text-xs font-medium">
                          {MODAL_CONFIGS[activeModal]?.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {MODAL_CONFIGS[activeModal]?.description}
                      </span>
                    </div>
                    
                    <div className="flex-1 bg-gray-800/40 backdrop-blur-lg rounded-lg border border-gray-700/50 overflow-hidden min-h-0">
                      {renderActiveModal()}
                    </div>
                  </div>

                  {/* Compressed Right Sidebar */}
                  <div className="col-span-0 h-full overflow-hidden hidden">
                    <div className="scale-70 origin-top-right h-full overflow-hidden">
                      <Rightcardlayout
                        tasks={tasks}
                        schedule={schedule}
                        peers={peers}
                        studyGroups={studyGroups}
                        onOpenCalendar={() => openModal("calendar")}
                        onOpenDeadlines={() => openModal("deadlines")}
                        onOpenPeers={() => openModal("peers")}
                        onOpenProgress={() => openModal("progress")}
                        compact={true}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;