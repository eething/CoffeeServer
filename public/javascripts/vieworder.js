// vieworder.js

let elem = {
}

function init() {

	elem.divIce = document.querySelector( 'div.cIce' );
	elem.divHot = document.querySelector( 'div.cHot' );
	elem.divSyrup = document.querySelector( 'div.cSyrup' );
	elem.radioIce = document.querySelector( 'input#ice' );
	elem.radioHot = document.querySelector( 'input#hot' );
	elem.divOrderList = document.querySelector( 'div.cOrderList' );

	l2data.getBeverageList( () => {
		let list = document.querySelector( '#beverageList' );
		removeChildAll( list );

		for( const bKey in l2data.allBeverages ) {
			let beverage = l2data.allBeverages[bKey];
			let option = document.createElement( 'option' );
			option.text = `${beverage.name}Text`;
			option.value = `${beverage.name}`;
			list.appendChild( option );
		}
	} );

	l2data.getCurrentOrderList( () => {
		removeChildAll( elem.divOrderList );
		let table = document.createElement( 'table' );
		for( const k of l2data.buyKeysSorted ) {

			for( const v of l2data.currentBuy[k] ) {
				let tr = document.createElement( 'tr' );
				tr.className = 'cOrderItem';

				let tdBeverage = document.createElement( 'td' );
				tdBeverage.className = 'cBeverage';
				tdBeverage.innerHTML = k;
				let size = Math.min( 23 - k.length * 2, 15 );
				size = Math.max( size, 11 );
				tdBeverage.style.fontSize = size + 'px';
				tr.appendChild( tdBeverage );

				const option = JSON.parse( v.options );
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
				let tdOption = document.createElement( 'td' );
				tdOption.className = 'cOption';
				tdOption.innerHTML = optionStr;
				size = Math.min( 23 - optionStr.length, 15 );
				size = Math.max( size, 10 );
				tdOption.style.fontSize = size + 'px';
				tr.appendChild( tdOption );

				let tdNum = document.createElement( 'td' );
				tdNum.innerHTML = v.orderBys.length;
				tr.appendChild( tdNum );

				table.appendChild( tr );
			}
		}
		elem.divOrderList.appendChild( table );
	} );
}

function order( self ) {
	if( self.beverage.value == "" ) {
		alert( '음료명을 입력해주세요' );
		return false;
	}
	if( !l2data.allBeverages[self.beverage.value] ) {
		alert( '없는 음료입니다.' );
		return false;
	}
	return true;
}
function showBeverageOptions( beverage ) {

	elem.radioIce.checked = false;
	elem.radioHot.checked = false;
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
function popupCandidateList( start ) {
	let visMode = 'hidden'
	if( start ) {
		visMode = 'visible';
	}
	document.querySelector( 'div.cDimmer' ).style.visibility = visMode;
	document.querySelector( 'div.cSelect' ).style.visibility = visMode;
}
function onChangeBeverage( value ) {
	let bShow = false;
	let beverage = l2data.allBeverages[value];
	if( beverage ) {
		bShow = true;
	} else if( value === "" ) {
		;
	} else {
		let oldList = document.querySelectorAll( 'p.stxt' );
		for( let o of oldList ) {
			document.querySelector( 'div.cSelect' ).removeChild( o );
		}
		let bFound = false;
		for( const k in l2data.allBeverages ) {
			const b = l2data.allBeverages[k];
			if( b.name.indexOf( value ) !== -1 ) {
				bFound = true;
				let p = document.createElement( 'p' );
				p.className = 'stxt';
				p.addEventListener( 'click', function ( event ) { selectBeverage( b.name ); } );
				p.innerHTML = b.name;
				document.querySelector( 'div.cSelect' ).appendChild( p );
			}
		}
		if( bFound ) {
			popupCandidateList( true );
		}
	}

	if( bShow ) {
		elem.divOrderList.style.display = 'none';
		showBeverageOptions( beverage );
	} else {
		elem.divOrderList.style.display = 'block';
		elem.divIce.style.display = 'none'
		elem.divHot.style.display = 'none'
		elem.divSyrup.style.display = 'none'
	}
}

function selectBeverage( name ) {
	document.querySelector( 'input#beverage' ).value = name;
	onChangeBeverage( name );
	popupCandidateList( false );
}
