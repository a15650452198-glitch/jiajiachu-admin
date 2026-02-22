import React, { useEffect, useState } from 'react';
import { db } from '../index';
import { Tabs, Table, Button, Modal, Input, Tag, Image, message, Space, Tooltip } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, AlertOutlined, FileDoneOutlined, FileProtectOutlined, BellOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const chefTypeMap = { professional: '专业', amateur: '普通人' };
const typeColor = { professional: 'geekblue', amateur: 'green' };

function desensitizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function getValidPeriodTag(validTo) {
  const days = dayjs(validTo).diff(dayjs(), 'day');
  if (days < 0) {
    return <Tag color="red">已过期</Tag>;
  }
  if (days <= 30) {
    return <Tag color="orange">剩{days}天</Tag>;
  }
  return <Tag color="green">剩{days}天</Tag>;
}

const ChefManagement = () => {
  // Tabs state
  const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected, health_cert_expire
  const [loading, setLoading] = useState(false);

  // Data
  const [applies, setApplies] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [warningChefs, setWarningChefs] = useState([]);

  // Modal state
  const [rejectModal, setRejectModal] = useState({ open: false, apply: null, reason: '' });
  const [healthCertModal, setHealthCertModal] = useState({ open: false, records: [] });
  const [insuranceModal, setInsuranceModal] = useState({ open: false, records: [] });

  // Fetch data for tabs
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTab]);

  function fetchData() {
    setLoading(true);
    if (activeTab === 'pending') {
      // 入驻申请
      db.collection('chef_applies')
        .where({ status: 'pending' })
        .get()
        .then(res => {
          setApplies(res.data || []);
          setLoading(false);
        }).catch(() => setLoading(false));
    } else if (activeTab === 'rejected') {
      db.collection('chef_applies')
        .where({ status: 'rejected' })
        .get()
        .then(res => {
          setApplies(res.data || []);
          setLoading(false);
        }).catch(() => setLoading(false));
    } else if (activeTab === 'health_cert_expire') {
      // 30天内过期
      const now = dayjs().startOf('day');
      const lessThan = dayjs().add(30, 'day').endOf('day').toDate();
      db.collection('chefs')
        .where({
          healthCertValidTo: db.command.gte(now.toDate()).and(db.command.lte(lessThan)),
        })
        .get()
        .then(res => {
          setWarningChefs(res.data || []);
          setLoading(false);
        }).catch(() => setLoading(false));
    } else {
      // 全部/已通过
      db.collection('chefs').get()
        .then(res => {
          setChefs(res.data || []);
          setLoading(false);
        }).catch(() => setLoading(false));
    }
  }

  // 审核通过
  async function approveChef(apply) {
    Modal.confirm({
      title: '确定通过该入驻申请？',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      onOk: async () => {
        try {
          // 云函数 approveChef 处理通过，将 chef_applies 复制到 chefs 集合
          await db.callFunction({
            name: 'approveChef',
            data: { applyId: apply._id }
          });
          message.success('已通过入驻申请');
          fetchData();
        } catch {
          message.error('操作失败，请重试');
        }
      }
    });
  }

  // 拒绝
  function showRejectModal(apply) {
    setRejectModal({ open: true, apply, reason: '' });
  }

  async function handleReject() {
    if (!rejectModal.reason.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    setLoading(true);
    await db.collection('chef_applies').doc(rejectModal.apply._id).update({
      status: 'rejected',
      rejectReason: rejectModal.reason
    });
    setLoading(false);
    setRejectModal({ open: false, apply: null, reason: '' });
    message.success('已驳回入驻申请');
    fetchData();
  }

  // 启用/禁用厨师
  function toggleChefStatus(chef) {
    const newStatus = chef.status === 'disabled' ? 'normal' : 'disabled';
    Modal.confirm({
      title: `确定${newStatus === 'disabled' ? '禁用' : '启用'}该厨师？`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        setLoading(true);
        await db.collection('chefs').doc(chef._id).update({ status: newStatus });
        setLoading(false);
        message.success(`${newStatus === 'disabled' ? '已禁用' : '已启用'}厨师`);
        fetchData();
      }
    });
  }

  // 健康证验证记录
  async function showHealthCertRecords(chef) {
    setHealthCertModal({ open: true, records: [], loading: true });
    try {
      const res = await db.collection('health_cert_logs').where({ chefId: chef._id }).get();
      setHealthCertModal({ open: true, records: res.data || [] });
    } catch {
      setHealthCertModal({ open: true, records: [] });
    }
  }

  // 保险记录
  async function showInsuranceRecords(chef) {
    setInsuranceModal({ open: true, records: [], loading: true });
    try {
      const res = await db.collection('insurance_records').where({ chefId: chef._id }).get();
      setInsuranceModal({ open: true, records: res.data || [] });
    } catch {
      setInsuranceModal({ open: true, records: [] });
    }
  }

  // 发送健康证提醒
  function sendExpireRemind(chef) {
    Modal.confirm({
      title: '确定向该厨师发送健康证到期提醒？',
      onOk: async () => {
        // 假设有 sendHealthCertRemind 云函数
        try {
          await db.callFunction({
            name: 'sendHealthCertRemind',
            data: { chefId: chef._id }
          });
          message.success('提醒已发送');
        } catch {
          message.error('发送失败');
        }
      }
    });
  }

  // =================== 表格配置 ===================
  const applyColumns = [
    { title: '申请人', dataIndex: 'name', key: 'name', render: (text, r) => (
      <span>
        <Image src={r.avatar} width={40} style={{ borderRadius: 20, marginRight: 6 }} />
        <span style={{ verticalAlign: 'middle' }}>{text}</span>
      </span>
    )},
    { title: '手机号', dataIndex: 'phone', key: 'phone', render: desensitizePhone },
    { title: '类型', dataIndex: 'type', key: 'type', render: t => <Tag color={typeColor[t]}>{chefTypeMap[t]}</Tag> },
    { title: '资质图片', dataIndex: 'certPics', key: 'certPics', render: list =>
      <Space>
        {(list || []).map((url, idx) =>
          <Image src={url} width={40} key={idx} style={{ border: '1px solid #eee' }} />
        )}
      </Space>
    },
    { title: '适合场景', dataIndex: 'scene', key: 'scene', render: s => <span>{(s || []).join('、')}</span> },
    { title: '推荐人ID', dataIndex: 'referrerId', key: 'referrerId' },
    { title: '操作', key: 'action', render: (_, record) =>
      <Space>
        <Button type="primary" size="small" onClick={() => approveChef(record)}>通过</Button>
        <Button danger size="small" onClick={() => showRejectModal(record)}>驳回</Button>
      </Space>
    }
  ];

  const chefsColumns = [
    { title: '头像', dataIndex: 'avatar', key: 'avatar', render: url => <Image src={url} width={40} /> },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone', render: desensitizePhone },
    { title: '类型', dataIndex: 'type', key: 'type', render: t => <Tag color={typeColor[t]}>{chefTypeMap[t]}</Tag> },
    { title: '适合场景', dataIndex: 'scene', key: 'scene', render: s => <span>{(s || []).join('、')}</span> },
    { title: '健康证有效期', dataIndex: 'healthCertValidTo', key: 'healthCertValidTo', render: date => getValidPeriodTag(date) },
    { title: '保险状态', dataIndex: 'insured', key: 'insured', render: v => v ? <Tag color="blue">已购买</Tag> : <Tag>未购买</Tag> },
    { title: '入驻时间', dataIndex: 'createdAt', key: 'createdAt', render: v => v ? dayjs(v).format('YYYY-MM-DD') : '' },
    { title: '状态', dataIndex: 'status', key: 'status',
      render: s => s === 'normal'
        ? <Tag color="green">正常</Tag>
        : <Tag color="red">禁用</Tag>
    },
    { title: '操作', key: 'action', render: (_, record) =>
      <Space>
        <Tooltip title={record.status === 'normal' ? '禁用' : '启用'}>
          <Button size="small" onClick={() => toggleChefStatus(record)}>
            {record.status === 'normal' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
          </Button>
        </Tooltip>
        <Tooltip title="健康证验证记录">
          <Button size="small" icon={<FileDoneOutlined />} onClick={() => showHealthCertRecords(record)} />
        </Tooltip>
        <Tooltip title="保险记录">
          <Button size="small" icon={<FileProtectOutlined />} onClick={() => showInsuranceRecords(record)} />
        </Tooltip>
      </Space>
    },
  ];

  const warningColumns = [
    { title: '头像', dataIndex: 'avatar', key: 'avatar', render: url => <Image src={url} width={40} /> },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone', render: desensitizePhone },
    { title: '健康证有效期', dataIndex: 'healthCertValidTo', key: 'healthCertValidTo', render: date => getValidPeriodTag(date) },
    { title: '操作', key: 'action', render: (_, record) =>
      <Button type="primary" icon={<BellOutlined />} onClick={() => sendExpireRemind(record)}>
        发送提醒
      </Button>
    }
  ];

  // =================== render ===================
  return (
    <div style={{ background: '#fff', padding: 16, minHeight: '85vh' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { label: '全部', key: 'all' },
          { label: '待审核', key: 'pending' },
          { label: '已通过', key: 'approved' },
          { label: '已驳回', key: 'rejected' },
          { label: <span><AlertOutlined /> 健康证即将到期</span>, key: 'health_cert_expire' }
        ]}
      >
        <TabPane tab="" key="all">
          <Table
            columns={chefsColumns}
            dataSource={chefs}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="" key="pending">
          <Table
            columns={applyColumns}
            dataSource={applies}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: '暂无待审核记录' }}
          />
        </TabPane>
        <TabPane tab="" key="approved">
          <Table
            columns={chefsColumns}
            dataSource={chefs.filter(c => c.status === 'normal' || c.status === 'disabled')}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: '暂无已通过厨师' }}
          />
        </TabPane>
        <TabPane tab="" key="rejected">
          <Table
            columns={[
              ...applyColumns.slice(0, -1),
              { title: '驳回原因', dataIndex: 'rejectReason', key: 'rejectReason' }
            ]}
            dataSource={applies}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: '暂无已驳回记录' }}
          />
        </TabPane>
        <TabPane tab="" key="health_cert_expire">
          <Table
            columns={warningColumns}
            dataSource={warningChefs}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: '无健康证即将到期的厨师' }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title="驳回原因"
        open={rejectModal.open}
        onCancel={() => setRejectModal({ open: false, apply: null, reason: '' })}
        onOk={handleReject}
        okText="确认驳回"
        cancelText="取消"
      >
        <Input.TextArea
          value={rejectModal.reason}
          onChange={e => setRejectModal(s => ({ ...s, reason: e.target.value }))}
          rows={4}
          placeholder="请输入驳回原因"
        />
      </Modal>

      <Modal
        title="健康证验证记录"
        open={healthCertModal.open}
        footer={null}
        onCancel={() => setHealthCertModal({ open: false, records: [] })}
        width={500}
      >
        <Table
          size="small"
          columns={[
            { title: '验证时间', dataIndex: 'verifiedAt', key: 'verifiedAt', render: v => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '' },
            { title: '结果', dataIndex: 'result', key: 'result',
              render: v => v === true ? <Tag color="green">通过</Tag> : <Tag color="red">未通过</Tag>
            },
            { title: '方式', dataIndex: 'method', key: 'method' }
          ]}
          rowKey="_id"
          dataSource={healthCertModal.records}
          pagination={false}
        />
      </Modal>

      <Modal
        title="保险记录"
        open={insuranceModal.open}
        footer={null}
        onCancel={() => setInsuranceModal({ open: false, records: [] })}
        width={500}
      >
        <Table
          size="small"
          columns={[
            { title: '保单号', dataIndex: 'policyNo', key: 'policyNo' },
            { title: '有效期', dataIndex: 'validTo', key: 'validTo', render: v => v ? dayjs(v).format('YYYY-MM-DD') : '' },
          ]}
          rowKey="_id"
          dataSource={insuranceModal.records}
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default ChefManagement;