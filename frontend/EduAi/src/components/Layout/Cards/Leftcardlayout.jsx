/**
 * Enhanced Leftcardlayout - Modern Task Management Cards Layout
 * Features proper data integration, animations, and professional styling
 * @author EduAI Development Team
 */

import React from "react";
import { motion } from "framer-motion";
import TaskOverviewCard from "./leftcards/TaskOverviewCard";
import QuickActionsCard from "./leftcards/QuickActionsCard";
import StudyPlanCard from "./leftcards/StudyPlanCard";

/**
 * Enhanced left sidebar layout with task management focus
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of tasks
 * @param {Object} props.selectedTask - Currently selected task
 * @param {Function} props.setSelectedTask - Task selection handler
 * @param {Function} props.onEstimate - Time estimation handler
 * @param {Function} props.onToggleComplete - Task completion handler
 * @param {boolean} props.recentlyEstimated - Recent estimation indicator
 */
const Leftcardlayout = ({ 
  tasks = [], 
  selectedTask, 
  setSelectedTask, 
  onEstimate, 
  onToggleComplete, 
  recentlyEstimated = false,
  schedule = {},
  onOpenEstimator,
  onOpenProgress,
  onOpenPriorities 
}) => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      className="left-layout-container flex flex-col gap-3 h-full min-h-0 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Task Overview Card - Top Priority */}
      <motion.div variants={cardVariants} className="flex-shrink-0">
        <TaskOverviewCard 
          tasks={tasks}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
          onToggleComplete={onToggleComplete}
          recentlyEstimated={recentlyEstimated}
          onOpenProgress={onOpenProgress}
        />
      </motion.div>

      {/* Quick Actions Card - Middle */}
      <motion.div variants={cardVariants} className="flex-shrink-0">
        <QuickActionsCard 
          selectedTask={selectedTask}
          tasks={tasks}
          onEstimate={onEstimate}
          onOpenEstimator={onOpenEstimator}
          onOpenPriorities={onOpenPriorities}
          recentlyEstimated={recentlyEstimated}
        />
      </motion.div>

      {/* Study Plan Card - Bottom, flexible */}
      <motion.div variants={cardVariants} className="flex-1 min-h-0">
        <StudyPlanCard 
          tasks={tasks}
          schedule={schedule}
          selectedTask={selectedTask}
          setSelectedTask={setSelectedTask}
        />
      </motion.div>
    </motion.div>
  );
};

export default Leftcardlayout;