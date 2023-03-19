class KeyboardDriver {

	private app: App;

	constructor(app: App) {
		this.app = app;
		window.addEventListener("keydown", this.handleKeyDown.bind(this));
	}

	private handleKeyDown(e: KeyboardEvent) {
		if (e.keyCode >= 37 && e.keyCode <= 40) {
			e.preventDefault();
		}

		if (e.keyCode == 37) {
			this.app.processAction(Action.Left);
		} else if (e.keyCode == 38) {
			this.app.processAction(Action.Up);
		} else if (e.keyCode == 39) {
			this.app.processAction(Action.Right);
		} else if (e.keyCode == 40) {
			this.app.processAction(Action.Down);
		}
	}


}