var express = require("express");
var router = express.Router();

const {
  fake,
  createProduct,
  getAllProduct,
  getListProduct,
  getDetailProduct,
  updateProduct,
  deleteProduct,
  searchProduct
} = require("./controller");
const { validateSchema, checkIdSchema } = require("../../utils");
const { productSchema } = require("./validation");


router
  .route("/")
  .post(validateSchema(productSchema),
    createProduct)
  .get(getListProduct);
router.route("/all").get(getAllProduct);
router
  .route("/:id")
  .get(validateSchema(checkIdSchema),
    getDetailProduct)
  .patch(
    validateSchema(checkIdSchema),
    validateSchema(productSchema),
    updateProduct
  );
router
  .route("/delete/:id")
  .patch(
    validateSchema(checkIdSchema),
    deleteProduct
  );
router
  .route("/search")
  .get(
    searchProduct
  );
module.exports = router;
