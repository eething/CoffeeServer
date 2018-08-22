﻿// common.js

function MyError( type, message ) {
	this.type = type;
	this.name = "L2Error";
	this.message = message;// || "Default Message";
}
MyError.prototype = new Error();
MyError.prototype.constructor = MyError;

let l2data = {
	allBeverages: {},

	allOrders: {},
	currentOrder: [],
	currentBuy: {},
	buyKeySorted: [],

	allUsers: {},

	getBeverageList( callback ) {
		fetch( '/beverage/list' )
			.then( res => {
				if( res.ok ) {
					return res.json();
				} else {
					throw new MyError( 404, "FAILED : Get Beverage List" );
				}
			} )
			.then( data => {
				this.allBeverages = data;
				callback();
			} )
			.catch( err => {
				// TODO - 에러창에 띄우기
				alert( `${err} (${err.type})` );
			} );
	},

	getCurrentOrderList( callback ) {
		fetch( 'order/list' )
			.then( res => {
				if( res.ok ) {
					return res.json();
				} else {
					throw new MyError( 404, "FAILED : Get CurrentOrder List" );
				}
			} )
			.then( data => {
				this.currentOrder = data;
				this.currentOrder.sort( ( a, b ) => a.orderBy > b.orderBy );
				this._convertOrderToBuy();
				callback();
			} )
			.catch( err => {
				// TODO - 에러창에 띄우기
				alert( `${err} (${err.type})` );
			} );
	},

	_convertOrderToBuy() {
		this.currentOrder.forEach( co => {
			let buyList = this.currentBuy[co.beverage];
			if( !buyList ) {
				buyList = this.currentBuy[co.beverage] = [];
			}

			let optionKeys = Object.keys(co)
				.filter( b => (b !== 'orderBy' &&  b !== 'beverage') )
				.sort();
			let options = {};
			for( const k of optionKeys ) {
				options[k] = co[k];
			}
			let optionString = JSON.stringify( options );;

			let buy = buyList.find( b => b.options === optionString );
			if( !buy ) {
				buy = { options: optionString, orderBys: [] };
				buyList.push( buy );
			}
			buy.orderBys.push( co.orderBy )
		} );

		for( const k in this.currentBuy ) {
			this.currentBuy[k].forEach( b => {
				b.orderBys.sort();
			} )
		}

		// 옵션별 정렬 : options 짧은거 -> 주문자 수
		for( const k in this.currentBuy ) {
			this.currentBuy[k].sort( ( a, b ) => {
				const c1 = a.options.length - b.options.length
				if( c1 !== 0 ) {
					return c1;
				}
				const c2 = b.orderBys.length - a.orderBys.length;
				if( c2 !== 0) {
					return c2;
				}
				return 0;
			} );
		}

		// 음료별 정렬 : 주문자 수 총합
		this.buyKeysSorted = Object.keys(this.currentBuy);
		this.buyKeysSorted.sort( ( a, b ) => {
			let count1 = 0, count2 = 0;
			for( const buy of this.currentBuy[a] ) {
				count1 += buy.orderBys.length;
			}
			for( const buy of this.currentBuy[b] ) {
				count2 += buy.orderBys.length;
			}
			return count2 - count1;
		} );
	},

	getUserList( callback ) {
		fetch( '/user/list' )
			.then( res => {
				if( res.ok ) {
					return res.json();
				} else {
					throw new MyError( 404, "FAILED : Get User List" );
				}
			} )
			.then( data => {
				this.allUsers = data;
				callback();
			} )
			.catch( err => {
				// TODO - 에러창에 띄우기
				alert( `${err} (${err.type})` );
			} );
	},
};

function removeChildAll( node ) {
	while( node.lastChild ) {
		node.removeChild( node.lastChild );
	}
}
function addElement( parent, child, cls, inner ) {
	let c = document.createElement( child );
	if( cls ) {
		c.className = cls;
	}
	if( inner ) {
		c.innerHTML = inner;
	}
	parent.appendChild( c );
	return c;
}
