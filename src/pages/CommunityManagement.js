import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  Tag,
  Modal,
  Space,
  Image,
  message
} from "antd";

const STATUS_MAP = {
  pending: { label: "待审核", color: "gold" },
  approved: { label: "已通过", color: "green" },
  rejected: { label: "已驳回", color: "red" }
};

// 模拟获取内容数据
const mockFetchContentList = async (status) => {
  // TODO: 替换为真实接口
  return [
    {
      _id: "1",
      author: "张三",
      type: "图片",
      images: [
        "https://via.placeholder.com/60"
      ],
      text: "这是一个测试社区内容，非常丰富详细且有意义。",
      createdAt: "2024-06-06 21:10",
      status,
      fullImages: [
        "https://via.placeholder.com/400"
      ]
    },
    {
      _id: "2",
      author: "李四",
      type: "话题",
      images: [],
      text: "文字内容预览，包含有趣的社区话题内容。",
      createdAt: "2024-06-06 20:59",
      status,
      fullImages: []
    }
  ];
};

// 模拟审批接口
const mockReviewContent = async ({ id, action, reason }) => {
  // TODO: 替换为真实接口
  return { success: true };
};

const tabItems = [
  { key: "pending", label: "待审核" },
  { key: "approved", label: "已通过" },
  { key: "rejected", label: "已驳回" }
];

const CommunityManagement = () => {
  const [tab, setTab] = useState("pending");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState({
    open: false,
    record: null,
    rejectReason: ""
  });

  const fetchList = async () => {
    setLoading(true);
    const data = await mockFetchContentList(tab);
    setList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line
  }, [tab]);

  const handleReview = (record) => {
    setReviewModal({ open: true, record, rejectReason: "" });
  };

  const handleCloseModal = () => {
    setReviewModal({ open: false, record: null, rejectReason: "" });
  };

  const handleApprove = async () => {
    const id = reviewModal.record._id;
    await mockReviewContent({ id, action: "approved" });
    message.success("内容已通过审核");
    handleCloseModal();
    fetchList();
  };

  const handleReject = async () => {
    if (!reviewModal.rejectReason.trim()) {
      message.warning("请输入驳回原因");
      return;
    }
    const id = reviewModal.record._id;
    await mockReviewContent({
      id,
      action: "rejected",
      reason: reviewModal.rejectReason
    });
    message.success("内容已驳回");
    handleCloseModal();
    fetchList();
  };

  const columns = [
    {
      title: "发布人",
      dataIndex: "author",
      key: "author"
    },
    {
      title: "内容类型",
      dataIndex: "type",
      key: "type"
    },
    {
      title: "图片",
      dataIndex: "images",
      key: "images",
      render: (imgs) =>
        imgs && imgs.length > 0
          ? (
            <Space>
              {imgs.slice(0, 2).map((img, idx) => (
                <Image
                  key={idx}
                  width={48}
                  height={48}
                  src={img}
                  preview={false}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              ))}
              {imgs.length > 2 ? <span>+{imgs.length - 2}</span> : null}
            </Space>
          )
          : <span style={{ color: "#ccc" }}>-</span>
    },
    {
      title: "文字预览",
      dataIndex: "text",
      key: "text",
      render: text => (
        <span>
          {text?.length > 18 ? text.slice(0, 18) + "..." : text}
        </span>
      )
    },
    {
      title: "发布时间",
      dataIndex: "createdAt",
      key: "createdAt"
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        <Tag color={STATUS_MAP[status]?.color}>
          {STATUS_MAP[status]?.label}
        </Tag>
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) =>
        tab === "pending" ? (
          <Button type="primary" size="small" onClick={() => handleReview(record)}>
            审核
          </Button>
        ) : null
    }
  ];

  return (
    <div>
      <Tabs
        items={tabItems}
        activeKey={tab}
        onChange={setTab}
        style={{ marginBottom: 16 }}
      />
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={list}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        open={reviewModal.open}
        title="内容审核"
        onCancel={handleCloseModal}
        footer={
          reviewModal.record && tab === "pending" ? (
            <Space>
              <Button onClick={handleCloseModal}>取消</Button>
              <Button
                danger
                onClick={handleReject}
              >
                驳回
              </Button>
              <Button
                type="primary"
                onClick={handleApprove}
              >
                通过
              </Button>
            </Space>
          ) : null
        }
        width={500}
      >
        {reviewModal.record && (
          <div>
            <div style={{ marginBottom: 8 }}>
              <b>发布人：</b>{reviewModal.record.author}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>类型：</b>{reviewModal.record.type}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>图片：</b>
              <Space>
                {(reviewModal.record.fullImages || reviewModal.record.images || []).length > 0
                  ? (reviewModal.record.fullImages || reviewModal.record.images).map((img, idx) =>
                      <Image key={idx} src={img} width={120} height={120}
                        style={{ objectFit: "cover", borderRadius: 6 }} />
                    )
                  : <span style={{ color: "#ccc" }}>-</span>
                }
              </Space>
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>内容：</b>
              <div style={{
                maxHeight: 160,
                overflowY: "auto",
                background: "#fafafa",
                padding: 10,
                borderRadius: 4
              }}>
                {reviewModal.record.text}
              </div>
            </div>
            {tab === "pending" && (
              <div style={{ marginTop: 12 }}>
                <b>驳回原因：</b>
                <textarea
                  rows={2}
                  style={{ width: "100%", marginTop: 4, borderRadius: 4, border: "1px solid #eee", padding: 8 }}
                  placeholder="如需驳回，请填写原因"
                  value={reviewModal.rejectReason}
                  onChange={e =>
                    setReviewModal(modal => ({ ...modal, rejectReason: e.target.value }))
                  }
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommunityManagement;