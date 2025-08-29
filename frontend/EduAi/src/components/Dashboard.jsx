import React, { useState, useEffect } from "react";
import { Experience } from "./components/Experience";
import NavbarDefault from "./components/Layout/Navbar/Navbar";
import Leftcardlayout from "./components/Layout/Cards/Leftcardlayout";
import Rightcardlayout from "./components/Layout/Cards/Rightcardlayout";
import Chatbot from "./Api/ChatbotApi";
import Aurora from "./components/Animations/Aurora";
import { ConfigProvider, theme, notification, Modal } from "antd";
import TaskEstimator from "./components/TaskEstimator";
import WeeklyPlanner from "./components/WeeklyPlanner";
import PriorityDashboard from "./components/PrioritySettings";
import StudyPeers from "./components/StudyPeers";
import ProgressTracker from "./components/ProgressTracker";
import BigCalendarComponent from "./components/Calendar/BigCalendarComponent";
import DeadlinesModal from "./components/DeadlinesModal";
import ProfileSettingsModal from "./components/ProfileSettings";
import GoalsModal from "./components/GoalsModal";
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  FireOutlined, 
  TeamOutlined,
  BarChartOutlined 
} from "@ant-design/icons";

// Main Dashboard Layout
const Dashboard = ({ tasks, setTasks, selectedTask, setSelectedTask, schedule, setSchedule, peers, setPeers }) => {
  // Modal visibility states
  const [showEstimator, setShowEstimator] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPriorities, setShowPriorities] = useState(false);
  const [showPeers, setShowPeers] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDeadlines, setShowDeadlines] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  
  const [recentlyEstimated, setRecentlyEstimated] = useState(false);
  const [recentlyMoved, setRecentlyMoved] = useState(false);

  // Handle task estimation
  const handleTaskEstimate = (difficulty, focus, time) => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, difficulty, focus, estimatedTime: time }
          : task
      );
      setTasks(updatedTasks);
      setRecentlyEstimated(true);
      
      // Update the selected task
      setSelectedTask({...selectedTask, difficulty, focus, estimatedTime: time});
      
      // Show success notification
      notification.success({
        message: 'Time Estimated',
        description: `"${selectedTask.name}" estimated to take ${time} hours to complete.`,
        placement: 'bottomRight',
      });
      
      // Reset flag after some time
      setTimeout(() => setRecentlyEstimated(false), 5000);
    }
  };

  // Handle task completion toggle
  const handleToggleComplete = (taskId, isCompleted) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: isCompleted }
        : task
    );
    setTasks(updatedTasks);
    
    // Update the selected task if it's the one being toggled
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({...selectedTask, completed: isCompleted});
    }
    
    // Show notification
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      notification.info({
        message: isCompleted ? 'Task Completed' : 'Task Reopened',
        description: `"${task.name}" has been marked as ${isCompleted ? 'completed' : 'pending'}.`,
        placement: 'bottomRight',
      });
    }
  };

  // Handle task movement in schedule
  const handleTaskMove = (fromDay, toDay, task) => {
    const updatedSchedule = { ...schedule };
    
    // Remove from original day
    updatedSchedule[fromDay] = updatedSchedule[fromDay].filter(t => t !== task);
    
    // Add to new day
    updatedSchedule[toDay] = [...updatedSchedule[toDay], task];
    
    setSchedule(updatedSchedule);
    setRecentlyMoved(true);
    
    // Reset flag after some time
    setTimeout(() => setRecentlyMoved(false), 5000);
  };
  
  // Handle task selection for details
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    
    // Show notification
    notification.info({
      message: 'Task Selected',
      description: `You've selected "${task.name}". You can now estimate time, view details, or mark it as complete.`,
      placement: 'bottomRight',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Left Card Layout */}
      <Leftcardlayout 
        tasks={tasks}
        selectedTask={selectedTask}
        setSelectedTask={handleTaskSelect}
        onEstimate={handleTaskEstimate}
        onToggleComplete={handleToggleComplete}
        recentlyEstimated={recentlyEstimated}
      />
      
      {/* Center Experience */}
      <Experience />
      
      {/* Right Card Layout */}
      <Rightcardlayout 
        peers={peers}
        schedule={schedule}
        onTaskMove={handleTaskMove}
        tasks={tasks}
        recentlyMoved={recentlyMoved}
        onOpenDeadlines={() => setShowDeadlines(true)}
        onOpenGoals={() => setShowGoals(true)}
      />
      
      {/* Modals */}
      {/* Time Estimator Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <ClockCircleOutlined className="text-[#9981FF] mr-2" />
            <span>Task Time Estimator</span>
          </div>
        }
        open={showEstimator}
        onCancel={() => setShowEstimator(false)}
        footer={null}
        width="80%"
      >
        <TaskEstimator 
          task={selectedTask || (tasks && tasks[0])}
          onEstimate={handleTaskEstimate}
        />
      </Modal>
      
      {/* Weekly Planner Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <CalendarOutlined className="text-[#9981FF] mr-2" />
            <span>Weekly Planning</span>
          </div>
        }
        open={showSchedule}
        onCancel={() => setShowSchedule(false)}
        footer={null}
        width="90%"
      >
        <WeeklyPlanner 
          schedule={schedule}
          onTaskMove={handleTaskMove}
        />
      </Modal>
      
      {/* Priority Dashboard Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <FireOutlined className="text-[#9981FF] mr-2" />
            <span>Priority Dashboard</span>
          </div>
        }
        open={showPriorities}
        onCancel={() => setShowPriorities(false)}
        footer={null}
        width="90%"
      >
        <PriorityDashboard tasks={tasks} />
      </Modal>
      
      {/* Study Peers Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <TeamOutlined className="text-[#9981FF] mr-2" />
            <span>Study Groups & Peers</span>
          </div>
        }
        open={showPeers}
        onCancel={() => setShowPeers(false)}
        footer={null}
        width="90%"
      >
        <StudyPeers 
          peers={peers}
          recommendedGroups={[]} // Your study groups here
        />
      </Modal>
      
      {/* Progress Tracker Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <BarChartOutlined className="text-[#9981FF] mr-2" />
            <span>Progress Tracker</span>
          </div>
        }
        open={showProgress}
        onCancel={() => setShowProgress(false)}
        footer={null}
        width="90%"
      >
        <ProgressTracker 
          tasks={tasks}
          onToggleComplete={handleToggleComplete}
        />
      </Modal>
      
      {/* Calendar Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <CalendarOutlined className="text-[#9981FF] mr-2" />
            <span>Full Calendar View</span>
          </div>
        }
        open={showCalendar}
        onCancel={() => setShowCalendar(false)}
        footer={null}
        width="90%"
      >
        <BigCalendarComponent events={schedule} />
      </Modal>

      {/* Deadlines Modal */}
      <DeadlinesModal
        visible={showDeadlines}
        onClose={() => setShowDeadlines(false)}
        tasks={tasks}
      />

      {/* Goals Modal */}
      <GoalsModal
        visible={showGoals}
        onClose={() => setShowGoals(false)}
      />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        userData={{
          name: "Keshav Khandelwal",
          email: "kk5431@psu.edu",
          preferences: {
            dailyStudyHours: 4,
            preferredStudyTime: "evening",
            difficultyAdjustment: 1.1,
            focusAdjustment: 0.9
          },
          courses: [
            { id: 1, name: "CMPSC 221", difficulty: 8, focus: 7 },
            { id: 2, name: "CMPSC 360", difficulty: 9, focus: 8 },
            { id: 3, name: "MATH 141", difficulty: 7, focus: 6 },
            { id: 4, name: "PHYS 212", difficulty: 8, focus: 7 },
            { id: 5, name: "ENGL 202C", difficulty: 5, focus: 5 }
          ],
          notifications: {
            deadlineReminders: true,
            studyReminders: true,
            peerActivity: false,
            progressReports: true
          }
        }}
      />
    </div>
  );
};

export default Dashboard;