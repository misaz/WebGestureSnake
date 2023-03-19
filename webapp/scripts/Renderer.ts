class Renderer {

	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	public render(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

		if (!SerialDriver.doesBrowserSupportGestures()) {
			this.renderMessage(canvas, ctx, "Browser not supported", ["Your browser do not support WebSerial API which is needed for running", " this game with gesture sensor. Use Microsoft Edge or Google Chrome."]);
		} else if (this.app.getSerialDriver().isFailed()) {
			this.renderMessage(canvas, ctx, "Error", [this.app.getSerialDriver().getError()]);
		} else if (!this.app.getSerialDriver().isConnected()) {
			this.renderMessage(canvas, ctx, "Waiting for device", ["Assemble and connect gesture sensing device according instructions above."]);
		} else if (this.app.isGameOver()) {
			this.renderMessage(canvas, ctx, "Game Over", [" Score: " + this.app.getScore(), "", "Swipe up to reload page and try again."]);
		} else if (!this.app.isGameStarted()) {
			this.renderMessage(canvas, ctx, "Start game", ["Start game by swiping hand from left to right in front of the sensor"]);
		} else {
			this.renderGame(canvas, ctx);
		}
	}

	private renderMessage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, message: string, details: Array<string>) {
		ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

		ctx.fillStyle = "brown";
		ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

		ctx.font = "24pt Arial";
		ctx.textBaseline = "middle";

		var dim = ctx.measureText(message);
		var height = 40;
		var topOffset = 60;
		if (details == null) {
			topOffset = 120;
		}

		ctx.fillStyle = "orange"
		ctx.fillRect(canvas.clientWidth / 2 - dim.width / 2 - 10, topOffset, dim.width + 20, height);

		ctx.fillStyle = "brown";
		ctx.fillText(message, canvas.clientWidth / 2 - dim.width / 2, topOffset + height / 2);

		var topOffset = 120;
		if (details != null) {
			ctx.font = "16pt Arial";
			var maxWidth = Math.max.apply(window, details.map(function (detail: string) {
				return ctx.measureText(detail).width;
			}));
			details.forEach(function (detail: string) {
				var dim = ctx.measureText(detail);
				var height = 30;

				ctx.fillStyle = "orange";
				ctx.fillRect(canvas.clientWidth / 2 - maxWidth / 2 - 10, topOffset, maxWidth + 20, height);

				ctx.fillStyle = "brown";
				ctx.fillText(detail, canvas.clientWidth / 2 - dim.width / 2, topOffset + height / 2);
				topOffset += height;
			});
		}
	}

	private renderGame(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
		var mapSize = this.app.getMapSize();

		var cellSize = Math.min(canvas.clientWidth / mapSize.getX(), canvas.clientHeight / mapSize.getY());

		ctx.fillStyle = "orange";
		ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

		ctx.fillStyle = "yellow";
		var snake = this.app.getSnake();
		snake.getCells().forEach(function (p) {
			var x = p.getX() * cellSize;
			var y = p.getY() * cellSize;

			ctx.fillRect(x, y, cellSize, cellSize);
		})
		var head = snake.getHeadPosition();
		var dir = snake.getDirection();
		var isL = dir.isEqualTo(Point.getDirectionLeft());
		var isR = dir.isEqualTo(Point.getDirectionRight());
		var isU = dir.isEqualTo(Point.getDirectionUp());
		var isD = dir.isEqualTo(Point.getDirectionDown());

		ctx.strokeStyle = "black";

		if (isL || isR) {
			ctx.beginPath();
			ctx.moveTo(head.getX() * cellSize + cellSize / 2, head.getY() * cellSize + cellSize * 0.1);
			ctx.lineTo(head.getX() * cellSize + cellSize * (isL ? 0.1 : 0.9), head.getY() * cellSize + cellSize / 2);
			ctx.lineTo(head.getX() * cellSize + cellSize / 2, head.getY() * cellSize + cellSize * 0.9);
			ctx.stroke();
		} else {
			ctx.beginPath();
			ctx.moveTo(head.getX() * cellSize + cellSize * 0.1, head.getY() * cellSize + cellSize / 2);
			ctx.lineTo(head.getX() * cellSize + cellSize / 2, head.getY() * cellSize + cellSize * (isU ? 0.1 : 0.9));
			ctx.lineTo(head.getX() * cellSize + cellSize * 0.9, head.getY() * cellSize + cellSize / 2);
			ctx.stroke();
		}


		ctx.fillStyle = "brown";
		this.app.getStaticWalls().getCells().forEach(function (p) {
			var x = p.getX() * cellSize;
			var y = p.getY() * cellSize;

			ctx.fillRect(x, y, cellSize, cellSize);
		})

		ctx.fillStyle = "green";
		var p = this.app.getFoodLocation()
		var x = p.getX() * cellSize;
		var y = p.getY() * cellSize;
		ctx.fillRect(x, y, cellSize, cellSize);
	}

}