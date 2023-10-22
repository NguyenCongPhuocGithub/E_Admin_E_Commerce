var express = require("express");
const router = express.Router();

const { validateSchema, checkIdSchema } = require("../../utils");
const {
  getAllCustomer,
  getDetailCustomer,
  searchCustomer
} = require("./controller");
// const { customerSchema } = require("./validation");

router.route("/search").get(searchCustomer);
router.route("/all").get(getAllCustomer);
router
  .route("/:id")
  .get(validateSchema(checkIdSchema),
    getDetailCustomer);

module.exports = router;
