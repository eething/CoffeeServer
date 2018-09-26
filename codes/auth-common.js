
const users			= require( './user' );
const beverages		= require( './beverage' );
const orders		= require( './order' );
const shuttles		= require( './shuttle' );
const convertError	= require( '../lib/convert-error' );
const checkAuth		= require( '../lib/check-auth' );

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

			this.collectAllData( req.user.admin, ( sendMsg ) => {
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

	collectAllData( admin, callback ) {
		const sendMsg = { code: 'OK' };
		sendMsg.allUsers = users.getUserList( admin );
		sendMsg.allBeverages = beverages.allBeverages;
		orders.getCurrentOrder( ( co ) => {
			sendMsg.currentOrder = co;

			shuttles.getTodayShuttle( false, ( err, data ) => {
				if ( err ) {
					sendMsg.err = convertError( err );
				}
				sendMsg.shuttleList = data;
				callback( sendMsg );
			} );
		} );
	},

	onSuccessLogin( user, callback ) {
		this.collectAllData( user.admin, ( sendMsg ) => {
			sendMsg.uid = user.uid;
			sendMsg.name = user.name;
			sendMsg.admin = user.admin;
			sendMsg.id = users.getAuthID( 'Local', user );

			callback( sendMsg );
		} );
	},

	// Local
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

	processAuthenticate( req, res, Provider, err, user, info ) {
		if ( err ) {
			res.send( JSON.stringify( {
				code: 'EAUTH_F',
				err: convertError( err ),
			} ) );
			return;
		}

		if ( !req.user ) {
			if ( user ) {
				this.processLoginProvider( req, res, user );
				return;
			}
			users.addProviderUser( Provider, info.providerID, ( sendMsg ) => {
				if ( sendMsg.code !== 'OK' ) {
					res.send( JSON.stringify( sendMsg ) );
					return;
				}
				this.processLoginProvider( req, res, users.allUsers[sendMsg.uid] );
			} );
			return;
		}

		users.checkProvider( Provider, req.user, info.providerID, ( sendMsg ) => {
			if ( sendMsg.code === 'OK' ) {
				const params = { isSameUser: true };
				res.render( 'auth-ok', params );
			} else if ( sendMsg.code === 'ASK' ) {
				this.processProviderAsk( res, sendMsg );
			} else {
				res.send( JSON.stringify( sendMsg ) );
			}
		} );
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

	makeStrategy( Provider ) {
		return ( accessToken, refreshToken, profile, done ) => {
			const providerID = profile.id.toString();
			const allProviders = users.getAllProvider( Provider );
			const prov = allProviders[providerID];
			if ( prov ) {
				prov.accessToken	= accessToken;
				prov.refreshToken	= refreshToken;
				prov.profile		= profile;
				users.saveProvider( Provider, providerID, done );
			} else {
				allProviders[providerID] = {
					accessToken,
					refreshToken,
					profile,
				};
				done( null, null, { providerID } );
			}
		};
	},
};
