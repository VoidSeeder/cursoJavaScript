import mapping from './mapping.js'

export default function startGame(initialSize) {
	//cria a matriz
	let game = {
		size: initialSize,
		grid: new Array(initialSize),
		score: 0,
		observers: []
	}

	let previousState = {
		grid: new Array(initialSize),
		score: 0
	};

	function subscribe(observerFunction) {
		game.observers.push(observerFunction);
		observerFunction({ size: game.size, grid: game.grid, score: game.score });
	}

	function notifyAll(command) {
		for (const observerFunction of game.observers) {
			observerFunction(command);
		}
	}

	function resize(newSize) {
		game.size = newSize;
		game.score = 0;
		game.grid = new Array(game.size);
		previousState.grid = new Array(game.size);
		previousState.score = 0;

		for (let position = 0; position < game.size; position++) {
			game.grid[position] = new Array(game.size);
			game.grid[position].fill(0);

			previousState.grid[position] = new Array(game.size);
			previousState.grid[position].fill(0);
		}

		newBlock(game);
		newBlock(game);

		notifyAll({ size: game.size, grid: game.grid, score: game.score });
	}

	function move(input) {
		let hasUpdated = false;
		let firstMove = true;

		if (input == 'backspace') {
			for (let line in game.grid) {
				for (let column in game.grid[line]) {
					game.grid[line][column] = previousState.grid[line][column];
				}
			}

			game.score = previousState.score;

			notifyAll({ size: game.size, grid: game.grid, score: game.score });
		}

		function saveState() {
			for (let line in game.grid) {
				for (let column in game.grid[line]) {
					previousState.grid[line][column] = game.grid[line][column];
				}
			}

			previousState.score = game.score;
		}

		stackUp(input);
		join(input);
		stackUp(input);

		function swapBlocks(x1, y1, x2, y2) {
			if (firstMove) {
				saveState();
				firstMove = false;
				hasUpdated = true;
			}

			const aux = game.grid[x1][y1];
			game.grid[x1][y1] = game.grid[x2][y2];
			game.grid[x2][y2] = aux;

			notifyAll({
				size: game.size, grid: game.grid, score: game.score,
				type: 'move', from: { x: x2, y: y2 }, to: { x: x1, y: y1 }
			});
		}

		function joinBlocks(xIn, yIn, xErase, yErase) {
			if (firstMove) {
				saveState();
				firstMove = false;
				hasUpdated = true;
			}

			game.grid[xIn][yIn] += 1;
			game.grid[xErase][yErase] = 0;
			game.score += 2 ** game.grid[xIn][yIn];

			notifyAll({
				size: game.size, grid: game.grid, score: game.score,
				type: 'join', to: { x: xIn, y: yIn }, from: { x: xErase, y: yErase }
			});
		}

		if (hasUpdated) {
			const position = newBlock(game);
			notifyAll({
				size: game.size, grid: game.grid, score: game.score,
				type: 'appear', in: { x: position.x, y: position.y }
			});
		}

		function stackUp(direction) {
			const stackFunctions = {
				up() {
					let position = 0;

					for (let line in game.grid) {
						if (Number(line) - 1 < 0) {
							continue;
						}

						for (let column in game.grid[line]) {
							position = Number(line);

							if (game.grid[position][column] == 0) {
								continue;
							}

							while (position > 0) {
								if (game.grid[position - 1][column] == 0) {
									swapBlocks(position - 1, column, position, column);
									position -= 1;
								} else {
									break;
								}
							}
						}
					}
				},
				down() {
					let position = 0;

					for (let line in game.grid) {
						if (Number(line) == 0) {
							continue
						}

						for (let column in game.grid[line]) {
							position = game.size - 1 - Number(line);

							if (game.grid[position][column] == 0) {
								continue;
							}

							while (position < game.size - 1) {
								if (game.grid[position + 1][column] == 0) {
									swapBlocks(position + 1, column, position, column);
									position += 1;
								} else {
									break;
								}
							}
						}
					}
				},
				right() {
					let position = 0;

					for (let line in game.grid) {
						for (let column in game.grid[line]) {
							if (Number(column) == 0) {
								continue;
							}

							position = game.size - 1 - Number(column);

							if (game.grid[line][position] == 0) {
								continue;
							}

							while (position < game.size - 1) {
								if (game.grid[line][position + 1] == 0) {
									swapBlocks(line, position + 1, line, position);
									position += 1;
								} else {
									break;
								}
							}
						}
					}
				},
				left() {
					let position = 0;

					for (let line in game.grid) {
						for (let column in game.grid[line]) {
							if (Number(column) - 1 < 0) {
								continue;
							}

							position = Number(column);

							if (game.grid[line][position] == 0) {
								continue;
							}

							while (position > 0) {
								if (game.grid[line][position - 1] == 0) {
									swapBlocks(line, position - 1, line, position);
									position -= 1;
								} else {
									break;
								}
							}
						}
					}
				}
			}

			if (stackFunctions[direction]) {
				return stackFunctions[direction]();
			}
		}

		function join(direction) {
			const joinFunctions = {
				up() {
					let next = 0;

					for (let line in game.grid) {
						next = Number(line) + 1;

						if (next == game.size) {
							break;
						}

						for (let column in game.grid[line]) {
							if (game.grid[line][column] == 0) {
								continue;
							}

							if (game.grid[line][column] == game.grid[next][column]) {
								joinBlocks(line, column, next, column);
							}
						}
					}
				},
				down() {
					let next = 0;
					let position = 0;

					for (let line in game.grid) {
						position = game.size - 1 - Number(line);
						next = position - 1;

						if (next < 0) {
							break;
						}

						for (let column in game.grid[line]) {
							if (game.grid[position][column] == 0) {
								continue;
							}

							if (game.grid[position][column] == game.grid[next][column]) {
								joinBlocks(position, column, next, column);
							}
						}
					}
				},
				right() {
					let next = 0;
					let position = 0;

					for (let line in game.grid) {
						for (let column in game.grid[line]) {
							position = game.size - 1 - Number(column);
							next = position - 1;

							if (next < 0) {
								break;
							}

							if (game.grid[line][position] == 0) {
								continue;
							}

							if (game.grid[line][position] == game.grid[line][next]) {
								joinBlocks(line, position, line, next);
							}
						}
					}
				},
				left() {
					let next = 0;

					for (let line in game.grid) {
						for (let column in game.grid[line]) {
							next = Number(column) + 1;

							if (next == game.size) {
								break;
							}

							if (game.grid[line][column] == 0) {
								continue;
							}

							if (game.grid[line][column] == game.grid[line][next]) {
								joinBlocks(line, column, line, next);
							}
						}
					}
				}
			}

			if (joinFunctions[direction]) {
				return joinFunctions[direction]();
			}
		}
	}

	return {
		subscribe,
		resize,
		move
	};
}

function newBlock(gameObj) {
	//escolher uma posição vazia (= 0)
	const position = sortEmptyBlock(gameObj);

	//sortear um numero para a posição (1 ou 2)
	if (position) {
		//logica para 10% de chance de surgir um 4
		if (sortNewValue(0, 10) < 9) {
			gameObj.grid[position.x][position.y] = 1;
		} else {
			gameObj.grid[position.x][position.y] = 2;
		}

		return position;
	}
}

function sortEmptyBlock(gameObj) {
	const position = { x: 0, y: 0 };

	if (hasEmptyBlocks(gameObj.grid)) {
		do {
			position.x = sortNewValue(0, gameObj.size);
			position.y = sortNewValue(0, gameObj.size);

		} while (gameObj.grid[position.x][position.y] != 0);

		return position;
	} else {
		return null;
	}
}

function hasEmptyBlocks(matrice) {
	for (let line in matrice) {
		for (let column in matrice) {
			if (matrice[line][column] == 0) {
				return true;
			}
		}
	}

	return false;
}

function sortNewValue(min, max) {
	return Math.floor(mapping(Math.random(), 0, 1, min, max));
}