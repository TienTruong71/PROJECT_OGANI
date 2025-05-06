const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, 
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String }, 
    total: { type: Number } 
});

const ShippingSchema = new mongoose.Schema({
    address: { type: String, required: true },
    receiverName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    shippingMethod: { type: String, default: 'Standard' },
    shippingFee: { type: Number, default: 0 }
});

const PromotionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    percentDiscount: { type: Number },
    code: { type: String }
});

const orderSchema = new mongoose.Schema(
    {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    items: [OrderItemSchema], 
    shipping: ShippingSchema,
    vat: { type: Number, default: 0 }, 
    promotions: [PromotionSchema],
    note: { type: String },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Shipping', 'Completed','RequestCancelled','Cancelled'],
        default: 'Pending'
    },
    subtotal: { type: Number, required: true }, 
    discount: { type: Number, default: 0 }, 
    totalAmount: { type: Number, required: true }, 
    paymentMethod: { type: String, enum: ['COD', 'Banking', 'Momo', 'ZaloPay'], default: 'COD' },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
    orderDate: { type: Date, default: Date.now }
}, { timestamps: true }); 

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;