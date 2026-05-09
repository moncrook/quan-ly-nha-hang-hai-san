// Truyền employees và setEmployees từ App xuống trang này

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Layout, Table, Modal, Select, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const EmployeePage = ({ employees, setEmployees }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingEmployee, setEditingEmployee] = useState(null);

    // XỬ LÝ LƯU (DÙNG CHUNG CHO CẢ THÊM MỚI VÀ SỬA)
    const handleSaveEmployee = (values) => {
        if (editingEmployee) {
            // NẾU LÀ SỬA: Tìm đúng ID của nhân viên đang sửa và cập nhật data mới
            const updatedEmployees = employees.map(emp => 
                emp.id === editingEmployee.id ? { ...emp, ...values } : emp
            );
            setEmployees(updatedEmployees);
            message.success("Cập nhật thông tin nhân viên thành công!");
        } else {
            // NẾU LÀ THÊM MỚI: Tạo ID mới và nối vào mảng
            const newEmployee = {
                id: Date.now(),
                ...values
            };
            setEmployees([...employees, newEmployee]);
            message.success("Cấp tài khoản nhân viên thành công!");
        }
        setIsModalOpen(false);
        setEditingEmployee(null); // Reset lại trạng thái
    };

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
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <Typography.Title level={2}>👥 QUẢN LÝ NHÂN VIÊN</Typography.Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} size="large">
                    Thêm nhân viên
                </Button>
            </div>
            
            <Table 
                dataSource={employees} 
                rowKey="id" // Bắt buộc phải có rowKey để Antd không báo lỗi warning
                columns={[
                    { title: 'CCCD', dataIndex: 'cccd', key: 'cccd' },
                    { title: 'Họ tên', dataIndex: 'name', key: 'name', render: (text) => <b>{text}</b> },
                    { title: 'Giới tính', dataIndex: 'sex', key: 'sex' },
                    { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username' },
                    { 
                        title: 'Quyền hạn', 
                        dataIndex: 'role', 
                        key: 'role',
                        render: (role) => (
                            <Typography.Text strong color={role === 'ADMIN' ? 'red' : role === 'CASHIER' ? 'green' : 'blue'}>
                                {role === 'ADMIN' ? 'Quản lý' : role === 'CASHIER' ? 'Thu ngân' : 'Phục vụ'}
                            </Typography.Text>
                        )
                    },
                    { 
                        title: 'Thao tác', 
                        key: 'action',
                        render: (_, record) =>(
                            <Space>
                                <Button icon={<EditOutlined />} onClick={() => showModal(record)}>Sửa</Button>
                                <Popconfirm
                                    title="Xác nhận xóa nhân viên"
                                    description={`Bạn có chắc chắn muốn xóa nhân viên ${record.name} không?`}
                                    onConfirm={() => {
                                        setEmployees(employees.filter(e => e.id !== record.id));
                                        message.success("Đã xóa nhân viên thành công!");
                                    }}
                                    okText="Xóa ngay"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }} // Làm nút Xác nhận có màu đỏ
                                >
                                    <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                                </Popconfirm>
                            </Space>
                        )
                    }
                ]} 
            />

            {/* Modal chứa Form: Thêm/Sửa */}
            <Modal
                title={editingEmployee ? "CHỈNH SỬA THÔNG TIN NHÂN VIÊN" : "CẤP TÀI KHOẢN MỚI"}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingEmployee(null);
                }}
                okText={editingEmployee ? "Cập nhật" : "Tạo tài khoản"}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleSaveEmployee}>
                    {/* Đổi name="ID" thành "cccd" để không bị trùng với "id" hệ thống sinh ra */}
                    <Form.Item name="cccd" label="Căn Cước Công Dân" rules={[{ required: true, message: 'Vui lòng nhập CCCD' }]}>
                        <Input placeholder="046xxxxxx" />
                    </Form.Item>
                    
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    
                    {/* ĐÃ SỬA LẠI VALUE CỦA GIỚI TÍNH */}
                    <Form.Item name="sex" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
                        <Select placeholder="Chọn giới tính">
                            <Select.Option value="Nam">Nam</Select.Option>
                            <Select.Option value="Nữ">Nữ</Select.Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
                        <Input placeholder="username123" /> 
                        {/* disabled={!!editingEmployee}: Nếu là Sửa thì khóa không cho đổi tên đăng nhập */}
                    </Form.Item>
                    
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                        <Input.Password placeholder="Nhập mật khẩu..." />
                    </Form.Item>
                    
                    <Form.Item name="address" label="Địa chỉ">
                        <Input placeholder="Phú Xuân, Thành phố Huế" />
                    </Form.Item>
                    
                    <Form.Item name="role" label="Quyền hạn" rules={[{ required: true, message: 'Vui lòng chọn quyền hạn' }]}>
                        <Select placeholder="Chọn chức vụ">
                            <Select.Option value="STAFF">Phục vụ (STAFF)</Select.Option>
                            <Select.Option value="ADMIN">Quản lý (ADMIN)</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeePage;