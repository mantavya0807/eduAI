/**
 * NEW AcademicInsightsCard Component - Smart Academic Analytics Dashboard  
 * Replaces existing Bottomrightcard with advanced insights and goal tracking
 * @author EduAI Development Team
 */

import React, { useState, useMemo } from "react";
import { Card, Progress, Statistic, Tag, Button, Tooltip, Badge, Timeline } from "antd";
import { 
  BarChartOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  StarOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AcademicInsightsCard with AI-powered insights and goal tracking
 */
const AcademicInsightsCard = ({ 
  tasks = [], 
  schedule = {}, 
  onOpenProgress, 
  onOpenGoals, 
  onOpenDeadlines 
}) => {
  const [insightMode, setInsightMode] = useState('overview'); // 'overview' | 'goals' | 'trends'

  // Calculate comprehensive academic metrics
  const analytics = useMemo(() => {
    const today = new Date();
    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i + 1);
      return date.toISOString().split('T')[0];
    });

    // Task analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Priority distribution
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const overdueTasks = tasks.filter(t => {
      if (t.completed || !t.dueDate) return false;
      return new Date(t.dueDate) < today;
    }).length;

    // Time analytics
    const totalEstimatedTime = tasks
      .filter(t => !t.completed && t.estimatedTime)
      .reduce((sum, t) => sum + t.estimatedTime, 0);
    
    const thisWeekTasks = tasks.filter(t => 
      t.dueDate && thisWeek.includes(t.dueDate) && !t.completed
    ).length;

    // Course performance
    const courseStats = tasks.reduce((acc, task) => {
      const course = task.course || 'General';
      if (!acc[course]) {
        acc[course] = { total: 0, completed: 0 };
      }
      acc[course].total++;
      if (task.completed) acc[course].completed++;
      return acc;
    }, {});

    const topCourse = Object.entries(courseStats)
      .map(([course, stats]) => ({
        course,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        total: stats.total
      }))
      .sort((a, b) => b.completionRate - a.completionRate)[0];

    // Weekly goal simulation
    const weeklyGoals = [
      {
        id: 1,
        title: "Complete 5 high-priority tasks",
        target: 5,
        current: 3,
        type: "tasks"
      },
      {
        id: 2,  
        title: "Study 15 hours this week",
        target: 15,
        current: 8.5,
        type: "time"
      },
      {
        id: 3,
        title: "Maintain 85% completion rate",
        target: 85,
        current: completionRate,
        type: "percentage"
      }
    ];

    return {
      totalTasks,
      completedTasks,
      completionRate,
      highPriorityTasks,
      overdueTasks,
      totalEstimatedTime: Math.round(totalEstimatedTime * 10) / 10,
      thisWeekTasks,
      topCourse,
      weeklyGoals,
      trend: completionRate >= 70 ? 'up' : completionRate >= 40 ? 'stable' : 'down'
    };
  }, [tasks, schedule]);

  // Get smart insights based on data
  const generateInsights = () => {
    const insights = [];
    
    if (analytics.overdueTasks > 0) {
      insights.push({
        type: 'warning',
        icon: <ExclamationCircleOutlined />,
        title: 'Overdue Tasks Alert',
        message: `${analytics.overdueTasks} task${analytics.overdueTasks > 1 ? 's' : ''} need immediate attention`,
        priority: 'high'
      });
    }

    if (analytics.completionRate >= 80) {
      insights.push({
        type: 'success',
        icon: <TrophyOutlined />,
        title: 'Excellent Progress!',
        message: `${analytics.completionRate}% completion rate - keep it up!`,
        priority: 'medium'
      });
    }

    if (analytics.totalEstimatedTime > 20) {
      insights.push({
        type: 'info',
        icon: <ClockCircleOutlined />,
        title: 'Heavy Workload Ahead',
        message: `${analytics.totalEstimatedTime}h of work remaining this week`,
        priority: 'medium'
      });
    }

    if (analytics.topCourse && analytics.topCourse.completionRate > 90) {
      insights.push({
        type: 'success',
        icon: <StarOutlined />,
        title: 'Course Excellence',
        message: `Outstanding performance in ${analytics.topCourse.course}`,
        priority: 'low'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }).slice(0, 3);
  };

  const insights = generateInsights();

  const cardVariants = {
    hover: { 
      scale: 1.01,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const insightVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const modeVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="h-full"
    >
      <Card
        className="academic-insights-card h-full"
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
          border: '1px solid rgba(245, 87, 108, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(245, 87, 108, 0.2)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <BarChartOutlined className="text-pink-100 text-lg" />
              </div>
              <div>
                <h3 className="text-white text-base font-semibold mb-0">
                  Academic Insights
                </h3>
                <span className="text-pink-100 text-xs">
                  AI-powered analytics
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge dot={insights.some(i => i.priority === 'high')}>
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={onOpenProgress}
                  className="text-pink-100 hover:text-white"
                />
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-white text-lg font-bold">{analytics.completionRate}%</span>
                {analytics.trend === 'up' && <ArrowUpOutlined className="text-green-400 text-xs" />}
                {analytics.trend === 'down' && <ArrowDownOutlined className="text-red-400 text-xs" />}
              </div>
              <div className="text-pink-200 text-xs">Completion</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="text-yellow-400 text-lg font-bold">{analytics.thisWeekTasks}</div>
              <div className="text-pink-200 text-xs">This Week</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="text-blue-400 text-lg font-bold">{analytics.totalEstimatedTime}h</div>
              <div className="text-pink-200 text-xs">Remaining</div>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 mb-3">
            {['overview', 'goals', 'trends'].map((mode) => (
              <Button
                key={mode}
                type={insightMode === mode ? 'primary' : 'text'}
                size="small"
                onClick={() => setInsightMode(mode)}
                className={insightMode === mode ? 'bg-pink-500 border-pink-500' : 'text-pink-200 hover:text-white'}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {insightMode === 'overview' && (
              <motion.div
                key="overview"
                variants={modeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-transparent"
              >
                {/* Smart Insights */}
                <div className="space-y-2">
                  <h4 className="text-white text-sm font-medium mb-2">Smart Insights</h4>
                  <AnimatePresence>
                    {insights.map((insight, index) => (
                      <motion.div
                        key={insight.title}
                        variants={insightVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ delay: index * 0.1 }}
                        className={`
                          insight-item p-3 rounded-lg border transition-all duration-200
                          ${insight.type === 'warning' 
                            ? 'bg-red-500/20 border-red-400/30' 
                            : insight.type === 'success'
                              ? 'bg-green-500/20 border-green-400/30'
                              : 'bg-blue-500/20 border-blue-400/30'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            text-lg
                            ${insight.type === 'warning' 
                              ? 'text-red-400' 
                              : insight.type === 'success'
                                ? 'text-green-400'
                                : 'text-blue-400'
                            }
                          `}>
                            {insight.icon}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white text-sm font-medium mb-1">
                              {insight.title}
                            </h5>
                            <p className="text-gray-200 text-xs">
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Top Course Performance */}
                {analytics.topCourse && (
                  <div className="mt-4">
                    <h4 className="text-white text-sm font-medium mb-2">Top Performance</h4>
                    <div className="bg-black/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">
                          {analytics.topCourse.course}
                        </span>
                        <span className="text-green-400 text-sm">
                          {analytics.topCourse.completionRate}%
                        </span>
                      </div>
                      <Progress
                        percent={analytics.topCourse.completionRate}
                        strokeColor="#52c41a"
                        showInfo={false}
                        size="small"
                      />
                      <div className="text-gray-300 text-xs mt-1">
                        {analytics.topCourse.total} tasks total
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {insightMode === 'goals' && (
              <motion.div
                key="goals"
                variants={modeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-3"
              >
                <h4 className="text-white text-sm font-medium mb-3">Weekly Goals</h4>
                <div className="space-y-3">
                  {analytics.weeklyGoals.map((goal) => {
                    const progress = Math.min((goal.current / goal.target) * 100, 100);
                    const isCompleted = goal.current >= goal.target;
                    
                    return (
                      <div key={goal.id} className="goal-item bg-black/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm">{goal.title}</span>
                          {isCompleted && <CheckCircleOutlined className="text-green-400" />}
                        </div>
                        
                        <div className="mb-2">
                          <Progress
                            percent={progress}
                            strokeColor={isCompleted ? "#52c41a" : "#faad14"}
                            showInfo={false}
                            size="small"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">
                            {goal.current} / {goal.target} 
                            {goal.type === 'time' && 'h'}
                            {goal.type === 'percentage' && '%'}
                          </span>
                          <span className={isCompleted ? "text-green-400" : "text-yellow-400"}>
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Button
                  block
                  type="dashed"
                  size="small"
                  onClick={onOpenGoals}
                  className="text-pink-200 border-pink-300/50 hover:text-white hover:border-pink-200 mt-3"
                >
                  Manage Goals
                </Button>
              </motion.div>
            )}

            {insightMode === 'trends' && (
              <motion.div
                key="trends"
                variants={modeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <h4 className="text-white text-sm font-medium mb-3">Recent Activity</h4>
                
                <Timeline
                  size="small"
                  items={[
                    {
                      color: 'green',
                      children: (
                        <div>
                          <div className="text-white text-xs">Completed MATH 230 homework</div>
                          <div className="text-gray-400 text-xs">2 hours ago</div>
                        </div>
                      )
                    },
                    {
                      color: 'blue', 
                      children: (
                        <div>
                          <div className="text-white text-xs">Started CMPSC 132 assignment</div>
                          <div className="text-gray-400 text-xs">1 day ago</div>
                        </div>
                      )
                    },
                    {
                      color: 'orange',
                      children: (
                        <div>
                          <div className="text-white text-xs">Estimated 3 tasks</div>
                          <div className="text-gray-400 text-xs">2 days ago</div>
                        </div>
                      )
                    }
                  ]}
                />
                
                <div className="mt-4 p-3 bg-black/20 rounded-lg">
                  <div className="text-white text-sm font-medium mb-2">This Week's Focus</div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">High Priority Tasks</span>
                      <span className="text-red-400">{analytics.highPriorityTasks}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">Average Daily Tasks</span>
                      <span className="text-blue-400">{Math.round(analytics.thisWeekTasks / 7)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">Study Hours Planned</span>
                      <span className="text-green-400">{analytics.totalEstimatedTime}h</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-3 border-t border-white/20 flex-shrink-0"
        >
          <div className="flex items-center justify-between">
            <Button
              type="text"
              size="small"
              onClick={onOpenDeadlines}
              className="text-pink-200 hover:text-white text-xs"
            >
              <CalendarOutlined className="mr-1" />
              View Deadlines
            </Button>
            <Button
              type="text"
              size="small"
              onClick={onOpenProgress}
              className="text-pink-200 hover:text-white text-xs"
            >
              <BulbOutlined className="mr-1" />
              Full Analytics
            </Button>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default AcademicInsightsCard;