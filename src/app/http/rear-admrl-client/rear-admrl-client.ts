import { Observable, ReplaySubject } from 'rxjs';
import { KConfigParser } from '../../services/kconfig/kconfig-parser';
import { KConfig } from '../../services/kconfig/KConfigParser.types';

export interface ConsoleLine {
  id: number;
  text: string;
}

export interface PrinterPort {
  name: string;
}

export interface RearAdmiralState {
  kconfig: KConfig;
  consoleBuffer: ConsoleLine[];
  printerPorts: PrinterPort[]
}

export class RearAdmrlClient {
  private _socket!: WebSocket;
  private _url: string;
  private _connected = false;
  private _connectRetryActive = false;
  private _nextLineId = 1;
  private _kconfig = { kconfig: '', config: '' };
  private _printerPorts: PrinterPort[] = [];
  private _consoleBuffer: ConsoleLine[] = [];
  private _stateSubject = new ReplaySubject<RearAdmiralState>(1);

  constructor(url: string) {
    this._url = url;
    this._stateSubject.next({
      kconfig: { kconfig: '', config: '' },
      consoleBuffer: [],
      printerPorts: []
    });
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
      kconfig: this._kconfig,
      consoleBuffer: this._consoleBuffer,
      printerPorts: this._printerPorts
    });

  }

  private appendConsoleLine(text: string) {
    this._consoleBuffer.push({
      id: this._nextLineId++,
      text: text
    });
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
      this.retryConnnect();
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
      this.appendConsoleLine(message.data);
    }
    if (message.type === "printer-ports") {
      this._printerPorts = message.data.map((name: string) => ({ name }));
      this.updateState();
    }
    if (message.type === "kconfig") {
      this._kconfig = message.data;
      new KConfigParser(this._kconfig);
      this.updateState();
    }
  }

  private onWsError(error: Event) {
    console.log('onWsError', error);
  }

  private onWsClose(event: CloseEvent) {
    this._connected = false;
    this.startRetryConnect();
  }

  installTooling() {
    this._socket.send('installer.install-tooling');
  }

  updatePrinterPorts() {
    this._socket.send('printer-setup.list-ports');
  }

  turnOnAllPrinters() {
    this._socket.send('power.turn-on-all');
  }

  turnOffAllPrinters() {
    this._socket.send('power.turn-off-all');
  }

  readKConfig() {
    this._socket.send('printer-setup.get-kconfig');
  }

  get state(): Observable<RearAdmiralState> {
    return this._stateSubject;
  }
}
