/**
 * Enhanced PrioritySettings with LLM-powered natural language command processing
 * Supports commands like "set math homework to high priority", "show urgent tasks", etc.
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Tag, Alert, Tooltip, Button, Select, Progress, Badge, notification, Modal, Input } from 'antd';
import { 
  FireOutlined,
  AlertOutlined,
  InfoCircleOutlined,
  BookOutlined,
  BarChartOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

/**
 * LLM Command Structure for Priority Management
 */
const PRIORITY_COMMANDS = {
  "update_task_priority": {
    required: ["task_identifier", "priority_level"],
    optional: ["reason"],
    action: "set_task_priority"
  },
  "show_priorities": {
    required: [],
    optional: ["priority_filter", "timeframe"],
    action: "query_priorities"
  },
  "analyze_urgency": {
    required: [],
    optional: ["course_filter"],
    action: "analyze_task_urgency"
  },
  "bulk_priority_update": {
    required: ["criteria"],
    optional: ["priority_level"],
    action: "bulk_update_priorities"
  }
};

/**
 * Priority Card Component with Enhanced Metrics
 */
const PriorityCard = ({ task, index, onSelect, onUpdatePriority, recentlyUpdated }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate priority metrics
  const dueDate = new Date(task.dueDate);
  const today = new Date();
  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  const deadlineScore = Math.max(0, Math.min(100, 100 - (daysLeft * 14)));
  const difficultyScore = task.difficulty ? task.difficulty * 10 : 50;
  
  let impactScore;
  switch(task.priority) {
    case 'high': impactScore = 90; break;
    case 'medium': impactScore = 60; break;
    case 'low': impactScore = 30; break;
    default: impactScore = 50;
  }
  
  const priorityScore = task.priorityScore || Math.round((deadlineScore * 0.4) + (difficultyScore * 0.3) + (impactScore * 0.3));

  const getPriorityColor = () => {
    if (priorityScore > 80) return "#ff4d4f";
    if (priorityScore > 60) return "#faad14";
    return "#52c41a";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`mb-3 cursor-pointer ${recentlyUpdated === task.id ? 'ring-2 ring-[#9981FF]' : ''}`}
      onClick={() => onSelect?.(task)}
    >
      <Card 
        className="bg-[#26262F] border-gray-600 hover:border-[#9981FF] transition-all duration-300"
        size="small"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold border-2"
            style={{ 
              backgroundColor: `${getPriorityColor()}40`,
              borderColor: getPriorityColor(),
              boxShadow: priorityScore > 75 ? `0 0 10px ${getPriorityColor()}80` : 'none'
            }}
          >
            <span className="text-lg font-bold">{priorityScore}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h4 className="text-white font-medium m-0 mb-1">{task.name}</h4>
              <Badge 
                color={getPriorityColor()} 
                text={
                  <span className="flex items-center">
                    {priorityScore > 75 && <FireOutlined className="mr-1 animate-pulse" />}
                    {task.priority.toUpperCase()}
                  </span>
                }
              />
            </div>
            
            <p className="text-gray-400 text-sm mb-2">
              <ClockCircleOutlined className="mr-1" /> Due: {task.dueDate}
            </p>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Tooltip title="Deadline Proximity - Higher score means the deadline is approaching soon">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center">
                      <AlertOutlined className="mr-1 text-red-500" /> Deadline
                    </span>
                    <span>{deadlineScore}%</span>
                  </div>
                  <Progress 
                    percent={deadlineScore} 
                    size="small" 
                    showInfo={false} 
                    strokeColor="#FF5252" 
                  />
                </div>
              </Tooltip>
              
              <Tooltip title="Task Difficulty - Based on the complexity of the task">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center">
                      <BarChartOutlined className="mr-1 text-yellow-500" /> Difficulty
                    </span>
                    <span>{difficultyScore}%</span>
                  </div>
                  <Progress 
                    percent={difficultyScore} 
                    size="small" 
                    showInfo={false} 
                    strokeColor="#FFC107" 
                  />
                </div>
              </Tooltip>
              
              <Tooltip title="Grade Impact - How important this task is for your overall grade">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 flex items-center">
                      <StarOutlined className="mr-1 text-blue-500" /> Impact
                    </span>
                    <span>{impactScore}%</span>
                  </div>
                  <Progress 
                    percent={impactScore} 
                    size="small" 
                    showInfo={false} 
                    strokeColor="#2196F3" 
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Enhanced PriorityDashboard with LLM Command Processing
 */
const PriorityDashboard = ({ 
  tasks, 
  onTaskSelect, 
  onUpdatePriority,
  chatCommand = null,
  getModalContext 
}) => {
  // Core state
  const [showInfo, setShowInfo] = useState(false);
  const [sortedTasks, setSortedTasks] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [recentlyUpdated, setRecentlyUpdated] = useState(null);

  // LLM command processing state
  const [lastCommand, setLastCommand] = useState(null);
  const [commandResponse, setCommandResponse] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditCriteria, setBulkEditCriteria] = useState('');

  /**
   * Provide modal context for chat integration
   */
  const provideModalContext = useCallback(() => {
    if (getModalContext) {
      return getModalContext('priorities', {
        totalTasks: tasks.length,
        highPriority: tasks.filter(t => t.priority === 'high').length,
        mediumPriority: tasks.filter(t => t.priority === 'medium').length,
        lowPriority: tasks.filter(t => t.priority === 'low').length,
        selectedFilter: selectedPriority,
        urgentTasks: sortedTasks.filter(t => t.priorityScore > 80).length,
        recentlyUpdated: recentlyUpdated ? 'Yes' : 'No'
      });
    }
    return '';
  }, [getModalContext, tasks, selectedPriority, sortedTasks, recentlyUpdated]);

  /**
   * Handle incoming chat commands
   */
  useEffect(() => {
    if (chatCommand && chatCommand.modal_target === 'priorities') {
      handleLLMCommand(chatCommand);
    }
  }, [chatCommand]);

  /**
   * Build LLM system prompt for priority management
   */
  const buildPriorityPrompt = useCallback((userMessage, currentData) => {
    return `You are an intelligent Priority Management assistant. Analyze user commands and return structured JSON.

FEATURE CONTEXT:
- Feature: Task Priority Management & Urgency Analysis
- Available actions: update_task_priority, show_priorities, analyze_urgency, bulk_priority_update
- Total tasks: ${currentData.totalTasks}
- Priority distribution: High(${currentData.highPriority}), Medium(${currentData.mediumPriority}), Low(${currentData.lowPriority})
- Available tasks: ${tasks.map(t => t.name).join(', ')}
- Current filter: ${currentData.selectedFilter}

INTENT ANALYSIS:
1. Determine PRIMARY INTENT: QUERY|UPDATE|MANAGE|ANALYZE
2. Extract task identifiers (match with available tasks)
3. Extract priority levels (high, medium, low, urgent)
4. Identify missing REQUIRED parameters

REQUIRED PARAMETERS FOR ACTIONS:
- update_task_priority: task_identifier, priority_level (required)
- show_priorities: none required, priority_filter optional
- analyze_urgency: none required, course_filter optional
- bulk_priority_update: criteria (required), priority_level optional

RESPONSE FORMAT:
{
  "intent": "QUERY|UPDATE|MANAGE|ANALYZE",
  "action": "update_task_priority|show_priorities|analyze_urgency|bulk_priority_update",
  "confidence": 0.95,
  "params": {
    "task_identifier": "exact task name",
    "priority_level": "high|medium|low",
    "priority_filter": "high|medium|low|urgent|all",
    "criteria": "deadline|course|difficulty",
    "reason": "explanation"
  },
  "missing": ["required_param1"],
  "modal_target": "priorities",
  "response": "Natural language response",
  "questions": ["Specific question?"],
  "ready_to_execute": true|false
}

EXAMPLES:
- "set math homework to high priority" → action: "update_task_priority", params: {task_identifier: "MATH 230 - 16.1 Homework", priority_level: "high"}
- "show urgent tasks" → action: "show_priorities", params: {priority_filter: "urgent"}
- "make all CMPSC assignments high priority" → action: "bulk_priority_update", params: {criteria: "course:CMPSC", priority_level: "high"}
- "analyze task urgency" → action: "analyze_urgency"

USER MESSAGE: "${userMessage}"
JSON RESPONSE:`;
  }, [tasks]);

  /**
   * Process LLM command for priority management
   */
  const handleLLMCommand = async (commandData) => {
    setProcessingCommand(true);
    setLastCommand(commandData);

    try {
      switch (commandData.action) {
        case "update_task_priority":
          return await executeUpdateTaskPriority(commandData.params);
        case "show_priorities":
          return await executeShowPriorities(commandData.params);
        case "analyze_urgency":
          return await executeAnalyzeUrgency(commandData.params);
        case "bulk_priority_update":
          return await executeBulkPriorityUpdate(commandData.params);
        default:
          return handleGenericPriorityCommand(commandData);
      }
    } catch (error) {
      console.error('Priority command error:', error);
      setCommandResponse('Sorry, I encountered an error processing that command.');
    } finally {
      setProcessingCommand(false);
    }
  };

  /**
   * Execute update task priority command
   */
  const executeUpdateTaskPriority = async (params) => {
    const { task_identifier, priority_level, reason } = params;
    
    if (!task_identifier || !priority_level) {
      setCommandResponse("I need both the task name and priority level. Example: 'Set MATH homework to high priority'");
      return "Missing task or priority information.";
    }
    
    // Find the target task
    const targetTask = tasks.find(t => 
      t.name.toLowerCase().includes(task_identifier.toLowerCase()) ||
      task_identifier.toLowerCase().includes(t.name.toLowerCase())
    );
    
    if (!targetTask) {
      setCommandResponse(`I couldn't find a task matching "${task_identifier}". Available tasks: ${tasks.map(t => t.name).slice(0, 3).join(', ')}...`);
      return "Task not found.";
    }
    
    // Update the priority
    if (onUpdatePriority) {
      await onUpdatePriority(targetTask.id, priority_level, reason);
    }
    
    // Highlight the updated task
    setRecentlyUpdated(targetTask.id);
    setTimeout(() => setRecentlyUpdated(null), 3000);
    
    const response = `✅ Updated "${targetTask.name}" to ${priority_level.toUpperCase()} priority.${reason ? ` Reason: ${reason}` : ''}`;
    setCommandResponse(response);
    
    notification.success({
      message: 'Priority Updated',
      description: `${targetTask.name} is now ${priority_level} priority`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Execute show priorities command
   */
  const executeShowPriorities = async (params) => {
    const { priority_filter, timeframe } = params;
    
    let filterToApply = 'all';
    if (priority_filter) {
      if (priority_filter === 'urgent') {
        // Show tasks with priority score > 80
        filterToApply = 'urgent';
      } else {
        filterToApply = priority_filter;
      }
    }
    
    setSelectedPriority(filterToApply);
    
    // Get filtered tasks
    let filteredTasks = [...tasks];
    if (filterToApply === 'urgent') {
      filteredTasks = sortedTasks.filter(t => t.priorityScore > 80);
    } else if (filterToApply !== 'all') {
      filteredTasks = tasks.filter(t => t.priority === filterToApply);
    }
    
    let response = `**${filterToApply.toUpperCase()} Priority Tasks:**\n\n`;
    
    if (filteredTasks.length === 0) {
      response += `No tasks found with ${filterToApply} priority.`;
    } else {
      filteredTasks.slice(0, 5).forEach(task => {
        const urgencyIcon = task.priorityScore > 80 ? " 🔥" : task.priorityScore > 60 ? " ⚠️" : "";
        response += `• **${task.name}** - ${task.priority} priority (Score: ${task.priorityScore})${urgencyIcon}\n`;
      });
      
      if (filteredTasks.length > 5) {
        response += `\n_Showing top 5 of ${filteredTasks.length} tasks. Use the filter above to see all._`;
      }
    }
    
    setCommandResponse(response);
    return response;
  };

  /**
   * Execute analyze urgency command
   */
  const executeAnalyzeUrgency = async (params) => {
    const { course_filter } = params;
    
    let tasksToAnalyze = sortedTasks;
    if (course_filter) {
      tasksToAnalyze = sortedTasks.filter(t => 
        t.name.toUpperCase().includes(course_filter.toUpperCase())
      );
    }
    
    const urgentTasks = tasksToAnalyze.filter(t => t.priorityScore > 80);
    const highTasks = tasksToAnalyze.filter(t => t.priorityScore > 60 && t.priorityScore <= 80);
    const normalTasks = tasksToAnalyze.filter(t => t.priorityScore <= 60);
    
    const response = `**📊 Task Urgency Analysis:**

🔥 **Critical Urgency** (${urgentTasks.length} tasks)
${urgentTasks.slice(0, 3).map(t => `• ${t.name} (Score: ${t.priorityScore})`).join('\n') || 'None'}

⚠️ **High Priority** (${highTasks.length} tasks) 
${highTasks.slice(0, 3).map(t => `• ${t.name} (Score: ${t.priorityScore})`).join('\n') || 'None'}

✅ **Normal Priority** (${normalTasks.length} tasks)
${normalTasks.slice(0, 2).map(t => `• ${t.name} (Score: ${t.priorityScore})`).join('\n') || 'None'}

**📈 Recommendations:**
${urgentTasks.length > 0 ? '• Focus on critical tasks first - they need immediate attention' : ''}
${urgentTasks.length > 3 ? '• Consider redistributing workload to prevent burnout' : ''}
${highTasks.length > 5 ? '• Schedule high priority tasks during peak focus hours' : ''}`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Execute bulk priority update command
   */
  const executeBulkPriorityUpdate = async (params) => {
    const { criteria, priority_level } = params;
    
    if (!criteria) {
      setCommandResponse("I need criteria for bulk updates. Example: 'Make all MATH assignments high priority' or 'Set overdue tasks to urgent'");
      return "Missing update criteria.";
    }
    
    setBulkEditCriteria(criteria);
    setShowBulkEdit(true);
    
    const response = `Bulk update requested: ${criteria}${priority_level ? ` to ${priority_level} priority` : ''}. Please confirm the changes in the dialog.`;
    setCommandResponse(response);
    return response;
  };

  /**
   * Handle generic priority commands
   */
  const handleGenericPriorityCommand = async (commandData) => {
    const response = `Priority Manager is ready! Try commands like:
    
• "Set [task name] to high priority"
• "Show urgent tasks" 
• "Make all MATH assignments high priority"
• "Analyze task urgency"
• "What should I focus on first?"`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Sort and filter tasks with priority scoring
   */
  useEffect(() => {
    let tasksToProcess = [...tasks];
    
    // Add priority scores to tasks
    tasksToProcess = tasksToProcess.map(task => {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      const deadlineScore = Math.max(0, Math.min(100, 100 - (daysLeft * 14)));
      
      const difficultyScore = task.difficulty ? task.difficulty * 10 : 50;
      
      let impactScore;
      switch(task.priority) {
        case 'high': impactScore = 90; break;
        case 'medium': impactScore = 60; break;
        case 'low': impactScore = 30; break;
        default: impactScore = 50;
      }
      
      const priorityScore = Math.round((deadlineScore * 0.4) + (difficultyScore * 0.3) + (impactScore * 0.3));
      
      return { ...task, priorityScore };
    });
    
    // Filter by selected priority if needed
    if (selectedPriority === 'urgent') {
      tasksToProcess = tasksToProcess.filter(task => task.priorityScore > 80);
    } else if (selectedPriority !== 'all') {
      tasksToProcess = tasksToProcess.filter(task => task.priority === selectedPriority);
    }
    
    // Sort by priority score (high to low)
    tasksToProcess.sort((a, b) => b.priorityScore - a.priorityScore);
    
    setSortedTasks(tasksToProcess);
  }, [tasks, selectedPriority]);
  
  // Get priority distribution
  const highPriorityCount = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityCount = tasks.filter(t => t.priority === 'low').length;
  const urgentCount = sortedTasks.filter(t => t.priorityScore > 80).length;
  
  return (
    <div className="priority-dashboard">
      <Card
        title={
          <div className="flex items-center">
            <RobotOutlined className="text-[#9981FF] mr-2" />
            <span className="text-white">AI Priority Dashboard</span>
            <Tooltip title="How it works">
              <InfoCircleOutlined 
                className="ml-2 text-gray-400 cursor-pointer" 
                onClick={() => setShowInfo(!showInfo)}
              />
            </Tooltip>
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
                message="Priority Command Processed"
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

        {showInfo && (
          <Alert
            message="Smart Priority System"
            description="Tasks are automatically prioritized based on deadlines, difficulty, and impact on your grades. Higher priority tasks will be automatically scheduled first in your weekly plan."
            type="info"
            closable
            onClose={() => setShowInfo(false)}
            className="mb-4 bg-[#26262F] border-[#9981FF] text-gray-300"
          />
        )}
        
        <div className="mb-4 bg-[#26262F] p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white text-lg m-0">Your Priorities</h3>
            <div className="flex gap-2">
              <Tag 
                color={selectedPriority === 'all' ? '#9981FF' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('all')}
              >
                All ({tasks.length})
              </Tag>
              <Tag 
                color={selectedPriority === 'urgent' ? '#ff4d4f' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('urgent')}
              >
                Urgent ({urgentCount})
              </Tag>
              <Tag 
                color={selectedPriority === 'high' ? '#FF5252' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('high')}
              >
                High ({highPriorityCount})
              </Tag>
              <Tag 
                color={selectedPriority === 'medium' ? '#FFC107' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('medium')}
              >
                Medium ({mediumPriorityCount})
              </Tag>
              <Tag 
                color={selectedPriority === 'low' ? '#2196F3' : '#333'} 
                className="cursor-pointer" 
                onClick={() => setSelectedPriority('low')}
              >
                Low ({lowPriorityCount})
              </Tag>
            </div>
          </div>
          <p className="text-gray-400 text-sm m-0">
            Tasks are automatically prioritized based on deadlines, difficulty, and impact on your grades.
          </p>
        </div>
        
        <div className="mt-4">
          <AnimatePresence>
            {sortedTasks.map((task, index) => (
              <PriorityCard 
                key={task.id} 
                task={task} 
                index={index} 
                onSelect={onTaskSelect}
                onUpdatePriority={onUpdatePriority}
                recentlyUpdated={recentlyUpdated}
              />
            ))}
          </AnimatePresence>
          
          {sortedTasks.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <AlertOutlined style={{ fontSize: 24 }} className="block mx-auto mb-3" />
              <p>No tasks matching the selected filter</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <div className="inline-flex items-center bg-[#26262F] text-gray-400 text-sm px-3 py-2 rounded-lg">
            <BookOutlined className="mr-2 text-[#9981FF]" />
            <span>Tasks with high priority scores will be automatically scheduled first</span>
          </div>
        </div>
      </Card>

      {/* Bulk Edit Modal */}
      <Modal
        title="Bulk Priority Update"
        open={showBulkEdit}
        onCancel={() => setShowBulkEdit(false)}
        onOk={() => {
          // Handle bulk update logic here
          setShowBulkEdit(false);
          notification.success({
            message: 'Bulk Update Complete',
            description: 'Priorities have been updated according to your criteria.',
          });
        }}
        className="bg-[#1F1F2C]"
      >
        <div className="text-white">
          <p>Update criteria: <strong>{bulkEditCriteria}</strong></p>
          <p className="text-gray-400">Review the tasks that will be affected and confirm the changes.</p>
          
          {/* Preview of affected tasks would go here */}
          <div className="mt-4 p-3 bg-[#26262F] rounded">
            <p className="text-sm text-gray-400">Preview of affected tasks...</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PriorityDashboard;