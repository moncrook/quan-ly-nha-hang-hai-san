export const loginLogic = (username, password) => {
    // Tạm thời gài cứng tài khoản admin
    if (username === 'admin' && password === '123456') {
        return { success: true, message: 'Đăng nhập thành công!' };
    }
    return { success: false, message: 'Sai tài khoản hoặc mật khẩu!' };
};