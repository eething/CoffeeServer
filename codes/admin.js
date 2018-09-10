'use strict';

const fs = require( 'fs' );

module.exports = {

	credentials: {
		facebook: {},
		google: {},
		kakao: {},
		twitter: {},
	},

	setFacebookCredentials(	clientID,
		 					clientSecret,
							callbackURL,
							profileFields,
							callback ) {
		this.credentials.facebook.clientID = clientID;
		this.credentials.facebook.clientSecret = clientSecret;
		this.credentials.facebook.callbackURL = callbackURL;
		if( profileFields.length > 0 ) {
			//profileFields: ['id', 'displayName', 'photos', 'email']
			this.credentials.facebook.profileFields = profileFields;
		}
		this.saveFacebook( callback );
	},

	loadAdmins() {
		this.loadFacebook();
		this.loadGoogle();
		this.loadKakao();
		this.loadTwitter();
	},

	loadFacebook() {
		fs.readFile( 'data/admins/facebook', ( err, data ) => {
			if( err ) {
				if( err.code === 'ENOENT' ) {
					this.credentials.facebook = {};
					return;
				}
				throw err;
			}
			if( err ) {
				code: 'ENOENT',
				console.log( err );
				throw err;
			}
			this.credentials.facebook = JSON.parse( data );
		} );
	},

	loadGoogle() {

	},

	loadKakao() {

	},

	loadTwitter() {

	},

	saveFacebook( callback ) {
		const facebookString = JSON.stringify( this.credentials.facebook );
		fs.writeFile( 'data/admins/facebook', facebookString, err => {
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
