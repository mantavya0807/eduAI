import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Select, Button, Card, Avatar, Tag, Switch, Slider, Divider, InputNumber } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  BookOutlined, 
  ClockCircleOutlined,
  BellOutlined,
  LockOutlined,
  BarChartOutlined,
  SaveOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const ProfileSettingsModal = ({ visible, onClose, userData }) => {
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();
  
  // Default user data if none provided
  const user = userData || {
    name: "Keshav Khandelwal",
    email: "kk5431@psu.edu",
    preferences: {
      dailyStudyHours: 4,
      preferredStudyTime: "evening",
      difficultyAdjustment: 1.1,
      focusAdjustment: 0.9
    },
    courses: [
      { id: 1, name: "CMPSC 221", difficulty: 8, focus: 7 },
      { id: 2, name: "CMPSC 360", difficulty: 9, focus: 8 },
      { id: 3, name: "MATH 141", difficulty: 7, focus: 6 },
      { id: 4, name: "PHYS 212", difficulty: 8, focus: 7 },
      { id: 5, name: "ENGL 202C", difficulty: 5, focus: 5 }
    ],
    notifications: {
      deadlineReminders: true,
      studyReminders: true,
      peerActivity: false,
      progressReports: true
    }
  };
  
  const handleFormSubmit = (values) => {
    console.log('Form submitted:', values);
    // Here you would save the user preferences
    // For demo purposes, just show a success message
    
    // Close the modal
    setTimeout(() => {
      onClose();
    }, 1000);
  };
  
  return (
    <Modal
      title={
        <div className="flex items-center">
          <UserOutlined className="text-[#9981FF] mr-2" />
          <span>Profile & Settings</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <UserOutlined /> Profile
            </span>
          } 
          key="1"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Card className="bg-[#26262F] border-0">
                <div className="flex flex-col items-center text-center">
                  <Avatar size={100} src="https://api.dicebear.com/7.x/miniavs/svg?seed=kk5431" />
                  <h2 className="text-white text-xl mt-4">{user.name}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  
                  <Divider className="bg-gray-700" />
                  
                  <div className="w-full mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Study Streak</span>
                      <span className="text-[#9981FF]">5 days</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Study Hours</span>
                      <span className="text-[#9981FF]">124 hours</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Tasks Completed</span>
                      <span className="text-[#9981FF]">42/78</span>
                    </div>
                  </div>
                  
                  <Button 
                    icon={<LogoutOutlined />} 
                    danger
                    ghost
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </Card>
            </div>
            
            <div className="col-span-2">
              <Card className="bg-[#26262F] border-0 h-full">
                <h3 className="text-white text-lg mb-4">Personal Information</h3>
                
                <Form
                  layout="vertical"
                  initialValues={{
                    name: user.name,
                    email: user.email,
                    timezone: "America/New_York",
                    language: "english"
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item 
                      label={<span className="text-gray-300">Full Name</span>} 
                      name="name"
                    >
                      <Input className="bg-[#333] border-0 text-white" />
                    </Form.Item>
                    
                    <Form.Item 
                      label={<span className="text-gray-300">Email</span>} 
                      name="email"
                    >
                      <Input className="bg-[#333] border-0 text-white" disabled />
                    </Form.Item>
                    
                    <Form.Item 
                      label={<span className="text-gray-300">Timezone</span>} 
                      name="timezone"
                    >
                      <Select className="bg-[#333] text-white">
                        <Option value="America/New_York">Eastern Time (ET)</Option>
                        <Option value="America/Chicago">Central Time (CT)</Option>
                        <Option value="America/Denver">Mountain Time (MT)</Option>
                        <Option value="America/Los_Angeles">Pacific Time (PT)</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item 
                      label={<span className="text-gray-300">Language</span>} 
                      name="language"
                    >
                      <Select className="bg-[#333] text-white">
                        <Option value="english">English</Option>
                        <Option value="spanish">Spanish</Option>
                        <Option value="french">French</Option>
                        <Option value="german">German</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      className="bg-[#9981FF]"
                    >
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>
          </div>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SettingOutlined /> Preferences
            </span>
          } 
          key="2"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              dailyStudyHours: user.preferences.dailyStudyHours,
              preferredStudyTime: user.preferences.preferredStudyTime,
              difficultyAdjustment: user.preferences.difficultyAdjustment * 10,
              focusAdjustment: user.preferences.focusAdjustment * 10
            }}
            onFinish={handleFormSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#26262F] border-0">
                <h3 className="text-white text-lg mb-4">Study Preferences</h3>
                
                <Form.Item 
                  label={<span className="text-gray-300">Daily Study Hours Target</span>}
                  name="dailyStudyHours"
                >
                  <Slider 
                    min={1} 
                    max={12} 
                    marks={{
                      1: '1h',
                      4: '4h',
                      8: '8h',
                      12: '12h'
                    }}
                    className="text-white"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={<span className="text-gray-300">Preferred Study Time</span>}
                  name="preferredStudyTime"
                >
                  <Select className="bg-[#333] text-white">
                    <Option value="morning">Morning (5AM - 12PM)</Option>
                    <Option value="afternoon">Afternoon (12PM - 5PM)</Option>
                    <Option value="evening">Evening (5PM - 10PM)</Option>
                    <Option value="night">Night (10PM - 5AM)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item 
                  label={<span className="text-gray-300">Difficulty Adjustment Factor</span>}
                  tooltip="Higher values mean tasks will be estimated to take more time"
                  name="difficultyAdjustment"
                >
                  <Slider 
                    min={5} 
                    max={15} 
                    marks={{
                      5: '0.5x',
                      10: '1.0x',
                      15: '1.5x'
                    }}
                    className="text-white"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={<span className="text-gray-300">Focus Adjustment Factor</span>}
                  tooltip="Lower values mean you expect to be more focused"
                  name="focusAdjustment"
                >
                  <Slider 
                    min={5} 
                    max={15} 
                    marks={{
                      5: '0.5x',
                      10: '1.0x',
                      15: '1.5x'
                    }}
                    className="text-white"
                  />
                </Form.Item>
              </Card>
              
              <Card className="bg-[#26262F] border-0">
                <h3 className="text-white text-lg mb-4">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white">Deadline Reminders</h4>
                      <p className="text-gray-400 text-sm">Get notified when deadlines are approaching</p>
                    </div>
                    <Form.Item name="deadlineReminders" valuePropName="checked" noStyle>
                      <Switch defaultChecked={user.notifications.deadlineReminders} />
                    </Form.Item>
                  </div>
                  
                  <Divider className="bg-gray-700 my-2" />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white">Study Reminders</h4>
                      <p className="text-gray-400 text-sm">Reminders for your scheduled study sessions</p>
                    </div>
                    <Form.Item name="studyReminders" valuePropName="checked" noStyle>
                      <Switch defaultChecked={user.notifications.studyReminders} />
                    </Form.Item>
                  </div>
                  
                  <Divider className="bg-gray-700 my-2" />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white">Peer Activity</h4>
                      <p className="text-gray-400 text-sm">Notifications when peers are online or studying</p>
                    </div>
                    <Form.Item name="peerActivity" valuePropName="checked" noStyle>
                      <Switch defaultChecked={user.notifications.peerActivity} />
                    </Form.Item>
                  </div>
                  
                  <Divider className="bg-gray-700 my-2" />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white">Progress Reports</h4>
                      <p className="text-gray-400 text-sm">Weekly reports on your academic progress</p>
                    </div>
                    <Form.Item name="progressReports" valuePropName="checked" noStyle>
                      <Switch defaultChecked={user.notifications.progressReports} />
                    </Form.Item>
                  </div>
                </div>
              </Card>
            </div>
            
            <Form.Item className="mt-6">
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
                className="bg-[#9981FF]"
              >
                Save Preferences
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <BookOutlined /> Courses
            </span>
          } 
          key="3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#26262F] border-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg">My Courses</h3>
                <Button 
                  type="primary" 
                  size="small"
                  className="bg-[#9981FF]"
                >
                  Add Course
                </Button>
              </div>
              
              <div className="space-y-4">
                {user.courses.map(course => (
                  <Card 
                    key={course.id}
                    className="bg-[#333] border-0"
                    size="small"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white">{course.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Tag color="#9981FF">Difficulty: {course.difficulty}/10</Tag>
                          <Tag color="#9981FF">Focus: {course.focus}/10</Tag>
                        </div>
                      </div>
                      <Button 
                        type="text" 
                        size="small"
                        danger
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
            
            <Card className="bg-[#26262F] border-0">
              <h3 className="text-white text-lg mb-4">Course Settings</h3>
              
              <Form layout="vertical">
                <Form.Item 
                  label={<span className="text-gray-300">Selected Course</span>}
                  name="selectedCourse"
                >
                  <Select 
                    className="bg-[#333] text-white"
                    placeholder="Select a course to edit"
                  >
                    {user.courses.map(course => (
                      <Option key={course.id} value={course.id}>{course.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item 
                  label={<span className="text-gray-300">Difficulty Level</span>}
                  name="difficulty"
                  tooltip="How challenging is this course for you (1-10)"
                >
                  <Slider 
                    min={1} 
                    max={10} 
                    marks={{
                      1: 'Easy',
                      5: 'Medium',
                      10: 'Hard'
                    }}
                    className="text-white"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={<span className="text-gray-300">Focus Level</span>}
                  name="focus"
                  tooltip="How much focus do you typically have for this subject (1-10)"
                >
                  <Slider 
                    min={1} 
                    max={10} 
                    marks={{
                      1: 'Low',
                      5: 'Medium',
                      10: 'High'
                    }}
                    className="text-white"
                  />
                </Form.Item>
                
                <Form.Item 
                  label={<span className="text-gray-300">Time per Assignment</span>}
                  name="baseTime"
                  tooltip="Average time for assignments in this course"
                >
                  <InputNumber 
                    className="bg-[#333] border-0 text-white w-full"
                    addonAfter="hours" 
                    min={0.5}
                    max={10}
                    step={0.5}
                  />
                </Form.Item>
                
                <Form.Item 
                  label={<span className="text-gray-300">Default Priority</span>}
                  name="priority"
                >
                  <Select className="bg-[#333] text-white">
                    <Option value="high">High</Option>
                    <Option value="medium">Medium</Option>
                    <Option value="low">Low</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />}
                    className="bg-[#9981FF]"
                  >
                    Save Course Settings
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ProfileSettingsModal;