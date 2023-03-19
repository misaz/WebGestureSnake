class Point {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    add(p: Point) {
        this.x += p.x;
        this.y += p.y;
    }

    isEqualTo(p: Point) {
        return this.x == p.x && this.y == p.y;
    }

    static getDirectionUp(): Point {
        return new Point(0, -1);
    }

    static getDirectionDown(): Point {
        return new Point(0, 1);
    }

    static getDirectionLeft(): Point {
        return new Point(-1, 0);
    }

    static getDirectionRight(): Point {
        return new Point(1, 0);
    }

    static getRandomPoint(boundary: Point) {
        return new Point(Math.round(Math.random() * (boundary.getX() - 1)), Math.round(Math.random() * (boundary.getY() - 1)));
    }
}