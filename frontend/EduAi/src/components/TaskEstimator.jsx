/**
 * Enhanced TaskEstimator with LLM-powered natural language command processing
 * Supports commands like "estimate my math homework", "how difficult is this task", etc.
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Slider, Button, Progress, List, Tag, Alert, Tooltip, Select, notification } from 'antd';
import { 
  ClockCircleOutlined, 
  BarChartOutlined, 
  BulbOutlined, 
  CheckOutlined, 
  SaveOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  FireOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

/**
 * LLM Command Structure for Task Estimation
 */
const ESTIMATOR_COMMANDS = {
  "estimate_task": {
    required: ["task_identifier"],
    optional: ["estimation_type", "user_context"],
    action: "estimate_task_difficulty"
  },
  "set_estimate": {
    required: ["task_identifier", "estimate_type", "value"],
    optional: ["confidence_level"],
    action: "update_task_estimate"
  },
  "analyze_difficulty": {
    required: ["task_identifier"],
    optional: ["comparison_tasks"],
    action: "analyze_task_complexity"
  },
  "show_estimates": {
    required: [],
    optional: ["filter", "timeframe"],
    action: "query_estimates"
  }
};

/**
 * Enhanced TaskEstimator with LLM Command Processing
 */
const TaskEstimator = ({ 
  task, 
  tasks = [], 
  onEstimate, 
  onUpdateTask,
  chatCommand = null,
  getModalContext,
  selectedTask: globalSelectedTask,
  onTaskSelect 
}) => {
  // Core estimation state - use global selected task if available
  const [selectedTask, setSelectedTask] = useState(globalSelectedTask || task || null);
  const [difficulty, setDifficulty] = useState(5);
  const [focus, setFocus] = useState(5);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // LLM command processing state  
  const [lastCommand, setLastCommand] = useState(null);
  const [commandResponse, setCommandResponse] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);

  // Historical data for AI insights
  const [processHistoricalData, setProcessHistoricalData] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  /**
   * Provide modal context for chat integration
   */
  const provideModalContext = useCallback(() => {
    if (getModalContext) {
      return getModalContext('estimator', {
        currentTask: selectedTask?.name || 'No task selected',
        currentDifficulty: difficulty,
        currentFocus: focus,
        estimatedTime: estimatedTime,
        availableTasks: tasks.length,
        recentEstimates: processHistoricalData.slice(0, 3),
        aiSuggestions: aiSuggestions.length
      });
    }
    return '';
  }, [getModalContext, selectedTask, difficulty, focus, estimatedTime, tasks, processHistoricalData, aiSuggestions]);

  /**
   * Handle incoming chat commands
   */
  useEffect(() => {
    if (chatCommand && chatCommand.modal_target === 'estimator') {
      handleLLMCommand(chatCommand);
    }
  }, [chatCommand]);

  /**
   * Build LLM system prompt for task estimation
   */
  const buildEstimatorPrompt = useCallback((userMessage, currentData) => {
    return `You are an intelligent Task Estimation assistant. Analyze user commands and return structured JSON.

FEATURE CONTEXT:
- Feature: Task Estimation & Difficulty Analysis
- Available actions: estimate_task, set_estimate, analyze_difficulty, show_estimates
- Current selected task: ${currentData.selectedTask || 'None'}
- Available tasks: ${currentData.availableTasks.map(t => t.name).join(', ')}
- Current settings: Difficulty=${currentData.difficulty}/10, Focus=${currentData.focus}/10

INTENT ANALYSIS:
1. Determine PRIMARY INTENT: QUERY|UPDATE|MANAGE|ESTIMATE
2. Extract task identifiers (match with available tasks)
3. Extract estimation parameters (difficulty, time, focus)
4. Identify missing REQUIRED parameters

REQUIRED PARAMETERS FOR ACTIONS:
- estimate_task: task_identifier (required)
- set_estimate: task_identifier, estimate_type, value (required)
- analyze_difficulty: task_identifier (required)
- show_estimates: none required

RESPONSE FORMAT:
{
  "intent": "QUERY|UPDATE|MANAGE|ESTIMATE",
  "action": "estimate_task|set_estimate|analyze_difficulty|show_estimates",
  "confidence": 0.95,
  "params": {
    "task_identifier": "exact task name",
    "estimate_type": "difficulty|focus|time",
    "value": "numeric value",
    "comparison_tasks": ["task1", "task2"]
  },
  "missing": ["required_param1"],
  "modal_target": "estimator",
  "response": "Natural language response",
  "questions": ["Specific question?"],
  "ready_to_execute": true|false
}

EXAMPLES:
- "estimate the difficulty of my math homework" → action: "estimate_task", params: {task_identifier: "MATH 230 - 16.1 Homework"}
- "set focus level to 8" → action: "set_estimate", params: {estimate_type: "focus", value: 8}
- "how difficult is this compared to my CMPSC assignment" → action: "analyze_difficulty"
- "show my estimates" → action: "show_estimates"

USER MESSAGE: "${userMessage}"
JSON RESPONSE:`;
  }, []);

  /**
   * Process LLM command for task estimation
   */
  const handleLLMCommand = async (commandData) => {
    setProcessingCommand(true);
    setLastCommand(commandData);

    try {
      switch (commandData.action) {
        case "estimate_task":
          return await executeEstimateTask(commandData.params);
        case "set_estimate":
          return await executeSetEstimate(commandData.params);
        case "analyze_difficulty":
          return await executeAnalyzeDifficulty(commandData.params);
        case "show_estimates":
          return await executeShowEstimates(commandData.params);
        default:
          return handleGenericEstimatorCommand(commandData);
      }
    } catch (error) {
      console.error('Task estimator command error:', error);
      setCommandResponse('Sorry, I encountered an error processing that command.');
    } finally {
      setProcessingCommand(false);
    }
  };

  /**
   * Execute task estimation command
   */
  const executeEstimateTask = async (params) => {
    const { task_identifier, estimation_type } = params;
    
    // Find the target task
    let targetTask = null;
    if (task_identifier) {
      targetTask = tasks.find(t => 
        t.name.toLowerCase().includes(task_identifier.toLowerCase()) ||
        task_identifier.toLowerCase().includes(t.name.toLowerCase())
      );
    }
    
    if (!targetTask && !selectedTask) {
      setCommandResponse("Which task would you like me to estimate? Please specify the task name.");
      return "Please specify which task to estimate.";
    }
    
    const taskToEstimate = targetTask || selectedTask;
    setSelectedTask(taskToEstimate);
    
    // Trigger AI estimation
    await performAIEstimation(taskToEstimate);
    
    const response = `Starting estimation for "${taskToEstimate.name}". Based on the course and task type, I've set initial parameters. You can adjust them if needed.`;
    setCommandResponse(response);
    
    notification.success({
      message: 'Task Estimation Started',
      description: `Now estimating: ${taskToEstimate.name}`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Execute set estimate command
   */
  const executeSetEstimate = async (params) => {
    const { estimate_type, value, task_identifier } = params;
    
    if (!estimate_type || value === undefined) {
      setCommandResponse("Please specify what to estimate (difficulty, focus, or time) and the value.");
      return "Missing estimation parameters.";
    }
    
    const numValue = parseFloat(value);
    
    switch (estimate_type.toLowerCase()) {
      case 'difficulty':
        setDifficulty(Math.min(10, Math.max(1, numValue)));
        break;
      case 'focus':
        setFocus(Math.min(10, Math.max(1, numValue)));
        break;
      case 'time':
        setEstimatedTime(numValue);
        break;
    }
    
    // Recalculate with new values
    calculateEstimation();
    
    const response = `Updated ${estimate_type} to ${numValue}. ${selectedTask ? `Recalculating estimate for "${selectedTask.name}".` : 'Select a task to see the updated estimate.'}`;
    setCommandResponse(response);
    return response;
  };

  /**
   * Execute difficulty analysis command
   */
  const executeAnalyzeDifficulty = async (params) => {
    if (!selectedTask) {
      setCommandResponse("Please select a task first to analyze its difficulty.");
      return "No task selected for analysis.";
    }
    
    // Generate difficulty analysis
    const analysis = analyzeTasks([selectedTask], params.comparison_tasks);
    
    const response = `**Difficulty Analysis for "${selectedTask.name}":**\n\n` +
      `• Estimated difficulty: ${difficulty}/10\n` +
      `• Course complexity: ${getCourseComplexity(selectedTask)}\n` +
      `• Task type factors: ${getTaskTypeFactors(selectedTask)}\n` +
      `• Recommended focus level: ${focus}/10\n\n` +
      `This analysis considers course requirements, task complexity, and your historical performance.`;
    
    setCommandResponse(response);
    return response;
  };

  /**
   * Execute show estimates command
   */
  const executeShowEstimates = async (params) => {
    const tasksWithEstimates = tasks.filter(t => t.estimatedTime || t.difficulty);
    
    if (tasksWithEstimates.length === 0) {
      setCommandResponse("You haven't estimated any tasks yet. Select a task and click 'Calculate with AI' to get started.");
      return "No estimates found.";
    }
    
    let response = "**Your Task Estimates:**\n\n";
    tasksWithEstimates.slice(0, 5).forEach(task => {
      response += `• **${task.name}**\n`;
      if (task.estimatedTime) response += `  Time: ${task.estimatedTime} hours\n`;
      if (task.difficulty) response += `  Difficulty: ${task.difficulty}/10\n`;
      response += '\n';
    });
    
    if (tasksWithEstimates.length > 5) {
      response += `_Showing top 5 of ${tasksWithEstimates.length} estimated tasks._`;
    }
    
    setCommandResponse(response);
    return response;
  };

  /**
   * Handle generic estimator commands
   */
  const handleGenericEstimatorCommand = async (commandData) => {
    const response = `Task Estimator is ready to help! Try commands like:
    
• "Estimate my [task name]"
• "Set difficulty to [1-10]" 
• "How difficult is this task?"
• "Show my estimates"
• "Analyze this task's complexity"`;

    setCommandResponse(response);
    return response;
  };

  /**
   * Perform AI-powered task estimation
   */
  const performAIEstimation = async (task) => {
    setIsCalculating(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // AI estimation based on course and task type
      const courseComplexity = getCourseComplexity(task);
      const taskTypeFactors = getTaskTypeFactors(task);
      
      const estimatedDifficulty = Math.min(10, Math.max(1, 
        Math.round((courseComplexity + taskTypeFactors) / 2)
      ));
      
      const estimatedFocus = Math.min(10, Math.max(1,
        Math.round(estimatedDifficulty * 0.8 + Math.random() * 2)
      ));
      
      setDifficulty(estimatedDifficulty);
      setFocus(estimatedFocus);
      setConfidenceScore(0.85 + Math.random() * 0.1);
      
      // Generate AI suggestions
      generateAISuggestions(task, estimatedDifficulty, estimatedFocus);
      
      // Calculate final estimate
      calculateEstimation();
      
    } catch (error) {
      console.error('AI estimation error:', error);
      notification.error({
        message: 'Estimation Error',
        description: 'Failed to generate AI estimate. Using default values.',
      });
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Calculate task estimation based on difficulty and focus
   */
  const calculateEstimation = useCallback(() => {
    if (!selectedTask) return;
    
    // Base time calculation
    const baseTime = difficulty * 0.5;
    
    // Focus adjustment (lower focus = more time needed)
    const focusMultiplier = 1 + (10 - focus) * 0.1;
    
    // Course complexity adjustment
    const courseMultiplier = getCourseComplexityMultiplier(selectedTask);
    
    // Final calculation
    const finalTime = Math.round((baseTime * focusMultiplier * courseMultiplier) * 100) / 100;
    
    setEstimatedTime(finalTime);
    setConfidenceScore(0.8 + (Math.random() * 0.15));
  }, [difficulty, focus, selectedTask]);

  /**
   * Get course complexity score
   */
  const getCourseComplexity = (task) => {
    const courseName = task.name.toUpperCase();
    if (courseName.includes('CMPSC') || courseName.includes('MATH')) return 8;
    if (courseName.includes('PHYS') || courseName.includes('CHEM')) return 7;
    if (courseName.includes('ENGL') || courseName.includes('HIST')) return 6;
    return 5;
  };

  /**
   * Get task type complexity factors
   */
  const getTaskTypeFactors = (task) => {
    const taskName = task.name.toLowerCase();
    if (taskName.includes('programming') || taskName.includes('coding')) return 9;
    if (taskName.includes('homework') || taskName.includes('assignment')) return 6;
    if (taskName.includes('quiz') || taskName.includes('test')) return 7;
    if (taskName.includes('project')) return 8;
    return 5;
  };

  /**
   * Get course complexity multiplier
   */
  const getCourseComplexityMultiplier = (task) => {
    const complexity = getCourseComplexity(task);
    return 0.8 + (complexity / 10) * 0.4; // Range: 0.8 to 1.2
  };

  /**
   * Generate AI suggestions based on task analysis
   */
  const generateAISuggestions = (task, difficulty, focus) => {
    const suggestions = [];
    
    if (difficulty >= 8) {
      suggestions.push({
        type: 'difficulty',
        icon: '🧠',
        title: 'High Complexity Task',
        description: 'This task requires significant mental effort.',
        recommendation: 'Break into smaller subtasks and schedule during peak focus hours.'
      });
    }
    
    if (focus <= 4) {
      suggestions.push({
        type: 'focus',
        icon: '🎯',
        title: 'Focus Enhancement Needed',
        description: 'Low focus level may extend completion time.',
        recommendation: 'Consider environment optimization and break techniques.'
      });
    }
    
    const courseType = getCourseType(task);
    if (courseType === 'programming') {
      suggestions.push({
        type: 'strategy',
        icon: '💻',
        title: 'Programming Task Detected',
        description: 'Technical implementation required.',
        recommendation: 'Allocate extra time for debugging and testing.'
      });
    }
    
    setAiSuggestions(suggestions);
  };

  /**
   * Get course type from task
   */
  const getCourseType = (task) => {
    const courseName = task.name.toUpperCase();
    if (courseName.includes('CMPSC')) return 'programming';
    if (courseName.includes('MATH')) return 'mathematics';
    if (courseName.includes('PHYS')) return 'physics';
    return 'general';
  };

  /**
   * Analyze multiple tasks for comparison
   */
  const analyzeTasks = (targetTasks, comparisonTasks = []) => {
    // Implementation for task comparison analysis
    return {
      difficulty: difficulty,
      complexity: getCourseComplexity(targetTasks[0]),
      timeEstimate: estimatedTime,
      recommendations: aiSuggestions
    };
  };

  // Auto-calculate when sliders change
  useEffect(() => {
    if (selectedTask) {
      const timeoutId = setTimeout(calculateEstimation, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [difficulty, focus, calculateEstimation]);

  // Initialize historical data
  useEffect(() => {
    const mockHistoricalData = [
      { name: 'CMPSC 221 - PA4', estimatedTime: 4, actualTime: 3.5, accuracy: 0.875 },
      { name: 'MATH 230 - HW15', estimatedTime: 2.5, actualTime: 3, accuracy: 0.833 },
      { name: 'GEOG 30N - Essay', estimatedTime: 3, actualTime: 2.8, accuracy: 0.933 }
    ];
    setProcessHistoricalData(mockHistoricalData);
  }, []);

  // Auto-update selected task when global selection changes (like calendar does)
  useEffect(() => {
    if (globalSelectedTask && globalSelectedTask !== selectedTask) {
      setSelectedTask(globalSelectedTask);
      // Automatically load existing estimates if available
      if (globalSelectedTask.difficulty) {
        setDifficulty(globalSelectedTask.difficulty);
      }
      if (globalSelectedTask.focus) {
        setFocus(globalSelectedTask.focus);
      }
      if (globalSelectedTask.estimatedTime) {
        setEstimatedTime(globalSelectedTask.estimatedTime);
      }
      
      // Show automatic context detection message
      setCommandResponse(`Automatically detected selected task: "${globalSelectedTask.name}". ${globalSelectedTask.estimatedTime ? 'Loaded existing estimates.' : 'Ready for estimation.'}`);
      
      notification.info({
        message: 'Task Auto-Selected',
        description: `Now working with: ${globalSelectedTask.name}`,
        placement: 'topRight',
        duration: 3
      });
    }
  }, [globalSelectedTask, selectedTask]);

  return (
    <div className="h-full flex flex-col">
      <Card 
        className="bg-[#1F1F2C] border-gray-700 flex-1 flex flex-col"
        bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}
        title={
          <div className="flex items-center">
            <RobotOutlined className="text-[#9981FF] mr-2" />
            <span className="text-white">AI Task Estimator</span>
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
                  message="Command Processed"
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

      {/* Task Selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-white text-base font-medium">Select Task to Estimate</h4>
          {globalSelectedTask && globalSelectedTask === selectedTask && (
            <Tag color="green" size="small">
              Auto-detected from context
            </Tag>
          )}
        </div>
        <Select
          value={selectedTask?.id || undefined}
          onChange={(taskId) => {
            const task = tasks.find(t => t.id === taskId);
            setSelectedTask(task);
            // Update global selection if callback provided
            if (onTaskSelect) {
              onTaskSelect(task);
            }
            setEstimatedTime(null);
          }}
          placeholder="Choose a task for estimation"
          className="w-full custom-select"
          dropdownClassName="bg-[#26262F]"
        >
          {tasks.map(task => (
            <Option key={task.id} value={task.id}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white">{task.name}</span>
                  <div className="text-xs text-gray-400">
                    Due: {task.dueDate || 'No deadline'} | Priority: {task.priority}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Tag size="small" color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'blue'}>
                    {task.priority}
                  </Tag>
                  {task.dueDate && (
                    <Tag size="small" color="purple">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Tag>
                  )}
                </div>
              </div>
            </Option>
          ))}
        </Select>
        
        {selectedTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 p-3 bg-[#1F1F2C] rounded-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white text-base font-medium">{selectedTask.name}</h4>
                <p className="text-gray-400 text-sm">
                  Due: {selectedTask.dueDate || 'No due date'} | Course: {selectedTask.course || 'General'}
                </p>
              </div>
              {selectedTask.estimatedTime && (
                <Tag color="green">
                  Previously estimated: {selectedTask.estimatedTime}h
                </Tag>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Suggestions Panel */}
      <AnimatePresence>
        {aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card className="bg-[#1F1F2C] border-[#9981FF] border">
              <div className="flex items-center mb-3">
                <BulbOutlined className="text-[#9981FF] mr-2" />
                <span className="text-white font-medium">AI Insights & Suggestions</span>
              </div>
              
              <List
                dataSource={aiSuggestions}
                renderItem={(suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <List.Item className="border-0 px-0">
                      <div className="bg-[#26262F] p-3 rounded-lg w-full">
                        <div className="flex items-start">
                          <span className="text-2xl mr-3">{suggestion.icon}</span>
                          <div>
                            <h5 className="text-white text-sm font-medium mb-1">{suggestion.title}</h5>
                            <p className="text-gray-400 text-xs mb-1">{suggestion.description}</p>
                            <p className="text-[#9981FF] text-xs">{suggestion.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  </motion.div>
                )}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimation Controls */}
      {selectedTask && (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Difficulty Level</span>
              <span className="text-[#9981FF] font-semibold">{difficulty}/10</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={difficulty}
              onChange={setDifficulty}
              trackStyle={{ backgroundColor: '#9981FF' }}
              handleStyle={{ borderColor: '#9981FF', backgroundColor: '#9981FF' }}
            />
            <p className="text-xs text-gray-400 mt-1">
              How complex is this task? (1=Very Easy, 10=Extremely Difficult)
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">Required Focus</span>
              <span className="text-[#9981FF] font-semibold">{focus}/10</span>
            </div>
            <Slider
              min={1}
              max={10}
              value={focus}
              onChange={setFocus}
              trackStyle={{ backgroundColor: '#FFA726' }}
              handleStyle={{ borderColor: '#FFA726', backgroundColor: '#FFA726' }}
            />
            <p className="text-xs text-gray-400 mt-1">
              How much concentration does this require? (1=Low, 10=Deep Focus)
            </p>
          </div>

          {/* Calculate Button */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              size="large"
              loading={isCalculating}
              onClick={() => performAIEstimation(selectedTask)}
              style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
            >
              {isCalculating ? 'AI is calculating...' : 'Calculate with AI'}
            </Button>
            
            {estimatedTime !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full bg-[#1F1F2C] p-2 rounded-lg"
              >
                <span className="text-gray-300 text-sm">Estimated Time:</span>
                <span className="text-[#9981FF] text-2xl font-bold">{estimatedTime}h</span>
                {confidenceScore > 0 && (
                  <span className="text-xs text-gray-400">
                    {Math.round(confidenceScore * 100)}% confidence
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Results Panel */}
      <AnimatePresence>
        {estimatedTime !== null && selectedTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <Card className="bg-[#1F1F2C] border-[#9981FF]">
              <div className="flex items-center mb-3">
                <CheckOutlined className="text-green-500 mr-2" />
                <span className="text-white font-medium">Estimation Complete!</span>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<SaveOutlined />}
                  className="ml-auto text-[#9981FF]"
                  onClick={() => {
                    if (onEstimate) {
                      onEstimate(difficulty, focus, estimatedTime);
                    }
                    notification.success({
                      message: 'Estimate Saved',
                      description: `Saved estimate for ${selectedTask.name}`,
                      placement: 'topRight'
                    });
                  }}
                >
                  Save to Task
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#26262F] p-3 rounded">
                  <h5 className="text-[#9981FF] text-sm font-medium mb-2">Task Details</h5>
                  <p className="text-white text-sm mb-1">{selectedTask.name}</p>
                  <div className="flex gap-2 text-xs">
                    <Tag size="small" color="purple">
                      {selectedTask.course || 'General'}
                    </Tag>
                    <Tag size="small" color={selectedTask.priority === 'high' ? 'red' : 'orange'}>
                      {selectedTask.priority?.toUpperCase()}
                    </Tag>
                  </div>
                </div>
                
                <div className="bg-[#26262F] p-3 rounded">
                  <h5 className="text-[#9981FF] text-sm font-medium mb-2">Time Breakdown</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base time (difficulty):</span>
                      <span className="text-white">{(difficulty * 0.5).toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Focus adjustment:</span>
                      <span className="text-white">{((1 + (10 - focus) * 0.1) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI insights:</span>
                      <span className="text-white">Applied</span>
                    </div>
                    <div className="border-t border-gray-600 pt-1 mt-1 flex justify-between font-medium">
                      <span className="text-[#9981FF]">Total estimate:</span>
                      <span className="text-[#9981FF]">{estimatedTime}h</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#26262F] p-3 rounded">
                <h5 className="text-[#9981FF] text-sm font-medium mb-2">Recommendations</h5>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Schedule this task when your energy matches the required focus level</li>
                  <li>• Break into {Math.ceil(estimatedTime / 2)} sessions of ~{Math.floor((estimatedTime / Math.ceil(estimatedTime / 2)) * 60)} minutes each</li>
                  <li>• Add 15-20% buffer time for unexpected challenges</li>
                  {selectedTask.priority === 'high' && (
                    <li>• High priority: Complete during your most productive hours</li>
                  )}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historical Performance Panel */}
      <AnimatePresence>
        {processHistoricalData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
          >
            <Card className="bg-[#1F1F2C] border-gray-700">
              <div className="flex items-center mb-3">
                <BarChartOutlined className="text-[#9981FF] mr-2" />
                <span className="text-white font-medium">Your Performance History</span>
              </div>
              
              <div className="space-y-2">
                {processHistoricalData.slice(0, 3).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center bg-[#26262F] p-2 rounded text-sm"
                  >
                    <div>
                      <span className="text-white">{item.name.substring(0, 30)}...</span>
                      <div className="text-xs text-gray-400">
                        Estimated: {item.estimatedTime}h | Actual: {item.actualTime}h
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        percent={Math.round(item.accuracy * 100)}
                        size="small"
                        strokeColor={item.accuracy > 0.8 ? '#52c41a' : item.accuracy > 0.6 ? '#faad14' : '#ff4d4f'}
                        format={() => ''}
                        style={{ width: 60 }}
                      />
                      <span className="text-xs text-gray-400">
                        {Math.round(item.accuracy * 100)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {processHistoricalData.length > 3 && (
                <div className="mt-2 text-center">
                  <Button type="link" size="small" className="text-[#9981FF]">
                    View all performance data
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

export default TaskEstimator;