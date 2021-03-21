import mapping from './mapping.js'

//Exibição
export default function newGraphicCanvas(windowInput, canvasId) {
	const canvas = windowInput.document.getElementById(canvasId);
	const screen = canvas.getContext("2d");

	const state = {
		size: 0,
		grid: []
	}

	let animationsList = [];
	let lastAddedAnimation = {
		from: 0,
		to: 0
	};

	function stateUpdate(gameStateObj) {
		state.size = gameStateObj.size;
		state.grid = gameStateObj.grid;

		if (gameStateObj.type) {
			const moveTypes = {
				move() {
					if (lastAddedAnimation.to.x == gameStateObj.from.x && lastAddedAnimation.to.y == gameStateObj.from.y) {
						animationsList.pop();

						lastAddedAnimation = {
							type: gameStateObj.type,
							from: lastAddedAnimation.from,
							to: gameStateObj.to,
							value: state.grid[gameStateObj.to.x][gameStateObj.to.y],
							progress: 0
						};

						animationsList.push(lastAddedAnimation);
					} else {
						lastAddedAnimation = {
							type: gameStateObj.type,
							from: gameStateObj.from,
							to: gameStateObj.to,
							value: state.grid[gameStateObj.to.x][gameStateObj.to.y],
							progress: 0
						};

						animationsList.push(lastAddedAnimation);
					}

					//console.log(`move animation registred do valor ${2**state.grid[gameStateObj.to.x][gameStateObj.to.y]} de (${gameStateObj.from.x},${gameStateObj.from.y}) para (${gameStateObj.to.x},${gameStateObj.to.y})`);
				},
				join() {
					animationsList.push({
						type: gameStateObj.type,
						from: gameStateObj.from,
						to: gameStateObj.to,
						value: state.grid[gameStateObj.to.x][gameStateObj.to.y] - 1,
						progress: 0
					});

					//console.log(`join animation registred do valor ${2**(state.grid[gameStateObj.to.x][gameStateObj.to.y] - 1)} de (${gameStateObj.from.x},${gameStateObj.from.y}) para (${gameStateObj.to.x},${gameStateObj.to.y})`)
				},
				appear() {
					animationsList.push({
						type: gameStateObj.type,
						in: gameStateObj.in,
						value: state.grid[gameStateObj.in.x][gameStateObj.in.y],
						progress: 0
					});
				}
			}

			moveTypes[gameStateObj.type]();
		}
	}

	//desenha o novo frame
	function newFrame() {
		//limpa a tela
		screen.clearRect(0, 0, canvas.width, canvas.height);

		const block = {
			size: {
				width: (canvas.width - (state.size * 5) - 5) / state.size,
				height: (canvas.height - (state.size * 5) - 5) / state.size
			},
			space: 5
		}

		screen.textBaseline = 'middle';
		screen.textAlign = 'center';

		const color = {
			background: 'darkgray',
			emptyBlock: 'white',
			notEmptyBlock(value) {
				return `rgb(
                    ${(2 ** value <= 2048) ? (255) : (0)},
                    ${(2 ** value <= 2048) ? (200 - Math.floor(mapping(value, 0, Math.log2(2048), 0, 200))) : (0)},
                    ${(2 ** value <= 2048) ? (200 - Math.floor(mapping(value, 0, Math.log2(2048), 0, 200))) : (0)}
                )`;
			},
			text: 'white'
		}

		screen.fillStyle = "darkgray";
		screen.fillRect(0, 0, canvas.width, canvas.height);

		for (let line in state.grid) {
			for (let column in state.grid[line]) {
				let element = state.grid[line][column];

				let printParam = {
					init: {
						x: block.space + column * (block.size.width + block.space),
						y: block.space + line * (block.size.height + block.space)
					},
					size: block.size,
					textPosition: null
				}

				printParam.textPosition = {
					x: printParam.init.x + (printParam.size.width / 2),
					y: printParam.init.y + (printParam.size.height / 2)
				}


				if (element != 0) {
					screen.fillStyle = color.notEmptyBlock(element);
					screen.fillRect(printParam.init.x, printParam.init.y, printParam.size.width, printParam.size.height);

					screen.fillStyle = color.text;
					if (String(2 ** element).length < 3) {
						screen.font = `bold ${(2 / 3) * block.size.height}px Arial`;
						screen.fillText(String(2 ** element), printParam.textPosition.x, printParam.textPosition.y);
					} else {
						screen.font = `bold ${(2 / String(2 ** element).length) * (2 / 3) * block.size.height}px Arial`;
						screen.fillText(String(2 ** element), printParam.textPosition.x, printParam.textPosition.y);
					}
				} else {
					screen.fillStyle = color.emptyBlock;
					screen.fillRect(printParam.init.x, printParam.init.y, printParam.size.width, printParam.size.height);
				}
			}
		}

		runAnimations();

		function runAnimations() {
			const animation = animationsList[0];

			if (animation) {
				animation.progress += 20;

				if (animation.progress == 100) {
					console.log(`animated ${animationsList[0].type}`);
					animationsList.shift();
				}
			}
		}

		windowInput.requestAnimationFrame(newFrame);
	}

	return {
		stateUpdate,
		newFrame
	}
}