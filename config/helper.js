// Hàm tính tổng tiền từ object order
const calculateTotalAmount = (order) => {
    // Kiểm tra nếu order hoặc order.items không tồn tại
    if (!order || !order.items) {
      console.error('Order hoặc order.items không tồn tại:', order);
      return 0; // Trả về 0 để tránh lỗi
    }

    const totalProductAmount = order.items.reduce((sum, item) => 
      sum + item.price * item.quantity, 0
    );
  
    const totalDiscount = (order.promotions || []).reduce((sum, promo) => 
      sum + ((promo.percentDiscount || 0) / 100) * totalProductAmount, 0
    );
  
    // Sử dụng giá trị VAT từ đơn hàng hoặc mặc định là 10%
    const vatRate = typeof order.vat === 'number' ? order.vat : 10;
    const totalWithVAT = totalProductAmount + vatRate * totalProductAmount / 100;
  
    const totalAmount = totalWithVAT - totalDiscount + (order.shipping?.shippingFee || 0);
  
    return totalAmount;
  };
  
  // Hàm format order
const formatOrder = (order) => {
  try {
    // Nếu đơn hàng đã có totalAmount, sử dụng giá trị đó
    const totalAmount = order.totalAmount || calculateTotalAmount(order);

    return {
      ...order,
      formattedOrderDate: new Date(order.orderDate || order.createdAt || Date.now()).toLocaleString("vi-VN", {
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh"
      }),
      totalAmount: totalAmount
    };
  } catch (error) {
    console.error('Lỗi khi format đơn hàng:', error);
    // Trả về đơn hàng gốc để tránh lỗi
    return {
      ...order,
      formattedOrderDate: new Date().toLocaleString("vi-VN", {
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh"
      })
    };
  }
};
  
  // Hàm tính toán tổng tiền cho đơn hàng - chuyển từ model sang helper theo mô hình MVC
const calculateTotals = (order) => {
  // Tính tổng tiền của các sản phẩm
  order.subtotal = order.items.reduce((total, item) => {
    item.total = item.price * item.quantity;
    return total + item.total;
  }, 0);

  // Tính tổng giảm giá từ các khuyến mãi
  order.discount = (order.promotions || []).reduce((total, promo) => {
    return total + (order.subtotal * (promo.percentDiscount || 0) / 100);
  }, 0);

  // Tính tổng tiền cuối cùng
  order.totalAmount = order.subtotal + (order.vat || 0) + (order.shipping?.shippingFee || 0) - order.discount;

  return order.totalAmount;
};

module.exports = {
  calculateTotalAmount,
  formatOrder,
  calculateTotals
};