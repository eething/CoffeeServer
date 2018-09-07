'use strict';
var beverages = require( '../codes/beverage' );
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
	res.render( 'beverage' );
} );

router.post( '/add', function ( req, res ) {
	if( checkAuth( req, res ) ) {
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
	if( checkAuth( req, res ) ) {
		return;
	}
	beverages.delBeverage( req.body, sendMsg => {
		if( sendMsg.code !== 'OK' ) {
			res.send( JSON.stringify( sendMsg ) );
			return;
		}
		sendMsg.allBeverages = beverages.allBeverages;
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.get( '/list', function ( req, res ) {
	if( checkAuth( req, res ) ) {
		return;
	}
	res.send( JSON.stringify( { allBeverages: beverages.allBeverages } ) );
} );

module.exports = router;
