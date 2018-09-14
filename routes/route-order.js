'use strict';

const orders = require( '../codes/order' );
const users = require( '../codes/user' );
const checkAuth = require( '../lib/check-auth' );
const express = require( 'express' );

const router = express.Router();



router.get( '/', function ( req, res ) {
	res.render( 'order' ); //, { title: 'Express' } );
} );

router.post( '/', function ( req, res ) {
	if( checkAuth( req, res ) ) {
		return;
	}

	const uid = req.body.orderBy;
	const user = users.allUsers[ uid ];

	if( !user ) {
		res.send( {
			code: 'ENOUSER',
			err: `User Not Found, uid=${uid}.`
		} );
		return;
	}

	let displayName = user.name;
	if( !displayName ) {
		const auth = users.authTable[ user.uid ];
		if( auth && auth.local ) {
			displayName = auth.local;
		} else {
			displayName =  `* {user.uid}`;
		}
	}
	req.body.orderByDN = displayName;

	orders.addOrder( req.body, sendMsg => {
		res.send( sendMsg );
	} );
} );

router.get( '/list', function ( req, res ) {
	if( checkAuth( req, res ) ) {
		return;
	}
	orders.getCurrentOrder( currentOrder => {
		res.send( JSON.stringify( { currentOrder } ) );
	} );
} );

router.get( '/list/today', function ( req, res ) {
	if( checkAuth( req, res ) ) {
		return;
	}
	orders.getTodayOrder( todayOrder => {
		res.send( JSON.stringify( { todayOrder } ) );
	} );
} );

router.get( '/list/all', function ( req, res ) {
	if( checkAuth( req, res ) ) {
		return;
	}
	orders.getAllOrder( allOrders  => {
		res.send( JSON.stringify( { allOrders } ) );
	} );
} );

module.exports = router;
