const { Product } = require("../../models");
const { fuzzySearch } = require("../../utils");

module.exports = {
  createProduct: async (req, res, next) => {
    try {
      const {
        name,
        price,
        discount,
        stock,
        categoryId,
        supplierId,
        description,
        image,
        coverImageUrl
      } = req.body;

      const newProduct = new Product({
        name,
        price,
        discount,
        stock,
        supplierId,
        categoryId,
        description,
        image: image ? image : null,
        coverImageUrl: coverImageUrl ? coverImageUrl : null
      });

      const payload = await newProduct.save();
      res.status(200).json({ message: "Add product successfully", payload, });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Adding product failed", error, });
    }
  },

  getAllProduct: async (req, res, next) => {
    try {
      let payload = await Product.find({
        isDeleted: false,
      })
        //Hiển thị thêm chi tiết về category, supplier trong data
        .populate("category")
        .populate("supplier")
        .lean();
      const totalProduct = await Product.countDocuments(payload);
      res.status(200).json({ message: "Retrieve products data successfully", totalProduct, payload, });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Retrieving products data failed", error, });
    }
  },

  getListProduct: async (req, res, next) => {
    try {
      const { page, pageSize } = req.query; // 10 - 1
      const limit = pageSize || 10; // 10
      const skip = limit * (page - 1) || 0;
      let payload = await Product.find({ isDeleted: false })

        //Hiển thị thêm chi tiết về category, supplier trong data
        .populate("category")
        .populate("supplier")

        .skip(skip)
        .limit(limit)
        .sort({ name: 1, price: 1, discount: -1 })
        .lean();

      const totalProduct = await Product.countDocuments(payload);
      res.status(200).json({
        message: "Retrieve products data successfully",
        totalProduct,
        count: payload.length,
        payload,
      });
    } catch (error) {
      res.status(400).json({ message: "Retrieving employees data failed", error, });
    }
  },

  getDetailProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = await Product.findOne({
        _id: id,
        isDeleted: false,
      })
        //Hiển thị thêm chi tiết về category, supplier trong data
        .populate("category")
        .populate("supplier")
        .lean();
      if (!payload) {
        res.status(400).json({ message: "No product found in data", });
      }
      res.status(200).json({ message: "Retrieve detailed product data successfully", payload, });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Retrieving detailed product data failed", error, });
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { ...req.body },
        { new: true }
      );
      if (!payload) {
        res.status(400).json({ message: "No product found in data", });
      }
      res.status(200).json({ message: "Updated product data successfully", payload, });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Updating employee data failed", error, });
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = await Product.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true },
        { new: true }
      );
      if (!payload) {
        res.status(400).json({ message: "No product found in data", });
      }
      res.status(200).json({ message: "Delete product data successfully", });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res.status(400).json({ message: "Delete product data failed", error, });
    }
  },

  searchProduct: async (req, res, next) => {
    try {
      const { keyword, page, pageSize } = req.query;

      const limit = pageSize || 10;
      const skip = (page - 1) * limit || 0;

      const conditionFind = { isDeleted: false };

      const payload = await Product.find({
        ...conditionFind,
        name: { $regex: fuzzySearch(keyword) }
      })
        .populate("category")
        .populate("supplier")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);

      // Tính tổng số sản phẩm thỏa mãn điều kiện
      const totalProduct = await Product.countDocuments(conditionFind);

      if (payload) {
        return res.status(200).json({
          message: "Search information of product successfully",
          totalProduct,
          count: payload.length,
          payload,
        });
      }

      return res.status(410).json({
        message: "Search information of product not found",
      });
    } catch (err) {
      return res.status(404).json({
        message: "Search information of product failed",
        error: err,
      });
    }
  },
};
