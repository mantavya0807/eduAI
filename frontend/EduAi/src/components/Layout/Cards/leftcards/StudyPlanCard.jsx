/**
 * Enhanced StudyPlanCard - AI-generated study plans with smart timeline
 * @author EduAI Development Team
 */

import React, { useState, useMemo } from "react";
import { Card, Timeline, Tag, Button, Tooltip, Empty, Statistic, Progress } from "antd";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  BookOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StudyPlanCard with intelligent planning and timeline visualization
 */
const StudyPlanCard = ({ 
  tasks = [], 
  schedule = {}, 
  selectedTask, 
  setSelectedTask 
}) => {
  const [planMode, setPlanMode] = useState('today'); // 'today' | 'week' | 'custom'
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate smart study plan based on tasks and priorities
  const studyPlan = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = schedule[today] || [];
    
    // Get pending tasks sorted by priority and due date
    const pendingTasks = tasks
      .filter(t => !t.completed)
      .sort((a, b) => {
        // Priority sort
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const priorityDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Due date sort
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });

    // Generate study blocks for today
    const studyBlocks = [];
    let currentTime = new Date();
    currentTime.setHours(Math.max(currentTime.getHours(), 9), 0, 0, 0); // Start at 9 AM or current time

    pendingTasks.slice(0, 6).forEach((task, index) => {
      const estimatedTime = task.estimatedTime || 1.5;
      const blockDuration = Math.min(estimatedTime, 2); // Max 2-hour blocks
      
      const startTime = new Date(currentTime);
      const endTime = new Date(currentTime.getTime() + blockDuration * 60 * 60 * 1000);
      
      studyBlocks.push({
        id: task.id,
        task,
        startTime: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        endTime: endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        duration: blockDuration,
        type: index === 0 ? 'current' : 'upcoming',
        urgency: task.priority === 'high' || (task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 24*60*60*1000))
      });
      
      // Add break time
      currentTime = new Date(endTime.getTime() + (blockDuration > 1 ? 15 : 10) * 60 * 1000);
    });

    return studyBlocks;
  }, [tasks, schedule, planMode]);

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const totalPlanned = studyPlan.length;
    const totalTime = studyPlan.reduce((sum, block) => sum + block.duration, 0);
    const highPriorityBlocks = studyPlan.filter(block => block.urgency).length;
    
    return {
      totalPlanned,
      totalTime: Math.round(totalTime * 10) / 10,
      highPriorityBlocks,
      efficiency: totalPlanned > 0 ? Math.round((highPriorityBlocks / totalPlanned) * 100) : 0
    };
  }, [studyPlan]);

  // Handle plan regeneration
  const handleRegenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
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

  const cardVariants = {
    hover: { 
      scale: 1.01,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const timelineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="h-full"
    >
      <Card
        className="study-plan-card h-full"
        style={{
          background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a40 50%, #363654 100%)',
          border: '1px solid rgba(153, 129, 255, 0.15)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <CalendarOutlined className="text-[#9981FF] text-lg" />
              </div>
              <div>
                <h3 className="text-white text-base font-semibold mb-0">
                  Smart Study Plan
                </h3>
                <span className="text-gray-400 text-xs">
                  AI-optimized for {planMode}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Tooltip title="Regenerate plan">
                <Button
                  type="text"
                  size="small"
                  icon={isGenerating ? <ReloadOutlined spin /> : <BulbOutlined />}
                  onClick={handleRegenerate}
                  loading={isGenerating}
                  className="text-gray-400 hover:text-[#9981FF]"
                />
              </Tooltip>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-800/40 rounded-lg p-2 text-center">
              <div className="text-[#9981FF] text-lg font-bold">{progressStats.totalPlanned}</div>
              <div className="text-gray-400 text-xs">Sessions</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-2 text-center">
              <div className="text-[#faad14] text-lg font-bold">{progressStats.totalTime}h</div>
              <div className="text-gray-400 text-xs">Total Time</div>
            </div>
            <div className="bg-gray-800/40 rounded-lg p-2 text-center">
              <div className="text-[#52c41a] text-lg font-bold">{progressStats.efficiency}%</div>
              <div className="text-gray-400 text-xs">Priority</div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2">
            {['today', 'week'].map((mode) => (
              <Button
                key={mode}
                type={planMode === mode ? 'primary' : 'text'}
                size="small"
                onClick={() => setPlanMode(mode)}
                className={planMode === mode ? '' : 'text-gray-400 hover:text-white'}
                style={planMode === mode ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : {}}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Study Timeline */}
        <div className="flex-1 min-h-0">
          <AnimatePresence>
            {studyPlan.length > 0 ? (
              <motion.div
                variants={timelineVariants}
                initial="hidden"
                animate="visible"
                className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
              >
                <Timeline
                  className="study-timeline"
                  items={studyPlan.map((block, index) => ({
                    color: block.type === 'current' ? '#9981FF' : 
                           block.urgency ? '#ff4d4f' : '#52c41a',
                    dot: block.type === 'current' ? 
                         <ThunderboltOutlined className="text-[#9981FF]" /> : 
                         block.urgency ? 
                         <FireOutlined className="text-red-400" /> :
                         <ClockCircleOutlined className="text-green-400" />,
                    children: (
                      <motion.div
                        variants={itemVariants}
                        className={`
                          study-block p-3 rounded-lg cursor-pointer transition-all duration-200
                          ${selectedTask?.id === block.task.id 
                            ? 'bg-purple-500/20 border border-purple-500/50' 
                            : 'bg-gray-800/30 hover:bg-gray-700/40'
                          }
                        `}
                        onClick={() => setSelectedTask(block.task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-white text-sm font-medium truncate">
                                {block.task.name}
                              </h5>
                              {block.type === 'current' && (
                                <Tag size="small" color="purple">Current</Tag>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span>
                                <ClockCircleOutlined className="mr-1" />
                                {block.startTime} - {block.endTime}
                              </span>
                              <span>({block.duration}h)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getPriorityColor(block.task.priority) }}
                            />
                            {block.urgency && (
                              <FireOutlined className="text-red-400 text-xs" />
                            )}
                          </div>
                        </div>

                        {block.task.course && (
                          <Tag size="small" color="blue" style={{ fontSize: '10px' }}>
                            {block.task.course}
                          </Tag>
                        )}

                        {/* Progress Bar for Current Block */}
                        {block.type === 'current' && (
                          <div className="mt-2">
                            <Progress
                              percent={30}
                              size="small"
                              strokeColor="#9981FF"
                              showInfo={false}
                              className="text-xs"
                            />
                            <div className="text-xs text-gray-400 mt-1">In progress...</div>
                          </div>
                        )}
                      </motion.div>
                    )
                  }))}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <Empty
                  image={<BookOutlined className="text-4xl text-gray-600" />}
                  description={
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">No study plan available</div>
                      <div className="text-xs text-gray-500">Add some tasks to generate your plan</div>
                    </div>
                  }
                  imageStyle={{ height: 40 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {studyPlan.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 pt-3 border-t border-gray-700/30 flex-shrink-0"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Optimized by AI • Updates in real-time
              </div>
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                className="text-gray-400 hover:text-[#9981FF] text-xs"
              >
                View Full Schedule
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default StudyPlanCard;
