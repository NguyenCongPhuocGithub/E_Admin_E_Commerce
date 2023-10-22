const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

const mediaSchema = new Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, require: true },
    location: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "categories", //tham chiếu đến bảng "categories"
      required: [true, "Product categories: cannot be empty"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

mediaSchema.virtual('category', {
  ref: 'categories',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});


// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
mediaSchema.set("toJSON", { virtuals: true });
mediaSchema.set("toObject", { virtuals: true });

// Sử dụng plugin "mongoose-lean-virtuals" để hỗ trợ trường ảo trong truy vấn .lean()
mediaSchema.plugin(mongooseLeanVirtuals);

// Tạo bảng sản phẩm dựa trên lược đồ đã khai báo

const Media = model('medias', mediaSchema);

module.exports = Media;
