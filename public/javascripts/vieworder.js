let l2data = {
	allBeverages: {},

};
function removeChildAll( node ) {
	while( node.lastChild ) {
		node.removeChild( node.lastChild );
	}
}

function MyError( type, message ) {
	this.type = type;
	this.name = "L2Error";
	this.message = message;// || "Default Message";
}
MyError.prototype = new Error();
MyError.prototype.constructor = MyError;

function init() {
	fetch( '/beverage/list' )
		.then( res => {
			if( res.ok ) {
				return res.json();
			} else {
				throw new MyError( 404, "FAILED : Get Beverage List" );
			}
		} )
		.then( data => {
			l2data.allBeverages = data;
			let list = document.querySelector( '#beverageList' );
			removeChildAll( list );
			for( const bKey in l2data.allBeverages ) {
				let beverage = l2data.allBeverages[bKey];
				let option = document.createElement( 'option' );
				option.text = `${beverage.name}Text`;
				option.value = `${beverage.name}`;
				list.appendChild( option );
			}
		} )
		.catch( err => {
			// TODO - 에러창에 띄우기
			alert( `${err} (${err.type})` );
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

	let divIce = document.querySelector( 'div.cIce' );
	let divHot = document.querySelector( 'div.cHot' );
	let divSyrup = document.querySelector( 'div.cSyrup' );
	let radioIce = document.querySelector( '#ice' );
	let radioHot = document.querySelector( '#hot' );

	radioIce.checked = false;
	radioHot.checked = false;
	if( beverage.iceable ) {
		divIce.style.display = 'block';
		if( !beverage.hotable ) {
			radioIce.checked = true;
		}
	} else {
		divIce.style.display = 'none';
	}
	if( beverage.hotable ) {
		divHot.style.display = 'block';
		if( !beverage.iceable ) {
			radioHot.checked = true;
		}
	} else {
		divHot.style.display = 'none';
	}

	if( beverage.syrupable ) {
		divSyrup.style.display = 'block';
	} else {
		divSyrup.style.display = 'none';
	}
}
function popupCandidateList( start ) {
	let visMode = 'hidden'
	if( start ) {
		visMode = 'visible';
	}
	document.querySelector( 'div.dimmer' ).style.visibility = visMode;
	document.querySelector( 'div.autoselector' ).style.visibility = visMode;
}
function onChangeBeverage( self ) {
	console.log( 'onChangeBeverage' );

	let beverage = l2data.allBeverages[self.value];
	if( beverage ) {
		showBeverageOptions( beverage );
	} else if( self.value !== "" ) {
		let oldList = document.querySelectorAll( 'p.stxt' );
		for( let o of oldList ) {
			document.querySelector( 'div.autoselector' ).removeChild( o );
		}
		let bFound = false;
		for( const k in l2data.allBeverages ) {
			const b = l2data.allBeverages[k];
			if( b.name.indexOf( self.value ) !== -1 ) {
				bFound = true;
				let p = document.createElement( 'p' );
				p.className = 'stxt';
				p.addEventListener( 'click', function ( event ) { selectBeverage( b.name ); } );
				p.innerHTML = b.name;
				document.querySelector( 'div.autoselector' ).appendChild( p );
			}
		}
		if( bFound ) {
			popupCandidateList( true );
		}
	}
}
function selectBeverage( name ) {
	document.querySelector( 'input#beverage' ).value = name;
	popupCandidateList( false );
}
