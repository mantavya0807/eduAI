/**
 * Enhanced WeeklyPlanner with LLM-powered natural language command processing
 * Supports commands like "schedule study session for 2 hours tomorrow", "optimize my week", etc.
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Tag, Badge, Tooltip, Alert, Button, notification, Progress, Select, DatePicker, TimePicker, Modal, Input, Space } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  BarChartOutlined, 
  SwapOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  FireOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * LLM Command Structure for Weekly Planning
 */
const PLANNER_COMMANDS = {
  "schedule_event": {
    required: ["event_type", "duration"],
    optional: ["date", "time", "course", "description"],
    action: "add_calendar_event"
  },
  "reschedule_event": {
    required: ["event_identifier"],
    optional: ["new_date", "new_time"],
    action: "move_calendar_event"
  },
  "optimize_schedule": {
    required: [],
    optional: ["focus_area", "constraints"],
    action: "generate_optimal_schedule"
  },
  "analyze_workload": {
    required: [],
    optional: ["timeframe"],
    action: "assess_weekly_workload"
  },
  "suggest_focus_time": {
    required: [],
    optional: ["course", "task_type"],
    action: "recommend_study_periods"
  },
  "block_time": {
    required: ["time_slot", "activity"],
    optional: ["recurring"],
    action: "create_time_block"
  }
};

/**
 * Event Item Component with Enhanced Display
 */
const EventItem = ({ event, onEdit, onDelete, isHighlighted }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const getEventColor = (type) => {
    switch (type) {
      case 'study': return '#9981FF';
      case 'deadline': return '#ff4d4f';
      case 'meeting': return '#52c41a';
      case 'class': return '#1890ff';
      default: return '#faad14';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'study': return '📚';
      case 'deadline': return '⏰';
      case 'meeting': return '👥';
      case 'class': return '🎓';
      default: return '📝';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = { high: 'red', medium: 'orange', low: 'blue' };
    return priority ? <Badge color={colors[priority]} text={priority} /> : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`mb-2 ${isHighlighted ? 'ring-2 ring-[#9981FF] ring-opacity-50' : ''}`}
    >
      <Card
        size="small"
        className="bg-[#2A2A35] border-gray-600 hover:border-[#9981FF] transition-colors cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
        style={{ borderLeft: `4px solid ${getEventColor(event.type)}` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{getEventIcon(event.type)}</span>
            <div className="flex-1">
              <h5 className="text-white text-sm font-medium m-0">
                {typeof event === 'string' ? event : event.title}
              </h5>
              {typeof event === 'object' && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  {event.start_time && (
                    <span>
                      <ClockCircleOutlined className="mr-1" />
                      {event.start_time} - {event.end_time}
                    </span>
                  )}
                  {getPriorityBadge(event.priority)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(event);
              }}
              className="text-gray-400 hover:text-[#9981FF]"
            />
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(event);
              }}
              className="text-gray-400 hover:text-red-500"
            />
          </div>
        </div>
        
        <AnimatePresence>
          {showDetails && typeof event === 'object' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t border-gray-600"
            >
              <div className="text-xs space-y-1">
                {event.course && (
                  <div><span className="text-gray-400">Course:</span> <span className="text-white">{event.course}</span></div>
                )}
                {event.description && (
                  <div><span className="text-gray-400">Notes:</span> <span className="text-white">{event.description}</span></div>
                )}
                {event.estimatedHours && (
                  <div><span className="text-gray-400">Duration:</span> <span className="text-white">{event.estimatedHours}h</span></div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

/**
 * Enhanced WeeklyPlanner with LLM Command Processing
 */
const WeeklyPlanner = ({ 
  schedule, 
  onTaskMove, 
  tasks = [], 
  onAddEvent, 
  onUpdateSchedule,
  chatCommand = null,
  getModalContext 
}) => {
  // Enhanced state management
  const [draggedTask, setDraggedTask] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [recentlyMovedTask, setRecentlyMovedTask] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  const [workloadAnalysis, setWorkloadAnalysis] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(dayjs());
  const [viewMode, setViewMode] = useState('week');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [quickAddDay, setQuickAddDay] = useState(null);
  const [highlightedEvent, setHighlightedEvent] = useState(null);

  // LLM command processing state
  const [lastCommand, setLastCommand] = useState(null);
  const [commandResponse, setCommandResponse] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'study',
    date: dayjs(),
    startTime: dayjs().hour(9).minute(0),
    endTime: dayjs().hour(10).minute(0),
    priority: 'medium',
    course: '',
    description: ''
  });

  /**
   * Provide modal context for chat integration
   */
  const provideModalContext = useCallback(() => {
    if (getModalContext) {
      const totalEvents = Object.values(schedule).reduce((sum, dayEvents) => sum + dayEvents.length, 0);
      const thisWeekHours = Object.values(workloadAnalysis)
        .filter(analysis => typeof analysis === 'object' && analysis.hours)
        .reduce((sum, analysis) => sum + analysis.hours, 0);
      
      return getModalContext('schedule', {
        currentWeek: selectedWeek.format('YYYY-MM-DD'),
        totalEvents: totalEvents,
        weeklyHours: thisWeekHours,
        viewMode: viewMode,
        unscheduledTasks: tasks.filter(t => !isTaskScheduled(t.name)).length,
        peakDay: workloadAnalysis.weekly?.peakDay || 'None',
        lightestDay: workloadAnalysis.weekly?.lightestDay || 'None',
        averageHoursPerDay: workloadAnalysis.weekly?.averageHoursPerDay || 0
      });
    }
    return '';
  }, [getModalContext, schedule, selectedWeek, viewMode, tasks, workloadAnalysis]);

  /**
   * Handle incoming chat commands
   */
  useEffect(() => {
    if (chatCommand && chatCommand.modal_target === 'schedule') {
      handleLLMCommand(chatCommand);
    }
  }, [chatCommand]);

  /**
   * Build LLM system prompt for weekly planning
   */
  const buildPlannerPrompt = useCallback((userMessage, currentData) => {
    return `You are an intelligent Weekly Planning assistant. Analyze user commands and return structured JSON.

FEATURE CONTEXT:
- Feature: Weekly Schedule Planning & Time Management
- Available actions: schedule_event, reschedule_event, optimize_schedule, analyze_workload, suggest_focus_time, block_time
- Current week: ${currentData.currentWeek}
- Total events: ${currentData.totalEvents}
- Weekly hours: ${currentData.weeklyHours}
- Unscheduled tasks: ${currentData.unscheduledTasks}
- Available tasks: ${tasks.map(t => t.name).join(', ')}
- Peak day: ${currentData.peakDay}, Lightest: ${currentData.lightestDay}

INTENT ANALYSIS:
1. Determine PRIMARY INTENT: SCHEDULE|RESCHEDULE|OPTIMIZE|ANALYZE|SUGGEST|BLOCK
2. Extract event details (type, duration, date, time)
3. Extract task/event identifiers
4. Extract time constraints and preferences
5. Identify missing REQUIRED parameters

REQUIRED PARAMETERS FOR ACTIONS:
- schedule_event: event_type, duration (required)
- reschedule_event: event_identifier (required)
- optimize_schedule: none required
- analyze_workload: none required
- suggest_focus_time: none required
- block_time: time_slot, activity (required)

RESPONSE FORMAT:
{
  "intent": "SCHEDULE|RESCHEDULE|OPTIMIZE|ANALYZE|SUGGEST|BLOCK",
  "action": "schedule_event|reschedule_event|optimize_schedule|analyze_workload|suggest_focus_time|block_time",
  "confidence": 0.95,
  "params": {
    "event_type": "study|meeting|class|deadline|break",
    "duration": "numeric hours",
    "date": "YYYY-MM-DD or relative like 'tomorrow'",
    "time": "HH:MM or relative like 'morning'",
    "course": "course name",
    "event_identifier": "exact event name",
    "activity": "activity description",
    "time_slot": "specific time period",
    "focus_area": "subject or skill",
    "constraints": "limitations or preferences"
  },
  "missing": ["required_param1"],
  "modal_target": "schedule",
  "response": "Natural language response",
  "questions": ["Specific question?"],
  "ready_to_execute": true|false
}

EXAMPLES:
- "schedule 2 hours study time tomorrow" → action: "schedule_event", params: {event_type: "study", duration: "2", date: "tomorrow"}
- "move my math session to Friday" → action: "reschedule_event", params: {event_identifier: "math session", new_date: "Friday"}
- "optimize my schedule this week" → action: "optimize_schedule"
- "block Wednesday afternoon for CMPSC" → action: "block_time", params: {time_slot: "Wednesday afternoon", activity: "CMPSC"}

USER MESSAGE: "${userMessage}"
JSON RESPONSE:`;
  }, [tasks]);

  /**
   * Process LLM command for weekly planning
   */
  const handleLLMCommand = async (commandData) => {
    setProcessingCommand(true);
    setLastCommand(commandData);

    try {
      switch (commandData.action) {
        case "schedule_event":
          return await executeScheduleEvent(commandData.params);
        case "reschedule_event":
          return await executeRescheduleEvent(commandData.params);
        case "optimize_schedule":
          return await executeOptimizeSchedule(commandData.params);
        case "analyze_workload":
          return await executeAnalyzeWorkload(commandData.params);
        case "suggest_focus_time":
          return await executeSuggestFocusTime(commandData.params);
        case "block_time":
          return await executeBlockTime(commandData.params);
        default:
          return handleGenericPlannerCommand(commandData);
      }
    } catch (error) {
      console.error('Weekly planner command error:', error);
      setCommandResponse('Sorry, I encountered an error processing that command.');
    } finally {
      setProcessingCommand(false);
    }
  };

  /**
   * Execute schedule event command
   */
  const executeScheduleEvent = async (params) => {
    const { event_type, duration, date, time, course, description } = params;

    if (!event_type || !duration) {
      setCommandResponse("I need to know what type of event and how long. Example: 'Schedule 2 hours of study time'");
      return "Missing event details.";
    }

    // Parse date and time
    let eventDate = dayjs();
    if (date) {
      if (date.toLowerCase() === 'tomorrow') {
        eventDate = dayjs().add(1, 'day');
      } else if (date.toLowerCase() === 'today') {
        eventDate = dayjs();
      } else if (DAYS.some(day => date.toLowerCase().includes(day.toLowerCase()))) {
        const dayIndex = DAYS.findIndex(day => date.toLowerCase().includes(day.toLowerCase()));
        eventDate = dayjs().startOf('week').add(dayIndex + 1, 'day');
      } else {
        eventDate = dayjs(date);
      }
    }

    let eventTime = dayjs().hour(9).minute(0);
    if (time) {
      if (time.includes(':')) {
        eventTime = dayjs(time, 'HH:mm');
      } else if (time.toLowerCase().includes('morning')) {
        eventTime = dayjs().hour(9).minute(0);
      } else if (time.toLowerCase().includes('afternoon')) {
        eventTime = dayjs().hour(14).minute(0);
      } else if (time.toLowerCase().includes('evening')) {
        eventTime = dayjs().hour(19).minute(0);
      }
    }

    const endTime = eventTime.add(parseFloat(duration), 'hour');
    
    const scheduledEvent = {
      id: Date.now(),
      title: `${event_type.charAt(0).toUpperCase() + event_type.slice(1)} Session${course ? ` - ${course}` : ''}`,
      type: event_type,
      start_time: eventTime.format('HH:mm'),
      end_time: endTime.format('HH:mm'),
      priority: 'medium',
      course: course || '',
      description: description || '',
      estimatedHours: parseFloat(duration)
    };

    // Add to schedule
    const dateKey = eventDate.format('YYYY-MM-DD');
    const updatedSchedule = {
      ...schedule,
      [dateKey]: [...(schedule[dateKey] || []), scheduledEvent]
    };

    if (onUpdateSchedule) {
      onUpdateSchedule(updatedSchedule);
    }

    // Highlight the new event
    setHighlightedEvent(scheduledEvent.id);
    setTimeout(() => setHighlightedEvent(null), 3000);

    const response = `✅ **Event Scheduled Successfully!**

📅 **Date:** ${eventDate.format('dddd, MMM DD')}
⏰ **Time:** ${eventTime.format('h:mm A')} - ${endTime.format('h:mm A')}
📚 **Type:** ${event_type.charAt(0).toUpperCase() + event_type.slice(1)}
⏱️ **Duration:** ${duration} hour${duration > 1 ? 's' : ''}
${course ? `🎓 **Course:** ${course}` : ''}
${description ? `📝 **Notes:** ${description}` : ''}

Your event has been added to your calendar! 🎯`;

    setCommandResponse(response);
    
    notification.success({
      message: 'Event Scheduled',
      description: `${scheduledEvent.title} added to ${eventDate.format('MMM DD')}`,
      placement: 'topRight'
    });

    return response;
  };

  /**
   * Execute reschedule event command
   */
  const executeRescheduleEvent = async (params) => {
    const { event_identifier, new_date, new_time } = params;

    if (!event_identifier) {
      setCommandResponse("Which event would you like to reschedule? Example: 'Move my math session to Friday'");
      return "Please specify the event.";
    }

    // Find the event in the schedule
    let foundEvent = null;
    let foundDate = null;
    
    for (const [date, events] of Object.entries(schedule)) {
      const event = events.find(e => {
        const eventTitle = typeof e === 'string' ? e : e.title;
        return eventTitle.toLowerCase().includes(event_identifier.toLowerCase());
      });
      if (event) {
        foundEvent = event;
        foundDate = date;
        break;
      }
    }

    if (!foundEvent) {
      setCommandResponse(`I couldn't find "${event_identifier}" in your schedule. Available events: ${Object.values(schedule).flat().slice(0, 3).map(e => typeof e === 'string' ? e : e.title).join(', ')}...`);
      return "Event not found.";
    }

    // Parse new date/time
    let newEventDate = foundDate;
    if (new_date) {
      if (DAYS.some(day => new_date.toLowerCase().includes(day.toLowerCase()))) {
        const dayIndex = DAYS.findIndex(day => new_date.toLowerCase().includes(day.toLowerCase()));
        newEventDate = dayjs().startOf('week').add(dayIndex + 1, 'day').format('YYYY-MM-DD');
      } else {
        newEventDate = dayjs(new_date).format('YYYY-MM-DD');
      }
    }

    // Remove from old date and add to new date
    const updatedSchedule = { ...schedule };
    updatedSchedule[foundDate] = updatedSchedule[foundDate].filter(e => e !== foundEvent);
    
    if (!updatedSchedule[newEventDate]) {
      updatedSchedule[newEventDate] = [];
    }
    
    const rescheduledEvent = { ...foundEvent };
    if (new_time && typeof foundEvent === 'object') {
      // Update time if specified
      const newStartTime = dayjs(new_time, 'HH:mm');
      const duration = dayjs(foundEvent.end_time, 'HH:mm').diff(dayjs(foundEvent.start_time, 'HH:mm'), 'hour', true);
      rescheduledEvent.start_time = newStartTime.format('HH:mm');
      rescheduledEvent.end_time = newStartTime.add(duration, 'hour').format('HH:mm');
    }
    
    updatedSchedule[newEventDate].push(rescheduledEvent);

    if (onUpdateSchedule) {
      onUpdateSchedule(updatedSchedule);
    }

    setHighlightedEvent(rescheduledEvent.id);
    setTimeout(() => setHighlightedEvent(null), 3000);

    const eventTitle = typeof foundEvent === 'string' ? foundEvent : foundEvent.title;
    const response = `✅ **Event Rescheduled!**

📝 **Event:** ${eventTitle}
📅 **From:** ${dayjs(foundDate).format('dddd, MMM DD')}
📅 **To:** ${dayjs(newEventDate).format('dddd, MMM DD')}
${new_time ? `⏰ **New Time:** ${new_time}` : ''}

Your event has been moved successfully! 📅`;

    setCommandResponse(response);
    
    notification.success({
      message: 'Event Rescheduled',
      description: `${eventTitle} moved to ${dayjs(newEventDate).format('MMM DD')}`,
      placement: 'topRight'
    });

    return response;
  };

  /**
   * Execute optimize schedule command
   */
  const executeOptimizeSchedule = async (params) => {
    const { focus_area, constraints } = params;

    // Analyze current schedule for optimization opportunities
    const totalHours = workloadAnalysis.weekly?.totalHours || 0;
    const peakDay = workloadAnalysis.weekly?.peakDay;
    const lightestDay = workloadAnalysis.weekly?.lightestDay;
    const unscheduledHighPriority = tasks.filter(t => 
      t.priority === 'high' && !t.completed && !isTaskScheduled(t.name)
    );

    let optimizations = [];
    
    if (peakDay && lightestDay && workloadAnalysis[peakDay]?.hours > workloadAnalysis[lightestDay]?.hours + 4) {
      optimizations.push({
        type: 'balance',
        suggestion: `Move some tasks from ${getDayName(peakDay)} (${workloadAnalysis[peakDay]?.hours}h) to ${getDayName(lightestDay)} (${workloadAnalysis[lightestDay]?.hours}h)`
      });
    }

    if (unscheduledHighPriority.length > 0) {
      optimizations.push({
        type: 'priority',
        suggestion: `Schedule ${unscheduledHighPriority.length} high-priority tasks during your most productive hours`
      });
    }

    if (totalHours < 20) {
      optimizations.push({
        type: 'capacity',
        suggestion: 'You have capacity for additional study sessions - consider adding review time'
      });
    }

    const response = `📊 **Schedule Optimization Analysis:**

**Current Status:**
📅 Total weekly hours: ${totalHours}h
📈 Peak day: ${peakDay ? getDayName(peakDay) : 'N/A'}
📉 Lightest day: ${lightestDay ? getDayName(lightestDay) : 'N/A'}
⚡ Unscheduled high-priority tasks: ${unscheduledHighPriority.length}

**💡 Optimization Suggestions:**
${optimizations.length > 0 ? 
  optimizations.map((opt, i) => `${i + 1}. ${opt.suggestion}`).join('\n') : 
  '✅ Your schedule looks well-balanced!'
}

**🎯 Smart Recommendations:**
• Schedule demanding tasks during your peak energy hours (typically 9-11 AM)
• Block similar tasks together to maintain focus
• Leave buffer time between intensive study sessions
• Plan breaks every 90-120 minutes for optimal retention

Would you like me to automatically apply these optimizations? 🚀`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute analyze workload command
   */
  const executeAnalyzeWorkload = async (params) => {
    const { timeframe } = params;

    const analysis = workloadAnalysis.weekly || {};
    const currentWeekEvents = Object.values(schedule).flat().length;
    const currentWeekHours = analysis.totalHours || 0;
    
    // Calculate workload distribution
    const dayDistribution = weekDates.map(date => ({
      day: getDayName(date),
      date: date,
      events: (schedule[date] || []).length,
      hours: workloadAnalysis[date]?.hours || 0,
      intensity: workloadAnalysis[date]?.intensity || 'low'
    }));

    const heavyDays = dayDistribution.filter(d => d.intensity === 'high').length;
    const lightDays = dayDistribution.filter(d => d.hours === 0).length;

    const response = `📊 **Weekly Workload Analysis:**

**📈 Overview:**
• Total events: ${currentWeekEvents}
• Total study hours: ${currentWeekHours}h
• Average per day: ${(currentWeekHours / 7).toFixed(1)}h
• Heavy workload days: ${heavyDays}
• Free days: ${lightDays}

**📅 Daily Breakdown:**
${dayDistribution.map(day => {
  const intensityIcon = day.intensity === 'high' ? '🔥' : day.intensity === 'medium' ? '⚡' : '✅';
  return `${intensityIcon} **${day.day}**: ${day.events} events, ${day.hours}h`;
}).join('\n')}

**💡 Workload Insights:**
${currentWeekHours > 35 ? '⚠️ Very heavy workload - consider redistributing or extending deadlines' : ''}
${currentWeekHours < 15 ? '📈 Light workload - good opportunity to get ahead on future tasks' : ''}
${heavyDays > 2 ? '⚖️ Consider spreading intensive days throughout the week' : ''}
${lightDays > 2 ? '🎯 Utilize free days for catching up or review sessions' : ''}
${analysis.peakDay ? `🏔️ Peak workload: ${getDayName(analysis.peakDay)} (${workloadAnalysis[analysis.peakDay]?.hours}h)` : ''}

**🎯 Recommendations:**
• Aim for 3-5 hours of focused study time per day
• Balance intensive subjects with lighter review sessions
• Keep at least one day lighter for unexpected tasks or rest`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute suggest focus time command
   */
  const executeSuggestFocusTime = async (params) => {
    const { course, task_type } = params;

    // Analyze schedule to find optimal focus periods
    const suggestions = [];
    
    // Find gaps in schedule for focus time
    weekDates.forEach(date => {
      const dayEvents = schedule[date] || [];
      const dayName = getDayName(date);
      
      if (dayEvents.length === 0) {
        suggestions.push({
          day: dayName,
          time: '9:00 AM - 12:00 PM',
          reason: 'Free morning - ideal for deep work',
          priority: 'high'
        });
      } else if (dayEvents.length < 3) {
        suggestions.push({
          day: dayName,
          time: '2:00 PM - 4:00 PM',
          reason: 'Light schedule - good for focused study',
          priority: 'medium'
        });
      }
    });

    // Add general peak performance suggestions
    suggestions.push({
      day: 'Daily',
      time: '9:00 AM - 11:00 AM',
      reason: 'Peak cognitive performance hours',
      priority: 'high'
    });

    const response = `🎯 **Optimal Focus Time Suggestions:**

${course ? `**For ${course}:**` : '**General Study Sessions:**'}

**🏆 High-Priority Time Slots:**
${suggestions.filter(s => s.priority === 'high').map(s => 
  `• **${s.day}**: ${s.time}\n  💡 ${s.reason}`
).join('\n\n')}

**⚡ Good Alternative Slots:**
${suggestions.filter(s => s.priority === 'medium').map(s => 
  `• **${s.day}**: ${s.time}\n  💡 ${s.reason}`
).join('\n\n')}

**🧠 Focus Time Best Practices:**
• Schedule demanding subjects during morning hours (9-11 AM)
• Use afternoon slots (2-4 PM) for review and practice
• Avoid scheduling intensive work after 6 PM
• Block minimum 90-minute sessions for deep work
• Add 15-minute breaks between focus blocks

**📱 Environment Tips:**
• Turn off notifications during focus time
• Use the Pomodoro technique (25 min work + 5 min break)
• Keep water and snacks nearby
• Choose a quiet, dedicated study space

Would you like me to schedule any of these focus sessions? 🚀`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute block time command
   */
  const executeBlockTime = async (params) => {
    const { time_slot, activity, recurring } = params;

    if (!time_slot || !activity) {
      setCommandResponse("I need both a time slot and activity. Example: 'Block Wednesday afternoon for CMPSC project'");
      return "Missing time slot or activity.";
    }

    // Parse time slot
    let targetDate = dayjs();
    let startTime = dayjs().hour(9).minute(0);
    let endTime = dayjs().hour(12).minute(0);

    // Parse day from time slot
    const dayMatch = DAYS.find(day => time_slot.toLowerCase().includes(day.toLowerCase()));
    if (dayMatch) {
      const dayIndex = DAYS.indexOf(dayMatch);
      targetDate = dayjs().startOf('week').add(dayIndex + 1, 'day');
    }

    // Parse time of day
    if (time_slot.toLowerCase().includes('morning')) {
      startTime = dayjs().hour(9).minute(0);
      endTime = dayjs().hour(12).minute(0);
    } else if (time_slot.toLowerCase().includes('afternoon')) {
      startTime = dayjs().hour(14).minute(0);
      endTime = dayjs().hour(17).minute(0);
    } else if (time_slot.toLowerCase().includes('evening')) {
      startTime = dayjs().hour(19).minute(0);
      endTime = dayjs().hour(21).minute(0);
    }

    const blockedEvent = {
      id: Date.now(),
      title: `${activity} (Blocked Time)`,
      type: 'study',
      start_time: startTime.format('HH:mm'),
      end_time: endTime.format('HH:mm'),
      priority: 'high',
      description: 'Protected focus time',
      estimatedHours: endTime.diff(startTime, 'hour', true)
    };

    // Add to schedule
    const dateKey = targetDate.format('YYYY-MM-DD');
    const updatedSchedule = {
      ...schedule,
      [dateKey]: [...(schedule[dateKey] || []), blockedEvent]
    };

    if (onUpdateSchedule) {
      onUpdateSchedule(updatedSchedule);
    }

    setHighlightedEvent(blockedEvent.id);
    setTimeout(() => setHighlightedEvent(null), 3000);

    const response = `🔒 **Time Block Created!**

📅 **Date:** ${targetDate.format('dddd, MMM DD')}
⏰ **Time:** ${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}
🎯 **Activity:** ${activity}
⏱️ **Duration:** ${blockedEvent.estimatedHours} hours
${recurring ? '🔄 **Recurring:** Yes' : ''}

This time is now protected for focused work on ${activity}! 
No other commitments will be scheduled during this period. 🛡️`;

    setCommandResponse(response);
    
    notification.success({
      message: 'Time Block Created',
      description: `${time_slot} blocked for ${activity}`,
      placement: 'topRight'
    });

    return response;
  };

  /**
   * Handle generic planner commands
   */
  const handleGenericPlannerCommand = async (commandData) => {
    const response = `Weekly Planner is ready! Try commands like:
    
• "Schedule 2 hours study time tomorrow"
• "Move my math session to Friday"
• "Optimize my schedule this week"
• "Analyze my workload"
• "Suggest focus time for CMPSC"
• "Block Wednesday afternoon for project work"`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Generate current week dates based on selected week
   */
  const weekDates = useMemo(() => {
    const startOfWeek = selectedWeek.startOf('week').add(1, 'day'); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day').format('YYYY-MM-DD'));
  }, [selectedWeek]);

  /**
   * Analyze workload distribution and generate insights
   */
  const analyzeWorkload = useCallback(() => {
    const analysis = {};
    let totalHours = 0;
    let totalTasks = 0;

    weekDates.forEach(date => {
      const dayTasks = schedule[date] || [];
      let dayHours = 0;
      
      dayTasks.forEach(taskItem => {
        if (typeof taskItem === 'object' && taskItem.estimatedHours) {
          dayHours += taskItem.estimatedHours;
        } else {
          // Extract estimated time from task string (e.g., "Task Name (2hrs)")
          const taskString = typeof taskItem === 'string' ? taskItem : taskItem.title || '';
          const timeMatch = taskString.match(/\((\d+(?:\.\d+)?)\s*hrs?\)/);
          if (timeMatch) {
            dayHours += parseFloat(timeMatch[1]);
          } else {
            dayHours += 1; // Default 1 hour if no time specified
          }
        }
      });

      analysis[date] = {
        tasks: dayTasks.length,
        hours: dayHours,
        intensity: dayHours > 8 ? 'high' : dayHours > 4 ? 'medium' : 'low',
        efficiency: dayHours > 0 ? Math.min(100, (dayHours / 8) * 100) : 0
      };

      totalHours += dayHours;
      totalTasks += dayTasks.length;
    });

    analysis.weekly = {
      totalHours,
      totalTasks,
      averageHoursPerDay: totalHours / 7,
      peakDay: Object.keys(analysis).reduce((peak, date) => 
        date !== 'weekly' && analysis[date].hours > (analysis[peak]?.hours || 0) ? date : peak, null
      ),
      lightestDay: Object.keys(analysis).reduce((light, date) => 
        date !== 'weekly' && analysis[date].hours < (analysis[light]?.hours || 24) ? date : light, null
      )
    };

    setWorkloadAnalysis(analysis);
  }, [schedule, weekDates]);

  /**
   * Check if a task is already scheduled
   */
  const isTaskScheduled = useCallback((taskName) => {
    return Object.values(schedule).some(dayTasks => 
      dayTasks.some(scheduledTask => {
        const taskStr = typeof scheduledTask === 'string' ? scheduledTask : scheduledTask?.title || '';
        return taskStr.toLowerCase().includes(taskName.toLowerCase());
      })
    );
  }, [schedule]);

  /**
   * Get day name from date string
   */
  const getDayName = useCallback((dateString) => {
    const date = new Date(dateString);
    return DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
  }, []);

  /**
   * Generate smart scheduling suggestions
   */
  const generateSmartSuggestions = useMemo(() => {
    if (!workloadAnalysis.weekly) return [];

    const suggestions = [];
    const { peakDay, lightestDay, averageHoursPerDay } = workloadAnalysis.weekly;

    // Workload balance suggestions
    if (peakDay && lightestDay) {
      const peakHours = workloadAnalysis[peakDay]?.hours || 0;
      const lightHours = workloadAnalysis[lightestDay]?.hours || 0;
      
      if (peakHours - lightHours > 4) {
        suggestions.push({
          type: 'balance',
          icon: '⚖️',
          title: 'Rebalance Workload',
          description: `${getDayName(peakDay)} is overloaded (${peakHours}h) while ${getDayName(lightestDay)} is light (${lightHours}h).`,
          action: 'Consider moving some tasks to distribute work more evenly.',
          priority: 'high'
        });
      }
    }

    // Focus time suggestions
    const unscheduledHighPriorityTasks = tasks.filter(t => 
      t.priority === 'high' && !t.completed && !isTaskScheduled(t.name)
    );

    if (unscheduledHighPriorityTasks.length > 0) {
      suggestions.push({
        type: 'priority',
        icon: '🚨',
        title: 'Schedule High Priority Tasks',
        description: `${unscheduledHighPriorityTasks.length} high priority tasks need scheduling.`,
        action: 'Schedule these during your most productive hours.',
        priority: 'high',
        tasks: unscheduledHighPriorityTasks.slice(0, 3)
      });
    }

    // Study pattern suggestions
    if (averageHoursPerDay < 3) {
      suggestions.push({
        type: 'productivity',
        icon: '📈',
        title: 'Increase Study Time',
        description: `Currently averaging ${averageHoursPerDay.toFixed(1)}h/day.`,
        action: 'Consider adding 1-2 hours of focused study time daily.',
        priority: 'medium'
      });
    }

    return suggestions.slice(0, 3); // Show top 3 suggestions
  }, [workloadAnalysis, tasks, isTaskScheduled, getDayName]);

  /**
   * Apply AI suggestion
   */
  const applySuggestion = (suggestion) => {
    switch (suggestion.type) {
      case 'balance':
        notification.info({
          message: 'Workload Rebalancing',
          description: 'Drag tasks between days to balance your workload.',
          placement: 'topRight'
        });
        break;
      case 'priority':
        setShowAddEventModal(true);
        break;
      case 'productivity':
        setNewEvent(prev => ({ ...prev, type: 'study', title: 'Additional Study Session' }));
        setShowAddEventModal(true);
        break;
    }
  };

  /**
   * Handle drag operations
   */
  const handleDragOver = (e, date) => {
    e.preventDefault();
    setHoveredDay(date);
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    if (draggedTask && onTaskMove) {
      onTaskMove(draggedTask, date);
      setRecentlyMovedTask(draggedTask);
      setTimeout(() => setRecentlyMovedTask(null), 2000);
    }
    setDraggedTask(null);
    setHoveredDay(null);
  };

  // Update workload analysis when schedule changes
  useEffect(() => {
    analyzeWorkload();
  }, [analyzeWorkload]);

  // Clear recently moved task highlight after delay
  useEffect(() => {
    if (recentlyMovedTask) {
      const timer = setTimeout(() => {
        setRecentlyMovedTask(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recentlyMovedTask]);

  return (
    <div className="weekly-planner">
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
              message={
                <div className="flex items-center">
                  <RobotOutlined className="text-[#9981FF] mr-2" />
                  Planning Command Processed
                  {processingCommand && (
                    <Tag color="processing" className="ml-2">
                      Processing...
                    </Tag>
                  )}
                </div>
              }
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

      {/* Header with Controls */}
      <Card className="bg-[#1F1F2C] border-gray-700 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <RobotOutlined className="text-[#9981FF] text-xl" />
            <h2 className="text-white text-xl m-0">AI Weekly Planner</h2>
            {workloadAnalysis.weekly && (
              <Tag color={workloadAnalysis.weekly.averageHoursPerDay > 6 ? 'red' : 'green'}>
                {workloadAnalysis.weekly.totalHours}h this week
              </Tag>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <DatePicker
              value={selectedWeek}
              onChange={setSelectedWeek}
              picker="week"
              className="bg-[#333] text-white border-gray-600"
            />
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => setShowAddEventModal(true)}
              style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
            >
              Add Event
            </Button>
          </div>
        </div>

        {showInstructions && (
          <Alert
            message="Smart Planning Tips"
            description="Use natural language commands like 'schedule 2 hours study time tomorrow' or 'optimize my week'. Drag tasks between days to reschedule them."
            type="info"
            closable
            onClose={() => setShowInstructions(false)}
            className="mb-4 bg-[#26262F] border-[#9981FF]"
          />
        )}
      </Card>

      {/* Smart Suggestions */}
      <AnimatePresence>
        {showSmartSuggestions && generateSmartSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Card className="bg-[#1F1F2C] border-[#9981FF] border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <BulbOutlined className="text-[#9981FF] mr-2" />
                  <span className="text-white font-medium">AI Scheduling Suggestions</span>
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setShowSmartSuggestions(false)}
                  className="text-gray-400"
                >
                  ✕
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {generateSmartSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-[#26262F] p-3 rounded-lg border ${
                      suggestion.priority === 'high' 
                        ? 'bg-red-900/20 border-red-500' 
                        : 'bg-yellow-900/20 border-yellow-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white text-sm font-medium mb-1">
                          {suggestion.icon} {suggestion.title}
                        </h4>
                        <p className="text-gray-400 text-xs mb-2">{suggestion.description}</p>
                        <p className="text-gray-300 text-xs">{suggestion.action}</p>
                        
                        {suggestion.tasks && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {suggestion.tasks.map((task, i) => (
                              <Tag key={i} size="small" color="red">
                                {task.name}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => applySuggestion(suggestion)}
                        className="ml-3 border-[#9981FF] text-[#9981FF]"
                      >
                        Apply
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Weekly Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <AnimatePresence>
          {weekDates.map((date, index) => {
            const dayTasks = schedule[date] || [];
            const dayAnalysis = workloadAnalysis[date] || { tasks: 0, hours: 0, intensity: 'low' };
            const isToday = dayjs(date).isSame(dayjs(), 'day');
            
            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`day-card ${hoveredDay === date ? 'day-hovered' : ''}`}
                onDragOver={(e) => handleDragOver(e, date)}
                onDrop={(e) => handleDrop(e, date)}
              >
                <Card 
                  title={
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`text-base font-medium ${isToday ? 'text-[#9981FF]' : 'text-white'}`}>
                          {getDayName(date)}
                        </span>
                        <p className="text-xs text-gray-400 m-0">
                          {dayjs(date).format('MMM DD')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          color={dayAnalysis.intensity === 'high' ? 'red' : 
                                 dayAnalysis.intensity === 'medium' ? 'orange' : 'green'} 
                          text={`${dayAnalysis.hours}h`}
                        />
                        <div className="text-xs text-gray-400">
                          {dayTasks.length} events
                        </div>
                      </div>
                    </div>
                  }
                  className={`h-full min-h-[300px] ${
                    isToday ? 'bg-[#1F1F2C] border-[#9981FF]' : 'bg-[#1A1A24] border-gray-700'
                  } ${hoveredDay === date ? 'border-[#9981FF] border-2' : ''}`}
                  headStyle={{ borderBottom: '1px solid #333', padding: '8px 16px' }}
                  bodyStyle={{ padding: '12px' }}
                >
                  {/* Workload Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span>Workload</span>
                      <span>{dayAnalysis.hours}h</span>
                    </div>
                    <Progress
                      percent={Math.min(100, (dayAnalysis.hours / 8) * 100)}
                      showInfo={false}
                      strokeColor={
                        dayAnalysis.intensity === 'high' ? '#ff4d4f' :
                        dayAnalysis.intensity === 'medium' ? '#faad14' : '#52c41a'
                      }
                      size="small"
                    />
                  </div>

                  {/* Events List */}
                  <div className="events-list">
                    <AnimatePresence>
                      {dayTasks.length > 0 ? (
                        dayTasks.map((task, taskIndex) => (
                          <EventItem
                            key={taskIndex}
                            event={task}
                            isHighlighted={
                              typeof task === 'object' && 
                              (highlightedEvent === task.id || recentlyMovedTask === task)
                            }
                          />
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-4 text-gray-500"
                        >
                          <CalendarOutlined className="text-2xl mb-2" />
                          <p className="text-xs">No events scheduled</p>
                          <Button
                            size="small"
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              setQuickAddDay(date);
                              setShowAddEventModal(true);
                            }}
                            className="mt-2 text-gray-400 border-gray-600"
                          >
                            Add Event
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick Actions */}
                  {dayTasks.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-700">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">
                          {dayAnalysis.intensity === 'high' ? '🔥 Heavy day' : 
                           dayAnalysis.intensity === 'medium' ? '⚡ Moderate' : '✅ Light'}
                        </span>
                        <Button
                          size="small"
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setQuickAddDay(date);
                            setShowAddEventModal(true);
                          }}
                          className="text-gray-400"
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Footer Instructions */}
      <div className="mt-6 text-center bg-[#1F1F2C] p-4 rounded-lg">
        <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center">
            <SwapOutlined className="mr-2 text-[#9981FF]" />
            Drag to reschedule
          </span>
          <span className="flex items-center">
            <BulbOutlined className="mr-2 text-[#9981FF]" />
            AI suggestions available
          </span>
          <span className="flex items-center">
            <BarChartOutlined className="mr-2 text-[#9981FF]" />
            Real-time workload analysis
          </span>
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        title="Schedule New Event"
        open={showAddEventModal}
        onCancel={() => {
          setShowAddEventModal(false);
          setQuickAddDay(null);
          setNewEvent({
            title: '',
            type: 'study',
            date: dayjs(),
            startTime: dayjs().hour(9).minute(0),
            endTime: dayjs().hour(10).minute(0),
            priority: 'medium',
            course: '',
            description: ''
          });
        }}
        onOk={() => {
          // Handle event creation
          const duration = newEvent.endTime.diff(newEvent.startTime, 'hour', true);
          executeScheduleEvent({
            event_type: newEvent.type,
            duration: duration.toString(),
            date: (quickAddDay || newEvent.date.format('YYYY-MM-DD')),
            time: newEvent.startTime.format('HH:mm'),
            course: newEvent.course,
            description: newEvent.description
          });
          setShowAddEventModal(false);
          setQuickAddDay(null);
        }}
        className="event-modal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Event Title</label>
            <Input
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Study session, meeting, etc."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Type</label>
              <Select
                value={newEvent.type}
                onChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}
                className="w-full"
              >
                <Option value="study">Study Session</Option>
                <Option value="meeting">Meeting</Option>
                <Option value="class">Class</Option>
                <Option value="deadline">Deadline</Option>
                <Option value="break">Break</Option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <Select
                value={newEvent.priority}
                onChange={(value) => setNewEvent(prev => ({ ...prev, priority: value }))}
                className="w-full"
              >
                <Option value="high">High</Option>
                <Option value="medium">Medium</Option>
                <Option value="low">Low</Option>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <DatePicker
              value={quickAddDay ? dayjs(quickAddDay) : newEvent.date}
              onChange={(date) => setNewEvent(prev => ({ ...prev, date }))}
              className="w-full"
              disabled={!!quickAddDay}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <TimePicker
                value={newEvent.startTime}
                onChange={(time) => setNewEvent(prev => ({ ...prev, startTime: time }))}
                format="HH:mm"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <TimePicker
                value={newEvent.endTime}
                onChange={(time) => setNewEvent(prev => ({ ...prev, endTime: time }))}
                format="HH:mm"
                className="w-full"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Course (Optional)</label>
            <Input
              value={newEvent.course}
              onChange={(e) => setNewEvent(prev => ({ ...prev, course: e.target.value }))}
              placeholder="MATH 230, CMPSC 132, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <TextArea
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes or details..."
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WeeklyPlanner;