const { Category } = require("../../models");
const { fuzzySearch } = require("../../utils");
const axios = require('axios');

module.exports = {
    createCategory: async (req, res, next) => {
        try {
            const { name, description, coverImageUrl } = req.body;

            const newCategory = new Category({
                name,
                description: description || null,
                coverImageUrl: coverImageUrl || null,
            });

            const savedCategory = await newCategory.save();
            res.status(200).json({ message: "Category created successfully", payload: savedCategory });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Adding category failed", error, });

        }
    },

    getAllCategory: async (req, res, next) => {
        try {
            const payload = await Category.find({ isDeleted: false });
            res.status(200).json({ message: "Retrieve category data successfully", payload, });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Retrieving category data failed", error, });
        }
    },

    getDetailCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const payload = await Category.findOne({
                _id: id,
                isDeleted: false,
            });
            if (!payload) {
                res.status(400).json({ message: "No category found in data", });
            }
            res.status(200).json({ message: "Retrieve detailed category data successfully", payload, });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Retrieving detailed category data failed", error, });
        }
    },

    updateCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            // const { name, description, isDeleted } = req.body;
            const payload = await Category.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { ...req.body },
                { new: true }
            );
            if (!payload) {
                res.status(400).json({ message: "No category found in data", });
            }
            res.status(200).json({ message: "Updated category data successfully", payload, });

        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Updating category data failed", error, });
        }
    },

    deleteCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const payload = await Category.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            );
            if (!payload) {
                res.status(400).json({ message: "No category found in data", });
            }
            res.status(200).json({ message: "Delete category data successfully", });
        } catch (error) {
            console.log("««««« error »»»»»", error);
            res.status(400).json({ message: "Delete category data failed", error, });
        }
    },

    searchCategory: async (req, res, next) => {
        try {
            const { keyword } = req.query;

            const conditionFind = { isDeleted: false };

            const payload = await Category.find({
                ...conditionFind,
                name: { $regex: fuzzySearch(keyword) }
            }).sort({ name: 1 });


            const totalCategory = await Category.countDocuments(conditionFind);

            if (payload) {
                return res.status(200).json({
                    message: "Search information of categories successfully",
                    totalCategory,
                    count: payload.length,
                    payload,
                });
            }

            return res.status(410).json({
                message: "Search information of categories not found",
            });
        } catch (err) {
            console.log("««««« error »»»»»", err);
            return res.status(404).json({
                message: "Search information of categories failed",
                error: err,
            });
        }
    },
};
