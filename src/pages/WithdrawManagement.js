import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Space, Popconfirm } from "antd";

const fetchPendingWithdraws = async () => {
  // 获取状态为 pending 的提现记录
  try {
    const res = await fetch("/api/withdraws?status=pending");
    if (!res.ok) throw new Error("网络错误");
    const data = await res.json();
    return data || [];
  } catch (e) {
    return [];
  }
};

const processWithdraw = async (withdrawId, action, reason) => {
  // action: "confirm" or "reject"
  try {
    const res = await fetch("/api/processWithdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        withdrawId,
        action,
        reason,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "操作失败");
    }
    return await res.json();
  } catch (e) {
    throw e;
  }
};

const WithdrawManagement = () => {
  const [loading, setLoading] = useState(false);
  const [withdraws, setWithdraws] = useState([]);
  const [rejectModal, setRejectModal] = useState({
    visible: false,
    record: null,
    reason: "",
    submitting: false,
  });

  const loadData = async () => {
    setLoading(true);
    const ws = await fetchPendingWithdraws();
    setWithdraws(ws);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirm = async (record) => {
    Modal.confirm({
      title: "确认已打款？",
      content: `请确认已向用户【${record.userName || record.user || record._openid || "-"}】打款 ¥${record.amount}`,
      okText: "确认打款",
      cancelText: "取消",
      onOk: async () => {
        try {
          await processWithdraw(record._id, "confirm");
          message.success("操作成功！");
          loadData();
        } catch (e) {
          message.error(e.message || "操作失败");
        }
      },
    });
  };

  const handleRejectOpen = (record) => {
    setRejectModal({ visible: true, record, reason: "", submitting: false });
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      message.warning("请输入驳回原因");
      return;
    }
    setRejectModal(modal => ({ ...modal, submitting: true }));
    try {
      await processWithdraw(rejectModal.record._id, "reject", rejectModal.reason);
      message.success("已驳回提现请求");
      setRejectModal({ visible: false, record: null, reason: "", submitting: false });
      loadData();
    } catch (e) {
      message.error(e.message || "驳回失败");
      setRejectModal(modal => ({ ...modal, submitting: false }));
    }
  };

  const columns = [
    {
      title: "用户",
      dataIndex: "userName",
      key: "user",
      render: (v, r) => v || r.user || r._openid || "-",
    },
    {
      title: "提现金额",
      dataIndex: "amount",
      key: "amount",
      render: v => v ? `¥${v}` : "-",
    },
    {
      title: "提现方式",
      dataIndex: "method",
      key: "method",
      render: (v, r) => v || r.methodName || "-",
    },
    {
      title: "申请时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: v =>
        v
          ? new Date(v).toLocaleString()
          : "-",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleConfirm(record)}>
            确认打款
          </Button>
          <Button size="small" danger onClick={() => handleRejectOpen(record)}>
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>提现管理</h2>
      <Table
        rowKey="_id"
        dataSource={withdraws}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="驳回提现申请"
        visible={rejectModal.visible}
        onCancel={() => setRejectModal({ visible: false, record: null, reason: "", submitting: false })}
        onOk={handleReject}
        okText="确认驳回"
        confirmLoading={rejectModal.submitting}
      >
        <div style={{ marginBottom: 8 }}>
          <b>用户：</b>{rejectModal.record?.userName || rejectModal.record?.user || rejectModal.record?._openid}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>提现金额：</b>¥{rejectModal.record?.amount}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>提现方式：</b>{rejectModal.record?.method || rejectModal.record?.methodName}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>申请时间：</b>
          {rejectModal.record?.createdAt
            ? new Date(rejectModal.record.createdAt).toLocaleString()
            : "-"}
        </div>
        <div>
          <b>驳回原因：</b>
          <textarea
            rows={3}
            style={{ width: "100%", marginTop: 4, borderRadius: 4, border: "1px solid #eee", padding: 8 }}
            placeholder="请输入驳回原因"
            value={rejectModal.reason}
            onChange={e =>
              setRejectModal(modal => ({ ...modal, reason: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default WithdrawManagement;