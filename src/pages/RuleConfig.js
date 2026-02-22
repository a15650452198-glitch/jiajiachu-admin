import React, { useEffect, useState } from "react";
import {
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Select,
  message,
} from "antd";

const { TextArea } = Input;

const SETTLE_OPTIONS = [
  { value: "T+1", label: "T+1" },
  { value: "T+7", label: "T+7" },
];

// 云数据库API模拟，实际应使用真实API
async function fetchSettings() {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("网络错误");
    const data = await res.json();
    return data || {};
  } catch {
    // 默认配置
    return {};
  }
}
async function saveSettings(settings) {
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      body: JSON.stringify(settings),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("保存失败");
    return await res.json();
  } catch (e) {
    throw e;
  }
}

/**
 * 各Tab的内容Form
 */

const tabsConfig = [
  {
    key: "commission",
    tab: "分账/技术服务费规则",
  },
  {
    key: "valueService",
    tab: "增值服务规则",
  },
  {
    key: "cancelRefund",
    tab: "取消/退款规则",
  },
  {
    key: "service",
    tab: "服务规则",
  },
  {
    key: "settlement",
    tab: "结算配置",
  },
  {
    key: "insurance",
    tab: "保险规则",
  },
  {
    key: "healthAlert",
    tab: "健康证预警规则",
  },
];

const DEFAULTS = {
  commission: {
    techFeeRate: 5, // %
  },
  valueService: {
    enableFoodAgent: true,
    foodAgentFeeType: "rate",
    foodAgentFee: 10, // 10%
    kitchenwareFee: 0,
    seasoningFee: 0,
    enableKitchenware: true,
    enableSeasoning: true,
  },
  cancelRefund: {
    rule:
      "1. 用户下单后30分钟内可免费取消；\n2. 派单后取消，收取20%服务费；\n3. 服务已完成后不予退款。具体规则以平台说明为准。",
  },
  service: {
    orderTimeout: 10, // 分钟
    requirements:
      "1. 必须在接单后10分钟内响应。\n2. 服务全过程须拍照/留痕，包括食材验收、加工等关键流程。\n3. 其他要求见平台协议。",
  },
  settlement: {
    settlePeriod: "T+1",
    freezeDays: 1,
  },
  insurance: {
    rate: 1, // 元
    company: "",
    coverage: "",
  },
  healthAlert: {
    days: 30,
  },
};

const RuleConfig = () => {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [formRefs, setFormRefs] = useState({});

  useEffect(() => {
    fetchSettings().then((s) => {
      setSettings((old) => ({
        ...old,
        ...s,
      }));
    });
  }, []);

  // helpers
  const handleFormRef = (key, ref) => {
    setFormRefs(r => ({ ...r, [key]: ref }));
  };

  // 单tab保存
  const handleSave = async (tabKey) => {
    const form = formRefs[tabKey];
    if (form) {
      try {
        const values = await form.validateFields();
        setLoading(true);
        const newSettings = { ...settings, [tabKey]: values };
        await saveSettings(newSettings);
        setSettings(newSettings);
        message.success("保存成功");
      } catch (e) {
        // 校验/网络异常
        if (e?.errorFields) return; // 校验异常已提示
        message.error("保存失败");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", background: "#fff", padding: 24, borderRadius: 8 }}>
      <h2 style={{ marginBottom: 24 }}>规则配置</h2>
      <Tabs
        tabPosition="top"
        defaultActiveKey="commission"
        items={tabsConfig.map(({ key, tab }) => ({
          key,
          label: tab,
          children: (
            <div>
              {key === "commission" && (
                <Form
                  layout="vertical"
                  initialValues={settings.commission}
                  ref={ref => handleFormRef("commission", ref)}
                  key={"commission"}
                  onValuesChange={(_, all) =>
                    setSettings(s => ({ ...s, commission: all }))
                  }
                >
                  <Form.Item
                    label="平台技术服务费比例"
                    name="techFeeRate"
                    rules={[{ required: true, min: 0, max: 100, type: "number", message: "请输入0-100之间的比例" }]}
                    tooltip="平台每笔订单将收取的服务费比例"
                  >
                    <InputNumber min={0} max={100} addonAfter="%" />
                  </Form.Item>
                  <Button type="primary" onClick={() => handleSave("commission")} loading={loading}>
                    保存
                  </Button>
                </Form>
              )}
              {key === "valueService" && (
                <Form
                  layout="vertical"
                  initialValues={settings.valueService}
                  ref={ref => handleFormRef("valueService", ref)}
                  key={"valueService"}
                  onValuesChange={(_, all) =>
                    setSettings(s => ({ ...s, valueService: all }))
                  }
                >
                  <Form.Item label="启用代买食材服务" name="enableFoodAgent" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="代买食材服务费类型"
                    name="foodAgentFeeType"
                    dependencies={["enableFoodAgent"]}
                  >
                    <Select style={{ width: 120 }}>
                      <Select.Option value="rate">比例</Select.Option>
                      <Select.Option value="fixed">固定金额</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    shouldUpdate={(prev, curr) =>
                      prev.foodAgentFeeType !== curr.foodAgentFeeType
                    }
                    noStyle
                  >
                    {({ getFieldValue }) => (
                      <Form.Item
                        label="代买食材服务费"
                        name="foodAgentFee"
                        rules={[{ required: true, type: "number", min: 0, message: "请输入费用" }]}
                      >
                        <InputNumber
                          min={0}
                          addonAfter={
                            getFieldValue("foodAgentFeeType") === "rate" ? "%" : "元"
                          }
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                  <Form.Item label="启用厨具费" name="enableKitchenware" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="厨具费"
                    name="kitchenwareFee"
                    rules={[{ type: "number", min: 0 }]}
                  >
                    <InputNumber min={0} addonAfter="元" />
                  </Form.Item>
                  <Form.Item label="启用配料费" name="enableSeasoning" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="配料费"
                    name="seasoningFee"
                    rules={[{ type: "number", min: 0 }]}
                  >
                    <InputNumber min={0} addonAfter="元" />
                  </Form.Item>
                  <Button type="primary" onClick={() => handleSave("valueService")} loading={loading}>
                    保存
                  </Button>
                </Form>
              )}
              {key === "cancelRefund" && (
                <Form
                  layout="vertical"
                  initialValues={settings.cancelRefund}
                  ref={ref => handleFormRef("cancelRefund", ref)}
                  key={"cancelRefund"}
                  onValuesChange={(_, all) =>
                    setSettings(s => ({ ...s, cancelRefund: all }))
                  }
                >
                  <Form.Item
                    label="取消/退款规则说明"
                    name="rule"
                    rules={[{ required: true, message: "请输入规则说明" }]}
                  >
                    <TextArea rows={6} />
                  </Form.Item>
                  <Button type="primary" onClick={() => handleSave("cancelRefund")} loading={loading}>
                    保存
                  </Button>
                </Form>
              )}
              {key === "service" && (
                <Form
                  layout="vertical"
                  initialValues={settings.service}
                  ref={ref => handleFormRef("service", ref)}
                  key={"service"}
                  onValuesChange={(_, all) =>
                    setSettings(s => ({ ...s, service: all }))
                  }
                >
                  <Form.Item
                    label="接单时效"
                    name="orderTimeout"
                    rules={[
                      { required: true, type: "number", min: 1, max: 120, message: "请输入1-120分钟" }
                    ]}
                    tooltip="接单后需在该时间内响应，单位：分钟"
                  >
                    <InputNumber min={1} max={120} addonAfter="分钟" />
                  </Form.Item>
                  <Form.Item
                    label="服务细则/留痕照片要求"
                    name="requirements"
                    rules={[{ required: true, message: "请输入服务细则" }]}
                  >
                    <TextArea rows={5} />
                  </Form.Item>
                  <Button type="primary" onClick={() => handleSave("service")} loading={loading}>
                    保存
                  </Button>
                </Form>
              )}
              {key === "settlement" && (
                <Form
                  layout="vertical"
                  initialValues={settings.settlement}
                  ref={ref => handleFormRef("settlement", ref)}
                  key={"settlement"}
                  onValuesChange={(_, all) =>
                    setSettings(s => ({ ...s, settlement: all }))
                  }
                >
                  <Form.Item
                    label="结算周期"
                    name="settlePeriod"
                    rules={[{ required: true, message: "请选择结算周期" }]}
                  >
                    <Select options={SETTLE_OPTIONS} style={{ width: 120 }} />
                  </Form.Item>
                  <Form.Item
                    label="冻结期天数"
                    name="freezeDays"
                    rules={[
                      { required: true, type: "number", min: 0, max: 30, message: "请输入0~30天" }
                    ]}
                  >
                    <InputNumber min={0} max={30} addonAfter="天" />
                  </Form.Item>
                  <Button type="primary" onClick={() => handleSave("settlement")} loading={loading}>
                    保存
                  </Button>
                </Form>
              )}
              {key === "insurance" && (
                <Form
                  layout="vertical"
                  initialValues={settings.insurance}
                  ref={ref => handleFormRef("insurance", ref)}
                  key={"insurance"}
                  onValuesChange={(_, all) =>
                    setSettings(s => ({ ...s, insurance: all }))
                  }
                >
                  <Form.Item
                    label="保费（每单收取）"
                    name="rate"
                    rules={[{ required: true, type: "number", min: 0, message: "请输入保费" }]}
                  >
                    <InputNumber min={0} step={0.1} addonAfter="元" />
                  </Form.Item>
                  <Form.Item
                    label="保险公司"
                    name="company"
                    rules={[{ required: true, message: "请输入保险公司" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="保障范围"
                    name="coverage"
                    rules={[{ required: true, message: "请输入保障范围" }]}
                  >
                    <TextArea rows={4} />
                  </Form.Item>
                  <Button type="primary" onClick={() => handleSave("insurance")} loading={loading}>
                    保存
                  </Button>
                </Form>
              )}
              {key === "healthAlert" && (
                <Form
                  layout="vertical"
                  initialValues={settings.healthAlert}
                  ref={ref => handleFormRef("healthAlert", ref)}
                  key={"healthAlert"}
                  onValuesChange={(_, all) =>
                    setSettings(s => ({ ...s, healthAlert: all }))
                  }
                >
                  <Form.Item
                    label="健康证提前预警天数"
                    name="days"
                    rules={[{ required: true, type: "number", min: 1, max: 365, message: "请输入1-365天" }]}
                  >
                    <InputNumber min={1} max={365} addonAfter="天" />
                  </Form.Item>
                  <Button type="primary" onClick={() => handleSave("healthAlert")} loading={loading}>
                    保存
                  </Button>
                </Form>
              )}
            </div>
          ),
        }))}
      />
    </div>
  );
};

export default RuleConfig;