const express = require('express');
const port = 3000;
const cors = require('cors');
const app = express();
const fs = require('fs');
app.use(cors());

app.use(express.static('public'));

var lastFile = '';

var server = app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`);
})

var io = require('socket.io')(server);
app.set('socketio', io);

app.on('/update', () => {
  return true;
})

function updateImage() {
  let newImage = `image.jpg?${Date.now()}`;
  fs.copyFile('public/image.jpg', `public/${newImage}`, (res) => {
    if (lastFile != "") {
      fs.unlink(lastFile, (err) => {
        if (err) {
          console.warn(err);
        }
      })
    }
    if (res) {
      console.log(res);
    }
    io.emit('update', { url: newImage });
    lastFile = `public/${newImage}`;
  });
}

fs.watchFile(
  '/home/morgan/projects/track/image_auto_update/public/image.jpg',
  {
    persistent: true,
    interval: 500
  }, () => {
    updateImage()
  }
)

io.on('connect', () => {
  console.log('new connect');
  updateImage();
})

process.on('exit', function () {
  //handle your on exit code
  if (lastFile != "") {
    fs.unlink(lastFile, (err) => {
      if (err) {
        console.warn(err);
      }
    })
  }
});