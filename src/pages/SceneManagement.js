import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Switch,
  Input,
  message,
  Space,
  Popconfirm,
  Form,
  Select
} from "antd";
import { FaApple, FaLeaf, FaTree, FaBicycle, FaCloudSun } from "react-icons/fa";

const ICON_LIST = [
  { label: "Apple", value: "FaApple", icon: <FaApple /> },
  { label: "Leaf", value: "FaLeaf", icon: <FaLeaf /> },
  { label: "Tree", value: "FaTree", icon: <FaTree /> },
  { label: "Bicycle", value: "FaBicycle", icon: <FaBicycle /> },
  { label: "CloudSun", value: "FaCloudSun", icon: <FaCloudSun /> }
];
const ICONS = {
  FaApple: <FaApple />,
  FaLeaf: <FaLeaf />,
  FaTree: <FaTree />,
  FaBicycle: <FaBicycle />,
  FaCloudSun: <FaCloudSun />
};

const fetchScenes = async () => {
  // 真实场景下应替换为API调用
  try {
    const res = await fetch("/api/settings/scenes");
    if (!res.ok) throw new Error("网络错误");
    const data = await res.json();
    return data || [];
  } catch {
    // 默认mock
    return [
      { _id: "1", name: "健康生活", icon: "FaLeaf", desc: "健康相关场景", enabled: true, sort: 1 },
      { _id: "2", name: "绿色出行", icon: "FaBicycle", desc: "出行场景", enabled: false, sort: 2 }
    ];
  }
};

const saveScenes = async (scenesArr) => {
  // 真实场景下应替换为API调用
  try {
    const res = await fetch("/api/settings/scenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: scenesArr })
    });
    if (!res.ok) throw new Error("保存失败");
    return true;
  } catch {
    return false;
  }
};

const SceneManagement = () => {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, editing: false, record: null });
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await fetchScenes();
    setScenes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  const handleAdd = () => {
    setModal({ open: true, editing: false, record: null });
    form.resetFields();
  };

  const handleEdit = (record) => {
    setModal({ open: true, editing: true, record });
    form.setFieldsValue(record);
  };

  const handleDelete = async (record) => {
    const newList = scenes.filter(item => item._id !== record._id);
    const ok = await saveScenes(newList);
    if (ok) {
      message.success("删除成功");
      setScenes(newList);
    } else {
      message.error("删除失败");
    }
  };

  const handleEnableChange = async (checked, record) => {
    const newList = scenes.map(item =>
      item._id === record._id ? { ...item, enabled: checked } : item
    );
    const ok = await saveScenes(newList);
    if (ok) {
      setScenes(newList);
    } else {
      message.error("更新失败");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      let newList;
      if (modal.editing) {
        newList = scenes.map(item =>
          item._id === modal.record._id
            ? { ...item, ...values, _id: modal.record._id }
            : item
        );
      } else {
        const newScene = {
          ...values,
          enabled: true,
          _id: Date.now().toString()
        };
        newList = [...scenes, newScene];
      }
      // 按 sort 升序排序
      newList.sort((a, b) => (a.sort || 0) - (b.sort || 0));
      const ok = await saveScenes(newList);
      if (ok) {
        setScenes(newList);
        setModal({ ...modal, open: false });
        message.success("保存成功");
      } else {
        message.error("保存失败");
      }
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "排序",
      dataIndex: "sort",
      width: 80
    },
    {
      title: "名称",
      dataIndex: "name",
      width: 140
    },
    {
      title: "图标",
      dataIndex: "icon",
      width: 100,
      render: val => ICONS[val] || <span style={{ color: "#bbb" }}>未选</span>
    },
    {
      title: "描述",
      dataIndex: "desc"
    },
    {
      title: "是否启用",
      dataIndex: "enabled",
      width: 100,
      render: (val, record) =>
        <Switch checked={val} onChange={checked => handleEnableChange(checked, record)} />
    },
    {
      title: "操作",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>新增场景</Button>
        <Button onClick={loadData}>刷新</Button>
      </Space>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={scenes}
        loading={loading}
        pagination={false}
        bordered
      />
      <Modal
        open={modal.open}
        title={modal.editing ? "编辑场景" : "新增场景"}
        onCancel={() => setModal({ ...modal, open: false })}
        onOk={handleSave}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ sort: 1, enabled: true }}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: "请输入场景名称" }]}
          >
            <Input placeholder="场景名称" maxLength={24} />
          </Form.Item>
          <Form.Item
            label="图标"
            name="icon"
            rules={[{ required: true, message: "请选择图标" }]}
          >
            <Select showSearch optionLabelProp="label" placeholder="请选择图标">
              {ICON_LIST.map(i =>
                <Select.Option key={i.value} value={i.value} label={i.label}>
                  <span style={{ marginRight: 8, fontSize: 18 }}>{i.icon}</span>
                  {i.label}
                </Select.Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item
            label="描述"
            name="desc"
            rules={[{ required: true, message: "请输入描述" }]}
          >
            <Input.TextArea rows={2} placeholder="场景描述" maxLength={64} />
          </Form.Item>
          <Form.Item
            label="排序（数字越小越靠前）"
            name="sort"
            rules={[
              { required: true, message: "请输入排序" },
              { pattern: /^\d+$/, message: "请输入数字" }
            ]}
          >
            <Input placeholder="如：1" maxLength={5} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SceneManagement;
