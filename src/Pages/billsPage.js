import React, { useState } from 'react';
import { Table, Card, Row, Col, Statistic, Typography, Dropdown, 
    Space, Button, Modal, Form, InputNumber, Popconfirm, message, Input, Select,
    Tag, Divider
 } from 'antd';
import { DollarCircleOutlined, FileTextOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import * as XLSX from 'xlsx'; // Thêm dòng này ở đầu file

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
            paymentMethod: record.paymentMethod || 'Tiền mặt', // Mặc định nếu cũ chưa có
            note: record.note || '',
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
                note: values.note,
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
            title: 'Ghi chú', 
            dataIndex: 'note', 
            key: 'note',
            width: 150,
            render: (text) => <Text type="secondary" italic style={{ fontSize: '12px' }}>{text || '-'}</Text>
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


    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportData, setReportData] = useState({ title: '', total: 0, count: 0, dailyDetails: [] });

    // Hàm xử lý tạo báo cáo
    const generateReport = (type) => {
        const now = new Date();
        let title = '';
        let filteredBills = [];

        if (type === 'day') {
            const todayStr = now.toLocaleDateString('vi-VN');
            title = `BÁO CÁO DOANH THU NGÀY ${todayStr}`;
            filteredBills = billHistory.filter(bill => bill.time.includes(todayStr));
            
            setReportData({
                title,
                total: filteredBills.reduce((sum, b) => sum + b.total, 0),
                count: filteredBills.length,
                details: filteredBills, // Hiện danh sách hóa đơn chi tiết
                type: 'day'
            });
        } else {
            const monthStr = `${now.getMonth() + 1}/${now.getFullYear()}`;
            title = `BÁO CÁO CHI TIẾT THÁNG ${monthStr}`;
            
            // 1. Lọc hóa đơn trong tháng
            filteredBills = billHistory.filter(bill => bill.time.includes(monthStr));

            // 2. Nhóm dữ liệu theo từng ngày
            const grouped = filteredBills.reduce((acc, bill) => {
                // Tách lấy phần ngày từ chuỗi "14:30:00, 26/04/2026" -> lấy "26/04/2026"
                const dateKey = bill.time.split(', ')[1] || bill.time.split(' ')[1]; 
                if (!acc[dateKey]) {
                    acc[dateKey] = { date: dateKey, dailyTotal: 0, dailyCount: 0 };
                }
                acc[dateKey].dailyTotal += bill.total;
                acc[dateKey].dailyCount += 1;
                return acc;
            }, {});

            // Chuyển object thành mảng và sắp xếp theo ngày giảm dần
            const dailyArray = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));

            setReportData({
                title,
                total: filteredBills.reduce((sum, b) => sum + b.total, 0),
                count: filteredBills.length,
                dailyDetails: dailyArray, // Hiện danh sách tổng hợp từng ngày
                type: 'month'
            });
        }
        setIsReportModalOpen(true);
    };

    const exportToExcel = () => {
        let dataForExcel = [];

        if (reportData.type === 'month') {
            // Cấu trúc dữ liệu cho báo cáo THÁNG
            dataForExcel = reportData.dailyDetails.map(item => ({
                "Ngày": item.date,
                "Số lượng hóa đơn": item.dailyCount,
                "Doanh thu (VNĐ)": item.dailyTotal
            }));
        } else {
            // Cấu trúc dữ liệu cho báo cáo NGÀY
            dataForExcel = reportData.details.map(bill => ({
                "Mã Hóa Đơn": `#${bill.id.toString().slice(-6)}`,
                "Bàn": bill.tableName,
                "Thời gian": bill.time,
                "Nhân viên": bill.staff,
                "Tổng tiền (VNĐ)": bill.total
            }));
        }

        // Tạo Worksheet từ dữ liệu
        const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
        // Tạo Workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BaoCaoDoanhThu");
        
        // Xuất file với tên theo tiêu đề báo cáo
        const fileName = `${reportData.title.replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        message.success("Đã tải xuống file báo cáo Excel!");
    };

        //State quản lý Modal Xem Chi Tiết
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Dropdown 
                    menu={{ 
                        items: [
                            {key:'1', label:'Báo cáo ngày', onClick: () => generateReport('day') }, 
                            {key:'2', label:'Báo cáo tháng', onClick: () => generateReport('month')}
                        ] }} trigger={['click']}
                >
                    <MoreOutlined style={{ transform: 'rotate(90deg)', fontSize: 18, cursor: 'pointer' }} />
                </Dropdown>
            </div>
            <Modal
                title={<Title level={3} style={{ color: '#096dd9' }}>{reportData.title}</Title>}
                open={isReportModalOpen}
                onCancel={() => setIsReportModalOpen(false)}
                width={700}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setIsReportModalOpen(false)}>Đóng</Button>,
                    <Button key="excel" type="primary" style={{ backgroundColor: '#1d6f42', borderColor: '#1d6f42' }} icon={<FileTextOutlined/>} 
                        onClick={exportToExcel}
                    >
                        Xuất Excel
                    </Button>
                ]}
            >
                {/* Thống kê tổng quát tháng */}
                <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={12}>
                        <Card size="small" style={{ background: '#f6ffed', borderLeft: '5px solid #52c41a' }}>
                            <Statistic title="TỔNG DOANH THU THÁNG" value={reportData.total} suffix="đ" valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card size="small" style={{ background: '#e6f7ff', borderLeft: '5px solid #1890ff' }}>
                            <Statistic title="TỔNG HÓA ĐƠN" value={reportData.count} suffix="HĐ" />
                        </Card>
                    </Col>
                </Row>

                <Text strong style={{ fontSize: '16px' }}>
                    {reportData.type === 'month' ? "📅 Chi tiết doanh thu từng ngày:" : "📄 Danh sách hóa đơn trong ngày:"}
                </Text>

                <Table
                    style={{ marginTop: 10 }}
                    dataSource={reportData.type === 'month' ? reportData.dailyDetails : reportData.details}
                    rowKey={(record) => record.date || record.id}
                    pagination={{ pageSize: 7 }}
                    columns={
                        reportData.type === 'month' 
                        ? [
                            { title: 'Ngày', dataIndex: 'date', key: 'date' },
                            { title: 'Số hóa đơn', dataIndex: 'dailyCount', key: 'dailyCount', align: 'center', render: (c) => <Tag color="blue">{c} HĐ</Tag> },
                            { title: 'Doanh thu ngày', dataIndex: 'dailyTotal', key: 'dailyTotal', align: 'right', render: (v) => <b>{v.toLocaleString()}đ</b> },
                        ]
                        : [
                            { title: 'Mã HĐ', dataIndex: 'id', render: (id) => `#${id.toString().slice(-6)}` },
                            { title: 'Bàn', dataIndex: 'tableName' },
                            { title: 'Tổng tiền', dataIndex: 'total', render: (v) => <b>{v.toLocaleString()}đ</b> },
                        ]
                    }
                    summary={(pageData) => {
                        if (reportData.type === 'month') {
                            return (
                                <Table.Summary.Row style={{ background: '#fafafa' }}>
                                    <Table.Summary.Cell index={0}><b>TỔNG CỘNG</b></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1} align="center"><b>{reportData.count} HĐ</b></Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} align="right"><b style={{ color: 'red' }}>{reportData.total.toLocaleString()}đ</b></Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }
                    }}
                />
            </Modal>
            
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

            <Table 
                dataSource={billHistory} 
                columns={columns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }} 
                onRow={(record) => ({
                    onClick: (event) => {
                        // Nếu click vào mấy cái nút Sửa/Xóa thì không mở Modal chi tiết
                        if (event.target.closest('button')) return; 
                        setSelectedBill(record);
                        setIsDetailModalOpen(true);
                    },
                    style: { cursor: 'pointer' } // Hiện con trỏ bàn tay khi di chuột vào dòng
                })}
                />

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

                    {/* 👉 THÊM Ô SỬA GHI CHÚ TỔNG QUÁT Ở ĐÂY */}
                    <Form.Item name="note" label="Ghi chú hóa đơn">
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú cập nhật..." />
                    </Form.Item>

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
            <Modal
                title={<Title level={3}>CHI TIẾT HÓA ĐƠN #{selectedBill?.id.toString().slice(-6)}</Title>}
                open={isDetailModalOpen}
                onCancel={() => setIsDetailModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>,
                    <Button key="print" type="primary" onClick={() => window.print()}>🖨️ In lại hóa đơn</Button>
                ]}
                width={600}
            >
                {selectedBill && (
                    <div id="bill-detail-content">
                        <Row gutter={[16, 8]}>
                            <Col span={12}><Text strong>Bàn:</Text> {selectedBill.tableName}</Col>
                            <Col span={12}><Text strong>Thời gian:</Text> {selectedBill.time}</Col>
                            <Col span={12}><Text strong>Nhân viên:</Text> {selectedBill.staff}</Col>
                            <Col span={12}>
                                <Text strong>P.Thức:</Text> <Tag color="orange">{selectedBill.paymentMethod || 'Tiền mặt'}</Tag>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '15px 0' }} />

                        <Table
                            dataSource={selectedBill.orderItems}
                            pagination={false}
                            size="small"
                            rowKey="id"
                            columns={[
                                { title: 'Món ăn', dataIndex: 'name', key: 'name' },
                                { title: 'SL', dataIndex: 'qty', key: 'qty', align: 'center' },
                                { title: 'Đơn giá', dataIndex: 'price', render: (v) => v.toLocaleString(), align: 'right' },
                                { title: 'T.Tiền', render: (_, r) => (r.price * r.qty).toLocaleString(), align: 'right' },
                            ]}
                        />

                        <div style={{ marginTop: 20, textAlign: 'right', borderTop: '1px dashed #ccc', paddingTop: 10 }}>
                            <p>Tạm tính: <b>{selectedBill.subTotal?.toLocaleString() || (selectedBill.total / (1 - (selectedBill.discount || 0)/100)).toLocaleString()}đ</b></p>
                            <p>Giảm giá: <Text type="danger">-{selectedBill.discount || 0}%</Text></p>
                            <Title level={4}>TỔNG CỘNG: <span style={{ color: '#52c41a' }}>{selectedBill.total.toLocaleString()}đ</span></Title>
                        </div>

                        {selectedBill.note && (
                            <div style={{ marginTop: 10, padding: 10, background: '#fffbe6', borderRadius: 5, border: '1px solid #ffe58f' }}>
                                <Text italic><b>Ghi chú:</b> {selectedBill.note}</Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default BillsPage;