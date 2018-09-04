// common.js

function MyError( status, errMsg ) {
	this.name = "L2Error";
	this.status = status;
	this.code = errMsg.code || 'CUNKNOWN';
	this.err = errMsg.err || '';
//	this.message = message;// || "Default Message";
}
MyError.prototype = new Error();
MyError.prototype.constructor = MyError;

let elem = {};

function fetchHelper( address, data, description, callback ) {

	let options = {};
	if( data ) {
		options = {
			headers: {
				//'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'post',
			body: JSON.stringify( data )
		};
	}

	fetch( address, options )
		.then( res => {
			if( res.ok ) {
				return res.json();
			} else {
				throw new MyError( res.status, {
					code: 'CFETCH',
					err: `FAILED: ${description}`
				} );
			}
		} )
		.then( data => {
			callback( data );
		} )
		.catch( err => {
			// TODO - 에러창에 띄우기
			if( err.status ) {
				alert( `${err.status}, ${err.code}, ${err.err}` );
			} else {
				console.log( err );
				alert( err );
			}
		} );
}

let l2data = {
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

	getAllList( callback ) {
		fetchHelper( '/auth/list', null, 'getAllList', data => {
			this.allUsers = data.allUsers;
			this.allBeverages = data.allBeverages;
			this.currentOrder = data.currentOrder;
			this.currentOrder.sort( ( a, b ) => a.orderBy > b.orderBy );
			this._convertOrderToBuy();
			callback();
		} );
	}

	getBeverageList( callback ) {
		fetchHelper( '/beverage/list', null, 'getBeverageList', data => {
			this.allBeverages = data.allBeverages;
			callback();
		} );
	},

	getCurrentOrderList( callback ) {
		fetchHelper( '/order/list', null, 'getBeverageList', data => {
			this.currentOrder = data.currentOrder;
			this.currentOrder.sort( ( a, b ) => a.orderBy > b.orderBy );
			this._convertOrderToBuy();
			callback();
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
		fetchHelper( '/user/list', null, 'getBeverageList', data => {
			this.allUsers = data.allUsers;
			callback();
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
