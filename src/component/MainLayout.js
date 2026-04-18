import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { 
    MenuUnfoldOutlined, 
    MenuFoldOutlined, 
    DesktopOutlined, 
    CoffeeOutlined, 
    UserOutlined,
    FileTextOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(true); // Trạng thái đóng/mở menu
    const navigate = useNavigate();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* THANH MENU BÊN TRÁI */}
            <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
                <div style={{ height: 64, margin: 16, background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {collapsed ? 'H' : 'HẢI SẢN HUẾ'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
                        { key: '1', icon: <DesktopOutlined />, label: <Link to="/table">Sơ đồ bàn</Link> },
                        { key: '2', icon: <CoffeeOutlined />, label: <Link to="/products">Quản Lý Thực Đơn</Link> },
                        { key: '3', icon: <CoffeeOutlined />, label: <Link to="/booking">Quản Lý Đặt Bàn</Link> },
                        { key: '4', icon: <FileTextOutlined />, label: <Link to="/bills">Quản Lý Hóa Đơn</Link> },
                        { key: '5', icon: <CoffeeOutlined />, label: <Link to="/otherFunc">chức năng khác</Link> },
                        { key: '6', icon: <UserOutlined />, label: <Link to="/login" onClick={() => localStorage.clear()}>Đăng xuất</Link> },
                    ]}
                />
            </Sider>

            <Layout>
                {/* THANH ĐẦU TRANG CHỨA NÚT 3 SỌC */}
                <Header style={{ padding: 0, background: '#fff' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '18px', width: 64, height: 64 }}
                    />
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Hệ thống Quản lý Nhà hàng</span>
                </Header>

                {/* NỘI DUNG CÁC TRANG SẼ HIỆN Ở ĐÂY */}
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: 8 }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;