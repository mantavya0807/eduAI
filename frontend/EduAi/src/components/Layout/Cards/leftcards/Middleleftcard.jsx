import React, { useState } from "react";
import Card3D from "../../Card3D/Card3D";
import { BarChartOutlined, LoadingOutlined } from "@ant-design/icons";
import { Flex, Progress, Modal, Spin } from "antd";
import Button from "../../../Button/Button";
import { AnimatePresence, motion } from "framer-motion";

const CircularProgress = ({
  percent,
  size = 120,
  strokeWidth = 10,
  strokeColor = "#9981FF",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius * 2;
  const halfCircumference = circumference / 2;
  const progressOffset = (1 - percent / 100) * halfCircumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
        <path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="none"
          stroke="#26262F"
          strokeWidth={strokeWidth}
        />
        <motion.path
          d={`M ${strokeWidth / 2},${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          },${size / 2}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={halfCircumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: halfCircumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      <motion.p
        className="text-white text-lg font-semibold mt-[-20px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {percent}%
      </motion.p>
    </div>
  );
};

const Middleleftcard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const statistics = { totalSessions: 120, averageScore: 85, lastScore: 90 };

  const handleViewClick = (e) => {
    e.stopPropagation(); // Prevents event from being blocked
    console.log("View button clicked");
    setIsModalOpen(true);
  };

  return (
    <Card3D
      title="Your Progress: G-Score"
      icon={<BarChartOutlined />}
      className="h-full"
    >
      <Flex gap="small" className="bg-[#0D0D0D]" vertical>
        <Progress
          status="active"
          percent={60}
          percentPosition={{ align: "end", type: "inner" }}
          size={[, 15]}
          strokeColor="#9981FF"
        />
      </Flex>
      <div className="flex gap-2 mt-3 items-center justify-between">
        <p className="text-[#7E7E7E] text-sm">
          Exceptional consistency! You've maintained peak performance for 5 days
          straight.
        </p>
        <Button
          className="!relative"
          title="View"
          icon={<BarChartOutlined />}
          onClick={handleViewClick}
        />
      </div>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
        footer={null}
        closable={true}
        style={{ top: "25%" }}
      >
        {loading ? (
          <Spin
            indicator={<LoadingOutlined spin />}
            style={{ color: "green" }}
          />
        ) : (
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>Your Stats</h1>
            <p>
              <strong>G-score:</strong>
            </p>
            <div className="bg-[#26262F] p-4 flex justify-center">
              <CircularProgress
                percent={60}
                size={120}
                strokeWidth={12}
                strokeColor="#9981FF"
              />
            </div>
            <p>
              <strong>Total Sessions:</strong> {statistics.totalSessions}
            </p>
            <p>
              <strong>Average Score:</strong> {statistics.averageScore}%
            </p>
            <p>
              <strong>Last Score:</strong> {statistics.lastScore}%
            </p>
          </div>
        )}
      </Modal>
    </Card3D>
  );
};

export default Middleleftcard;
