
const agentOpt = { keepAlive: true, keepAliveMsecs: 3000, timeout: 10000 };
const httpAgent = new (require('http').Agent)(agentOpt);
const httpsAgent = new (require('https').Agent)(agentOpt);

function download ({ url, dir, fileName, opts = {}, timeout = 10000 }) {
  return new Promise((resolve, reject) => {
    const dl = new (require('node-downloader-helper').DownloaderHelper)(url, dir, {
      retry: { maxRetries: 2, delay: 3000 },
      httpsRequestOptions: { agent: httpsAgent, timeout },
      httpRequestOptions: { agent: httpAgent, timeout },
      override: { skip: true },
      ...opts,
      fileName
    });

    dl.on('error', e => {
      const error = new Error('download error');
      error.msg = e;
      reject(error);
    });

    dl.on('timeout', () => {
      const error = new Error('download timeout');
      reject(error);
    });

    dl.on('end', resolve);

    dl.on('skip', resolve);

    dl.start();
  });
}

module.exports = { download }
;
