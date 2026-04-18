import React, { useState } from 'react';
import { Row,
     Col,
      Card,
       Tag,
        Button, Drawer, Input, List, Avatar, message, Popconfirm, Typography, Modal, Menu,Dropdown, Form  } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined,
     MoreOutlined } from '@ant-design/icons';
import { menuSeafood, addToCartLogic, calculateTotal, updateQuantityLogic, handleBookingLogic, HuyDatBanLogic} from '../Untils/handleTable';
import Sider from 'antd/es/layout/Sider';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const TablePage = ({table,setTable, setBillHistory}) => {
    
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [billData, setBillData] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const [cart, setCart] = useState([]);
    //open Draw oder
    const [open, setOpen] = useState(false);
    //open Draw chuyển bàn
    const [openChuyenBan,setChuyenBanOpen]=useState(false);
    
    // const [collapsed, setCollapsed] = useState(true); // Trạng thái đóng/mở menu

    const [selectedTable, setSelectedTable] = useState(null);

    
const menuItems = [
  {
    key: '1',
    label: 'gộp bàn',
    // onClick: () => handleEdit(item),
  },
  {
        key: '2',
        label: 'Chuyển bàn',
        onClick: () => setChuyenBanOpen(true),
  },
];
//Hủy đặt bàn
    const HuyDatBan=(item)=>{
            const update=HuyDatBanLogic(table, item.id);
            setTable(update);
            setIsActionModalOpen(false);
            message.success(`Đã xác nhận hủy đặt ${item.name} thành công!`);
        }

    const [openBookingTable,setBookingTableOpen]=useState(false);
    const [bookingForm] = Form.useForm();

    const handleDatBan=()=>{
        setIsActionModalOpen(false);
        setBookingTableOpen(true);
    }

    const thongTinDatBan=()=>{

    }

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

const ChuyenBan= (tuBan, denBan)=>{
    const updateTable=table.map(t =>{
        if(t.id === tuBan.id){
            return {...t,
                status: 'available',
                orderItems: []
            }
        }
        if(t.id === denBan.id){
            return {...t,
                status: 'occupied',
                orderItems: tuBan.orderItems
            }
        }
        return t
    })
    setTable(updateTable);
    setChuyenBanOpen(false);
    message.success(` Chuyển bàn ${tuBan.name} đến bàn ${denBan.name}`);

}

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
    // setIsActionModalOpen(false); // Đóng ngay Modal lựa chọn
    
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

// in hóa đơn
const handlePrintBill = () =>{
    // 2. Đóng toàn bộ các cửa sổ đang hiện hữu
    setIsBillModalOpen(false);   // Đóng modal hóa đơn
    // setIsActionModalOpen(false); // Đảm bảo modal lựa chọn đã đóng
    // setOpen(false);              // Đóng drawer nếu đang mở

    message.success(" đã in hóa đơn!");
}

// 4. Khi xác nhận in hóa đơn xong
const handleConfirmPayment = () => {

    
    const newBill={...billData,id: Date.now()};
    
    // 1. Cập nhật dữ liệu bàn về trạng thái trống (Dùng tableData từ Props)
    const updatedTables = table.map(t => 
        t.id === selectedTable.id ? { ...t, status: 'available', orderItems: [] } : t
    );

    setBillHistory(prev => [newBill,...prev])
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
                        <Card hoverable 
                            onClick={() => {item.status === 'occupied' ? setOpen(true) : handleTableClick(item) }} 
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
                            // disabled={selectedTable?.status==='reserved'}
                            onClick={selectedTable?.status==='reserved'? ()=>HuyDatBan(selectedTable) : handleDatBan }
                        >
                            {selectedTable?.status==='reserved'? "Hủy đặt bàn" : "Đặt bàn" }
                        </Button>
                    </div>
                </Modal>
                <Modal
                    title="PHIẾU THANH TOÁN"
                    open={isBillModalOpen}
                    onCancel={() => setIsBillModalOpen(false)}
                    footer={null}
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
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <Button key="back" onClick={() => setIsBillModalOpen(false)}>Quay lại</Button>
                            <Button key="pay" type="primary" onClick={handleConfirmPayment}>
                                Thanh toán
                            </Button>
                            <Button key="print" type="primary" onClick={handlePrintBill}>
                                In hóa đơn tạm tính
                            </Button>
                    </div>
                </Modal>
                <Modal 
                    title={`Thông tin đặt bàn - ${selectedTable?.name}`}
                    open={openBookingTable}
                    onCancel={()=>setBookingTableOpen(false)}
                    onOk={() => bookingForm.submit()} // Khi bấm OK sẽ kích hoạt gửi Form
                    okText="Xác nhận đặt bàn"
                    cancelText="Hủy"
                >
                    <Form
                        form={bookingForm}
                        layout="vertical"
                        onFinish={(values) => {
                            // Logic xử lý khi nhấn Xác nhận
                            const updated = table.map(t => 
                                t.id === selectedTable.id 
                                ? { 
                                    ...t, 
                                    status: 'reserved', // Chuyển sang trạng thái Đã đặt (Màu vàng)
                                    bookingInfo: values // Lưu thông tin khách vào bàn
                                } 
                                : t
                            );
                            setTable(updated);
                            message.success(`Đã đặt ${selectedTable.name} cho khách ${values.customerName}`);
                            setBookingTableOpen(false);
                            bookingForm.resetFields(); // Xóa trắng form cho lần sau
                        }}
                    >
                        <Form.Item 
                            name="customerName" 
                            label="Tên khách hàng" 
                            rules={[{ required: true, message: 'Vui lòng nhập tên khách!' }]}
                        >
                            <Input placeholder="Ví dụ: Anh Nhạn" />
                        </Form.Item>

                        <Form.Item 
                            name="phone" 
                            label="Số điện thoại"
                            rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
                        >
                            <Input placeholder="Nhập số điện thoại khách" />
                        </Form.Item>

                        <Form.Item name="arrivalTime" label="Giờ đến dự kiến">
                            <Input placeholder="Ví dụ: 19:00" />
                        </Form.Item>

                        <Form.Item name="note" label="Ghi chú">
                            <Input.TextArea placeholder="Ví dụ: Ngồi gần cửa sổ, ăn mừng sinh nhật..." />
                        </Form.Item>
                    </Form>
                </Modal>
            <Drawer title={`Order - ${selectedTable?.name}`} width="100%" onClose={() => setOpen(false)} open={open}>
                <Input.Search
                    style={{padding: '20px'}}
                    placeholder='nhập món muốn tìm kiếm'
                    enterButton
                    size='Large'
                />

                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        >
                        <MoreOutlined
                            style={{
                            transform: 'rotate(90deg)', // 👉 thành 3 chấm dọc
                            fontSize: 18,
                            cursor: 'pointer'
                            }}
                        />
                    </Dropdown>

                    <Drawer 
                        width="80%" 
                        title={` Chuyển bàn ${selectedTable?.name} đến bàn khác`} 
                        onClose={() => setChuyenBanOpen(false)} 
                        open={openChuyenBan}>
                        <Row gutter={[16, 16]}>
                            {table
                            .filter(it => it.status === 'available').map(it => (
                                <Col span={6} key={it.id}>
                                    <Card hoverable onClick={() => handleTableClick(it)} 
                                        // style={{
                                        //     borderLeft: 
                                        //         item.status === 'available'
                                        //         ? '6px solid #52c41a'
                                        //         : item.status === 'reserved'
                                        //         ? '6px solid #faad14'
                                        //         : '6px solid #ff4d4f'
                                        //     }}
                                        >
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <b>{it.name}</b>
                                            <Tag color='yellow' >sức chứa: {it.capacity}</Tag>
                                            <Tag color='green'>
                                                Trống
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
                    </Drawer>

                {/* <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
                    <Menu 
                        mode='inline'
                        items={[
                            {key: '1', label: <Button>Chuyển bàn</Button>},
                            {key: '2', label: <Button>Gộp bàn</Button>}
                        ]}
                    />
                </Sider>
                <Button
                        type="text"
                        icon= {<MoreOutlined/>}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '18px', width: 64, height: 64 }} */}
                    {/* /> */}
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

                            {/* <Button style={{width: '50%'}}
                                type="primary" 
                                // danger 
                                // block 
                                size="large" 
                                onClick={handleShowBill}
                                disabled={cart.length === 0}
                            >
                                IN HÓA ĐƠN TẠM TÍNH
                            </Button> */}
                            <Button style={{top: '10px'}} type="primary" block onClick={onConfirmOrder}>Xác nhận</Button>
                    </Col>
                </Row>
            </Drawer>
        </div>
    );
};

export default TablePage;