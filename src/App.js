import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './component/MainLayout'; // Import cái khung vừa tạo
import LoginPage from './Pages/LoginPages';
import TablePage from './Pages/TablePages';
import ProductPage from './Pages/productPages';
import BookingPage from './Pages/BoookingPage';
import BillsPage from './Pages/billsPage'

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

    // Kiểm tra trạng thái đã lưu trong máy người dùng chưa
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return localStorage.getItem('isLoggedIn') === false;
    });
    const [billHistory, setBillHistory] = useState([]); // Lưu danh sách hóa đơn đã thanh toán

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                
                {/* Các trang khác giữ nguyên logic kiểm tra isLoggedIn */}
                <Route 
                    path="/table" 
                    element={isLoggedIn ? <MainLayout><TablePage table={table} setTable={setTable} setBillHistory={setBillHistory}/></MainLayout> : <Navigate to="/login" />} 
                />
                <Route 
                    path="/products" 
                    element={isLoggedIn ? <MainLayout><ProductPage /></MainLayout> : <Navigate to="/login" />
                } />
                <Route path="/booking" element={
                    <MainLayout>
                        <BookingPage tableData={table} setTableData={setTable} />
                    </MainLayout>
                } />
                <Route path="/bills" element={
                    <MainLayout>
                        <BillsPage billHistory={billHistory}/>
                    </MainLayout>
                } />
            </Routes>
        </BrowserRouter>
    );
};
export default App;