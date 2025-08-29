/**
 * NEW PeerNetworkCard Component - Interactive Peer Network with Chat
 * Replaces existing Middlerightcard with modern peer connection features
 * @author EduAI Development Team
 */

import React, { useState } from "react";
import { Card, Avatar, Button, Input, Badge, Tooltip, Tag, Empty } from "antd";
import { 
  UserSwitchOutlined,
  MessageOutlined,
  SendOutlined,
  UserAddOutlined,
  StarOutlined,
  BookOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PeerNetworkCard with real-time chat and peer discovery
 */
const PeerNetworkCard = ({ 
  peers = [], 
  onOpenPeers, 
  tasks = [], 
  onTaskMove 
}) => {
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({});

  // Mock peers data - replace with real data
  const mockPeers = peers.length > 0 ? peers : [
    {
      id: 1,
      name: "Alex Chen",
      course: "CMPSC 132",
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
      online: true,
      status: "Studying Data Structures",
      rating: 4.9,
      commonCourses: ["CMPSC 132", "MATH 230"],
      lastSeen: "now",
      studyPartner: true
    },
    {
      id: 2,
      name: "Sofia Garcia", 
      course: "MATH 230",
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=4",
      online: true,
      status: "Working on calculus",
      rating: 4.7,
      commonCourses: ["MATH 230"],
      lastSeen: "2 min ago",
      studyPartner: false
    },
    {
      id: 3,
      name: "Maya Johnson",
      course: "PHYS 211",
      avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2", 
      online: false,
      status: "Available for study group",
      rating: 4.8,
      commonCourses: ["PHYS 211"],
      lastSeen: "1 hour ago",
      studyPartner: true
    }
  ];

  // Mock chat messages
  const mockMessages = {
    1: [
      { id: 1, text: "Hey! Working on the binary tree assignment?", isUser: false, timestamp: "2:30 PM" },
      { id: 2, text: "Yes! Having trouble with the deletion method", isUser: true, timestamp: "2:31 PM" },
      { id: 3, text: "I can help! Want to do a quick study session?", isUser: false, timestamp: "2:32 PM" }
    ],
    2: [
      { id: 1, text: "How's the calculus homework going?", isUser: false, timestamp: "1:15 PM" },
      { id: 2, text: "Struggling with triple integrals 😅", isUser: true, timestamp: "1:16 PM" }
    ],
    3: []
  };

  const handleSendMessage = (peerId) => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      text: newMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => ({
      ...prev,
      [peerId]: [...(prev[peerId] || mockMessages[peerId] || []), message]
    }));
    
    setNewMessage("");
  };

  const handleChatOpen = (peer) => {
    setActiveChat(peer);
    if (!messages[peer.id]) {
      setMessages(prev => ({
        ...prev,
        [peer.id]: mockMessages[peer.id] || []
      }));
    }
  };

  const cardVariants = {
    hover: { 
      scale: 1.01,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  const peerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    hover: { 
      scale: 1.02,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  const chatVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="h-full"
    >
      <Card
        className="peer-network-card h-full relative"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '1px solid rgba(118, 75, 162, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(118, 75, 162, 0.2)',
          overflow: 'hidden'
        }}
        bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <UserSwitchOutlined className="text-indigo-300 text-lg" />
              </div>
              <div>
                <h3 className="text-white text-base font-semibold mb-0">
                  Study Network
                </h3>
                <span className="text-indigo-100 text-xs">
                  {mockPeers.filter(p => p.online).length} peers online
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge count={mockPeers.filter(p => p.online).length} size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={onOpenPeers}
                  className="text-indigo-200 hover:text-white"
                />
              </Badge>
            </div>
          </div>
        </div>

        {/* Peers List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {!activeChat ? (
            <div className="space-y-3 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-transparent">
              <AnimatePresence>
                {mockPeers.length > 0 ? mockPeers.map((peer, index) => (
                  <motion.div
                    key={peer.id}
                    variants={peerVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                    className="peer-card p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 cursor-pointer transition-all duration-200 hover:bg-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar 
                          size="large" 
                          src={peer.avatar}
                          className="border-2 border-white/30"
                        />
                        {peer.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white text-sm font-semibold truncate">
                            {peer.name}
                          </h4>
                          {peer.studyPartner && (
                            <StarOutlined className="text-yellow-400 text-xs" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <Tag size="small" color="blue" className="text-xs">
                            {peer.course}
                          </Tag>
                          <span className="text-indigo-200 text-xs">{peer.rating}★</span>
                        </div>
                        
                        <p className="text-indigo-100 text-xs truncate mb-1">
                          {peer.status}
                        </p>
                        
                        <div className="flex items-center gap-1 text-xs">
                          {(peer.commonCourses || []).map((course, idx) => (
                            <Tag key={idx} size="small" color="purple" style={{ fontSize: '10px', margin: '0 2px 0 0' }}>
                              {course}
                            </Tag>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <Tooltip title="Start chat">
                          <Button
                            type="text"
                            size="small"
                            icon={<MessageOutlined />}
                            onClick={() => handleChatOpen(peer)}
                            className="text-indigo-200 hover:text-white hover:bg-white/20"
                          />
                        </Tooltip>
                        
                        <div className="text-xs text-indigo-300">
                          {peer.online ? <CheckCircleOutlined /> : peer.lastSeen}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <Empty
                      image={<UserSwitchOutlined className="text-4xl text-indigo-400" />}
                      description={
                        <div className="text-center">
                          <div className="text-indigo-100 mb-2">No peers connected</div>
                          <div className="text-xs text-indigo-300">Find study partners to get started</div>
                        </div>
                      }
                      imageStyle={{ height: 40 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Chat Interface */
            <AnimatePresence>
              <motion.div
                variants={chatVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="h-full flex flex-col"
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-3 p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      size="small" 
                      src={activeChat.avatar}
                    />
                    <div>
                      <h4 className="text-white text-sm font-semibold mb-0">
                        {activeChat.name}
                      </h4>
                      <span className="text-indigo-200 text-xs">
                        {activeChat.online ? "Online" : `Last seen ${activeChat.lastSeen}`}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => setActiveChat(null)}
                    className="text-indigo-200 hover:text-white"
                  />
                </div>

                {/* Messages */}
                <div className="flex-1 min-h-0 mb-3 p-2 bg-black/20 rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-transparent">
                  <div className="space-y-2">
                    {(messages[activeChat.id] || []).map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[80%] p-2 rounded-lg text-sm
                            ${message.isUser 
                              ? 'bg-indigo-500 text-white' 
                              : 'bg-white text-gray-800'
                            }
                          `}
                        >
                          <div>{message.text}</div>
                          <div className={`text-xs mt-1 opacity-70`}>
                            {message.timestamp}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex items-center gap-2">
                  <Input
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPressEnter={() => handleSendMessage(activeChat.id)}
                    className="bg-white/20 border-white/30 text-white placeholder-indigo-200"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<SendOutlined />}
                    onClick={() => handleSendMessage(activeChat.id)}
                    className="bg-indigo-500 border-indigo-500"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {!activeChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 pt-3 border-t border-white/20 flex-shrink-0"
          >
            <Button
              block
              type="dashed"
              size="small"
              icon={<UserAddOutlined />}
              onClick={onOpenPeers}
              className="text-indigo-200 border-indigo-300/50 hover:text-white hover:border-indigo-200"
            >
              Find Study Partners
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default PeerNetworkCard;