class App {
	private snake: Snake;
	private food: Food;
	private wall: StaticBlocks;
	private staticBlocks: StaticBlocks;
	private mapSize: Point;
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private isRunning: boolean;
	private gameOver: boolean;
	private serialDriver: SerialDriver;
	private keyboadDriver: KeyboardDriver;
	private renderer: Renderer;
	private score: number;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.mapSize = new Point(40, 20);
		this.snake = new Snake(new Point(20, 10));
		this.wall = new StaticBlocks(this.mapSize);
		this.isRunning = false;
		this.gameOver = false;
		this.serialDriver = new SerialDriver(this);
		this.keyboadDriver = new KeyboardDriver(this);
		this.renderer = new Renderer(this);
		this.score = 0;
		this.generateFood();
		this.triggerRender();

		document.querySelector("#connect-max25405").addEventListener("click", this.connectGestureSensor.bind(this));
	}

	private connectGestureSensor() {
		this.serialDriver.connect();
	}

	private generateFood() {
		var collistion = false;
		var newPosition: Point;
		do {
			newPosition = Point.getRandomPoint(this.mapSize);
			collistion = this.wall.containsBlockAt(newPosition) || this.snake.containsBlockAt(newPosition);

			var siblingWalls = 0;
			var directions = [Point.getDirectionDown(), Point.getDirectionLeft(), Point.getDirectionRight(), Point.getDirectionUp()];
			directions.forEach(function (this: App, dir) {
				var posClone = newPosition.clone();
				posClone.add(dir);
				if (this.wall.containsBlockAt(posClone))  {
					siblingWalls++;
				}
			}.bind(this));
		} while (collistion || siblingWalls > 2);

		this.food = new Food(newPosition);
	}

	private handleTick() {
		var newHeadPosition = this.snake.getHeadPosition().clone();
		newHeadPosition.add(this.snake.getDirection());

		if (this.wall.containsBlockAt(newHeadPosition) || this.snake.containsBlockAt(newHeadPosition)) {
			this.gameOver = true;
			this.isRunning = false;
			this.triggerRender();
			return;
		}

		var eatFood = newHeadPosition.isEqualTo(this.food.getPosition());

		this.snake.doStep(eatFood);

		if (eatFood) {
			this.score++;
			this.generateFood();
		}

		this.setupTimer();
		this.triggerRender();
	}

	private setupTimer(delay: number = 800) {
		setTimeout(this.handleTick.bind(this), delay);
	}

	public triggerRender() {
		this.renderer.render(this.canvas, this.ctx);
	}

	public processAction(action: Action) {
		if (this.isRunning) {
			var newDirection: Point;

			if (action == Action.Up) {
				newDirection = Point.getDirectionUp();
			} else if (action == Action.Down) {
				newDirection = Point.getDirectionDown();
			} else if (action == Action.Left) {
				newDirection = Point.getDirectionLeft();
			} else if (action == Action.Right) {
				newDirection = Point.getDirectionRight();
			} else {
				return;
			}

			var currentDirection = this.snake.getDirection();
			var curentReverseDirection = new Point(currentDirection.getX() * -1, currentDirection.getY() * -1);

			if (!newDirection.isEqualTo(curentReverseDirection)) {
				this.snake.setDirection(newDirection);
			}
		} else {
			if (!this.gameOver && action == Action.Right) {
				this.isRunning = true;
				this.setupTimer(2000);
				this.triggerRender();
			}

			if (this.gameOver && action == Action.Up) {
				location.reload();
			}
		}
	}

	public getMapSize(): Point {
		return this.mapSize;
	}

	public getSnake(): Snake {
		return this.snake;
	}

	public getFoodLocation(): Point {
		return this.food.getPosition();
	}

	public getStaticWalls(): StaticBlocks {
		return this.wall;
	}

	public isGameOver(): boolean {
		return this.gameOver;
	}

	public getScore(): number {
		return this.score;
	}

	public getSerialDriver(): SerialDriver {
		return this.serialDriver;
	}

	public isGameStarted(): boolean {
		return this.isRunning;
	}
}

var app: App;

window.addEventListener("load", function () {
	var canvas: HTMLCanvasElement = document.querySelector("#game_canvas");
	app = new App(canvas);
});