
const KakaoStrategy = require( 'passport-kakao' ).Strategy;

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
					users.addProviderUser( 'Kakao', info.providerID, ( sendMsg ) => {
						if ( sendMsg.code !== 'OK' ) {
							res.send( JSON.stringify( sendMsg ) );
							return;
						}
						authCommon.processLoginProvider( req, res, users.allUsers[sendMsg.uid] );
					} );
					return;
				}

				users.checkProvider( 'Kakao', req.user, info.providerID, ( sendMsg ) => {
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
		const kk = admins.credentials.Kakao;
		if ( !kk.clientID || !kk.clientSecret || !kk.callbackURL ) {
			return;
		}
		passport.use( new KakaoStrategy( {
			clientID: kk.clientID,
			clientSecret: kk.clientSecret,
			callbackURL: kk.callbackURL,
		},
		( accessToken, refreshToken, profile, done ) => {
			const providerID = profile.id.toString();
			const kakao = users.allKakaos[providerID];
			if ( kakao ) {
				kakao.accessToken	= accessToken;
				kakao.refreshToken	= refreshToken;
				kakao.profile		= profile;
				users.saveProvider( 'Kakao', providerID, done );
			} else {
				users.allKakaos[providerID] = {
					accessToken,
					refreshToken,
					profile,
				};
				done( null, null, { providerID } );
			}
		} ) );
	},
};
