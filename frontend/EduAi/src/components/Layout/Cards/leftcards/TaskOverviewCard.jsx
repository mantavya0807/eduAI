/**
 * Enhanced TaskOverviewCard - Modern task overview with progress analytics
 * @author EduAI Development Team
 */

import React, { useState, useMemo } from "react";
import { Card, Progress, Tag, Button, Tooltip, Badge, Empty, Statistic } from "antd";
import { 
  BookOutlined, 
  ClockCircleOutlined, 
  FireOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TaskOverviewCard component with task analytics and progress tracking
 */
const TaskOverviewCard = ({ 
  tasks = [], 
  selectedTask, 
  setSelectedTask, 
  onToggleComplete, 
  recentlyEstimated = false,
  onOpenProgress 
}) => {
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'details'

  // Calculate task analytics
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const overdue = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate total estimated time
    const totalEstimatedTime = tasks
      .filter(t => !t.completed && t.estimatedTime)
      .reduce((sum, t) => sum + t.estimatedTime, 0);

    return {
      total,
      completed,
      pending,
      highPriority,
      overdue,
      completionRate,
      totalEstimatedTime: Math.round(totalEstimatedTime * 10) / 10
    };
  }, [tasks]);

  // Get next upcoming tasks
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    return tasks
      .filter(t => !t.completed && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  }, [tasks]);

  // Handle task selection with animation feedback
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  // Format due date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const cardVariants = {
    hover: { 
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    tap: { 
      scale: 0.98,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      whileTap="tap"
      className="h-full max-h-full overflow-hidden"
    >
      <Card
        className="task-overview-card h-full max-h-full"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '1px solid rgba(153, 129, 255, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          maxHeight: '100%'
        }}
        styles={{ body: { padding: '0', height: '100%' } }}
      >
        {/* Header */}
        <div className="p-3 pb-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-purple-500/20">
                <BookOutlined className="text-[#9981FF] text-sm" />
              </div>
              <div>
                <h3 className="text-white text-sm font-semibold mb-0">
                  Task Overview
                </h3>
                <span className="text-gray-400 text-xs">
                  Academic Progress
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {analytics.overdue > 0 && (
                <Badge count={analytics.overdue} size="small">
                  <ExclamationCircleOutlined className="text-red-400" />
                </Badge>
              )}
              <Button
                type="text"
                size="small"
                icon={<BarChartOutlined />}
                onClick={onOpenProgress}
                className="text-gray-400 hover:text-[#9981FF]"
              />
            </div>
          </div>

          {/* Progress Statistics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <Statistic
                  title={<span className="text-gray-400 text-xs">Completion</span>}
                  value={analytics.completionRate}
                  suffix={<span className="text-xs text-gray-400">%</span>}
                  valueStyle={{ color: '#9981FF', fontSize: '16px', fontWeight: 'bold' }}
                />
                <Progress
                  type="circle"
                  percent={analytics.completionRate}
                  size={32}
                  strokeColor="#9981FF"
                  showInfo={false}
                />
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <Statistic
                title={<span className="text-gray-400 text-xs">Pending Tasks</span>}
                value={analytics.pending}
                valueStyle={{ color: '#faad14', fontSize: '16px', fontWeight: 'bold' }}
                prefix={<ClockCircleOutlined className="text-yellow-500" />}
              />
              {analytics.totalEstimatedTime > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  ~{analytics.totalEstimatedTime}h remaining
                </div>
              )}
            </div>
          </div>

          {/* Priority Alert */}
          {analytics.highPriority > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4"
            >
              <div className="flex items-center gap-2">
                <FireOutlined className="text-red-400" />
                <span className="text-red-300 text-sm font-medium">
                  {analytics.highPriority} high-priority task{analytics.highPriority > 1 ? 's' : ''} need attention
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Upcoming Tasks List */}
        <div className="px-4 pb-4 flex-1 min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-gray-300 text-sm font-medium mb-0">
              Upcoming Tasks
            </h4>
            <Tag
              color="purple"
              style={{ fontSize: '10px', padding: '2px 6px' }}
            >
              {upcomingTasks.length} items
            </Tag>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <AnimatePresence>
              {upcomingTasks.length > 0 ? upcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    task-item p-3 rounded-lg border cursor-pointer transition-all duration-200 
                    ${selectedTask?.id === task.id 
                      ? 'bg-purple-500/20 border-purple-500/50' 
                      : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 hover:border-gray-600/50'
                    }
                  `}
                  onClick={() => handleTaskSelect(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getPriorityColor(task.priority) }}
                        />
                        <h5 className="text-white text-sm font-medium truncate">
                          {task.name}
                        </h5>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400">
                          <CalendarOutlined className="mr-1" />
                          {formatDueDate(task.dueDate)}
                        </span>
                        
                        {task.estimatedTime && (
                          <span className="text-gray-500">
                            <ClockCircleOutlined className="mr-1" />
                            {task.estimatedTime}h
                          </span>
                        )}
                        
                        {task.course && (
                          <Tag size="small" color="blue" style={{ fontSize: '10px', margin: 0 }}>
                            {task.course}
                          </Tag>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {recentlyEstimated && selectedTask?.id === task.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                        />
                      )}
                      
                      <Tooltip title="Mark as complete">
                        <Button
                          type="text"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(task.id);
                          }}
                          className="text-gray-400 hover:text-green-400 opacity-60 hover:opacity-100"
                        />
                      </Tooltip>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <Empty
                    image={<TrophyOutlined className="text-4xl text-gray-600" />}
                    description={
                      <span className="text-gray-400">
                        {analytics.completed > 0 
                          ? "All caught up! Great job!" 
                          : "No tasks scheduled yet"
                        }
                      </span>
                    }
                    imageStyle={{ height: 40 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TaskOverviewCard;
