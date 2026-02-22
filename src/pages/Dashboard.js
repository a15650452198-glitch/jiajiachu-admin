import React, { useEffect, useState } from 'react';
import { FaClipboardList, FaMoneyBillWave, FaUserCheck, FaUsersCog, FaUndoAlt, FaHeartbeat } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cardStyle = {
  background: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  borderRadius: '8px',
  padding: '24px',
  minWidth: '180px',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const iconStyle = {
  fontSize: '2.2rem',
  color: '#387ef5',
};

const dashboardGrid = {
  display: 'flex',
  gap: '24px',
  marginBottom: '32px',
  flexWrap: 'wrap',
};

const chartCardStyle = {
  background: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  borderRadius: '8px',
  padding: '24px',
  minHeight: '340px',
  width: '100%',
};

const titleStyle = {
  fontSize: '1.22rem',
  fontWeight: 500,
  marginBottom: '18px',
};

function Dashboard() {
  // 仪表盘核心数据（模拟数据）
  const [metrics, setMetrics] = useState({
    todayOrders: 24,
    todayRevenue: 1580.5,
    pendingChefs: 4,
    pendingCommunity: 2,
    pendingRefunds: 3,
    healthCertExpiring: 5,
  });

  // 近7天订单趋势（模拟数据）
  const [trend, setTrend] = useState([
    { date: '周一', orders: 15 },
    { date: '周二', orders: 22 },
    { date: '周三', orders: 18 },
    { date: '周四', orders: 19 },
    { date: '周五', orders: 21 },
    { date: '周六', orders: 24 },
    { date: '周日', orders: 17 },
  ]);

  // 数据请求可用时替换为异步获取
  useEffect(() => {
    // 示例: fetch数据库数据后setMetrics, setTrend
    // 例如 db.collection('orders').where(...) ...
  }, []);

  return (
    <div style={{ padding: '36px', background: '#f4f6fb', minHeight: '100vh' }}>
      <div style={dashboardGrid}>
        <div style={cardStyle}>
          <FaClipboardList style={iconStyle} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.14rem' }}>{metrics.todayOrders}</div>
            <div style={{ color: '#888' }}>今日订单数</div>
          </div>
        </div>
        <div style={cardStyle}>
          <FaMoneyBillWave style={iconStyle} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.14rem' }}>¥{metrics.todayRevenue.toLocaleString()}</div>
            <div style={{ color: '#888' }}>今日成交金额</div>
          </div>
        </div>
        <div style={cardStyle}>
          <FaUserCheck style={iconStyle} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.14rem' }}>{metrics.pendingChefs}</div>
            <div style={{ color: '#888' }}>待审核厨师数</div>
          </div>
        </div>
        <div style={cardStyle}>
          <FaUsersCog style={iconStyle} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.14rem' }}>{metrics.pendingCommunity}</div>
            <div style={{ color: '#888' }}>待审核社区内容数</div>
          </div>
        </div>
        <div style={cardStyle}>
          <FaUndoAlt style={iconStyle} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.14rem' }}>{metrics.pendingRefunds}</div>
            <div style={{ color: '#888' }}>待处理退款数</div>
          </div>
        </div>
        <div style={cardStyle}>
          <FaHeartbeat style={iconStyle} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.14rem' }}>{metrics.healthCertExpiring}</div>
            <div style={{ color: '#888' }}>健康证即将到期</div>
          </div>
        </div>
      </div>
      <div style={chartCardStyle}>
        <div style={titleStyle}>近7天订单趋势</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#387ef5" strokeWidth={3} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;