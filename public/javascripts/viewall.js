﻿// viewall.js

l2all = {

	cbBeverageList() {
		l2beverage.cbBeverageList();
		l2order.cbBeverageList();
	},

	cbUserList() {
		l2user.cbUserList();
		l2order.cbUserList();
	},
}

function initAllElem() {
	elem.divOuterOrder = document.querySelector( 'div#outerOrder' );
	elem.divOuterUser = document.querySelector( 'div#outerUser' );
	elem.divOuterBeverage = document.querySelector( 'div#outerBeverage' );

	elem.outerList = [
		elem.divOuterOrder,
		elem.divOuterUser,
		elem.divOuterBeverage
	];

	changePage( 'order' );
}

function changePage( page ) {
	elem.outerList.forEach( o => {
		if( o.id.substr( 5 ).toLowerCase() === page.toLowerCase() ) {
			o.style.display = 'block'
		} else {
			o.style.display = 'none'
		}
	} );
}