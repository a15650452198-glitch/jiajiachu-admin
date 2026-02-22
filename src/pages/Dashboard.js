import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserOutlined, ShoppingOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { db } from '../index';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayAmount: 0,
    pendingChefs: 0,
    pendingCommunity: 0,
    pendingRefunds: 0,
    expiringHealthCerts: 0
  });
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTrendData();
  }, []);

  const fetchStats = async () => {
    try {
      // 模拟数据，实际可从云数据库获取
      setStats({
        todayOrders: 128,
        todayAmount: 4560,
        pendingChefs: 3,
        pendingCommunity: 5,
        pendingRefunds: 2,
        expiringHealthCerts: 4
      });
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  const fetchTrendData = async () => {
    // 模拟近7天订单趋势
    const data = [
      { name: '2/15', orders: 85 },
      { name: '2/16', orders: 92 },
      { name: '2/17', orders: 78 },
      { name: '2/18', orders: 110 },
      { name: '2/19', orders: 95 },
      { name: '2/20', orders: 120 },
      { name: '2/21', orders: 128 },
    ];
    setTrendData(data);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>仪表盘</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={stats.todayOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日交易额"
              value={stats.todayAmount}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核厨师"
              value={stats.pendingChefs}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核社区"
              value={stats.pendingCommunity}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="健康证即将到期厨师">
            <Statistic
              value={stats.expiringHealthCerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="待处理退款">
            <Statistic
              value={stats.pendingRefunds}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="近7天订单趋势" style={{ marginTop: '24px' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default Dashboard;