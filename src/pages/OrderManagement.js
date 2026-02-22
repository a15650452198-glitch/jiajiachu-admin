import React, { useState } from 'react';
import { Tabs, Table, Button, Tag, Space, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { confirm } = Modal;

const OrderManagement = () => {
  // 模拟订单数据
  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      user: '张三',
      chef: '张师傅',
      time: '2025-02-22 18:00',
      amount: 368,
      status: '已完成',
      refundStatus: '无',
    },
    {
      id: 'ORD002',
      user: '李四',
      chef: '李阿姨',
      time: '2025-02-22 12:00',
      amount: 188,
      status: '待服务',
      refundStatus: '无',
    },
    {
      id: 'ORD003',
      user: '王五',
      chef: '王师傅',
      time: '2025-02-21 19:30',
      amount: 568,
      status: '已退款',
      refundStatus: '退款中',
    },
  ]);

  // 模拟退款申请数据
  const [refunds, setRefunds] = useState([
    {
      id: 'REF001',
      orderId: 'ORD003',
      user: '王五',
      amount: 568,
      reason: '厨师迟到1小时',
      status: 'pending',
    },
  ]);

  const handleViewDetail = (orderId) => {
    message.info(`查看订单 ${orderId} 详情（模拟）`);
  };

  const handleRefund = (refundId, approve) => {
    confirm({
      title: approve ? '通过退款申请' : '驳回退款申请',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setRefunds(refunds.filter(r => r.id !== refundId));
        message.success(approve ? '退款已通过' : '退款申请已驳回');
      },
    });
  };

  const orderColumns = [
    { title: '订单号', dataIndex: 'id', key: 'id' },
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '厨师', dataIndex: 'chef', key: 'chef' },
    { title: '服务时间', dataIndex: 'time', key: 'time' },
    { title: '金额(¥)', dataIndex: 'amount', key: 'amount' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === '已完成' ? 'green' : status === '待服务' ? 'blue' : 'red'}>
          {status}
        </Tag>
      )
    },
    { 
      title: '退款状态', 
      dataIndex: 'refundStatus', 
      key: 'refundStatus',
      render: (status) => status !== '无' ? <Tag color="orange">{status}</Tag> : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetail(record.id)}>查看详情</Button>
      )
    }
  ];

  const refundColumns = [
    { title: '退款单号', dataIndex: 'id', key: 'id' },
    { title: '订单号', dataIndex: 'orderId', key: 'orderId' },
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '金额(¥)', dataIndex: 'amount', key: 'amount' },
    { title: '原因', dataIndex: 'reason', key: 'reason' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleRefund(record.id, true)}>通过</Button>
          <Button danger size="small" onClick={() => handleRefund(record.id, false)}>驳回</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>订单管理</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="订单列表" key="1">
          <Table columns={orderColumns} dataSource={orders} rowKey="id" />
        </TabPane>
        <TabPane tab="退款管理" key="2">
          <Table columns={refundColumns} dataSource={refunds} rowKey="id" />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default OrderManagement;