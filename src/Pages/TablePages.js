import React, { useState } from 'react';
import { Row, Col, Card, Tag, Button, Drawer, Input, List, Avatar, message, Popconfirm, Typography, Modal } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined } from '@ant-design/icons';
import { menuSeafood, addToCartLogic, calculateTotal, updateQuantityLogic, handleBookingLogic } from '../Untils/handleTable';

const { Title } = Typography;

const TablePage = ({table,setTable}) => {
    
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [billData, setBillData] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const [cart, setCart] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);

    
    const [bookingTable,setBookingTable]=useState(false);


    const showActionModal = () => {
        setIsActionModalOpen(true);
    };

    const onConfirmOrder = () => {
        const updated = table.map(t => t.id === selectedTable.id ? { ...t, status: 'occupied', orderItems: cart } : t);
        setTable(updated);
        message.success("Đã cập nhật đơn hàng!");
        setOpen(false);
    };
    // Hàm xử lý khi bấm nút + hoặc - trong giỏ hàng
const handleUpdateQty = (foodId, delta) => {
    setCart(updateQuantityLogic(cart, foodId, delta));
};

// Hàm xóa món hẳn khỏi giỏ
const handleRemoveItem = (foodId) => {
    setCart(cart.filter(item => item.id !== foodId));
    message.info("Đã xóa món");
};

    const onPayment = (tableId) => {
        const updated = table.map(t => t.id === tableId ? { ...t, status: 'available', orderItems: [] } : t);
        setTable(updated);
        setCart([]);
        setOpen(false);
        message.success("Bàn đã thanh toán!");
    };

    
const handleShowBill = () => {
    // Chuẩn bị dữ liệu hóa đơn từ bàn đang chọn
    const data = {
        tableName: selectedTable.name,
        items: cart,
        total: calculateTotal(cart),
        time: new Date().toLocaleString('vi-VN'),
        staff: "Phan Xuan Nhan" // Tên bạn hoặc tên nhân viên đăng nhập
    };
    setBillData(data);
    setIsBillModalOpen(true);
};

// 1. Khi bấm vào bàn đỏ
const handleTableClick = (item) => {
    setSelectedTable(item);
    setCart(item.orderItems || []);

    // if (item.status === 'available') {
    //     setOpen(true); // Mở Drawer gọi món ngay
    // } else {
    setIsActionModalOpen(true); // Chỉ mở Modal lựa chọn, KHÔNG mở Drawer
    // }
};

// 2. Khi chọn "ORDER THÊM MÓN"
const handleSelectOrder = () => {
    setIsActionModalOpen(false); // Đóng modal lựa chọn
    setOpen(true);               // Mới mở Drawer gọi món
};

// 3. Khi chọn "THANH TOÁN" từ Modal lựa chọn
const handleSelectPayment = () => {
    setIsActionModalOpen(false); // Đóng ngay Modal lựa chọn
    
    const data = {
        tableName: selectedTable.name,
        items: cart,
        total: calculateTotal(cart),
        time: new Date().toLocaleString('vi-VN'),
        staff: "Phan Xuân Nhạn"
    };
    
    setBillData(data);
    setIsBillModalOpen(true); // Hiện hóa đơn
};

// khi chọn "đặt bàn" từ Modal lựa chọn

const handleSelectBook = (tableItem)=> {
    setIsActionModalOpen(false);
    const update=handleBookingLogic(table,tableItem.id);
    setTable(update);
    message.success(`Đã xác nhận đặt ${table.name} thành công!`);
}

// 4. Khi xác nhận in hóa đơn xong


const handleConfirmPayment = () => {
    // 1. Cập nhật dữ liệu bàn về trạng thái trống (Dùng tableData từ Props)
    const updatedTables = table.map(t => 
        t.id === selectedTable.id ? { ...t, status: 'available', orderItems: [] } : t
    );
    setTable(updatedTables);

    // 2. Đóng toàn bộ các cửa sổ đang hiện hữu
    setIsBillModalOpen(false);   // Đóng modal hóa đơn
    setIsActionModalOpen(false); // Đảm bảo modal lựa chọn đã đóng
    setOpen(false);              // Đóng drawer nếu đang mở

    message.success("Thanh toán thành công và đã in hóa đơn!");
};

    return (
        <div>
            <Title level={2} style={{ color: '#1890ff' }}>🍽️ SƠ ĐỒ BÀN ĂN</Title>
            <Row gutter={[16, 16]}>
                {table.map(item => (
                    <Col span={6} key={item.id}>
                        <Card hoverable onClick={() => handleTableClick(item)} 
                             style={{
                                borderLeft: 
                                    item.status === 'available'
                                    ? '6px solid #52c41a'
                                    : item.status === 'reserved'
                                    ? '6px solid #faad14'
                                    : '6px solid #ff4d4f'
                                }}
                             >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <b>{item.name}</b>
                                <Tag color='yellow' >sức chứa: {item.capacity}</Tag>
                                <Tag color={item.status === 'available' ? 'green' : item.status === 'occupied' ? 'red' : 'red'}>
                                    {item.status === 'available' ? 'Trống' : item.status === 'occupied' ? 'Có khách' : 'Bàn đã đặt'}
                                </Tag>
                            </div>
                            {/* {item.status === 'occupied' && (
                                <Button danger size="small" style={{marginTop: 10}} >
                                    Thanh toán nhanh
                                </Button>
                                
                            )} */}
                        </Card>
                    </Col>
                ))}
            </Row>
             <Modal
                    title={`Bạn cần gì - ${selectedTable?.name}`}
                    open={isActionModalOpen}
                    onCancel={() => setIsActionModalOpen(false)}
                    footer={null} // Không dùng nút mặc định của Modal
                    centered
                >
                    <div style={{ display: 'flex', gap: '15px', padding: '20px 0' }}>
                        <Button 
                            type="primary" 
                            size="large" 
                            style={{ flex: 1, height: '80px', backgroundColor: '#faad14' }}
                            onClick={handleSelectOrder}
                        >
                            🛒 ORDER MÓN
                        </Button>
                        <Button 
                            type="primary" 
                            danger 
                            size="large" 
                            style={{ flex: 1, height: '80px' }}
                            onClick={() => handleSelectBook(selectedTable)}
                        >
                            ĐẶT BÀN
                        </Button>
                    </div>
                </Modal>
                <Modal
                    title="PHIẾU THANH TOÁN"
                    open={isBillModalOpen}
                    onCancel={() => setIsBillModalOpen(false)}
                    footer={[
                        <Button key="back" onClick={() => setIsBillModalOpen(false)}>Quay lại</Button>,
                        <Button key="submit" type="primary" onClick={handleConfirmPayment}>
                            Xác nhận in hóa đơn
                        </Button>,
                    ]}
                    centered
                    width={400}
                >
                    {billData && (
                        <div style={{ padding: '10px', fontFamily: 'monospace' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>HẢI SẢN HUẾ</h2>
                                <p>Địa chỉ: AEON Mall Huế</p>
                                <p>---------------------------</p>
                                <h3>HÓA ĐƠN THANH TOÁN</h3>
                            </div>
                            
                            <p><b>Bàn:</b> {billData.tableName}</p>
                            <p><b>Ngày:</b> {billData.time}</p>
                            <p><b>Nhân viên:</b> {billData.staff}</p>
                            
                            <table style={{ width: '100%', borderTop: '1px dashed #000', paddingTop: '10px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
                                        <th>Món</th>
                                        <th>SL</th>
                                        <th style={{ textAlign: 'right' }}>T.Tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billData.items.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.qty}</td>
                                            <td style={{ textAlign: 'right' }}>{(item.price * item.qty).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div style={{ borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px', textAlign: 'right' }}>
                                <p style={{ fontSize: '18px' }}>
                                    <b>TỔNG CỘNG: {billData.total.toLocaleString()}đ</b>
                                </p>
                            </div>
                            
                            <div style={{ textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>
                                <p>Cảm ơn quý khách. Hẹn gặp lại!</p>
                            </div>
                        </div>
                    )}
                </Modal>
            <Drawer title={`Order - ${selectedTable?.name}`} width="100%" onClose={() => setOpen(false)} open={open}>
                <Input.Search
                    style={{padding: '20px'}}
                    placeholder='nhập món muốn tìm kiếm'
                    enterButton
                    size='Large'
                />
                <Row gutter={24}>
                    <Col span={14}>
                        <Row gutter={[16, 16]}>
                            {menuSeafood.map(food => (
                                <Col span={12} key={food.id}>
                                    <Card size="small">
                                        <b>{food.name}</b> - {food.price.toLocaleString()}đ
                                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCart(addToCartLogic(cart, food))} />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                    <Col span={10}>
                        <Title level={4}>Giỏ hàng</Title>
                        <List
                                dataSource={cart}
                                renderItem={(item) => (
                                    <List.Item
                                        actions={[
                                            <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleRemoveItem(item.id)} />
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={<b>{item.name}</b>}
                                            description={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Button size="small" icon={<MinusOutlined />} onClick={() => handleUpdateQty(item.id, -1)} disabled={item.qty <= 1} />
                                                    <b>{item.qty}</b>
                                                    <Button size="small" icon={<PlusOutlined />} onClick={() => handleUpdateQty(item.id, 1)} />
                                                </div>
                                            }
                                        />
                                        <div><b>{(item.price * item.qty).toLocaleString()}đ</b></div>
                                    </List.Item>
                                )}
                            />
                        <Title level={4}>Tổng: {calculateTotal(cart).toLocaleString()}đ</Title>
                        <Button 
                            type="primary" 
                            danger 
                            block 
                            size="large" 
                            onClick={handleShowBill}
                            disabled={cart.length === 0}
                        >
                            XEM HÓA ĐƠN & THANH TOÁN
                        </Button>
                        <Button type="primary" block onClick={onConfirmOrder}>Xác nhận</Button>
                    </Col>
                </Row>
            </Drawer>
        </div>
    );
};

export default TablePage;