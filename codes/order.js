'use strict';

const fs = require( 'fs' );
const convertError = require( '../lib/convert-error' );

module.exports = {

	//isLoaded: false,

	/*
	{
		'2018-08-01' : [ { orderBy: 7, beverage: '아메리카노', ... }, ]
		'2018-08-02' : [ { orderBy: 5, beverage: '카페라떼', ... }, ]
	}
	*/
	allOrders: {},

	currentOrderList: [],

	todayString: '',

	_initOrderSetting( preserveOther = false ) {

		const newTodayString = new Date().toISOString().substr( 0, 10 );
		if( this.todayString !== newTodayString ) {
			this.currentOrderList = [];
			this.todayString = newTodayString;
		}

		if( !preserveOther ) {
			for( const key in this.allOrders ) {
				if( key !== this.todayString ) {
					delete this.allOrders[key];
				}
			}
		}
	},

	changeDisplayName( uid, newDisplayName ) {
		this.currentOrderList.forEach( ( co, i ) => {
			if( co.orderBy === uid ) {
				co.orderByDN = newDisplayName;
			}
		} );
	},
	_addCurrentOrderList( order ) {
		let isNewOrder = true;

		this.currentOrderList.forEach( ( co, i ) => {
			// orderBy 가 undefined 이면 true 가 되는 문제가 있지만, 일단 넘어가자
			if( co.orderBy === order.orderBy ) {
				isNewOrder = false;
				this.currentOrderList[ i ] = order;
			}
		} );

		if( isNewOrder ) {
			this.currentOrderList.push( order );
		}
	},

	_loadTodayOrder( _callback ) {

		const key = this.todayString;
		if( this.allOrders[ key ] ) {
			_callback();
			return;
		}

		const filePath = `data/orders/${key}`;
		fs.readFile( filePath, ( err, data ) => {
			if( err ) {
				this.allOrders[ key ] = [];
			} else {
				const value = JSON.parse( data );
				this.allOrders[ key ] = value;

				for( const order of value ) {
					this._addCurrentOrderList( order );
				}
			}
			_callback();
		} );
	},

	addOrder( body, callback ) {
		this._initOrderSetting( false );
		this._loadTodayOrder( () => {

			// 그냥 때려박으면 별로 의미가 없나-_-
			let order = {};
			for( let k in body ) {
				order[ k ] = body[ k ];
			}

			this._addCurrentOrderList( order );

			const key = this.todayString;
			let todayOrder = this.allOrders[ key ];
			todayOrder.push( order );

			let orderString = JSON.stringify( todayOrder );
			const filePath = `data/orders/${key}`;
			fs.writeFile( filePath, orderString, err => {
				if( err ) {
					callback( {
						code: 'EWRITE',
						err: convertError( err )
					} );
				} else {
					callback( {
						code: 'OK',
						currentOrder: this.currentOrderList,
						order: order
					} );
				}
			} );
		} );
	},

	getCurrentOrder( callback ) {
		this._initOrderSetting( false );
		this._loadTodayOrder( () => {
			callback( this.currentOrderList );
		} );
	},

	getTodayOrder( callback ) {
		this._initOrderSetting( false );
		this._loadTodayOrder( () => {
			callback( this.allOrders[ this.todayString ] );
		} );
	},

	getAllOrder( callback ) {
		this._initOrderSetting( true );
		this.loadOrders( true, () => {
			callback( this.allOrders );
		} );
	},

	loadOrders( bForce = false, _callback ) {
		// 당분간 쓸 일은 없겠지만 구색맞추기-_-
		if( !bForce ) {
			return;
		}

		fs.readdir( 'data/orders', ( err, files ) => {
			let len = files.length;
			files.forEach( ( file ) => {
				const filePath = `data/orders/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const value = JSON.parse( data );
					const key = file;
					this.allOrders[ key ] = value;

					if( key === this.todayString ) {
						for( const order of value ) {
							this._addCurrentOrderList( order );
						}
					}

					if( len === 0 ) {
						//this.isLoaded = true;
						_callback();
					}
				} );
			} );
		} );
	},
}
