/**
 * Enhanced Command Parser for EduAI
 * Intelligently parses natural language commands with improved flexibility
 * @author EduAI Development Team
 */

/**
 * Command intent types supported by the system
 */
export const INTENT_TYPES = {
  // Task Management
  CREATE_TASK: 'create_task',
  UPDATE_TASK: 'update_task',
  COMPLETE_TASK: 'complete_task',
  DELETE_TASK: 'delete_task',
  ESTIMATE_TIME: 'estimate_time',
  SET_PRIORITY: 'set_priority',
  
  // Calendar & Scheduling
  ADD_EVENT: 'add_event',
  VIEW_SCHEDULE: 'view_schedule',
  RESCHEDULE: 'reschedule',
  SET_REMINDER: 'set_reminder',
  
  // Progress & Analytics
  VIEW_PROGRESS: 'view_progress',
  VIEW_PRIORITIES: 'view_priorities',
  VIEW_DEADLINES: 'view_deadlines',
  TRACK_GOALS: 'track_goals',
  
  // Social & Study Groups
  FIND_PEERS: 'find_peers',
  JOIN_GROUP: 'join_group',
  CREATE_GROUP: 'create_group',
  
  // Information Retrieval
  GET_TASKS: 'get_tasks',
  GET_CALENDAR: 'get_calendar',
  SEARCH: 'search',
  
  // General
  GREETING: 'greeting',
  HELP: 'help',
  UNKNOWN: 'unknown'
};

/**
 * Priority levels for tasks
 */
export const PRIORITY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium', 
  LOW: 'low'
};

/**
 * Enhanced intent patterns with flexible keyword matching
 * Each pattern includes primary keywords and synonyms for better matching
 */
const INTENT_PATTERNS = {
  [INTENT_TYPES.CREATE_TASK]: {
    keywords: [
      'create task', 'add task', 'new task', 'make task',
      'add assignment', 'create assignment', 'new assignment',
      'add homework', 'create homework', 'remind me to',
      'i need to', 'i have to', 'schedule task', 'task',
      'assignment', 'homework', 'project', 'due'
    ],
    synonyms: ['make', 'build', 'set up', 'plan'],
    params: ['title', 'dueDate', 'priority', 'course', 'estimatedTime']
  },
  
  [INTENT_TYPES.ESTIMATE_TIME]: {
    keywords: [
      'how long will', 'estimate time', 'time needed', 'duration',
      'how much time', 'time estimate', 'how long does', 'time required',
      'take me', 'time to complete', 'estimate', 'long', 'time'
    ],
    synonyms: ['calculate', 'figure out', 'determine'],
    params: ['taskName', 'difficulty', 'focusLevel']
  },
  
  [INTENT_TYPES.VIEW_SCHEDULE]: {
    keywords: [
      'show schedule', 'my schedule', 'view schedule', 'schedule',
      'bring me my schedule', 'get my schedule', 'display schedule',
      'calendar view', 'show calendar', 'my calendar', 'calendar',
      'weekly plan', 'daily plan', 'what do i have', 'what\'s coming up',
      'what\'s scheduled', 'upcoming', 'planned', 'agenda'
    ],
    synonyms: ['display', 'present', 'reveal', 'fetch', 'pull up'],
    patterns: [
      /bring\s+(?:me\s+)?(?:my\s+)?schedule/i,
      /show\s+(?:me\s+)?(?:my\s+)?schedule/i,
      /get\s+(?:me\s+)?(?:my\s+)?schedule/i,
      /(?:my\s+)?schedule/i,
      /(?:my\s+)?calendar/i,
      /what.*scheduled/i,
      /what.*coming\s+up/i
    ],
    params: ['timeframe', 'date']
  },
  
  [INTENT_TYPES.VIEW_PRIORITIES]: {
    keywords: [
      'priorities', 'what should i do first', 'most important',
      'urgent tasks', 'high priority', 'what\'s critical',
      'priority list', 'top priorities', 'important', 'urgent',
      'critical', 'priority'
    ],
    synonyms: ['essential', 'crucial', 'vital'],
    patterns: [
      /what.*(?:should|do).*first/i,
      /most\s+important/i,
      /priorit/i,
      /urgent/i
    ],
    params: ['timeframe']
  },
  
  [INTENT_TYPES.COMPLETE_TASK]: {
    keywords: [
      'mark complete', 'mark done', 'completed task', 'finished',
      'done with', 'complete', 'mark as finished', 'task done',
      'finished', 'complete', 'done'
    ],
    synonyms: ['accomplish', 'finish', 'wrap up'],
    patterns: [
      /mark.*(?:complete|done|finished)/i,
      /(?:task|assignment|homework).*(?:done|complete|finished)/i,
      /(?:done|complete|finished).*(?:task|assignment|homework)/i
    ],
    params: ['taskName']
  },
  
  [INTENT_TYPES.ADD_EVENT]: {
    keywords: [
      'add event', 'schedule event', 'create event', 'book time',
      'schedule meeting', 'add to calendar', 'plan session',
      'study session', 'block time', 'schedule', 'meeting',
      'appointment', 'session'
    ],
    synonyms: ['arrange', 'organize', 'set up'],
    patterns: [
      /(?:add|create|schedule).*(?:event|meeting|session)/i,
      /book.*time/i,
      /plan.*session/i
    ],
    params: ['title', 'date', 'time', 'duration', 'location']
  },
  
  [INTENT_TYPES.FIND_PEERS]: {
    keywords: [
      'find peers', 'study partners', 'classmates', 'study group',
      'find students', 'study buddies', 'connect with', 'join study',
      'partners', 'peers', 'classmates', 'students', 'buddies'
    ],
    synonyms: ['locate', 'search for', 'discover'],
    patterns: [
      /find.*(?:peers|partners|students|classmates)/i,
      /study.*(?:group|partners|buddies)/i,
      /connect.*with/i
    ],
    params: ['course', 'topic', 'availability']
  },
  
  [INTENT_TYPES.VIEW_PROGRESS]: {
    keywords: [
      'my progress', 'how am i doing', 'progress report', 'stats',
      'track progress', 'completion rate', 'performance', 'analytics',
      'progress', 'stats', 'performance', 'completion'
    ],
    synonyms: ['advancement', 'development', 'achievement'],
    patterns: [
      /(?:my|show).*progress/i,
      /how.*(?:am\s+i|doing)/i,
      /progress.*report/i,
      /completion.*rate/i
    ],
    params: ['course', 'timeframe']
  }
};

/**
 * Time patterns for extracting dates and times from text
 */
const TIME_PATTERNS = {
  TODAY: /\b(today|this\s+day)\b/i,
  TOMORROW: /\b(tomorrow|next\s+day)\b/i,
  THIS_WEEK: /\b(this\s+week|by\s+week\s+end)\b/i,
  NEXT_WEEK: /\b(next\s+week)\b/i,
  MONDAY: /\b(monday|mon)\b/i,
  TUESDAY: /\b(tuesday|tue)\b/i,
  WEDNESDAY: /\b(wednesday|wed)\b/i,
  THURSDAY: /\b(thursday|thu)\b/i,
  FRIDAY: /\b(friday|fri)\b/i,
  SATURDAY: /\b(saturday|sat)\b/i,
  SUNDAY: /\b(sunday|sun)\b/i,
  DATE_SLASH: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g,
  DATE_DASH: /\b(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?\b/g,
  TIME_12H: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/gi,
  TIME_24H: /\b(\d{1,2}):(\d{2})\b/g,
  MINUTES: /\b(\d+)\s*(minutes?|mins?)\b/i,
  HOURS: /\b(\d+)\s*(hours?|hrs?)\b/i,
  DAYS: /\b(\d+)\s*(days?)\b/i
};

/**
 * Course and subject patterns
 */
const COURSE_PATTERNS = [
  /\b(CMPSC|CMPEN|MATH|PHYS|ENGL|SOC|BIOL|CHEM|ECON|PSYC)\s*\d{2,3}[A-Z]?\b/gi,
  /\b(Computer Science|Mathematics|Physics|English|Sociology|Biology|Chemistry|Economics|Psychology)\b/gi,
  /\b(Programming|Calculus|Algebra|Statistics)\b/gi
];

/**
 * Priority extraction patterns
 */
const PRIORITY_PATTERNS = {
  [PRIORITY_LEVELS.HIGH]: /\b(urgent|critical|important|high\s*priority|asap|due\s*soon)\b/i,
  [PRIORITY_LEVELS.MEDIUM]: /\b(medium\s*priority|moderate|normal)\b/i,
  [PRIORITY_LEVELS.LOW]: /\b(low\s*priority|later|whenever|not\s*urgent)\b/i
};

/**
 * Enhanced CommandParser with better natural language understanding
 */
export class CommandParser {
  /**
   * Parse a natural language command into structured intent and parameters
   * @param {string} message - The user's natural language input
   * @param {Object} context - Current application context (tasks, schedule, etc.)
   * @returns {Object} Parsed command with intent and parameters
   */
  static parse(message, context = {}) {
    if (!message || typeof message !== 'string') {
      return CommandParser._createResponse(INTENT_TYPES.UNKNOWN, {}, 'Invalid message');
    }

    const normalizedMessage = message.trim().toLowerCase();
    
    // Check for greetings first
    if (CommandParser._isGreeting(normalizedMessage)) {
      return CommandParser._createResponse(INTENT_TYPES.GREETING, {});
    }
    
    // Check for help requests
    if (CommandParser._isHelpRequest(normalizedMessage)) {
      return CommandParser._createResponse(INTENT_TYPES.HELP, {});
    }
    
    // Find the best matching intent using enhanced matching
    const matchedIntent = CommandParser._findBestIntentEnhanced(normalizedMessage);
    
    if (matchedIntent === INTENT_TYPES.UNKNOWN) {
      return CommandParser._createResponse(INTENT_TYPES.UNKNOWN, {}, 'Could not understand the command');
    }
    
    // Extract parameters based on the intent
    const parameters = CommandParser._extractParameters(normalizedMessage, matchedIntent, context);
    
    return CommandParser._createResponse(matchedIntent, parameters);
  }

  /**
   * Enhanced intent matching with pattern recognition and fuzzy matching
   * @private
   */
  static _findBestIntentEnhanced(message) {
    let bestMatch = INTENT_TYPES.UNKNOWN;
    let bestScore = 0;

    for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
      let score = 0;
      
      // Check regex patterns first (highest priority)
      if (pattern.patterns) {
        for (const regex of pattern.patterns) {
          if (regex.test(message)) {
            score += 1.0;
            break; // Found a pattern match, highest score
          }
        }
      }
      
      // If no pattern match, check keywords
      if (score === 0) {
        score = CommandParser._calculateKeywordScore(message, pattern.keywords);
        
        // Check synonyms for partial matches
        if (pattern.synonyms && score < 0.5) {
          const synonymScore = CommandParser._calculateKeywordScore(message, pattern.synonyms);
          score = Math.max(score, synonymScore * 0.8); // Synonyms get 80% weight
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = intent;
      }
    }

    // Lower threshold for better matching
    return bestScore > 0.2 ? bestMatch : INTENT_TYPES.UNKNOWN;
  }

  /**
   * Calculate keyword matching score with partial word matching
   * @private
   */
  static _calculateKeywordScore(message, keywords) {
    let totalScore = 0;
    let matchCount = 0;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      if (message.includes(keywordLower)) {
        // Exact phrase match
        totalScore += 1.0;
        matchCount++;
      } else {
        // Check for partial word matches
        const words = keywordLower.split(' ');
        let partialMatches = 0;
        
        for (const word of words) {
          if (message.includes(word) && word.length > 2) {
            partialMatches++;
          }
        }
        
        // Award partial score for partial matches
        if (partialMatches > 0) {
          totalScore += (partialMatches / words.length) * 0.6;
          matchCount++;
        }
      }
    }

    return matchCount > 0 ? totalScore / keywords.length : 0;
  }

  /**
   * Create a standardized response object
   * @private
   */
  static _createResponse(intent, parameters = {}, error = null) {
    return {
      intent,
      parameters,
      confidence: CommandParser._calculateConfidence(intent, parameters),
      timestamp: new Date().toISOString(),
      error
    };
  }

  /**
   * Check if message is a greeting
   * @private
   */
  static _isGreeting(message) {
    const greetingPatterns = /\b(hello|hi|hey|good\s*(morning|afternoon|evening)|greetings)\b/i;
    return greetingPatterns.test(message);
  }

  /**
   * Check if message is a help request
   * @private
   */
  static _isHelpRequest(message) {
    const helpPatterns = /\b(help|assistance|what\s*can\s*you\s*do|commands|how\s*to)\b/i;
    return helpPatterns.test(message);
  }

  /**
   * Extract parameters based on intent and message content
   * @private
   */
  static _extractParameters(message, intent, context) {
    const parameters = {};
    
    // Extract common parameters
    parameters.title = CommandParser._extractTitle(message, intent);
    parameters.dueDate = CommandParser._extractDate(message);
    parameters.time = CommandParser._extractTime(message);
    parameters.priority = CommandParser._extractPriority(message);
    parameters.course = CommandParser._extractCourse(message);
    parameters.duration = CommandParser._extractDuration(message);
    parameters.taskName = CommandParser._extractTaskName(message, context);
    
    // Intent-specific parameter extraction
    switch (intent) {
      case INTENT_TYPES.ESTIMATE_TIME:
        parameters.difficulty = CommandParser._extractDifficulty(message);
        parameters.focusLevel = CommandParser._extractFocusLevel(message);
        break;
        
      case INTENT_TYPES.VIEW_SCHEDULE:
      case INTENT_TYPES.VIEW_PROGRESS:
        parameters.timeframe = CommandParser._extractTimeframe(message);
        break;
        
      case INTENT_TYPES.FIND_PEERS:
        parameters.topic = CommandParser._extractTopic(message);
        parameters.availability = CommandParser._extractAvailability(message);
        break;
    }
    
    // Clean up parameters - remove null/undefined values
    Object.keys(parameters).forEach(key => {
      if (parameters[key] == null || parameters[key] === '') {
        delete parameters[key];
      }
    });
    
    return parameters;
  }

  /**
   * Extract task/event title from message
   * @private
   */
  static _extractTitle(message, intent) {
    switch (intent) {
      case INTENT_TYPES.CREATE_TASK:
        const taskPatterns = [
          /(?:create|add|new)\s+(?:task|assignment|homework)\s+(.+?)(?:\s+(?:due|for|by|on)\s|$)/i,
          /(?:remind\s+me\s+to|i\s+need\s+to|i\s+have\s+to)\s+(.+?)(?:\s+(?:due|for|by|on)\s|$)/i
        ];
        
        for (const pattern of taskPatterns) {
          const match = message.match(pattern);
          if (match) return match[1].trim();
        }
        break;
        
      case INTENT_TYPES.ADD_EVENT:
        const eventPatterns = [
          /(?:schedule|add|create)\s+(?:event|meeting|session)\s+(.+?)(?:\s+(?:on|at|for)\s|$)/i,
          /(?:book|plan)\s+(?:time\s+for\s+)?(.+?)(?:\s+(?:on|at|for)\s|$)/i
        ];
        
        for (const pattern of eventPatterns) {
          const match = message.match(pattern);
          if (match) return match[1].trim();
        }
        break;
    }
    
    return null;
  }

  // [Include all other extraction methods: _extractDate, _extractTime, etc.]
  // These methods remain the same as in the original implementation
  
  /**
   * Extract date information from message
   * @private
   */
  static _extractDate(message) {
    const today = new Date();
    
    if (TIME_PATTERNS.TODAY.test(message)) {
      return CommandParser._formatDate(today);
    }
    
    if (TIME_PATTERNS.TOMORROW.test(message)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return CommandParser._formatDate(tomorrow);
    }
    
    // Check specific days
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      const dayPattern = new RegExp(`\\b${days[i]}\\b`, 'i');
      if (dayPattern.test(message)) {
        const targetDate = CommandParser._getNextWeekday(today, i);
        return CommandParser._formatDate(targetDate);
      }
    }
    
    return null;
  }

  /**
   * Extract time information from message
   * @private
   */
  static _extractTime(message) {
    const match12h = message.match(TIME_PATTERNS.TIME_12H);
    if (match12h) {
      const [, hour, minute = '00', period] = match12h;
      let hours = parseInt(hour);
      if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
      if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minute}`;
    }
    
    const match24h = message.match(TIME_PATTERNS.TIME_24H);
    if (match24h) {
      const [, hour, minute] = match24h;
      return `${hour.padStart(2, '0')}:${minute}`;
    }
    
    return null;
  }

  /**
   * Extract priority level from message
   * @private
   */
  static _extractPriority(message) {
    for (const [priority, pattern] of Object.entries(PRIORITY_PATTERNS)) {
      if (pattern.test(message)) {
        return priority;
      }
    }
    return null;
  }

  /**
   * Extract course information from message
   * @private
   */
  static _extractCourse(message) {
    for (const pattern of COURSE_PATTERNS) {
      const match = message.match(pattern);
      if (match) {
        return match[0].toUpperCase();
      }
    }
    return null;
  }

  /**
   * Extract duration from message
   * @private
   */
  static _extractDuration(message) {
    const hourMatch = message.match(TIME_PATTERNS.HOURS);
    if (hourMatch) {
      return parseInt(hourMatch[1]);
    }
    
    const minuteMatch = message.match(TIME_PATTERNS.MINUTES);
    if (minuteMatch) {
      return parseFloat(minuteMatch[1]) / 60;
    }
    
    return null;
  }

  /**
   * Extract task name from existing tasks context
   * @private
   */
  static _extractTaskName(message, context) {
    if (!context.tasks || !Array.isArray(context.tasks)) return null;
    
    const task = context.tasks.find(t => 
      message.toLowerCase().includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(message.toLowerCase().replace(/[^\w\s]/g, '').trim())
    );
    
    return task ? task.name : null;
  }

  /**
   * Extract timeframe information
   * @private
   */
  static _extractTimeframe(message) {
    if (/\b(today|day)\b/i.test(message)) return 'day';
    if (/\b(week|weekly)\b/i.test(message)) return 'week';
    if (/\b(month|monthly)\b/i.test(message)) return 'month';
    return 'week'; // default
  }

  /**
   * Calculate confidence score for the parsed result
   * @private
   */
  static _calculateConfidence(intent, parameters) {
    if (intent === INTENT_TYPES.UNKNOWN) return 0;
    
    let score = 0.6; // Higher base score
    
    const paramCount = Object.keys(parameters).length;
    score += Math.min(paramCount * 0.08, 0.32);
    
    switch (intent) {
      case INTENT_TYPES.CREATE_TASK:
        if (parameters.title) score += 0.15;
        if (parameters.dueDate) score += 0.08;
        break;
      case INTENT_TYPES.ESTIMATE_TIME:
        if (parameters.taskName) score += 0.15;
        break;
      case INTENT_TYPES.VIEW_SCHEDULE:
        score += 0.1; // Schedule requests are usually clear
        break;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Utility functions
   */
  static _formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  static _getNextWeekday(date, targetDay) {
    const currentDay = date.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    return nextDate;
  }
}

/**
 * Utility function to validate parsed command structure
 * @param {Object} parsedCommand - The parsed command object
 * @returns {boolean} Whether the command structure is valid
 */
export function validateCommand(parsedCommand) {
  if (!parsedCommand || typeof parsedCommand !== 'object') return false;
  if (!parsedCommand.intent || !Object.values(INTENT_TYPES).includes(parsedCommand.intent)) return false;
  if (!parsedCommand.parameters || typeof parsedCommand.parameters !== 'object') return false;
  if (!parsedCommand.timestamp || !parsedCommand.confidence) return false;
  return true;
}

/**
 * Utility function to get human-readable intent description
 * @param {string} intent - The intent type
 * @returns {string} Human-readable description
 */
export function getIntentDescription(intent) {
  const descriptions = {
    [INTENT_TYPES.CREATE_TASK]: 'Create a new task or assignment',
    [INTENT_TYPES.UPDATE_TASK]: 'Update an existing task',
    [INTENT_TYPES.COMPLETE_TASK]: 'Mark a task as completed',
    [INTENT_TYPES.DELETE_TASK]: 'Delete a task',
    [INTENT_TYPES.ESTIMATE_TIME]: 'Estimate time needed for a task',
    [INTENT_TYPES.SET_PRIORITY]: 'Set task priority level',
    [INTENT_TYPES.ADD_EVENT]: 'Add an event to calendar',
    [INTENT_TYPES.VIEW_SCHEDULE]: 'View schedule or calendar',
    [INTENT_TYPES.RESCHEDULE]: 'Reschedule an event or task',
    [INTENT_TYPES.SET_REMINDER]: 'Set a reminder',
    [INTENT_TYPES.VIEW_PROGRESS]: 'View progress and analytics',
    [INTENT_TYPES.VIEW_PRIORITIES]: 'View priority tasks',
    [INTENT_TYPES.VIEW_DEADLINES]: 'View upcoming deadlines',
    [INTENT_TYPES.TRACK_GOALS]: 'Track academic goals',
    [INTENT_TYPES.FIND_PEERS]: 'Find study partners or peers',
    [INTENT_TYPES.JOIN_GROUP]: 'Join a study group',
    [INTENT_TYPES.CREATE_GROUP]: 'Create a new study group',
    [INTENT_TYPES.GET_TASKS]: 'Get list of tasks',
    [INTENT_TYPES.GET_CALENDAR]: 'Get calendar information',
    [INTENT_TYPES.SEARCH]: 'Search for information',
    [INTENT_TYPES.GREETING]: 'General greeting',
    [INTENT_TYPES.HELP]: 'Request for help or guidance',
    [INTENT_TYPES.UNKNOWN]: 'Unrecognized command'
  };
  
  return descriptions[intent] || 'Unknown intent';
}

export default CommandParser;