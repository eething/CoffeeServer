
const fs = require( 'fs' );

const convertError = require( '../lib/convert-error' );
const checkLoaded = require( '../lib/check-loaded' );

module.exports = {

	// isLoaded: false,

	/*
	{
		'2018-08-01' : [ { orderBy: 7, beverage: '아메리카노', ... }, ]
		'2018-08-02' : [ { orderBy: 5, beverage: '카페라떼', ... }, ]
	}
	*/
	allOrders: {},

	currentOrderList: [],

	todayString: '',

	initOrderSetting( preserveOther = false ) {
		const newTodayString = new Date().toISOString().substr( 0, 10 );
		if ( this.todayString !== newTodayString ) {
			this.currentOrderList = [];
			this.todayString = newTodayString;
		}

		if ( !preserveOther ) {
			Object.keys( this.allOrders ).forEach( ( key ) => {
				if ( key !== this.todayString ) {
					delete this.allOrders[key];
				}
			} );
		}
	},

	changeDisplayName( uid, newDisplayName ) {
		this.currentOrderList.forEach( ( co ) => {
			if ( co.orderBy === uid ) {
				co.orderByDN = newDisplayName;
			}
		} );
	},
	adjustDisplayNameAll( displayNames ) {
		this.currentOrderList.forEach( ( co ) => {
			co.orderByDN = displayNames[co.orderBy] || 'NULL';
		} );
	},

	addCurrentOrderList( order ) {
		let isNewOrder = true;
		this.currentOrderList.forEach( ( co, index, arr ) => {
			// orderBy 가 undefined 이면 true 가 되는 문제가 있지만, 일단 넘어가자
			if ( co.orderBy === order.orderBy ) {
				isNewOrder = false;
				arr[index] = {};
				const newOrder = arr[index];
				Object.keys( order ).forEach( ( k ) => {
					newOrder[k] = order[k];
				} );
			}
		} );

		if ( isNewOrder ) {
			const orderCopy = {};
			Object.keys( order ).forEach( ( k ) => {
				orderCopy[k] = order[k];
			} );
			this.currentOrderList.push( orderCopy );
		}
	},

	loadTodayOrder( _callback ) {
		const key = this.todayString;
		if ( this.allOrders[key] ) {
			_callback();
			return;
		}

		const filePath = `data/orders/${key}`;
		fs.readFile( filePath, ( err, data ) => {
			if ( err ) {
				this.allOrders[key] = [];
			} else {
				const value = JSON.parse( data );
				this.allOrders[key] = value;

				value.forEach( ( order ) => {
					this.addCurrentOrderList( order );
				} );
			}
			_callback();
		} );
	},

	addOrder( body, callback ) {
		this.initOrderSetting( false );
		this.loadTodayOrder( () => {
			// 그냥 때려박으면 별로 의미가 없나-_-
			const order = {};
			Object.keys( body ).forEach( ( k ) => {
				order[k] = body[k];
			} );

			this.addCurrentOrderList( order );

			const key = this.todayString;
			const todayOrder = this.allOrders[key];
			todayOrder.push( order );

			const orderString = JSON.stringify( todayOrder );
			const filePath = `data/orders/${key}`;
			fs.writeFile( filePath, orderString, ( err ) => {
				if ( err ) {
					callback( {
						code: 'EWRITE',
						err: convertError( err ),
					} );
				} else {
					callback( {
						code: 'OK',
						currentOrder: this.currentOrderList,
						order,
					} );
				}
			} );
		} );
	},
	currentOrder() {

	},
	getCurrentOrder( callback ) {
		this.initOrderSetting( false );
		this.loadTodayOrder( () => {
			callback( this.currentOrderList );
		} );
	},

	getTodayOrder( callback ) {
		this.initOrderSetting( false );
		this.loadTodayOrder( () => {
			callback( this.allOrders[this.todayString] );
		} );
	},

	getAllOrder( callback ) {
		this.initOrderSetting( true );
		this.loadOrders( true, () => {
			callback( this.allOrders );
		} );
	},

	loadOrders( bForce = false, callback ) {
		// 당분간 쓸 일은 없겠지만 구색맞추기-_-
		if ( !bForce ) {
			this.initOrderSetting( false );
			this.loadTodayOrder( () => {
				console.log( 'Order Loaded...' );
				callback();
			} );
			return;
		}

		fs.readdir( 'data/orders', ( error, files ) => {
			const len = files.length;
			const checker = checkLoaded( len + 1, callback );
			// () => { this.isLoaded = true; callback(); }
			checker();
			files.forEach( ( file ) => {
				const filePath = `data/orders/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					if ( err ) {
						if ( err.code === 'EISDIR' ) {
							checker();
							return;
						}
						throw err;
					}

					const value = JSON.parse( data );
					const key = file;
					this.allOrders[key] = value;

					if ( key === this.todayString ) {
						value.forEach( ( order ) => {
							this.addCurrentOrderList( order );
						} );
					}

					checker();
				} );
			} );
		} );
	},
};
