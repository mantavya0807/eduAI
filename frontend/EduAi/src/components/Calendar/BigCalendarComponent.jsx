/**
 * Enhanced BigCalendarComponent with Real-time Schedule Updates
 * Properly handles schedule data structure and immediate updates
 * @author EduAI Development Team
 */

import React, { useState, useEffect, useMemo } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  setHours,
  setMinutes,
  parseISO,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import { Button, notification, Modal, Form, Input, TimePicker, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { confirm } = Modal;

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

/**
 * Convert time string (HH:MM) to Date object for calendar
 */
const timeStringToDate = (dateStr, timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = parseISO(dateStr);
  return setMinutes(setHours(date, hours), minutes);
};

/**
 * Get priority color for events
 */
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return '#ff4d4f'; // Red
    case 'medium':
      return '#faad14'; // Orange
    case 'low':
      return '#52c41a'; // Green
    default:
      return '#1890ff'; // Blue
  }
};

/**
 * Enhanced BigCalendarComponent with proper schedule handling
 * Can receive either `schedule` or `events` props (backwards compatible)
 */
const BigCalendarComponent = ({ 
  schedule,
  events,
  onScheduleUpdate,
  modalData = {},
  visible = true,
  onClose
}) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  // Use schedule if provided, otherwise fall back to events
  const currentSchedule = schedule || events || {};

  // Force component refresh when modalData.forceRefresh changes
  useEffect(() => {
    if (modalData.forceRefresh) {
      console.log("🔄 Calendar force refresh triggered");
    }
  }, [modalData.forceRefresh]);

  /**
   * Transform schedule data to calendar events format
   * Handles both schedule format and legacy events format
   */
  const calendarEvents = useMemo(() => {
    console.log("📅 Transforming schedule data:", currentSchedule);
    
    if (!currentSchedule || typeof currentSchedule !== 'object') {
      return [];
    }

    const events = [];
    
    Object.entries(currentSchedule).forEach(([dateStr, dayEvents]) => {
      if (Array.isArray(dayEvents)) {
        dayEvents.forEach((event, index) => {
          try {
            // Handle both object events and string events
            if (typeof event === 'string') {
              // Legacy format - just a string
              const calendarEvent = {
                id: `${dateStr}-${index}`,
                title: event,
                start: timeStringToDate(dateStr, "09:00"),
                end: timeStringToDate(dateStr, "10:00"),
                resource: {
                  dateStr,
                  originalIndex: index,
                  priority: 'medium',
                  type: 'event'
                }
              };
              events.push(calendarEvent);
            } else {
              // New format - object with detailed information
              const startTime = event.start_time || "09:00";
              const endTime = event.end_time || "10:00";
              
              const calendarEvent = {
                id: `${dateStr}-${index}`,
                title: event.title || "Untitled Event",
                start: timeStringToDate(dateStr, startTime),
                end: timeStringToDate(dateStr, endTime),
                resource: {
                  ...event,
                  dateStr,
                  originalIndex: index,
                  priority: event.priority || 'medium',
                  type: event.type || 'event'
                }
              };
              
              events.push(calendarEvent);
            }
          } catch (error) {
            console.error("Error parsing event:", event, error);
          }
        });
      }
    });
    
    console.log("🎯 Generated calendar events:", events);
    return events;
  }, [currentSchedule, modalData.forceRefresh]);

  /**
   * Handle event selection
   */
  const handleSelectEvent = (event) => {
    console.log("📌 Selected event:", event);
    setSelectedEvent(event);
    setIsEditing(true);
    
    // Populate form with event data
    eventForm.setFieldsValue({
      title: event.title,
      type: event.resource.type,
      priority: event.resource.priority,
      start_time: dayjs(event.start),
      end_time: dayjs(event.end)
    });
    
    setShowEventModal(true);
  };

  /**
   * Handle slot selection (create new event)
   */
  const handleSelectSlot = ({ start, end }) => {
    console.log("🆕 Creating new event for slot:", start, end);
    setSelectedEvent(null);
    setIsEditing(false);
    
    // Pre-populate form with slot data
    eventForm.setFieldsValue({
      title: "New Event",
      type: "study",
      priority: "medium",
      start_time: dayjs(start),
      end_time: dayjs(end)
    });
    
    setShowEventModal(true);
  };

  /**
   * Save event (create or update)
   */
  const handleSaveEvent = async () => {
    try {
      const values = await eventForm.validateFields();
      const dateStr = selectedEvent 
        ? selectedEvent.resource.dateStr 
        : format(values.start_time.toDate(), 'yyyy-MM-dd');
      
      const newEvent = {
        title: values.title,
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm'),
        type: values.type,
        priority: values.priority
      };

      // Update schedule
      const updatedSchedule = { ...currentSchedule };
      
      if (!updatedSchedule[dateStr]) {
        updatedSchedule[dateStr] = [];
      }

      if (isEditing && selectedEvent) {
        // Update existing event
        const eventIndex = selectedEvent.resource.originalIndex;
        updatedSchedule[dateStr][eventIndex] = newEvent;
        
        notification.success({
          message: 'Event Updated',
          description: `${newEvent.title} has been updated successfully.`,
        });
      } else {
        // Add new event
        updatedSchedule[dateStr].push(newEvent);
        
        notification.success({
          message: 'Event Created',
          description: `${newEvent.title} has been added to your calendar.`,
        });
      }

      // Notify parent component of schedule update
      if (onScheduleUpdate) {
        onScheduleUpdate(updatedSchedule);
      }

      setShowEventModal(false);
      eventForm.resetFields();
      
    } catch (error) {
      console.error("Error saving event:", error);
      notification.error({
        message: 'Error',
        description: 'Failed to save event. Please try again.',
      });
    }
  };

  /**
   * Delete event
   */
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    confirm({
      title: 'Delete Event',
      content: `Are you sure you want to delete "${selectedEvent.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk() {
        const dateStr = selectedEvent.resource.dateStr;
        const eventIndex = selectedEvent.resource.originalIndex;
        
        const updatedSchedule = { ...currentSchedule };
        if (updatedSchedule[dateStr]) {
          updatedSchedule[dateStr].splice(eventIndex, 1);
          
          // Remove date if no events left
          if (updatedSchedule[dateStr].length === 0) {
            delete updatedSchedule[dateStr];
          }
        }

        if (onScheduleUpdate) {
          onScheduleUpdate(updatedSchedule);
        }

        notification.success({
          message: 'Event Deleted',
          description: `${selectedEvent.title} has been removed from your calendar.`,
        });

        setShowEventModal(false);
        setSelectedEvent(null);
      }
    });
  };

  /**
   * Event style getter for different priorities and types
   */
  const eventStyleGetter = (event, start, end, isSelected) => {
    const priority = event.resource?.priority || 'medium';
    const type = event.resource?.type || 'event';
    
    let backgroundColor = getPriorityColor(priority);
    
    // Adjust opacity based on type
    if (type === 'study') backgroundColor += 'CC'; // 80% opacity
    else if (type === 'assignment') backgroundColor += 'FF'; // 100% opacity
    else backgroundColor += 'AA'; // 66% opacity
    
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)',
        fontSize: '12px',
        padding: '2px 6px'
      }
    };
  };

  /**
   * Custom event component
   */
  const EventComponent = ({ event }) => (
    <div className="flex items-center justify-between h-full">
      <div className="flex-1 truncate">
        <div className="font-medium text-xs">{event.title}</div>
        <div className="text-xs opacity-75">
          {event.resource.type} • {event.resource.priority}
        </div>
      </div>
      <EditOutlined className="text-xs opacity-75 ml-1" />
    </div>
  );

  return (
    <div className="h-full bg-white rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Schedule Calendar</h3>
          <p className="text-sm text-gray-600">
            {Object.keys(currentSchedule).length} days with events • {calendarEvents.length} total events
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setSelectedEvent(null);
              setIsEditing(false);
              eventForm.resetFields();
              setShowEventModal(true);
            }}
          >
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <div className="flex-1 p-4" style={{ height: 'calc(100% - 80px)' }}>
        <BigCalendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent
          }}
          step={30}
          timeslots={2}
          defaultView="week"
          views={['month', 'week', 'day', 'agenda']}
          showMultiDayTimes={true}
          className="custom-calendar"
        />
      </div>

      {/* Event Creation/Edit Modal */}
      <Modal
        title={isEditing ? "Edit Event" : "Create New Event"}
        open={showEventModal}
        onCancel={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          eventForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setShowEventModal(false)}>
            Cancel
          </Button>,
          ...(isEditing ? [
            <Button 
              key="delete" 
              danger 
              icon={<DeleteOutlined />}
              onClick={handleDeleteEvent}
            >
              Delete
            </Button>
          ] : []),
          <Button key="save" type="primary" onClick={handleSaveEvent}>
            {isEditing ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <Form form={eventForm} layout="vertical">
          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: 'Please enter event title' }]}
          >
            <Input placeholder="Enter event title" />
          </Form.Item>
          
          <Form.Item name="type" label="Event Type" initialValue="study">
            <Select>
              <Option value="study">Study Session</Option>
              <Option value="assignment">Assignment Work</Option>
              <Option value="meeting">Meeting</Option>
              <Option value="review">Review</Option>
              <Option value="break">Break</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="priority" label="Priority" initialValue="medium">
            <Select>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="start_time"
              label="Start Time"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please select start time' }]}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
            
            <Form.Item
              name="end_time"
              label="End Time"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Please select end time' }]}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Custom Calendar Styles */}
      <style jsx>{`
        .custom-calendar {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .custom-calendar .rbc-event {
          border-radius: 6px;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .custom-calendar .rbc-time-view {
          border: 1px solid #e8e8e8;
        }
        .custom-calendar .rbc-time-header {
          border-bottom: 1px solid #e8e8e8;
        }
        .custom-calendar .rbc-today {
          background-color: #f6ffed;
        }
        .custom-calendar .rbc-off-range-bg {
          background-color: #fafafa;
        }
        .custom-calendar .rbc-toolbar {
          margin-bottom: 16px;
        }
        .custom-calendar .rbc-toolbar button {
          border: 1px solid #d9d9d9;
          background: white;
          color: #595959;
          padding: 6px 12px;
          border-radius: 4px;
          margin-right: 4px;
        }
        .custom-calendar .rbc-toolbar button:hover {
          background: #f5f5f5;
          border-color: #40a9ff;
          color: #40a9ff;
        }
        .custom-calendar .rbc-toolbar button.rbc-active {
          background: #1890ff;
          border-color: #1890ff;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default BigCalendarComponent;