
const fs = require( 'fs' );

const convertError	= require( '../lib/convert-error' );

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

	loadAdmins() {
		this.loadProvider( 'Facebook' );
		this.loadProvider( 'Google' );
		this.loadProvider( 'Kakao' );
		this.loadProvider( 'Twitter' );
	},

	loadProvider( Provider ) {
		try {
			const data = fs.readFileSync( `data/admins/${Provider}` );
			this.credentials[Provider] = JSON.parse( data );
		} catch ( err ) {
			if ( err && err.code === 'ENOENT' ) {
				this.credentials[Provider] = {};
				return;
			}
			throw err;
		}
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
