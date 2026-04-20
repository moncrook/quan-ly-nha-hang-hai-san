import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Tag, Menu, Typography,
        Row, Col, Card, Select
 } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { menuSeafood, handleAddProduct, handleEditProduct, handleDeleteProduct } from '../Untils/handleTable';

const { Title } = Typography;

const ProductPage = () => {
    const [products, setProducts] = useState(menuSeafood);
    console.log("Dữ liệu món ăn hiện tại:", products);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

        //Tìm kiếm món ăn
        const [searchText, setSearchText] = useState('');

        // chỉ định theo loại
        const [selectedCategory, setSelectedCategory] = useState('Tất cả');
        const categories = ['Tất cả', 'Tôm', 'Cua', 'Mực', 'Ốc', 'Lẩu', 'Nước uống'];

    // Mở Modal để Thêm hoặc Sửa
    const showModal = (product = null) => {
        setEditingProduct(product);
        if (product) {
            form.setFieldsValue(product); // Đổ dữ liệu cũ vào form nếu là Sửa
        } else {
            form.resetFields(); // Xóa trắng form nếu là Thêm mới
        }
        setIsModalOpen(true);
    };

    // Lưu dữ liệu
    const handleSave = (values) => {
        if (editingProduct) {
            setProducts(handleEditProduct(products, { ...editingProduct, ...values }));
            message.success("Đã cập nhật món ăn");
        } else {
            setProducts(handleAddProduct(products, values));
            message.success(" đã thêm món mới thành công");
        }
        setIsModalOpen(false);
    };

    const columns = [
        { title: 'Tên món', dataIndex: 'name', key: 'name' },
        { title: 'Loại', dataIndex: 'category', key: 'category', render: (cat) => <Tag color="blue">{cat}</Tag> },
        { title: 'Giá (VNĐ)', dataIndex: 'price', key: 'price', render: (price) => price.toLocaleString() },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                    <Popconfirm title="Xóa món này?" onConfirm={() => setProducts(handleDeleteProduct(products, record.id))}>
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
            <div style={{ padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Title level={2}>📋 QUẢN LÝ THỰC ĐƠN</Title>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showModal()}>
                        Thêm món mới
                    </Button>
                </div>

                <Row gutter={24}>
                    {/* CỘT BÊN TRÁI: DANH MỤC LOẠI MÓN */}
                    <Col span={5}>
                        <Card title="Danh mục" size="small" bodyStyle={{ padding: 0 }}>
                            <Menu
                                mode="inline"
                                selectedKeys={[selectedCategory]}
                                onClick={(e) => setSelectedCategory(e.key)}
                                items={categories.map(cat => ({ key: cat, label: cat }))}
                            />
                        </Card>
                    </Col>

                    {/* CỘT BÊN PHẢI: TÌM KIẾM VÀ BẢNG DỮ LIỆU */}
                    <Col span={19}>
                        <div style={{ marginBottom: 20 }}>
                            <Input.Search
                                placeholder={`Tìm kiếm trong loại ${selectedCategory}...`}
                                size="large"
                                enterButton
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)} // Cập nhật từ khóa khi gõ
                                onSearch={(value) => setSearchText(value)} // Cập nhật khi bấm nút kính lúp
                            />
                        </div>

                        <Table 
                            dataSource={products.filter(food => {
                                // selectedCategory === 'Tất cả' || p.category === selectedCategory
                                const matchCategory = selectedCategory === 'Tất cả' || food.category === selectedCategory;
                                
                                // 2. Lọc theo Tên món (Search Text) - Chuyển cả hai về chữ thường để so sánh chính xác
                                const matchSearch = food.name.toLowerCase().includes(searchText.toLowerCase());
                                
                                return matchCategory && matchSearch;
                            })} 
                            columns={columns} 
                            rowKey="id" 
                            bordered
                            pagination={{ pageSize: 8 }}
                        />
                    </Col>
                </Row>

                {/* Modal Thêm/Sửa giữ nguyên như cũ của bạn */}
                <Modal>
                    <Form.Item name="category" label="Loại món" rules={[{ required: true, message: 'Hãy chọn loại món!' }]}>
                        <Select placeholder="Chọn loại món">
                            {categories.filter(c => c !== 'Tất cả').map(cat => (
                                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Modal>
            </div>
        );
};

export default ProductPage;