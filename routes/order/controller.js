// const { array } = require("yup");
const { Order, Customer, Employee, Product } = require("../../models");
const { asyncForEach } = require("../../utils");

module.exports = {
  createOrder: async function (req, res, next) {
    try {
      const data = req.body;
      const {
        customerId,
        employeeId,
        productList,
      } = req.body;

      const errors = [];

      // Mặc định isOnline là false
      data.isOnline = false;

      //Kiểm tra sự tồn tại của khách hàng nếu customerId được cung cấp
      const getCustomer = customerId
        ? Customer.find({ _id: customerId, isDeleted: false })
        : "Direct customers";

      const getEmployee = Employee.find({ _id: employeeId, isDeleted: false });

      //Truy xuất thông tin khách hàng và nhân viên bằng Promise.all
      const [customer, employee] = await Promise.all([
        getCustomer,
        getEmployee,
      ]);

      //Kiểm tra sự tồn tại của khách hàng và nhân viên, nếu không tồn tại thì thêm lỗi tương ứng
      if (customerId) {
        if (!customer) errors.push("No customer found in data");
      }
      if (!employee) errors.push("No employee found in data");

      let finalProductList = [];

      await asyncForEach(productList, async (item) => {
        const product = await Product.findOne({
          _id: item.productId,
          isDeleted: false,
        });

        if (!product) {
          errors.push(
            `No product ${item.productId} - ${product.name} found in data`
          );
        } else {
          if (product.stock < item.quantity)
            errors.push(`Product ${item.productId} - ${product.name} quantity not available`);
        }

        finalProductList.push({
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          price: product.price,
          discount: product.discount,
        });
      });

      if (errors.length > 0) {
        res.status(400).json({ message: "Failed", errors });
      }
      const newItem = new Order({
        ...data,
        productList: finalProductList,
      });

      let payload = await newItem.save();

      //Duyệt qua danh sách sản phẩm để cập nhật tồn kho
      await asyncForEach(payload.productList, async (item) => {
        await Product.findOneAndUpdate(
          { _id: item.productId },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      });
      res.status(200).json({ message: "Add order successfully", payload });
    } catch (err) {
      console.log("««««« err »»»»»", err);
      res.status(400).json({ message: "Adding order failed", err });
    }
  },

  getAllOrder: async (req, res, next) => {
    try {
      let payload = await Order.find();
      res.status(200).json({ message: "Retrieve orders data successfully", payload, });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Retrieving orders data failed", error, });
    }
  },

  getDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      let payload = await Order.findById(id);

      if (!payload) {
        res.status(400).json({ message: "No order found in data", });
      }
      res.status(200).json({ message: "Retrieve detailed order data successfully", payload, });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Retrieving detailed order data failed", error, });

    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;

      let found = await Order.findOne({
        _id: id,
        isOnline: true,
      });
      if (!found) {
        res.status(400).json({ message: "No online order found in data", });
      }
      if (found) {
        if (found.status === "CANCELED" || found.status === "COMPLETED" || found.status === "REJECTED") {
          res.status(400).json({ message: "Online order status is not updated", });
        }
        const payload = await Order.findByIdAndUpdate(
          found._id,
          { status: "CANCELED" },
          { new: true }
        );
        res.status(200).json({ message: "Update online order status data successfully", payload, });
      }
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Update online order status data failed", error, });
    }
  },

  // updateShippingDate: async function (req, res, next) {
  //   try {
  //     const { id } = req.params;
  //     const { shippedDate } = req.body;

  //     const updateOrder = await Order.findByIdAndUpdate(
  //       id,
  //       { shippedDate },
  //       { new: true }
  //     );

  //     if (!updateOrder) {
  //       return res.status(404).send({ code: 404, message: "Không tìm thấy" });
  //     }

  //     return res.send({
  //       code: 200,
  //       message: "Cập nhật thành công",
  //       payload: updateOrder,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({ code: 500, error });
  //   }
  // },
};
