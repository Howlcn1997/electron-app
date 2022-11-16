import STYLES from './index.less';

export default function HomePage () {
  function createWithPool () {
    const name = +new Date() + '1';
    global.nodeRequire('electron').ipcRenderer.send('BROWSER_IPC::WINDOW_MANAGER', {
      action: 'createWithPool',
      args: [{ name, show: true, x: 0, y: 0, loadURL: 'https://ifonts.com/client/vip/ifonts-shop/commercial' }]
    });
  }

  function createWithManager () {
    const name = +new Date() + '2';
    global.nodeRequire('electron').ipcRenderer.send('BROWSER_IPC::WINDOW_MANAGER', {
      action: 'create',
      args: [{ name, show: true, loadURL: 'https://ifonts.com/client/vip/ifonts-shop/commercial' }]
    });
  }
  function o () {
    createWithManager();
    createWithPool();
  }

  return (
    <div className={STYLES.wrap}>
      <button onClick={createWithPool}>窗口池新建窗口</button>
      <button onClick={createWithManager}>普通新建窗口</button>
      <button onClick={o}>同时创建</button>
    </div>
  );
}
