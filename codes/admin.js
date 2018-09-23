
const fs = require( 'fs' );

const convertError	= require( '../lib/convert-error' );
const checkLoaded = require( '../lib/check-loaded' );

module.exports = {

	credentials: {
		Facebook: {},
		Google: {},
		Kakao: {},
		Twitter: {},
	},

	setProvider( body, callback ) {
		const { Provider } = body;
		const prov = this.credentials[Provider];
		prov.clientID		= body.clientID;
		prov.clientSecret	= body.clientSecret;
		prov.callbackURL	= body.callbackURL;
		if ( body.profileFields && body.profileFields.length > 0 ) {
			// profileFields: ['id', 'displayName', 'photos', 'email']
			prov.profileFields = body.profileFields;
		}
		this.saveProvider( Provider, callback );
	},

	loadAdmins( callback ) {
		const checker = checkLoaded( 4, () => {
			console.log( 'Admin Loaded...' );
			callback();
		} );

		fs.mkdir( 'data/admins', () => {
			this.loadProvider( 'Facebook',	checker );
			this.loadProvider( 'Google',	checker );
			this.loadProvider( 'Kakao',		checker );
			this.loadProvider( 'Twitter',	checker );
		} );
	},

	loadProvider( Provider, callback ) {
		fs.readFile( `data/admins/${Provider}`, ( err, data ) => {
			if ( err ) {
				if ( err.code !== 'ENOENT' ) {
					throw err;
				}
			}
			this.credentials[Provider] = data ? JSON.parse( data ) : {};
			callback();
		} );
	},

	saveProvider( Provider, callback ) {
		const provString = JSON.stringify( this.credentials[Provider] );
		fs.writeFile( `data/admins/${Provider}`, provString, ( err ) => {
			if ( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `${Provider} provString=${provString}`,
				} );
			} else {
				callback( {
					code: 'OK',
					credentials: this.credentials,
				} );
			}
		} );
	},
};
