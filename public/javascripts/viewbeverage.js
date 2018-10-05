// viewbeverage.js
/* eslint-env browser */
/* global MyError fetchHelper addElement removeChildAll l2data */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(?:on|init|l2)" }] */

l2data.view.beverage = true;

const l2beverage = {
	cbBeverageList() {
		const select = document.querySelector( '#beverageSelect2' );
		removeChildAll( select );

		Object.keys( l2data.allBeverages ).forEach( ( bKey ) => {
			const beverage = l2data.allBeverages[bKey];
			const option = document.createElement( 'option' );
			option.text = `${beverage.name}`;
			option.value = `${beverage.name}`;
			select.appendChild( option );
		} );
	},
};

function onAddBeverage( self ) {
	const f = self.form;
	if ( f.name.value === '' ) {
		alert( '음료명을 입력해주세요' );
		return;
	}

	const input = {
		name: f.name.value,
	};
	if ( f.iceable.checked ) {
		input.iceable = true;
	}
	if ( f.hotable.checked ) {
		input.hotable = true;
	}
	if ( f.syrupable.checked ) {
		input.syrupable = true;
	}
	if ( f.self.checked ) {
		input.self = true;
	}

	fetchHelper( '/beverage/add', null, input, 'addBeverage', ( data ) => {
		if ( data.code === 'OK' ) {
			l2data.setData( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function onDelBeverage( /* self */ ) {
	const input = {};
	let chkon = false;
	const delchks = document.querySelectorAll( 'input.delchk' );
	delchks.forEach( ( delchk ) => {
		if ( delchk.checked ) {
			chkon = true;
			input[delchk.name] = 1;
		}
	} );
	if ( !chkon ) {
		alert( '삭제할 음료를 선택해주세요' );
		return;
	}
	removeChildAll( document.querySelector( 'div.cDeleteList' ) );
	fetchHelper( '/beverage/del', null, input, 'delBeverage', ( data ) => {
		if ( data.code === 'OK' ) {
			l2data.setData( data );
		} else {
			throw new MyError( 500, data );
		}
	} );
}

function onAddDelete( /* self */ ) {
	const divDeleteList = document.querySelector( 'div.cDeleteList' );
	let { value } = document.querySelector( '#delBeverage ' );
	if ( !value ) {
		( { value } = document.querySelector( '#beverageSelect2' ) );
	}
	if ( !value || !l2data.allBeverages[value] ) {
		return;
	}

	const delchks = document.querySelectorAll( '.delchk' );
	let bFound = false;
	delchks.forEach( ( d ) => {
		if ( d.id === value ) {
			bFound = true;
		}
	} );
	if ( bFound ) {
		return;
	}

	const p = addElement( divDeleteList, 'p', '' );
	const input = addElement( p, 'input', 'delchk' );
	input.type = 'checkbox';
	input.id = value;
	input.name = value;
	input.checked = true;

	const label = addElement( p, 'label', '', value );
	label.setAttribute( 'for', value );
}
