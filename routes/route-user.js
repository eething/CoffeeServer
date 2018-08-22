'use strict';
var user = require( '../codes/user' );
var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {
	res.render( 'user' );
} );

router.post( '/', function ( req, res ) {

	let handler = ( { err, msg } ) => {
		var sendMsg = `<h1>${err}</h1>`;
		for( var m of msg ) {
			sendMsg += `<li>${m}</li>`;
		}
		res.send( sendMsg );
	}

	if( req.body.mode === 'add' || req.body.mode === 'edit' ) {
		user.addUser( req.body, handler );
	} else if( req.body.mode === 'del' ) {
		beverage.deleteUser( req.body, handler );
	} else {
		res.send( `<h1>Invalid MODE : ${req.body.mode}</h1>` );
	}

} );

router.get( '/list', function ( req, res ) {
	res.send( JSON.stringify( user.allUsers ) );
} );

module.exports = router;
