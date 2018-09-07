'use strict';
var orders = require( '../codes/order' );
var express = require( 'express' );
var router = express.Router();

function checkAuth( req, res ) {
	res.setHeader( 'Content-Type', 'application/json' );
	if( !req.user ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You must login.'
		} ) );
		return true;
	}
	return false;
}

router.get( '/', function ( req, res ) {
	res.render( 'order' ); //, { title: 'Express' } );
} );

router.post( '/', function ( req, res ) {
	if( checkAuth( req, res ) ) {
		return;
	}
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
