import mapping from './mapping.js'

export default function startGame(initialSize) {
	//cria a matriz
	let game = {
		size: initialSize,
		grid: new Array(initialSize),
		observers: []
	}

	let previousState = {
		grid: new Array(initialSize)
	};

	function subscribe(observerFunction) {
		game.observers[0] = observerFunction;
		observerFunction({ size: game.size, grid: game.grid });
	}

	function notifyAll(command) {
		for (const observerFunction of game.observers) {
			observerFunction(command);
		}
	}

	function resize(newSize) {
		game.size = newSize;
		game.grid = new Array(game.size);
		previousState.grid = new Array(game.size);

		for (let position = 0; position < game.size; position++) {
			game.grid[position] = new Array(game.size);
			game.grid[position].fill(0);

			previousState.grid[position] = new Array(game.size);
			previousState.grid[position].fill(0);
		}

		newBlock(game);
		newBlock(game);

		notifyAll({ size: game.size, grid: game.grid });
	}

	resize(initialSize);

	function move(input) {
		let hasUpdated = false;

		if (input == 'backspace') {
			for (let line in game.grid) {
				for (let column in game.grid[line]) {
					game.grid[line][column] = previousState.grid[line][column];
				}
			}

			notifyAll({ size: game.size, grid: game.grid });
		}

		for (let line in game.grid) {
			for (let column in game.grid[line]) {
				previousState.grid[line][column] = game.grid[line][column];
			}
		}

		hasUpdated |= stackUp(input);
		hasUpdated |= join(input);
		hasUpdated |= stackUp(input);

		if (hasUpdated) {
			newBlock(game);
			notifyAll({ size: game.size, grid: game.grid });
		}

		function stackUp(direction) {
			const stackFunctions = {
				up() {
					let position = 0;
					let changed = false;

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
									game.grid[position - 1][column] = game.grid[position][column];
									game.grid[position][column] = 0;
									changed = true;
									position -= 1;
								} else {
									break;
								}
							}
						}
					}

					return changed;
				},
				down() {
					let position = 0;
					let changed = false;

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
									game.grid[position + 1][column] = game.grid[position][column];
									game.grid[position][column] = 0;
									changed = true;
									position += 1;
								} else {
									break;
								}
							}
						}
					}

					return changed;
				},
				right() {
					let position = 0;
					let changed = false;

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
									game.grid[line][position + 1] = game.grid[line][position];
									game.grid[line][position] = 0;
									changed = true;
									position += 1;
								} else {
									break;
								}
							}
						}
					}

					return changed;
				},
				left() {
					let position = 0;
					let changed = false;

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
									game.grid[line][position - 1] = game.grid[line][position];
									game.grid[line][position] = 0;
									changed = true;
									position -= 1;
								} else {
									break;
								}
							}
						}
					}

					return changed;
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
					let changed = false;

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
								game.grid[line][column] += 1;
								game.grid[next][column] = 0;
								changed = true;
							}
						}
					}

					return changed;
				},
				down() {
					let next = 0;
					let position = 0;
					let changed = false;

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
								game.grid[position][column] += 1;
								game.grid[next][column] = 0;
								changed = true;
							}
						}
					}

					return changed;
				},
				right() {
					let next = 0;
					let position = 0;
					let changed = false;

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
								game.grid[line][position] += 1;
								game.grid[line][next] = 0;
								changed = true;
							}
						}
					}

					return changed;
				},
				left() {
					let next = 0;
					let changed = false;

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
								game.grid[line][column] += 1;
								game.grid[line][next] = 0;
								changed = true;
							}
						}
					}

					return changed;
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