import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginLogic} from '../Untils/AuthLogic';

const { Title } = Typography;

const LoginPage = ({ setIsLoggedIn }) => {
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

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            height: '100vh', background: '#f0f2f5' 
        }}>
            <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <Title level={3} style={{ textAlign: 'center', color: '#1890ff' }}>HỆ THỐNG QUẢN LÝ</Title>
                <Form onFinish={onFinish} layout="vertical" size="large">
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