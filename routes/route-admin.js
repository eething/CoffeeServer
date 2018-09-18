'use strict';

//const users			= require( '../codes/user' );
//const beverages		= require( '../codes/beverage' );
//const orders		= require( '../codes/order' );
const admins		= require( '../codes/admin' );
const checkAuth		= require( '../lib/check-auth' );
const convertError	= require( '../lib/convert-error' );
const express		= require( 'express' );

const router = express.Router();

router.get( '/', function ( req, res ) {
	let params = {};
	/*
	if( req.user ) {
		params.loginName = req.user.name;
		params.loginUID = req.user.uid ];
		params.loginID = users.authTable[ req.user.uid ].local;
		if( req.user.admin ) {
			params.loginType = 'admin';
		} else {
			params.loginType = 'user';
		}
	}
	*/
	res.render( 'admin', params );
} );

function checkAuthAdmin( req, res ) {
	if( checkAuth( req, res ) ) {
		return true;
	}
	if( !req.user.admin ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You are not ADMIN.'
		} ) );
		return true;
	}
}

router.post( '/', ( req, res ) => {
	if ( checkAuthAdmin( req, res ) ) {
		return;
	}
	admins.setProvider( req.body, ( sendMsg ) => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.get( '/list', ( req, res ) => {
	if ( checkAuthAdmin( req, res ) ) {
		return;
	}
	res.send( JSON.stringify( { code: 'OK', credentials: admins.credentials } ) );
} );

module.exports = router;
