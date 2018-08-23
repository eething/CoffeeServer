'use strict';
var order = require( '../codes/order' );
var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
	res.render( 'order' ); //, { title: 'Express' } );
} );

router.post( '/', function ( req, res ) {
	order.addOrder( req.body, ( { err, msg } ) => {
		let sendMsg = `<h1>${err}</h1>`;
		for( const m of msg ) {
			sendMsg += `<li>${m}</li>`;
		}
		res.send( sendMsg );
	} );
} );



router.get( '/list', function ( req, res ) {
	order.getCurrentOrder( obj => {
		res.send( JSON.stringify( obj ) );
	} );
} );

router.get( '/list/today', function ( req, res ) {
	order.getTodayOrder( obj => {
		if( obj ) {
			res.send( JSON.stringify( obj ) );
		} else {
			res.status(500).send( { error: 'Something failed!' } );
		}
	} );
} );

router.get( '/list/all', function ( req, res ) {
	order.getAllOrder( obj => {
		res.send( JSON.stringify( obj ) );
	} );
} );



module.exports = router;
