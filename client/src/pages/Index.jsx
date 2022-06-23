import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../routing/AuthProvider";
import { request } from "../api";
import { Button, Form, Input, Layout, Modal, Select, Typography } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import { UserList } from "../components/UserList";
import { RoomList } from "../components/RoomList";
import { useNavigate } from "react-router-dom";

export const Index = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);
  const [createRoom, setCreateRoom] = useState(false);
  const [rooms, setRooms] = useState([]);

  const onSetRoomMembers = (id) => {
    if (roomMembers.includes(id)) {
      return setRoomMembers(roomMembers.filter((e) => e !== id));
    }
    setRoomMembers([...roomMembers, id]);
  };
  useEffect(() => {
    getUsers();
    getRooms();
  }, []);

  const getUsers = async () => {
    const response = await request("get", "users/getUsers");
    setUsers(response.data);
  };

  const getRooms = async () => {
    const response = await request("get", "rooms");
    setRooms(response.data);
  };

  const getRoom = (id) => {
    navigate(`room/${id}`);
  };

  const getNewRoom = (room, member) => {
    room ? getRoom(room) : navigate(`room`, { state: { members: [member] } });
  };

  const showModal = () => {
    setCreateRoom(true);
  };

  const handleFinish = (values) => {
    navigate(`room`, { state: values });
    setCreateRoom(false);
  };

  const handleCancel = () => {
    setCreateRoom(false);
  };

  const { logout } = useContext(AuthContext);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        style={{ backgroundColor: "#1890ff" }}
        className="site-layout-background"
      >
        <Typography.Title level={5}>Активные пользователи</Typography.Title>
        <Button style={{ width: "100%" }} onClick={showModal}>
          Создать беседу
        </Button>
        <Modal
          visible={createRoom}
          onCancel={handleCancel}
          footer={[
            <Button form="groupForm" key="submit" htmlType="submit">
              Создать
            </Button>,
          ]}
        >
          <Form onFinish={handleFinish} id={"groupForm"}>
            <Form.Item
              label="Название беседы"
              name="groupName"
              rules={[{ required: true, message: "Введите название беседы!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="members"
              label="Участники"
              rules={[{ required: true, message: "Выберите участников!" }]}
            >
              <Select mode="multiple">
                {users.map((e) => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.userName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <UserList
          onSetRoomMembers={onSetRoomMembers}
          roomMembers={roomMembers}
          users={users}
          getNewRoom={getNewRoom}
        />
      </Sider>
      <Content className="site-layout-background">
        <Button onClick={logout}>Выйти</Button>
        <Typography.Title>Чаты</Typography.Title>
        <RoomList rooms={rooms} getRoom={getRoom} />
      </Content>
    </Layout>
  );
};
