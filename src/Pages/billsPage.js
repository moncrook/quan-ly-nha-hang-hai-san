import React from 'react';
import { Table, Card, Row, Col, Statistic, Typography, Tag, Dropdown } from 'antd';
import { DollarCircleOutlined, FileTextOutlined, MoreOutlined } from '@ant-design/icons';

const { Title } = Typography;

const BillsPage = ({billHistory})=>{
    
    const totalRevenue = billHistory.reduce((sum, bill) => sum + bill.total, 0);

    const menuBills=[
        {
    key: '1',
    label: 'báo cáo doanh thu theo ngày',
    // onClick: () => handleEdit(item),
    },
    {
            key: '2',
            label: 'báo cáo doanh thu theo tháng',
            // onClick: () => setChuyenBanOpen(true),
    },
    ]

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
    ];

    
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Dropdown
                                menu={{ items: menuBills }}
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
            <Title level={2}>🧾 QUẢN LÝ HÓA ĐƠN</Title>

            <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#f6ffed' }}>
                        <Statistic
                            title="Tổng doanh thu"
                            value={totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="VNĐ"
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ background: '#e6f7ff' }}>
                        <Statistic
                            title="Tổng số hóa đơn"
                            value={billHistory.length}
                            prefix={<FileTextOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Table 
                dataSource={billHistory} 
                columns={columns} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
}

export default BillsPage;