
const GoogleStrategy = require( 'passport-google-oauth' ).OAuth2Strategy;

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
		router.get( '/google', passport.authenticate( 'google',
			{ scope: ['https://www.googleapis.com/auth/plus.login'] } ) );

		router.get( '/google/callback', ( req, res, next ) => {
			passport.authenticate( 'google', ( err, user, info ) => {
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
					users.addProviderUser( 'Google', info.providerID, ( sendMsg ) => {
						if ( sendMsg.code !== 'OK' ) {
							res.send( JSON.stringify( sendMsg ) );
							return;
						}
						authCommon.processLoginProvider( req, res, user );
					} );
					return;
				}

				users.checkFacebook( 'Google', req.user, info.providerID, ( sendMsg ) => {
					res.send( JSON.stringify( sendMsg ) );
				} );
			} )( req, res, next );
		} );

		router.post( '/google/associate', ( req, res ) => {
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
		const gg = admins.credentials.Google;
		if ( !gg.clientID || !gg.clientSecret || !gg.callbackURL ) {
			return;
		}
		passport.use( new GoogleStrategy( {
			clientID: gg.clientID,
			clientSecret: gg.clientSecret,
			callbackURL: gg.callbackURL,
		},
		( accessToken, refreshToken, profile, done ) => {
			const providerID = profile.id;

			const facebook = users.allGoogles[providerID];
			if ( facebook ) {
				facebook.accessToken = accessToken;
				facebook.refreshToken = refreshToken;
				facebook.profile = profile;
				users.saveProvider( 'Google', providerID, done );
			} else {
				users.allGoogles[providerID] = {
					accessToken,
					refreshToken,
					profile,
				};
				done( null, null, { providerID } );
			}
		} ) );
	},
};
