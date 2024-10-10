const multer = require("multer");
const fs = require("fs");
let mediaUtils = {};

mediaUtils.storage = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname.replace("+", "")}`);
    },
  }),
});

mediaUtils.removeFile = (filename) => {
  const fileArray = typeof(filename) === "string" ? [filename] : filename;
  const paths = fileArray.map(f => "./public/uploads/" + f);
  paths.forEach(async path => {
    await fs.unlink(path,(err) => {
        if (err) {
            console.log(err,"not deleted ???")
        } else {
          console.log("deleted....");
        }
    })
  })
}

module.exports = mediaUtils;