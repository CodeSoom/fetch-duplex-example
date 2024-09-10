const http2 = require('node:http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('./server-key.pem'),
  cert: fs.readFileSync('./server-cert.pem')
});

server.on('stream', (stream, headers) => {
  stream.respond({
    // 'content-type': 'application/x-ndjson',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:8080',
    'Access-Control-Allow-Headers': 'Content-Type',
    ':status': 200
  });

  if (headers[':method'] === 'OPTIONS') {
    stream.end();
    return;
  }

  let count = 0;
  let done = false;

  stream.on('data', async (chunk) => {
    for (const it of users) {
      it.email = it.email.toUpperCase();
      console.log('write: ', JSON.stringify(it));
      stream.write(JSON.stringify(it) + '\n');
    }
    // count++;
    // console.log(`Receive : ${chunk.toString()}`);
    // const user = JSON.parse(chunk);
    // user.email = user.email.toUpperCase();

    // await wait(4000);
    // stream.write(JSON.stringify(user) +'\n');
    // console.log('Send :', JSON.stringify(user));
    // count--;
    // if (count === 0 && done) {
    //   stream.end();
    // }
  });

  stream.on('end', async () => {
    done = true;
  });
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(3000, () => {
  console.log('HTTP/2 server running on https://localhost:3000');
});