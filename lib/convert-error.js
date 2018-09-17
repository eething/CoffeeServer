
module.exports = err => ( {
	name: err.name,
	message: err.messsage,
	stack: err.stack,
} );
