/**
 * NEW StudyGroupCard Component - Interactive Study Groups Management
 * Replaces the existing Toprightcard with modern study group features
 * @author EduAI Development Team
 */

import React, { useState } from "react";
import { Card, Avatar, Tag, Button, Tooltip, Badge, Empty, Progress } from "antd";
import { 
  TeamOutlined, 
  UserOutlined,
  ClockCircleOutlined,
  FireOutlined,
  PlusOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  TrophyOutlined,
  StarFilled,
  EyeOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StudyGroupCard with active sessions and group management
 */
const StudyGroupCard = ({ 
  studyGroups = [], 
  onOpenPeers, 
  recentActivity = false 
}) => {
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [joinLoading, setJoinLoading] = useState(null);

  // Mock active sessions data - replace with real data
  const mockStudyGroups = studyGroups.length > 0 ? studyGroups : [
    {
      id: 1,
      name: "CMPSC 132 Study Group",
      description: "Data Structures & Algorithms practice",
      nextSession: "Today, 7:00 PM",
      active: true,
      currentTopic: "Binary Trees & Heaps",
      members: [
        { name: "Alex Chen", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1", online: true },
        { name: "Sofia Garcia", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=4", online: true },
        { name: "Raj Patel", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=3", online: false },
        { name: "Maya Johnson", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2", online: true }
      ],
      onlineCount: 3,
      totalMembers: 4,
      rating: 4.8,
      progress: 65
    },
    {
      id: 2,
      name: "MATH 230 Calc Group",
      description: "Multivariable calculus problem solving",
      nextSession: "Tomorrow, 5:30 PM", 
      active: false,
      currentTopic: "Triple Integrals",
      members: [
        { name: "Carlos Rodriguez", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=5", online: false },
        { name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=6", online: false }
      ],
      onlineCount: 0,
      totalMembers: 2,
      rating: 4.5,
      progress: 40
    }
  ];

  const handleJoinSession = async (groupId) => {
    setJoinLoading(groupId);
    // Simulate join delay
    setTimeout(() => {
      setJoinLoading(null);
    }, 1500);
  };

  const cardVariants = {
    hover: { 
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const groupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      scale: 1.03,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="h-full"
    >
      <Card
        className="study-group-card h-full"
        style={{
          background: 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
          border: '1px solid rgba(17, 153, 142, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(17, 153, 142, 0.2)',
          overflow: 'hidden'
        }}
        styles={{ body: { padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' } }}
      >
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <TeamOutlined className="text-teal-400 text-lg" />
              </div>
              <div>
                <h3 className="text-white text-base font-semibold mb-0">
                  Study Groups
                </h3>
                <span className="text-gray-300 text-xs">
                  Active collaborative sessions
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {recentActivity && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                />
              )}
              <Badge dot={mockStudyGroups.some(g => g.active)}>
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={onOpenPeers}
                  className="text-gray-300 hover:text-teal-400"
                />
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="text-teal-400 text-sm font-bold">
                {mockStudyGroups.filter(g => g.active).length}
              </div>
              <div className="text-gray-300 text-xs">Active Now</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="text-orange-400 text-sm font-bold">
                {mockStudyGroups.reduce((sum, g) => sum + (g.onlineCount || 0), 0)}
              </div>
              <div className="text-gray-300 text-xs">Online</div>
            </div>
          </div>
        </div>

        {/* Study Groups List */}
        <div className="flex-1 min-h-0">
          <div className="space-y-3 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-teal-600 scrollbar-track-transparent">
            <AnimatePresence>
              {mockStudyGroups.length > 0 ? mockStudyGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  variants={groupVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                  className={`
                    group-card p-4 rounded-xl cursor-pointer transition-all duration-200 
                    ${group.active 
                      ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-400/30' 
                      : 'bg-gray-800/40 border border-gray-600/30 hover:border-gray-500/50'
                    }
                  `}
                  onMouseEnter={() => setHoveredGroup(group.id)}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  {/* Group Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white text-sm font-semibold truncate">
                          {group.name}
                        </h4>
                        {group.active && (
                          <Badge status="processing" />
                        )}
                        <div className="flex items-center gap-1">
                          <StarFilled className="text-yellow-500 text-xs" />
                          <span className="text-yellow-500 text-xs">{group.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-xs mb-2 truncate">
                        {group.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <ClockCircleOutlined />
                        <span>{group.nextSession}</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Topic */}
                  {group.active && group.currentTopic && (
                    <div className="mb-3 p-2 bg-black/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <FireOutlined className="text-orange-400 text-xs" />
                        <span className="text-orange-300 text-xs font-medium">Live Topic</span>
                      </div>
                      <span className="text-white text-xs">{group.currentTopic}</span>
                    </div>
                  )}

                  {/* Members */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar.Group
                        max={{ 
                          count: 3,
                          style: { color: '#f56a00', backgroundColor: '#fde3cf', fontSize: '10px' }
                        }}
                        size="small"
                      >
                        {Array.isArray(group.members) ? group.members.map((member, idx) => (
                          <Tooltip key={idx} title={member.name} placement="top">
                            <Avatar 
                              size="small" 
                              src={member.avatar}
                              style={{ 
                                border: member.online ? '2px solid #52c41a' : '1px solid #666',
                              }}
                            />
                          </Tooltip>
                        )) : null}
                      </Avatar.Group>
                      <span className="text-gray-300 text-xs">
                        {group.onlineCount}/{group.totalMembers} online
                      </span>
                    </div>

                    {/* Progress */}
                    {group.progress > 0 && (
                      <div className="flex items-center gap-2">
                        <Progress
                          percent={group.progress}
                          size="small"
                          strokeColor="#11998e"
                          showInfo={false}
                          className="w-12"
                        />
                        <span className="text-teal-400 text-xs">{group.progress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {group.active && (
                        <Tag size="small" color="green" icon={<VideoCameraOutlined />}>
                          LIVE
                        </Tag>
                      )}
                      <Tag size="small" color="blue">
                        {Array.isArray(group.members) ? group.members.length : 0} members
                      </Tag>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="text"
                        size="small"
                        icon={<MessageOutlined />}
                        className="text-gray-400 hover:text-white opacity-60 hover:opacity-100"
                      />
                      
                      <Button
                        type={group.active ? "primary" : "text"}
                        size="small"
                        loading={joinLoading === group.id}
                        onClick={() => handleJoinSession(group.id)}
                        className={group.active ? "bg-teal-500 border-teal-500" : "text-gray-400 hover:text-white"}
                        style={group.active ? { backgroundColor: '#11998e', borderColor: '#11998e' } : {}}
                      >
                        {group.active ? "Join" : "Schedule"}
                      </Button>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  {hoveredGroup === group.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/5 rounded-xl pointer-events-none"
                    />
                  )}
                </motion.div>
              )) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <Empty
                    image={<TeamOutlined className="text-4xl text-gray-600" />}
                    description={
                      <div className="text-center">
                        <div className="text-gray-300 mb-2">No study groups yet</div>
                        <div className="text-xs text-gray-400">Join or create your first group</div>
                      </div>
                    }
                    imageStyle={{ height: 40 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-3 border-t border-teal-500/20 flex-shrink-0"
        >
          <Button
            block
            type="dashed"
            icon={<PlusOutlined />}
            onClick={onOpenPeers}
            className="text-teal-400 border-teal-400/50 hover:text-white hover:border-teal-400"
          >
            Find More Groups
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default StudyGroupCard;