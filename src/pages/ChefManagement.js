import React, { useState } from 'react';
import { Tabs, Table, Button, Tag, Space, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { db } from '../index';

const { TabPane } = Tabs;
const { confirm } = Modal;

const ChefManagement = () => {
  // 标签状态：activeKey 可以是 'all', 'pending', 'approved', 'rejected'
  const [activeKey, setActiveKey] = useState('all');

  // 模拟数据
  const [chefs, setChefs] = useState([
    {
      id: '1',
      name: '张师傅',
      phone: '138****1111',
      type: '专业厨师',
      suitableScenes: ['家宴聚会', '商务宴请'],
      healthCertExpire: '2026-12-31',
      insuranceStatus: 'active',
      joinTime: '2025-01-10',
      status: 'approved',
    },
    {
      id: '2',
      name: '李阿姨',
      phone: '139****2222',
      type: '家常厨师',
      suitableScenes: ['日常简餐', '月子/老人餐'],
      healthCertExpire: '2026-10-15',
      insuranceStatus: 'active',
      joinTime: '2025-02-15',
      status: 'approved',
    },
    {
      id: '3',
      name: '王师傅',
      phone: '137****3333',
      type: '专业厨师',
      suitableScenes: ['烧烤/特色'],
      healthCertExpire: '2026-08-20',
      insuranceStatus: 'pending',
      joinTime: '2025-03-20',
      status: 'pending',  // 待审核
    },
  ]);

  // 根据当前标签过滤数据
  const filteredChefs = chefs.filter(chef => {
    if (activeKey === 'all') return true;
    return chef.status === activeKey;
  });

  // 禁用/启用厨师
  const handleDisable = (chefId, currentStatus) => {
    confirm({
      title: `确定要${currentStatus === 'approved' ? '禁用' : '启用'}该厨师吗？`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setChefs(chefs.map(c => 
          c.id === chefId 
            ? { ...c, status: currentStatus === 'approved' ? 'disabled' : 'approved' } 
            : c
        ));
        message.success(`${currentStatus === 'approved' ? '禁用' : '启用'}成功`);
      },
    });
  };

  // 审核厨师（仅待审核状态显示审核按钮）
  const handleApprove = (chefId, approve) => {
    confirm({
      title: `确定${approve ? '通过' : '驳回'}该申请吗？`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setChefs(chefs.map(c => 
          c.id === chefId 
            ? { ...c, status: approve ? 'approved' : 'rejected' } 
            : c
        ));
        message.success(`${approve ? '通过' : '驳回'}成功`);
      },
    });
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '厨师类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '适合场景',
      dataIndex: 'suitableScenes',
      key: 'suitableScenes',
      render: (scenes) => (
        <>
          {scenes.map(s => (
            <Tag key={s} color="blue" style={{ marginRight: 4 }}>{s}</Tag>
          ))}
        </>
      ),
    },
    {
      title: '健康证有效期',
      dataIndex: 'healthCertExpire',
      key: 'healthCertExpire',
    },
    {
      title: '保险状态',
      dataIndex: 'insuranceStatus',
      key: 'insuranceStatus',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? '已购买' : '待购买'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = '已通过';
        if (status === 'pending') { color = 'orange'; text = '待审核'; }
        else if (status === 'rejected') { color = 'red'; text = '已驳回'; }
        else if (status === 'disabled') { color = 'gray'; text = '已禁用'; }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <>
              <Button type="link" style={{ color: 'green' }} onClick={() => handleApprove(record.id, true)}>通过</Button>
              <Button type="link" style={{ color: 'red' }} onClick={() => handleApprove(record.id, false)}>驳回</Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button type="link" onClick={() => handleDisable(record.id, 'approved')}>禁用</Button>
          )}
          {record.status === 'disabled' && (
            <Button type="link" onClick={() => handleDisable(record.id, 'disabled')}>启用</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>厨师管理</h1>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="全部" key="all" />
        <TabPane tab="待审核" key="pending" />
        <TabPane tab="已通过" key="approved" />
        <TabPane tab="已驳回" key="rejected" />
      </Tabs>
      <Table 
        columns={columns} 
        dataSource={filteredChefs} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ChefManagement;