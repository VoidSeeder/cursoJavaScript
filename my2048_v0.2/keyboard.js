//Input
export default function newKeyboardListner() {
	const keyboard = {
		observers: []
	}

	function subscribe(observerFunction) {
		keyboard.observers[0] = observerFunction;
	}

	function notifyAll(command) {
		for (let observerFunction of keyboard.observers) {
			observerFunction(command);
		}
	}

	window.document.addEventListener("keydown", keyPressed);

	function keyPressed(event) {
		const key = event.key;

		const acceptedKeys = {
			ArrowUp() {
				notifyAll('up');
			},
			ArrowDown() {
				notifyAll('down');
			},
			ArrowRight() {
				notifyAll('right');
			},
			ArrowLeft() {
				notifyAll('left');
			},
			Backspace() {
				notifyAll('backspace');
			}
		}

		if (acceptedKeys[key]) {
			acceptedKeys[key]();
		}
	}

	return {
		subscribe
	};
}