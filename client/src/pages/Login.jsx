import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../routing/AuthProvider";
import { Upload } from "../components/Upload";
import { Button, Checkbox, Col, Form, Input, Row, Select } from "antd";
import { request } from "../api";
import { UploadOutlined } from "@ant-design/icons";

export const Login = () => {
  const { login, logout, registration, user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [activeLogin, setActiveLogin] = useState(true);
  const onFinish = (values) => {
    const { username, password, confirmPassword, role, avatar } = values;
    if (activeLogin) {
      return login(username, password);
    }
    const form = new FormData();
    form.append("userName", username);
    form.append("password", password);
    form.append("passwordConfirm", confirmPassword);
    form.append("role", role);
    form.append("avatar", avatar[0].originFileObj);
    registration(form);
  };
  const getRoles = async () => {
    const response = await request("get", "roles");
    setRoles(response.data);
  };
  useEffect(() => {
    getRoles();
  }, []);

  const title = activeLogin ? "Войти" : "Зарегистрироваться";
  return (
    <Row align={"middle"} justify={"center"} className={"login-wrapper"}>
      <Row gutter={[0, 24]} className={"login-form"}>
        <Col span={8}>
          <Button
            style={{ width: "100%" }}
            onClick={() => setActiveLogin(true)}
            type={activeLogin ? "primary" : "default"}
          >
            Войти
          </Button>
        </Col>
        <Col offset={2} span={14}>
          <Button
            style={{ width: "100%" }}
            onClick={() => setActiveLogin(false)}
            type={activeLogin ? "default" : "primary"}
          >
            Зарегистрироваться
          </Button>
        </Col>
        <Col span={24}>
          {activeLogin ? (
            <LoginForm onFinish={onFinish} title={title} />
          ) : (
            <RegistrationForm roles={roles} onFinish={onFinish} title={title} />
          )}
        </Col>
      </Row>
    </Row>
  );
};

const LoginForm = ({ onFinish, title }) => {
  return (
    <Form
      layout={"vertical"}
      name="login"
      initialValues={{
        username: "Test1234",
        password: "Test1234^&HYYrR",
        confirmPassword: "Test1234^&HYYrR",
        role: "Admin",
        remember: true,
      }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Имя"
        name="username"
        rules={[{ required: true, message: "Введите имя!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Пароль"
        name="password"
        rules={[{ required: true, message: "Введите пароль!" }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item name="remember" valuePropName="checked">
        <Checkbox>Запомнить меня</Checkbox>
      </Form.Item>
      <Form.Item>
        <Button style={{ width: "100%" }} type="primary" htmlType="submit">
          {title}
        </Button>
      </Form.Item>
    </Form>
  );
};

const RegistrationForm = ({ onFinish, title, roles }) => {
  const onFileChange = (info) => {
    return info?.fileList;
  };

  return (
    <Form
      layout={"vertical"}
      name="registration"
      initialValues={{
        username: "Test1234",
        password: "Test1234^&HYYrR",
        confirmPassword: "Test1234^&HYYrR",
        role: roles[0]?.id,
        remember: true,
      }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        label="Имя"
        name="username"
        rules={[{ required: true, message: "Введите имя!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Аватар"
        name="avatar"
        valuePropName="fileList"
        getValueFromEvent={onFileChange}
        rules={[{ required: true, message: "Загрузите аватар!" }]}
      >
        <Upload maxCount={1}>
          <Button icon={<UploadOutlined />}>Click to Upload</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        label="Пароль"
        name="password"
        rules={[{ required: true, message: "Введите пароль!" }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="Подтвердите пароль"
        name="confirmPassword"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Подтвердите пароль!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Пароли не совпадают!"));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="role"
        label="Роль"
        rules={[{ required: true, message: "Выберите роль!" }]}
      >
        <Select>
          {roles.map((e) => (
            <Select.Option key={e.id} value={e.id}>
              {e.normalizedName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button style={{ width: "100%" }} type="primary" htmlType="submit">
          {title}
        </Button>
      </Form.Item>
    </Form>
  );
};
