const nodemailer = require("nodemailer");
var multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')
const axios = require('axios');
const FileType = require('file-type');

var Jimp = require('jimp');
var path = require('path');

////////////////////////multer configs
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

var upload = multer({ storage: storage })
const mailer = async (email, subject, content) => {
    try {

        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",                            ///use for mailer config here
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user              //use your mailer account user name
                pass: testAccount.pass, // generated ethereal password        //use your mailer acc password
            },
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: email, // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            text: content, // plain text body
            // html: "<b>Hello world?</b>", // html body
        });

    }
    catch (err) {
        console.log(err)
    }
}

//////////download image from url
const download_image = (url, image_path) =>
    axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise(async (resolve, reject) => {
                let type = await FileType.fromStream(response.data)
                // console.log(type)
                response.data
                    .pipe(fs.createWriteStream(`${image_path}.${type.ext}`))
                    .on('finish', () =>
                        resolve(`${type.ext}`)
                    )
                    .on('error', e => reject(e));
            }),
    );

const covertFileJimp = async (imgPath, url, width, height = Jimp.AUTO, quality) => {
    try {
        const image = await Jimp.read(url);
        await image.resize(width, height);
        await image.quality(quality);
        await image.writeAsync(path.join(__dirname, '..', 'public', 'thumb', `${imgPath}`));
        return `public/thumb/${imgPath}`
        
    } catch (error) {
        console.error(error)
    }
}

module.exports = { mailer, upload, download_image, covertFileJimp }