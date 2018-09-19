
const TwitterStrategy = require( 'passport-twitter' ).Strategy;

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
		router.get( '/twitter', passport.authenticate( 'twitter' ) );

		router.get( '/twitter/callback', ( req, res, next ) => {
			passport.authenticate( 'twitter', ( err, user, info ) => {
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
					users.addProviderUser( 'Twitter', info.providerID, ( sendMsg ) => {
						if ( sendMsg.code !== 'OK' ) {
							res.send( JSON.stringify( sendMsg ) );
							return;
						}
						authCommon.processLoginProvider( req, res, users.allUsers[sendMsg.uid] );
					} );
					return;
				}

				users.checkProvider( 'Twitter', req.user, info.providerID, ( sendMsg ) => {
					res.render( 'auth-ask', sendMsg );
					// res.send( JSON.stringify( sendMsg ) );
				} );
			} )( req, res, next );
		} );

		router.post( '/twitter/associate', ( req, res ) => {
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
		const tt = admins.credentials.Twitter;
		if ( !tt.clientID || !tt.clientSecret || !tt.callbackURL ) {
			return;
		}
		passport.use( new TwitterStrategy( {
			consumerKey: tt.clientID,
			consumerSecret: tt.clientSecret,
			callbackURL: tt.callbackURL,
		},
		( token, tokenSecret, profile, done ) => {
			const providerID = profile.id;
			const twitter = users.allTwitters[providerID];
			if ( twitter ) {
				twitter.token		= token;
				twitter.tokenSecret	= tokenSecret;
				twitter.profile		= profile;
				users.saveProvider( 'Twitter', providerID, done );
			} else {
				users.allTwitters[providerID] = {
					token,
					tokenSecret,
					profile,
				};
				done( null, null, { providerID } );
			}
		} ) );
	},
};
