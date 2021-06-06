import { Observable, ReplaySubject } from 'rxjs';
import { KConfig, KConfigParser } from '../../services/kconfig/kconfig-parser';

export interface ConsoleLine {
  id: number;
  text: string;
}

export interface PrinterPort {
  hostId: string;
  address: string; // ip/portname
  name: string;
  inUse: boolean;
}

export interface RearAdmiralState {
  id: string;
  name: string;
  toolingInstalled: boolean;
  busy: boolean;
  consoleBuffer: ConsoleLine[];
}

export interface MessageCallback {
  ref: number;
  callback: (message: any) => void;
}

export interface BasicConfigSet {
  klipper: string;
  moonraker: string;
}

export interface PrinterInstallConfig {
  klipper: string;
  moonraker: string;
  name: string;
  port: string;
  kconfig: string;
}

export class RearAdmrlClient {
  private _nextRef = 1;
  private _socket!: WebSocket;
  private _url: string;
  private _connected = false;
  private _connectRetryActive = false;
  private _nextLineId = 1;
  private _consoleBuffer: ConsoleLine[] = [];
  private _stateSubject = new ReplaySubject<RearAdmiralState>(1);
  private _callbacks: MessageCallback[] = [];

  constructor(url: string) {
    this._url = url;
    this.updateState();
  }

  async connect(): Promise<void> {
    this.appendConsoleLine(`Connecting to ${this._url}`);

    // setInterval(() => {
    //   this.appendConsoleLine('test');
    // }, 500);

    this._socket = new WebSocket(`ws://${this._url}/ws`);
    this._socket.onopen = (event) => this.onWsOpen(event);
    this._socket.onmessage = (message) => this.onWsMessage(message);
    this._socket.onerror = (error) => this.onWsError(error);
    this._socket.onclose = (event) => this.onWsClose(event);
  }

  private updateState() {
    this._stateSubject.next({
      id: this._url,
      name: this._url,
      toolingInstalled: false,
      busy: false,
      consoleBuffer: this._consoleBuffer,
    });

  }

  private appendConsoleLine(text: string) {
    if (text === '#') {
      this._consoleBuffer[this._consoleBuffer.length - 1].text += '#';
    }
    else {
      this._consoleBuffer.push({
        id: this._nextLineId++,
        text: text
      });
    }
    this.updateState();
  }

  private async retryConnnect() {
    if (this._connected) {
      this._connectRetryActive = false;
      return;
    }
    await this.connect();
    setTimeout(() => { this.retryConnnect(); }, 2000);
  }

  private startRetryConnect() {
    if (!this._connectRetryActive) {
      this._connectRetryActive = true;
      setTimeout(() => { this.retryConnnect(); }, 2000);
    }
  }

  private async onWsOpen(event: Event) {
    this._connected = true;
    this.appendConsoleLine(`Connected!`);
  }

  private onWsMessage(event: MessageEvent<any>): void {
    var message = JSON.parse(event.data);
    console.log(message);

    if (message.type === "console") {
      message.data.split('\n').forEach((line: string) => this.appendConsoleLine(line));
    }
    else {
      const index = this._callbacks.findIndex(cb => cb.ref === message.ref);
      const callback = this._callbacks[index];
      this._callbacks.splice(index, 1);
      callback.callback(message);
    }
  }

  private onWsError(error: Event) {
    console.log('onWsError', error);
  }

  private onWsClose(event: CloseEvent) {
    this._connected = false;
    this.startRetryConnect();
  }

  async getPrinterPorts(): Promise<PrinterPort[]> {
    return new Promise(resolve => {
      const ref = this._nextRef++;
      this._callbacks.push({
        ref,
        callback: (message) => {
          resolve(message.data.map((name: string) => ({
            hostId: this.id,
            address: this.id.split(':')[0] + name,
            name,
            inUse: false
          })));
        }
      });
      this._socket.send(JSON.stringify({ command: 'printer-setup.list-ports', ref }));
    });
  }

  async getKConfig(): Promise<KConfig> {
    return new Promise(resolve => {
      const ref = this._nextRef++;
      this._callbacks.push({
        ref,
        callback: (message) => {
          resolve(message.data);
        }
      });
      this._socket.send(JSON.stringify({ command: 'printer-setup.get-kconfig', ref }));
    });
  }

  async getBasicConfig(): Promise<BasicConfigSet> {
    return new Promise(resolve => {
      const ref = this._nextRef++;
      this._callbacks.push({
        ref,
        callback: (message) => {
          resolve(message.data);
        }
      });
      this._socket.send(JSON.stringify({ command: 'printer-setup.get-basic-config', ref }));
    });
  }

  installPrinter(config: PrinterInstallConfig) {
    this._socket.send(JSON.stringify({
      command: 'printer-setup.install-printer',
      data: config
    }));
  }

  installTooling() {
    this._socket.send(JSON.stringify({ command: 'installer.install-tooling' }));
  }

  turnOnAllPrinters() {
    this._socket.send(JSON.stringify({ command: 'power.turn-on-all' }));
  }

  turnOffAllPrinters() {
    this._socket.send(JSON.stringify({ command: 'power.turn-off-all' }));
  }

  get id(): string {
    return this._url;
  }

  get state(): Observable<RearAdmiralState> {
    return this._stateSubject;
  }
}
