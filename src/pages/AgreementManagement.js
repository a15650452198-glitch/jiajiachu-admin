import React, { useState, useEffect } from "react";
import { Select, Button, message, Modal } from "antd";

const { Option } = Select;

const AGREEMENT_TYPES = [
  { key: "userService", label: "用户服务协议" },
  { key: "independentService", label: "独立服务者协议" },
  { key: "platformService", label: "平台服务协议" },
  { key: "privacyPolicy", label: "隐私政策" },
];

// 读取协议内容
async function fetchAgreements() {
  try {
    const res = await fetch("/api/settings/agreements");
    if (!res.ok) throw new Error("网络异常");
    const data = await res.json();
    return data || {};
  } catch (e) {
    return {};
  }
}

// 保存协议内容
async function saveAgreements(agreements) {
  try {
    const res = await fetch("/api/settings/agreements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agreements }),
    });
    if (!res.ok) throw new Error("保存失败");
    return await res.json();
  } catch (e) {
    throw e;
  }
}

const AgreementManagement = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentType, setCurrentType] = useState(AGREEMENT_TYPES[0].key);
  const [agreements, setAgreements] = useState({});
  const [content, setContent] = useState("");
  const [previewModal, setPreviewModal] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetchAgreements()
      .then(data => {
        if (!ignore) {
          setAgreements(data);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => (ignore = true);
  }, []);

  useEffect(() => {
    setContent(agreements[currentType] || "");
  }, [agreements, currentType]);

  const handleTypeChange = (value) => {
    if (agreements[currentType] !== undefined && agreements[currentType] !== content) {
      Modal.confirm({
        title: "内容未保存，是否切换？",
        content: "切换后当前修改不会保留，请先保存。",
        onOk: () => {
          setCurrentType(value);
        },
      });
    } else {
      setCurrentType(value);
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleSave = async () => {
    const newAgreements = { ...agreements, [currentType]: content };
    setSaving(true);
    try {
      await saveAgreements(newAgreements);
      setAgreements(newAgreements);
      message.success("保存成功");
    } catch (e) {
      message.error(e.message || "保存失败");
    }
    setSaving(false);
  };

  const handlePreview = () => {
    setPreviewModal(true);
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h2>协议管理</h2>
      <div style={{ marginBottom: 16 }}>
        <Select
          value={currentType}
          onChange={handleTypeChange}
          style={{ width: 220 }}
          disabled={loading}
        >
          {AGREEMENT_TYPES.map((ag) => (
            <Option key={ag.key} value={ag.key}>
              {ag.label}
            </Option>
          ))}
        </Select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: "bold" }}>
          {AGREEMENT_TYPES.find(a => a.key === currentType)?.label} 内容
        </div>
        <textarea
          rows={15}
          value={content}
          onChange={handleContentChange}
          style={{
            width: "100%",
            fontSize: 15,
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 12,
            minHeight: 320,
          }}
          placeholder="请输入协议内容，支持部分HTML（如需要）"
          disabled={loading}
        />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Button
          type="primary"
          onClick={handleSave}
          loading={saving}
          disabled={loading}
        >
          保存
        </Button>
        <Button onClick={handlePreview} disabled={loading || !content}>
          预览
        </Button>
      </div>
      <Modal
        title={AGREEMENT_TYPES.find(a => a.key === currentType)?.label + " - 预览"}
        visible={previewModal}
        onCancel={() => setPreviewModal(false)}
        footer={null}
        width={700}
      >
        <div
          style={{ background: "#f7f8fa", padding: 20, minHeight: 300, borderRadius: 6 }}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </Modal>
    </div>
  );
};

export default AgreementManagement;