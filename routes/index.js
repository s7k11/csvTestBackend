var express = require('express');
var router = express.Router();

const csv = require('csv-parser')
const fs = require('fs')
let { mailer, upload, download_image, covertFileJimp } = require('../utils/basicUtils')
var Jimp = require('jimp');

var path = require('path');

let Queries = require('../models/queries')

router.post('/fileUpload', upload.single('file'), async (req, res) => {
  try {
    // console.log(req.file)
    let csvToJsonArr = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => csvToJsonArr.push(data['Image URL']))
      .on('end', async () => {
        let imageArr = [];
        for (let el of csvToJsonArr) {
          let fileName = `img-${Date.now()}`
          const FileExt = await download_image(el, path.join(__dirname, '..', 'public', 'uploads', `${fileName}`))
          //jimp
          let thumbPath = await covertFileJimp(`${fileName}.${FileExt}`, el, 256, 256, 90);
          imageArr.push({
            mailImgUrl: `public/uploads/${fileName}.${FileExt}`,
            thumbImgUrl: thumbPath
          })

        }
        await new Queries({ email: req.body.email, imageArr }).save();
        ///nodemailer
        await mailer(req.body.email, 'task', 'task successfull')
      })
    res.status(200).json({ message: 'Images are being uploaded', success: true });
  }
  catch (err) {
    console.log(err);
    if (err.message)
      res.status(500).json({ message: err.message, success: false })
    else
      res.status(500).json({ message: 'Error', success: false })
  }
})






module.exports = router;
