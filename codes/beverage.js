'use strict';
const fs = require( 'fs' );

module.exports = {

	//isLoaded: false,

	allBeverages: {},

	loadBeverages() {
		fs.readdir( 'data/beverages', ( err, files ) => {
			files.forEach( ( file ) => {
				const filePath = `data/beverages/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}
					const value = JSON.parse( data );
					const key = value.name;
					this.allBeverages[key] = value;
				} );
			} );
		} );
	},

	addBeverage( body, callback ) {
		let beverage = {}
		for( let key in body ) {
			let value = body[ key ];
			if( key.substr( -4 ) == "able" && value == "on" ) {
				value = true;
			}
			beverage[ key ] = value;
		}
		this.allBeverages[ beverage.name ] = beverage;

		let beverageString = JSON.stringify( beverage );
		let filePath = `data/beverages/${beverage.name}`;
		fs.writeFile( filePath, beverageString, ( err ) => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: {
						name: err.name,
						message: err.message,
						stack: err.stack
					}
				} );
			} else {
				callback( {
					code: 'OK',
					beverage: beverage
				} );
			}
		} );
	},

	deleteBeverage( body, callback ) {

		let len = Object.keys( body ).length;
		if( len === 0 ) {
			callback( {
				err: "InputNotExist",
				msg: [ 'deleteBeverage Failed - Input is NOT Exist' ]
			} );
			return;
		}

		let msg = [ 'deleteBeverage' ];
		for( let key in body ) {
			console.log( key + ' : ' + this.allBeverages[key] );
			delete this.allBeverages[ key ];

			const filePath = `data/beverages/${key}`;
			fs.unlink( filePath, ( err ) => {
				--len;
				if( err ) {
					msg.push( `${err}` );
				} else {
					msg.push( `Success - ${filePath}` );
				}

				if( len === 0 ) {
					callback( { msg: msg } );
				}
			} );
		}
	},

	getIceHotType: function ( name ) {
		const beverage = this.allBeverages[ name ];

		if( beverage.icoable ) {
			if( beverage.hotable ) {
				return "select";
			} else {
				return "iceOnly";
			}
		} else {
			if( beverage.hotable ) {
				return "hotOnly";
			} else {
				return "none"; // 쿠키류
			}
		}
	}
}
