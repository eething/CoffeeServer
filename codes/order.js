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

	_addCurrentOrderList( order ) {
		let isNewOrder = true;

		this.currentOrderList.forEach( ( co, i ) => {
			// orderBy 가 undefined 이면 true 가 되는 문제가 있지만, 일단 넘어가자
			if( co.orderBy === order.orderBy ) {
				isNewOrder = false;
				this.currentOrderList[i] = order;
			}
		} );

		if( isNewOrder ) {
			this.currentOrderList.push( order );
		}
	},

	_loadTodayOrder( _callback ) {

		if( this.allOrders[ this.todayString ] ) {
			_callback();
			return;
		}

		const filePath = `data/orders/${this.todayString}`;
		const data = fs.readFile( filePath, ( err, data ) => {
			if( err ) {
				const key = this.todayString;
				this.allOrders[ key ] = {
					date: this.todayString,
					orderList: []
				};
			} else {
				const value = JSON.parse( data ); // { date:'2018-08-01', orderList: [ { }, { }, ... ] }
				const key = value.date;
				this.allOrders[ key ] = value;

				for( const order of value.orderList ) {
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

			let todayOrder = this.allOrders[this.todayString];
			todayOrder.orderList.push( order );
			let orderString = JSON.stringify( todayOrder );
			fs.writeFile( `data/orders/${this.todayString}`, orderString, ( err ) => {
				if( err ) {
					callback( {
						err: "WriteFileFailed",
						msg: [ `addOrder Failed - ${err}` ]
					} );
				} else {
					let msg = [`addOrder Success - ${todayOrder.date}`];
					for( const o of todayOrder.orderList ) {
						msg.push( JSON.stringify( o ) );
					}
					callback( {
						err: "Success",
						msg
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
			callback( this.allOrders[this.todayString] );
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
					if( err && err.code === 'EISDIR' ) {
						return;
					}
					--len;

					const value = JSON.parse( data );
					const key = value.date;
					this.allOrders[ key ] = value;

					if( key === this.todayString ) {
						for( const order of value.orderList ) {
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
