'use strict';
var beverage = require( '../codes/beverage' );
var express = require( 'express' );
var router = express.Router();


router.get( '/', function ( req, res ) {
	res.render( 'index', {
		title: 'Express'
	} );
} );

router.get( '/edit', function ( req, res ) {
	res.render( 'beverage_edit' );
} );

router.post( '/add', function ( req, res ) {

	beverage.addBeverage( req.body, ( { err, msg } ) => {
		var sendMsg = `<h1>${err}</h1>`;
		for( var m of msg ) {
			sendMsg += `<li>${m}</li>`;
		}
		res.send( sendMsg );
	} );

} );

router.post( '/del', function ( req, res ) {
	a = [1, 2, 3]; console.log( a[0] );
	beverage.deleteBeverage( req.body, ( { err, msg } ) => {
		var sendMsg = `<h1>${err}</h1>`;
		for( var m of msg ) {
			sendMsg += `<li>${m}</li>`;
		}
		res.send( sendMsg );
	} );
} );

router.get( '/list', function ( req, res ) {
	res.send( JSON.stringify( beverage.allBeverages ) );
} );

module.exports = router;
