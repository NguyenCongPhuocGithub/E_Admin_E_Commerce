var express = require("express");
var router = express.Router();
const upload = require('../../middlewares/fileMulter'); // Import middleware Multer
let { validateSchema, checkIdSchema } = require("../../utils");
const {
  createCategory,
  getAllCategory,
  getDetailCategory,
  updateCategory,
  deleteCategory,
  searchCategory
} = require("./controller");
const {
  categorySchema
} = require("./validation");

router.route("/search").get(searchCategory);
router
  .route("/")
  .post(
    // validateSchema(categorySchema),
    upload.single('image'),
    createCategory
  );
router.route("/all").get(getAllCategory);

router
  .route("/:id")
  .get(validateSchema(checkIdSchema), getDetailCategory)
  .patch(
    validateSchema(checkIdSchema),
    validateSchema(categorySchema),
    updateCategory
  )
router
  .route("/delete/:id")
  .patch(
    validateSchema(checkIdSchema),
    deleteCategory
  );

module.exports = router;
