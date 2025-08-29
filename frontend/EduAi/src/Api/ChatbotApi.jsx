/**
 * Complete Enhanced Chatbot with Integrated LLM Command Processing
 * Uses intelligent interpretation instead of keyword matching
 * @author EduAI Development Team
 */

import { useState, useEffect, useRef } from "react";
import { Button, notification, Input, Spin, Tag } from "antd";
import { SendOutlined, ClearOutlined, ToolOutlined, CheckCircleOutlined, ExclamationCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

/**
 * System prompt for LLM command interpretation
 */
const buildCommandInterpretationPrompt = () => {
  const currentDate = new Date().toLocaleDateString();
  
  return `You are an intelligent academic assistant command interpreter. Your job is to analyze user messages and return structured JSON responses.

CURRENT CONTEXT:
- Current date: ${currentDate}


- Available modal tools: calendar, deadlines, peers, estimator, progress, schedule, priorities, profile, goals

ANALYSIS RULES:
1. Determine the PRIMARY INTENT: QUERY (show/tell me), SCHEDULE (add/create), UPDATE (modify), or OPEN (access tool)
2. Extract available parameters from the user's message
3. Identify missing REQUIRED parameters for the action
4. If missing parameters, create specific follow-up questions
5. Generate appropriate response text

INTENT DEFINITIONS:
- QUERY: User wants to see/know information (what is, show me, tell me, when is, what's my)
- SCHEDULE: User wants to add something to calendar (schedule, add, book, plan)
- UPDATE: User wants to modify existing items (change, move, update, reschedule)
- OPEN: User wants to access a tool (open, show me the, go to)

REQUIRED PARAMETERS:
- For SCHEDULE events: title, date, start_time (duration can calculate end_time)
- For QUERY schedule: date/timeframe (default to "today" if not specified)
- For OPEN tools: tool_name

RESPONSE FORMAT (JSON only - no other text):
{
  "intent": "QUERY|SCHEDULE|UPDATE|OPEN",
  "action": "show_schedule|create_event|open_tool|show_deadlines|show_peers",
  "confidence": 0.95,
  "params": {
    "title": "extracted value",
    "date": "tomorrow|today|2025-08-30",
    "start_time": "14:00",
    "duration": 3,
    "type": "study|meeting|assignment"
  },
  "missing": ["required_param1", "required_param2"],
  "modal_target": "calendar|deadlines|peers|estimator|progress|schedule|priorities|profile|goals|null",
  "response": "Natural language response to user",
  "questions": ["What subject is this for?", "What time?"],
  "ready_to_execute": true
}

EXAMPLES:

User: "what is my schedule tomorrow"
{
  "intent": "QUERY",
  "action": "show_schedule", 
  "confidence": 0.95,
  "params": {"date": "tomorrow"},
  "missing": [],
  "modal_target": "calendar",
  "response": "Let me show you your schedule for tomorrow.",
  "questions": [],
  "ready_to_execute": true
}

User: "schedule a 6 hr session"
{
  "intent": "SCHEDULE",
  "action": "create_event",
  "confidence": 0.85,
  "params": {"duration": 6},
  "missing": ["title", "date", "start_time"],
  "modal_target": "calendar", 
  "response": "I'd be happy to schedule a 6-hour session! I need a few more details:",
  "questions": [
    "What subject or activity is this for?",
    "What date would you prefer?", 
    "What time should it start?"
  ],
  "ready_to_execute": false
}

User: "open task estimator"
{
  "intent": "OPEN",
  "action": "open_tool",
  "confidence": 1.0,
  "params": {"tool": "estimator"},
  "missing": [],
  "modal_target": "estimator",
  "response": "Opening the Task Estimator tool.",
  "questions": [],
  "ready_to_execute": true
}

Now analyze this user message and return ONLY the JSON response:`;
};

/**
 * Custom Markdown components for enhanced styling
 */
const MarkdownComponents = {
  code(props) {
    const { children, className, node, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        {...rest}
        PreTag="div"
        children={String(children).replace(/\n$/, "")}
        language={match[1]}
        style={vscDarkPlus}
        className="text-sm rounded-lg"
      />
    ) : (
      <code {...rest} className="bg-gray-700 text-purple-300 px-2 py-1 rounded text-sm">
        {children}
      </code>
    );
  }
};

/**
 * Enhanced Chatbot Component with LLM Command Processing
 */
const Chatbot = ({
  tasks = [],
  setTasks,
  schedule = {},
  setSchedule,
  peers = [],
  setPeers,
  studyGroups = [],
  setStudyGroups,
  onTaskSelect,
  onOpenModal,
  modalIntegration = null,
  lastAction = null,
  onChatModalCommand,
  compact = false,
  modalData = {},
  getModalContext
}) => {
  // Chat state management
  const [conversation, setConversation] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSession] = useState(() => `session-${Date.now()}`);
  
  // UI references
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Command processing state
  const [awaitingFollowUp, setAwaitingFollowUp] = useState(false);
  const [pendingCommand, setPendingCommand] = useState(null);
  const [conversationContext, setConversationContext] = useState(new Map());

  /**
   * Auto-scroll chat to bottom on new messages
   */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  /**
   * Handle modal integration updates
   */
  useEffect(() => {
    if (modalIntegration && !awaitingFollowUp) {
      const connectionMsg = {
        type: 'system',
        content: `✅ Connected to ${modalIntegration}. I can now understand natural language commands about this tool.`,
        timestamp: Date.now(),
        id: Date.now()
      };
      setConversation(prev => [...prev, connectionMsg]);
    }
  }, [modalIntegration]);

  /**
   * Build current context for LLM processing
   */
  const buildCurrentContext = () => {
    let contextInfo = "";
    
    if (modalIntegration) {
      contextInfo += `Currently viewing: ${modalIntegration}\n`;
    }
    
    if (schedule && Object.keys(schedule).length > 0) {
      contextInfo += `User has scheduled events on: ${Object.keys(schedule).join(', ')}\n`;
    }
    
    const modalContext = getModalContext ? getModalContext() : "";
    if (modalContext) {
      contextInfo += `Modal content:\n${modalContext}\n`;
    }
    
    return contextInfo;
  };

  /**
   * Call LLM for command interpretation
   */
  const callLLMForInterpretation = async (prompt) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          session_id: `command_${currentSession}`,
          temperature: 0.3,
          max_tokens: 500
        }),
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("LLM API error:", error);
      // Return fallback response
      return `{
        "intent": "QUERY",
        "action": "fallback",
        "confidence": 0.1,
        "params": {},
        "missing": [],
        "modal_target": null,
        "response": "I had trouble understanding that command. Could you try rephrasing it?",
        "questions": [],
        "ready_to_execute": false
      }`;
    }
  };

  /**
   * Parse and validate LLM response
   */
  const parseAndValidateResponse = (llmResponse) => {
    try {
      // Clean response - remove any markdown or extra text
      let cleanedResponse = llmResponse.trim();
      
      // Find JSON object in response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate and set defaults
      return {
        intent: parsed.intent || "QUERY",
        action: parsed.action || "fallback",
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        params: parsed.params || {},
        missing: parsed.missing || [],
        modal_target: parsed.modal_target,
        response: parsed.response || "Command processed.",
        questions: parsed.questions || [],
        ready_to_execute: parsed.ready_to_execute !== false
      };
      
    } catch (error) {
      console.error("Error parsing LLM response:", error, "Raw:", llmResponse);
      
      return {
        intent: "QUERY",
        action: "fallback",
        confidence: 0.1,
        params: {},
        missing: [],
        modal_target: null,
        response: "I had trouble understanding that command. Could you try rephrasing it?",
        questions: [],
        ready_to_execute: false
      };
    }
  };

  /**
   * Process command through LLM
   */
  const processCommand = async (userMessage) => {
    const context = buildCurrentContext();
    const fullPrompt = `${buildCommandInterpretationPrompt()}

CURRENT CONTEXT:
${context}

USER MESSAGE: "${userMessage}"

JSON RESPONSE:`;

    console.log("🧠 Sending to LLM for interpretation:", userMessage);
    
    const llmResponse = await callLLMForInterpretation(fullPrompt);
    return parseAndValidateResponse(llmResponse);
  };

  /**
   * Process follow-up response
   */
  const processFollowUp = async (followUpMessage) => {
    const context = conversationContext.get(currentSession);
    if (!context) {
      return await processCommand(followUpMessage);
    }

    const followUpPrompt = `${buildCommandInterpretationPrompt()}

PREVIOUS CONVERSATION CONTEXT:
- Original message: "${context.originalMessage}"
- Missing parameters: ${JSON.stringify(context.partialCommand.missing)}
- Questions asked: ${JSON.stringify(context.partialCommand.questions)}

USER'S FOLLOW-UP RESPONSE: "${followUpMessage}"

Update the command with new information. Extract any missing parameters from the follow-up response and return updated JSON:

JSON RESPONSE:`;

    const llmResponse = await callLLMForInterpretation(followUpPrompt);
    return parseAndValidateResponse(llmResponse);
  };

  /**
   * Execute a ready command
   */
  const executeCommand = async (commandData) => {
    console.log("🎯 Executing command:", commandData);
    
    try {
      switch (commandData.action) {
        case "show_schedule":
          return await handleShowSchedule(commandData);
          
        case "create_event":
          return await handleCreateEvent(commandData);
          
        case "open_tool":
          return await handleOpenTool(commandData);
          
        case "show_deadlines":
          return await handleShowDeadlines(commandData);
          
        case "show_peers":
          return await handleShowPeers(commandData);
          
        default:
          return `Command "${commandData.action}" processed.`;
      }
    } catch (error) {
      console.error("Error executing command:", error);
      return `There was an error executing that command: ${error.message}`;
    }
  };

  /**
   * Handle show schedule command
   */
  const handleShowSchedule = async (commandData) => {
    const { params } = commandData;
    
    // Open calendar if not already open
    if (!modalIntegration || modalIntegration !== "calendar") {
      onOpenModal?.("calendar", params);
    }
    
    // Generate schedule response
    let scheduleText = "";
    
    if (params.date === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const tomorrowEvents = schedule[tomorrowStr] || [];
      
      scheduleText = "**Tomorrow's Schedule:**\n\n";
      if (tomorrowEvents.length > 0) {
        tomorrowEvents.forEach(event => {
          scheduleText += `• **${event.title}** (${event.start_time}-${event.end_time}) - ${event.priority} priority\n`;
        });
      } else {
        scheduleText += "No events scheduled for tomorrow. You have full availability!";
      }
    } else if (params.date === "today") {
      const today = new Date().toISOString().split('T')[0];
      const todayEvents = schedule[today] || [];
      
      scheduleText = "**Today's Schedule:**\n\n";
      if (todayEvents.length > 0) {
        todayEvents.forEach(event => {
          scheduleText += `• **${event.title}** (${event.start_time}-${event.end_time}) - ${event.priority} priority\n`;
        });
      } else {
        scheduleText += "No events scheduled for today.";
      }
    } else {
      scheduleText = "Opening calendar to show your schedule...";
    }
    
    return scheduleText;
  };

  /**
   * Handle create event command
   */
  const handleCreateEvent = async (commandData) => {
    const { params } = commandData;
    
    // Open calendar if not already open
    if (!modalIntegration || modalIntegration !== "calendar") {
      onOpenModal?.("calendar", params);
    }
    
    // Determine target date
    let targetDate;
    if (params.date === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = tomorrow.toISOString().split('T')[0];
    } else if (params.date === "today") {
      targetDate = new Date().toISOString().split('T')[0];
    } else {
      targetDate = params.date || new Date().toISOString().split('T')[0];
    }
    
    // Calculate end time
    let endTime = params.end_time;
    if (!endTime && params.start_time && params.duration) {
      const startHour = parseInt(params.start_time.split(':')[0]);
      const endHour = startHour + parseInt(params.duration);
      endTime = `${endHour.toString().padStart(2, '0')}:00`;
    } else if (!endTime) {
      endTime = "17:00"; // Default 2-hour session
    }
    
    const newEvent = {
      title: params.title || "Study Session",
      start_time: params.start_time || "15:00",
      end_time: endTime,
      type: params.type || "study",
      priority: params.priority || "medium"
    };
    
    // Update schedule
    const updatedSchedule = {
      ...schedule,
      [targetDate]: [...(schedule[targetDate] || []), newEvent]
    };
    setSchedule(updatedSchedule);
    
    console.log("📅 Schedule updated:", updatedSchedule);
    
    // Show success notification
    notification.success({
      message: 'Event Scheduled',
      description: `"${newEvent.title}" added to your calendar`,
      placement: 'topRight',
      duration: 3
    });
    
    return `✅ **Event Scheduled Successfully!**\n\n**${newEvent.title}**\n• Date: ${targetDate}\n• Time: ${newEvent.start_time} - ${newEvent.end_time}\n• Priority: ${newEvent.priority}`;
  };

  /**
   * Handle open tool command
   */
  const handleOpenTool = async (commandData) => {
    const { params } = commandData;
    let toolName = params.tool || params.modal || commandData.modal_target;
    
    // Map tool name variations to actual modal keys
    const toolMapping = {
      'task estimator': 'estimator',
      'task-estimator': 'estimator',
      'estimator': 'estimator',
      'calendar': 'calendar',
      'deadlines': 'deadlines',
      'deadline': 'deadlines',
      'upcoming deadlines': 'deadlines',
      'peers': 'peers',
      'study peers': 'peers',
      'study partners': 'peers',
      'progress': 'progress',
      'progress tracker': 'progress',
      'tracker': 'progress',
      'planner': 'schedule',
      'weekly planner': 'schedule',
      'schedule': 'schedule',
      'scheduler': 'schedule',
      'priorities': 'priorities',
      'priority': 'priorities',
      'priority manager': 'priorities',
      'priority settings': 'priorities',
      'profile': 'profile',
      'profile settings': 'profile',
      'settings': 'profile',
      'goals': 'goals',
      'academic goals': 'goals',
      'goal tracker': 'goals'
    };
    
    // Normalize the tool name
    if (toolName && toolMapping[toolName.toLowerCase()]) {
      toolName = toolMapping[toolName.toLowerCase()];
    }
    
    if (toolName) {
      onOpenModal?.(toolName, {});
      return `Opening ${toolName}...`;
    }
    
    return "Tool opened successfully.";
  };

  /**
   * Handle show deadlines command
   */
  const handleShowDeadlines = async (commandData) => {
    if (!modalIntegration || modalIntegration !== "deadlines") {
      onOpenModal?.("deadlines", {});
    }
    
    const upcomingTasks = tasks
      .filter(task => !task.completed)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
      
    let response = "**Upcoming Deadlines:**\n\n";
    
    if (upcomingTasks.length === 0) {
      response += "Great news! You don't have any upcoming deadlines.";
    } else {
      upcomingTasks.forEach(task => {
        const daysUntil = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        const urgency = daysUntil <= 2 ? " 🚨" : daysUntil <= 7 ? " ⚠️" : "";
        response += `• **${task.name}** - Due ${task.dueDate} (${daysUntil} days)${urgency}\n`;
      });
    }
    
    return response;
  };

  /**
   * Handle show peers command
   */
  const handleShowPeers = async (commandData) => {
    if (!modalIntegration || modalIntegration !== "peers") {
      onOpenModal?.("peers", {});
    }
    
    const onlinePeers = peers.filter(p => p.isOnline);
    let response = "**Study Peers:**\n\n";
    
    if (onlinePeers.length === 0) {
      response += "No study peers are currently online.";
    } else {
      response += "**Currently Online:**\n";
      onlinePeers.forEach(peer => {
        response += `• **${peer.name}** (${peer.course}) - ${peer.matchPercentage}% match\n`;
      });
    }
    
    return response;
  };

  /**
   * Main message processing with LLM command interpretation
   */
  const handleSendMessage = async () => {
    const messageToSend = inputMessage.trim();
    if (!messageToSend || loading) return;

    // Add user message to conversation
    const userMessage = { 
      type: 'user', 
      content: messageToSend,
      timestamp: Date.now(),
      id: Date.now() 
    };
    setConversation(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      let commandResponse;
      
      // Check if this is a follow-up to previous command
      if (awaitingFollowUp && conversationContext.has(currentSession)) {
        commandResponse = await processFollowUp(messageToSend);
      } else {
        // Process as new command
        commandResponse = await processCommand(messageToSend);
      }
      
      console.log("🧠 LLM Command Response:", commandResponse);
      
      let botResponse = "";
      let responseType = "normal";
      
      if (commandResponse.ready_to_execute) {
        // Command is ready to execute
        setAwaitingFollowUp(false);
        setPendingCommand(null);
        conversationContext.delete(currentSession);
        
        // Execute the command
        const executionResult = await executeCommand(commandResponse);
        
        botResponse = executionResult;
        responseType = commandResponse.action.includes("show") ? "query_result" : "command_executed";
        
      } else {
        // Command needs more information
        setAwaitingFollowUp(true);
        setPendingCommand(commandResponse);
        
        // Store context for follow-up
        conversationContext.set(currentSession, {
          originalMessage: messageToSend,
          partialCommand: commandResponse,
          timestamp: Date.now()
        });
        
        botResponse = commandResponse.response;
        
        // Add follow-up questions if provided
        if (commandResponse.questions && commandResponse.questions.length > 0) {
          botResponse += "\n\n";
          commandResponse.questions.forEach((question, index) => {
            botResponse += `${index + 1}. ${question}\n`;
          });
        }
        
        responseType = "follow_up_needed";
      }

      // Add bot response to conversation
      const botMessage = { 
        type: 'bot', 
        content: botResponse,
        responseType,
        commandData: commandResponse,
        modalContext: modalIntegration,
        timestamp: Date.now(),
        id: Date.now() + 1
      };
      
      setConversation(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Command processing error:', error);
      
      // Clear any pending state
      setAwaitingFollowUp(false);
      setPendingCommand(null);
      conversationContext.delete(currentSession);
      
      const errorMessage = {
        type: 'bot',
        content: `I encountered an issue processing: "${messageToSend}"\n\nPlease try rephrasing your request. I can help with:\n• Showing your schedule ("what's my schedule tomorrow")\n• Scheduling events ("schedule a math study session for 2 hours tomorrow at 3pm")\n• Opening tools ("open calendar", "show deadlines", "task estimator")`,
        responseType: 'error',
        timestamp: Date.now(),
        id: Date.now() + 1
      };
      
      setConversation(prev => [...prev, errorMessage]);
      
      notification.error({
        message: 'Processing Error',
        description: 'There was an issue understanding your request.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
      
      // Refocus input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  /**
   * Clear conversation history and reset state
   */
  const handleClearAll = () => {
    setConversation([]);
    setAwaitingFollowUp(false);
    setPendingCommand(null);
    conversationContext.clear();
    
    notification.info({
      message: 'Chat Cleared',
      description: 'Conversation history has been reset.',
      placement: 'topRight',
    });
  };

  /**
   * Handle input key press events
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Get message icon and styling based on response type
   */
  const getMessageIcon = (msg) => {
    switch (msg.responseType) {
      case 'command_executed':
        return <CheckCircleOutlined className="text-green-400" />;
      case 'query_result':
        return <ToolOutlined className="text-blue-400" />;
      case 'follow_up_needed':
        return <QuestionCircleOutlined className="text-orange-400" />;
      case 'error':
        return <ExclamationCircleOutlined className="text-red-400" />;
      default:
        return null;
    }
  };

  /**
   * Get response confidence indicator
   */
  const getConfidenceIndicator = (commandData) => {
    if (!commandData || !commandData.confidence) return null;
    
    const confidence = commandData.confidence;
    const color = confidence > 0.8 ? 'green' : confidence > 0.6 ? 'orange' : 'red';
    
    return (
      <Tag color={color} size="small" className="ml-2">
        {Math.round(confidence * 100)}% confident
      </Tag>
    );
  };

  return (
    <div className={`chatbot-container flex flex-col h-full max-h-full bg-transparent overflow-hidden ${compact ? 'text-sm' : ''}`}>
      {/* Chat Messages - Top Section */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent max-h-[30vh] min-h-0"
      >
        {conversation.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-xl mb-3 font-semibold text-white">Enhanced EduAI Assistant</div>
              <div className="text-sm mb-6 max-w-md mx-auto">
                {modalIntegration 
                  ? `Connected to ${modalIntegration}. I understand natural language commands and ask clarifying questions.`
                  : "I understand natural language commands and ask clarifying questions when needed."
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto text-xs text-gray-500">
              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <div className="font-medium text-purple-400 mb-2">📅 Schedule</div>
                <div>"What's my schedule tomorrow?"</div>
              </div>
              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <div className="font-medium text-blue-400 mb-2">📚 Study</div>
                <div>"Schedule a 3-hour CMPSC study session"</div>
              </div>
              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <div className="font-medium text-red-400 mb-2">⏰ Deadlines</div>
                <div>"Show me my deadlines"</div>
              </div>
              <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <div className="font-medium text-green-400 mb-2">👥 Peers</div>
                <div>"Open study peers"</div>
              </div>
            </div>
          </div>
        )}
        
        {conversation.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-md ${
                msg.type === 'user'
                  ? 'bg-purple-600 text-white ml-2'
                  : msg.type === 'system'
                  ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30'
                  : 'bg-gray-700/50 text-gray-100 mr-2'
              }`}
            >
              {msg.type === 'bot' && (
                <div className="flex items-center space-x-1 mb-1">
                  {getMessageIcon(msg)}
                  <span className="text-xs text-gray-400">
                    EduAI Assistant
                    {msg.modalContext && ` • ${msg.modalContext}`}
                  </span>
                  {getConfidenceIndicator(msg.commandData)}
                </div>
              )}
              
              <div className="prose prose-invert prose-xs max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={MarkdownComponents}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              
              <div className="text-xs text-gray-400 mt-2 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700/50 p-2 rounded-md mr-2">
              <Spin size="small" />
              <span className="ml-1 text-gray-300 text-sm">Processing command...</span>
            </div>
          </div>
        )}
      </div>

      {/* Centered Input Area */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="w-full max-w-2xl">
          {awaitingFollowUp && (
            <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-orange-200 text-sm">
                <QuestionCircleOutlined />
                <span>I need more information to complete your command. Please answer the questions above.</span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-4 bg-gray-800/60 backdrop-blur-md p-4 rounded-xl border border-gray-700/50 shadow-xl">
            <Input.TextArea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                awaitingFollowUp 
                  ? "Please provide the requested information..." 
                  : modalIntegration 
                  ? `Ask me about ${modalIntegration} or give natural language commands...` 
                  : "Try: 'What's my schedule tomorrow?' or 'Schedule a 2-hour math study session'..."
              }
              autoSize={{ minRows: 2, maxRows: 4 }}
              className="flex-1 bg-transparent border-none resize-none text-base"
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                fontSize: '16px'
              }}
            />
            <div className="flex flex-col space-y-2">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                loading={loading}
                size="large"
                className="bg-purple-600 border-purple-500 hover:bg-purple-500 h-10 w-10"
              />
              {conversation.length > 0 && (
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClearAll}
                  size="small"
                  className="text-gray-400 border-gray-600 hover:border-gray-500"
                />
              )}
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            {awaitingFollowUp ? (
              <span className="text-orange-400">Please answer the questions above to complete your command.</span>
            ) : (
              <div className="space-y-1">
                <div className="text-purple-400 font-medium">Enhanced Natural Language Processing</div>
                <div className="text-xs">I ask clarifying questions when needed for precise assistance!</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;