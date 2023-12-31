const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");
const bcrypt = require("bcryptjs"); // Thêm thư viện hỗ trợ mã hóa password

// Xác định bảng khách hàng với các trường khác nhau và quy tắc xác thực của chúng.
const customerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name: cannot be blank"],
      maxLength: [50, "First name: cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name: cannot be blank"],
      maxLength: [50, "Last name: cannot exceed 50 characters"],
    },
    email: {
      type: String,
      validate: {
        validator: function (value) {
          // xác thực địa chỉ email.
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        },
        message: "Email: is not a valid email!",
      },
      required: [true, "Email: cannot be blank"],
      maxLength: [50, "Email: cannot exceed 50 characters"],
      unique: [true, "Email: must be unique"],
    },
    password: {
      type: String,
      validate: {
        validator: function (value) {
          // xác thực địa chỉ email.
          const passwordRegex =
            /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
          return passwordRegex.test(value);
        },
        message: "Password: is not a valid password!",
      },
      required: true,
      minLength: [8, "Password: must be at least 8 characters"],
      maxLength: [20, "Password: cannot exceed 20 characters"],
    },
    birthday: {
      type: Date,
      default: null,
    },
    
    phoneNumber: {
      type: String,
      maxLength: [20, "Phone number: cannot exceed 20 characters"],
      validate: {
        // Xác thực số điện thoại
        validator: function (value) {
          const phoneRegex =
            /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
          return phoneRegex.test(value);
        },
        message: "Phone number: is not a valid phone number!",
      },
      unique: [true, "Email: must be unique"],
    },
    address: {
      type: String,
      // required: [true, "Address: cannot be blank"],
      maxLength: [500, "Address: cannot exceed 500 characters"],
      // unique: [true, "Address: must be unique"],
      default: null,
    },
    countCancellations: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    versionKey: false, // Tắt trường "__v" dùng để theo dõi phiên bản
    timestamps: true, // Tự động thêm trường createdAt và updatedAt
  }
);

// Tạo trường ảo fullName
customerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// hash mật khẩu trước khi lưu vào cơ sở dữ liệu.
customerSchema.pre("save", async function (next) {
  try {
    // Tạo salt
    const salt = await bcrypt.genSalt(10); // 10 kí tự: ABCDEFGHIK + 123456
    // Tạo password = salt key + hash key
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // Lưu hashPass thay cho việc lưu password
    this.password = hashedPassword;

    next();
  } catch (err) {
    next(err);
  }
});

// Kiểm tra mật khẩu có hợp lệ hay không
customerSchema.methods.isValidPass = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

// Virtual with Populate
customerSchema.virtual("cart", {
  ref: "carts",
  localField: "_id",
  foreignField: "customerId",
  justOne: true,
});

// Cấu hình để đảm bảo trường ảo được bao gồm trong kết quả JSON và đối tượng JavaScript thông thường
customerSchema.set("toJSON", { virtuals: true });
customerSchema.set("toObject", { virtuals: true });

// Sử dụng plugin "mongoose-lean-virtuals" để hỗ trợ trường ảo trong truy vấn .lean() và hỗ trợ cho việc định nghĩa field sử dụng method liền.
customerSchema.plugin(mongooseLeanVirtuals);

// Tạo bảng khách hàng dựa trên lược đồ đã khai báo
const Customer = model("customers", customerSchema);
module.exports = Customer;
