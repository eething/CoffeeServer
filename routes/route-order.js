'use strict';
var beverage = require( '../codes/order' );
var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
	res.render( 'order' ); //, { title: 'Express' } );
} );

router.post( '/', function ( req, res ) {

	let msg = '<h1>Order Requested</h1>';
	for( const b in req.body ) {
		msg += `<li>${b} : ${req.body[b]}</li>`
	}
	res.send( msg );
} );

module.exports = router;
