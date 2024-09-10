const wait = (ms) => new Promise(resolve => {
  setTimeout(resolve, ms);
});

const createOctetStream = () => new ReadableStream({
  async start(controller) {
    for (const user of users) {
      controller.enqueue(JSON.stringify(user));
      await wait(1000);
    }
    controller.close();
  }
}).pipeThrough(new TextEncoderStream());

const listElement = document.getElementById('list');

const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
  { id: 3, name: "Charlie", email: "charlie@example.com" }
];

document.getElementById('load-button').addEventListener('click', async () => {
  const response = await fetch('https://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-ndjson',
    },
    body: createOctetStream(),
    duplex: 'half'
  });

  const reader = await response.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

  listElement.innerHTML = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log('스트림이 끝났습니다.');
      break;
    }

    console.log(`받은 데이터 : ${value}`);

    value.split('\n')
      .filter((it) => it)
      .forEach((user) => {
        const li = document.createElement('li');
        li.textContent = user;
        listElement.appendChild(li);
      });
  }
});

const supportsRequestStreams = (() => {
  let duplexAccessed = false;

  const hasContentType = new Request('', {
    method: 'POST',
    body: new ReadableStream(),
    get duplex() {
      duplexAccessed = true;
      return 'half';
    },
  }).headers.has('Content-Type');

  return duplexAccessed && !hasContentType;
})();

