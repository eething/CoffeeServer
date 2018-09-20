
const TwitterStrategy = require( 'passport-twitter' ).Strategy;

const admins = require( './admin' );
const users = require( './user' );
const authCommon = require( './auth-common' );
// const convertError = require( '../lib/convert-error' );



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
				authCommon.processAuthenticate( req, res, 'Twitter', err, user, info );
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
		// TODO - registered
		const tt = admins.credentials.Twitter;
		if ( !tt.clientID || !tt.clientSecret || !tt.callbackURL ) {
			return;
		}
		passport.use( new TwitterStrategy( {
			consumerKey: tt.clientID,
			consumerSecret: tt.clientSecret,
			callbackURL: tt.callbackURL,
		}, authCommon.makeStrategy( 'Twitter' ) ) );
	},
};
