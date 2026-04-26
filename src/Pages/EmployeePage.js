// Truyền employees và setEmployees từ App xuống trang này

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Layout, Table
    ,Modal, Select,
    Space
 } from 'antd';

 
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';

import { Link, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const EmployeePage = ({ employees, setEmployees }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleAddEmployee = (values) => {
        const newEmployee = {
            id: Date.now(),
            ...values
        };
        setEmployees([...employees, newEmployee]);
        setIsModalOpen(false);
        message.success("Cấp tài khoản nhân viên thành công!");
    };

    const [editingEmployee, setEditingEmployee] = useState(null);

    const showModal = (valua = null) => {
        setEditingEmployee(valua);
        if (valua) {
            form.setFieldsValue(valua); // Đổ dữ liệu cũ vào form nếu là Sửa
        } else {
            form.resetFields(); // Xóa trắng form nếu là Thêm mới
        }
        setIsModalOpen(true);
    };

    return (
        <div>
            <Button type="primary" onClick={() => showModal()}>Thêm nhân viên</Button>
            <Table 
                dataSource={employees} 
                columns={[
                    { title: 'Họ tên', dataIndex: 'name' },
                    { title: 'Tên đăng nhập', dataIndex: 'username' },
                    { title: 'Quyền hạn', dataIndex: 'role' },
                    { 
                        title: 'Thao tác', 
                        render: (_, record) =>(
                            <Space>
                                <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                                <Button danger icon={<DeleteOutlined />} onClick={() => setEmployees(employees.filter(e => e.id !== record.id))}>Xóa</Button>
                            </Space>
                        )
                    }
                ]} 
            />
            {/* Modal chứa Form: Username, Password, Name, Role (Select) */}
            {/*  EmployeePage bổ sung phần Modal */}
            <Modal
                title="CẤP TÀI KHOẢN MỚI"
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical" onFinish={handleAddEmployee}>
                    <Form.Item name="ID" label="Căn Cước Công Dân" rules={[{ required: true }]}>
                        <Input placeholder="046xxxxxx" />
                    </Form.Item>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true }]}>
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item name="sex" label="Giới tính" rules={[{ required: true }]}>
                        <Select placeholder="Chọn chức vụ">
                            <Select.Option value="STAFF">Nam</Select.Option>
                            <Select.Option value="CASHIER">Nữ</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
                        <Input placeholder="username123" />
                    </Form.Item>
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="address" label="địa chỉ" >
                        <Input placeholder="phú xuân, thành phố Huế" />
                    </Form.Item>
                    <Form.Item name="role" label="Quyền hạn" rules={[{ required: true }]}>
                        <Select placeholder="Chọn chức vụ">
                            <Select.Option value="STAFF">Phục vụ (STAFF)</Select.Option>
                            <Select.Option value="CASHIER">Thu ngân (CASHIER)</Select.Option>
                            <Select.Option value="ADMIN">Quản lý (ADMIN)</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeePage