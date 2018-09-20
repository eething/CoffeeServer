
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
		//
		router.get( '/list', ( req, res ) => {
			if ( checkAuth( req, res ) ) {
				return;
			}

			this.collectAllData( ( sendMsg ) => {
				res.send( JSON.stringify( sendMsg ) );
			} );
		} );

		router.post( '/associate', ( req, res ) => {
			if ( !req.user ) {
				res.send( JSON.stringify( {
					code: 'EAUTH',
					err: 'You must login.',
				} ) );
				return;
			}

			users.associateProvider( req.user, req.body, ( sendMsg ) => {
				res.send( JSON.stringify( sendMsg ) );
			} );
		} );
	},

	registerStrategy( passport ) {
		//
		passport.serializeUser( ( user, done ) => {
			done( null, user.uid );
		} );
		// TODO - desrialize 실패시 세션삭제, 에러페이지 보이기?
		passport.deserializeUser( ( uid, done ) => {
			const user = users.allUsers[uid];
			let err = '';
			if ( !user ) {
				err = `CANNOT deserializeUser: ${uid}`;
			}
			done( err, user );
		} );
	},

	collectAllData( callback ) {
		const sendMsg = { code: 'OK' };
		sendMsg.allUsers = users.getUserList();
		sendMsg.allBeverages = beverages.allBeverages;
		orders.getCurrentOrder( ( co ) => {
			sendMsg.currentOrder = co;
			callback( sendMsg );
		} );
	},

	onSuccessLogin( user, callback ) {
		this.collectAllData( ( sendMsg ) => {
			sendMsg.uid = user.uid;
			sendMsg.name = user.name;
			sendMsg.admin = user.admin;
			sendMsg.id = users.getAuthID( 'Local', user );

			callback( sendMsg );
		} );
	},

	processLogin( req, res, user ) {
		req.login( user, ( error ) => {
			if ( error ) {
				res.send( JSON.stringify( { code: 'ELOGIN', err: convertError( error ) } ) );
				return;
			}
			req.session.save( ( err ) => {
				if ( err ) {
					res.send( JSON.stringify( { code: 'ESS', err: convertError( err ) } ) );
				} else {
					this.onSuccessLogin( user, ( sendMsg ) => {
						res.send( JSON.stringify( sendMsg ) );
					} );
				}
			} ); // save
		} ); // login
	},

	processLoginProvider( req, res, user ) {
		req.login( user, ( error ) => {
			if ( error ) {
				res.send( JSON.stringify( { code: 'ELOGIN', err: convertError( error ) } ) );
				return;
			}
			req.session.save( ( err ) => {
				if ( err ) {
					res.send( JSON.stringify( { code: 'ESS', err: convertError( err ) } ) );
					return;
				}
				const params = {
					loginName: user.name,
					loginUID: user.uid,
					loginID: users.getAuthID( 'Local', user.uid ),
					loginType: user.admin ? 'admin' : 'user',
				};
				res.render( 'auth-ok', params );
			} ); // save
		} ); // login
	},

	processProviderAsk( res, sendMsg ) {
		const params = {
			Provider: sendMsg.Provider,
			providerName: sendMsg.providerName,
			currentName: sendMsg.currentName,
			deleteName: sendMsg.deleteName,
			providerID: sendMsg.providerID,
			askValue: sendMsg.askValue,
			askDelete: sendMsg.askDelete,
		};
		res.render( 'auth-ask', params );
	},
};
