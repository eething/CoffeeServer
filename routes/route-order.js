
const express = require( 'express' );

const orders = require( '../codes/order' );
const users = require( '../codes/user' );
const checkAuth = require( '../lib/check-auth' );

const router = express.Router();



router.get( '/', ( req, res ) => {
	// TODO - 코드중복 리팩토링
	const params = {};
	if ( req.user ) {
		params.loginName = req.user.name;
		params.loginUID = req.user.uid;
		params.loginID = users.getAuthID( 'Local', req.user.uid );
		if ( req.user.admin ) {
			params.loginType = 'admin';
		} else {
			params.loginType = 'user';
		}
	}
	res.render( 'order', params );
} );

router.post( '/', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}

	const uid = req.body.orderBy;
	/*
	const user = users.allUsers[uid];
	if ( !user ) {
		res.send( {
			code: 'ENOUSER',
			err: `User Not Found, uid=${uid}.`,
		} );
		return;
	}
	let displayName = user.name;
	if ( !displayName ) {
		const auth = users.authTable[user.uid];
		if ( auth && auth.local ) {
			displayName = auth.local;
		} else {
			displayName = `* ${user.uid}`;
		}
	}
	req.body.orderByDN = displayName;
	*/
	req.body.orderByDN = users.getDisplayName( uid );

	orders.addOrder( req.body, ( sendMsg ) => {
		res.send( sendMsg );
	} );
} );

router.get( '/list', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}
	orders.getCurrentOrder( ( currentOrder ) => {
		res.send( JSON.stringify( { currentOrder } ) );
	} );
} );

router.get( '/list/today', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}
	orders.getTodayOrder( ( todayOrder ) => {
		res.send( JSON.stringify( { todayOrder } ) );
	} );
} );

router.get( '/list/all', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}
	orders.getAllOrder( ( allOrders ) => {
		res.send( JSON.stringify( { allOrders } ) );
	} );
} );

module.exports = router;
