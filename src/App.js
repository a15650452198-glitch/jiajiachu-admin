import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ChefManagement from './pages/ChefManagement';
import OrderManagement from './pages/OrderManagement';
import CommunityManagement from './pages/CommunityManagement';
import SceneManagement from './pages/SceneManagement';
import RuleConfig from './pages/RuleConfig';
import WithdrawManagement from './pages/WithdrawManagement';
import HealthCertAlert from './pages/HealthCertAlert';
import InsuranceManagement from './pages/InsuranceManagement';
import AgreementManagement from './pages/AgreementManagement';
import './App.css';

const navItems = [
  { key: "dashboard", label: "概览", path: "/dashboard" },
  { key: "user", label: "用户管理", path: "/users" },
  { key: "chef", label: "厨师管理", path: "/chefs" },
  { key: "orders", label: "订单管理", path: "/orders" },
  { key: "community", label: "社区管理", path: "/communities" },
  { key: "scene", label: "场景管理", path: "/scenes" },
  { key: "rules", label: "规则配置", path: "/rules" },
  { key: "withdraw", label: "提现管理", path: "/withdraw" },
  { key: "health-cert", label: "健康证管理", path: "/health-cert-alert" },
  { key: "insurance", label: "保险管理", path: "/insurance" },
  { key: "agreement", label: "协议管理", path: "/agreements" },
];

function Sidebar() {
  return (
    <div
      style={{
        width: 200,
        background: '#222',
        color: '#fff',
        minHeight: '100vh',
        padding: '30px 0 0 0',
        boxSizing: 'border-box',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22, padding: '0 24px 32px', letterSpacing: 2 }}>管理后台</div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' sidebar-link--active' : '')
            }
            style={({ isActive }) => ({
              display: 'block',
              padding: '11px 24px',
              color: isActive ? '#19aaff' : '#fff',
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '4px solid #19aaff' : '4px solid transparent',
              background: isActive ? 'rgba(25,170,255,0.06)' : 'none',
              transition: 'all 0.2s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
