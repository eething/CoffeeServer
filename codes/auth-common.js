
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

		passport.serializeUser( ( user, done ) => {
			done( null, user.uid );
		} );

		passport.deserializeUser( ( uid, done ) => {
			const user = users.allUsers[uid];
			let err = '';
			if ( !user ) {
				err = `CANNOT deserializeUser: ${uid}`;
			}
			done( err, user );
		} );
	},

	onSuccessLogin( res, user, sendMsg ) {
		sendMsg.code = 'OK';
		sendMsg.uid = user.uid;
		sendMsg.name = user.name;
		sendMsg.admin = user.admin;
		sendMsg.id = users.getAuthID( 'local', user );

		sendMsg.allUsers = users.getUserList();
		sendMsg.allBeverages = beverages.allBeverages;
		orders.getCurrentOrder( ( currentOrder ) => {
			sendMsg.currentOrder = currentOrder;
			res.send( JSON.stringify( sendMsg ) );
		} );
	},

	processLogin( req, res, user ) {
		const sendMsg = {};

		req.login( user, ( error ) => {
			if ( error ) {
				sendMsg.code = 'ELOGIN';
				sendMsg.err = convertError( error );
				res.send( JSON.stringify( sendMsg ) );
				return;
			}
			req.session.save( ( err ) => {
				if ( err ) {
					console.log( `ERROR: Login - Session Save, ${err}...` );
					sendMsg.code = 'ESS';
					sendMsg.err = convertError( err );
					res.send( JSON.stringify( sendMsg ) );
				} else {
					this.onSuccessLogin( res, user, sendMsg );
				}
			} ); // save
		} ); // login
	},
};
