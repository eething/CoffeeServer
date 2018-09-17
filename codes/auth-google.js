
const admins = require( './admin' );
const users = require( './user' );

// const GoogleStrategy = require( 'passport-google' ).Strategy;

module.exports = {

	register( passport, router ) {
		this.registerRouter( passport, router );
		this.registerStrategy( passport );
	},

	registerRouter( passport, router ) {
	},

	registerStrategy( passport ) {
	},
};
