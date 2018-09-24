// viewall.js
/* eslint-env browser */
/* global l2data l2user l2beverage l2order elem */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(?:on|init|l2)" }] */

l2data.view.all = true;

const l2all = {

	cbAllList( data ) {
		if ( data.code === 'EAUTH' ) {
			this.changePage( 'User' );
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
	},

	changePage( page ) {
		elem.outerList.forEach( ( o ) => {
			if ( o.id.substr( 5 ) === page ) {
				o.style.display = 'block';
			} else {
				o.style.display = 'none';
			}
		} );
	},

	showAdminMenu( bShow ) {
		if ( !elem.divMenuAdmin ) {
			elem.divMenuAdmin = document.querySelector( '#menu_admin' );
		}
		elem.divMenuAdmin.style.display = bShow ? 'inline-block' : 'none';
	},
};



function initAllElem( loginType ) {
	elem.divOuterOrder = document.querySelector( 'div#outerOrder' );
	elem.divOuterUser = document.querySelector( 'div#outerUser' );
	elem.divOuterBeverage = document.querySelector( 'div#outerBeverage' );
	elem.divOuterAdmin = document.querySelector( 'div#outerAdmin' );

	elem.outerList = [
		elem.divOuterOrder,
		elem.divOuterUser,
		elem.divOuterBeverage,
		elem.divOuterAdmin,
	];

	if ( loginType !== 'admin' ) {
		l2all.showAdminMenu( false );
	}
	l2all.changePage( 'Order' );
}
