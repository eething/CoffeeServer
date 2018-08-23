// vieworder.js

let elem = {
}

function initOrder() {

	elem.divIce = document.querySelector( 'div.cIce' );
	elem.divHot = document.querySelector( 'div.cHot' );
	elem.divSyrup = document.querySelector( 'div.cSyrup' );
	elem.radioIce = document.querySelector( 'input#ice' );
	elem.radioHot = document.querySelector( 'input#hot' );
	elem.chkSyrup = document.querySelector( 'input#syrup' );
	elem.divOrderList = document.querySelector( 'div.cOrderList' );
	elem.divOrderB = document.querySelector( 'div.cOrderB' );
	elem.divOrderO = document.querySelector( 'div.cOrderO' );
	elem.divPopup = document.querySelector( 'div.cPopup' );

	elem.divOrderB.style.display = 'block';
	elem.divOrderO.style.display = 'none';

	l2data.getUserList( () => {
		let select = document.querySelector( '#orderBy' );
		removeChildAll( select );

		for( const uid in l2data.allUsers ) {
			let user = l2data.allUsers[uid];
			let option = addElement( select, 'option', '',
				user.name ? user.name : user.id );
			option.value = uid;
		}
	} );

	l2data.getBeverageList( () => {
		let select = document.querySelector( '#beverageList select' );
		removeChildAll( select );

		for( const bKey in l2data.allBeverages ) {
			let beverage = l2data.allBeverages[bKey];
			let option = addElement( select, 'option', '', beverage.name );
			//option.text = beverage.name;
			//option.value = beverage.name;
		}
	} );

	l2data.getCurrentOrderList( () => {

		function makeOptionStr( option ) {
			let optionStr = '';
			for( const k in option ) {
				if( k === 'icehot' ) {
					const icehot = ((option[k] === 'ice') ? '아이스' :
									(option[k] === 'hot') ? '따뜻' : '');
					optionStr =		icehot +
									((icehot && optionStr) ? '/' : '') +
									optionStr;
				} else if( k === 'syrup' ) {
					optionStr +=	(optionStr ? '/' : '') +
									(option[k] === 'minus' ? '시럽빼고' : '');
				}
			}
			return optionStr;
		}

		removeChildAll( elem.divOrderB );
		removeChildAll( elem.divOrderO );

		l2data.currentOrder.forEach( co => {
			let optionStr = makeOptionStr( co );
			const user = l2data.allUsers[co.orderBy];
			let username = '';
			if( user ) {
				username = user.name ? user.name : user.id;
			} else {
				username = `* ${co.orderBy}`
			}
			let div = addElement( elem.divOrderO, 'div', 'cOrderItem' );
			addElement( div, 'span', 'cOrderBy', username );
			addElement( div, 'span', 'cBeverageOption', `${co.beverage}(${optionStr})` );
			//addElement( div, 'span', 'cOption', optionStr );
			/*
			let optionKeys = Object.keys(co)
				.filter( b => (b !== 'orderBy' &&  b !== 'beverage') )
				.sort();
			let options = {};
			for( const k of optionKeys ) {
				options[k] = co[k];
			}
			*/
		} );

		let totalCount = 0;
		for( const k of l2data.buyKeysSorted ) {
			for( const v of l2data.currentBuy[k] ) {
				let divItem = addElement( elem.divOrderB, 'div', 'cOrderItem' );

				let spanBeverage = addElement( divItem, 'span', 'cBeverage', k );
				let size = Math.min( Math.max( 23 - k.length * 2, 11 ), 15 );
				spanBeverage.style.fontSize = size + 'px';

				const option = JSON.parse( v.options );
				let optionStr = makeOptionStr( option );
				let spanOption = addElement( divItem, 'span', 'cOption', optionStr );
				size = Math.min( Math.max( 23 - optionStr.length, 10 ), 15 );
				spanOption.style.fontSize = size + 'px';

				let spanNum = addElement( divItem, 'span' );
				let aPopup = addElement( spanNum, 'a', '', v.orderBys.length );
				totalCount += v.orderBys.length;
				function popupViewOrderBys() {
					removeChildAll( elem.divPopup );
					addElement( elem.divPopup, 'p', '', k );
					addElement( elem.divPopup, 'p', '', optionStr );
					v.orderBys.forEach( o => {
						let inner = '';
						const user = l2data.allUsers[o];
						if( user ) {
							inner = user.name ? user.name : user.id;
						} else {
							inner = `* ${o}`
						}
						addElement( elem.divPopup, 'p', '', inner );
					} );

					let input = addElement( elem.divPopup, 'input', 'cNadoNado', '' );
					input.type = 'button';
					input.value = '나도나도';
					input.addEventListener( 'click', function ( event ) {
						selectBeverage( k );
						checkOptions( option );
					} );

					showPopup( true );
				}
				aPopup.addEventListener( 'click', function ( event ) {
					popupViewOrderBys();
				} );
			}
		}

		let total = document.createElement( 'div' );
		total.innerHTML = `총 ${totalCount} 잔`;
		total.style = 'position:relative;margin:0;padding-left:100px;';
		elem.divOrderList.prepend( total )

		let swap = addElement( total, 'span', '', '유저별' );
		swap.style = 'position:absolute;right:20px;';
		swap.addEventListener( 'click', function ( event ) {
			if( elem.divOrderB.style.display === 'none' ) {
				elem.divOrderB.style.display = 'block';
				elem.divOrderO.style.display = 'none';
				this.innerHTML = '유저별';
			} else {
				elem.divOrderB.style.display = 'none';
				elem.divOrderO.style.display = 'block';
				this.innerHTML = '음료별';
			}
		} );
	} );
}

function order( self ) {
	if( self.beverage.value == "" ) {
		if( self.beverageSelect.value ) {
			self.beverage.value = self.beverageSelect.value;
		} else {
			alert( '음료명을 입력해주세요' );
			return false;
		}
	}
	if( !l2data.allBeverages[self.beverage.value] ) {
		alert( '없는 음료입니다.' );
		return false;
	}
	return true;
}
function checkOptions( option ) {
	elem.radioIce.checked = (option.icehot === 'ice');
	elem.radioHot.checked = (option.icehot === 'hot');
	elem.chkSyrup.checked = (option.syrup === 'minus');
}
function showBeverageOptions( beverage ) {
	elem.radioIce.checked = false;
	elem.radioHot.checked = false;
	elem.chkSyrup.checked = false;

	if( beverage.iceable ) {
		elem.divIce.style.display = 'block';
		if( !beverage.hotable ) {
			elem.radioIce.checked = true;
		}
	} else {
		elem.divIce.style.display = 'none';
	}
	if( beverage.hotable ) {
		elem.divHot.style.display = 'block';
		if( !beverage.iceable ) {
			elem.radioHot.checked = true;
		}
	} else {
		elem.divHot.style.display = 'none';
	}

	if( beverage.syrupable ) {
		elem.divSyrup.style.display = 'block';
	} else {
		elem.divSyrup.style.display = 'none';
	}
}
function showPopup( start ) {
	let visMode = 'hidden'
	if( start ) {
		visMode = 'visible';
	}
	document.querySelector( 'div.cDimmer' ).style.visibility = visMode;
	elem.divPopup.style.visibility = visMode;
}
function onChangeBeverage( value ) {
	let bShow = false;
	let beverage = l2data.allBeverages[value];
	if( beverage ) {
		bShow = true;
	} else if( value === "" ) {
		document.querySelector( '#beverage' ).style.backgroundColor = '';
	} else {
		removeChildAll( elem.divPopup );
		let bFound = false;
		for( const k in l2data.allBeverages ) {
			const b = l2data.allBeverages[k];
			if( b.name.indexOf( value ) !== -1 ) {
				bFound = true;
				let p = document.createElement( 'p' );
				p.className = 'stxt';
				p.addEventListener( 'click', function ( event ) {
					selectBeverage( b.name );
				} );
				p.innerHTML = b.name;
				elem.divPopup.appendChild( p );
			}
		}
		if( bFound ) {
			let p = document.createElement( 'p' );
			p.className = 'ctxt';
			p.innerHTML = '음료를 선택해주세요'
			elem.divPopup.prepend( p );
			showPopup( true );
		} else {
			document.querySelector( '#beverage' ).style.backgroundColor = 'red';
		}
	}

	if( bShow ) {
		elem.divOrderList.style.display = 'none';
		showBeverageOptions( beverage );
		document.querySelector( '#beverage' ).style.backgroundColor = 'lightgreen';
	} else {
		elem.divOrderList.style.display = 'block';
		elem.divIce.style.display = 'none'
		elem.divHot.style.display = 'none'
		elem.divSyrup.style.display = 'none'
	}
}

function selectBeverage( name ) {
	document.querySelector( '#beverageSelect' ).value = name;
	document.querySelector( '#beverage' ).value = name;
	onChangeBeverage( name );
	showPopup( false );
}
