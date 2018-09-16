﻿'use strict';

const fs = require( 'fs' );
const convertError = require( '../lib/convert-error' );

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
		let beverage = {};
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
		fs.writeFile( filePath, beverageString, err => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err )
				} );
			} else {
				callback( {
					code: 'OK',
					beverage: beverage
				} );
			}
		} );
	},

	delBeverage( body, callback ) {

		let len = Object.keys( body ).length;
		if( len === 0 ) {
			callback( {
				code: "EINPUT",
				err: 'Input NOT Exist'
			} );
			return;
		}

		let sendMsg = {
			code: 'OK',
			errList: [],
			delList: []
		};

		for( let key in body ) {
			//console.log( key + ' : ' + this.allBeverages[key] );
			delete this.allBeverages[ key ];

			const filePath = `data/beverages/${key}`;
			fs.unlink( filePath, err => {
				--len;
				if( err ) {
					sendMsg.code = 'EUNLINK';
					sendMsg.errList.push( errorConvert( err ) ); //key: key,
				} else {
					sendMsg.delList.push( key );
				}

				if( len === 0 ) {
					callback( sendMsg );
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
};
