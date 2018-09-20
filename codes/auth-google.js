
const GoogleStrategy = require( 'passport-google-oauth' ).OAuth2Strategy;

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
		router.get( '/google', passport.authenticate( 'google',
			{ scope: ['https://www.googleapis.com/auth/plus.login'] } ) );

		router.get( '/google/callback', ( req, res, next ) => {
			passport.authenticate( 'google', ( err, user, info ) => {
				authCommon.processAuthenticate( req, res, 'Google', err, user, info );
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
		// TODO - registered
		const gg = admins.credentials.Google;
		if ( !gg.clientID || !gg.clientSecret || !gg.callbackURL ) {
			return;
		}
		passport.use( new GoogleStrategy( {
			clientID: gg.clientID,
			clientSecret: gg.clientSecret,
			callbackURL: gg.callbackURL,
		}, authCommon.makeStrategy( 'Google' ) ) );
	},
};
