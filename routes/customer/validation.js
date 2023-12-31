const yup = require('yup');

module.exports = {
  customerSchema: yup.object({
    body: yup.object({
      firstName: yup.string().required().max(50, 'Last name must exceed 50 characters'),
      lastName: yup.string().required().max(50, 'Name must exceed 50 characters'),
      email: yup.string()
        .required()
        .test('email type', '${path} Not a valid email', (value) => {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        }),
      phoneNumber: yup.string()
        .required()
        .test('phoneNumber type', '${path} Not a valid phone number', (value) => {
          const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
          return phoneRegex.test(value);
        }),

      address: yup.string()
        .required()
        .max(500, 'The address must not exceed 500 characters'),

      birthday: yup.date(),
      password: yup.string()
        .required()
        .min(8, 'Password cannot be less than 8 characters')
        .max(12, 'Password must not exceed 12 characters'),
    }),
  })
}