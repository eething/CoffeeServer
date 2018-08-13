'use strict';
const fs = require( 'fs' );

module.exports = {

	//isLoaded: false,

	allBeverages: {},

	loadBeverages() {
		fs.readdir( 'data/beverages', ( err, files ) => {
			files.forEach( ( file ) => {
				fs.readFile( `data/beverages/${file}`, ( err, data ) => {
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
			let value = body[key];
			if( key.substr( -4 ) == "able" && value == "on" ) {
				value = true;
			}
			beverage[key] = value;
		}
		this.allBeverages[beverage.name] = beverage;

		let beverageString = JSON.stringify( beverage );
		fs.writeFile( `data/beverages/${beverage.name}`, beverageString, ( err ) => {
			if( err ) {
				callback( {
					err: "WriteFileFailed",
					msg: [`addBeverage Failed - ${err}`]
				} );
			}
			else {
				callback( {
					err: "Success",
					msg: [`addBeverage Success - ${beverageString}`]
				} );
			}
		} );
	},

	deleteBeverage( body, callback ) {

		let len = Object.keys( body ).length;
		if( len === 0 ) {
			callback( {
				err: "InputNotExist",
				msg: ['deleteBeverage Failed - Input is NOT Exist']
			} );
			return;
		}

		let msg = ['deleteBeverage'];
		for( let key in body ) {
			delete this.allBeverages[key];

			let filepath = `data/beverages/${key}`;
			fs.unlink( filepath, ( err ) => {
				--len;
				if( err ) {
					msg.push( `* ${err}` );
				} else {
					msg.push( `* Success - ${filepath}` );
				}

				if( len === 0 ) {
					callback( { msg: msg } );
				}
			} );
		}
	},

	getIceHotType: function ( name ) {
		const beverage = this.allBeverages[name];

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
