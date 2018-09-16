'use strict';

const users			= require( './user' );
const beverages		= require( './beverage' );
const orders		= require( './order' );
const convertError	= require( '../lib/convert-error' );
const checkAuth = require( '../lib/check-auth' );

module.exports = {

	register( passport, router ) {
		this.registerRouter( passport, router );
		this.registerStrategy( passport );
	},

	registerRouter( passport, router ) {

		router.get( '/list', ( req, res ) => {
			if( checkAuth( req, res ) ) {
				return;
			}

			this.sendAllData( res, { code: 'OK' } );
		} );
	},

	registerStrategy( passport ) {

		passport.serializeUser( function ( user, done ) {
			done( null, user.uid );
		} );

		passport.deserializeUser( function ( uid, done ) {
			const user = users.allUsers[uid];
			let err = '';
			if( !user ) {
				err = `CANNOT deserializeUser: ${uid}`;
			}
			done( err, user );
		} );
	},

	sendAllData( res, sendMsg ) {
		sendMsg.allUsers = users.getUserList();
		sendMsg.allBeverages = beverages.allBeverages;
		orders.getCurrentOrder( currentOrder => {
			sendMsg.currentOrder = currentOrder;
			res.send( JSON.stringify( sendMsg ) );
		} );
	},

	processLogin( req, res, user ) {

		const sendMsg = {};

		req.login( user, err => {
			if( err ) {
				sendMsg.code = 'ELOGIN';
				sendMsg.err = convertError( err );
				res.send( JSON.stringify( sendMsg ) );
				return;
			}
			req.session.save( err => {
				if( err ) {
					console.log( `ERROR: Login - Session Save, ${err}...` );
					sendMsg.code = 'ESS';
					sendMsg.err = convertError( err );
				} else {
					sendMsg.code = 'OK';
					sendMsg.uid = user.uid;
					sendMsg.name = user.name;
					sendMsg.admin = user.admin;
					sendMsg.id = users.getAuthID( 'local', user ); // users.authTable[ user.uid ].local;
				}

				this.sendAllData( res, sendMsg );
			} ); // save
		} ); // login
	}
};
