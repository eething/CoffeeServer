// viewall.js
/* eslint-env browser */
/* global l2data l2user l2beverage l2order */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^(?:on|init|l2)" }] */

l2data.view.all = true;

const elemAll = {};

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
		elemAll.outerList.forEach( ( o ) => {
			if ( o.id.substr( 5 ) === page ) {
				o.style.display = 'block';
			} else {
				o.style.display = 'none';
			}
		} );
	},

	showAdminMenu( bShow ) {
		if ( !elemAll.divMenuAdmin ) {
			elemAll.divMenuAdmin = document.querySelector( '#menu_admin' );
		}
		elemAll.divMenuAdmin.style.display = bShow ? 'inline-block' : 'none';
	},
};



function initAllElem( loginType ) {
	elemAll.divOuterOrder		= document.querySelector( 'div#outerOrder' );
	elemAll.divOuterUser		= document.querySelector( 'div#outerUser' );
	elemAll.divOuterBeverage	= document.querySelector( 'div#outerBeverage' );
	elemAll.divOuterAdmin		= document.querySelector( 'div#outerAdmin' );

	elemAll.outerList = [
		elemAll.divOuterOrder,
		elemAll.divOuterUser,
		elemAll.divOuterBeverage,
		elemAll.divOuterAdmin,
	];

	if ( loginType !== 'admin' ) {
		l2all.showAdminMenu( false );
	}
	l2all.changePage( 'Order' );
}
