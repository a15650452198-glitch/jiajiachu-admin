import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return <div style={{ padding: '20px', fontSize: '24px' }}>✅ 测试成功：React 能正常渲染</div>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);