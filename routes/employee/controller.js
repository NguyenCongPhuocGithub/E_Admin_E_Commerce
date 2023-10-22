const { Employee } = require("../../models")
const { fuzzySearch } = require("../../utils");


module.exports = {
    createEmployee: async (req, res, next) => {
        try {
            const {
                firstName,
                lastName,
                email,
                password,
                birthday,
                phoneNumber,
                address,
            } = req.body;

            const newEmployee = new Employee({
                firstName,
                lastName,
                email,
                password,
                birthday,
                phoneNumber,
                address,
            });

            const payload = await newEmployee.save();
            res.status(200).json({ message: "Add employee successfully", payload, });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Adding employee failed", error, });
        }
    },

    getAllEmployee: async (req, res, next) => {
        try {
            const payload = await Employee.find({ isDeleted: false }).select("-password");
            res.status(200).json({ message: "Retrieve employees data successfully", payload, });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Retrieving employees data failed", error, });
        }
    },

    getDetailEmployee: async (req, res, next) => {
        try {
            // const { id } = req.params;
            const id = req.user._id
            const payload = await Employee.findOne({
                _id: id,
                isDeleted: false,
            });
            if (!payload) {
                res.status(400).json({ message: "No employee found in data", });
            }
            res.status(200).json({ message: "Retrieve detailed employee data successfully", payload, });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Retrieving detailed employee data failed", error, });
        }
    },

    updateEmployee: async (req, res, next) => {
        try {
            // const { id } = req.params;
            const id = req.user._id
            const payload = await Employee.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { ...req.body },
                { new: true }
            );
            if (!payload) {
                res.status(400).json({ message: "No employee found in data", });
            }
            res.status(200).json({ message: "Updated employee data successfully", payload, });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Updating employee data failed", error, });
        }
    },

    deleteEmployee: async (req, res, next) => {
        try {
            // const { id } = req.params;
            const id = req.user._id
            const payload = await Employee.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            );
            if (!payload) {
                res.status(400).json({ message: "No employee found in data", });
            }
            res.status(200).json({ message: "Delete employee data successfully", });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Delete employee data failed", error, });
        }
    },

    searchEmployee: async (req, res, next) => {
        try {
            const { keyword } = req.query;

            const conditionFind = { isDeleted: false };

            const payload = await Employee.find({
                ...conditionFind,
                $or: [
                    { firstName: { $regex: fuzzySearch(keyword) } },
                    { lastName: { $regex: fuzzySearch(keyword) } },
                    { email: { $regex: fuzzySearch(keyword) } },
                    { phoneNumber: { $regex: fuzzySearch(keyword) } },
                ]
            }).sort({ lastName: 1 }).select("-password");

            const totalEmployee = await Employee.countDocuments(conditionFind);
            if (payload) {
                return res.status(200).json({
                    message: "Search information of employees successfully",
                    totalEmployee,
                    count: payload.length,
                    payload,
                });
            }

            return res.status(410).json({
                message: "Search information of employees not found",
            });
        } catch (err) {
            console.log("««««« error »»»»»", err);
            return res.status(404).json({
                message: "Search information of employees failed",
                error: err,
            });
        }
    },
}



