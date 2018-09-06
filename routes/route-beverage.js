'use strict';
var beverages = require( '../codes/beverage' );
var express = require( 'express' );
var router = express.Router();


router.get( '/', function ( req, res ) {
	res.render( 'beverage' );
} );

router.post( '/add', function ( req, res ) {
	res.setHeader( 'Content-Type', 'application/json' );
	if( !req.user ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You must login.'
		} ) );
		return;
	}
	beverages.addBeverage( req.body, sendMsg => {
		if( sendMsg.code !== 'OK' ) {
			res.send( JSON.stringify( sendMsg ) );
			return;
		}
		sendMsg.allBeverages = beverages.allBeverages;
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/del', function ( req, res ) {

	beverages.deleteBeverage( req.body, ( { err, msg } ) => {
		var sendMsg = `<h1>${err}</h1>`;
		for( var m of msg ) {
			sendMsg += `<li>${m}</li>`;
		}
		res.send( sendMsg );
	} );
} );

router.get( '/list', function ( req, res ) {
	if( !req.user ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You must login.'
		} ) );
		return;
	}
	res.setHeader( 'Content-Type', 'application/json' );
	res.send( JSON.stringify( { allBeverages: beverages.allBeverages } ) );
} );

module.exports = router;
