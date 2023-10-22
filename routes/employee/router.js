const express = require("express");
const router = express.Router();

const { validateSchema, checkIdSchema } = require("../../utils");
const {
    createEmployee,
    getAllEmployee,
    getDetailEmployee,
    updateEmployee,
    deleteEmployee,
    searchEmployee
} = require("./controller");
const { employeeSchema } = require("./validation");

router.route("/search").get(searchEmployee);
router
    .route("/")
    .post(validateSchema(employeeSchema),
        createEmployee)
    .get(getDetailEmployee)
    .patch(
        validateSchema(employeeSchema),
        updateEmployee
    );
router.route("/all").get(getAllEmployee);
router
    .route("/delete")
    .patch(
        validateSchema(checkIdSchema),
        deleteEmployee
    );


module.exports = router;
