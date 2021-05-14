import { Observable, ReplaySubject } from 'rxjs';

export interface ConsoleLine {
  id: number;
  text: string;
}

export interface ReadAdmiralState {
  consoleBuffer: ConsoleLine[];
}

export class RearAdmrlClient {
  private _socket!: WebSocket;
  private _url: string;
  private _connected = false;
  private _connectRetryActive = false;
  private _nextLineId = 1;
  private _consoleBuffer: ConsoleLine[] = [];
  private _stateSubject = new ReplaySubject<ReadAdmiralState>(1);

  constructor(url: string) {
    this._url = url;
    this._stateSubject.next({
      consoleBuffer: []
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

  private appendConsoleLine(text: string) {
    this._consoleBuffer.push({
      id: this._nextLineId++,
      text: text
    });
    // console.log(this._consoleBuffer);
    this._stateSubject.next({
      consoleBuffer: this._consoleBuffer
    });
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
    if (message.type === "console") {
      this.appendConsoleLine(message.data);
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
    this._socket.send('install-tooling');
  }

  get state(): Observable<ReadAdmiralState> {
    return this._stateSubject;
  }
}
