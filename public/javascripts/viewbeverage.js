// viewbeverage.js

l2data.view.beverage = true;

l2beverage = {
	cbBeverageList() {

		let select = document.querySelector( '#beverageSelect2' );
		removeChildAll( select );

		for( const bKey in l2data.allBeverages ) {
			let beverage = l2data.allBeverages[ bKey ];
			let option = document.createElement( 'option' );
			option.text = `${beverage.name}Text`;
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
	const f = self.form;

	//var chkon = false;
	var delchks = document.querySelectorAll( 'input.delchk' );
	for( var delchk of delchks ) {
		if( delchk.checked ) {
			fetchHelper();
			return;
		}
	}
	alert( '삭제할 음료를 선택해주세요' );
}

function addDelete( self ) {
	let divDeleteList = document.querySelector( 'div.cDeleteList' );
	let value = document.querySelector( 'input#delBeverage ' ).value;

	if( !l2data.allBeverages[value] ) {
		return;
	}

	let delchks = document.querySelectorAll( '.delchk' );
	for( let d of delchks ) {
		if( d.id === value ) {
			return;
		}
	}

	let p = document.createElement( 'p' );
	divDeleteList.appendChild( p );

	let input = document.createElement( 'input' );
	input.type = 'checkbox';
	input.className = 'delchk'
	input.id = input.name = value;
	input.checked = true;
	p.appendChild( input );

	let label = document.createElement( 'label' );
	label.innerHTML = value;
	label.setAttribute( 'for', value );
	p.appendChild( label );
}
