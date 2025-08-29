/**
 * Enhanced Rightcardlayout - Social features and progress management
 * Features study groups, peer connections, and academic analytics
 * @author EduAI Development Team
 */

import React from "react";
import { motion } from "framer-motion";
import StudyGroupCard from "./rightcards/StudyGroupCard";
import PeerNetworkCard from "./rightcards/PeerNetworkCard"; 
import AcademicInsightsCard from "./rightcards/AcademicInsightsCard";

/**
 * Enhanced right sidebar layout with social and analytics focus
 * @param {Object} props - Component props
 * @param {Array} props.peers - Array of study peers
 * @param {Array} props.studyGroups - Array of study groups
 * @param {Object} props.schedule - Schedule data
 * @param {Array} props.tasks - Tasks array
 * @param {Function} props.onTaskMove - Task movement handler
 * @param {boolean} props.recentlyMoved - Recent movement indicator
 * @param {Function} props.onOpenDeadlines - Deadlines modal opener
 * @param {Function} props.onOpenGoals - Goals modal opener
 * @param {Function} props.onOpenPeers - Peer finder opener
 */
const Rightcardlayout = ({ 
  peers = [], 
  studyGroups = [],
  schedule = {}, 
  tasks = [], 
  onTaskMove, 
  recentlyMoved = false,
  onOpenDeadlines,
  onOpenGoals,
  onOpenPeers,
  onOpenProgress
}) => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      x: 50,
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
      className="right-layout-container flex flex-col gap-3 h-full min-h-0 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Academic Insights Card - Top Priority */}
      <motion.div variants={cardVariants} className="flex-shrink-0">
        <AcademicInsightsCard 
          tasks={tasks}
          schedule={schedule}
          onOpenProgress={onOpenProgress}
          onOpenGoals={onOpenGoals}
          onOpenDeadlines={onOpenDeadlines}
        />
      </motion.div>

      {/* Study Groups Card - Middle */}
      <motion.div variants={cardVariants} className="flex-shrink-0">
        <StudyGroupCard 
          studyGroups={studyGroups}
          onOpenPeers={onOpenPeers}
          recentActivity={recentlyMoved}
        />
      </motion.div>

      {/* Peer Network Card - Bottom, flexible */}
      <motion.div variants={cardVariants} className="flex-1 min-h-0">
        <PeerNetworkCard 
          peers={peers}
          onOpenPeers={onOpenPeers}
          tasks={tasks}
          onTaskMove={onTaskMove}
        />
      </motion.div>
    </motion.div>
  );
};

export default Rightcardlayout;