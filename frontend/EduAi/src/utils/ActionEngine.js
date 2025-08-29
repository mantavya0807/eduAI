/**
 * Enhanced Action Engine for EduAI
 * Directly executes commands on website components instead of returning text responses
 * @author EduAI Development Team
 */

import { INTENT_TYPES } from './CommandParser.js';

/**
 * Result types for action execution
 */
export const ACTION_RESULTS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PARTIAL: 'partial',
  NO_ACTION: 'no_action'
};

/**
 * Action types for different operations
 */
export const ACTION_TYPES = {
  DATA_MODIFIED: 'data_modified',
  VIEW_CHANGED: 'view_changed',
  MODAL_OPENED: 'modal_opened',
  NOTIFICATION_SENT: 'notification_sent',
  COMPONENT_OPENED: 'component_opened',
  UI_UPDATED: 'ui_updated',
  MULTIPLE: 'multiple'
};

/**
 * Enhanced ActionEngine class that directly manipulates website components
 */
export class ActionEngine {
  /**
   * Initialize ActionEngine with application context
   * @param {Object} appContext - Application state and setters
   */
  constructor(appContext) {
    this.context = appContext;
    this.actionHistory = [];
  }

  /**
   * Clear action history
   */
  clearHistory() {
    this.actionHistory = [];
  }

  /**
   * Execute a parsed command by directly manipulating website components
   * @param {Object} parsedCommand - Command from CommandParser
   * @param {string} originalMessage - Original user message for LLM context
   * @returns {Object} Execution result with actions taken and response
   */
  async execute(parsedCommand, originalMessage = '') {
    const { intent, parameters, confidence } = parsedCommand;
    
    // Log command execution
    this.actionHistory.push({
      command: parsedCommand,
      originalMessage,
      timestamp: new Date().toISOString(),
      executed: false
    });

    try {
      let result;
      
      switch (intent) {
        case INTENT_TYPES.CREATE_TASK:
          result = await this._executeCreateTask(parameters);
          break;
          
        case INTENT_TYPES.COMPLETE_TASK:
          result = await this._executeCompleteTask(parameters);
          break;
          
        case INTENT_TYPES.ESTIMATE_TIME:
          result = await this._executeEstimateTime(parameters);
          break;
          
        case INTENT_TYPES.VIEW_SCHEDULE:
          result = await this._executeViewSchedule(parameters);
          break;
          
        case INTENT_TYPES.VIEW_PRIORITIES:
          result = await this._executeViewPriorities(parameters);
          break;
          
        case INTENT_TYPES.VIEW_DEADLINES:
          result = await this._executeViewDeadlines(parameters);
          break;
          
        case INTENT_TYPES.ADD_EVENT:
          result = await this._executeAddEvent(parameters);
          break;
          
        case INTENT_TYPES.FIND_PEERS:
          result = await this._executeFindPeers(parameters);
          break;
          
        case INTENT_TYPES.VIEW_PROGRESS:
          result = await this._executeViewProgress(parameters);
          break;
          
        case INTENT_TYPES.UPDATE_TASK:
          result = await this._executeUpdateTask(parameters);
          break;
          
        case INTENT_TYPES.GET_TASKS:
          result = await this._executeGetTasks(parameters);
          break;
          
        case INTENT_TYPES.SET_PRIORITY:
          result = await this._executeSetPriority(parameters);
          break;
          
        case INTENT_TYPES.GREETING:
          result = this._executeGreeting();
          break;
          
        case INTENT_TYPES.HELP:
          result = this._executeHelp();
          break;
          
        case INTENT_TYPES.UNKNOWN:
        default:
          result = await this._executeUnknown(intent, parameters, originalMessage);
          break;
      }
      
      // Mark as executed
      this.actionHistory[this.actionHistory.length - 1].executed = true;
      this.actionHistory[this.actionHistory.length - 1].result = result;
      
      return result;
      
    } catch (error) {
      console.error('ActionEngine execution error:', error);
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        "I encountered an error while processing your request. Please try again.",
        { error: error.message }
      );
    }
  }

  /**
   * Execute CREATE_TASK command - Creates new task and updates UI
   * @private
   */
  async _executeCreateTask(parameters) {
    const { title, dueDate, priority = 'medium', course, estimatedTime } = parameters;
    
    if (!title) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        "I need a task title to create a new task. Could you specify what task you'd like to add?"
      );
    }

    // Generate new task
    const newTask = {
      id: Date.now(),
      name: title,
      dueDate: dueDate || this._getDefaultDueDate(),
      priority: priority,
      course: course || 'General',
      estimatedTime: estimatedTime || null,
      difficulty: null,
      focus: null,
      completed: false,
      createdAt: new Date().toISOString()
    };

    // Add to tasks array
    if (this.context.setTasks) {
      this.context.setTasks(prevTasks => [...prevTasks, newTask]);
    }

    // Also add to schedule if date is specified
    if (dueDate && this.context.setSchedule) {
      const taskEntry = `${title} (${estimatedTime ? estimatedTime + 'hrs' : 'TBD'})`;
      this.context.setSchedule(prevSchedule => ({
        ...prevSchedule,
        [dueDate]: [...(prevSchedule[dueDate] || []), taskEntry]
      }));
    }

    // Select the new task
    if (this.context.setSelectedTask) {
      this.context.setSelectedTask(newTask);
    }

    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.DATA_MODIFIED,
      `✅ **Task Created Successfully!**\n\n**"${title}"** has been added to your task list.\n\n• **Due:** ${dueDate || 'No due date set'}\n• **Priority:** ${priority}\n• **Course:** ${course || 'General'}\n\nThe task is now available in your dashboard and has been selected for easy access.`,
      { 
        taskCreated: newTask,
        actions: ['task_added', 'task_selected', 'schedule_updated']
      }
    );
  }

  /**
   * Execute COMPLETE_TASK command - Marks task as completed
   * @private
   */
  async _executeCompleteTask(parameters) {
    const { taskName } = parameters;
    
    if (!taskName) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        "Please specify which task you'd like to mark as complete."
      );
    }

    // Find the task
    const targetTask = this.context.tasks?.find(task => 
      task.name.toLowerCase().includes(taskName.toLowerCase())
    );

    if (!targetTask) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        `I couldn't find a task matching "${taskName}". Please check the task name.`
      );
    }

    // Mark as completed
    if (this.context.setTasks) {
      this.context.setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === targetTask.id 
            ? { ...task, completed: true, completedAt: new Date().toISOString() }
            : task
        )
      );
    }

    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.DATA_MODIFIED,
      `🎉 **Task Completed!**\n\n**"${targetTask.name}"** has been marked as complete.\n\nGreat job! Keep up the momentum with your remaining tasks.`,
      { 
        taskCompleted: targetTask,
        actions: ['task_completed', 'progress_updated']
      }
    );
  }

  /**
   * Execute ESTIMATE_TIME command - Opens time estimator for specific task
   * @private
   */
  async _executeEstimateTime(parameters) {
    const { taskName } = parameters;
    
    if (!taskName) {
      // Open estimator with selected task or first available task
      const targetTask = this.context.selectedTask || this.context.tasks?.[0];
      
      if (!targetTask) {
        return this._createResult(
          ACTION_RESULTS.ERROR,
          ACTION_TYPES.NOTIFICATION_SENT,
          "No tasks available to estimate. Please create a task first."
        );
      }

      // Open the time estimator modal
      if (this.context.onOpenEstimator) {
        setTimeout(() => this.context.onOpenEstimator(), 500);
      }

      return this._createResult(
        ACTION_RESULTS.SUCCESS,
        ACTION_TYPES.MODAL_OPENED,
        `⏱️ **Opening Time Estimator**\n\nI'll help you estimate how long **"${targetTask.name}"** will take to complete.\n\nThe estimator will consider factors like task difficulty and your current focus level.`,
        { 
          taskSelected: targetTask,
          actions: ['modal_opened', 'estimator_opened']
        }
      );
    }

    // Find specific task to estimate
    const targetTask = this.context.tasks?.find(task => 
      task.name.toLowerCase().includes(taskName.toLowerCase())
    );

    if (!targetTask) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        `I couldn't find a task matching "${taskName}". Please check the task name.`
      );
    }

    // Select the task and open estimator
    if (this.context.setSelectedTask) {
      this.context.setSelectedTask(targetTask);
    }

    if (this.context.onOpenEstimator) {
      setTimeout(() => this.context.onOpenEstimator(), 500);
    }

    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.MODAL_OPENED,
      `⏱️ **Opening Time Estimator for "${targetTask.name}"**\n\nThe smart estimator will help you calculate how long this task will take based on complexity and your working patterns.`,
      { 
        taskSelected: targetTask,
        actions: ['task_selected', 'modal_opened', 'estimator_opened']
      }
    );
  }

  /**
   * Execute VIEW_SCHEDULE command - Opens schedule/calendar view
   * @private
   */
  async _executeViewSchedule(parameters) {
    const { timeframe = 'week' } = parameters;
    
    // Directly open the schedule component
    if (timeframe === 'month' || timeframe === 'calendar') {
      if (this.context.onOpenCalendar) {
        setTimeout(() => this.context.onOpenCalendar(), 300);
      }
    } else {
      if (this.context.onOpenSchedule) {
        setTimeout(() => this.context.onOpenSchedule(), 300);
      }
    }

    // Generate quick schedule summary
    const scheduleSummary = this._generateScheduleSummary(timeframe);
    const viewType = timeframe === 'month' || timeframe === 'calendar' ? 'calendar' : 'weekly planner';
    
    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.VIEW_CHANGED,
      `📅 **Opening Your ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Schedule**\n\n${scheduleSummary}\n\n*${viewType} is now displayed for detailed planning and scheduling.*`,
      { 
        viewOpened: viewType,
        timeframe,
        actions: ['view_opened', 'schedule_displayed']
      }
    );
  }

  /**
   * Execute VIEW_PRIORITIES command - Opens priority dashboard
   * @private
   */
  async _executeViewPriorities(parameters) {
    if (this.context.onOpenPriorities) {
      setTimeout(() => this.context.onOpenPriorities(), 300);
    }

    const prioritySummary = this._generatePrioritySummary();
    
    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.VIEW_CHANGED,
      `🔥 **Opening Priority Dashboard**\n\n${prioritySummary}\n\n*Priority view is now active for focused task management.*`,
      { 
        viewOpened: 'priorities',
        actions: ['view_opened', 'priorities_displayed']
      }
    );
  }

  /**
   * Execute VIEW_DEADLINES command - Opens deadline manager
   * @private
   */
  async _executeViewDeadlines(parameters) {
    if (this.context.onOpenDeadlines) {
      setTimeout(() => this.context.onOpenDeadlines(), 300);
    }

    const deadlineSummary = this._generateDeadlineSummary();
    
    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.VIEW_CHANGED,
      `⏰ **Opening Deadline Manager**\n\n${deadlineSummary}\n\n*Deadline tracking view is now active.*`,
      { 
        viewOpened: 'deadlines',
        actions: ['view_opened', 'deadlines_displayed']
      }
    );
  }

  /**
   * Execute ADD_EVENT command - Adds event to calendar
   * @private
   */
  async _executeAddEvent(parameters) {
    const { title, date, time, duration } = parameters;
    
    if (!title) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        "I need an event title to add to your calendar. What would you like to schedule?"
      );
    }

    const eventDate = date || this._getTodayDate();
    const eventTime = time || '09:00';
    const eventDuration = duration || 1;

    // Add to schedule
    if (this.context.setSchedule) {
      const eventEntry = `${title}${time ? ` (${time})` : ''}${duration ? ` - ${duration}hr` : ''}`;
      this.context.setSchedule(prevSchedule => ({
        ...prevSchedule,
        [eventDate]: [...(prevSchedule[eventDate] || []), eventEntry]
      }));
    }

    // Open calendar to show the new event
    if (this.context.onOpenCalendar) {
      setTimeout(() => this.context.onOpenCalendar(), 800);
    }

    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.DATA_MODIFIED,
      `📅 **Event Added Successfully!**\n\n**"${title}"** has been scheduled for:\n• **Date:** ${eventDate}\n• **Time:** ${eventTime}\n• **Duration:** ${eventDuration} hour(s)\n\n*Opening calendar view to show your new event.*`,
      { 
        eventAdded: { title, date: eventDate, time: eventTime, duration: eventDuration },
        actions: ['event_added', 'schedule_updated', 'calendar_opened']
      }
    );
  }

  /**
   * Execute FIND_PEERS command - Opens peer finder
   * @private
   */
  async _executeFindPeers(parameters) {
    const { course, topic } = parameters;
    
    if (this.context.onOpenPeers) {
      setTimeout(() => this.context.onOpenPeers(), 300);
    }

    const searchContext = course || topic || 'your courses';
    
    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.VIEW_CHANGED,
      `👥 **Opening Peer Finder**\n\nSearching for study partners ${course ? `in ${course}` : topic ? `for ${topic}` : 'in your courses'}.\n\n*Peer discovery interface is now active.*`,
      { 
        viewOpened: 'peers',
        searchContext,
        actions: ['view_opened', 'peer_finder_opened']
      }
    );
  }

  /**
   * Execute VIEW_PROGRESS command - Opens progress dashboard
   * @private
   */
  async _executeViewProgress(parameters) {
    if (this.context.onOpenProgress) {
      setTimeout(() => this.context.onOpenProgress(), 300);
    }

    const progressSummary = this._generateProgressSummary();
    
    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.VIEW_CHANGED,
      `📊 **Opening Progress Dashboard**\n\n${progressSummary}\n\n*Analytics and progress tracking view is now active.*`,
      { 
        viewOpened: 'progress',
        actions: ['view_opened', 'progress_displayed']
      }
    );
  }

  /**
   * Execute UPDATE_TASK command
   * @private
   */
  async _executeUpdateTask(parameters) {
    const { taskName, priority, dueDate } = parameters;
    
    if (!taskName) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        "Please specify which task you'd like to update."
      );
    }

    const targetTask = this.context.tasks?.find(task => 
      task.name.toLowerCase().includes(taskName.toLowerCase())
    );

    if (!targetTask) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        `I couldn't find a task matching "${taskName}".`
      );
    }

    // Update task properties
    const updates = {};
    if (priority) updates.priority = priority;
    if (dueDate) updates.dueDate = dueDate;

    if (this.context.setTasks) {
      this.context.setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === targetTask.id ? { ...task, ...updates } : task
        )
      );
    }

    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.DATA_MODIFIED,
      `✏️ **Task Updated!**\n\n**"${targetTask.name}"** has been updated successfully.`,
      { 
        taskUpdated: { ...targetTask, ...updates },
        actions: ['task_updated']
      }
    );
  }

  /**
   * Execute GET_TASKS command
   * @private
   */
  async _executeGetTasks(parameters) {
    const tasks = this.context.tasks || [];
    
    if (tasks.length === 0) {
      return this._createResult(
        ACTION_RESULTS.SUCCESS,
        ACTION_TYPES.NOTIFICATION_SENT,
        "📝 **No tasks found**\n\nYou don't have any tasks yet. Would you like to create one?"
      );
    }

    const taskList = tasks.slice(0, 5).map((task, index) => 
      `${index + 1}. **${task.name}** ${task.completed ? '✅' : ''}\n   Due: ${task.dueDate || 'No due date'} • Priority: ${task.priority || 'medium'}`
    ).join('\n\n');

    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.NOTIFICATION_SENT,
      `📝 **Your Tasks** (${tasks.length} total)\n\n${taskList}${tasks.length > 5 ? '\n\n*...and more in your dashboard*' : ''}`,
      { 
        tasksRetrieved: tasks.slice(0, 5),
        actions: ['tasks_listed']
      }
    );
  }

  /**
   * Execute SET_PRIORITY command
   * @private
   */
  async _executeSetPriority(parameters) {
    const { taskName, priority } = parameters;
    
    if (!taskName || !priority) {
      return this._createResult(
        ACTION_RESULTS.ERROR,
        ACTION_TYPES.NOTIFICATION_SENT,
        "Please specify both the task name and priority level."
      );
    }

    return this._executeUpdateTask({ taskName, priority });
  }

  /**
   * Execute GREETING command
   * @private
   */
  _executeGreeting() {
    const greetings = [
      "Hello! I'm ready to help you manage your academic tasks and schedule. What would you like to work on?",
      "Hi there! How can I assist you with your studies today?",
      "Hey! I'm here to help you stay organized and productive. What do you need?",
      "Good to see you! Ready to tackle some tasks or plan your schedule?"
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.NOTIFICATION_SENT,
      randomGreeting,
      { actions: ['greeting_sent'] }
    );
  }

  /**
   * Execute HELP command
   * @private
   */
  _executeHelp() {
    const helpMessage = `🤖 **EduAI Assistant Help**

I can help you with:

**Task Management:**
• "Add my calculus homework due tomorrow"
• "Mark discrete math homework as complete"
• "How long will my programming assignment take?"

**Schedule & Calendar:**
• "Show my schedule" or "Bring me my calendar"
• "Schedule a study session for 2 hours tomorrow"
• "What's coming up this week?"

**Priorities & Deadlines:**
• "What should I focus on first?"
• "Show my urgent tasks"
• "What deadlines are approaching?"

**Study Groups & Peers:**
• "Find study partners for physics"
• "Connect me with classmates in CMPSC 221"

**Progress Tracking:**
• "How am I doing this week?"
• "Show my completion stats"

Just use natural language! I'll understand and help you manage your academic life.`;

    return this._createResult(
      ACTION_RESULTS.SUCCESS,
      ACTION_TYPES.NOTIFICATION_SENT,
      helpMessage,
      { actions: ['help_provided'] }
    );
  }

  /**
   * Execute UNKNOWN command - Fallback to existing Gemini + FAISS backend
   * @private
   */
  async _executeUnknown(intent, parameters, originalMessage) {
    try {
      // Send to your existing backend with Canvas RAG
      const llmResponse = await this._sendToExistingBackend(originalMessage);
      
      return this._createResult(
        ACTION_RESULTS.SUCCESS,
        ACTION_TYPES.NOTIFICATION_SENT,
        llmResponse,
        { 
          source: 'gemini_canvas_rag', 
          unknownIntent: intent, 
          parameters,
          contextUsed: true
        }
      );
      
    } catch (error) {
      console.error('Backend RAG fallback error:', error);
      
      // Ultimate fallback if backend is unavailable
      return this._createResult(
        ACTION_RESULTS.PARTIAL,
        ACTION_TYPES.NOTIFICATION_SENT,
        "I'm having trouble connecting to the knowledge base right now. Here are some commands I can definitely help with:\n\n• **'Show my schedule'** - View your calendar\n• **'Add homework due Friday'** - Create a new task\n• **'What should I do first?'** - See priorities\n• **'How long will this take?'** - Estimate task time\n• **'Find study partners'** - Connect with peers\n\nTry rephrasing your request or use one of these examples.",
        { 
          unknownIntent: intent, 
          parameters, 
          backendUnavailable: true,
          error: error.message
        }
      );
    }
  }

  /**
   * Helper: Create standardized result object
   * @private
   */
  _createResult(status, actionType, message, data = {}) {
    return {
      status,
      actionType,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper: Generate schedule summary
   * @private
   */
  _generateScheduleSummary(timeframe) {
    const schedule = this.context.schedule || {};
    const today = new Date().toISOString().split('T')[0];
    
    const upcomingItems = Object.entries(schedule)
      .filter(([date]) => date >= today)
      .slice(0, 3)
      .map(([date, items]) => `• ${date}: ${items.length} item(s)`)
      .join('\n');

    return upcomingItems || 'No upcoming scheduled items.';
  }

  /**
   * Helper: Generate priority summary
   * @private
   */
  _generatePrioritySummary() {
    const tasks = this.context.tasks || [];
    const highPriority = tasks.filter(t => !t.completed && t.priority === 'high');
    
    if (highPriority.length === 0) {
      return 'No high-priority tasks at the moment.';
    }
    
    return `${highPriority.length} high-priority task(s) need attention.`;
  }

  /**
   * Helper: Generate deadline summary
   * @private
   */
  _generateDeadlineSummary() {
    const tasks = this.context.tasks || [];
    const today = new Date().toISOString().split('T')[0];
    const upcoming = tasks.filter(t => !t.completed && t.dueDate && t.dueDate >= today);
    
    return upcoming.length > 0 
      ? `${upcoming.length} upcoming deadline(s) to track.`
      : 'No upcoming deadlines found.';
  }

  /**
   * Helper: Generate progress summary
   * @private
   */
  _generateProgressSummary() {
    const tasks = this.context.tasks || [];
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    
    if (total === 0) return 'No tasks to analyze yet.';
    
    const percentage = Math.round((completed / total) * 100);
    return `${completed}/${total} tasks completed (${percentage}%)`;
  }

  /**
   * Helper: Get default due date (today + 7 days)
   * @private
   */
  _getDefaultDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Get today's date
   * @private
   */
  _getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Send message to existing Gemini + FAISS backend
   * @private
   */
  async _sendToExistingBackend(userMessage) {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: this._getSessionId()
        }),
        timeout: 10000 // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.response || "I processed your request using your Canvas data, but couldn't generate a specific response.";
      
    } catch (error) {
      console.error('Backend API call failed:', error);
      throw error; // Re-throw to trigger fallback in _executeUnknown
    }
  }

  /**
   * Get or generate session ID for backend continuity
   * @private  
   */
  _getSessionId() {
    // Try to get existing session ID from various sources
    if (this.sessionId) return this.sessionId;
    
    // Generate consistent session ID based on current context
    const contextHash = this._generateContextHash();
    this.sessionId = `session-${Date.now()}-${contextHash}`;
    
    return this.sessionId;
  }

  /**
   * Generate a simple context hash for session consistency
   * @private
   */
  _generateContextHash() {
    const contextData = {
      taskCount: this.context.tasks?.length || 0,
      scheduleKeys: Object.keys(this.context.schedule || {}).length,
      selectedTaskId: this.context.selectedTask?.id || null
    };
    
    // Simple hash of context data
    return Math.abs(JSON.stringify(contextData).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0)).toString(36).substring(0, 8);
  }
}

export default ActionEngine;