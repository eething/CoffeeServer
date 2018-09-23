
const fs = require( 'fs' );

const convertError = require( '../lib/convert-error' );
const checkLoaded = require( '../lib/check-loaded' );

module.exports = {

	// isLoaded: false,

	allBeverages: {},

	loadBeverages( callback ) {
		fs.readdir( 'data/beverages', ( error, files ) => {
			const len = files.length;
			const checker = checkLoaded( len + 1, () => {
				console.log( 'Beverage Loaded...' );
				callback();
			} );
			checker();
			files.forEach( ( file ) => {
				const filePath = `data/beverages/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					if ( err ) {
						if ( err.code === 'EISDIR' ) {
							checker();
							return;
						}
						throw err;
					}
					const value = JSON.parse( data );
					const key = value.name;
					this.allBeverages[key] = value;

					checker();
				} );
			} );
		} );
	},

	addBeverage( body, callback ) {
		const beverage = {};
		Object.keys( body ).forEach( ( key ) => {
			let value = body[key];
			if ( key.substr( -4 ) === 'able' && value === 'on' ) {
				value = true;
			}
			beverage[key] = value;
		} );
		this.allBeverages[beverage.name] = beverage;

		const beverageString = JSON.stringify( beverage );
		const filePath = `data/beverages/${beverage.name}`;
		fs.writeFile( filePath, beverageString, ( err ) => {
			if ( err ) {
				callback( { code: 'EWRITE', err: convertError( err ) } );
			} else {
				callback( { code: 'OK' /* beverage */ } );
			}
		} );
	},

	delBeverage( body, callback ) {
		const len = Object.keys( body ).length;
		if ( len === 0 ) {
			callback( { code: 'EINPUT', err: 'Input NOT Exist' } );
			return;
		}
		const checker = checkLoaded( len, callback );

		const sendMsg = {
			code: 'OK',
			errList: [],
			delList: [],
		};

		Object.keys( body ).forEach( ( key ) => {
			// console.log( key + ' : ' + this.allBeverages[key] );
			delete this.allBeverages[key];

			const filePath = `data/beverages/${key}`;
			fs.unlink( filePath, ( err ) => {
				if ( err ) {
					sendMsg.code = 'EUNLINK';
					sendMsg.errList.push( convertError( err ) ); // key: key,
				} else {
					sendMsg.delList.push( key );
				}

				checker( null, sendMsg );
			} );
		} );
	},

	getIceHotType( name ) {
		const beverage = this.allBeverages[name];

		if ( beverage.icoable ) {
			if ( beverage.hotable ) {
				return 'select';
			}
			return 'iceOnly';
		}
		if ( beverage.hotable ) {
			return 'hotOnly';
		}
		return 'none'; // 쿠키류
	},
};
