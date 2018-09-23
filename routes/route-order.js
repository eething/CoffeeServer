
const express = require( 'express' );

const orders = require( '../codes/order' );
const users = require( '../codes/user' );
const checkAuth = require( '../lib/check-auth' );

const router = express.Router();



router.get( '/', ( req, res ) => {
	res.render( 'order' ); // , { title: 'Express' } );
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
