// viewall.js

l2data.view.all = true;

l2all = {

	cbAllList( data ) {
		console.log( data.code );
		if( data.code === 'EAUTH' ) {			
			changePage( 'User' );
		}
	},

	cbBeverageList() {
		l2beverage.cbBeverageList();
		l2order.cbBeverageList();
	},

	cbUserList() {
		l2user.cbUserList();
		l2order.cbUserList();
	},

	cbOrderList() {
		l2order.cbOrderList();
	}
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

	changePage( 'Order' );
}

function changePage( page ) {
	elem.outerList.forEach( o => {
		if( o.id.substr( 5 ) === page ) {
			o.style.display = 'block'
		} else {
			o.style.display = 'none'
		}
	} );
}
