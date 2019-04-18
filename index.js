
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const multer  = require('multer');
const path = require('path');

const PORT = process.env.PORT || 5000

const upload = multer({
  storage,
  limits: { fieldSize: 25 * 1024 * 1024 }
}).single('video')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/files');
  },
  filename: function (req, file, cb) {
    cb(null, 'uploadedVid.mov');
  }
})

var app = express();

app.use(express.static(path.join(__dirname, 'public')))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res, next) => res.render('pages/index'))

app.post('/convertToGIF', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log('next')
      var videoFile = "./public/files/uploadedVid.mov"
      ffmpeg(videoFile)
        .inputOptions('-t 1')
        .complexFilter([
          "[0]reverse[r];[0][r]concat,loop=3:144,setpts=N/24/TB,scale=w=trunc(iw*0.40/2)*2:h=trunc(ih*0.40/2)*2"
        ])
        .format('gif')
        .noAudio()
        .output('./public/files/out.gif')
        .on('end', function() {
          console.log('video converted');
          res.sendFile(path.join(__dirname, './public/files', 'out.gif'));
        })
        .on('error', function(err) {
          console.log('an error happened: ' + err.message);
        })
        .run();
    }
  })
})

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
