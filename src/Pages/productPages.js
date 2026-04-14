import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { menuSeafood, handleAddProduct, handleEditProduct, handleDeleteProduct } from '../Untils/handleTable';

const ProductPage = () => {
    const [products, setProducts] = useState(menuSeafood);
    console.log("Dữ liệu món ăn hiện tại:", products);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>📋 QUẢN LÝ THỰC ĐƠN</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm món mới</Button>
            </div>

            <div>
                <Input.Search
                    placeholder='hãy nhập món bạn muốn tìm vào đây'
                    size='Large'
                    enterButton
                />
            </div>

            <Table dataSource={products} columns={columns} rowKey="id" />

            <Modal 
                title={editingProduct ? "Sửa món ăn" : "Thêm món mới"} 
                open={isModalOpen} 
                onOk={() => form.submit()} 
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="name" label="Tên món ăn" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Tôm hùm sốt bơ" />
                    </Form.Item>
                    <Form.Item name="category" label="Loại" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: Tôm, Cua, Cá..." />
                    </Form.Item>
                    <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductPage;