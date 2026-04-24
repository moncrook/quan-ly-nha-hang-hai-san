import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { 
    MenuUnfoldOutlined, 
    MenuFoldOutlined, 
    DesktopOutlined, 
    CoffeeOutlined, 
    UserOutlined,
    FileTextOutlined ,
    AppstoreOutlined, // Thêm icon này
    CalendarOutlined,  // Thêm icon này
    LogoutOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children, user, setIsLoggedIn }) => {
    const [collapsed, setCollapsed] = useState(true); // Trạng thái đóng/mở menu
    const navigate = useNavigate();

     // 1. Định nghĩa tất cả các menu có thể có kèm theo danh sách quyền (roles)
    const allMenuItems = [
        { 
            key: '1', 
            icon: <DesktopOutlined />, 
            label: <Link to="/table">Sơ đồ bàn</Link>,
            roles: ['STAFF', 'CASHIER', 'ADMIN'] 
        },
        { 
            key: '3', 
            icon: <CalendarOutlined />, 
            label: <Link to="/booking">Quản Lý Đặt Bàn</Link>,
            roles: ['STAFF', 'CASHIER', 'ADMIN'] 
        },
        { 
            key: '4', 
            icon: <FileTextOutlined />, 
            label: <Link to="/bills">Quản Lý Hóa Đơn</Link>,
            roles: ['CASHIER', 'ADMIN'] // Phục vụ (STAFF) sẽ bị lọc mất cái này
        },
        { 
            key: '2', 
            icon: <AppstoreOutlined />, 
            label: <Link to="/products">Quản Lý Thực Đơn</Link>,
            roles: ['ADMIN'] // Chỉ Quản lý mới thấy
        },
        {
            key: '6', 
            icon: <UserOutlined />, 
            label: <Link to="/employees">Quản Lý Nhân Viên</Link>,
            roles: ['ADMIN'] // Chỉ Quản lý mới thấy
        },
        { 
            key: '7', 
            icon: <LogoutOutlined />, 
            label: <Link to="/login" onClick={() => {
                localStorage.clear();
                setIsLoggedIn(false);}
            }>Đăng xuất</Link>,
            roles: ['STAFF', 'CASHIER', 'ADMIN'] 
        }
    ];

    // 2. Lọc danh sách dựa trên role của user truyền từ App.js xuống
    const filteredItems = allMenuItems.filter(item => {
        // Nếu không có user, hoặc không có role, hoặc role không nằm trong danh sách quyền thì loại bỏ
        return user?.role && item.roles.includes(user.role);
    });


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
                    items={filteredItems}
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