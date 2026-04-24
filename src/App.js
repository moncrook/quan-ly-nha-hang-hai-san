import React, { useState } from 'react';
import { Result } from 'antd';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import MainLayout from './component/MainLayout'; // Import cái khung vừa tạo
import LoginPage from './Pages/LoginPages';
import TablePage from './Pages/TablePages';
import ProductPage from './Pages/productPages';
import BookingPage from './Pages/BoookingPage';
import BillsPage from './Pages/billsPage';
import EmployeePage from './Pages/EmployeePage';
import { 
    DesktopOutlined, 
    CoffeeOutlined, 
    UserOutlined,
    FileTextOutlined,
    AppstoreOutlined, // Thêm icon này
    CalendarOutlined,  // Thêm icon này
    LogoutOutlined,
    TableOutlined
} from '@ant-design/icons';
import { menuSeafood } from './Untils/handleTable';


const initialEmployees = [
    { id: 1, username: 'nhanadmin', password: '123', name: 'Phan Xuân Nhạn', role: 'ADMIN' },
    { id: 2, username: 'staff01', password: '123', name: 'Nguyễn Văn A', role: 'STAFF' },
    { id: 3, username: 'cashier01', password: '123', name: 'Trần Thị B', role: 'CASHIER' },
];

const App = () => {

    const [table, setTable] = useState([
            { id: 1, name: 'Bàn số 1', status: 'available', capacity: 4, orderItems: [] },
            { id: 2, name: 'Bàn số 2', status: 'occupied', capacity: 4, orderItems: [{ id: 101, name: 'Tôm Hùm', price: 750000, qty: 1 }] },
            { id: 3, name: 'Bàn số 3', status: 'available', capacity: 4, orderItems: [] },
            { id: 4, name: 'Bàn số 4', status: 'reserved', capacity: 4, orderItems: [] },
            { id: 5, name: 'Bàn số 5', status: 'available', capacity: 4, orderItems: [] },
            { id: 6, name: 'Bàn số 6', status: 'available', capacity: 4, orderItems: [] },
            { id: 7, name: 'Bàn số 7', status: 'available', capacity: 4, orderItems: [] },
            { id: 8, name: 'Bàn số 8', status: 'reserved', capacity: 4, orderItems: [] },
            { id: 9, name: 'Bàn số 9', status: 'available', capacity: 4, orderItems: [] },
            { id: 10, name: 'Bàn số 10', status: 'available', capacity: 4, orderItems: [] },
            // ... (copy nốt các bàn khác của bạn vào đây)
        ]);

        const [billHistory, setBillHistory] = useState([]);
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [menuData, setMenuData] = useState(menuSeafood);

        const [employees, setEmployees] = useState(initialEmployees); // Quản lý danh sách nhân viên

        // lưu thông tin người đăng nhập
        const [user, setUser] = useState(null);

        const [currentShift, setCurrentShift] = useState(null); // null nghĩa là chưa mở ca
        

        // ẩn hiện menu điều hướng
        // const menuItems = [
        //     { key: '1', label: 'Sơ đồ bàn', path: '/tables', roles: ['STAFF', 'CASHIER', 'ADMIN'] },
        //     { key: '2', label: 'Hóa đơn', path: '/bills', roles: ['CASHIER', 'ADMIN'] },
        //     { 
        //         key: '3', 
        //         label: 'Quản lý thực đơn', 
        //         path: '/products', 
        //         roles: ['ADMIN'] // Chỉ duy nhất Quản lý mới có quyền này
        //     },
        // ]

        const allMenuItems = [
            {
                key: 'tables',
                label: 'Sơ đồ bàn',
                icon: <TableOutlined />,
                roles: ['STAFF', 'CASHIER', 'ADMIN'], // Tất cả đều thấy
            },
            {
                key: 'booking',
                label: 'Đặt bàn',
                icon: <CalendarOutlined />,
                roles: ['STAFF', 'CASHIER', 'ADMIN'], // Tất cả đều thấy
            },
            {
                key: 'bills',
                label: 'Quản lý hóa đơn',
                icon: <FileTextOutlined />,
                roles: ['CASHIER', 'ADMIN'], // Nhân viên phục vụ không thấy
            },
            {
                key: 'products',
                label: 'Quản lý thực đơn',
                icon: <AppstoreOutlined />,
                roles: ['ADMIN'], // Chỉ Quản lý thấy
            },
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                roles: ['STAFF', 'CASHIER', 'ADMIN'],
            },
            ];

        // const filteredMenuItems = user?.role 
        // ? allMenuItems.filter(item => item.roles.includes(user?.role)) 
        // : [];

    // Kiểm tra trạng thái đã lưu trong máy người dùng chưa
    // const [isLoggedIn, setIsLoggedIn] = useState(() => {
    //     return localStorage.getItem('isLoggedIn') === "true";
    // });

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} employees={employees} />} />
                <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} employees={employees} />} />
                
                {/* Các trang khác giữ nguyên logic kiểm tra isLoggedIn */}
                 {/* Tìm đến đoạn render trong App.js và sửa các Route như sau: */}
                <Route 
                    path="/table" 
                    element={
                        isLoggedIn ? (
                            <MainLayout setIsLoggedIn={setIsLoggedIn} user={user}> {/* TRUYỀN THÊM USER VÀO ĐÂY */}
                                <TablePage 
                                    table={table} 
                                    setTable={setTable} 
                                    setBillHistory={setBillHistory} 
                                    setIsLoggedIn={setIsLoggedIn}
                                    menuSeafood={menuData} // Truyền danh sách món vào đây
                                    user={user}/>
                            </MainLayout>
                        ) : <Navigate to="/login" />
                    } 
                />

                <Route path="/booking" element={
                    <MainLayout user={user} setIsLoggedIn={setIsLoggedIn}> {/* TRUYỀN THÊM USER VÀO ĐÂY */}
                        <BookingPage tableData={table} setTableData={setTable} />
                    </MainLayout>
                } />

                <Route path="/bills" element={
                    <MainLayout user={user} setIsLoggedIn={setIsLoggedIn}> {/* TRUYỀN THÊM USER VÀO ĐÂY */}
                        <BillsPage billHistory={billHistory}/>
                    </MainLayout>
                } />

                <Route path="/employees" element={
                    user?.role === 'ADMIN' 
                    ? <MainLayout user={user} setIsLoggedIn={setIsLoggedIn}>
                        <EmployeePage employees={employees} setEmployees={setEmployees} />
                    </MainLayout>
                    : <Result status="403" title="Bạn không có quyền vào trang này" />
                } />

                <Route path="/products" element={
                    user?.role === 'ADMIN' 
                    ? <MainLayout user={user} setIsLoggedIn={setIsLoggedIn}>
                        <ProductPage 
                            products={menuData} 
                            setProducts={setMenuData} /></MainLayout> // Quản lý mới vào được và có Menu
                    : <Result status="403" title="Bạn không có quyền vào trang này" />
                } />    
            </Routes>
        </BrowserRouter>
    );
};
export default App;