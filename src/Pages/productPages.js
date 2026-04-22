import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Tag, Menu, Typography,
        Row, Col, Card, Select, Avatar, Upload
 } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
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

        const [imageUrl, setImageUrl] = useState(''); // State lưu ảnh tạm thời khi đang chọn

        const handleChangeImage = (info) => {
            // Ant Design bọc file trong originFileObj
            const file = info.file.originFileObj; 
            
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target.result;
                    setImageUrl(result); // Cập nhật để hiển thị ảnh preview
                    form.setFieldsValue({ image: result }); // Lưu chuỗi ảnh vào Form để khi bấm Save nó có dữ liệu
                };
                reader.readAsDataURL(file); // Bắt đầu đọc file
            }
        };

    // Mở Modal để Thêm hoặc Sửa
    const showModal = (product = null) => {
        setEditingProduct(product);
        if (product) {
            form.setFieldsValue(product); // Đổ dữ liệu cũ vào form nếu là Sửa
            setImageUrl(product.image || '');// Nạp ảnh cũ vào để hiện lên khung
        } else {
            form.resetFields(); // Xóa trắng form nếu là Thêm mới
            setImageUrl(''); // Thêm mới thì để trống khung ảnh
        }
        setIsModalOpen(true);
    };

    // Lưu dữ liệu
    const handleSave = (values) => {

        // Đảm bảo nếu không nhập ảnh, sẽ dùng ảnh mặc định
        const productData = {
            ...values,
            image: values.image || 'https://via.placeholder.com/150?text=HaiSan'
        };

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
        // Cột 1: Thêm cột Hình ảnh
        { 
            title: 'Hình ảnh', 
            dataIndex: 'image', 
            key: 'image', 
            width: 100,
            render: (imageUrl) => (
                <Avatar 
                    src={imageUrl} 
                    shape="square" 
                    size={64} 
                    icon={<PictureOutlined />} // Hiện icon nếu ảnh lỗi
                    style={{ border: '1px solid #d9d9d9' }}
                />
            ) 
        },
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
                <Modal 
                    // open={isModalOpen}
                    // onOk={() => form.submit()}
                    // onCancel={() => setIsModalOpen(false)}
                    // okText="Lưu lại"
                    // cancelText="Hủy bỏ"
                    // centered
                >
                    <Form.Item name="category" label="Loại món" rules={[{ required: true, message: 'Hãy chọn loại món!' }]}>
                        <Select placeholder="Chọn loại món">
                            {categories.filter(c => c !== 'Tất cả').map(cat => (
                                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Modal>
                <Modal
                    title={editingProduct ? "📝 CHỈNH SỬA MÓN ĂN" : "✨ THÊM MÓN MỚI"}
                    open={isModalOpen}
                    onOk={() => form.submit()} // Kích hoạt handleSave
                    onCancel={() => setIsModalOpen(false)}
                    okText={editingProduct ? "Cập nhật" : "Thêm ngay"}
                    cancelText="Đóng"
                    centered
                >
                    <Form form={form} layout="vertical" onFinish={handleSave}>
                        <Form.Item 
                            name="name" 
                            label="Tên món ăn" 
                            rules={[{ required: true, message: 'Không được để trống tên món!' }]}
                        >
                            <Input placeholder="Ví dụ: Cua Tuyết sốt Cajun" />
                        </Form.Item>

                        <Form.Item 
                            name="category" 
                            label="Loại hải sản" 
                            rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
                        >
                            <Select placeholder="Chọn một loại">
                                {categories.filter(c => c !== 'Tất cả').map(cat => (
                                    <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item 
                            name="price" 
                            label="Giá bán (VNĐ)" 
                            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                min={0}
                                formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={val => val.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item 
                            name="image" 
                            label="Hình ảnh món ăn"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Upload
                                    name="avatar"
                                    listType="picture-card"
                                    showUploadList={false}
                                    beforeUpload={() => false} // Chặn không cho upload lên server thật
                                    onChange={handleChangeImage}
                                >
                                    {imageUrl || form.getFieldValue('image') ? (
                                        <img 
                                            src={imageUrl || form.getFieldValue('image')} 
                                            alt="avatar" 
                                            style={{ width: '100%', borderRadius: '8px' }} 
                                        />
                                    ) : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                        </div>
                                    )}
                                </Upload>
                                
                                {/* Nút để xóa ảnh hiện tại nếu chọn nhầm */}
                                {(imageUrl || form.getFieldValue('image')) && (
                                    <Button size="small" danger onClick={() => {
                                        setImageUrl('');
                                        form.setFieldsValue({ image: '' });
                                    }}>
                                        Xóa ảnh
                                    </Button>
                                )}
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
};

export default ProductPage;