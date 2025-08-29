/**
 * RedesignedDashboard Component - Clean, Modern Academic Dashboard
 * Features intelligent layout management and seamless modal integration
 * Eliminates duplicate interfaces and focuses on user productivity
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useCallback } from "react";
import { ConfigProvider, theme, notification, Button, Tooltip, Card, Badge } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  FireOutlined, 
  TeamOutlined,
  BarChartOutlined,
  ExpandOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  AlertOutlined
} from "@ant-design/icons";

// Enhanced Components
import Leftcardlayout from "../Layout/Cards/Leftcardlayout";
import Rightcardlayout from "../Layout/Cards/Rightcardlayout";
import Chatbot from "../../Api/ChatbotApi";
import Aurora from "../Animations/Aurora";

// Modal Components
import TaskEstimator from "../TaskEstimator";
import WeeklyPlanner from "../WeeklyPlanner";
import PriorityDashboard from "../PrioritySettings";
import StudyPeers from "../StudyPeers";
import ProgressTracker from "../ProgressTracker";
import BigCalendarComponent from "../Calendar/BigCalendarComponent";
import DeadlinesModal from "../DeadlinesModal";
import ProfileSettingsModal from "../ProfileSettings";
import GoalsModal from "../GoalsModal";

/**
 * Quick action button component for dashboard shortcuts
 * @param {Object} props - Component properties
 * @param {Function} props.onClick - Click handler function
 * @param {ReactNode} props.icon - Icon to display
 * @param {string} props.label - Button label text
 * @param {string} props.color - Color theme for button
 * @param {boolean} props.active - Whether button is in active state
 */
const QuickActionButton = ({ onClick, icon, label, color = "purple", active = false }) => (
  <Tooltip title={label} placement="bottom">
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
        active 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
          : 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white'
      } backdrop-blur-sm border border-gray-600/30`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className={`text-xl ${active ? 'text-white' : `text-${color}-400`}`}>
          {icon}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </motion.div>
  </Tooltip>
);

/**
 * Dashboard stats widget for displaying key metrics
 * @param {Object} props - Component properties
 * @param {string} props.title - Widget title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Secondary information
 * @param {ReactNode} props.icon - Icon for the widget
 * @param {string} props.trend - Trend indicator (up/down/stable)
 */
const StatsWidget = ({ title, value, subtitle, icon, trend = "stable" }) => {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400", 
    stable: "text-blue-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-purple-400 text-xl">{icon}</div>
        <div className={`text-sm ${trendColors[trend]}`}>
          {trend === "up" && "↗"} {trend === "down" && "↘"} {trend === "stable" && "→"}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-400">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Main Dashboard Component with Enhanced Layout Management
 * @param {Object} props - Component properties
 * @param {Array} props.tasks - Array of user tasks
 * @param {Function} props.setTasks - Task state setter function
 * @param {Object} props.selectedTask - Currently selected task
 * @param {Function} props.setSelectedTask - Selected task setter
 * @param {Object} props.schedule - User schedule data
 * @param {Function} props.setSchedule - Schedule setter function
 * @param {Array} props.peers - Study peers data
 * @param {Function} props.setPeers - Peers setter function
 * @param {Array} props.studyGroups - Study groups data
 * @param {Function} props.setStudyGroups - Study groups setter
 * @param {Function} props.onEstimate - Task estimation handler
 * @param {Function} props.onToggleComplete - Task completion toggle handler
 * @param {Function} props.onTaskMove - Task movement handler
 * @param {boolean} props.recentlyEstimated - Recent estimation indicator
 * @param {boolean} props.recentlyMoved - Recent movement indicator
 */
const RedesignedDashboard = ({ 
  tasks = [], 
  setTasks, 
  selectedTask, 
  setSelectedTask, 
  schedule = {}, 
  setSchedule, 
  peers = [], 
  setPeers,
  studyGroups = [],
  setStudyGroups,
  onEstimate,
  onToggleComplete,
  onTaskMove,
  recentlyEstimated = false,
  recentlyMoved = false
}) => {
  // Modal visibility states
  const [activeModal, setActiveModal] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});

  /**
   * Calculate dashboard statistics from current data
   */
  const calculateStats = useCallback(() => {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const highPriorityTasks = tasks.filter(task => task.priority === "high" && !task.completed).length;
    const todayEvents = Object.keys(schedule).length;
    const activePeers = peers.filter(peer => peer.active).length;

    setDashboardStats({
      completion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      urgent: highPriorityTasks,
      events: todayEvents,
      peers: activePeers
    });
  }, [tasks, schedule, peers]);

  /**
   * Initialize dashboard and calculate initial stats
   */
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  /**
   * Handle modal opening with single-modal management
   * @param {string} modalType - Type of modal to open
   */
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  /**
   * Close currently active modal
   */
  const closeModal = () => {
    setActiveModal(null);
  };

  /**
   * Quick action handlers for dashboard shortcuts
   */
  const quickActions = [
    {
      key: "estimator",
      icon: <ClockCircleOutlined />,
      label: "Estimate Task",
      color: "blue",
      active: activeModal === "estimator",
      onClick: () => openModal("estimator"),
      disabled: !selectedTask
    },
    {
      key: "schedule",
      icon: <CalendarOutlined />,
      label: "View Schedule", 
      color: "green",
      active: activeModal === "schedule",
      onClick: () => openModal("schedule")
    },
    {
      key: "priorities",
      icon: <FireOutlined />,
      label: "Set Priorities",
      color: "red", 
      active: activeModal === "priorities",
      onClick: () => openModal("priorities")
    },
    {
      key: "peers",
      icon: <TeamOutlined />,
      label: "Study Peers",
      color: "purple",
      active: activeModal === "peers", 
      onClick: () => openModal("peers")
    },
    {
      key: "progress",
      icon: <BarChartOutlined />,
      label: "Progress",
      color: "yellow",
      active: activeModal === "progress",
      onClick: () => openModal("progress")
    }
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
        {/* Background Effects */}
        <Aurora />
        
        {/* Main Dashboard Grid */}
        <div className="relative z-10 p-6 h-screen">
          <div className="max-w-7xl mx-auto h-full">
            
            {/* Top Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatsWidget
                title="Tasks Complete"
                value={`${dashboardStats.completion || 0}%`}
                subtitle={`${tasks.filter(t => t.completed).length} of ${tasks.length}`}
                icon={<CheckCircleOutlined />}
                trend="up"
              />
              <StatsWidget
                title="Urgent Items"
                value={dashboardStats.urgent || 0}
                subtitle="High priority tasks"
                icon={<AlertOutlined />}
                trend={dashboardStats.urgent > 3 ? "down" : "stable"}
              />
              <StatsWidget
                title="Today's Events"
                value={dashboardStats.events || 0}
                subtitle="Scheduled items"
                icon={<CalendarOutlined />}
                trend="stable"
              />
              <StatsWidget
                title="Active Peers"
                value={dashboardStats.peers || 0}
                subtitle="Online study partners"
                icon={<TeamOutlined />}
                trend="up"
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-4 bg-gray-800/30 backdrop-blur-lg rounded-2xl p-4 border border-gray-700/50">
                {quickActions.map((action) => (
                  <QuickActionButton
                    key={action.key}
                    icon={action.icon}
                    label={action.label}
                    color={action.color}
                    active={action.active}
                    onClick={action.disabled ? undefined : action.onClick}
                  />
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-6 h-[calc(100%-200px)]">
              
              {/* Left Sidebar - Task Management */}
              <div className="col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
                  <Leftcardlayout
                    tasks={tasks}
                    setTasks={setTasks}
                    selectedTask={selectedTask}
                    setSelectedTask={setSelectedTask}
                    onEstimate={() => openModal("estimator")}
                    onToggleComplete={onToggleComplete}
                    onTaskMove={onTaskMove}
                    recentlyEstimated={recentlyEstimated}
                    recentlyMoved={recentlyMoved}
                  />
                </motion.div>
              </div>

              {/* Center Area - Main Chat Interface */}
              <div className="col-span-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Chat Header */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center space-x-3 bg-gray-800/40 backdrop-blur-lg rounded-full px-6 py-3 border border-gray-700/50">
                      <BulbOutlined className="text-purple-400 text-xl" />
                      <span className="text-white font-medium">EduAI Assistant</span>
                      <Badge 
                        status="processing" 
                        text={<span className="text-gray-400 text-xs">Ready to help</span>} 
                      />
                    </div>
                  </div>
                  
                  {/* Main Chatbot Interface */}
                  <div className="flex-1 bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl">
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
                    />
                  </div>
                </motion.div>
              </div>

              {/* Right Sidebar - Insights & Social */}
              <div className="col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full"
                >
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
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Management - Single Modal Approach */}
        <AnimatePresence mode="wait">
          {activeModal === "estimator" && (
            <TaskEstimator
              visible={true}
              onClose={closeModal}
              task={selectedTask}
              onEstimate={(difficulty, focus, time) => {
                if (onEstimate) onEstimate(difficulty, focus, time);
                closeModal();
              }}
            />
          )}

          {activeModal === "schedule" && (
            <WeeklyPlanner
              visible={true}
              onClose={closeModal}
              schedule={schedule}
              setSchedule={setSchedule}
              tasks={tasks}
            />
          )}

          {activeModal === "priorities" && (
            <PriorityDashboard
              visible={true}
              onClose={closeModal}
              tasks={tasks}
              setTasks={setTasks}
            />
          )}

          {activeModal === "peers" && (
            <StudyPeers
              visible={true}
              onClose={closeModal}
              peers={peers}
              setPeers={setPeers}
              studyGroups={studyGroups}
              setStudyGroups={setStudyGroups}
            />
          )}

          {activeModal === "progress" && (
            <ProgressTracker
              visible={true}
              onClose={closeModal}
              tasks={tasks}
              schedule={schedule}
            />
          )}

          {activeModal === "calendar" && (
            <BigCalendarComponent
              visible={true}
              onClose={closeModal}
              schedule={schedule}
              setSchedule={setSchedule}
              tasks={tasks}
            />
          )}

          {activeModal === "deadlines" && (
            <DeadlinesModal
              visible={true}
              onClose={closeModal}
              tasks={tasks}
              onTaskSelect={setSelectedTask}
            />
          )}

          {activeModal === "profile" && (
            <ProfileSettingsModal
              visible={true}
              onClose={closeModal}
            />
          )}

          {activeModal === "goals" && (
            <GoalsModal
              visible={true}
              onClose={closeModal}
              tasks={tasks}
            />
          )}
        </AnimatePresence>
      </div>
    </ConfigProvider>
  );
};

export default RedesignedDashboard;