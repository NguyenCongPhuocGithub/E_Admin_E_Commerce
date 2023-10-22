const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  
  orderSchema: yup.object().shape({
    body: yup.object().shape({
      createdDate: yup.date(),
      shippedDate: yup.date(),
      paymentType: yup.string().default('CASH')
        .oneOf(['CASH', 'CREDIT_CARD'], 'Invalid payment form'),
      status: yup.string().default('PLACED')
        .oneOf(['PLACED', 'PREPARING', 'DELIVERING', "COMPLETED", "CANCELED", "REJECTED", "FLAKER"], 'Invalid status'),
      customerId: yup.string()
        .default("Direct customers")
        .test('validationCustomerID', 'customerId is in wrong format', (value) => {
          if (value == "Direct customers") return true; // Nếu customerId không được cung cấp, bỏ qua kiểm tra định dạng
          else return ObjectId.isValid(value);
        }),
      employeeId: yup.string()
        .test('validationEmployeeID', 'employeeId is in wrong format', (value) => {
          return ObjectId.isValid(value);
        }),
      productList: yup.array().of(
        yup.object().shape({
          productId: yup.string()
            .required()
            .test('validationProductID', 'productId sai định dạng', (value) => {
              return ObjectId.isValid(value);
            }),
          quantity: yup.number().required().min(1).default(1),
        }),
      ).required('Product list is required'),
    }),
  }),

  updateStatusSchema: yup.object({
    body: yup.object({
      status: yup.string()
        .oneOf(['PLACED', 'PREPARING', 'DELIVERING', "COMPLETED", "CANCELED", "REJECTED", "FLAKER"], 'Invalid status'),
    }),
  }),

  // updateShippingDateSchema: yup.object({
  //   body: yup.object({
  //     shippedDate: yup
  //       .date()
  //       .test('check date', '${path} ngày tháng không hợp lệ', (value) => {
  //         if (!value) return true;

  //         if (value && this.createdDate && value < this.createdDate) {
  //           return false;
  //         }

  //         if (value < new Date()) {
  //           return false;
  //         }

  //         return true;
  //       }),
  //   }),
  // }),

};
