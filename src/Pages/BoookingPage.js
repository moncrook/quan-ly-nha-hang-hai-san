import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Tag, Empty, message, Typography, Modal, Descriptions } from 'antd';
import { CheckCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { getBooker, handleBookingLogic, HuyDatBanLogic } from '../Untils/handleTable';

const { Title, Text } = Typography;

const BookingPage = ({ tableData, setTableData }) => {
    // Lấy danh sách bàn trống từ props hoặc dữ liệu tổng
    const [availableTables, setAvailableTables] = useState([]);
    const [bookingTable,setBookingTable]=useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    
    const [selectedTable, setSelectedTable] = useState(null);
    const [cart, setCart] = useState([]);

    const handleclickTable=(item)=>{
        setSelectedTable(item);      // Lưu bàn được chọn
        setSelectedBooking(item);    // Lưu thông tin để hiển thị Descriptions
        setBookingTable(true);       // Mở Modal
    }

    useEffect(() => {
        setAvailableTables(getBooker(tableData));
    }, [tableData]);

    const confirmBooking = (tableId, tableName) => {
        const updated = handleBookingLogic(tableData, tableId);
        setBookingTable(true)
        setTableData(updated);
        // message.success(`Đã xác nhận đặt ${tableName} thành công!`);
    };
// Hủy đạt bàn
    const HuyDatBan=(item)=>{
        const update=HuyDatBanLogic(tableData, item.id);
        setTableData(update);
        message.success(`Đã xác nhận hủy đặt ${item.name} thành công!`);
    }

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleShowBookingDetail = (tableItem) => {
        setSelectedBooking(tableItem);
        setIsDetailModalOpen(true);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>📅 Quản Lý Đặt Bàn</Title>
            <Text type="secondary">Danh sách các bàn hiện đang trống và sẵn sàng phục vụ</Text>
            
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                {availableTables.length > 0 ? (
                    availableTables.map(item => (
                        <Col span={6} key={item.id}>
                            <Card 
                                title={<b>{item.name}</b>}
                                extra={<Tag color="red">Bàn đã đặt</Tag>}
                                actions={[
                                    <Button 
                                        // type="primary"   
                                        icon={<CheckCircleOutlined />} 
                                        onClick={() => HuyDatBan(item)}
                                    >
                                        Hủy
                                    </Button>,
                                    <Button 
                                        type="primary" 
                                        icon={<CheckCircleOutlined />} 
                                        onClick={() => handleclickTable(item)}
                                    >
                                        Chi tiết
                                    </Button>
                                ]}
                            >
                                <p><ShopOutlined /> Sức chứa: <b>{item.capacity} người</b></p>
                                <p>Vị trí: {item.id < 5 ? 'Khu vực sảnh' : 'Khu vực VIP'}</p>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col span={24}>
                        <Empty description="Hiện tại không có bàn đặt!" />
                    </Col>
                )}
            </Row>
            <Modal 
                title={`Thông tin chi tiết bàn đã đặt - ${selectedBooking?.name}`}
                open={bookingTable}
                onCancel={() => setBookingTable(false)}
                centered
                footer={null} // ❗ tắt nút mặc định (OK, Cancel)
            >
                {selectedBooking?.bookingInfo ? (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Tên khách hàng">
                            <b>{selectedBooking.bookingInfo.customerName}</b>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {selectedBooking.bookingInfo.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giờ hẹn">
                            <Tag color="blue">{selectedBooking.bookingInfo.arrivalTime}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng khách">
                            {selectedBooking.bookingInfo.guestCount || selectedBooking.capacity} người
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                            {selectedBooking.bookingInfo.note || "Không có ghi chú"}
                        </Descriptions.Item>
                    </Descriptions>
                ) : (
                    <Empty description="Không tìm thấy thông tin đặt bàn" />
                )}
            </Modal>
        </div>
    );
};

export default BookingPage;