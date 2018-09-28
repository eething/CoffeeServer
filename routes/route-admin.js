
const express = require( 'express' );

const admins = require( '../codes/admin' );
const users = require( '../codes/user' );
const checkAuth = require( '../lib/check-auth' );
const checkLoaded = require( '../lib/check-loaded' );

const router = express.Router();

router.get( '/', ( req, res ) => {
	const params = {};
	/*
	if( req.user ) {
		params.loginName = req.user.name;
		params.loginUID = req.user.uid ];
		params.loginID = users.authTable[ req.user.uid ].local;
		if( req.user.admin ) {
			params.loginType = 'admin';
		} else {
			params.loginType = 'user';
		}
	}
	*/
	res.render( 'admin', params );
} );

router.post( '/', ( req, res ) => {
	if ( checkAuth( req, res, 'admin' ) ) {
		return;
	}
	admins.setProvider( req.body, ( sendMsg ) => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );


const makeProviders = ( Provider ) => {
	const temp = {};
	const allProviders = users.getAllProvider( Provider );
	Object.keys( allProviders ).forEach( ( providerID ) => {
		const prov = allProviders[providerID];
		temp[providerID] = { uid: prov.uid };
		if ( Provider !== 'Local' ) {
			temp[providerID].name = prov.profile.displayName;
		}
	} );
	return temp;
};

router.get( '/adminList', ( req, res ) => {
	if ( checkAuth( req, res, 'admin' ) ) {
		return;
	}

	res.send( JSON.stringify( {
		code: 'OK',
		credentials: admins.credentials,
		allLocals: makeProviders( 'Local' ),
		allFacebooks: makeProviders( 'Facebook' ),
		allGoogles: makeProviders( 'Google' ),
		allKakaos: makeProviders( 'Kakao' ),
		allTwitters: makeProviders( 'Twitter' ),
	} ) );
} );

function changeProvider( Provider, providerID, uidChanged, callback ) {
	const prov = users.getProvider( Provider, providerID );
	const uidOld = prov.uid;

	if ( Provider === 'Local' && uidOld === 0 ) {
		callback();
		return;
	}

	users.setAuthID( Provider, uidOld, undefined );
	users.setAuthID( Provider, uidChanged, providerID );

	prov.uid = Number( uidChanged );
	users.writeProvider( Provider, providerID, ( sendMsg ) => {
		if ( sendMsg.code !== 'OK' ) {
			callback( sendMsg );
			return;
		}

		const userChanged = users.allUsers[uidChanged];
		if ( userChanged ) {
			userChanged.uid = Number( uidChanged );
		} else {
			this.allUsers[uidChanged] = {
				uid: Number( uidChanged ),
			};
			if ( uidChanged > users.maxUID ) {
				users.maxUID = Number( uidChanged );
			}
		}

		users.writeUser( uidChanged, ( sendMsg2 ) => {
			if ( sendMsg.code !== 'OK' ) {
				callback( sendMsg2 );
				return;
			}
			callback();
		} );
	} );
}

router.post( '/auth', ( req, res ) => {
	if ( checkAuth( req, res, 'admin' ) ) {
		return;
	}

	const checker = checkLoaded( Object.keys( req.body ).length, ( err ) => {
		if ( err ) {
			return;
		}
		res.send( JSON.stringify( {
			code: 'OK',
			allLocals: makeProviders( 'Local' ),
			allFacebooks: makeProviders( 'Facebook' ),
			allGoogles: makeProviders( 'Google' ),
			allKakaos: makeProviders( 'Kakao' ),
			allTwitters: makeProviders( 'Twitter' ),
		} ) );
	} );

	const Providers = ['Local', 'Facebook', 'Google', 'Kakao', 'Twitter'];
	Providers.forEach( ( Provider ) => {
		const changedProv = req.body[Provider];
		if ( changedProv ) {
			const keys = Object.keys( changedProv );
			const checker2 = checkLoaded( keys.length, checker );

			keys.forEach( ( providerID ) => {
				const uidChanged = changedProv[providerID];
				changeProvider( Provider, providerID, uidChanged, ( sendMsg ) => {
					if ( sendMsg && sendMsg.code !== 'OK' ) {
						checker2( true );
						return;
					}
					checker2();
				} );
			} );
		}
	} );
} );


module.exports = router;
