import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { db } from '../index';

const { confirm } = Modal;

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: '1',
      nickname: '张三',
      phone: '138****1234',
      registerTime: '2025-01-15',
      orderCount: 23,
      status: '正常',
    },
    {
      id: '2',
      nickname: '李四',
      phone: '139****5678',
      registerTime: '2025-02-20',
      orderCount: 8,
      status: '正常',
    },
    {
      id: '3',
      nickname: '王五',
      phone: '137****9012',
      registerTime: '2025-03-10',
      orderCount: 2,
      status: '禁用',
    },
  ]);

  const handleDisable = (userId, currentStatus) => {
    confirm({
      title: `确定要${currentStatus === '正常' ? '禁用' : '启用'}该用户吗？`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        // 模拟更新状态
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, status: currentStatus === '正常' ? '禁用' : '正常' } 
            : u
        ));
        message.success(`${currentStatus === '正常' ? '禁用' : '启用'}成功`);
      },
    });
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      key: 'registerTime',
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '正常' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleDisable(record.id, record.status)}>
            {record.status === '正常' ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>用户管理</h1>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UserManagement;