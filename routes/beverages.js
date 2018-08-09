'use strict';
var express = require( 'express' );
var router = express.Router();

/* GET home page. */
router.get( '/', function ( req, res ) {
    res.render( 'index', { title: 'Express' } );
} );

router.get( '/edit', function ( req, res ) {

	res.render( 'beverage_edit' );

} );

router.post( '/add', function ( req, res ) {

	console.log( req.body );

	var msg = '';

	for( var key in req.body )
	{
		msg += key + ' : ' + req.body[key] + '<br>';
	}

	res.send( 'this is add manager<br><br>' + msg );

} );

router.post( '/del', function ( req, res ) {

	console.log( req.body );

	var msg = '';

	for( var key in req.body ) {
		msg += key + ' : ' + req.body[key] + '<br>';
	}

	res.send( 'this is del manager<br><br>' + msg );


} );


module.exports = router;
