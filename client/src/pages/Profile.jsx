import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { request } from "../api";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  message,
  Row,
  Select,
  Space,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import { UserDeleteOutlined } from "@ant-design/icons";
import { map } from "lodash";

const { Option } = Select;

const PickerWithType = ({ type, onChange }) => {
  if (type === "time") return <TimePicker onChange={onChange} />;
  if (type === "date") return <DatePicker onChange={onChange} />;
  return <DatePicker picker={type} onChange={onChange} />;
};

export const Profile = () => {
  const { state: linkUser } = useLocation();
  const { id } = useParams();
  const [user, setUser] = useState(linkUser);
  const [type, setType] = useState("time");
  const navigate = useNavigate();
  const [moment, setMoment] = useState();

  useEffect(() => {
    if (!user?.id) {
      getUser();
    }
  }, [id]);

  const getUser = async () => {
    const response = await request("get", `users/getUser/${id}`);
    if (response.data) {
      setUser(response.data.user);
    }
  };
  const timeOutUser = (user) => {
    if (moment) {
      request("post", `users/timeoutuser`, {
        id: user,
        timeout: moment,
      }).then((response) => {
        message.success("Пользователь успешно заблокирован");
      });
    }
  };

  return (
    <Row gutter={[10, 10]}>
      <Col span={24}>
        <Button onClick={() => navigate("/")}>Назад</Button>
      </Col>
      <Col span={24}>
        <Row>
          <Avatar size={64} src={user?.avatar} shape={"circle"} />
          <Typography.Title>{user?.userName}</Typography.Title>
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[10, 10]}>
          <Col>
            <Typography.Text>Роли :</Typography.Text>
          </Col>
          <Col>
            {map(user?.roles, (role) => (
              <Tag>{role}</Tag>
            ))}
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Space>
          <Select value={type} onChange={setType}>
            <Option value="time">Time</Option>
            <Option value="date">Date</Option>
            <Option value="week">Week</Option>
            <Option value="month">Month</Option>
            <Option value="quarter">Quarter</Option>
            <Option value="year">Year</Option>
          </Select>
          <PickerWithType
            type={type}
            onChange={(value) => setMoment(value.format("YYYY-MM-DD HH:mm:ss"))}
          />
          <Button
            disabled={!moment}
            onClick={() => timeOutUser(user.id)}
            icon={<UserDeleteOutlined />}
          >
            {moment && `Заблокировать пользователя до ${moment}`}
          </Button>
        </Space>
      </Col>
    </Row>
  );
};
