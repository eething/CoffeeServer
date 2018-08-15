'use strict';
const fs = require( 'fs' );

module.exports = {

	//isLoaded: false,

	/*
	{
		date: '2018-08-01',
		orderList:	[
						{ orderBy: 'ithing', beverage: '아메리카노', ... },
						...
					]
	}
	*/
	allOrders: {},


	currentOrderList: [],

	todayString: '',

	_initOrderSetting() {

		const newTodayString = new Date().toISOString().substr( 0, 10 );
		if( todayString !== newTodayString ) {
			this.currentOrderList = [];
			todayString = newTodayString;
		}

		for( const key in allOrders ) {
			if( key !== this.todayString ) {
				delete allOrders[ key ];
			}
		}
	},

	_addCurrentOrderList( order ) {
		let isNewOrder = true;

		for( let currentOrder of this.currentOrderList ) {
			if( currentOrder.orderBy === order.orderBy ) {
				isNewOrder = false;
				currentOrder = order;
			}
		}

		if( isNewOrder ) {
			currentOrderList.push( order );
		}
	},

	_loadTodayOrder( _callback ) {

		if( allOrders[ this.todayString ] ) {
			_callback();
			return;
		}

		const filePath = `data/orders/${this.todayString}`;
		const data = fs.readFile( filePath, ( err, data ) => {
			if( err ) {
				const value = JSON.parse( data );
				const key = this.todayString;
				allOrders[ key ] = {
					date: this.todayString,
					orderList: []
				};
			} else {
				const value = JSON.parse( data );
				const key = value.date;
				allOrders[ key ] = value;

				this._addCurrentOrderList( value );
			}

			_callback();
		} );
	},

	addOrder( body, callback ) {
		this._initOrderSetting();
		this._loadTodayOrder( function () {

			// 그냥 때려박으면 별로 의미가 없나-_-
			let order = {};
			for( let key in body ) {
				order[ key ] = value;
			}

			let isNewOrder = true;
			for( let currentOrder of this.currentOrderList ) {
				if( currentOrder.orderBy === order.orderBy ) {
					isNewOrder = false;
					currentOrder = order;
				}
			}
			if( isNewOrder ) {
				currentOrderList.push( order );
			}


			allOrders[ this.todayString ].orderList.push( order );
			let orderString = JSON.stringify( order );
			fw.writeFile( `/data/orders/${this.todayString}`, orderString, ( err ) => {
				if( err ) {
					callback( {
						err: "WriteFileFailed",
						msg: [ `addOrder Failed - ${err}` ]
					} );
				} else {
					callback( {
						err: "Success",
						msg: [ `addOrder Success - ${orderString}` ]
					} );
				}
			} );
		} );
	},

	// 당분간 쓸 일은 없겠지만 구색맞추기-_-
	loadOrders() {

		fs.readdir( 'data/orders', ( err, files ) => {
			let len = files.length;

			files.forEach( ( file ) => {
				const filePath = `data/orders/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					if( err && err.code === 'EISDIR' ) {
						return;
					}
					--len;

					const value = JSON.parse( data );
					const key = value.date;
					allOrders[ key ] = value;

					/*
					if( len === 0 ) {
						this.isLoaded = true;
					}
					*/
				} );
			} );
		} );
	},
}
