import mapping from './mapping.js'

//Exibição
export default function newGraphicCanvas(windowInput, canvasId) {
	//desenhar um novo frame na tela
	// const canvas = window.document.getElementById("gameScreen");
	const canvas = windowInput.document.getElementById(canvasId);
	const screen = canvas.getContext("2d");

	const state = {
		size: 0,
		grid: []
	}

	function stateUpdate(gameStateObj) {
		state.size = gameStateObj.size;
		state.grid = gameStateObj.grid;
	}

	//chama a newFrame pela primeira vez
	//newFrame();

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

		//window.requestAnimationFrame(newFrame);
		windowInput.requestAnimationFrame(newFrame);
	}

	return {
		stateUpdate,
		newFrame
	}
}