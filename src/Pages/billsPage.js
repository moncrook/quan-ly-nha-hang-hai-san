import React, { useState } from 'react';
import { Table, Card, Row, Col, Statistic, Typography, Dropdown, 
    Space, Button, Modal, Form, InputNumber, Popconfirm, message, Input, Select,
    Tag, Divider, DatePicker
 } from 'antd';
import { DollarCircleOutlined, FileTextOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/vi_VN';
import * as XLSX from 'xlsx'; // Thêm dòng này ở đầu file

const { RangePicker } = DatePicker;
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
    // Hàm xử lý tạo báo cáo Ngày/Tháng
    const generateReport = (type) => {
        const now = new Date();
        let title = '';
        let filteredBills = [];

        if (type === 'day') {
            const todayStr = now.toLocaleDateString('vi-VN');
            title = `BÁO CÁO DOANH THU NGÀY ${todayStr}`;
            filteredBills = billHistory.filter(bill => bill.time.includes(todayStr));
        } else {
            const monthStr = `${now.getMonth() + 1}/${now.getFullYear()}`;
            title = `BÁO CÁO CHI TIẾT THÁNG ${monthStr}`;
            filteredBills = billHistory.filter(bill => bill.time.includes(monthStr));
        }

        // --- BẮT ĐẦU ĐOẠN TÍNH TOÁN TIỀN MẶT / CHUYỂN KHOẢN ---
        // (Mặc định những hóa đơn cũ chưa có paymentMethod sẽ được tính là Tiền mặt)
        const cashBills = filteredBills.filter(b => (b.paymentMethod || 'Tiền mặt') === 'Tiền mặt');
        const transferBills = filteredBills.filter(b => b.paymentMethod === 'Chuyển khoản');

        const cashTotal = cashBills.reduce((sum, b) => sum + b.total, 0);
        const transferTotal = transferBills.reduce((sum, b) => sum + b.total, 0);
        // --- KẾT THÚC ĐOẠN TÍNH TOÁN ---

        if (type === 'day') {
            setReportData({
                title,
                total: filteredBills.reduce((sum, b) => sum + b.total, 0),
                count: filteredBills.length,
                cashTotal, cashCount: cashBills.length,
                transferTotal, transferCount: transferBills.length,
                details: filteredBills,
                type: 'day'
            });
        } else {
            const grouped = filteredBills.reduce((acc, bill) => {
                const dateKey = bill.time.split(', ')[1] || bill.time.split(' ')[1]; 
                if (!acc[dateKey]) {
                    acc[dateKey] = { date: dateKey, dailyTotal: 0, dailyCount: 0 };
                }
                acc[dateKey].dailyTotal += bill.total;
                acc[dateKey].dailyCount += 1;
                return acc;
            }, {});

            const dailyArray = Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));

            setReportData({
                title,
                total: filteredBills.reduce((sum, b) => sum + b.total, 0),
                count: filteredBills.length,
                cashTotal, cashCount: cashBills.length,
                transferTotal, transferCount: transferBills.length,
                dailyDetails: dailyArray,
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

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isRangePickerModalOpen, setIsRangePickerModalOpen] = useState(false);

    // Hàm tạo báo cáo Tùy Chọn
    const generateCustomReport = (dates) => {
        if (!dates || !dates[0] || !dates[1]) return;
        const [start, end] = dates;
        
        const filteredBills = billHistory.filter(bill => {
            const dateStr = bill.time.split(' ')[1]; 
            const [d, m, y] = dateStr.split('/').map(Number);
            const billDate = dayjs(new Date(y, m - 1, d));
            return (billDate.isAfter(start, 'day') || billDate.isSame(start, 'day')) && 
                   (billDate.isBefore(end, 'day') || billDate.isSame(end, 'day'));
        });

        // Tách Tiền mặt và Chuyển khoản
        const cashBills = filteredBills.filter(b => (b.paymentMethod || 'Tiền mặt') === 'Tiền mặt');
        const transferBills = filteredBills.filter(b => b.paymentMethod === 'Chuyển khoản');

        const dailyMap = {};
        let totalRevenue = 0;

        filteredBills.forEach(bill => {
            const dateKey = bill.time.split(' ')[1]; 
            totalRevenue += bill.total;

            if (!dailyMap[dateKey]) {
                dailyMap[dateKey] = { date: dateKey, dailyTotal: 0, dailyCount: 0, bills: [] };
            }
            dailyMap[dateKey].dailyTotal += bill.total;
            dailyMap[dateKey].dailyCount += 1;
            dailyMap[dateKey].bills.push(bill);
        });

        const dailyDetails = Object.values(dailyMap).sort((a, b) => {
            return dayjs(a.date, 'DD/MM/YYYY').unix() - dayjs(b.date, 'DD/MM/YYYY').unix();
        });

        setReportData({
            title: `BÁO CÁO DOANH THU TÙY CHỌN`,
            subtitle: `Từ ${start.format('DD/MM/YYYY')} đến ${end.format('DD/MM/YYYY')}`,
            total: totalRevenue,
            count: filteredBills.length,
            cashTotal: cashBills.reduce((sum, b) => sum + b.total, 0),
            cashCount: cashBills.length,
            transferTotal: transferBills.reduce((sum, b) => sum + b.total, 0),
            transferCount: transferBills.length,
            dailyDetails: dailyDetails,
            type: 'custom_grouped' 
        });
        setIsReportModalOpen(true);
    };

    // 1. Lấy ngày hôm nay theo định dạng dữ liệu của Nhạn (ví dụ: "6/5/2026")
    const todayStr = dayjs().format('D/M/YYYY');

    // 2. Lọc danh sách hóa đơn CHỈ HIỆN NGÀY HÔM NAY trên bảng chính
    const displayBills = billHistory.filter(bill => {
        // Tách lấy phần ngày từ chuỗi "HH:mm:ss DD/MM/YYYY"
        const billDate = bill.time.split(' ')[1]; 
        return billDate === todayStr;
    });

    // 3. Tính toán các con số thống kê trên Card cũng chỉ dựa trên ngày hôm nay
    const totalBillsAmountToday = displayBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalRevenueToday = totalBillsAmountToday + openingAmount;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Dropdown 
                    menu={{ 
                        items: [
                            {key:'1', label:'Báo cáo ngày', onClick: () => generateReport('day') }, 
                            {key:'2', label:'Báo cáo tháng', onClick: () => generateReport('month')},
                            { key: '3', label: 'Báo cáo tùy chỉnh (Chọn ngày)', onClick: () => setIsRangePickerModalOpen(true) }
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
                    <Button key="print" type="dashed" onClick={() => window.print()}>
                        🖨️ In báo cáo
                    </Button>,
                    <Button key="excel" type="primary" style={{ backgroundColor: '#1d6f42', borderColor: '#1d6f42' }} icon={<FileTextOutlined/>} 
                        onClick={exportToExcel}
                    >
                        Xuất Excel
                    </Button>
                ]}
            >
                {/* 1. Khu vực Thống kê con số */}
                {/* 1. Khu vực Thống kê con số */}
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col span={8}>
                        <Card bordered={false} style={{ background: '#e6f7ff', borderRadius: '8px' }}>
                            <Statistic title="TỔNG DOANH THU" value={reportData.total} suffix="đ" valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
                            <div style={{ marginTop: 5, color: '#595959' }}>
                                Số lượng: <b>{reportData.count}</b> HĐ
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} style={{ background: '#fff7e6', borderRadius: '8px' }}>
                            <Statistic title="THU TIỀN MẶT" value={reportData.cashTotal} suffix="đ" valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }} />
                            <div style={{ marginTop: 5, color: '#595959' }}>
                                Số lượng: <b>{reportData.cashCount}</b> HĐ
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card bordered={false} style={{ background: '#e6fffb', borderRadius: '8px' }}>
                            <Statistic title="THU CHUYỂN KHOẢN" value={reportData.transferTotal} suffix="đ" valueStyle={{ color: '#13c2c2', fontWeight: 'bold' }} />
                            <div style={{ marginTop: 5, color: '#595959' }}>
                                Số lượng: <b>{reportData.transferCount}</b> HĐ
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Divider />

                {/* 2. Bảng danh sách chi tiết */}
                <Text strong style={{ fontSize: '16px' }}>📄 Chi tiết các giao dịch:</Text>
                <Table
                    style={{ marginTop: 10 }}
                    // CHỌN NGUỒN DỮ LIỆU: Nếu là báo cáo ngày thì hiện details, còn lại hiện dailyDetails
                    dataSource={reportData.type === 'day' ? reportData.details : reportData.dailyDetails}
                    rowKey={(record) => record.id || record.date}
                    pagination={{ pageSize: 7 }}
                    columns={
                        // ĐIỀU KIỆN CHỌN CỘT HIỂN THỊ
                        (reportData.type === 'month' || reportData.type === 'custom_grouped') 
                        ? [
                            // Cột dành cho báo cáo THÁNG hoặc TÙY CHỌN (Gom nhóm theo ngày)
                            { title: 'Ngày', dataIndex: 'date', key: 'date' },
                            { 
                                title: 'Số hóa đơn', 
                                dataIndex: 'dailyCount', 
                                align: 'center', 
                                render: (c) => <Tag color="blue">{c} HĐ</Tag> 
                            },
                            { 
                                title: 'Doanh thu ngày', 
                                dataIndex: 'dailyTotal', 
                                align: 'right', 
                                render: (v) => <b style={{color: '#1890ff'}}>{v.toLocaleString()}đ</b> 
                            },
                        ]
                        : [
                            // Cột dành cho báo cáo NGÀY (Hiện từng hóa đơn chi tiết)
                            { title: 'Mã HĐ', dataIndex: 'id', render: (id) => id ? `#${id.toString().slice(-6)}` : 'N/A' },
                            { title: 'Bàn', dataIndex: 'tableName' },
                            { title: 'Thời gian', dataIndex: 'time' },
                            { 
                                title: 'Thanh toán', 
                                dataIndex: 'paymentMethod', 
                                render: (method) => <Tag color={method === 'Chuyển khoản' ? 'cyan' : 'orange'}>{method || 'Tiền mặt'}</Tag>
                            },
                            { 
                                title: 'Tổng tiền', 
                                dataIndex: 'total', 
                                align: 'right', 
                                render: (v) => <b>{v.toLocaleString()}đ</b> 
                            },
                        ]
                    }
                    summary={(pageData) => {
                        // Dòng tổng cộng ở cuối bảng cho đẹp
                        let totalVal = 0;
                        let countVal = 0;
                        
                        pageData.forEach((record) => {
                            totalVal += record.total || record.dailyTotal || 0;
                            countVal += record.dailyCount || 1;
                        });

                        return (
                            <Table.Summary.Row style={{ background: '#fafafa' }}>
                                <Table.Summary.Cell index={0}><b>TỔNG CỘNG</b></Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center"><b>{countVal} HĐ</b></Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <b style={{ color: 'red', fontSize: '16px' }}>{totalVal.toLocaleString()}đ</b>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        );
                    }}
                />
            </Modal>
            
            {/* 1. Modal bước đệm để chọn ngày */}
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>📅 CHỌN KHOẢNG THỜI GIAN BÁO CÁO</Title>}
                open={isRangePickerModalOpen}
                onCancel={() => {
                    setIsRangePickerModalOpen(false);
                    setStartDate(null); // Reset khi hủy
                    setEndDate(null);
                }}
                onOk={() => {
                    if (!startDate || !endDate) {
                        message.warning("Nhạn ơi, vui lòng chọn đủ cả ngày bắt đầu và ngày kết thúc nhé!");
                        return;
                    }
                    // Gọi hàm tạo báo cáo với mảng [startDate, endDate] để tương thích với logic cũ
                    generateCustomReport([startDate, endDate]);
                    setIsRangePickerModalOpen(false);
                }}
                okText="Xem báo cáo"
                cancelText="Hủy"
                width={400}
            >
                <div style={{ padding: '10px 0' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                            <Text strong>Từ ngày:</Text>
                            <DatePicker 
                                locale={locale}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày bắt đầu"
                                style={{ width: '100%', marginTop: '5px' }}
                                onChange={(date) => setStartDate(date)}
                            />
                        </div>

                        <div>
                            <Text strong>Đến ngày:</Text>
                            <DatePicker 
                                locale={locale}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày kết thúc"
                                style={{ width: '100%', marginTop: '5px' }}
                                onChange={(date) => setEndDate(date)}
                                // Logic: Không cho chọn ngày kết thúc bé hơn ngày bắt đầu
                                disabledDate={(current) => {
                                    return startDate ? current && current < startDate.startOf('day') : false;
                                }}
                            />
                        </div>
                    </Space>
                </div>
            </Modal>

            <Title level={2}>🧾 QUẢN LÝ HÓA ĐƠN</Title>

            <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic 
                            title="Doanh thu hôm nay" 
                            value={totalRevenueToday} 
                            precision={0} 
                            valueStyle={{ color: '#3f8600' }} 
                            prefix={<DollarCircleOutlined />} 
                            suffix="VNĐ" 
                        />
                        <p style={{ fontSize: '12px', color: '#888' }}>
                            (HĐ: {totalBillsAmountToday.toLocaleString()} + Mở ca: {openingAmount.toLocaleString()})
                        </p>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic title="Hóa đơn hôm nay" value={displayBills.length} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Table 
                dataSource={displayBills} 
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