'use strict';

const admins = require( './admin' );
const users = require( './user' );

//const TwitterStrategy = require( 'passport-twitter' ).Strategy;

module.exports = {

	register( passport, router ) {
		this.registerRouter( passport, router );
		this.registerStrategy( passport );
	},

	registerRouter( passport, router ) {
	},

	registerStrategy( passport ) {
	}
};
