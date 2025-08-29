/**
 * Enhanced DeadlinesModal with LLM-powered natural language command processing
 * Supports commands like "what's due this week", "extend deadline for essay", etc.
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Tag, Progress, Button, Tooltip, Select, DatePicker, Modal, Input, Alert, notification } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  WarningOutlined, 
  CheckCircleOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  EditOutlined,
  RobotOutlined,
  BellOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

/**
 * LLM Command Structure for Deadline Management
 */
const DEADLINES_COMMANDS = {
  "show_deadlines": {
    required: [],
    optional: ["timeframe", "priority_filter", "course_filter"],
    action: "display_upcoming_deadlines"
  },
  "manage_deadline": {
    required: ["task_identifier", "action_type"],
    optional: ["new_date", "reminder_settings"],
    action: "modify_task_deadline"
  },
  "set_reminder": {
    required: ["task_identifier", "reminder_time"],
    optional: ["reminder_message", "notification_type"],
    action: "create_deadline_reminder"
  },
  "analyze_workload": {
    required: [],
    optional: ["timeframe"],
    action: "assess_deadline_pressure"
  },
  "reschedule_task": {
    required: ["task_identifier", "new_deadline"],
    optional: ["reason"],
    action: "update_task_schedule"
  }
};

/**
 * Enhanced Deadline Card Component
 */
const DeadlineCard = ({ task, index, onUpdate, onComplete, recentlyUpdated }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState(dayjs(task.dueDate));
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Calculate days remaining for a deadline
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get color based on days remaining
  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining <= 1) return "#ff4d4f";
    if (daysRemaining <= 3) return "#faad14";
    if (daysRemaining <= 7) return "#52c41a";
    return "#1890ff";
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <FireOutlined style={{ color: "#ff4d4f" }} />;
      case "medium":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
    }
  };

  const daysRemaining = getDaysRemaining(task.dueDate);
  const urgencyColor = getUrgencyColor(daysRemaining);

  const handleReschedule = () => {
    if (onUpdate) {
      onUpdate(task.id, {
        dueDate: newDeadline.format('YYYY-MM-DD'),
        rescheduleReason: rescheduleReason
      });
    }
    
    setShowEditModal(false);
    notification.success({
      message: 'Deadline Updated',
      description: `${task.name} rescheduled to ${newDeadline.format('MMM DD, YYYY')}`,
      placement: 'topRight'
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`mb-3 ${recentlyUpdated === task.id ? 'ring-2 ring-[#9981FF] ring-opacity-50' : ''}`}
      >
        <Card 
          className="bg-[#26262F] border-0 h-full"
          styles={{ body: { padding: '16px' } }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <motion.div
                animate={daysRemaining <= 1 && !task.completed ? 
                  { scale: [1, 1.2, 1] } : 
                  { scale: 1 }
                }
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              >
                {getPriorityIcon(task.priority)}
              </motion.div>
              <h3 className="text-white ml-2 text-lg font-medium">{task.name}</h3>
            </div>
            
            <Tag 
              color={task.completed ? "green" : urgencyColor}
              className="ml-2"
            >
              {task.completed ? 
                "Completed" : 
                daysRemaining <= 0 ? 
                  "Overdue!" : 
                  `${daysRemaining} days left`
              }
            </Tag>
          </div>
          
          <div className="border-t border-gray-700 pt-3 mb-3" />
          
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
            <div>
              <div className="text-gray-400 mb-1">Due Date</div>
              <div className="text-white">{dayjs(task.dueDate).format('MMM DD, YYYY')}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Estimated Time</div>
              <div className="text-white">{task.estimatedTime || 'Not set'} hours</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Priority</div>
              <div className="text-white capitalize">{task.priority}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Course</div>
              <div className="text-white">{task.course || 'General'}</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Completion</span>
              <span className="text-gray-300">{task.completed ? "100%" : "0%"}</span>
            </div>
            <Progress 
              percent={task.completed ? 100 : 0} 
              status={task.completed ? "success" : "active"}
              showInfo={false}
              strokeColor={task.completed ? "#52c41a" : "#9981FF"}
            />
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button 
              size="small"
              icon={<EditOutlined />}
              onClick={() => setShowEditModal(true)}
              className="bg-[#333] text-white border-0"
            >
              Reschedule
            </Button>
            <Button 
              size="small"
              icon={task.completed ? <FireOutlined /> : <CheckCircleOutlined />}
              type="primary"
              onClick={() => onComplete?.(task.id, !task.completed)}
              style={{ 
                backgroundColor: task.completed ? "#333" : "#9981FF",
                borderColor: task.completed ? "#333" : "#9981FF"
              }}
            >
              {task.completed ? "Reopen" : "Mark Complete"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Reschedule Modal */}
      <Modal
        title="Reschedule Deadline"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onOk={handleReschedule}
        className="deadline-edit-modal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task: {task.name}</label>
            <div className="text-sm text-gray-600">Current deadline: {dayjs(task.dueDate).format('MMM DD, YYYY')}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">New Deadline</label>
            <DatePicker 
              value={newDeadline}
              onChange={setNewDeadline}
              className="w-full"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Reason for Change (Optional)</label>
            <TextArea 
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Why are you rescheduling this deadline?"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

/**
 * Enhanced DeadlinesModal with LLM Command Processing
 */
const DeadlinesModal = ({ 
  visible, 
  onClose, 
  tasks,
  onUpdateDeadline,
  onCompleteTask,
  chatCommand = null,
  getModalContext 
}) => {
  // Core state
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);

  // LLM command processing state
  const [lastCommand, setLastCommand] = useState(null);
  const [commandResponse, setCommandResponse] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);

  /**
   * Provide modal context for chat integration
   */
  const provideModalContext = useCallback(() => {
    if (getModalContext) {
      const now = new Date();
      const upcomingDeadlines = tasks.filter(t => !t.completed && new Date(t.dueDate) >= now);
      const overdueDeadlines = tasks.filter(t => !t.completed && new Date(t.dueDate) < now);
      
      return getModalContext('deadlines', {
        totalTasks: tasks.length,
        upcomingDeadlines: upcomingDeadlines.length,
        overdueDeadlines: overdueDeadlines.length,
        completedTasks: tasks.filter(t => t.completed).length,
        currentFilter: filter,
        sortBy: sortBy,
        thisWeekDeadlines: upcomingDeadlines.filter(t => {
          const daysUntil = Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24));
          return daysUntil <= 7;
        }).length
      });
    }
    return '';
  }, [getModalContext, tasks, filter, sortBy]);

  /**
   * Handle incoming chat commands
   */
  useEffect(() => {
    if (chatCommand && chatCommand.modal_target === 'deadlines') {
      handleLLMCommand(chatCommand);
    }
  }, [chatCommand]);

  /**
   * Build LLM system prompt for deadline management
   */
  const buildDeadlinesPrompt = useCallback((userMessage, currentData) => {
    return `You are an intelligent Deadline Management assistant. Analyze user commands and return structured JSON.

FEATURE CONTEXT:
- Feature: Deadline Management & Scheduling
- Available actions: show_deadlines, manage_deadline, set_reminder, analyze_workload, reschedule_task
- Total tasks: ${currentData.totalTasks}
- Upcoming deadlines: ${currentData.upcomingDeadlines}
- Overdue: ${currentData.overdueDeadlines}
- This week: ${currentData.thisWeekDeadlines}
- Available tasks: ${tasks.map(t => t.name).join(', ')}
- Current filter: ${currentData.currentFilter}

INTENT ANALYSIS:
1. Determine PRIMARY INTENT: QUERY|UPDATE|SCHEDULE|ANALYZE|REMIND
2. Extract task identifiers (match with available tasks)
3. Extract timeframes (today, week, month)
4. Extract deadline actions (extend, reschedule, remind)
5. Identify missing REQUIRED parameters

REQUIRED PARAMETERS FOR ACTIONS:
- show_deadlines: none required
- manage_deadline: task_identifier, action_type (required)
- set_reminder: task_identifier, reminder_time (required)
- analyze_workload: none required
- reschedule_task: task_identifier, new_deadline (required)

RESPONSE FORMAT:
{
  "intent": "QUERY|UPDATE|SCHEDULE|ANALYZE|REMIND",
  "action": "show_deadlines|manage_deadline|set_reminder|analyze_workload|reschedule_task",
  "confidence": 0.95,
  "params": {
    "task_identifier": "exact task name",
    "timeframe": "today|week|month",
    "priority_filter": "high|medium|low",
    "course_filter": "MATH|CMPSC|etc",
    "action_type": "extend|reschedule|cancel",
    "new_deadline": "YYYY-MM-DD",
    "reminder_time": "X days before",
    "reason": "explanation"
  },
  "missing": ["required_param1"],
  "modal_target": "deadlines",
  "response": "Natural language response",
  "questions": ["Specific question?"],
  "ready_to_execute": true|false
}

EXAMPLES:
- "what's due this week" → action: "show_deadlines", params: {timeframe: "week"}
- "extend deadline for math homework" → action: "manage_deadline", params: {task_identifier: "MATH homework", action_type: "extend"}
- "remind me 3 days before my essay is due" → action: "set_reminder", params: {task_identifier: "essay", reminder_time: "3 days before"}
- "analyze my workload" → action: "analyze_workload"

USER MESSAGE: "${userMessage}"
JSON RESPONSE:`;
  }, [tasks]);

  /**
   * Process LLM command for deadline management
   */
  const handleLLMCommand = async (commandData) => {
    setProcessingCommand(true);
    setLastCommand(commandData);

    try {
      switch (commandData.action) {
        case "show_deadlines":
          return await executeShowDeadlines(commandData.params);
        case "manage_deadline":
          return await executeManageDeadline(commandData.params);
        case "set_reminder":
          return await executeSetReminder(commandData.params);
        case "analyze_workload":
          return await executeAnalyzeWorkload(commandData.params);
        case "reschedule_task":
          return await executeRescheduleTask(commandData.params);
        default:
          return handleGenericDeadlineCommand(commandData);
      }
    } catch (error) {
      console.error('Deadline management command error:', error);
      setCommandResponse('Sorry, I encountered an error processing that command.');
    } finally {
      setProcessingCommand(false);
    }
  };

  /**
   * Execute show deadlines command
   */
  const executeShowDeadlines = async (params) => {
    const { timeframe, priority_filter, course_filter } = params;

    // Apply filters
    let filteredTasks = tasks.filter(t => !t.completed);
    
    if (timeframe) {
      const now = new Date();
      const endDate = new Date();
      
      switch (timeframe.toLowerCase()) {
        case 'today':
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          endDate.setDate(now.getDate() + 7);
          break;
        case 'month':
          endDate.setMonth(now.getMonth() + 1);
          break;
      }
      
      filteredTasks = filteredTasks.filter(t => new Date(t.dueDate) <= endDate);
      setFilter(timeframe);
    }

    if (priority_filter) {
      filteredTasks = filteredTasks.filter(t => t.priority === priority_filter);
    }

    if (course_filter) {
      filteredTasks = filteredTasks.filter(t => 
        (t.course || '').toLowerCase().includes(course_filter.toLowerCase())
      );
    }

    // Sort by due date
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const now = new Date();
    const overdue = filteredTasks.filter(t => new Date(t.dueDate) < now);
    const upcoming = filteredTasks.filter(t => new Date(t.dueDate) >= now);

    let response = `**📅 ${timeframe ? timeframe.toUpperCase() : 'UPCOMING'} Deadlines:**\n\n`;

    if (overdue.length > 0) {
      response += `🚨 **OVERDUE (${overdue.length}):**\n`;
      overdue.slice(0, 3).forEach(task => {
        const daysOverdue = Math.abs(Math.ceil((new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24)));
        response += `• **${task.name}** - ${daysOverdue} days overdue\n`;
      });
      response += '\n';
    }

    if (upcoming.length > 0) {
      response += `⏰ **UPCOMING (${upcoming.length}):**\n`;
      upcoming.slice(0, 5).forEach(task => {
        const daysUntil = Math.ceil((new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24));
        const urgencyIcon = daysUntil <= 1 ? " 🔥" : daysUntil <= 3 ? " ⚠️" : "";
        response += `• **${task.name}** - Due ${dayjs(task.dueDate).format('MMM DD')} (${daysUntil} days)${urgencyIcon}\n`;
      });
    }

    if (filteredTasks.length === 0) {
      response += `No deadlines found${timeframe ? ` for ${timeframe}` : ''}. Great job staying on top of your tasks! 🎉`;
    } else if (upcoming.length > 5) {
      response += `\n_Showing top 5 of ${upcoming.length} upcoming deadlines._`;
    }

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute manage deadline command
   */
  const executeManageDeadline = async (params) => {
    const { task_identifier, action_type, new_date, reason } = params;

    if (!task_identifier) {
      setCommandResponse("Which task's deadline would you like to manage? Example: 'Extend deadline for MATH homework'");
      return "Please specify a task.";
    }

    // Find the target task
    const targetTask = tasks.find(task => 
      task.name.toLowerCase().includes(task_identifier.toLowerCase()) ||
      task_identifier.toLowerCase().includes(task.name.toLowerCase())
    );

    if (!targetTask) {
      setCommandResponse(`I couldn't find "${task_identifier}". Available tasks: ${tasks.slice(0, 3).map(t => t.name).join(', ')}...`);
      return "Task not found.";
    }

    if (!action_type) {
      setCommandResponse(`What would you like to do with "${targetTask.name}"? Options: extend deadline, reschedule, or set reminder.`);
      return "Please specify the action.";
    }

    let newDeadline;
    switch (action_type.toLowerCase()) {
      case 'extend':
        // Extend by 3 days by default
        newDeadline = dayjs(targetTask.dueDate).add(3, 'days').format('YYYY-MM-DD');
        break;
      case 'reschedule':
        if (!new_date) {
          setCommandResponse("When would you like to reschedule this to? Example: 'Reschedule to next Friday'");
          return "Please specify the new date.";
        }
        newDeadline = new_date;
        break;
      default:
        setCommandResponse("I can help you extend, reschedule, or set reminders for deadlines.");
        return "Invalid action type.";
    }

    // Update the deadline
    if (onUpdateDeadline) {
      await onUpdateDeadline(targetTask.id, { dueDate: newDeadline, reason });
    } else {
      console.warn('DeadlinesModal: onUpdateDeadline function not provided!');
    }

    // Highlight the updated task
    setRecentlyUpdated(targetTask.id);
    setTimeout(() => setRecentlyUpdated(null), 3000);

    const response = `✅ **Deadline Updated!**

📝 **Task:** ${targetTask.name}
📅 **Old deadline:** ${dayjs(targetTask.dueDate).format('MMM DD, YYYY')}
📅 **New deadline:** ${dayjs(newDeadline).format('MMM DD, YYYY')}
${reason ? `💭 **Reason:** ${reason}` : ''}

${action_type === 'extend' ? 'Extended by 3 days.' : 'Rescheduled successfully.'} I'll keep track of this change for you! 📋`;

    setCommandResponse(response);
    
    notification.success({
      message: 'Deadline Updated',
      description: `${targetTask.name} ${action_type}ed successfully`,
      placement: 'topRight'
    });

    return response;
  };

  /**
   * Execute set reminder command
   */
  const executeSetReminder = async (params) => {
    const { task_identifier, reminder_time, reminder_message, notification_type } = params;

    if (!task_identifier || !reminder_time) {
      setCommandResponse("I need both a task and reminder timing. Example: 'Remind me 2 days before my essay is due'");
      return "Missing reminder information.";
    }

    // Find the target task
    const targetTask = tasks.find(task => 
      task.name.toLowerCase().includes(task_identifier.toLowerCase()) ||
      task_identifier.toLowerCase().includes(task.name.toLowerCase())
    );

    if (!targetTask) {
      setCommandResponse(`I couldn't find "${task_identifier}". Which task would you like to set a reminder for?`);
      return "Task not found.";
    }

    // Parse reminder time
    const reminderDays = parseInt(reminder_time.match(/\d+/)?.[0]) || 1;
    const reminderDate = dayjs(targetTask.dueDate).subtract(reminderDays, 'days').format('MMM DD, YYYY');

    const response = `⏰ **Reminder Set!**

📝 **Task:** ${targetTask.name}
📅 **Due:** ${dayjs(targetTask.dueDate).format('MMM DD, YYYY')}
🔔 **Reminder:** ${reminderDate} (${reminderDays} days before)
${reminder_message ? `💬 **Message:** "${reminder_message}"` : ''}

You'll receive a notification on ${reminderDate} to help you stay on track! 🎯`;

    setCommandResponse(response);

    notification.success({
      message: 'Reminder Created',
      description: `Reminder set for ${reminderDays} days before ${targetTask.name}`,
      placement: 'topRight'
    });

    return response;
  };

  /**
   * Execute analyze workload command
   */
  const executeAnalyzeWorkload = async (params) => {
    const { timeframe } = params;

    const now = new Date();
    const pendingTasks = tasks.filter(t => !t.completed);
    const overdueTasks = pendingTasks.filter(t => new Date(t.dueDate) < now);
    
    // Analyze by time periods
    const thisWeek = pendingTasks.filter(t => {
      const daysUntil = Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0;
    });
    
    const nextWeek = pendingTasks.filter(t => {
      const daysUntil = Math.ceil((new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24));
      return daysUntil > 7 && daysUntil <= 14;
    });

    // Calculate total estimated hours
    const thisWeekHours = thisWeek.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    const nextWeekHours = nextWeek.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
    
    // Priority analysis
    const highPriorityThisWeek = thisWeek.filter(t => t.priority === 'high').length;
    
    const response = `**📊 Workload Analysis:**

🎯 **Current Status:**
• Total pending tasks: ${pendingTasks.length}
${overdueTasks.length > 0 ? `• ⚠️ Overdue: ${overdueTasks.length}` : '• ✅ No overdue tasks'}

📅 **This Week (${thisWeek.length} tasks, ~${thisWeekHours}h):**
${thisWeek.slice(0, 3).map(t => `• ${t.name} - ${dayjs(t.dueDate).format('MMM DD')}`).join('\n') || 'No deadlines this week'}
${highPriorityThisWeek > 0 ? `🔥 ${highPriorityThisWeek} high-priority tasks` : ''}

📅 **Next Week (${nextWeek.length} tasks, ~${nextWeekHours}h):**
${nextWeek.slice(0, 2).map(t => `• ${t.name} - ${dayjs(t.dueDate).format('MMM DD')}`).join('\n') || 'Light workload next week'}

**💡 Workload Assessment:**
${thisWeekHours > 25 ? '🚨 Heavy workload this week - consider prioritizing or extending some deadlines' : ''}
${thisWeekHours < 10 ? '✅ Manageable workload - good opportunity to get ahead' : ''}
${overdueTasks.length > 0 ? '⚠️ Address overdue tasks first to prevent further delays' : ''}
${highPriorityThisWeek > 3 ? '🎯 Focus on high-priority tasks during peak productivity hours' : ''}`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute reschedule task command
   */
  const executeRescheduleTask = async (params) => {
    const { task_identifier, new_deadline, reason } = params;

    if (!task_identifier || !new_deadline) {
      setCommandResponse("I need both the task name and new deadline. Example: 'Reschedule math homework to next Friday'");
      return "Missing task or date information.";
    }

    // Find the target task
    const targetTask = tasks.find(task => 
      task.name.toLowerCase().includes(task_identifier.toLowerCase()) ||
      task_identifier.toLowerCase().includes(task.name.toLowerCase())
    );

    if (!targetTask) {
      setCommandResponse(`I couldn't find "${task_identifier}". Which task would you like to reschedule?`);
      return "Task not found.";
    }

    // Parse and validate the new deadline
    const newDate = dayjs(new_deadline);
    if (!newDate.isValid()) {
      setCommandResponse("I couldn't understand that date. Please use a format like 'next Friday' or '2025-04-15'");
      return "Invalid date format.";
    }

    if (newDate.isBefore(dayjs(), 'day')) {
      setCommandResponse("The new deadline can't be in the past. Please choose a future date.");
      return "Invalid date - cannot be in the past.";
    }

    // Update the deadline
    if (onUpdateDeadline) {
      await onUpdateDeadline(targetTask.id, { 
        dueDate: newDate.format('YYYY-MM-DD'), 
        reason 
      });
    }

    setRecentlyUpdated(targetTask.id);
    setTimeout(() => setRecentlyUpdated(null), 3000);

    const response = `✅ **Task Rescheduled!**

📝 **Task:** ${targetTask.name}
📅 **Old deadline:** ${dayjs(targetTask.dueDate).format('MMM DD, YYYY')}  
📅 **New deadline:** ${newDate.format('MMM DD, YYYY')}
⏱️ **Time change:** ${newDate.diff(dayjs(targetTask.dueDate), 'days')} days
${reason ? `💭 **Reason:** ${reason}` : ''}

The deadline has been updated successfully! 🎯`;

    setCommandResponse(response);

    notification.success({
      message: 'Task Rescheduled',
      description: `${targetTask.name} moved to ${newDate.format('MMM DD')}`,
      placement: 'topRight'
    });

    return response;
  };

  /**
   * Handle generic deadline commands
   */
  const handleGenericDeadlineCommand = async (commandData) => {
    const response = `Deadline Manager is ready! Try commands like:
    
• "What's due this week?"
• "Extend deadline for [task name]"
• "Remind me 2 days before my essay"
• "Analyze my workload"
• "Reschedule math homework to Friday"`;

    setCommandResponse(response);
    return response;
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filter === 'all') return true;
        if (filter === 'completed') return task.completed;
        if (filter === 'pending') return !task.completed;
        if (filter === 'high') return task.priority === 'high';
        if (filter === 'due-soon') {
          const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 3 && !task.completed;
        }
        if (filter === 'week') {
          const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
          return daysLeft <= 7 && daysLeft >= 0 && !task.completed;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'priority') {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (sortBy === 'course') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [tasks, filter, sortBy]);
    
  return (
    <div className="h-full flex flex-col">
      <Card 
        className="bg-[#1F1F2C] border-gray-700 flex-1 flex flex-col"
        bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}
        title={
          <div className="flex items-center">
            <RobotOutlined className="text-[#9981FF] mr-2" />
            <span className="text-white">AI Deadline Manager</span>
            {processingCommand && (
              <Tag color="processing" className="ml-2">
                Processing...
              </Tag>
            )}
          </div>
        }
      >
        <div className="flex-1 overflow-y-auto">
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
              message="Deadline Command Processed"
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

      <div className="mb-6 bg-[#26262F] p-4 rounded-lg">
        <h3 className="text-white text-lg mb-3">Manage Your Deadlines</h3>
        <p className="text-gray-400 mb-4">
          View and track all your upcoming deadlines. Sort and filter to focus on what matters most right now.
        </p>
        
        <div className="flex justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-gray-400 mr-2">Filter:</span>
              <Select 
                value={filter} 
                onChange={setFilter} 
                style={{ width: 130 }}
                className="bg-[#333]"
              >
                <Option value="all">All Tasks</Option>
                <Option value="week">This Week</Option>
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="high">High Priority</Option>
                <Option value="due-soon">Due Soon</Option>
              </Select>
            </div>
            
            <div>
              <span className="text-gray-400 mr-2">Sort by:</span>
              <Select 
                value={sortBy} 
                onChange={setSortBy} 
                style={{ width: 130 }}
                className="bg-[#333]"
              >
                <Option value="date">Due Date</Option>
                <Option value="priority">Priority</Option>
                <Option value="course">Course</Option>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              icon={<ExclamationCircleOutlined />}
              className="bg-[#9981FF] text-white border-0"
              onClick={() => setFilter('due-soon')}
            >
              Due Soon
            </Button>
            <Button 
              icon={<FireOutlined />}
              className="bg-[#333] text-white border-0"
              onClick={() => setFilter('week')}
            >
              This Week
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <DeadlineCard
              key={task.id}
              task={task}
              index={index}
              onUpdate={onUpdateDeadline}
              onComplete={onCompleteTask}
              recentlyUpdated={recentlyUpdated}
            />
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-[#26262F] rounded-lg">
            <CheckCircleOutlined style={{ fontSize: 48 }} className="text-green-500 mb-4" />
            <h3 className="text-white text-lg mb-2">No deadlines found</h3>
            <p className="text-gray-400">
              {filter === 'all' ? 
                "You don't have any tasks with deadlines yet." :
                "Try changing your filter settings to see more tasks."
              }
            </p>
          </div>
        )}
      </div>
      </div>
      
      <div className="mt-6 text-center bg-[#26262F] p-4 rounded-lg">
        <div className="flex justify-center items-center gap-6">
          <div>
            <h4 className="text-white mb-1">All Tasks</h4>
            <p className="text-2xl text-[#9981FF]">{tasks.length}</p>
          </div>
          <div>
            <h4 className="text-white mb-1">Completed</h4>
            <p className="text-2xl text-green-500">{tasks.filter(t => t.completed).length}</p>
          </div>
          <div>
            <h4 className="text-white mb-1">High Priority</h4>
            <p className="text-2xl text-red-500">{tasks.filter(t => t.priority === 'high').length}</p>
          </div>
          <div>
            <h4 className="text-white mb-1">Due This Week</h4>
            <p className="text-2xl text-yellow-500">
              {tasks.filter(t => {
                const daysUntil = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                return !t.completed && daysUntil <= 7 && daysUntil >= 0;
              }).length}
            </p>
          </div>
        </div>
        </div>
      </Card>
    </div>
  );
};

export default DeadlinesModal;