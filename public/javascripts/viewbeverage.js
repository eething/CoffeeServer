// viewbeverage.js

l2data.view.beverage = true;

l2beverage = {
	cbBeverageList() {

		let select = document.querySelector( '#beverageSelect2' );
		removeChildAll( select );

		for( const bKey in l2data.allBeverages ) {
			let beverage = l2data.allBeverages[ bKey ];
			let option = document.createElement( 'option' );
			option.text = `${beverage.name}`;
			option.value = `${beverage.name}`;
			select.appendChild( option );
		}
	}
}

function addBeverage( self ) {
	const f = self.form;
	if( f.name.value == '' ) {
		alert( '음료명을 입력해주세요' );
		return;
	}

	const data = {
		name: f.name.value,
	}
	if( f.iceable.checked ) {
		data.iceable = true;
	}
	if( f.hotable.checked ) {
		data.hotable = true;
	}
	if( f.syrupable.checked ) {
		data.syrupable = true;
	}

	fetchHelper( '/beverage/add', data, 'addBeverage', data => {
		if( data.code == 'OK' ) {
			l2data.setData( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function delBeverage( self ) {
	const input = {};
	var chkon = false;
	var delchks = document.querySelectorAll( 'input.delchk' );
	for( var delchk of delchks ) {
		if( delchk.checked ) {
			chkon = true;
			input[ delchk.name ] = 1;
		}
	}
	if( !chkon ) {
		alert( '삭제할 음료를 선택해주세요' );
		return;
	}
	removeChildAll( document.querySelector( 'div.cDeleteList' ) );
	fetchHelper( '/beverage/del', input, 'delBeverage', data => {
		if( data.code == 'OK' ) {
			l2data.setData( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function addDelete( self ) {
	let divDeleteList = document.querySelector( 'div.cDeleteList' );
	let value = document.querySelector( '#delBeverage ' ).value;
	if( !value ) {
		value = document.querySelector( '#beverageSelect2' ).value;
	}
	if( !value || !l2data.allBeverages[value] ) {
		return;
	}

	let delchks = document.querySelectorAll( '.delchk' );
	for( let d of delchks ) {
		if( d.id === value ) {
			return;
		}
	}

	let p = addElement( divDeleteList, 'p', '' )
	let input = addElement( p, 'input', 'delchk' );
	input.type = 'checkbox';
	input.id = input.name = value;
	input.checked = true;

	let label = addElement( p, 'label', '', value );
	label.setAttribute( 'for', value );
}
