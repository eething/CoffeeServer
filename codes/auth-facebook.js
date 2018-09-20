
const FacebookStrategy = require( 'passport-facebook' ).Strategy;

const admins = require( './admin' );
const users = require( './user' );
const authCommon = require( './auth-common' );
const convertError = require( '../lib/convert-error' );



module.exports = {

	register( passport, router ) {
		this.registerRouter( passport, router );
		this.registerStrategy( passport );
	},

	registerRouter( passport, router ) {
		//
		router.get( '/facebook', passport.authenticate( 'facebook' ) );

		router.get( '/facebook/callback', ( req, res, next ) => {
			passport.authenticate( 'facebook', ( err, user, info ) => {
				if ( err ) {
					res.send( JSON.stringify( {
						code: 'EAUTH_F',
						err: convertError( err ),
					} ) );
					return;
				}

				if ( !req.user ) {
					if ( user ) {
						authCommon.processLoginProvider( req, res, user );
						return;
					}
					users.addProviderUser( 'Facebook', info.providerID, ( sendMsg ) => {
						if ( sendMsg.code !== 'OK' ) {
							res.send( JSON.stringify( sendMsg ) );
							return;
						}
						authCommon.processLoginProvider( req, res, users.allUsers[sendMsg.uid] );
					} );
					return;
				}

				users.checkProvider( 'Facebook', req.user, info.providerID, ( sendMsg ) => {
					if ( sendMsg.code === 'OK' ) {
						const params = { isSameUser: true };
						res.render( 'auth-ok', params );
					} else if ( sendMsg.code === 'ASK' ) {
						authCommon.processProviderAsk( res, sendMsg );
					} else {
						res.send( JSON.stringify( sendMsg ) );
					}
				} );
			} )( req, res, next );
		} );

		router.post( '/facebook/associate', ( req, res ) => {
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
		const fb = admins.credentials.Facebook;
		if ( !fb.clientID || !fb.clientSecret || !fb.callbackURL ) {
			return;
		}
		passport.use( new FacebookStrategy( {
			clientID: fb.clientID,
			clientSecret: fb.clientSecret,
			callbackURL: fb.callbackURL,
			profileURL: 'https://graph.facebook.com/me?locale=ko_KR',
		},
		( accessToken, refreshToken, profile, done ) => {
			const providerID = profile.id.toString();
			const facebook = users.allFacebooks[providerID];
			if ( facebook ) {
				facebook.accessToken = accessToken;
				facebook.refreshToken = refreshToken;
				facebook.profile = profile;
				users.saveProvider( 'Facebook', providerID, done );
			} else {
				users.allFacebooks[providerID] = {
					accessToken,
					refreshToken,
					profile,
				};
				done( null, null, { providerID } );
			}
		} ) );
	},
};
