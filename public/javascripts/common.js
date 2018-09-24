// common.js
/* eslint-env browser */
/* global l2all l2user l2beverage l2order */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(?:elem|l2|add|remove)" }] */

function MyError( status, errMsg ) {
	this.name = 'L2Error';
	this.status = status;
	this.code = errMsg.code || 'CUNKNOWN';
	this.err = errMsg.err || '';
//	this.message = message;// || "Default Message";
}
MyError.prototype = new Error();
MyError.prototype.constructor = MyError;

const elem = {};

function fetchHelper( address, options, input, description, callback ) {
	//
	const opt = options || {};
	if ( input ) {
		opt.headers = options.headers || {};
		opt.headers['Content-Type'] = 'application/json';
		opt.method = 'post';
		opt.body = JSON.stringify( input );
	}

	fetch( address, opt )
		.then( ( res ) => {
			if ( res.ok ) {
				return res.json();
			}
			throw new MyError( res.status, {
				code: 'CFETCH',
				err: `FAILED: ${description}`,
			} );
		} )
		.then( ( data ) => {
			callback( data );
		} )
		.catch( ( err ) => {
			// TODO - 에러창에 띄우기
			if ( err.status ) {
				alert( `${err.status}, ${err.code}, ${err.err}` );
			} else {
				console.log( err );
				alert( err );
			}
		} );
}

const l2data = {

	view: {},
	login: {},
	allUsers: {},
	allBeverages: {},
	allOrders: {},
	currentOrder: [],
	currentBuy: {},
	buyKeySorted: [],

	// TODO - currentOrder 의 정렬시 orderBy 로 정렬하는데
	// 이거 uid 라서 실제 이름 정렬로 전환 해야 하나-_-
	// 아님 orderBy 를 다시 userName 으로 바꿔야 하나-_-
	setData( data ) {
		this.allUsers = data.allUsers || this.allUsers;
		if ( data.allUsers ) {
			if ( this.view.all ) {
				l2all.cbUserList();
			} else if ( this.view.user ) {
				l2user.cbUserList();
			} else if ( this.view.order ) {
				l2order.cbUserList();
			}
		}

		this.allBeverages = data.allBeverages || this.allBeverages;
		if ( data.allBeverages ) {
			if ( this.view.all ) {
				l2all.cbBeverageList();
			} else if ( this.view.beverage ) {
				l2beverage.cbBeverageList();
			} else if ( this.view.order ) {
				l2order.cbBeverageList();
			}
		}

		this.currentOrder = data.currentOrder || this.currentOrder;
		this.currentOrder.sort( ( a, b ) => a.orderByDN > b.orderByDN );
		this.convertOrderToBuy();
		if ( data.currentOrder ) {
			if ( this.view.all ) {
				l2all.cbOrderList();
			} else if ( this.view.order ) {
				l2order.cbOrderList();
			}
		}
	},

	getAllList( callback ) {
		fetchHelper( '/auth/list', null, null, 'getAllList', ( data ) => {
			this.setData( data );
			if ( callback ) {
				callback( data );
			}
		} );
	},

	getUserList( callback ) {
		fetchHelper( '/user/list', null, null, 'getUserList', ( data ) => {
			this.setData( data );
			if ( callback ) {
				callback();
			}
		} );
	},

	getBeverageList( callback ) {
		fetchHelper( '/beverage/list', null, null, 'getBeverageList', ( data ) => {
			this.setData( data );
			if ( callback ) {
				callback();
			}
		} );
	},

	getCurrentOrderList( callback ) {
		fetchHelper( '/order/list', null, null, 'getCurrentOrderList', ( data ) => {
			this.setData( data );
			if ( callback ) {
				callback();
			}
		} );
	},

	convertOrderToBuy() {
		this.currentBuy = {};
		this.currentOrder.forEach( ( co ) => {
			let buyList = this.currentBuy[co.beverage];
			if ( !buyList ) {
				buyList = [];
				this.currentBuy[co.beverage] = buyList;
			}

			const optionKeys = Object.keys( co )
				.filter( b => b !== 'orderBy' && b !== 'orderByDN' && b !== 'beverage' )
				.sort();
			const options = {};
			optionKeys.forEach( ( k ) => {
				options[k] = co[k];
			} );
			const optionString = JSON.stringify( options );

			let buy = buyList.find( b => b.options === optionString );
			if ( !buy ) {
				buy = { options: optionString, orderBys: [], orderByDNs: [] };
				buyList.push( buy );
			}
			buy.orderBys.push( co.orderBy );
			buy.orderByDNs.push( co.orderByDN );
		} );

		Object.keys( this.currentBuy ).forEach( ( k ) => {
			this.currentBuy[k].forEach( ( b ) => {
				b.orderByDNs.sort();
			} );
		} );

		// 옵션별 정렬 : options 짧은거 -> 주문자 수
		Object.keys( this.currentBuy ).forEach( ( k ) => {
			this.currentBuy[k].sort( ( a, b ) => {
				const c1 = a.options.length - b.options.length;
				if ( c1 !== 0 ) {
					return c1;
				}
				const c2 = b.orderBys.length - a.orderBys.length;
				if ( c2 !== 0 ) {
					return c2;
				}
				return 0;
			} );
		} );

		// 음료별 정렬 : 주문자 수 총합
		this.buyKeysSorted = Object.keys( this.currentBuy );
		this.buyKeysSorted.sort( ( a, b ) => {
			const count1 = this.currentBuy[a].reduce( ( sum, buy ) => sum + buy.orderBys.length, 0 );
			const count2 = this.currentBuy[b].reduce( ( sum, buy ) => sum + buy.orderBys.length, 0 );
			return count2 - count1;
		} );
	},
};

function removeChildAll( node ) {
	while ( node.lastChild ) {
		node.removeChild( node.lastChild );
	}
}
function addElement( parent, child, cls, inner ) {
	const c = document.createElement( child );
	if ( cls ) {
		c.className = cls;
	}
	if ( inner ) {
		c.innerHTML = inner;
	}
	parent.appendChild( c );
	return c;
}
