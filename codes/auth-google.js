
const GoogleStrategy = require( 'passport-google-oauth' ).OAuth2Strategy;

const admins = require( './admin' );
const users = require( './user' );

// const GoogleStrategy = require( 'passport-google' ).Strategy;

module.exports = {

	register( passport, router ) {
		this.registerRouter( passport, router );
		this.registerStrategy( passport );
	},

	registerRouter( passport, router ) {
		router.get( '/google', passport.authenticate( 'google',
			{ scope: ['https://www.googleapis.com/auth/plus.login'] } ) );

		router.get( '/google/callback',
			passport.authenticate( 'google',
				( req, res ) => {

				} ) );
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
			done( null, null );
		} ) );
	},
};
