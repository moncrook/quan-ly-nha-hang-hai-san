import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginLogic} from '../Untils/AuthLogic';

const { Title } = Typography;

const LoginPage = ({ setIsLoggedIn, employees, setUser, currentShift }) => {
    const navigate = useNavigate();

    const onFinish = (values) => {
        const result = loginLogic(values.username, values.password);
        
        if (result.success) {
            localStorage.setItem('isLoggedIn', true);
            message.success(result.message);
            setIsLoggedIn(true); // Cấp quyền truy cập
            navigate('/table');  // Chuyển vào trang sơ đồ bàn
        } else {
            message.error(result.message);
        }
    };

    // Tìm tài khoản khớp trong danh sách employees nhận từ App.js

    const handleLogin = (values) => {
        const foundUser = employees.find(
            (emp) => emp.username === values.username && emp.password === values.password
        );

        if (foundUser) {
            // 1. Nếu là Quản lý: Cho phép vào luôn để mở ca
            if (foundUser.role === 'ADMIN') {
                setUser(foundUser);
                setIsLoggedIn(true);
                message.success("Chào Quản lý!");
                navigate('/table');
            } 
            // 2. Nếu là Nhân viên (STAFF/CASHIER): Kiểm tra ca làm việc
            else {
                if (!currentShift) {
                    // Nếu currentShift đang là null
                    message.error("Hiện tại chưa có ca làm việc nào được mở. Vui lòng đợi Quản lý mở ca!");
                } else {
                    setUser(foundUser);
                    setIsLoggedIn(true);
                    message.success(`Nhân viên ${foundUser.name} đã vào ca!`);
                    navigate('/table');
                }
            }
        } else {
            message.error("Tài khoản hoặc mật khẩu sai!");
        }
    };

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            height: '100vh', background: '#f0f2f5' 
        }}>
            <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ textAlign: 'center', color: '#1890ff' }}>HỆ THỐNG QUẢN LÝ</Title>
                <Form onFinish={handleLogin} layout="vertical" size="large">
                    <Form.Item name="username" rules={[{ required: true, message: 'Nhập tài khoản!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Tài khoản" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>ĐĂNG NHẬP</Button>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;