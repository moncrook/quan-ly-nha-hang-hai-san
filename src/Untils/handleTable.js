// Dữ liệu thực đơn mẫu
export const menuSeafood = [
    { id: 101, name: 'Tôm Hùm Bỏ Lò', price: 750000, category: 'Tôm', image: '/assets/tôm hùm bỏ lò.jpg' },
    { id: 102, name: 'Cua Hoàng Đế Hấp', price: 900000, category: 'Cua', image: '/assets/cua hoàng đế.jpg' },
    { id: 103, name: 'Mực Nhảy Nướng', price: 180000, category: 'Mực', image: '/assets/mực nhảy nướng.jpg' },
    { id: 104, name: 'Lẩu Hải Sản', price: 550000, category: 'Lẩu', image: '/assets/lẩu hải sản.jpg' },
    { id: 105, name: 'Ốc Hương Quế', price: 120000, category: 'Ốc', image: '/assets/ốc hương quế.jpg' },
    { id: 106, name: 'bia huda', price: 15000, category: 'Nước uống', image: '/assets/bia huda.jpg' },
    { id: 107, name: 'coca', price: 13000, category: 'Nước uống', image: '/assets/cocacola.jpg' },
];

// Hàm xử lý thêm món vào giỏ
export const addToCartLogic = (prevCart, food) => {
    const isExist = prevCart.find(item => item.id === food.id);
    if (isExist) {
        return prevCart.map(item =>
            item.id === food.id ? { ...item, qty: item.qty + 1 } : item
        );
    }
    return [...prevCart, { ...food, qty: 1 }];
};
// hàm xử lý xóa món khỏi giỏ
export const updateQuantityLogic = (prevCart, foodId, delta) => {
    return prevCart.map(item => {
        if (item.id === foodId) {
            const newQty = item.qty + delta;
            // Nếu số lượng mới > 0 thì cập nhật, nếu không thì giữ nguyên (hoặc xử lý xóa ở giao diện)
            return { ...item, qty: newQty > 0 ? newQty : 1 };
        }
        return item;
    });
};

// Hàm tính tổng tiền
export const calculateTotal = (cart) => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
};

// Thêm logic xử lý danh sách món ăn
export const handleAddProduct = (products, newProduct) => {
    const productWithImage = {
        ...newProduct,
        id: Date.now(),
        // Nếu newProduct.image không có giá trị, dùng ảnh placeholder
        image: newProduct.image || 'https://via.placeholder.com/150?text=No+Image'
    };
    return [...products, productWithImage];
};

//sửa món ăn
export const handleEditProduct = (products, updatedProduct) => {
    return products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
};

//sửa bàn ăn
export const handleEditTable = (tables, updatedTablle) => {
    return tables.map(p => p.id === updatedTablle.id ? updatedTablle : p);
};

// Thêm logic xử lý danh sách bàn ăn
export const handleAddTable = (tables, newTable) => {
    return [...tables, { ...newTable, id: Date.now(), status: 'available' }]; // Tạo ID tạm bằng thời gian
};

export const handleDeleteProduct = (products, productId) => {
    return products.filter(p => p.id !== productId);
};

// Hàm lấy danh sách các bàn đang trống
export const getBooker = (allTables) => {
    return allTables.filter(t => t.status === 'reserved');
};

// Hàm xử lý đặt bàn (Chuyển từ Trống sang Đã đặt/Có khách)
export const handleBookingLogic = (allTables, tableId) => {
    return allTables.map(t => 
        t.id === tableId ? { ...t, status: 'booker' } : t
    );
};

// Hàm xử lý hủy đặt bàn 
export const HuyDatBanLogic = (allTables, tableId) => {
    return allTables.map(t => 
        t.id === tableId ? { ...t, status: 'available' } : t
    );
};