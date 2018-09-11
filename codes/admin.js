'use strict';

const fs = require( 'fs' );

module.exports = {

	credentials: {
		Facebook: {},
		Google: {},
		Kakao: {},
		Twitter: {},
	},

	setFacebook( body, callback ) {
		const fb = this.credentials.Facebook;
		fb.clientID		= body.clientID;
		fb.clientSecret	= body.clientSecret;
		fb.callbackURL	= body.callbackURL;
		if( body.profileFields && body.profileFields.length > 0 ) {
			//profileFields: ['id', 'displayName', 'photos', 'email']
			fb.profileFields = body.profileFields;
		}
		console.log( this.credentials );
		this.saveFacebook( callback );
	},

	loadAdmins() {
		this.loadFacebook();
		this.loadGoogle();
		this.loadKakao();
		this.loadTwitter();
	},

	loadFacebook() {
		try {
			const data = fs.readFileSync( 'data/admins/Facebook' );
			this.credentials.Facebook = JSON.parse( data );
		} catch( err ) {
			if( err && err.code === 'ENOENT' ) {
				this.credentials.Facebook = {};
				return;
			}
			throw err;
		}
	},

	loadGoogle() {

	},

	loadKakao() {

	},

	loadTwitter() {

	},

	saveFacebook( callback ) {
		const facebookString = JSON.stringify( this.credentials.Facebook );
		fs.writeFile( 'data/admins/Facebook', facebookString, err => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: err,
					msg: `facebookString=${facebookString}`
				} );
			} else {
				callback( {
					code: 'OK',
				} );
			}
		} );
	},

	saveGoogle() {

	},

	saveKakao() {

	},

	saveTwitter() {

	},
}
