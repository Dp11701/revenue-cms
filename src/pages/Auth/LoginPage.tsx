import { Card, Typography, Form, Input, Button, Alert, App } from "antd";
import { useState } from "react";
import { useLogin } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  const [error, setError] = useState<string | null>(null);
  const { message } = App.useApp();

  async function onFinish(values: { email: string; password: string }) {
    setError(null);
    try {
      await mutateAsync(values);
      message.success("Signed in successfully");
      navigate("/", { replace: true });
    } catch (e: unknown) {
      const error = e as { response?: { data?: { messages?: string[] } } };
      setError(error.response?.data?.messages?.[0] || "Login failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-md">
        <Typography.Title level={3} className="!mb-6 text-center">
          Sign in
        </Typography.Title>
        {error && (
          <Alert className="mb-4" type="error" message={error} showIcon />
        )}
        <Form layout="vertical" onFinish={onFinish} initialValues={{}}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input type="email" placeholder="you@example.com" autoFocus />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={isPending}
          >
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
