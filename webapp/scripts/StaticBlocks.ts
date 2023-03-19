class StaticBlocks {

	private walls: Array<Point> = [];

	constructor(mapSize: Point) {
		for (var x = 0; x < mapSize.getX(); x++) {
			this.walls.push(new Point(x, 0));
			this.walls.push(new Point(x, mapSize.getY() - 1));
		}

		for (var y = 1; y < mapSize.getX() - 1; y++) {
			this.walls.push(new Point(0, y));
			this.walls.push(new Point(mapSize.getX() - 1, y));
		}

		this.walls.push(new Point(6, 6))
		this.walls.push(new Point(7, 6))
		this.walls.push(new Point(8, 6))
		this.walls.push(new Point(9, 6))
		this.walls.push(new Point(10, 6))
		this.walls.push(new Point(8, 7))
		this.walls.push(new Point(8, 8))
		this.walls.push(new Point(8, 9))
		this.walls.push(new Point(8, 10))
		this.walls.push(new Point(8, 11))
		this.walls.push(new Point(8, 12))

		this.walls.push(new Point(17, 6))
		this.walls.push(new Point(17, 7))
		this.walls.push(new Point(17, 8))
		this.walls.push(new Point(17, 9))
		this.walls.push(new Point(17, 10))
		this.walls.push(new Point(17, 11))
		this.walls.push(new Point(17, 12))

		this.walls.push(new Point(23, 6))
		this.walls.push(new Point(23, 7))
		this.walls.push(new Point(23, 8))
		this.walls.push(new Point(23, 9))
		this.walls.push(new Point(23, 10))
		this.walls.push(new Point(23, 11))
		this.walls.push(new Point(23, 12))

		this.walls.push(new Point(18, 6))
		this.walls.push(new Point(19, 7))
		this.walls.push(new Point(20, 8))
		this.walls.push(new Point(21, 7))
		this.walls.push(new Point(22, 6))

		this.walls.push(new Point(30, 6))
		this.walls.push(new Point(30, 7))
		this.walls.push(new Point(30, 8))
		this.walls.push(new Point(30, 9))
		this.walls.push(new Point(30, 10))
		this.walls.push(new Point(30, 11))
		this.walls.push(new Point(30, 12))

		this.walls.push(new Point(31, 6))
		this.walls.push(new Point(32, 6))
		this.walls.push(new Point(33, 6))

		this.walls.push(new Point(31, 9))
		this.walls.push(new Point(32, 9))
		this.walls.push(new Point(33, 9))

		this.walls.push(new Point(31, 12))
		this.walls.push(new Point(32, 12))
		this.walls.push(new Point(33, 12))

	}

	public containsBlockAt(p: Point): boolean {
		return this.walls.filter(function (x) { return x.isEqualTo(p) }).length > 0;
	}

	public getCells(): Array<Point> {
		return this.walls;
	}

}