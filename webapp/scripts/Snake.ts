class Snake {
    private headPosition: Point;
    private cells: Array<Point> = [];
    private direction: Point;

    constructor(startupHeadPosition: Point) {
        this.headPosition = startupHeadPosition;
        this.direction = Point.getDirectionRight();

        for (var i = 2; i >= 0; i--) {
            this.cells.push(new Point(startupHeadPosition.getX() - i, startupHeadPosition.getY()))
        }
    }

    public doStep(eatFood: boolean) {
        this.headPosition.add(this.direction);
        this.cells.push(this.headPosition.clone());
        if (!eatFood) {
            this.cells.shift();
        }
    }

    public setDirection(direction: Point) {
        this.direction = direction;
    }

    public getDirection(): Point {
        return this.direction;
    }

    public getHeadPosition(): Point {
        return this.headPosition
    }

    public getCells(): Array<Point> {
        return this.cells;
    }

    public containsBlockAt(p: Point): boolean {
        return this.cells.filter(function (x) { return x.isEqualTo(p) }).length > 0;
    }
}