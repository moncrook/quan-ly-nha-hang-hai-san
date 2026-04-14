import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Tag, Empty, message, Typography, Modal } from 'antd';
import { CheckCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { getBooker, handleBookingLogic } from '../Untils/handleTable';

const { Title, Text } = Typography;

const BookingPage = ({ tableData, setTableData }) => {
    // Lấy danh sách bàn trống từ props hoặc dữ liệu tổng
    const [availableTables, setAvailableTables] = useState([]);
    const [bookingTable,setBookingTable]=useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    
    const [selectedTable, setSelectedTable] = useState(null);
    const [cart, setCart] = useState([]);

    const handleclickTable=(item)=>{
        selectedTable(item);
        setBookingTable(true)
    }

    useEffect(() => {
        setAvailableTables(getBooker(tableData));
    }, [tableData]);

    const confirmBooking = (tableId, tableName) => {
        const updated = handleBookingLogic(tableData, tableId);
        setBookingTable(true)
        setTableData(updated);
        message.success(`Đã xác nhận đặt ${tableName} thành công!`);
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
                                        type="primary" 
                                        icon={<CheckCircleOutlined />} 
                                        //  hoverable onClick={() => handleclickTable(item)}
                                        onClick={() => confirmBooking(item.id, item.name)}
                                    >
                                        Xác nhận đặt
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
                        <Empty description="Hiện tại không còn bàn nào trống!" />
                    </Col>
                )}
            </Row>

            <Modal 
                title={`Bạn có chắc muốn đặt bàn này không - ${selectedTable?.name}`}
                open={bookingTable}
                onCancel={() => setBookingTable(false)}
                centered
            >

            </Modal>
        </div>
    );
};

export default BookingPage;