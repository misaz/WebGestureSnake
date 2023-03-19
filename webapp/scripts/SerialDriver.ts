/// <reference path="../lib/w3c-web-serial.d.ts" />

class SerialDriver {
	private serialPort: SerialPort;
	private reader: ReadableStreamDefaultReader<Uint8Array>;
	private pollingDelay: number = 10;
	private app: App;
	private error: string;
	private isConnectedSuccessfully: boolean = false;

	constructor(app: App) {
		this.app = app;
	}

	async connect() {
		this.error = null;
		try {
			this.serialPort = await navigator.serial.requestPort({
				filters: [
					{
						usbVendorId: 0x0D28, // NXP (but for some reason used by Maxim Integrated)
						usbProductId: 0x0204 // DAPLINK (MAX32625 DAPLINK MCU on MAX32655FTHR Board with firmware 1.0.3)
					}
				]
			});

			await this.serialPort.open({ baudRate: 115200 });

			if (!this.serialPort.readable || !this.serialPort.writable) {
				await this.serialPort.close();
				throw "Unable to open specified COM port.";
			}

			this.reader = this.serialPort.readable.getReader();
		} catch (e) {
			this.error = "Error while opening specified serial port";
			return;
		}

		this.isConnectedSuccessfully = true;
		this.app.triggerRender();

		setTimeout(this.readAndProcessLine.bind(this), this.pollingDelay);
	}

	private async readAndProcessLine() {
		var line = "";
		var completed = false;
		while (!completed && line.indexOf("\n") == -1) {
			var output = await this.reader.read();
			if (output.done) {
				completed = true;
			} else {
				var received = new TextDecoder().decode(output.value);
				line = line + received;
			}
		}

		line = line.trim();

		if (line == "up") {
			this.app.processAction(Action.Up);
		} else if (line == "down") {
			this.app.processAction(Action.Down);
		} else if (line == "left") {
			this.app.processAction(Action.Left);
		} else if (line == "right") {
			this.app.processAction(Action.Right);
		} else {
			console.warn("Received unsupported command " + line);
		}

		setTimeout(this.readAndProcessLine.bind(this), this.pollingDelay);
	}

	static doesBrowserSupportGestures(): boolean {
		return !!navigator.serial;
	}

	isFailed(): boolean {
		return this.error != null;
	}

	isConnected(): boolean {
		return this.isConnectedSuccessfully;
	}

	getError(): string {
		return this.error;
	}

}