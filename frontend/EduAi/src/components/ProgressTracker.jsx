/**
 * Enhanced ProgressTracker with LLM-powered natural language command processing
 * Supports commands like "analyze my progress in CMPSC", "show completion rate", etc.
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Progress, List, Tag, Badge, Tabs, Button, Statistic, Alert, Select, DatePicker, notification } from 'antd';
import { 
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined,
  FireOutlined,
  LineChartOutlined,
  RobotOutlined,
  BookOutlined,
  StarOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

/**
 * LLM Command Structure for Progress Tracking
 */
const PROGRESS_COMMANDS = {
  "analyze_progress": {
    required: ["metric_type"],
    optional: ["course_filter", "timeframe", "comparison_period"],
    action: "generate_progress_analysis"
  },
  "track_metric": {
    required: ["metric_name", "value"],
    optional: ["course", "notes"],
    action: "log_progress_metric"
  },
  "show_completion": {
    required: [],
    optional: ["timeframe", "course_filter"],
    action: "display_completion_stats"
  },
  "compare_progress": {
    required: ["comparison_type"],
    optional: ["periods", "courses"],
    action: "compare_progress_periods"
  },
  "set_goal": {
    required: ["goal_type", "target_value"],
    optional: ["deadline", "course"],
    action: "create_progress_goal"
  }
};

/**
 * Task Item Component with Progress Tracking
 */
const TaskItem = ({ task, onToggleComplete, showDetails = false }) => {
  const [expanded, setExpanded] = useState(showDetails);
  
  const getTaskIcon = () => {
    if (task.completed) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (task.priority === 'high') return <FireOutlined style={{ color: '#ff4d4f' }} />;
    return <ClockCircleOutlined style={{ color: '#faad14' }} />;
  };

  const getProgressColor = () => {
    if (task.completed) return '#52c41a';
    if (task.priority === 'high') return '#ff4d4f';
    return '#9981FF';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2"
    >
      <Card 
        size="small" 
        className="bg-[#26262F] border-gray-600 hover:border-[#9981FF] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {getTaskIcon()}
            <div className="flex-1">
              <h5 className={`m-0 ${task.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                {task.name}
              </h5>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span>Due: {task.dueDate}</span>
                <Tag size="small" color={task.priority === 'high' ? 'red' : 'blue'}>
                  {task.priority}
                </Tag>
                {task.estimatedTime && (
                  <span>Est: {task.estimatedTime}h</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Progress
              type="circle"
              percent={task.completed ? 100 : 0}
              width={40}
              strokeColor={getProgressColor()}
              format={() => task.completed ? '✓' : '○'}
            />
            <Button
              size="small"
              type={task.completed ? "default" : "primary"}
              style={!task.completed ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : {}}
              onClick={() => onToggleComplete(task.id, !task.completed)}
            >
              {task.completed ? 'Reopen' : 'Complete'}
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Course:</span>
                <p className="text-white m-0">{task.course || 'General'}</p>
              </div>
              <div>
                <span className="text-gray-400">Difficulty:</span>
                <p className="text-white m-0">{task.difficulty || 'N/A'}/10</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

/**
 * Weekly Progress Component
 */
const WeeklyProgress = ({ completedHours, totalHours, streak }) => {
  const weekProgress = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = dayjs();
    
    return days.map((day, index) => {
      const dayDate = today.startOf('week').add(index + 1, 'day');
      const isToday = dayDate.isSame(today, 'day');
      const isPast = dayDate.isBefore(today, 'day');
      
      // Mock data for demonstration
      const dayHours = isPast ? Math.random() * 4 : 0;
      const percent = Math.round((dayHours / 6) * 100);
      
      return {
        day,
        date: dayDate.format('DD'),
        hours: dayHours,
        percent: Math.min(100, percent),
        isToday,
        isPast
      };
    });
  }, []);

  const getProgressColor = (percent) => {
    if (percent >= 80) return '#52c41a';
    if (percent >= 50) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div className="weekly-progress bg-[#26262F] p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="text-white m-0">This Week's Progress</h4>
          <p className="text-gray-400 text-sm m-0">Study hours per day</p>
        </div>
        <div className="text-right">
          <div className="text-[#9981FF] font-bold text-lg">{streak} days</div>
          <div className="text-gray-400 text-xs">Study streak</div>
        </div>
      </div>
      
      <div className="flex justify-between items-end gap-2 mb-4" style={{ height: '80px' }}>
        {weekProgress.map((day, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full rounded-t transition-all duration-500 ${
                day.isToday ? 'bg-[#9981FF]' : 'bg-[#26262F]'
              }`}
              style={{ 
                height: `${Math.max(50, day.percent)}px`, 
                transition: 'height 0.5s ease',
                opacity: day.percent > 0 ? 1 : 0.5
              }}
            ></div>
            <div className={`text-xs mt-1 ${day.isToday ? 'text-[#9981FF] font-bold' : 'text-gray-400'}`}>
              {day.day}
              {day.percent > 0 && (
                <div className="text-xs">{day.percent}%</div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <Progress 
        percent={Math.round((completedHours / totalHours) * 100)} 
        status="active" 
        strokeColor="#9981FF"
        className="mt-4"
      />
    </div>
  );
};

/**
 * Enhanced ProgressTracker with LLM Command Processing
 */
const ProgressTracker = ({ 
  tasks, 
  onToggleComplete,
  chatCommand = null,
  getModalContext 
}) => {
  // Core state
  const [taskList, setTaskList] = useState(tasks);
  const [activeTab, setActiveTab] = useState('1');
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [recentlyCompletedTask, setRecentlyCompletedTask] = useState(null);

  // LLM command processing state
  const [lastCommand, setLastCommand] = useState(null);
  const [commandResponse, setCommandResponse] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Progress metrics
  const [progressGoals, setProgressGoals] = useState([]);
  const [studyMetrics, setStudyMetrics] = useState({});

  /**
   * Provide modal context for chat integration
   */
  const provideModalContext = useCallback(() => {
    if (getModalContext) {
      const completed = taskList.filter(task => task.completed);
      const pending = taskList.filter(task => !task.completed);
      const completionRate = Math.round((completed.length / taskList.length) * 100) || 0;
      
      return getModalContext('progress', {
        totalTasks: taskList.length,
        completedTasks: completed.length,
        pendingTasks: pending.length,
        completionRate: completionRate,
        selectedTimeframe: selectedTimeframe,
        selectedCourse: selectedCourse,
        studyStreak: 5, // Mock data
        weeklyHours: 12, // Mock data
        activeGoals: progressGoals.length
      });
    }
    return '';
  }, [getModalContext, taskList, selectedTimeframe, selectedCourse, progressGoals]);

  /**
   * Handle incoming chat commands
   */
  useEffect(() => {
    if (chatCommand && chatCommand.modal_target === 'progress') {
      handleLLMCommand(chatCommand);
    }
  }, [chatCommand]);

  /**
   * Build LLM system prompt for progress tracking
   */
  const buildProgressPrompt = useCallback((userMessage, currentData) => {
    return `You are an intelligent Progress Tracking assistant. Analyze user commands and return structured JSON.

FEATURE CONTEXT:
- Feature: Academic Progress Analysis & Goal Tracking
- Available actions: analyze_progress, track_metric, show_completion, compare_progress, set_goal
- Total tasks: ${currentData.totalTasks}
- Completed: ${currentData.completedTasks} (${currentData.completionRate}%)
- Pending: ${currentData.pendingTasks}
- Current timeframe: ${currentData.selectedTimeframe}
- Available courses: ${[...new Set(taskList.map(t => t.course || 'General'))].join(', ')}
- Study streak: ${currentData.studyStreak} days
- Weekly hours: ${currentData.weeklyHours}

INTENT ANALYSIS:
1. Determine PRIMARY INTENT: QUERY|ANALYZE|TRACK|COMPARE|GOAL
2. Extract metric types (completion, hours, streak, grades)
3. Extract timeframes (week, month, semester)
4. Extract course filters
5. Identify missing REQUIRED parameters

REQUIRED PARAMETERS FOR ACTIONS:
- analyze_progress: metric_type (required)
- track_metric: metric_name, value (required)
- show_completion: none required
- compare_progress: comparison_type (required)
- set_goal: goal_type, target_value (required)

RESPONSE FORMAT:
{
  "intent": "QUERY|ANALYZE|TRACK|COMPARE|GOAL",
  "action": "analyze_progress|track_metric|show_completion|compare_progress|set_goal",
  "confidence": 0.95,
  "params": {
    "metric_type": "completion|hours|streak|grades",
    "course_filter": "MATH|CMPSC|ALL",
    "timeframe": "week|month|semester",
    "comparison_type": "weekly|monthly|course",
    "goal_type": "completion|hours|streak",
    "target_value": "numeric value",
    "value": "tracked value"
  },
  "missing": ["required_param1"],
  "modal_target": "progress",
  "response": "Natural language response",
  "questions": ["Specific question?"],
  "ready_to_execute": true|false
}

EXAMPLES:
- "analyze my progress this week" → action: "analyze_progress", params: {metric_type: "completion", timeframe: "week"}
- "show completion rate for MATH" → action: "show_completion", params: {course_filter: "MATH"}
- "track 3 hours study time" → action: "track_metric", params: {metric_name: "study_hours", value: "3"}
- "compare this month to last month" → action: "compare_progress", params: {comparison_type: "monthly"}

USER MESSAGE: "${userMessage}"
JSON RESPONSE:`;
  }, [taskList]);

  /**
   * Process LLM command for progress tracking
   */
  const handleLLMCommand = async (commandData) => {
    setProcessingCommand(true);
    setLastCommand(commandData);

    try {
      switch (commandData.action) {
        case "analyze_progress":
          return await executeAnalyzeProgress(commandData.params);
        case "track_metric":
          return await executeTrackMetric(commandData.params);
        case "show_completion":
          return await executeShowCompletion(commandData.params);
        case "compare_progress":
          return await executeCompareProgress(commandData.params);
        case "set_goal":
          return await executeSetGoal(commandData.params);
        default:
          return handleGenericProgressCommand(commandData);
      }
    } catch (error) {
      console.error('Progress tracker command error:', error);
      setCommandResponse('Sorry, I encountered an error processing that command.');
    } finally {
      setProcessingCommand(false);
    }
  };

  /**
   * Execute analyze progress command
   */
  const executeAnalyzeProgress = async (params) => {
    const { metric_type, course_filter, timeframe, comparison_period } = params;
    
    if (!metric_type) {
      setCommandResponse("What would you like me to analyze? Examples: 'completion rate', 'study hours', 'task difficulty'");
      return "Please specify what to analyze.";
    }

    // Filter tasks if course specified
    let analysisTasks = taskList;
    if (course_filter && course_filter.toLowerCase() !== 'all') {
      analysisTasks = taskList.filter(task => 
        (task.course || '').toLowerCase().includes(course_filter.toLowerCase())
      );
      setSelectedCourse(course_filter);
    }

    if (timeframe) {
      setSelectedTimeframe(timeframe);
    }

    // Generate analysis based on metric type
    const completed = analysisTasks.filter(t => t.completed);
    const pending = analysisTasks.filter(t => !t.completed);
    const completionRate = Math.round((completed.length / analysisTasks.length) * 100) || 0;
    const totalEstimatedHours = analysisTasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    const completedHours = completed.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);

    let analysis = '';
    
    switch (metric_type.toLowerCase()) {
      case 'completion':
        analysis = `**📊 Completion Rate Analysis:**

✅ **Overall Progress:** ${completionRate}% complete
📈 **Tasks Completed:** ${completed.length} of ${analysisTasks.length}
⏳ **Remaining:** ${pending.length} tasks

**💡 Insights:**
${completionRate >= 80 ? '🎉 Excellent progress! You\'re on track.' : ''}
${completionRate < 50 ? '⚠️ Consider focusing on smaller, achievable tasks first.' : ''}
${pending.filter(t => t.priority === 'high').length > 0 ? `🔥 ${pending.filter(t => t.priority === 'high').length} high-priority tasks need attention.` : ''}`;
        break;
        
      case 'hours':
        analysis = `**⏰ Study Time Analysis:**

📚 **Total Estimated:** ${totalEstimatedHours} hours
✅ **Hours Completed:** ${completedHours} hours  
⏳ **Hours Remaining:** ${totalEstimatedHours - completedHours} hours
📊 **Time Efficiency:** ${Math.round((completedHours / totalEstimatedHours) * 100) || 0}%

**💡 Time Management Insights:**
${totalEstimatedHours - completedHours > 20 ? '⚠️ Heavy workload ahead - consider breaking tasks down.' : ''}
${completedHours > 0 ? `🎯 Average ${Math.round(completedHours / completed.length * 10) / 10}h per completed task.` : ''}`;
        break;
        
      default:
        analysis = `**📈 General Progress Analysis:**

Current Status: ${completionRate}% complete (${completed.length}/${analysisTasks.length} tasks)
${course_filter && course_filter !== 'all' ? `Course Focus: ${course_filter}` : 'All Courses'}
Timeframe: ${timeframe || 'Current'}

Keep up the momentum! 🚀`;
    }

    setCommandResponse(analysis);
    
    notification.success({
      message: 'Progress Analysis Complete',
      description: `Generated ${metric_type} analysis for your tasks`,
      placement: 'topRight'
    });
    
    return analysis;
  };

  /**
   * Execute track metric command
   */
  const executeTrackMetric = async (params) => {
    const { metric_name, value, course, notes } = params;
    
    if (!metric_name || !value) {
      setCommandResponse("I need both a metric name and value. Example: 'Track 3 hours study time' or 'Log 85% quiz score'");
      return "Missing metric information.";
    }

    const numericValue = parseFloat(value);
    const timestamp = new Date().toISOString();
    
    // Store the metric (in a real app, this would go to a database)
    const newMetric = {
      id: Date.now(),
      name: metric_name,
      value: numericValue,
      course: course || 'General',
      notes: notes || '',
      timestamp: timestamp,
      date: new Date().toLocaleDateString()
    };

    // Update study metrics
    setStudyMetrics(prev => ({
      ...prev,
      [metric_name]: [...(prev[metric_name] || []), newMetric]
    }));

    const response = `✅ **Metric Tracked Successfully!**

📊 **${metric_name}:** ${numericValue}${metric_name.includes('hours') ? 'h' : metric_name.includes('score') ? '%' : ''}
${course ? `📚 **Course:** ${course}` : ''}
📅 **Date:** ${new Date().toLocaleDateString()}
${notes ? `📝 **Notes:** ${notes}` : ''}

Your progress is being tracked! Keep logging your achievements. 🎯`;

    setCommandResponse(response);
    
    notification.success({
      message: 'Metric Tracked',
      description: `${metric_name}: ${numericValue} logged successfully`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Execute show completion command
   */
  const executeShowCompletion = async (params) => {
    const { timeframe, course_filter } = params;

    // Apply filters
    let filteredTasks = taskList;
    if (course_filter && course_filter.toLowerCase() !== 'all') {
      filteredTasks = taskList.filter(task => 
        (task.course || '').toLowerCase().includes(course_filter.toLowerCase())
      );
    }

    const completed = filteredTasks.filter(t => t.completed);
    const pending = filteredTasks.filter(t => !t.completed);
    const completionRate = Math.round((completed.length / filteredTasks.length) * 100) || 0;

    // Course breakdown
    const courseBreakdown = {};
    filteredTasks.forEach(task => {
      const course = task.course || 'General';
      if (!courseBreakdown[course]) {
        courseBreakdown[course] = { total: 0, completed: 0 };
      }
      courseBreakdown[course].total++;
      if (task.completed) courseBreakdown[course].completed++;
    });

    let response = `**📊 Completion Statistics:**

🎯 **Overall:** ${completionRate}% (${completed.length}/${filteredTasks.length} tasks)
✅ **Completed:** ${completed.length} tasks
⏳ **Remaining:** ${pending.length} tasks

**📚 By Course:**
`;

    Object.entries(courseBreakdown).forEach(([course, stats]) => {
      const courseRate = Math.round((stats.completed / stats.total) * 100);
      response += `• **${course}:** ${courseRate}% (${stats.completed}/${stats.total})\n`;
    });

    response += `\n**🏆 Recent Achievements:**\n`;
    completed.slice(-3).forEach(task => {
      response += `✓ ${task.name}\n`;
    });

    if (pending.length > 0) {
      response += `\n**⚡ Next Up:**\n`;
      pending.slice(0, 2).forEach(task => {
        response += `○ ${task.name} (${task.priority} priority)\n`;
      });
    }

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute compare progress command
   */
  const executeCompareProgress = async (params) => {
    const { comparison_type, periods, courses } = params;
    
    if (!comparison_type) {
      setCommandResponse("What would you like to compare? Examples: 'this week vs last week', 'MATH vs CMPSC courses'");
      return "Please specify comparison type.";
    }

    // Mock comparison data for demonstration
    const currentPeriod = {
      completed: taskList.filter(t => t.completed).length,
      total: taskList.length,
      hours: 12
    };

    const previousPeriod = {
      completed: Math.max(0, currentPeriod.completed - 2),
      total: currentPeriod.total,
      hours: 10
    };

    const completionChange = currentPeriod.completed - previousPeriod.completed;
    const hoursChange = currentPeriod.hours - previousPeriod.hours;

    const response = `**📊 Progress Comparison: ${comparison_type.toUpperCase()}**

**Current Period:**
✅ Tasks Completed: ${currentPeriod.completed}
⏰ Study Hours: ${currentPeriod.hours}h
📈 Completion Rate: ${Math.round((currentPeriod.completed / currentPeriod.total) * 100)}%

**Previous Period:**
✅ Tasks Completed: ${previousPeriod.completed}
⏰ Study Hours: ${previousPeriod.hours}h
📈 Completion Rate: ${Math.round((previousPeriod.completed / previousPeriod.total) * 100)}%

**📈 Changes:**
${completionChange > 0 ? '📈' : completionChange < 0 ? '📉' : '➡️'} Tasks: ${completionChange >= 0 ? '+' : ''}${completionChange}
${hoursChange > 0 ? '📈' : hoursChange < 0 ? '📉' : '➡️'} Hours: ${hoursChange >= 0 ? '+' : ''}${hoursChange}h

**💡 Insights:**
${completionChange > 0 ? '🎉 Great improvement in task completion!' : ''}
${hoursChange > 0 ? '💪 Increased study time investment!' : ''}
${completionChange < 0 ? '⚠️ Consider reviewing your approach and breaking tasks down.' : ''}`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute set goal command
   */
  const executeSetGoal = async (params) => {
    const { goal_type, target_value, deadline, course } = params;
    
    if (!goal_type || !target_value) {
      setCommandResponse("I need a goal type and target. Example: 'Set goal to complete 5 tasks this week'");
      return "Missing goal information.";
    }

    const newGoal = {
      id: Date.now(),
      type: goal_type,
      target: parseFloat(target_value),
      current: 0,
      deadline: deadline || dayjs().add(1, 'week').format('YYYY-MM-DD'),
      course: course || 'All',
      created: new Date().toISOString()
    };

    setProgressGoals(prev => [...prev, newGoal]);

    const response = `🎯 **New Goal Set!**

**Goal:** ${goal_type} - ${target_value}${goal_type.includes('hours') ? 'h' : ''}
${course ? `📚 **Course:** ${course}` : ''}
📅 **Deadline:** ${newGoal.deadline}
🎯 **Progress:** 0/${target_value}

I'll help you track progress toward this goal. You've got this! 💪`;

    setCommandResponse(response);
    
    notification.success({
      message: 'Goal Created',
      description: `${goal_type} goal set for ${target_value}`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Handle generic progress commands
   */
  const handleGenericProgressCommand = async (commandData) => {
    const response = `Progress Tracker is ready! Try commands like:
    
• "Analyze my progress this week"
• "Show completion rate for MATH"  
• "Track 3 hours of study time"
• "Compare this month to last month"
• "Set goal to complete 5 tasks"`;

    setCommandResponse(response);
    return response;
  };

  // Update taskList when tasks prop changes
  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);
  
  // Calculate progress statistics
  const completedTasks = taskList.filter(task => task.completed);
  const pendingTasks = taskList.filter(task => !task.completed);
  const completionPercentage = Math.round((completedTasks.length / taskList.length) * 100) || 0;
  
  // Calculate study hours (based on estimated times)
  const completedHours = completedTasks.reduce((total, task) => total + (task.estimatedTime || 0), 0);
  const totalHours = taskList.reduce((total, task) => total + (task.estimatedTime || 0), 0);
  const remainingHours = totalHours - completedHours;
  
  // Toggle task completion status with animation
  const handleToggleComplete = (taskId, isCompleted) => {
    const updatedTaskList = taskList.map(task => 
      task.id === taskId 
        ? { ...task, completed: isCompleted }
        : task
    );
    
    setTaskList(updatedTaskList);
    
    if (isCompleted) {
      const completedTask = updatedTaskList.find(t => t.id === taskId);
      setRecentlyCompletedTask(completedTask);
      setShowCompletionAnimation(true);
      
      setTimeout(() => setShowCompletionAnimation(false), 3000);
    }
    
    if (onToggleComplete) {
      onToggleComplete(taskId, isCompleted);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#9981FF';
    if (percentage >= 40) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <Card
      title={
        <div className="flex items-center">
          <RobotOutlined className="text-[#9981FF] mr-2" />
          <span className="text-white">AI Progress Tracker</span>
          {processingCommand && (
            <Tag color="processing" className="ml-2">
              Processing...
            </Tag>
          )}
        </div>
      }
      className="bg-[#1F1F2C] text-white border-0"
      headStyle={{ borderBottom: '1px solid #333' }}
    >
      {/* Command Response Display */}
      <AnimatePresence>
        {commandResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Alert
              message="Progress Analysis Complete"
              description={commandResponse}
              type="success"
              showIcon
              closable
              onClose={() => setCommandResponse('')}
              className="bg-[#26262F] border-[#9981FF]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Animation */}
      <AnimatePresence>
        {showCompletionAnimation && recentlyCompletedTask && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompletionAnimation(false)}
          >
            <motion.div 
              className="bg-[#1F1F2C] p-8 rounded-xl text-center max-w-md"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircleOutlined style={{ fontSize: 32, color: 'white' }} />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Task Completed!</h2>
              <p className="text-lg text-gray-300 mb-4">{recentlyCompletedTask.name}</p>
              <div className="flex justify-center gap-4">
                <Statistic
                  title="Your Progress"
                  value={completionPercentage}
                  suffix="%"
                  valueStyle={{ color: '#4CAF50' }}
                />
                <Statistic
                  title="Completed Tasks"
                  value={completedTasks.length}
                  suffix={`/${taskList.length}`}
                  valueStyle={{ color: '#9981FF' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="progress-overview bg-[#26262F] p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-white text-lg m-0">Overall Progress</h3>
              <p className="text-gray-400 text-sm">
                {completedTasks.length} of {taskList.length} tasks completed
              </p>
            </div>
            <div className="progress-circle">
              <Progress 
                type="circle" 
                percent={completionPercentage} 
                size={80}
                strokeColor={getProgressColor(completionPercentage)}
                format={percent => (
                  <span style={{ color: 'white' }}>{percent}%</span>
                )}
              />
            </div>
          </div>
          
          <Progress 
            percent={completionPercentage} 
            status="active" 
            strokeColor={{
              '0%': '#9981FF',
              '100%': '#C09BFF',
            }}
            className="mb-1"
          />
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>Just Started</span>
            <span>Halfway There</span>
            <span>Almost Done</span>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-[#1F1F2C] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 m-0">Completed</p>
              <p className="text-lg text-[#9981FF] font-semibold m-0">{completedHours.toFixed(1)} hrs</p>
            </div>
            <div className="bg-[#1F1F2C] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 m-0">Remaining</p>
              <p className="text-lg text-yellow-500 font-semibold m-0">{remainingHours.toFixed(1)} hrs</p>
            </div>
            <div className="bg-[#1F1F2C] p-3 rounded-lg text-center">
              <p className="text-xs text-gray-400 m-0">Study Streak</p>
              <p className="text-lg text-green-500 font-semibold m-0">5 days</p>
            </div>
          </div>
        </div>
        
        {/* Progress Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="custom-tabs"
          style={{ color: 'white' }}
          items={[
            {
              key: '1',
              label: (
                <span className="text-white">
                  <ClockCircleOutlined /> Pending Tasks ({pendingTasks.length})
                </span>
              ),
              children: (
                pendingTasks.length > 0 ? (
                  <List
                    dataSource={pendingTasks}
                    renderItem={task => (
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TaskItem task={task} onToggleComplete={handleToggleComplete} />
                        </motion.div>
                      </AnimatePresence>
                    )}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <TrophyOutlined style={{ fontSize: 48, color: '#52c41a' }} className="mb-4" />
                    <h3 className="text-white text-lg mb-2">All tasks completed! 🎉</h3>
                    <p>You're doing great! Keep up the excellent work.</p>
                  </div>
                )
              )
            },
            {
              key: '2',
              label: (
                <span className="text-white">
                  <CheckCircleOutlined /> Completed ({completedTasks.length})
                </span>
              ),
              children: (
                completedTasks.length > 0 ? (
                  <List
                    dataSource={completedTasks}
                    renderItem={task => (
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TaskItem task={task} onToggleComplete={handleToggleComplete} />
                        </motion.div>
                      </AnimatePresence>
                    )}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <BookOutlined style={{ fontSize: 48 }} className="mb-4" />
                    <h3 className="text-white text-lg mb-2">No completed tasks yet</h3>
                    <p>Start working on your tasks to see your progress here!</p>
                  </div>
                )
              )
            },
            {
              key: '3',
              label: (
                <span className="text-white">
                  <CalendarOutlined /> Weekly
                </span>
              ),
              children: (
                <WeeklyProgress 
                  completedHours={completedHours} 
                  totalHours={totalHours}
                  streak={5}
                />
              )
            }
          ]}
        />
        
        <div className="text-center mt-4">
          <Button 
            type="primary" 
            icon={<ArrowUpOutlined />}
            style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
          >
            View Detailed Analytics
          </Button>
        </div>
      </motion.div>
    </Card>
  );
};

export default ProgressTracker;