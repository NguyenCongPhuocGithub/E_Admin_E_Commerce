const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Media } = require('../../models')
const {
  toSafeFileName,
  insertDocument,
  updateDocument,
  findDocument,
  insertDocuments,
} = require('../../utils/MongoDbHelper');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
});

function generateUniqueFileName() {
  const timestamp = Date.now();
  const randomChars = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomChars}`;
}

module.exports = {

  // uploadSingle: async (req, res, next) => {
  //   const { categoryId } = req.params;
  //   if (!req.file || !req.file.originalname) {
  //     return res.status(400).json({ message: "Tệp không hợp lệ" });
  //   }
  //   try {
  //     const s3Client = new S3Client({
  //       region: 'auto',
  //       endpoint: process.env.ENDPOINT,
  //       credentials: {
  //         accessKeyId: process.env.R2_ACCESS_KEY_ID,
  //         secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  //       },
  //     });

  //     const fileName = generateUniqueFileName(req.file.originalname);

  //     const params = {
  //       Bucket: 'ecommerce',
  //       Key: fileName,
  //       Body: req.file.buffer,
  //       ContentType: req.file.mimetype,
  //     };

  //     s3Client.send(new PutObjectCommand(params))
  //       .then(() => {
  //         const url = `${process.env.ENDPOINT}/ecommerce/${fileName}`;
  //         const media = new Media({
  //           location: url,
  //           name: fileName,
  //           categoryId: categoryId,
  //           size: req.file.size,
  //         });

  //         return media.save();
  //       })
  //       .then((payload) => {
  //         res.status(200).json({ message: "Tải lên thành công", payload });
  //       })
  //       .catch((error) => {
  //         console.error('««««« error »»»»»', error);
  //         res.status(500).json({ message: "Upload file error", error });
  //       });
  //   } catch (error) {
  //     console.error('««««« error »»»»»', error);
  //     res.status(500).json({ message: "Upload file error", error });
  //   }
  // },

  uploadSingle: (req, res, next) => {
    const { categoryId } = req.params;

    upload.single('image')(req, res, async (err) => {
      try {
        const S3 = new S3Client({
          region: 'auto',
          endpoint: process.env.ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });

        const fileName = generateUniqueFileName(req.file.originalname)

        await S3.send(
          new PutObjectCommand({
            Body: req.file.buffer,
            Bucket: 'ecommerce',
            Key: fileName,
            ContentType: req.file.mimetype,
          })
        );

        console.log('««««« Vào đây nè »»»»»', "Vào đây nè");

        const url = `${process.env.ENDPOINT}/ecommerce/${fileName}`

        const media = new Media({
          location: url,
          name: fileName,
          categoryId: categoryId,
          size: req.file.size,
        });

        const payload = await media.save();

        return res.status(200).json({ message: "Tải lên thành công", payload });

      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.status(500).json({ message: "Upload file error", error });
      }
    });
  },

  uploadMultiple: (req, res, next) => {
    const { objid } = req.params;

    upload.array('images', 4)(req, res, async (err) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No image file provided" });
        }
        const S3 = new S3Client({
          region: 'auto',
          endpoint: process.env.ENDPOINT,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          },
        });

        const listFiles = req.files.reduce((prev, file) => {
          prev.push({
            Body: file.buffer,
            Bucket: 'demobackend',
            Key: generateUniqueFileName(file.originalname),
            ContentType: file.mimetype,
          });

          return prev;
        }, []);

        await Promise.all(listFiles.map(async (file) => {
          try {
            const params = {
              Body: file.Body,
              Bucket: file.Bucket,
              Key: file.Key,
              ContentType: file.ContentType,
            };

            await S3.send(new PutObjectCommand(params));

            console.log(`File ${file.Key} uploaded to S3.`);
          } catch (error) {
            console.error(`Error uploading file ${file.Key} to S3:`, error);
          }
        }));

        const url = `https://pub-0e73c6f5fc4a489f88372f88f9e09175.r2.dev/demobackend`

        const found = await Media.find({ objectId: objid, type: TYPE.SMALL_IMG });

        if (found) {
          await Media.deleteMany(
            {
              objectId: objid,
              type: TYPE.SMALL_IMG,
            }
          );

          const dataInsert = listFiles.reduce((prev, file) => {
            prev.push({
              name: file.Key,
              location: `${url}/${file.Key}`,
              size: file.size,
              employeeId: req.user._id,
              objectId: objid,
              type: TYPE.SMALL_IMG,
            });

            return prev;
          }, []);

          let response = await insertDocuments(dataInsert, 'Media');

          return res.status(200).json({ message: "Update thành công", payload: response });
        } else {
          const dataInsert = req.files.reduce((prev, file) => {
            prev.push({
              name: fileName,
              location: url,
              size: file.size,
              employeeId: req.user._id,
              objectId: objid,
              type: TYPE.SMALL_IMG,
            });
            return prev;
          }, []);

          let response = await insertDocuments(dataInsert, 'Media');

          return res.status(200).json({ message: "Tải lên thành công", payload: response });
        }
      } catch (error) {
        console.log('««««« error »»»»»', error);
        return res.status(500).json({ message: "Upload file error", error });
      }
    });
  },
};
