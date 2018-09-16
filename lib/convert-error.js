'use strict';

module.exports = err => {
	return {
		name: err.name,
		message: err.messsage,
		stack: err.stack
	};
};
