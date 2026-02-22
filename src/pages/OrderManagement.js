import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  DatePicker,
  Select,
  Modal,
  Input,
  message,
  Space,
  Tooltip,
  Checkbox,
  Descriptions,
  Image
} from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;
const refundStatusMap = {
  pending: <Tag color="gold">待审核</Tag>,
  approved: <Tag color="green">已通过</Tag>,
  rejected: <Tag color="red">已驳回</Tag>
};
const orderStatusOpts = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待退款审核" },
  { value: "mediation", label: "调解中" },
  { value: "completed", label: "已完成" }
];

const STATUS_LABEL = {
  pending: "待退款审核",
  mediation: "调解中",
  completed: "已完成"
};

const fetchOrders = async (filters) => {
  // 模拟请求
  // TODO: 替换为实际接口
  return [];
};

const fetchRefunds = async (filters) => {
  // TODO
  return [];
};

const fetchDisputes = async (filters) => {
  // TODO
  return [];
};

const processRefund = async ({ refundId, approved, reason }) => {
  // TODO: 替换为实际云函数调用
  message.success(approved ? "已通过退款" : "已驳回退款");
};

const OrderManagement = () => {
  const [tab, setTab] = useState("all");
  const [orderFilters, setOrderFilters] = useState({
    status: "all",
    valueAdded: false,
    range: null
  });
  const [orderList, setOrderList] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const [detailModal, setDetailModal] = useState({
    open: false,
    record: null
  });

  const [refundList, setRefundList] = useState([]);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundActionModal, setRefundActionModal] = useState({
    open: false,
    record: null,
    approve: true,
    reason: ""
  });

  const [disputeList, setDisputeList] = useState([]);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [mediateModal, setMediateModal] = useState({
    open: false,
    record: null,
    result: ""
  });

  // 拉取订单
  useEffect(() => {
    if (tab === "全部" || tab === "all" || orderStatusOpts.some(o => o.value === tab)) {
      setOrderLoading(true);
      fetchOrders(orderFilters)
        .then(list => setOrderList(list))
        .finally(() => setOrderLoading(false));
    }
  }, [orderFilters, tab]);

  // 拉取退款
  useEffect(() => {
    if (tab === "refund") {
      setRefundLoading(true);
      fetchRefunds({})
        .then(list => setRefundList(list))
        .finally(() => setRefundLoading(false));
    }
  }, [tab]);

  // 拉取调解
  useEffect(() => {
    if (tab === "mediate") {
      setDisputeLoading(true);
      fetchDisputes({})
        .then(list => setDisputeList(list))
        .finally(() => setDisputeLoading(false));
    }
  }, [tab]);

  // 订单Tab表格
  const orderColumns = [
    { title: "订单号", dataIndex: "orderNo", key: "orderNo" },
    { title: "用户", dataIndex: "userName", key: "userName" },
    { title: "厨师", dataIndex: "chefName", key: "chefName" },
    {
      title: "服务时间",
      dataIndex: "serviceTime",
      key: "serviceTime",
      render: (v) => v ? dayjs(v).format("YYYY-MM-DD HH:mm") : ""
    },
    { title: "金额", dataIndex: "amount", key: "amount", render: v => `￥${v}` },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: v => <Tag>{STATUS_LABEL[v] || v}</Tag>
    },
    {
      title: "退款状态",
      dataIndex: "refundStatus",
      key: "refundStatus",
      render: v => refundStatusMap[v] || <Tag>无</Tag>
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => setDetailModal({ open: true, record })}>
          查看详情
        </Button>
      )
    }
  ];

  // 退款Tab表格
  const refundColumns = [
    { title: "用户", dataIndex: "userName", key: "userName" },
    { title: "订单号", dataIndex: "orderNo", key: "orderNo" },
    { title: "申请金额", dataIndex: "amount", key: "amount", render: v => `￥${v}` },
    { title: "原因", dataIndex: "reason", key: "reason" },
    {
      title: "凭证",
      dataIndex: "vouchers",
      key: "vouchers",
      render: v => v && v.length
        ? v.map((url, i) => <Image key={i} src={url} width={40} style={{ marginRight: 4 }} />)
        : "无"
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => setRefundActionModal({ open: true, record, approve: true, reason: "" })}
            disabled={record.status === "approved"}
          >
            通过
          </Button>
          <Button
            size="small"
            danger
            onClick={() => setRefundActionModal({ open: true, record, approve: false, reason: "" })}
            disabled={record.status === "rejected"}
          >
            驳回
          </Button>
        </Space>
      )
    }
  ];

  // 调解Tab表格
  const disputeColumns = [
    { title: "争议ID", dataIndex: "_id", key: "_id" },
    { title: "订单号", dataIndex: "orderNo", key: "orderNo" },
    { title: "用户", dataIndex: "userName", key: "userName" },
    { title: "厨师", dataIndex: "chefName", key: "chefName" },
    { title: "争议描述", dataIndex: "desc", key: "desc" },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: v => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "")
    },
    { title: "状态", dataIndex: "status", key: "status", render: s => <Tag>{s}</Tag> },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Button size="small" type="primary" onClick={() => setMediateModal({ open: true, record, result: "" })}>
          调解
        </Button>
      )
    }
  ];

  // 操作Refund弹窗
  const handleRefundAction = async () => {
    if (!refundActionModal.approve && !refundActionModal.reason) {
      message.warning("请输入驳回原因");
      return;
    }
    await processRefund({
      refundId: refundActionModal.record._id,
      approved: refundActionModal.approve,
      reason: refundActionModal.reason
    });
    setRefundActionModal({ ...refundActionModal, open: false });
    // 刷新
    fetchRefunds({}).then(list => setRefundList(list));
  };

  // 调解结果
  const handleMediate = () => {
    // TODO: 替换为接口, 这里简单本地模拟
    message.success("已记录调解结果");
    setMediateModal({ ...mediateModal, open: false });
    // 可以刷新dispute列表
    fetchDisputes({}).then(list => setDisputeList(list));
  };

  // 筛选栏
  const orderFilterBar = (
    <Space wrap style={{ marginBottom: 16 }}>
      <Select
        value={orderFilters.status}
        style={{ width: 150 }}
        onChange={status => setOrderFilters(s => ({ ...s, status }))}
      >
        {orderStatusOpts.map(opt => (
          <Option value={opt.value} key={opt.value}>
            {opt.label}
          </Option>
        ))}
      </Select>
      <RangePicker
        value={orderFilters.range}
        onChange={range => setOrderFilters(s => ({ ...s, range }))}
      />
      <Checkbox
        checked={orderFilters.valueAdded}
        onChange={e => setOrderFilters(s => ({ ...s, valueAdded: e.target.checked }))}
      >
        含增值服务
      </Checkbox>
    </Space>
  );

  return (
    <div>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          { label: "全部", key: "all" },
          { label: "待退款审核", key: "pending" },
          { label: "调解中", key: "mediation" },
          { label: "已完成", key: "completed" },
          { label: "退款管理", key: "refund" },
          { label: "调解管理", key: "mediate" }
        ]}
      />
      {/* 订单Tab内容 */}
      {!["refund", "mediate"].includes(tab) && (
        <>
          {orderFilterBar}
          <Table
            rowKey="orderNo"
            loading={orderLoading}
            columns={orderColumns}
            dataSource={orderList.filter(order => {
              if (tab !== "all" && order.status !== tab) return false;
              if (
                orderFilters.status !== "all" &&
                order.status !== orderFilters.status
              )
                return false;
              if (
                orderFilters.valueAdded &&
                !order.valueAdded // 假设字段
              )
                return false;
              if (orderFilters.range && orderFilters.range.length === 2) {
                const [start, end] = orderFilters.range;
                if (
                  dayjs(order.serviceTime).isBefore(start, "day") ||
                  dayjs(order.serviceTime).isAfter(end, "day")
                )
                  return false;
              }
              return true;
            })}
            pagination={{ pageSize: 10 }}
          />

          {/* 订单详情弹窗 */}
          <Modal
            open={detailModal.open}
            title="订单详情"
            width={700}
            onCancel={() => setDetailModal({ ...detailModal, open: false })}
            footer={null}
          >
            {detailModal.record && (
              <Descriptions column={2} bordered>
                <Descriptions.Item label="订单号">{detailModal.record.orderNo}</Descriptions.Item>
                <Descriptions.Item label="用户">{detailModal.record.userName}</Descriptions.Item>
                <Descriptions.Item label="厨师">{detailModal.record.chefName}</Descriptions.Item>
                <Descriptions.Item label="金额">{detailModal.record.amount}</Descriptions.Item>
                <Descriptions.Item label="服务时间">
                  {detailModal.record.serviceTime ? dayjs(detailModal.record.serviceTime).format("YYYY-MM-DD HH:mm") : ""}
                </Descriptions.Item>
                <Descriptions.Item label="状态">{STATUS_LABEL[detailModal.record.status]}</Descriptions.Item>
                <Descriptions.Item label="退款状态">{refundStatusMap[detailModal.record.refundStatus]}</Descriptions.Item>
                <Descriptions.Item label="增值服务">{detailModal.record.valueAdded ? "有" : "无"}</Descriptions.Item>
                <Descriptions.Item label="留痕照片" span={2}>
                  {detailModal.record.photos && detailModal.record.photos.length
                    ? detailModal.record.photos.map((url, i) => (
                      <Image key={i} src={url} width={80} style={{ marginRight: 6 }} />
                    ))
                    : "无"}
                </Descriptions.Item>
                <Descriptions.Item label="采购凭证" span={2}>
                  {detailModal.record.invoices && detailModal.record.invoices.length
                    ? detailModal.record.invoices.map((url, i) => (
                      <Image key={i} src={url} width={80} style={{ marginRight: 6 }} />
                    ))
                    : "无"}
                </Descriptions.Item>
                <Descriptions.Item label="分账信息" span={2}>
                  {detailModal.record.profitSharing
                    ? `平台：${detailModal.record.profitSharing.platform || "--"}, 厨师：${detailModal.record.profitSharing.chef || "--"}`
                    : "无"}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </>
      )}

      {/* 退款管理区 */}
      {tab === "refund" && (
        <>
          <Table
            rowKey="_id"
            loading={refundLoading}
            columns={refundColumns}
            dataSource={refundList}
            pagination={{ pageSize: 10 }}
          />
          <Modal
            open={refundActionModal.open}
            title={refundActionModal.approve ? "确认通过退款" : "驳回退款"}
            onCancel={() => setRefundActionModal({ ...refundActionModal, open: false })}
            onOk={handleRefundAction}
          >
            <div>
              <p>
                {refundActionModal.approve
                  ? "确认通过此退款申请？"
                  : "请输入驳回原因："}
              </p>
              {!refundActionModal.approve && (
                <Input.TextArea
                  rows={3}
                  value={refundActionModal.reason}
                  onChange={e =>
                    setRefundActionModal(modal => ({
                      ...modal,
                      reason: e.target.value
                    }))
                  }
                  placeholder="请输入驳回原因"
                />
              )}
            </div>
          </Modal>
        </>
      )}

      {/* 调解管理区 */}
      {tab === "mediate" && (
        <>
          <Table
            rowKey="_id"
            loading={disputeLoading}
            columns={disputeColumns}
            dataSource={disputeList}
            pagination={{ pageSize: 10 }}
          />
          <Modal
            open={mediateModal.open}
            title="记录调解结果"
            onCancel={() => setMediateModal({ ...mediateModal, open: false })}
            onOk={handleMediate}
          >
            <div>
              <p>请输入调解结果说明：</p>
              <Input.TextArea
                rows={4}
                value={mediateModal.result}
                onChange={e =>
                  setMediateModal(modal => ({
                    ...modal,
                    result: e.target.value
                  }))
                }
                placeholder="调解处理结果"
              />
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default OrderManagement;