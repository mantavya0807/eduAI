/**
 * Enhanced StudyPeers with LLM-powered natural language command processing
 * Supports commands like "find study partners for MATH 230", "connect with Alex", etc.
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Avatar, Tag, Input, Empty, List, Badge, notification, Modal, Select, Tooltip, Alert } from 'antd';
import { 
  TeamOutlined,
  SearchOutlined,
  FilterOutlined,
  MessageOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  RobotOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;

/**
 * LLM Command Structure for Study Peers
 */
const PEERS_COMMANDS = {
  "find_peers": {
    required: ["course_filter"],
    optional: ["availability", "compatibility_threshold"],
    action: "search_study_partners"
  },
  "connect_peer": {
    required: ["peer_identifier"],
    optional: ["message", "study_topic"],
    action: "initiate_peer_connection"
  },
  "join_group": {
    required: ["group_identifier"],
    optional: ["introduction_message"],
    action: "join_study_group"
  },
  "create_group": {
    required: ["group_name", "course"],
    optional: ["description", "schedule"],
    action: "create_study_group"
  },
  "show_connections": {
    required: [],
    optional: ["status_filter"],
    action: "list_peer_connections"
  }
};

/**
 * Enhanced Peer Card Component
 */
const PeerCard = ({ peer, index, onConnect, connected, onMessage, recentMatch }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <motion.div
      key={peer.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`mb-3 ${recentMatch === peer.id ? 'ring-2 ring-[#9981FF] ring-opacity-50' : ''}`}
    >
      <Card 
        className="bg-[#26262F] border-gray-600 hover:border-[#9981FF] transition-all duration-300"
        size="small"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar src={peer.avatar} size={64} className="border-2 border-gray-600" />
            <Badge 
              status={peer.status === 'online' ? 'success' : peer.status === 'away' ? 'warning' : 'default'} 
              className="absolute -top-1 -right-1"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-white font-medium m-0">{peer.name}</h4>
              <div className="flex gap-1">
                {peer.expertise?.slice(0, 2).map((skill, i) => (
                  <Tag key={i} size="small" color="blue">
                    {skill}
                  </Tag>
                ))}
              </div>
            </div>
            
            <p className="text-gray-400 text-sm mb-2">
              📚 {peer.course} • {peer.status === 'online' ? '🟢 Online' : '🟡 Away'}
            </p>
            
            {peer.nextSession && (
              <p className="text-[#9981FF] text-sm mb-2">
                <CalendarOutlined className="mr-1" />
                Next session: {peer.nextSession}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="small"
                  type={connected ? "default" : "primary"}
                  icon={connected ? <CheckCircleOutlined /> : <UserAddOutlined />}
                  onClick={() => onConnect(peer)}
                  style={!connected ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : {}}
                >
                  {connected ? 'Connected' : 'Connect'}
                </Button>
                
                <Button
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => onMessage?.(peer)}
                  className="text-[#9981FF] border-[#9981FF]"
                  ghost
                >
                  Message
                </Button>
              </div>
              
              <Button 
                type="text" 
                size="small" 
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400"
              >
                {showDetails ? 'Less' : 'More'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-600"
                >
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Expertise:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {peer.expertise?.map((skill, i) => (
                          <Tag key={i} size="small" color="purple">
                            {skill}
                          </Tag>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Availability:</span>
                      <div className="text-white mt-1">
                        {peer.availability?.join(' • ') || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Study Group Card Component
 */
const StudyGroupCard = ({ group, index, onJoin, isJoined }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="mb-3"
    >
      <Card 
        className="bg-[#26262F] border-gray-600"
        size="small"
        title={
          <div className="flex items-center justify-between">
            <span className="text-white">{group.name}</span>
            <Badge 
              status={group.active ? 'success' : 'default'} 
              text={
                <span className="text-gray-400">
                  {group.active ? 'Active' : 'Inactive'}
                </span>
              }
            />
          </div>
        }
      >
        <p className="text-gray-400 text-sm mb-3">{group.description}</p>
        
        {group.nextSession && (
          <div className="bg-[#1F1F2C] p-2 rounded mb-3">
            <div className="flex items-center text-[#9981FF] text-sm">
              <CalendarOutlined className="mr-2" />
              <span>Next session: {group.nextSession}</span>
            </div>
          </div>
        )}
        
        {group.topics && (
          <div className="mb-3">
            <span className="text-gray-400 text-xs">Current topics:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {group.topics.map((topic, i) => (
                <Tag key={i} size="small" color="green">
                  {topic}
                </Tag>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {group.members?.slice(0, 4).map((member, i) => (
              <Avatar
                key={i}
                src={member.avatar}
                size={24}
                className="border border-gray-600"
                title={member.name}
              />
            ))}
            {group.members?.length > 4 && (
              <Avatar size={24} className="bg-gray-600 text-xs">
                +{group.members.length - 4}
              </Avatar>
            )}
          </div>
          
          <Button
            size="small"
            type={isJoined ? "default" : "primary"}
            icon={isJoined ? <CheckCircleOutlined /> : <UserAddOutlined />}
            onClick={() => onJoin(group)}
            style={!isJoined ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : {}}
          >
            {isJoined ? "Joined" : "Join Group"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Enhanced StudyPeers with LLM Command Processing
 */
const StudyPeers = ({ 
  peers = [], 
  recommendedGroups = [],
  onConnectPeer,
  onJoinGroup,
  chatCommand = null,
  getModalContext 
}) => {
  // Core state
  const [activeTab, setActiveTab] = useState('peers');
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [justMatched, setJustMatched] = useState(null);

  // LLM command processing state
  const [lastCommand, setLastCommand] = useState(null);
  const [commandResponse, setCommandResponse] = useState('');
  const [processingCommand, setProcessingCommand] = useState(false);
  const [recentMatch, setRecentMatch] = useState(null);

  /**
   * Provide modal context for chat integration
   */
  const provideModalContext = useCallback(() => {
    if (getModalContext) {
      return getModalContext('peers', {
        totalPeers: peers.length,
        onlinePeers: peers.filter(p => p.status === 'online').length,
        connectedPeers: connectedPeers.length,
        availableGroups: recommendedGroups.length,
        joinedGroups: joinedGroups.length,
        currentFilter: selectedCourse,
        activeTab: activeTab,
        searchQuery: searchQuery || 'None'
      });
    }
    return '';
  }, [getModalContext, peers, connectedPeers, recommendedGroups, joinedGroups, selectedCourse, activeTab, searchQuery]);

  /**
   * Handle incoming chat commands
   */
  useEffect(() => {
    if (chatCommand && chatCommand.modal_target === 'peers') {
      handleLLMCommand(chatCommand);
    }
  }, [chatCommand]);

  /**
   * Build LLM system prompt for study peers
   */
  const buildPeersPrompt = useCallback((userMessage, currentData) => {
    return `You are an intelligent Study Peers assistant. Analyze user commands and return structured JSON.

FEATURE CONTEXT:
- Feature: Study Partners & Group Management
- Available actions: find_peers, connect_peer, join_group, create_group, show_connections
- Total peers: ${currentData.totalPeers}, Online: ${currentData.onlinePeers}
- Connected peers: ${currentData.connectedPeers}
- Available groups: ${currentData.availableGroups}, Joined: ${currentData.joinedGroups}
- Available peers: ${peers.map(p => p.name).join(', ')}
- Available courses: ${[...new Set(peers.map(p => p.course))].join(', ')}

INTENT ANALYSIS:
1. Determine PRIMARY INTENT: QUERY|CONNECT|JOIN|CREATE|SEARCH
2. Extract peer/group identifiers (match with available names)
3. Extract course filters and search criteria
4. Identify missing REQUIRED parameters

REQUIRED PARAMETERS FOR ACTIONS:
- find_peers: course_filter (required)
- connect_peer: peer_identifier (required)
- join_group: group_identifier (required)
- create_group: group_name, course (required)
- show_connections: none required

RESPONSE FORMAT:
{
  "intent": "QUERY|CONNECT|JOIN|CREATE|SEARCH",
  "action": "find_peers|connect_peer|join_group|create_group|show_connections",
  "confidence": 0.95,
  "params": {
    "peer_identifier": "exact peer name",
    "course_filter": "MATH|CMPSC|PHYS|etc",
    "group_identifier": "exact group name",
    "group_name": "new group name",
    "message": "connection message",
    "availability": "time preferences"
  },
  "missing": ["required_param1"],
  "modal_target": "peers",
  "response": "Natural language response",
  "questions": ["Specific question?"],
  "ready_to_execute": true|false
}

EXAMPLES:
- "find study partners for MATH 230" → action: "find_peers", params: {course_filter: "MATH 230"}
- "connect with Alex Chen" → action: "connect_peer", params: {peer_identifier: "Alex Chen"}
- "join CMPSC study group" → action: "join_group", params: {group_identifier: "CMPSC 132 Study Group"}
- "show my connections" → action: "show_connections"

USER MESSAGE: "${userMessage}"
JSON RESPONSE:`;
  }, [peers]);

  /**
   * Process LLM command for study peers
   */
  const handleLLMCommand = async (commandData) => {
    setProcessingCommand(true);
    setLastCommand(commandData);

    try {
      switch (commandData.action) {
        case "find_peers":
          return await executeFindPeers(commandData.params);
        case "connect_peer":
          return await executeConnectPeer(commandData.params);
        case "join_group":
          return await executeJoinGroup(commandData.params);
        case "create_group":
          return await executeCreateGroup(commandData.params);
        case "show_connections":
          return await executeShowConnections(commandData.params);
        default:
          return handleGenericPeersCommand(commandData);
      }
    } catch (error) {
      console.error('Study peers command error:', error);
      setCommandResponse('Sorry, I encountered an error processing that command.');
    } finally {
      setProcessingCommand(false);
    }
  };

  /**
   * Execute find peers command
   */
  const executeFindPeers = async (params) => {
    const { course_filter, availability } = params;
    
    if (!course_filter) {
      setCommandResponse("Which course would you like to find study partners for? Example: 'Find partners for MATH 230'");
      return "Please specify a course.";
    }
    
    // Filter peers by course
    const coursePeers = peers.filter(peer => 
      peer.course.toLowerCase().includes(course_filter.toLowerCase()) ||
      course_filter.toLowerCase().includes(peer.course.toLowerCase())
    );
    
    if (coursePeers.length === 0) {
      setCommandResponse(`No study partners found for ${course_filter}. Available courses: ${[...new Set(peers.map(p => p.course))].join(', ')}`);
      return "No peers found for this course.";
    }
    
    // Set filter and switch to peers tab
    setSelectedCourse(course_filter);
    setActiveTab('peers');
    setSearchQuery(course_filter);
    
    const onlinePeers = coursePeers.filter(p => p.status === 'online');
    
    let response = `**📚 Study Partners for ${course_filter}:**\n\n`;
    
    if (onlinePeers.length > 0) {
      response += `**🟢 Currently Online (${onlinePeers.length}):**\n`;
      onlinePeers.slice(0, 3).forEach(peer => {
        response += `• **${peer.name}** - ${peer.course}\n`;
        if (peer.expertise) response += `  Expertise: ${peer.expertise.slice(0, 2).join(', ')}\n`;
        if (peer.nextSession) response += `  Next session: ${peer.nextSession}\n`;
        response += '\n';
      });
    }
    
    const offlinePeers = coursePeers.filter(p => p.status !== 'online');
    if (offlinePeers.length > 0) {
      response += `\n**📱 Also Available (${offlinePeers.length}):**\n`;
      offlinePeers.slice(0, 2).forEach(peer => {
        response += `• **${peer.name}** - ${peer.course} (${peer.status})\n`;
      });
    }
    
    setCommandResponse(response);
    
    notification.success({
      message: 'Study Partners Found',
      description: `Found ${coursePeers.length} partners for ${course_filter}`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Execute connect peer command
   */
  const executeConnectPeer = async (params) => {
    const { peer_identifier, message, study_topic } = params;
    
    if (!peer_identifier) {
      setCommandResponse("Who would you like to connect with? Example: 'Connect with Alex Chen'");
      return "Please specify a peer name.";
    }
    
    // Find the target peer
    const targetPeer = peers.find(peer => 
      peer.name.toLowerCase().includes(peer_identifier.toLowerCase()) ||
      peer_identifier.toLowerCase().includes(peer.name.toLowerCase())
    );
    
    if (!targetPeer) {
      setCommandResponse(`I couldn't find "${peer_identifier}". Available peers: ${peers.slice(0, 3).map(p => p.name).join(', ')}...`);
      return "Peer not found.";
    }
    
    // Execute connection
    await handleConnect(targetPeer);
    
    // Trigger match animation
    setJustMatched(targetPeer);
    setShowMatchAnimation(true);
    setRecentMatch(targetPeer.id);
    
    setTimeout(() => {
      setShowMatchAnimation(false);
      setRecentMatch(null);
    }, 3000);
    
    const response = `🎉 Successfully connected with **${targetPeer.name}**!${message ? ` Message sent: "${message}"` : ''}\n\n✅ You can now collaborate on ${targetPeer.course} and share study materials.`;
    
    setCommandResponse(response);
    
    notification.success({
      message: 'New Connection!',
      description: `You're now connected with ${targetPeer.name}`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Execute join group command
   */
  const executeJoinGroup = async (params) => {
    const { group_identifier, introduction_message } = params;
    
    if (!group_identifier) {
      setCommandResponse("Which group would you like to join? Example: 'Join CMPSC study group'");
      return "Please specify a group name.";
    }
    
    // Find the target group
    const targetGroup = recommendedGroups.find(group => 
      group.name.toLowerCase().includes(group_identifier.toLowerCase()) ||
      group_identifier.toLowerCase().includes(group.name.toLowerCase())
    );
    
    if (!targetGroup) {
      setCommandResponse(`I couldn't find "${group_identifier}". Available groups: ${recommendedGroups.map(g => g.name).join(', ')}`);
      return "Group not found.";
    }
    
    // Execute join
    await handleJoinGroup(targetGroup);
    
    // Switch to groups tab
    setActiveTab('groups');
    
    const response = `🎊 Welcome to **${targetGroup.name}**!\n\n📅 Next session: ${targetGroup.nextSession || 'TBD'}\n👥 Members: ${targetGroup.members?.length || 0}\n📚 Topics: ${targetGroup.topics?.slice(0, 3).join(', ') || 'Various'}\n\nYou'll receive notifications about upcoming sessions and can participate in group discussions.`;
    
    setCommandResponse(response);
    
    notification.success({
      message: 'Joined Study Group!',
      description: `Welcome to ${targetGroup.name}`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Execute create group command
   */
  const executeCreateGroup = async (params) => {
    const { group_name, course, description, schedule } = params;
    
    if (!group_name || !course) {
      setCommandResponse("I need a group name and course. Example: 'Create MATH 230 study group'");
      return "Missing group name or course.";
    }
    
    const newGroup = {
      id: Date.now(),
      name: group_name,
      course: course,
      description: description || `Study group for ${course}`,
      active: true,
      members: [{ name: 'You', avatar: '/default-avatar.png' }],
      nextSession: schedule || 'TBD'
    };
    
    // Add to groups (this would normally be an API call)
    recommendedGroups.unshift(newGroup);
    setJoinedGroups([...joinedGroups, newGroup.id]);
    setActiveTab('groups');
    
    const response = `✅ **${group_name}** created successfully!\n\n📚 Course: ${course}\n📝 Description: ${newGroup.description}\n👤 You are the group admin\n\nInvite classmates to join and schedule your first study session!`;
    
    setCommandResponse(response);
    
    notification.success({
      message: 'Study Group Created!',
      description: `${group_name} is now ready for members`,
      placement: 'topRight'
    });
    
    return response;
  };

  /**
   * Execute show connections command
   */
  const executeShowConnections = async (params) => {
    const { status_filter } = params;
    
    if (connectedPeers.length === 0) {
      setCommandResponse("You haven't connected with any study partners yet. Use 'Find partners for [course]' to get started!");
      return "No connections found.";
    }
    
    const connectedPeerData = peers.filter(p => connectedPeers.includes(p.id));
    const filteredPeers = status_filter ? 
      connectedPeerData.filter(p => p.status === status_filter) : 
      connectedPeerData;
    
    let response = `**👥 Your Study Connections (${connectedPeerData.length}):**\n\n`;
    
    filteredPeers.slice(0, 5).forEach(peer => {
      const statusIcon = peer.status === 'online' ? '🟢' : '🟡';
      response += `${statusIcon} **${peer.name}** - ${peer.course}\n`;
      if (peer.nextSession) response += `  📅 Next session: ${peer.nextSession}\n`;
      response += '\n';
    });
    
    if (joinedGroups.length > 0) {
      response += `\n**📚 Your Study Groups (${joinedGroups.length}):**\n`;
      const groupData = recommendedGroups.filter(g => joinedGroups.includes(g.id));
      groupData.slice(0, 3).forEach(group => {
        response += `• **${group.name}**\n  📅 Next: ${group.nextSession || 'TBD'}\n`;
      });
    }
    
    setCommandResponse(response);
    return response;
  };

  /**
   * Handle generic peers commands
   */
  const handleGenericPeersCommand = async (commandData) => {
    const response = `Study Peers is ready to help! Try commands like:
    
• "Find study partners for [course]"
• "Connect with [peer name]"
• "Join [group name]"
• "Show my connections"
• "Create a study group for [course]"`;

    setCommandResponse(response);
    return response;
  };

  // Generate unique course list from peers
  const courses = useMemo(() => {
    return ['All', ...new Set(peers.map(peer => peer.course.split(' ')[0]))];
  }, [peers]);
  
  // Filter peers based on search and course filter
  const filteredPeers = useMemo(() => {
    return peers.filter(peer => {
      const matchesSearch = peer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            peer.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (peer.expertise && peer.expertise.some(topic => 
                              topic.toLowerCase().includes(searchQuery.toLowerCase())
                            ));
      
      const matchesCourse = selectedCourse === 'All' || 
                            peer.course.startsWith(selectedCourse);
      
      return matchesSearch && matchesCourse;
    });
  }, [peers, searchQuery, selectedCourse]);
  
  const handleConnect = async (peer) => {
    if (connectedPeers.includes(peer.id)) {
      setConnectedPeers(connectedPeers.filter(id => id !== peer.id));
    } else {
      setConnectedPeers([...connectedPeers, peer.id]);
      
      if (onConnectPeer) {
        await onConnectPeer(peer);
      }
    }
  };

  const handleJoinGroup = async (group) => {
    if (joinedGroups.includes(group.id)) {
      setJoinedGroups(joinedGroups.filter(id => id !== group.id));
    } else {
      setJoinedGroups([...joinedGroups, group.id]);
      
      if (onJoinGroup) {
        await onJoinGroup(group);
      }
    }
  };
  
  return (
    <div className="study-peers">
      <Card
        title={
          <div className="flex items-center">
            <RobotOutlined className="text-[#9981FF] mr-2" />
            <span className="text-white">AI Study Connections</span>
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
                message="Study Peers Command Processed"
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

        <div className="flex mb-4 bg-[#26262F] p-1 rounded-lg">
          <Button 
            type={activeTab === 'peers' ? "primary" : "text"} 
            onClick={() => setActiveTab('peers')}
            block
            style={activeTab === 'peers' ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : { color: 'white' }}
          >
            Peer Matches
          </Button>
          <Button 
            type={activeTab === 'groups' ? "primary" : "text"} 
            onClick={() => setActiveTab('groups')}
            block
            style={activeTab === 'groups' ? { backgroundColor: '#9981FF', borderColor: '#9981FF' } : { color: 'white' }}
          >
            Study Groups
          </Button>
        </div>
        
        {/* Match Animation Overlay */}
        <AnimatePresence>
          {showMatchAnimation && justMatched && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMatchAnimation(false)}
            >
              <motion.div 
                className="bg-[#1F1F2C] p-6 rounded-xl text-center max-w-md"
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <div className="flex justify-center mb-4">
                  <Avatar src={justMatched.avatar} size={80} className="border-4 border-[#9981FF]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">New Connection!</h2>
                <p className="text-lg text-gray-300 mb-4">
                  You've matched with <span className="text-[#9981FF] font-semibold">{justMatched.name}</span>
                </p>
                <p className="text-sm text-gray-400 mb-4">
                Both of you are working on <Tag color="#9981FF">{justMatched.course}</Tag>
                </p>
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />}
                  size="large"
                  style={{ backgroundColor: '#9981FF', borderColor: '#9981FF' }}
                >
                  Start Chatting
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {activeTab === 'peers' && (
          <div className="peers-tab">
            <div className="bg-[#26262F] p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white m-0">Students Working On Similar Tasks</h3>
                <Tag color="#9981FF">
                  <ClockCircleOutlined className="mr-1" /> Live Now
                </Tag>
              </div>
              <p className="text-gray-400 text-sm m-0">
                These students are currently working on similar courses or assignments.
                Connect to form study groups or share notes.
              </p>
            </div>
            
            <div className="mb-4 flex gap-2">
              <Input 
                placeholder="Search peers or topics..." 
                prefix={<SearchOutlined />} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#333] border-0 text-white"
              />
              
              <Select
                value={selectedCourse}
                onChange={setSelectedCourse}
                style={{ width: 120 }}
                className="bg-[#333] text-white"
              >
                {courses.map(course => (
                  <Option key={course} value={course}>
                    {course}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div>
              <AnimatePresence>
                {filteredPeers.map((peer, index) => (
                  <PeerCard 
                    key={peer.id} 
                    peer={peer} 
                    index={index} 
                    onConnect={handleConnect} 
                    connected={connectedPeers.includes(peer.id)}
                    recentMatch={recentMatch}
                  />
                ))}
              </AnimatePresence>
              
              {filteredPeers.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-400">
                      {searchQuery ? "No peers matching your search" : "No peers currently online matching your courses"}
                    </span>
                  }
                  className="my-8"
                />
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'groups' && (
          <div className="groups-tab">
            <div className="bg-[#26262F] p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white m-0">Recommended Study Groups</h3>
                <Tag color="#9981FF">
                  <CalendarOutlined className="mr-1" /> Scheduled Sessions
                </Tag>
              </div>
              <p className="text-gray-400 text-sm m-0">
                Join these study groups to collaborate on assignments, prepare for exams, and boost your learning.
              </p>
            </div>
            
            <div>
              <AnimatePresence>
                {recommendedGroups.map((group, index) => (
                  <StudyGroupCard 
                    key={group.id} 
                    group={group} 
                    index={index} 
                    onJoin={handleJoinGroup}
                    isJoined={joinedGroups.includes(group.id)}
                  />
                ))}
              </AnimatePresence>
              
              {recommendedGroups.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-400">
                      No study groups available. Create one to get started!
                    </span>
                  }
                  className="my-8"
                />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudyPeers;