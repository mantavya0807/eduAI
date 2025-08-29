/**
 * Enhanced QuickActionsCard - Smart action buttons with contextual intelligence
 * @author EduAI Development Team
 */

import React, { useState, useMemo } from "react";
import { Card, Button, Tooltip, Badge, Progress, Tag } from "antd";
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  PlusOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  BulbOutlined,
  RocketOutlined,
  BarChartOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

/**
 * QuickActionsCard with smart contextual actions
 */
const QuickActionsCard = ({ 
  selectedTask, 
  tasks = [], 
  onEstimate, 
  onOpenEstimator, 
  onOpenPriorities, 
  recentlyEstimated = false 
}) => {
  const [activeAction, setActiveAction] = useState(null);

  // Calculate smart suggestions based on current context
  const suggestions = useMemo(() => {
    const needsEstimation = tasks.filter(t => !t.completed && !t.estimatedTime).length;
    const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high').length;
    const overdueTasks = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    
    return {
      needsEstimation,
      highPriorityTasks,
      overdueTasks,
      hasSelectedTask: !!selectedTask && !selectedTask.completed
    };
  }, [tasks, selectedTask]);

  // Smart action configurations
  const quickActions = [
    {
      id: 'estimate',
      title: 'Time Estimator',
      subtitle: selectedTask ? `Estimate "${selectedTask.name}"` : 'Select a task first',
      icon: <ClockCircleOutlined />,
      color: '#9981FF',
      gradient: 'linear-gradient(135deg, #9981FF 0%, #C09BFF 100%)',
      disabled: !suggestions.hasSelectedTask,
      badge: suggestions.needsEstimation,
      action: () => {
        if (selectedTask && onOpenEstimator) {
          onOpenEstimator();
        }
      },
      description: 'Get AI-powered time estimates for your tasks'
    },
    {
      id: 'priorities',
      title: 'Priority Manager',
      subtitle: `${suggestions.highPriorityTasks} high priority tasks`,
      icon: <FireOutlined />,
      color: '#ff4d4f',
      gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
      disabled: false,
      badge: suggestions.highPriorityTasks,
      urgent: suggestions.overdueTasks > 0,
      action: () => {
        if (onOpenPriorities) {
          onOpenPriorities();
        }
      },
      description: 'Manage task priorities and urgency levels'
    },
    {
      id: 'focus',
      title: 'Focus Mode',
      subtitle: 'Start productive session',
      icon: <ThunderboltOutlined />,
      color: '#faad14',
      gradient: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
      disabled: !suggestions.hasSelectedTask,
      action: () => {
        // TODO: Implement focus mode
        console.log('Focus mode activated');
      },
      description: 'Enter distraction-free study mode'
    },
    {
      id: 'insights',
      title: 'Smart Insights',
      subtitle: 'Performance analytics',
      icon: <BulbOutlined />,
      color: '#52c41a',
      gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
      disabled: tasks.length === 0,
      action: () => {
        // TODO: Implement insights modal
        console.log('Smart insights opened');
      },
      description: 'AI-powered study recommendations'
    }
  ];

  const handleActionClick = (action) => {
    setActiveAction(action.id);
    action.action();
    
    // Reset active state after animation
    setTimeout(() => setActiveAction(null), 300);
  };

  const cardVariants = {
    hover: { 
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const actionVariants = {
    idle: { scale: 1, rotateY: 0 },
    hover: { 
      scale: 1.05, 
      rotateY: 5,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: { 
      scale: 0.95,
      transition: { type: "spring", stiffness: 600, damping: 30 }
    },
    active: { 
      scale: 1.1,
      rotateY: 10,
      transition: { type: "spring", stiffness: 500, damping: 20 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="h-full"
    >
      <Card
        className="quick-actions-card h-full"
        style={{
          background: 'linear-gradient(135deg, #1f1f2e 0%, #2d2d44 50%, #3a3a5c 100%)',
          border: '1px solid rgba(153, 129, 255, 0.15)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '20px', height: '100%' } }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <RocketOutlined className="text-[#9981FF] text-lg" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold mb-0">
                Quick Actions
              </h3>
              <span className="text-gray-400 text-xs">
                Smart productivity tools
              </span>
            </div>
          </div>

          {/* Context Status */}
          {suggestions.hasSelectedTask && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-300 text-sm">
                  Ready to work on: <strong>{selectedTask.name}</strong>
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 h-full">
          <AnimatePresence>
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                variants={actionVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                animate={activeAction === action.id ? "active" : "idle"}
                transition={{ delay: index * 0.05 }}
              >
                <Tooltip 
                  title={action.description}
                  placement="top"
                  styles={{ root: { fontSize: '12px' } }}
                >
                  <div
                    className={`
                      relative action-button h-24 rounded-xl cursor-pointer transition-all duration-200
                      ${action.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-lg'
                      }
                    `}
                    style={{
                      background: action.disabled 
                        ? 'linear-gradient(135deg, #404040 0%, #505050 100%)'
                        : action.gradient,
                      boxShadow: action.disabled 
                        ? 'none'
                        : `0 4px 20px ${action.color}20`
                    }}
                    onClick={() => !action.disabled && handleActionClick(action)}
                  >
                    {/* Badge */}
                    {action.badge > 0 && (
                      <Badge
                        count={action.badge}
                        size="small"
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 2
                        }}
                      />
                    )}

                    {/* Urgent Indicator */}
                    {action.urgent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 left-2 w-3 h-3 rounded-full bg-red-500 animate-pulse"
                      />
                    )}

                    {/* Content */}
                    <div className="p-4 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className={`
                          text-2xl ${action.disabled ? 'text-gray-500' : 'text-white'}
                        `}>
                          {action.icon}
                        </div>
                        
                        {recentlyEstimated && action.id === 'estimate' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                          />
                        )}
                      </div>

                      <div>
                        <h4 className={`
                          text-sm font-semibold mb-1 
                          ${action.disabled ? 'text-gray-400' : 'text-white'}
                        `}>
                          {action.title}
                        </h4>
                        <p className={`
                          text-xs leading-tight
                          ${action.disabled ? 'text-gray-500' : 'text-gray-200'}
                        `}>
                          {action.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    {!action.disabled && (
                      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                    )}
                  </div>
                </Tooltip>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
        >
          <div className="flex items-center gap-2">
            <TrophyOutlined className="text-yellow-500 text-sm" />
            <span className="text-gray-400 text-xs">
              {suggestions.hasSelectedTask 
                ? "Actions available for selected task" 
                : "Select a task to unlock more actions"
              }
            </span>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default QuickActionsCard;
