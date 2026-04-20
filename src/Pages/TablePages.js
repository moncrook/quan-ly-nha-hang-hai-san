import React, { useState } from 'react';

import { Row, InputNumber, 
     Col,Card,Tag,Button, Drawer, Input, List, Avatar, message, 
     Popconfirm, Typography, Modal, Menu,Dropdown, Form  } from 'antd';

import { PlusOutlined, MinusOutlined, DeleteOutlined, MoneyCollectOutlined, QrcodeOutlined,
     MoreOutlined } from '@ant-design/icons';
     
import { menuSeafood, addToCartLogic, calculateTotal, updateQuantityLogic,
     handleBookingLogic, HuyDatBanLogic} from '../Untils/handleTable';

import Sider from 'antd/es/layout/Sider';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const TablePage = ({table,setTable, setBillHistory}) => {
    
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [billData, setBillData] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    //lưu loại thức ăc đang chọn
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const categories = ['Tất cả', 'Tôm', 'Cua', 'Mực', 'Ốc', 'Lẩu', 'Nước uống'];

    const [cart, setCart] = useState([]);
    //open Draw oder
    const [open, setOpen] = useState(false);
    //open Draw chuyển bàn
    const [openChuyenBan,setChuyenBanOpen]=useState(false);
    
    // const [collapsed, setCollapsed] = useState(true); // Trạng thái đóng/mở menu

    const [selectedTable, setSelectedTable] = useState(null);

    const [discount, setDiscount] = useState(0); // Phần trăm giảm giá (0-100)
    const [customerCash, setCustomerCash] = useState(0); // Tiền khách đưa

    //Tìm kiếm món ăn
    const [searchText, setSearchText] = useState('');

    //chọn phuowngh thức thanh toán
    const [methodModalOpen, setMethodModalOpen]=useState(false)

    // modal thanh toán bằng tiền mặt
    const [tienMatModalOpen, setTienMatModalOpen]=useState(false)

    
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
    // mở modal thông tin đặt bàn
    const [openBookingTable,setBookingTableOpen]=useState(false);
    const [bookingForm] = Form.useForm();

    const handleDatBan=()=>{
        setIsActionModalOpen(false);
        setBookingTableOpen(true);
    }

    const showActionModal = () => {
        setIsActionModalOpen(true);
    };

    const onConfirmOrder = () => {

        const hasItems = cart.length>0;

        const updated = table.map(t => {
        if (t.id === selectedTable?.id) {
            // Xác định trạng thái mới:
            // Nếu giỏ hàng có món -> occupied (Có khách)
            // Nếu giỏ hàng trống -> giữ nguyên status cũ (available hoặc reserved)
            const newStatus = hasItems ? 'occupied' : t.status;

            return { 
                ...t, 
                status: newStatus, 
                orderItems: cart 
            };
        }
        return t;});

            setTable(updated);

            if (hasItems) {
                message.success(`Đã chuyển ${selectedTable?.name} sang trạng thái có khách!`);
            } else {
                message.info("Đã cập nhật (Bàn chưa có món ăn)");
            }

            setOpen(false); // Đóng Drawer
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

const handleThanhToan = () => {

    const newBill={...billData,id: Date.now()};
    
    // 1. Cập nhật dữ liệu bàn về trạng thái trống (Dùng tableData từ Props)
    const updatedTables = table.map(t => 
        t.id === selectedTable?.id ? { ...t, status: 'available', orderItems: [] } : t
    );

    setBillHistory(prev => [newBill,...prev])
    setTable(updatedTables);

    // 1. Thực hiện logic lưu Database / Cập nhật trạng thái bàn ở đây
    console.log("Đã thanh toán cho bàn:", selectedTable.name);


    // 2. Đóng toàn bộ các Modal
    setTienMatModalOpen(false);
    setMethodModalOpen(false);
    setIsBillModalOpen(false);
    setOpen(false);
    
    // 3. Reset lại tiền khách đưa cho lần sau
    setCustomerCash(0);
    
    message.success("Thanh toán thành công!");
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
    const finalTotal = calculateTotal(cart) * (1 - discount/100);
    const data = {
        tableName: selectedTable?.name,
        items: cart,
        subTotal: calculateTotal(cart),
        discount: discount,
        total: finalTotal,
        time: new Date().toLocaleString('vi-VN'),
        staff: "Phan Xuân Nhẫn"
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
        t.id === selectedTable?.id ? { ...t, status: 'available', orderItems: [] } : t
    );

    setBillHistory(prev => [newBill,...prev])
    setTable(updatedTables);
    // 2. Đóng toàn bộ các cửa sổ đang hiện hữu
    setIsBillModalOpen(false);   // Đóng modal hóa đơn
    setIsActionModalOpen(false); // Đảm bảo modal lựa chọn đã đóng
    setOpen(false);              // Đóng drawer nếu đang mở
    setTienMatModalOpen(false);
    setMethodModalOpen(false)

    message.success("Thanh toán thành công và đã in hóa đơn!");

    
};

    return (
        <div>
            <Title level={2} style={{ color: '#1890ff' }}>🍽️ SƠ ĐỒ BÀN ĂN</Title>
            <Row gutter={[16, 16]}>
                {table.map(item => (
                    <Col span={6} key={item.id}>
                        <Card hoverable 
                            onClick={() => {
                                if (item.status === 'occupied') {
                                    setSelectedTable(item); // Cập nhật bàn trước
                                    setCart(item.orderItems || []); // Cập nhật món ăn cũ vào giỏ
                                    setOpen(true); // Mới mở Drawer
                                } else {
                                    handleTableClick(item);
                                } }} 
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
                    footer={[
                        <Button key="back" onClick={() => setIsBillModalOpen(false)}>Quay lại</Button>,
                        <Button 
                            key="pay" 
                            type="primary" 
                            danger
                            onClick={() => setMethodModalOpen(true)} 
                            // Chỉ cho bấm Thanh toán khi khách đưa đủ tiền
                            // disabled={!customerCash || customerCash < (billData?.total || 0)}
                        >
                            Thanh Toán
                        </Button>,
                        <Button
                            onClick={handlePrintBill}
                        >
                            In hóa đơn tạm tính
                        </Button>
                    ]}
                >
                    {billData && (
                        <div>
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

                            {/* Nội dung hóa đơn cũ của bạn */}
                            <div style={{ borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px' }}>
                                <p>Tạm tính: {billData?.subTotal?.toLocaleString()}đ</p>
                                <p>Giảm giá: {billData?.discount || 0}% (-{ (billData?.subTotal * billData.discount / 100).toLocaleString() }đ)</p>
                                <Title level={3} textAlign="right">TỔNG CỘNG: {billData?.total.toLocaleString()}đ</Title>
                            </div>
                        </div>
                    )}
                </Modal>
                                
                                {/* 1. MODAL CHỌN PHƯƠNG THỨC */}
                <Modal
                    title="CHỌN PHƯƠNG THỨC THANH TOÁN"
                    open={methodModalOpen}
                    onCancel={() => setMethodModalOpen(false)}
                    footer={null}
                    centered
                >
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', padding: '20px 0' }}>
                        <Button 
                            size="large" 
                            type="primary" 
                            icon={<MoneyCollectOutlined />} 
                            onClick={() => {
                                setMethodModalOpen(false);
                                setTienMatModalOpen(true);
                            }}
                        >
                            TIỀN MẶT
                        </Button>
                        <Button 
                            size="large" 
                            type="primary" 
                            ghost
                            icon={<QrcodeOutlined />}
                            onClick={() => {
                                // Logic xử lý chuyển khoản ở đây
                                handleThanhToan(); 
                            }}
                        >
                            CHUYỂN KHOẢN (QR)
                        </Button>
                    </div>
                </Modal>

                {/* 2. MODAL NHẬP TIỀN MẶT & TÍNH TIỀN THỐI */}
                <Modal
                    title="THANH TOÁN TIỀN MẶT"
                    open={tienMatModalOpen}
                    onCancel={() => setTienMatModalOpen(false)}
                    onOk={handleThanhToan}
                    okText="Xác nhận thanh toán"
                    cancelText="Quay lại"
                    // Chỉ cho xác nhận khi khách đưa đủ tiền
                    okButtonProps={{ disabled: customerCash < (billData?.total || 0) }}
                >
                    <div style={{ padding: '10px 0' }}>
                        {/* <p>Tổng tiền cần thanh toán: <b>{billData?.total?.toLocaleString()}đ</b></p> */}

                        <div style={{ borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px' }}>
                            <p>Tạm tính: {billData?.subTotal?.toLocaleString()}đ</p>
                            <p>Giảm giá: {billData?.discount || 0}% (-{ (billData?.subTotal * billData.discount / 100).toLocaleString() }đ)</p>
                            <Title level={3} textAlign="right">TỔNG CỘNG: {billData?.total?.toLocaleString()}đ</Title>
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label>Tiền khách đưa:</label>
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                onChange={(value) => setCustomerCash(value || 0)}
                                value={customerCash}
                                autoFocus
                                placeholder="Nhập số tiền khách đưa..."
                            />
                        </div>

                        {customerCash > 0 && (
                            <div style={{ padding: '10px', background: customerCash >= billData?.total ? '#f6ffed' : '#fff1f0', borderRadius: '8px' }}>
                                <Title level={4} style={{ margin: 0, color: customerCash >= billData?.total ? '#52c41a' : '#f5222d' }}>
                                    {customerCash >= billData?.total 
                                        ? `Tiền thối lại: ${(customerCash - billData.total).toLocaleString()}đ` 
                                        : `Còn thiếu: ${(billData.total - customerCash).toLocaleString()}đ`}
                                </Title>
                            </div>
                        )}
                    </div>
                </Modal>

                  {/* nhập số tiền khách đưa và trả lại */}
                {/* <Modal 
                    title={`Thanh toán bằng tiền mặt - ${selectedTable?.name}`}
                    open={tienMatModalOpen}
                    onCancel={() => setTienMatModalOpen(false)}
                    centered
                    footer={null} // ❗ tắt nút mặc định (OK, Cancel)
                >
                    
                    <div style={{ marginTop: '20px', padding: '15px', background: '#e6f7ff', borderRadius: '8px' }}>
                        
                        <div style={{ borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px' }}>
                            <p>Tạm tính: {billData?.subTotal?.toLocaleString()}đ</p>
                            <p>Giảm giá: {billData?.discount || 0}% (-{ (billData?.subTotal * billData.discount / 100).toLocaleString() }đ)</p>
                            <Title level={3} textAlign="right">TỔNG CỘNG: {billData?.total?.toLocaleString()}đ</Title>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <Text strong>Tiền khách đưa:</Text>
                            <InputNumber
                                style={{ width: '100%' }}
                                size="large"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                onChange={(val) => setCustomerCash(val || 0)}
                            />
                        </div>
                        <div>
                            <Text strong>Tiền thối lại:</Text>
                            <Title level={4} style={{ color: '#52c41a', margin: 0 }}>
                                {customerCash - billData?.total > 0 
                                    ? (customerCash - billData?.total).toLocaleString() 
                                    : 0}đ
                            </Title>
                        </div>
                        <Button 
                            type="primary" 
                            danger 
                            size="large" 
                            style={{ flex: 1, height: '80px' }}
                            // Chỉ cho bấm Thanh toán khi khách đưa đủ tiền
                            disabled={!customerCash || customerCash < (billData?.total || 0)}
                            onClick={handleThanhToan}
                        >
                            Xác nhận thanh toán & trả bàn
                        </Button>
                    </div>
                </Modal>
                 */}
                    {/* Chọn phuong thức thanh toán */}
                {/* <Modal
                    title={`Hãy chọn phương thức thanh toán - ${selectedTable?.name}`}
                    open={methodModalOpen}
                    onCancel={() => setMethodModalOpen(false)}
                    footer={null} // Không dùng nút mặc định của Modal
                    centered
                >
                    <div style={{ display: 'flex', gap: '15px', padding: '20px 0' }}>
                        <Button 
                            type="primary" 
                            size="large" 
                            style={{ flex: 1, height: '80px', backgroundColor: '#faad14' }}
                            onClick={() => setTienMatModalOpen(true)}
                        >
                            TIỀN MẶT
                        </Button> 
                        <Button 
                            type="primary" 
                            danger 
                            size="large" 
                            style={{ flex: 1, height: '80px' }}
                            // disabled={selectedTable?.status==='reserved'}
                            // onClick={selectedTable?.status==='reserved'? ()=>HuyDatBan(selectedTable) : handleDatBan }
                        >
                            CHUYỂN KHOẢN
                        </Button>
                    </div>
                </Modal> */}
                
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
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)} // Cập nhật từ khóa khi gõ
                    onSearch={(value) => setSearchText(value)} // Cập nhật khi bấm nút kính lúp
                />

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
                    <Col span={4}>
                        <Title level={5}>Danh mục</Title>
                        <Menu
                            mode="vertical"
                            selectedKeys={[selectedCategory]}
                            onClick={(e) => setSelectedCategory(e.key)}
                            style={{ borderRadius: '8px', border: '1px solid #f0f0f0' }}
                            items={categories.map(cat => ({ key: cat, label: cat }))}
                        />
                    </Col>
                    <Col span={12}>
                        <Row gutter={[16, 16]}>
                            {menuSeafood.filter(food => {
                                // 1. Lọc theo Danh mục (Category)
                                const matchCategory = selectedCategory === 'Tất cả' || food.category === selectedCategory;
                                
                                // 2. Lọc theo Tên món (Search Text) - Chuyển cả hai về chữ thường để so sánh chính xác
                                const matchSearch = food.name.toLowerCase().includes(searchText.toLowerCase());
                                
                                return matchCategory && matchSearch;
                            })
                            .map(food => (
                                <Col span={12} key={food.id}>
                                    <Card size="small"
                                        hoverable
                                        cover={<div style={{height: '100px', background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>🖼️</div>}
                                    
                                    >
                                        <b>{food.name}</b> - {food.price.toLocaleString()}đ
                                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCart(addToCartLogic(cart, food))} />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                    <Col span={8}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                        </div>
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
                            <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <Row gutter={16} align="middle">
                                    <Col span={12}>
                                        <Text strong>Khuyến mãi (%):</Text>
                                        <InputNumber 
                                            min={0} max={100} 
                                            value={discount} 
                                            onChange={(val) => setDiscount(val || 0)} 
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                    <Col span={12} style={{ textAlign: 'right' }}>
                                        <Text delete style={{ display: discount > 0 ? 'block' : 'none' }}>
                                            Gốc: {calculateTotal(cart).toLocaleString()}đ
                                        </Text>
                                        <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>
                                            Tổng: {(calculateTotal(cart) * (1 - discount/100)).toLocaleString()}đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>
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