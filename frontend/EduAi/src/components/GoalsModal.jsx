import React, { useState } from 'react';
import { Modal, Card, Button, Progress, Tag, Divider, Input, Select, DatePicker, Form, Tooltip } from 'antd';
import { 
  FlagOutlined, 
  TrophyOutlined, 
  CheckCircleOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  FireOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Option } = Select;
const { TextArea } = Input;

const GoalsModal = ({ visible, onClose, goals = [] }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form] = Form.useForm();
  
  // Sample goals data if none provided
  const defaultGoals = [
    {
      id: 1,
      title: "Get an A in CMPSC 221",
      description: "Aim for a final grade of A in Object Oriented Programming",
      type: "grade",
      deadline: "2025-05-02",
      progress: 75,
      status: "in-progress"
    },
    {
      id: 2,
      title: "Complete MATH 230 final project",
      description: "Finish the multi-variable calculus visualization project",
      type: "project",
      deadline: "2025-04-28",
      progress: 30,
      status: "in-progress"
    },
    {
      id: 3,
      title: "Study 25 hours per week",
      description: "Maintain a consistent study schedule of 25 hours weekly",
      type: "habit",
      deadline: "ongoing",
      progress: 80,
      status: "in-progress"
    },
    {
      id: 4,
      title: "Improve focus during study sessions",
      description: "Use pomodoro technique to boost focus and productivity",
      type: "improvement",
      deadline: "2025-04-15",
      progress: 60,
      status: "in-progress"
    },
    {
      id: 5,
      title: "Complete Data Structures course on Coursera",
      description: "Finish the supplementary online course",
      type: "learning",
      deadline: "2025-04-30",
      progress: 45,
      status: "in-progress"
    }
  ];
  
  const goalsList = goals.length > 0 ? goals : defaultGoals;
  
  // Filter goals based on active tab
  const filteredGoals = goalsList.filter(goal => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return goal.progress === 100;
    if (activeTab === 'in-progress') return goal.progress < 100;
    if (activeTab === 'grade') return goal.type === 'grade';
    if (activeTab === 'habit') return goal.type === 'habit';
    return goal.type === activeTab;
  });
  
  // Get color based on goal type
  const getGoalColor = (type) => {
    switch(type) {
      case 'grade': return '#9981FF';
      case 'project': return '#ff7a45';
      case 'habit': return '#52c41a';
      case 'improvement': return '#faad14';
      case 'learning': return '#13c2c2';
      default: return '#9981FF';
    }
  };
  
  // Get icon based on goal type
  const getGoalIcon = (type) => {
    switch(type) {
      case 'grade': return <TrophyOutlined />;
      case 'project': return <FlagOutlined />;
      case 'habit': return <FireOutlined />;
      case 'improvement': return <BarChartOutlined />;
      case 'learning': return <InfoCircleOutlined />;
      default: return <FlagOutlined />;
    }
  };
  
  // Handle form submission for adding a new goal
  const handleAddGoal = (values) => {
    // Here you would add the new goal
    console.log('New goal:', values);
    
    // Close the form
    setShowAddForm(false);
    form.resetFields();
  };
  
  return (
    <Modal
      title={
        <div className="flex items-center">
          <FlagOutlined className="text-[#9981FF] mr-2" />
          <span>Academic Goals</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
    >
      <div className="mb-6 bg-[#26262F] p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-white text-lg mb-1">Your Goals Dashboard</h3>
            <p className="text-gray-400">Track your academic goals and measure your progress</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddForm(true)}
            className="bg-[#9981FF]"
          >
            Add New Goal
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            type={activeTab === 'all' ? 'primary' : 'default'}
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'bg-[#9981FF]' : 'bg-[#333] text-white border-0'}
          >
            All Goals
          </Button>
          <Button 
            type={activeTab === 'in-progress' ? 'primary' : 'default'}
            onClick={() => setActiveTab('in-progress')}
            className={activeTab === 'in-progress' ? 'bg-[#9981FF]' : 'bg-[#333] text-white border-0'}
          >
            In Progress
          </Button>
          <Button 
            type={activeTab === 'completed' ? 'primary' : 'default'}
            onClick={() => setActiveTab('completed')}
            className={activeTab === 'completed' ? 'bg-[#9981FF]' : 'bg-[#333] text-white border-0'}
          >
            Completed
          </Button>
          <Button 
            type={activeTab === 'grade' ? 'primary' : 'default'}
            onClick={() => setActiveTab('grade')}
            className={activeTab === 'grade' ? 'bg-[#9981FF]' : 'bg-[#333] text-white border-0'}
          >
            Grade Goals
          </Button>
          <Button 
            type={activeTab === 'habit' ? 'primary' : 'default'}
            onClick={() => setActiveTab('habit')}
            className={activeTab === 'habit' ? 'bg-[#9981FF]' : 'bg-[#333] text-white border-0'}
          >
            Study Habits
          </Button>
        </div>
      </div>
      
      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="bg-[#26262F] border-0">
              <h3 className="text-white text-lg mb-4">Add New Goal</h3>
              
              <Form
                form={form}
                layout="vertical"
                onFinish={handleAddGoal}
                initialValues={{
                  type: 'grade',
                  progress: 0
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item 
                    label={<span className="text-gray-300">Goal Title</span>}
                    name="title"
                    rules={[{ required: true, message: 'Please enter a title' }]}
                  >
                    <Input className="bg-[#333] border-0 text-white" placeholder="E.g., Get an A in CMPSC 221" />
                  </Form.Item>
                  
                  <Form.Item 
                    label={<span className="text-gray-300">Goal Type</span>}
                    name="type"
                    rules={[{ required: true, message: 'Please select a type' }]}
                  >
                    <Select className="bg-[#333] border-0 text-white">
                      <Option value="grade">Grade Goal</Option>
                      <Option value="project">Project Completion</Option>
                      <Option value="habit">Study Habit</Option>
                      <Option value="improvement">Skill Improvement</Option>
                      <Option value="learning">Learning Goal</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item 
                    label={<span className="text-gray-300">Description</span>}
                    name="description"
                    className="col-span-2"
                  >
                    <TextArea 
                      className="bg-[#333] border-0 text-white" 
                      rows={3} 
                      placeholder="Describe your goal and how you plan to achieve it"
                    />
                  </Form.Item>
                  
                  <Form.Item 
                    label={<span className="text-gray-300">Deadline</span>}
                    name="deadline"
                  >
                    <DatePicker className="bg-[#333] border-0 text-white w-full" />
                  </Form.Item>
                  
                  <Form.Item 
                    label={<span className="text-gray-300">Current Progress</span>}
                    name="progress"
                  >
                    <div className="flex items-center">
                      <Progress 
                        percent={form.getFieldValue('progress') || 0} 
                        strokeColor="#9981FF"
                        className="flex-1 mr-2"
                      />
                      <Input 
                        type="number" 
                        min={0} 
                        max={100} 
                        className="bg-[#333] border-0 text-white w-20"
                        onChange={e => form.setFieldsValue({ progress: parseInt(e.target.value) })}
                      />
                    </div>
                  </Form.Item>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    onClick={() => setShowAddForm(false)}
                    className="bg-[#333] text-white border-0"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    className="bg-[#9981FF]"
                  >
                    Add Goal
                  </Button>
                </div>
              </Form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="bg-[#26262F] border-0 h-full"
                styles={{ body: { padding: '16px' } }}
                actions={[
                  <Button type="text" icon={<EditOutlined />} className="text-white" />,
                  <Button type="text" icon={<DeleteOutlined />} className="text-white" />
                ]}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="p-2 rounded-full"
                    style={{ backgroundColor: `${getGoalColor(goal.type)}30` }}
                  >
                    <span style={{ color: getGoalColor(goal.type) }}>
                      {getGoalIcon(goal.type)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white text-lg">{goal.title}</h3>
                    <Tag color={getGoalColor(goal.type)}>
                      {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                    </Tag>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-4">{goal.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-white">{goal.progress}%</span>
                  </div>
                  <Progress 
                    percent={goal.progress} 
                    strokeColor={getGoalColor(goal.type)} 
                    showInfo={false}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-400">
                  <div>
                    {goal.deadline === 'ongoing' ? (
                      <span>Ongoing</span>
                    ) : (
                      <span>Due: {goal.deadline}</span>
                    )}
                  </div>
                  <div>
                    {goal.progress === 100 ? (
                      <span className="flex items-center text-green-500">
                        <CheckCircleOutlined className="mr-1" /> Completed
                      </span>
                    ) : (
                      <span>In Progress</span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredGoals.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-[#26262F] rounded-lg">
            <FlagOutlined style={{ fontSize: 48 }} className="text-gray-500 mb-4" />
            <h3 className="text-white text-lg mb-2">No goals found</h3>
            <p className="text-gray-400">Try changing your filter or adding a new goal.</p>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-[#9981FF]"
            >
              Add New Goal
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-[#26262F] p-4 rounded-lg">
        <h3 className="text-white text-lg mb-3">Goal Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#333] border-0">
            <Statistic
              title={<span className="text-gray-400">Total Goals</span>}
              value={goalsList.length}
              className="text-white"
            />
          </Card>
          
          <Card className="bg-[#333] border-0">
            <Statistic
              title={<span className="text-gray-400">Completed</span>}
              value={goalsList.filter(g => g.progress === 100).length}
              className="text-white"
              suffix={`/${goalsList.length}`}
            />
          </Card>
          
          <Card className="bg-[#333] border-0">
            <Statistic
              title={<span className="text-gray-400">In Progress</span>}
              value={goalsList.filter(g => g.progress < 100).length}
              className="text-white"
              valueStyle={{ color: '#9981FF' }}
            />
          </Card>
          
          <Card className="bg-[#333] border-0">
            <Statistic
              title={<span className="text-gray-400">Average Progress</span>}
              value={Math.round(goalsList.reduce((sum, goal) => sum + goal.progress, 0) / goalsList.length)}
              suffix="%"
              className="text-white"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </div>
      </div>
    </Modal>
  );
};

const Statistic = ({ title, value, suffix, valueStyle, className }) => {
  return (
    <div className={className}>
      <div className="text-sm mb-1">{title}</div>
      <div className="text-xl font-semibold" style={valueStyle}>
        {value}{suffix}
      </div>
    </div>
  );
};

export default GoalsModal;