import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { app } from '../index';

const { confirm } = Modal;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 加载用户列表
  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await app.callFunction({
        name: 'getUsers',
        data: { page, pageSize }
      });
      if (res.result.success) {
        setUsers(res.result.data);
        setPagination({
          current: page,
          pageSize,
          total: res.result.total,
        });
      } else {
        message.error('获取用户列表失败：' + res.result.error);
      }
    } catch (error) {
      console.error('调用云函数失败', error);
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 处理表格分页变化
  const handleTableChange = (newPagination) => {
    fetchUsers(newPagination.current, newPagination.pageSize);
  };

  // 处理禁用/启用
  const handleToggleStatus = (userId, currentStatus) => {
    const action = currentStatus === '正常' ? '禁用' : '启用';
    confirm({
      title: `确定要${action}该用户吗？`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          const res = await app.callFunction({
            name: 'toggleUserStatus',
            data: { userId, currentStatus }
          });
          if (res.result.success) {
            message.success(`${action}成功`);
            // 刷新列表
            fetchUsers(pagination.current, pagination.pageSize);
          } else {
            message.error('操作失败：' + res.result.error);
          }
        } catch (error) {
          message.error('网络错误');
        }
      },
    });
  };

  const columns = [
    {
      title: '用户ID',
      dataIndex: '_id',
      key: '_id',
      ellipsis: true,
      width: 200,
    },
    {
      title: '昵称',
      dataIndex: 'nickName',
      key: 'nickName',
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
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      render: (text) => text || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '正常' ? 'green' : 'red'}>
          {status || '正常'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => handleToggleStatus(record._id, record.status || '正常')}
          >
            {record.status === '禁用' ? '启用' : '禁用'}
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
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default UserManagement;