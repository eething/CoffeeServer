// viewbeverage.js

l2beverage = {
	cbBeverageList() {
		let select = document.querySelector( '#beverageList2 select' );
		removeChildAll( select );

		for( const bKey in l2data.allBeverages ) {
			let beverage = l2data.allBeverages[bKey];
			let option = document.createElement( 'option' );
			option.text = `${beverage.name}Text`;
			option.value = `${beverage.name}`;
			select.appendChild( option );
		}
	}
}

function add( self ) {
	if( self.name.value == "" ) {
		alert( '음료명을 입력해주세요' );
		return false;
	}
	return true;
}

function del( self ) {
	var chkon = false;
	var delchks = document.querySelectorAll( 'input.delchk' );
	for( var delchk of delchks ) {
		if( delchk.checked ) {
			return true;
		}
	}
	alert( '삭제할 음료를 선택해주세요' );
	return false;
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
