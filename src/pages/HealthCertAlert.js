import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal } from "antd";

// 获取即将到期健康证厨师列表
async function fetchExpiringHealthCerts() {
  try {
    const res = await fetch("/api/chefs/expiringHealthCerts?days=30");
    if (!res.ok) throw new Error("网络异常");
    const data = await res.json();
    return data || [];
  } catch (e) {
    return [];
  }
}

// 发送健康证提醒
async function sendHealthCertReminder(chefId) {
  try {
    const res = await fetch("/api/sendHealthCertReminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chefId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "发送失败");
    }
    return await res.json();
  } catch (e) {
    throw e;
  }
}

// 获取提醒历史
async function fetchReminderHistory(chefId) {
  try {
    const res = await fetch(`/api/chefs/${chefId}/healthCertReminderHistory`);
    if (!res.ok) throw new Error("获取提醒历史失败");
    const data = await res.json();
    return data || [];
  } catch (e) {
    return [];
  }
}

const HealthCertAlert = () => {
  const [loading, setLoading] = useState(false);
  const [chefs, setChefs] = useState([]);
  const [reminderHistoryModal, setReminderHistoryModal] = useState({
    visible: false,
    loading: false,
    history: [],
    chefName: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await fetchExpiringHealthCerts();
    setChefs(data);
    setLoading(false);
  }

  const handleSendReminder = async (chef) => {
    Modal.confirm({
      title: `确认发送提醒？`,
      content: `将向厨师"${chef.name}"（${chef.phone}）发送站内信/短信，督促更新健康证。`,
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        try {
          await sendHealthCertReminder(chef._id);
          message.success("提醒已发送");
          await loadData();
        } catch (e) {
          message.error(e.message || "发送失败");
        }
      }
    });
  };

  const handleShowReminderHistory = async (chef) => {
    setReminderHistoryModal({
      visible: true,
      loading: true,
      history: [],
      chefName: chef.name || "-",
    });
    const history = await fetchReminderHistory(chef._id);
    setReminderHistoryModal((modal) => ({
      ...modal,
      loading: false,
      history,
    }));
  };

  const columns = [
    { title: "厨师姓名", dataIndex: "name", key: "name" },
    { title: "手机号", dataIndex: "phone", key: "phone" },
    {
      title: "健康证有效期",
      dataIndex: "healthCertExpire",
      key: "healthCertExpire",
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "剩余天数",
      dataIndex: "daysLeft",
      key: "daysLeft",
      render: (days) => days != null ? (
        <span style={{ color: days <= 7 ? "#d4380d" : (days <= 15 ? "#faad14" : "#389e0d") }}>{days}天</span>
      ) : "-"
    },
    {
      title: "最后提醒时间",
      dataIndex: "lastRemindAt",
      key: "lastRemindAt",
      render: (date) => date ? new Date(date).toLocaleString() : "-"
    },
    {
      title: "操作",
      key: "action",
      render: (_, chef) => (
        <span>
          <Button
            size="small"
            type="primary"
            style={{ marginRight: 8 }}
            onClick={() => handleSendReminder(chef)}
          >
            发送提醒
          </Button>
          <Button
            size="small"
            onClick={() => handleShowReminderHistory(chef)}
          >
            提醒历史
          </Button>
        </span>
      )
    }
  ];

  return (
    <div>
      <h2>健康证预警管理</h2>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={chefs}
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title={`厨师"${reminderHistoryModal.chefName}"提醒历史`}
        visible={reminderHistoryModal.visible}
        footer={null}
        width={480}
        onCancel={() =>
          setReminderHistoryModal((modal) => ({ ...modal, visible: false }))
        }
      >
        {reminderHistoryModal.loading ? (
          <div>加载中...</div>
        ) : (
          <Table
            dataSource={reminderHistoryModal.history}
            rowKey={(row, idx) => row._id || idx}
            size="small"
            pagination={false}
            columns={[
              {
                title: "提醒时间",
                dataIndex: "remindAt",
                key: "remindAt",
                render: (date) => date ? new Date(date).toLocaleString() : "-",
              },
              {
                title: "方式",
                dataIndex: "method",
                key: "method",
                render: (method) =>
                  method === "message"
                    ? "站内信"
                    : method === "sms"
                    ? "短信"
                    : method || "-",
              },
              {
                title: "提醒内容",
                dataIndex: "content",
                key: "content",
                render: (content) => <span style={{ fontSize: 13 }}>{content}</span>,
              },
            ]}
            locale={{ emptyText: "无提醒记录" }}
          />
        )}
      </Modal>
    </div>
  );
};

export default HealthCertAlert;