const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, default: '' }, // will store URL or relative path like /uploads/xxx.jpg
    timestamp: { type: Date, default: Date.now }
});

RequestSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
RequestSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Request', RequestSchema);
