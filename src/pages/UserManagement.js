import React, { useEffect, useState } from 'react';
import { db } from '../index';
import { Modal, Button, Table, Input, DatePicker, Select, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

// 导出相关脱敏辅助函数
function maskPhone(phone) {
  if (!phone) return '';
  // 保留前三位和后四位
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

function maskUserId(userId) {
  if (!userId) return '';
  // 保留前四位和后四位
  if (userId.length <= 8) return userId[0] + '****' + userId.slice(-1);
  return userId.slice(0, 4) + '****' + userId.slice(-4);
}

// 泛型脱敏函数（用于敏感字段）
function maskSensitive(str, keepStart = 2, keepEnd = 2) {
  if (!str) return '';
  if (str.length <= keepStart + keepEnd) {
    return str[0] + '****' + str.slice(-1);
  }
  return str.slice(0, keepStart) + '****' + str.slice(-keepEnd);
}

const { RangePicker } = DatePicker;
const { Option } = Select;

function desensitize(str, type = 'phone') {
  if (!str) return '';
  if (type === 'phone') {
    return str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  // userId部分脱敏，如果够长
  if (str.length >= 7) {
    return str.slice(0, 2) + '****' + str.slice(-2);
  }
  return str;
}

const statusText = { normal: '正常', disabled: '禁用' };
const statusColor = { normal: 'green', disabled: 'red' };

const defaultFilter = {
  username: '',
  regRange: [],
  status: 'all',
};

const pageSize = 12;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ visible: false, user: null });
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 筛选和加载数据
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [filter]);

  function fetchUsers() {
    setLoading(true);
    let query = db.collection('users');

    // 筛选：用户名
    if (filter.username) {
      query = query.where({
        nickname: db.RegExp({
          regexp: filter.username,
          options: 'i',
        })
      });
    }

    // 筛选：状态
    if (filter.status !== 'all') {
      query = query.where({ status: filter.status });
    }

    // 筛选：注册时间
    if (filter.regRange.length === 2) {
      query = query.where({
        registerTime: db.command.gte(filter.regRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss'))
          .and(db.command.lte(filter.regRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss')))
      });
    }

    query.orderBy('registerTime', 'desc').limit(200)
      .get()
      .then(res => {
        setUsers(res.data || []);
      })
      .catch(() => {
        message.error('获取用户数据失败');
      })
      .finally(() => setLoading(false));
  }

  function handleFilterChange(key, val) {
    setFilter(f => ({ ...f, [key]: val }));
    setCurrentPage(1);
  }

  function handleStatusChange(user, toStatus) {
    Modal.confirm({
      title: `确定要${toStatus === 'disabled' ? '禁用' : '启用'}该用户吗？`,
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          // 假设用云函数：updateUserStatus
          await db.callFunction({
            name: 'updateUserStatus',
            data: {
              userId: user._id,
              status: toStatus,
            }
          });
          message.success('操作成功');
          fetchUsers();
        } catch (e) {
          message.error('操作失败');
        }
      },
    });
  }

  function showDetail(user) {
    setDetailModal({ visible: true, user, orderLoading: true, orders: [], addresses: [] });
    // 请求地址
    db.collection('addresses').where({ userId: user._id }).get()
      .then(res => {
        setDetailModal(prev => ({ ...prev, addresses: res.data || [] }));
      });
    // 请求订单（只取最近10条）
    db.collection('orders')
      .where({ userId: user._id })
      .orderBy('createTime', 'desc')
      .limit(10)
      .get()
      .then(res => {
        setDetailModal(prev => ({ ...prev, orders: res.data || [], orderLoading: false }));
      });
  }

  function hideDetail() {
    setDetailModal({ visible: false, user: null });
  }

  function onExportExcel() {
    setExporting(true);
    // 只导出筛选列表
    let exportData = users.map(user => ({
      用户ID: desensitize(user._id, 'userId'),
      昵称: user.nickname,
      手机号: desensitize(user.phone, 'phone'),
      注册时间: user.registerTime,
      订单数: user.orderCount || 0,
      状态: statusText[user.status] || '未知',
    }));
    // 导出
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '用户列表');
    XLSX.writeFile(wb, '用户列表.xlsx');
    setExporting(false);
  }

  const columns = [
    {
      title: '用户ID',
      dataIndex: '_id',
      render: id => <span>{desensitize(id, 'userId')}</span>,
      ellipsis: true,
    },
    { title: '昵称', dataIndex: 'nickname' },
    {
      title: '手机号',
      dataIndex: 'phone',
      render: phone => <span>{desensitize(phone)}</span>,
    },
    {
      title: '注册时间',
      dataIndex: 'registerTime',
      render: t => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      render: v => v || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: s => (
        <span style={{ color: statusColor[s] || '#888' }}>
          ● {statusText[s] || '未知'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, user) => (
        <span>
          <Button type="link" size="small" onClick={() => showDetail(user)}>
            查看详情
          </Button>
          <Button
            type="link"
            size="small"
            danger={user.status === 'normal'}
            onClick={() => handleStatusChange(user, user.status === 'normal' ? 'disabled' : 'normal')}
          >
            {user.status === 'normal' ? '禁用' : '启用'}
          </Button>
        </span>
      )
    }
  ];

  // 分页
  const pagedData = users.slice((currentPage-1)*pageSize, currentPage*pageSize);

  return (
    <div style={{ background:'#f6f8fb', minHeight:'100vh', padding: 32 }}>
      <div style={{ marginBottom: 18, background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 6px #e7e9ec' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="用户名（昵称）"
            value={filter.username}
            style={{ width: 180 }}
            allowClear
            onChange={e => handleFilterChange('username', e.target.value)}
          />
          <RangePicker
            style={{ width: 280 }}
            value={filter.regRange}
            onChange={dates => handleFilterChange('regRange', dates)}
            placeholder={['注册起始时间', '注册结束时间']}
          />
          <Select
            style={{ width: 120 }}
            value={filter.status}
            onChange={s => handleFilterChange('status', s)}
          >
            <Option value="all">全部状态</Option>
            <Option value="normal">正常</Option>
            <Option value="disabled">禁用</Option>
          </Select>
          <Button type="primary" onClick={() => fetchUsers()} loading={loading}>查询</Button>
          <Button onClick={onExportExcel} loading={exporting}>导出Excel</Button>
        </div>
      </div>
      <div style={{ background: '#fff', padding: '24px', borderRadius: 8, boxShadow: '0 1px 6px #e7e9ec' }}>
        <Table
          columns={columns}
          dataSource={pagedData}
          pagination={{
            current: currentPage,
            pageSize,
            total: users.length,
            onChange: page => setCurrentPage(page),
            showTotal: total => `共 ${total} 条`
          }}
          loading={loading}
          rowKey="_id"
          bordered
        />
      </div>
      <Modal
        title="用户详情"
        open={detailModal.visible}
        onCancel={hideDetail}
        footer={<Button onClick={hideDetail}>关闭</Button>}
        width={820}
      >
        {detailModal.user && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 14 }}>
              {detailModal.user.nickname} (ID: {detailModal.user._id})
            </div>
            <div>手机号：{detailModal.user.phone}</div>
            <div>注册时间：{dayjs(detailModal.user.registerTime).format('YYYY-MM-DD HH:mm')}</div>
            <div>状态：<span style={{ color: statusColor[detailModal.user.status] }}>{statusText[detailModal.user.status]}</span></div>
            <hr style={{ margin: '16px 0' }}/>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>地址列表：</div>
            <ul>
              {detailModal.addresses && detailModal.addresses.length > 0 ? (
                detailModal.addresses.map(addr => (
                  <li key={addr._id}>{addr.address} {addr.name} {addr.phone}</li>
                ))
              ) : <li>无</li>}
            </ul>
            <div style={{ fontWeight: 500, marginTop:16, marginBottom: 6 }}>订单历史（最近10条）：</div>
            <Table
              columns={[
                {title:'订单ID',dataIndex:'_id',width:120, ellipsis:true},
                {title:'下单时间',dataIndex:'createTime',render:t=>dayjs(t).format('YYYY-MM-DD HH:mm'),width: 120},
                {title:'金额', dataIndex:'amount', render:v=>'¥'+(v||0), width:80},
                {title:'状态',dataIndex:'status',width:90}
              ]}
              dataSource={detailModal.orders}
              size="small"
              rowKey="_id"
              pagination={false}
              loading={detailModal.orderLoading}
              scroll={{x:480}}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
