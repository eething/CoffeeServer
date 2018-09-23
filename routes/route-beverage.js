
const express = require( 'express' );

const beverages = require( '../codes/beverage' );
const checkAuth = require( '../lib/check-auth' );

const router = express.Router();



router.get( '/', ( req, res ) => {
	res.render( 'beverage' );
} );

router.post( '/add', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}
	beverages.addBeverage( req.body, ( sendMsg ) => {
		if ( sendMsg.code !== 'OK' ) {
			res.send( JSON.stringify( sendMsg ) );
			return;
		}
		sendMsg.allBeverages = beverages.allBeverages;
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/del', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}
	beverages.delBeverage( req.body, ( sendMsg ) => {
		if ( sendMsg.code !== 'OK' ) {
			res.send( JSON.stringify( sendMsg ) );
			return;
		}
		sendMsg.allBeverages = beverages.allBeverages;
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.get( '/list', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}
	res.send( JSON.stringify( { allBeverages: beverages.allBeverages } ) );
} );

module.exports = router;
