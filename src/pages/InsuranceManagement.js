import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Select, message } from "antd";

const { Option } = Select;

// 获取保险记录
async function fetchInsuranceRecords(status) {
  try {
    let url = "/api/insuranceRecords";
    if (status && status !== "all") {
      url += `?status=${status}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("网络错误");
    const data = await res.json();
    return data || [];
  } catch (e) {
    return [];
  }
}

const InsuranceManagement = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [detailModal, setDetailModal] = useState({
    visible: false,
    record: null,
    loading: false,
    detail: null,
  });

  const loadData = async (status) => {
    setLoading(true);
    const data = await fetchInsuranceRecords(status);
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData(filterStatus);
    // eslint-disable-next-line
  }, [filterStatus]);

  const handleDetail = async (record) => {
    setDetailModal({
      visible: true,
      record,
      loading: true,
      detail: null,
    });
    try {
      const res = await fetch(`/api/insuranceRecords/${record._id}`);
      if (!res.ok) throw new Error("获取详情失败");
      const detail = await res.json();
      setDetailModal(modal => ({
        ...modal,
        loading: false,
        detail,
      }));
    } catch (e) {
      setDetailModal(modal => ({
        ...modal,
        loading: false,
        detail: null,
      }));
      message.error("获取详情失败");
    }
  };

  const columns = [
    {
      title: "厨师姓名",
      dataIndex: "chefName",
      key: "chefName",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleDetail(record)}
          style={{ padding: 0 }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "保单号",
      dataIndex: "policyNumber",
      key: "policyNumber",
    },
    {
      title: "保险公司",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "有效期",
      dataIndex: "validPeriod",
      key: "validPeriod",
      render: (val, record) => {
        // 假设有 validFrom 和 validTo
        const from = record.validFrom
          ? new Date(record.validFrom).toLocaleDateString()
          : "-";
        const to = record.validTo
          ? new Date(record.validTo).toLocaleDateString()
          : "-";
        return `${from} ~ ${to}`;
      },
    },
    {
      title: "保费",
      dataIndex: "premium",
      key: "premium",
      render: val => (val != null ? `¥${val}` : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        let s = status;
        // 若没有status，自动判断有效期
        if (!s) {
          if (record.validTo && new Date(record.validTo) < new Date()) {
            s = "expired";
          } else {
            s = "active";
          }
        }
        return s === "active"
          ? <span style={{ color: "#52c41a" }}>有效</span>
          : <span style={{ color: "#999" }}>已过期</span>;
      },
      filters: [
        { text: "有效", value: "active" },
        { text: "已过期", value: "expired" },
      ],
      onFilter: (value, record) => {
        let s = record.status;
        if (!s) {
          if (record.validTo && new Date(record.validTo) < new Date()) {
            s = "expired";
          } else {
            s = "active";
          }
        }
        return s === value;
      },
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>保险管理</h2>
      <div style={{ marginBottom: 16 }}>
        <span>筛选状态：</span>
        <Select
          style={{ width: 120 }}
          value={filterStatus}
          onChange={val => setFilterStatus(val)}
        >
          <Option value="all">全部</Option>
          <Option value="active">有效</Option>
          <Option value="expired">已过期</Option>
        </Select>
      </div>
      <Table
        rowKey="_id"
        dataSource={records}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={
          detailModal.detail
            ? `保险详情 - ${detailModal.detail.chefName || detailModal.record?.chefName}`
            : "保险详情"
        }
        visible={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, record: null, loading: false, detail: null })}
        footer={null}
        width={520}
      >
        {detailModal.loading ? (
          <div>加载中...</div>
        ) : detailModal.detail ? (
          <div>
            <div style={{ marginBottom: 8 }}>
              <b>厨师姓名：</b>
              {detailModal.detail.chefName}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>身份证号：</b>
              {detailModal.detail.idNumber || "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>保险公司：</b>
              {detailModal.detail.company}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>保单号：</b>
              {detailModal.detail.policyNumber}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>保险产品：</b>
              {detailModal.detail.product || "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>保障范围：</b>
              {detailModal.detail.coverage || "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>保费：</b>
              {detailModal.detail.premium != null ? `¥${detailModal.detail.premium}` : "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>生效日期：</b>
              {detailModal.detail.validFrom
                ? new Date(detailModal.detail.validFrom).toLocaleDateString()
                : "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>到期日期：</b>
              {detailModal.detail.validTo
                ? new Date(detailModal.detail.validTo).toLocaleDateString()
                : "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>状态：</b>
              {(() => {
                let s = detailModal.detail.status;
                if (!s) {
                  if (detailModal.detail.validTo && new Date(detailModal.detail.validTo) < new Date()) {
                    s = "expired";
                  } else {
                    s = "active";
                  }
                }
                return s === "active"
                  ? <span style={{ color: "#52c41a" }}>有效</span>
                  : <span style={{ color: "#999" }}>已过期</span>;
              })()}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>备注：</b>
              {detailModal.detail.remark || "-"}
            </div>
          </div>
        ) : (
          <div>暂无详情</div>
        )}
      </Modal>
    </div>
  );
};

export default InsuranceManagement;