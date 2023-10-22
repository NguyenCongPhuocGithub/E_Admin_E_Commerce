const express = require("express");
const router = express.Router();

const { validateSchema, checkIdSchema } = require("../../utils");
const {
  orderSchema, updateStatusSchema
} = require("./validations");
const {
  createOrder,
  getAllOrder,
  getDetail,
  updateStatus,
  // updateShippingDate
} = require("./controller");


router.route("/").post(validateSchema(orderSchema), createOrder);
router.route("/all").get(getAllOrder);
router
  .route("/:id")
  .get(validateSchema(checkIdSchema), getDetail);

router
  .route("/status/:id")
  .patch(validateSchema(updateStatusSchema), updateStatus);

// router
//   .route("/shipping/:id")
//   .patch(validateSchema(orderSchema), updateShippingDate);

module.exports = router;
