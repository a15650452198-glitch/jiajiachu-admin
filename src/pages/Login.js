import React, { useState } from 'react';
import { db } from '../index';
import { useNavigate } from 'react-router-dom';

const cardStyle = {
  background: '#fff',
  padding: '32px 28px',
  borderRadius: '8px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  width: '320px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const wrapperStyle = {
  minHeight: '100vh',
  background: '#f5f6f8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '16px',
};

const buttonStyle = {
  background: '#006eff',
  color: '#fff',
  padding: '10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
};

const errorStyle = {
  color: '#e55353',
  fontSize: '14px',
  textAlign: 'center',
};

function Login() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!account || !password) {
      setError('请输入账号和密码');
      return;
    }
    setLoading(true);

    try {
      // 假设表 'users'，字段 account 和 password，真实应用中密码需加密，勿直接明文存储
      const res = await db.collection('users')
        .where({ account, password })
        .get();
      if (res.data && res.data.length > 0) {
        // 登录成功，假定 token 就是用户 id
        localStorage.setItem('token', res.data[0]._id);
        navigate('/dashboard');
      } else {
        setError('账号或密码错误');
      }
    } catch (e) {
      setError('登录失败，请稍后重试');
    }
    setLoading(false);
  };

  return (
    <div style={wrapperStyle}>
      <form
        style={cardStyle}
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <h2 style={{ textAlign: 'center', marginBottom: '12px' }}>登录</h2>
        <input
          style={inputStyle}
          placeholder="账号"
          type="text"
          value={account}
          onChange={e => setAccount(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="密码"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div style={errorStyle}>{error}</div>}
        <button
          type="submit"
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}

export default Login;
