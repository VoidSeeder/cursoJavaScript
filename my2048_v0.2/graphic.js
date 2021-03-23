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

	function stateUpdate(gameStateObj) {
		if (state.size != gameStateObj.size) {
			state.size = gameStateObj.size;

			state.grid = new Array(state.size);
		}

		if (gameStateObj.type) {
			const moveTypes = {
				move() {
					animationsList.push({
						type: gameStateObj.type,
						from: gameStateObj.from,
						to: gameStateObj.to,
						value: gameStateObj.value,
						progress: 0
					});
				},
				join() {
					animationsList.push({
						type: gameStateObj.type,
						from: gameStateObj.from,
						to: gameStateObj.to,
						value: gameStateObj.value,
						progress: 0
					});
				},
				appear() {
					animationsList.push({
						type: gameStateObj.type,
						in: gameStateObj.in,
						value: gameStateObj.value,
						progress: 0
					});
				},
				newGame() {
					for (let position = 0; position < state.size; position++) {
						state.grid[position] = new Array(state.size);
						state.grid[position].fill(0);
					}
				}
			}

			if(moveTypes[gameStateObj.type]) {
				moveTypes[gameStateObj.type]();
			}
		}
	}

	//desenha o novo frame
	function newFrame() {
		//limpa a tela
		screen.clearRect(0, 0, canvas.width, canvas.height);

		const block = {
			size: null,
			space: null
		}

		block.space = 80 / state.size;

		block.size = {
			width: (canvas.width - (state.size * block.space) - block.space) / state.size,
			height: (canvas.height - (state.size * block.space) - block.space) / state.size
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
				printBlock(line, column, state.grid[line][column]);
			}
		}

		runAnimations();

		function runAnimations() {
			const animation = animationsList[0];
			const animationStep = 50;

			const moves = {
				move() {
					//printa o bloco em movimento
					if (animation.to.x != animation.from.x) {
						//vertical
						let progressRelation = (animation.to.x > animation.from.x) ? (animation.progress) : (100 - animation.progress);
						let blocksToMove = (Math.abs(animation.to.x - animation.from.x)) * (progressRelation) / 100;
						let absoluteBlockPosition = (animation.to.x > animation.from.x) ? (animation.from.x + blocksToMove) : (animation.to.x + blocksToMove);

						printBlock(absoluteBlockPosition, animation.to.y, animation.value);
					} else {
						//horizontal
						let progressRelation = (animation.to.y > animation.from.y) ? (animation.progress) : (100 - animation.progress);
						let blocksToMove = (Math.abs(animation.to.y - animation.from.y)) * (progressRelation) / 100;
						let absoluteBlockPosition = (animation.to.y > animation.from.y) ? (animation.from.y + blocksToMove) : (animation.to.y + blocksToMove);

						printBlock(animation.to.x, absoluteBlockPosition, animation.value);
					}
				},
				join() {
					//printa o bloco em movimento
					if (animation.to.x != animation.from.x) {
						//vertical
						let progressRelation = (animation.to.x > animation.from.x) ? (animation.progress) : (100 - animation.progress);
						let blocksToMove = (Math.abs(animation.to.x - animation.from.x)) * (progressRelation) / 100;
						let absoluteBlockPosition = (animation.to.x > animation.from.x) ? (animation.from.x + blocksToMove) : (animation.to.x + blocksToMove);

						printBlock(absoluteBlockPosition, animation.to.y, animation.value);
					} else {
						//horizontal
						let progressRelation = (animation.to.y > animation.from.y) ? (animation.progress) : (100 - animation.progress);
						let blocksToMove = (Math.abs(animation.to.y - animation.from.y)) * (progressRelation) / 100;
						let absoluteBlockPosition = (animation.to.y > animation.from.y) ? (animation.from.y + blocksToMove) : (animation.to.y + blocksToMove);

						printBlock(animation.to.x, absoluteBlockPosition, animation.value);
					}

					//printa o bloco novo
					printBlock(animation.to.x, animation.to.y, animation.value);

					let size = block.size.width + 2 * block.space;

					//penultimo passo
					if (animation.progress + (3 * animationStep) >= 100) {
						printBlock(animation.to.x, animation.to.y, animation.value, size, size);
					}

					//ultimo passo
					if (animation.progress + animationStep >= 100) {

						printBlock(animation.to.x, animation.to.y, animation.value + 1, size, size);
					}
				},
				appear() {
					let size = block.size.width * animation.progress / 100;
					printBlock(animation.in.x, animation.in.y, animation.value, size, size);
				}
			}

			const begin = {
				move(animationObj) {
					state.grid[animationObj.from.x][animationObj.from.y] = 0;
				},
				join(animationObj) {
					state.grid[animationObj.from.x][animationObj.from.y] = 0;
				},
				appear(animationObj) {

				}
			}

			const finish = {
				move(animationObj) {
					state.grid[animationObj.to.x][animationObj.to.y] = animationObj.value;
				},
				join(animationObj) {
					state.grid[animationObj.to.x][animationObj.to.y] = animationObj.value + 1;
				},
				appear(animationObj) {
					state.grid[animationObj.in.x][animationObj.in.y] = animationObj.value;
				}
			}

			if (animation) {
				if (animation.progress == 0) {
					begin[animation.type](animation);
				}

				if (moves[animation.type]) {
					moves[animation.type]();
				}

				animation.progress += animationStep;

				if (animation.progress >= 100) {
					console.log(`animated ${animationsList[0].type}`);
					finish[animation.type](animation);
					animationsList.shift();
				}
			}
		}

		function printBlock(x, y, value, width = block.size.width, height = block.size.height) {
			let printParam = {
				init: {
					x: block.space + y * (block.size.width + block.space),
					y: block.space + x * (block.size.height + block.space)
				},
				size: block.size,
				textPosition: null
			}

			printParam.textPosition = {
				x: printParam.init.x + (printParam.size.width / 2),
				y: printParam.init.y + (printParam.size.height / 2)
			}

			if (value != 0) {
				screen.fillStyle = color.notEmptyBlock(value);

				printParam.init.x += (block.size.width / 2) - (width / 2);
				printParam.init.y += (block.size.height / 2) - (height / 2);

				screen.fillRect(printParam.init.x, printParam.init.y, width, height);

				screen.fillStyle = color.text;
				if (String(2 ** value).length < 3) {
					screen.font = `bold ${(2 / 3) * height}px Arial`;
					screen.fillText(String(2 ** value), printParam.textPosition.x, printParam.textPosition.y);
				} else {
					screen.font = `bold ${(2 / String(2 ** value).length) * (2 / 3) * height}px Arial`;
					screen.fillText(String(2 ** value), printParam.textPosition.x, printParam.textPosition.y);
				}
			} else {
				screen.fillStyle = color.emptyBlock;
				screen.fillRect(printParam.init.x, printParam.init.y, printParam.size.width, printParam.size.height);
			}
		}

		windowInput.requestAnimationFrame(newFrame);
	}

	return {
		stateUpdate,
		newFrame
	}
}