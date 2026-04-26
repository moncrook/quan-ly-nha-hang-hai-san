import React, { useState } from 'react';
import { Table, Card, Row, Col, Statistic, Typography, Dropdown, 
    Space, Button, Modal, Form, InputNumber, Popconfirm, message, Input, Select } from 'antd';
import { DollarCircleOutlined, FileTextOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BillsPage = ({ billHistory, setBillHistory, currentShift, menuSeafood }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [form] = Form.useForm();
    
    // Watch giá trị discount để tính toán real-time
    const discountWatch = Form.useWatch('discount', form);

    // Mở modal sửa
    // Trong hàm handleEdit, hãy giữ logic kiểm tra an toàn này để không bao giờ bị crash nữa
    const handleEdit = (record) => {
        const rawItems = record.orderItems || record.items || [];
        setEditingBill({ ...record, orderItems: [...rawItems] });

        form.setFieldsValue({
            staff: record.staff,
            discount: record.discount || 0,
            paymentMethod: record.paymentMethod || 'Tiền mặt' // Mặc định nếu cũ chưa có
        });
        setIsEditModalOpen(true);
    };

    // Tính toán số tiền hiện tại trong Modal
    // Sửa lại hàm tính toán này để an toàn tuyệt đối
    const calculateSubtotal = () => {
        // Luôn đảm bảo có mảng để tránh lỗi .map hoặc .reduce của undefined
        const items = editingBill?.orderItems || [];
        return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    };
    const subtotal = calculateSubtotal();
    const finalAmount = subtotal * (1 - (discountWatch || 0) / 100);

    // Lưu sau khi sửa
    const handleSaveEdit = (values) => {
        const updatedHistory = billHistory.map(bill => 
            bill.id === editingBill.id 
            ? { 
                ...bill, 
                staff: values.staff, 
                discount: values.discount, 
                orderItems: editingBill.orderItems, 
                total: finalAmount // Lưu giá trị đã tính toán lại
              } 
            : bill
        );

        setBillHistory(updatedHistory);
        setIsEditModalOpen(false);
        message.success("Đã cập nhật hóa đơn và tính lại doanh thu!");
    };

    const handleDelete = (id) => {
        const updatedHistory = billHistory.filter(bill => bill.id !== id);
        setBillHistory(updatedHistory);
        message.success("Đã xóa hóa đơn!");
    };

    // Hàm thêm món mới vào hóa đơn đang sửa
    const handleAddProductToBill = (productId) => {
        // Tìm món ăn trong menu gốc
        const productToAdd = menuSeafood.find(p => p.id === productId);
        if (!productToAdd) return;

        const currentItems = [...(editingBill?.orderItems || [])];
        const existingItem = currentItems.find(item => item.id === productId);

        if (existingItem) {
            // Nếu món đã có trong bill thì tăng số lượng
            existingItem.qty += 1;
        } else {
            // Nếu chưa có thì thêm mới vào mảng
            currentItems.push({ ...productToAdd, qty: 1 });
        }

        // Cập nhật state tạm thời của Modal
        setEditingBill({ ...editingBill, orderItems: currentItems });
        message.success(`Đã thêm ${productToAdd.name}`);
    };

    const columns = [
        { title: 'Mã HĐ', dataIndex: 'id', key: 'id', render: (id) => `#${id.toString().slice(-6)}` },
        { title: 'Bàn', dataIndex: 'tableName', key: 'tableName' },
        { title: 'Thời gian', dataIndex: 'time', key: 'time' },
        { title: 'Nhân viên', dataIndex: 'staff', key: 'staff' },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'total', 
            key: 'total', 
            render: (total) => <b style={{ color: '#52c41a' }}>{total.toLocaleString()}đ</b> 
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm title="Xóa hóa đơn này?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const totalBillsAmount = billHistory.reduce((sum, bill) => sum + bill.total, 0);
    const openingAmount = currentShift ? currentShift.openingBalance : 0;
    const totalRevenue = totalBillsAmount + openingAmount;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Dropdown menu={{ items: [{key:'1', label:'Báo cáo ngày'}, {key:'2', label:'Báo cáo tháng'}] }} trigger={['click']}>
                    <MoreOutlined style={{ transform: 'rotate(90deg)', fontSize: 18, cursor: 'pointer' }} />
                </Dropdown>
            </div>
            
            <Title level={2}>🧾 QUẢN LÝ HÓA ĐƠN</Title>

            <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic title="Tổng doanh thu" value={totalRevenue} precision={0} valueStyle={{ color: '#3f8600' }} prefix={<DollarCircleOutlined />} suffix="VNĐ" />
                        <p style={{ fontSize: '12px', color: '#888' }}>
                            (HĐ: {totalBillsAmount.toLocaleString()} + Mở ca: {openingAmount.toLocaleString()})
                        </p>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic title="Tổng số hóa đơn" value={billHistory.length} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Table dataSource={billHistory} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />

            <Modal
                title={`CHỈNH SỬA HÓA ĐƠN #${editingBill?.id}`}
                open={isEditModalOpen}
                width={750}
                onOk={() => form.submit()}
                onCancel={() => setIsEditModalOpen(false)}
                okText="Cập nhật hóa đơn"
            >
                <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="staff" label="Nhân viên"><Input /></Form.Item></Col>
                        <Col span={8}>
                            <Form.Item name="paymentMethod" label="P.Thức Thanh Toán">
                                <Select>
                                    <Select.Option value="Tiền mặt">💵 Tiền mặt</Select.Option>
                                    <Select.Option value="Chuyển khoản">💳 Chuyển khoản</Select.Option>
                                    <Select.Option value="Thẻ">🏧 Quẹt thẻ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}><Form.Item name="discount" label="Giảm giá (%)"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
                    </Row>

                    <div style={{ marginBottom: 15, padding: '10px', background: '#f0f5ff', borderRadius: 8 }}>
                        <Text strong>Thêm món mới vào bill: </Text>
                        <Select
                            showSearch
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Tìm món ăn để thêm..."
                            optionFilterProp="children"
                            onChange={handleAddProductToBill} // Gọi hàm thêm món khi chọn
                            value={null} // Để Select luôn trống sau khi chọn xong
                        >
                            {menuSeafood.map(food => (
                                <Select.Option key={food.id} value={food.id}>
                                    {food.name} - {food.price.toLocaleString()}đ
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <Text strong>Danh sách món:</Text>
                    <Table
                        dataSource={editingBill?.orderItems || []}
                        pagination={false}
                        size="small"
                        rowKey="id"
                        columns={[
                            { title: 'Tên món', dataIndex: 'name' },
                            { title: 'Giá', dataIndex: 'price', render: (p) => `${p.toLocaleString()}đ` },
                            { 
                                title: 'SL', 
                                dataIndex: 'qty',
                                render: (qty, record) => (
                                    <InputNumber min={1} value={qty} onChange={(val) => {
                                        const newItems = editingBill.orderItems.map(item => item.id === record.id ? { ...item, qty: val } : item);
                                        setEditingBill({ ...editingBill, orderItems: newItems });
                                    }} />
                                )
                            },
                            { title: 'Thành tiền', render: (_, r) => <span>{(r.price * r.qty).toLocaleString()}đ</span> },
                            {
                                title: '',
                                render: (_, record) => (
                                    <Button type="link" danger onClick={() => {
                                        const newItems = editingBill.orderItems.filter(item => item.id !== record.id);
                                        setEditingBill({ ...editingBill, orderItems: newItems });
                                    }}>Xóa</Button>
                                )
                            }
                        ]}
                    />

                    {/* HIỂN THỊ TÍNH TIỀN TẠM THỜI */}
                    <div style={{ marginTop: 20, padding: 15, background: '#fafafa', borderRadius: 8, textAlign: 'right' }}>
                        <p>Tạm tính: <b>{subtotal.toLocaleString()}đ</b></p>
                        <p>Giảm giá ({discountWatch || 0}%): <span style={{color: 'red'}}>-{((subtotal * (discountWatch || 0)) / 100).toLocaleString()}đ</span></p>
                        <Title level={4} style={{ margin: 0 }}>
                            Thành tiền: <span style={{color: '#52c41a'}}>{finalAmount.toLocaleString()}đ</span>
                        </Title>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default BillsPage;