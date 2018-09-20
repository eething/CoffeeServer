
const FacebookStrategy = require( 'passport-facebook' ).Strategy;

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
		router.get( '/facebook', passport.authenticate( 'facebook' ),
			{ scope: 'user_posts' } );

		router.get( '/facebook/callback', ( req, res, next ) => {
			passport.authenticate( 'facebook', ( err, user, info ) => {
				authCommon.processAuthenticate( req, res, 'Facebook', err, user, info );
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
		// TODO - registered
		const fb = admins.credentials.Facebook;
		if ( !fb.clientID || !fb.clientSecret || !fb.callbackURL ) {
			return;
		}
		passport.use( new FacebookStrategy( {
			clientID: fb.clientID,
			clientSecret: fb.clientSecret,
			callbackURL: fb.callbackURL,
			profileURL: 'https://graph.facebook.com/me?locale=ko_KR',
		}, authCommon.makeStrategy( 'Facebook' ) ) );
	},
};
