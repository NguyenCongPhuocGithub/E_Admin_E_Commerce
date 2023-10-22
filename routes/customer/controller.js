const { fuzzySearch } = require("../../utils");
const { Customer } = require("../../models");

module.exports = {

  getAllCustomer: async (req, res, next) => {
    try {
      const payload = await Customer.find({ isDeleted: false }).select(
        "-password"
      );
      res
        .status(200)
        .json({ message: "Retrieve customers data successfully", payload });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res
        .status(400)
        .json({ message: "Retrieving customers data failed", error });
    }
  },

  getDetailCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = await Customer.findOne({
        _id: id,
        isDeleted: false,
      })
      .select("-password")
      .populate('cart');
      if (!payload) {
        res.status(400).json({ message: "No customer found in data" });
      }
      res
        .status(200)
        .json({
          message: "Retrieve detailed customer data successfully",
          payload,
        });
    } catch (error) {
      console.log("««««« error »»»»»", error);
      res
        .status(400)
        .json({ message: "Retrieving detailed customer data failed", error });
    }
  },

  searchCustomer: async (req, res, next) => {
    try {
      const { keyword } = req.query;

      const conditionFind = { isDeleted: false };

      const payload = await Customer.find({
        ...conditionFind,
        $or: [
          // { lastName: { $regex: fuzzySearch(keyword) } },
          { email: { $regex: fuzzySearch(keyword) } },
          { phoneNumber: { $regex: fuzzySearch(keyword) } },
        ],
      }).select("-password").sort({ lastName: 1 });

      const totalCustomer = await Customer.countDocuments(conditionFind);
      if (payload) {
        return res.status(200).json({
          message: "Search information of customers successfully",
          totalCustomer,
          count: payload.length,
          payload,
        });
      }

      return res.status(410).json({
        message: "Search information of customers not found",
      });
    } catch (err) {
      return res.status(404).json({
        message: "Search information of customers failed",
        error: err,
      });
    }
  },
};

