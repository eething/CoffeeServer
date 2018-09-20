
const KakaoStrategy = require( 'passport-kakao' ).Strategy;

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
		router.get( '/kakao', passport.authenticate( 'kakao',
			{ state: 'myStateValue' } ) );

		/*
		router.get( '/kakao/callback',
		 	passport.authenticate('kakao'), function(req, res) {
		    // 로그인 시작시 state 값을 받을 수 있음
		    res.send("state :" + req.query.state);
		});
		*/
		router.get( '/kakao/callback', ( req, res, next ) => {
			passport.authenticate( 'kakao', ( err, user, info ) => {
				authCommon.processAuthenticate( req, res, 'Kakao', err, user, info );
			} )( req, res, next );
		} );

		router.post( '/kakao/associate', ( req, res ) => {
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
		const kk = admins.credentials.Kakao;
		if ( !kk.clientID || !kk.clientSecret || !kk.callbackURL ) {
			return;
		}
		passport.use( new KakaoStrategy( {
			clientID: kk.clientID,
			clientSecret: kk.clientSecret,
			callbackURL: kk.callbackURL,
		}, authCommon.makeStrategy( 'Kakao' ) ) );
	},
};
