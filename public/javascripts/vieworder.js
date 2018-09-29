// vieworder.js
/* eslint-env browser */
/* global MyError fetchHelper removeChildAll addElement l2data */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(?:on|init|l2)" }] */

l2data.view.order = true;

const elemOrder = {};

function initOrderElem() {
	elemOrder.divIce		= document.querySelector( 'div.cIce' );
	elemOrder.divHot		= document.querySelector( 'div.cHot' );
	elemOrder.divSyrup		= document.querySelector( 'div.cSyrup' );
	elemOrder.divOrderList	= document.querySelector( 'div.cOrderList' );
	elemOrder.divPopupOuter	= document.querySelector( 'div.cPopupOuter' );
	elemOrder.divPopup		= document.querySelector( 'div.cPopup' );
	elemOrder.tableOrderB	= document.querySelector( 'table.cOrderB' );
	elemOrder.tableOrderO	= document.querySelector( 'table.cOrderO' );
	elemOrder.tableOrderB.style.display = 'table';
	elemOrder.tableOrderO.style.display = 'none';


	elemOrder.shuttle1		= document.querySelector( '#shuttle1' );
	elemOrder.shuttle2		= document.querySelector( '#shuttle2' );
	elemOrder.shuttle3		= document.querySelector( '#shuttle3' );
	elemOrder.shuttleList = [
		elemOrder.shuttle1,
		elemOrder.shuttle2,
		elemOrder.shuttle3,
	];
}

function onSwapOrderList( self ) {
	if ( elemOrder.tableOrderB.style.display === 'none' ) {
		elemOrder.tableOrderB.style.display = 'table';
		elemOrder.tableOrderO.style.display = 'none';
		self.innerHTML = '유저별';
	} else {
		elemOrder.tableOrderB.style.display = 'none';
		elemOrder.tableOrderO.style.display = 'table';
		self.innerHTML = '음료별';
	}
}

function showBeverageOptions( f, beverage ) {
	f.ice.checked = false;
	f.hot.checked = false;
	f.syrup.checked = false;

	if ( beverage.iceable ) {
		elemOrder.divIce.style.display = 'block';
		if ( !beverage.hotable ) {
			f.ice.checked = true;
		}
	} else {
		elemOrder.divIce.style.display = 'none';
	}
	if ( beverage.hotable ) {
		elemOrder.divHot.style.display = 'block';
		if ( !beverage.iceable ) {
			f.hot.checked = true;
		}
	} else {
		elemOrder.divHot.style.display = 'none';
	}

	if ( beverage.syrupable ) {
		elemOrder.divSyrup.style.display = 'block';
	} else {
		elemOrder.divSyrup.style.display = 'none';
	}
}
function showPopup( start ) {
	let visMode = 'hidden';
	if ( start ) {
		visMode = 'visible';
	}
	document.querySelector( 'div.cDimmer' ).style.visibility = visMode;
	elemOrder.divPopupOuter.style.visibility = visMode;
}

function showBeverage( f, beverage ) {
	elemOrder.divOrderList.style.display = 'none';
	showBeverageOptions( f, beverage );
	f.beverage.style.backgroundColor = 'lightgreen';
}

function clearBeverage( f ) {
	f.beverage.style.backgroundColor = '';
	elemOrder.divOrderList.style.display = 'block';
	elemOrder.divIce.style.display = 'none';
	elemOrder.divHot.style.display = 'none';
	elemOrder.divSyrup.style.display = 'none';
}


function selectBeverage( name ) {
	document.querySelector( '#beverageSelect' ).value = name;
	document.querySelector( '#beverage' ).value = name;
	const f = document.querySelector( '#order_form' );
	const beverage = l2data.allBeverages[name];
	showBeverage( f, beverage );
	showPopup( false );
}

function changeBeverage( f, value ) {
	if ( value === '' ) {
		clearBeverage( f );
		return;
	}
	const beverage = l2data.allBeverages[value];
	if ( beverage ) {
		showBeverage( f, beverage );
		return;
	}
	removeChildAll( elemOrder.divPopup );
	let bFound = false;
	Object.keys( l2data.allBeverages ).forEach( ( k ) => {
		const b = l2data.allBeverages[k];
		if ( b.name.indexOf( value ) !== -1 ) {
			bFound = true;
			const p = document.createElement( 'p' );
			p.className = 'stxt';
			p.addEventListener( 'click', () => {
				selectBeverage( b.name );
			} );
			p.innerHTML = b.name;
			elemOrder.divPopup.appendChild( p );
		}
	} );
	if ( bFound ) {
		const p = document.createElement( 'p' );
		p.className = 'ctxt';
		p.innerHTML = '음료를 선택해주세요';
		elemOrder.divPopup.prepend( p );
		showPopup( true );
	} else {
		f.beverage.style.backgroundColor = 'red';
	}
}

function onChangeBeverage( self ) {
	const f = self.form;
	if ( self.type === 'text' ) {
		self.value.trim();
	}
	changeBeverage( f, self.value );
}

function onResetBeverage( self ) {
	const f = self.form;
	f.beverage.value = '';
	f.beverageSelect.value = '';
	clearBeverage( f );
	showPopup( false );
}

function onAddOrder( self ) {
	const f = self.form;
	if ( !f.orderBy.value || f.orderBy.value < 0 ) {
		alert( '마실 사람을 선택해 주세요.' );
		return;
	}
	if ( f.beverage.value === '' ) {
		if ( f.beverageSelect.value ) {
			f.beverage.value = f.beverageSelect.value;
		} else {
			alert( '음료명을 입력해주세요.' );
			return;
		}
	}
	if ( !l2data.allBeverages[f.beverage.value] ) {
		alert( '없는 음료입니다.' );
		return;
	}

	if ( ( elemOrder.divIce.style.display === 'block' || elemOrder.divHot.style.display === 'block' )
		&& !f.ice.checked && !f.hot.checked ) {
		alert( '아이스 / 따뜻 골라주세요.' );
		return;
	}

	const input = {
		orderBy: f.orderBy.value,
		beverage: f.beverage.value,
	};
	f.beverage.value = '';
	f.beverageSelect.value = '';
	if ( f.icehot.value ) {
		input.icehot = f.icehot.value;
		f.ice.checked = false;
		f.hot.checked = false;
	}
	if ( f.syrup.checked ) {
		input.syrup = f.syrup.value;
		f.syrup.checked = false;
	}

	changeBeverage( f, '' );

	fetchHelper( '/order', null, input, 'addOrder', ( data ) => {
		if ( data.code === 'OK' ) {
			l2data.setData( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

// MAKE TABLE
function checkOptions( option ) {
	const f = document.querySelector( '#order_form' );
	f.ice.checked = option.icehot === 'ice';
	f.hot.checked = option.icehot === 'hot';
	f.syrup.checked = option.syrup === 'minus';
}
function makeOptionStr( option ) {
	let optionStr = '';
	Object.keys( option ).forEach( ( k ) => {
		if ( k === 'icehot' ) {
			let icehot = '';
			if ( option[k] === 'ice' ) {
				icehot = '아이스';
			} else if ( option[k] === 'hot' ) {
				icehot = '따뜻';
			}
			optionStr = icehot
				+ ( ( icehot && optionStr ) ? '/' : '' )
				+ optionStr;
		} else if ( k === 'syrup' ) {
			optionStr += ( optionStr ? '/' : '' )
				+ ( option[k] === 'minus' ? '시럽빼고' : '' );
		}
	} );
	return optionStr;
}
function addTableOrderO( co ) {
	const optionStr = makeOptionStr( co );

	const userName = co.orderByDN;
	/*
	const user = l2data.allUsers[co.orderBy];
	let username = '';
	if( user ) {
		username = user.name ? user.name : user.id;
	} else {
		username = `* ${co.orderBy}`
	}
	*/

	const tr = addElement( elemOrder.tableOrderO, 'tr', 'cOrderItem' );

	const beverageStr = `${co.beverage}(${optionStr})`;
	const size = Math.min( Math.max( 30 - beverageStr.length, 11 ), 15 );

	addElement( tr, 'td', 'cOrderBy', userName );
	const td = addElement( tr, 'td', 'cBeverageOption', beverageStr );
	td.style.fontSize = `${size}px`;
}
function makeTableOrderO() {
	removeChildAll( elemOrder.tableOrderO );
	l2data.currentOrder.forEach( ( co ) => {
		addTableOrderO( co );
	} );
}
let totalCount = 0;
function addTableOrderB( k, v ) {
	const tr = addElement( elemOrder.tableOrderB, 'tr', 'cOrderItem' );

	const tdBeverage = addElement( tr, 'td', 'cBeverage', k );
	let size = Math.min( Math.max( 23 - k.length * 2, 11 ), 15 );
	tdBeverage.style.fontSize = `${size}px`;

	const option = JSON.parse( v.options );
	const optionStr = makeOptionStr( option );
	const tdOption = addElement( tr, 'td', 'cOption', optionStr );
	size = Math.min( Math.max( 25 - optionStr.length, 10 ), 15 );
	tdOption.style.fontSize = `${size}px`;

	const tdNum = addElement( tr, 'td' );

	const aPopup = addElement( tdNum, 'a', '', v.orderBys.length );
	totalCount += v.orderBys.length;
	function popupViewOrderBys() {
		removeChildAll( elemOrder.divPopup );
		addElement( elemOrder.divPopup, 'p', 'ctxt', k );
		addElement( elemOrder.divPopup, 'p', 'ctxt', optionStr );
		v.orderByDNs.forEach( ( oDN ) => {
			addElement( elemOrder.divPopup, 'span', 'stxt', oDN );
		} );

		const input = addElement( elemOrder.divPopup, 'input', 'cNadoNado', '' );
		input.type = 'button';
		input.value = '나도나도';
		input.addEventListener( 'click', () => {
			selectBeverage( k );
			checkOptions( option );
		} );

		showPopup( true );
	}
	aPopup.addEventListener( 'click', () => {
		popupViewOrderBys();
	} );
}
function setTotalForOrderB() {
	document.querySelector( 'span.cTotal' ).innerHTML = `총 ${totalCount} 잔`;
}
function makeTableOrderB() {
	removeChildAll( elemOrder.tableOrderB );
	totalCount = 0;
	l2data.buyKeysSorted.forEach( ( k ) => {
		l2data.currentBuy[k].forEach( ( v ) => {
			addTableOrderB( k, v );
		} );
	} );
}

const l2order = {
	cbBeverageList() {
		const select = document.querySelector( '#beverageList select' );
		removeChildAll( select );

		const option = addElement( select, 'option', '', '음료선택' );
		option.value = '';

		Object.keys( l2data.allBeverages ).forEach( ( bKey ) => {
			const beverage = l2data.allBeverages[bKey];
			/* const option = */addElement( select, 'option', '', beverage.name );
			// option.text = beverage.name;
			// option.value = beverage.name;
		} );
	},

	selectOrderBy() {
		const select = document.querySelector( '#orderBy' );
		select.value = l2data.login.uid;
	},

	cbUserList() {
		const select = document.querySelector( '#orderBy' );
		removeChildAll( select );

		const userKeys = Object.keys( l2data.allUsers );
		userKeys.sort( ( a, b ) => {
			const userA = l2data.allUsers[a];
			const userB = l2data.allUsers[b];
			const nameA = userA.name || userA.localID || `* ${a}`;
			const nameB = userB.name || userB.localID || `* ${b}`;
			if ( nameA > nameB ) {
				return 1;
			}
			if ( nameA < nameB ) {
				return -1;
			}
			return 0;
		} );

		userKeys.forEach( ( uid ) => {
			const user = l2data.allUsers[uid];
			if ( !user.deleted && user.enabled ) {
				const option = addElement( select, 'option', '',
					user.name || user.localID || `* ${uid}` );
				option.value = uid;
			}
		} );

		if ( select.length === 0 ) {
			const option = addElement( select, 'option', '', 'NNUULL' );
			option.value = -1;
		} else {
			select.value = l2data.login.uid;
		}
	},

	cbOrderList() {
		makeTableOrderO();
		makeTableOrderB();
		setTotalForOrderB();
	},


	cbShuttleList( shuttleList ) {
		const makeListener = ( uid, mode ) => ( () => {
			if ( !confirm( mode ? '셔틀 하시겠습니까?' : '휴가입니까?' ) ) {
				return;
			}
			const input = [];
			input.push( {
				uid,
				confirm: mode,
				deleted: !mode,
			} );
			fetchHelper( '/user/shuttle', null, input, 'confirmShuttle', ( data ) => {
				if ( data.code === 'OK' ) {
					if ( data.shuttleList ) {
						l2order.cbShuttleList( data.shuttleList );
					}
				} else {
					throw new MyError( 500, data );
				}
			} );
		} );

		elemOrder.shuttleList.forEach( ( el ) => {
			removeChildAll( el );
		} );

		let index = 0;
		shuttleList.forEach( ( sl ) => {
			const el = elemOrder.shuttleList[index];
			if ( sl.status >= 0 ) {
				const bShowButton = ( sl.uid === l2data.login.uid
									|| l2data.login.type === 'admin' )
									&& sl.status === 0;
				if ( bShowButton ) {
					const input1 = addElement( el, 'input' );
					input1.type = 'button';
					input1.value = sl.name;
					input1.style.padding = '1px';
					if ( sl.status === 1 ) {
						input1.disabled = true;
					}
					input1.addEventListener( 'click', makeListener( sl.uid, true ) );

					if ( l2data.login.type === 'admin' ) {
						const input2 = addElement( el, 'input' );
						input2.type = 'button';
						input2.value = '삭제';
						input2.style.padding = '1px';
						input2.addEventListener( 'click', makeListener( sl.uid, false ) );
					}
				} else {
					el.innerHTML = sl.name;
				}
				index += 1;
			}
		} );
	},
	getShuttleList() {
		fetchHelper( '/user/shuttle', null, null, 'getShuttle', ( data ) => {
			if ( data.code === 'OK' ) {
				if ( data.shuttleList ) {
					l2order.cbShuttleList( data.shuttleList );
				}
			} else {
				throw new MyError( 500, data );
			}
		} );
	},


	/*
	cbOrderOne( order ) {
		l2order._addTableOrderO( order );
		l2order._addTableOrderB( '엄훠', order );
		l2order._setTotalForOrderB();
	}
	*/
};

function onNewShuttle() {
	fetchHelper( '/user/newShuttle', null, null, 'newShuttle', ( data ) => {
		if ( data.code === 'OK' ) {
			if ( data.shuttleList ) {
				l2order.cbShuttleList( data.shuttleList );
			}
		} else {
			throw new MyError( 500, data );
		}
	} );
}
