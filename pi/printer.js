const async = require('async');
const getPixels = require('get-pixels');

const rgbToHsl = function (r, g, b) {
	// bound values from 0 to 1
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = (max + min) / 2;
	let s = (max + min) / 2;
	let l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return [h, s, l];
};

const Printer = class {
	constructor(options) {
		// Max printing dots (0-255), unit: (n+1)*8 dots, default: 7 ((7+1)*8 = 64 dots)
		this.maxPrintingDots = options.maxPrintingDots || 7;
		/* The more max heating dots, the more peak current will cost when printing,
		 * the faster printing speed. The max heating dots is 8*(n+1).
		 */

		// Heating time (3-255), unit: 10µs, default: 80 (800µs)
		this.heatingTime = options.heatingTime || 80;
		/* The more heating time, the more density, but the slower printing speed.
		 * If heating time is too short, blank page may occur.
		 */

		// Heating interval (0-255), unit: 10µs, default: 2 (20µs)
		this.heatingInterval = options.heatingInterval || 2;
		/* The more heating interval, the more clear, but the slower printing speed.
		 */

		// baudrate for the printer default: 19200
		this.baudrate = options.baudrate || 19200;

		/* can be found by doing a print test. hold the button printer while
		 * powering the printer on and it should spit out some shit at the
		 * bottom is it should say the baudrate
		 */
		this.uart;

		// command queue
		this.commands = [];

		// printmode bytes (normal by default)
		this.printMode = 0; // rename to mode
	}

	init(port) {
		return new Promise((resolve, reject) => {
			let uart = undefined;
			if (port.UART) {
				let uart = new port.UART({
					baudrate: this.baudrate
				});
			} else {
				uart = port;
			}

			if (!uart.write) {
				reject('UART must have a write function');
			}

			this.uart = uart;

			this.reset();

			this.print()
				.then(function () {
					resolve();
				})
				.catch(function (error) {
					reject(error);
				});
		});
	}

	reset() {
		this.write(27);
		this.write(64);

		// set params
		this.write(27);
		this.write(55);

		this.write(this.maxPrintingDots);
		this.write(this.heatingTime);
		this.write(this.heatingInterval);
	}

	print() {
		let _self = this;

		return new Promise((resolve, reject) => {
			async.eachSeries(
				_self.commands,
				function (byte, callback) {
					_self.uart.write(byte, (error, byte) => {
						if (error) {
							return callback(error);
						} else {
							callback();
						}
					});
				},
				function (error) {
					_self.commands = [];
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				}
			);
		});
	}

	write(command) {
		let buffer;
		if (!Buffer.isBuffer(command)) {
			buffer = new Buffer(1);
			buffer.writeUInt8(command, 0);
		} else {
			buffer = command;
		}

		this.commands.push(buffer);
	}

	setBold(onOff) {
		if (onOff) {
			this.removePrintMode(56);
		} else {
			this.addPrintMode(56);
		}
	}

	writeLine(text) {
		let _self = this;

		const characters = new Buffer(text);

		characters.forEach(function (character) {
			_self.write(character);
		});

		this.write(10);
	}

	addPrintMode(mode) {
		this.printMode |= mode;

		this.write(27);
		this.write(33);
		this.write(this.printMode);
	}

	removePrintMode(mode) {
		this.printMode &= ~mode;
		this.write(27);
		this.write(33);
		this.write(this.printMode);
	}

	lineFeed(lines) {
		this.write(27);
		this.write(100);
		this.write(lines);
	}

	writeImage(path) {
		let _self = this;

		return new Promise(function (resolve, reject) {
			getPixels(path, function (error, pixels) {
				if (error) {
					return reject(error);
				}
				const width = pixels.shape[0];
				const height = pixels.shape[1];
				if (width != 384 || height > 65635) {
					return reject(
						'Image width must be 384px, height cannot exceed 65635px.'
					);
				}

				// contruct an array of Uint8Array,
				// each Uint8Array contains 384/8 pixel samples, corresponding to a whole line
				const data = [];

				for (let y = 0; y < height; y++) {
					data[y] = new Uint8Array(width / 8);
					for (let x = 0; x < width / 8; x++) {
						data[y][x] = 0;

						for (let n = 0; n < 8; n++) {
							const r = pixels.get(x * 8 + n, y, 0);
							const g = pixels.get(x * 8 + n, y, 1);
							const b = pixels.get(x * 8 + n, y, 2);

							const brightness = rgbToHsl(r, g, b)[2];

							if (brightness < 0.6) {
								data[y][x] += 1 << n;
							}
						}
					}
				}

				_self.write(18);
				_self.write(118);
				_self.write(height & 255);
				_self.write(height >> 8);

				for (let y = 0; y < data.length; y++) {
					for (let x = 0; x < width / 8; x++) {
						_self.write(data[y][x]);
					}
				}

				resolve(_self);
			});
		});
	}
};

module.exports = Printer;