'use strict';
var user = require( '../codes/user' );
var express = require( 'express' );
var router = express.Router();

router.get( '/', function ( req, res ) {

	let params = {};
	if( req.user ) {
		params.loginName = req.user.name;
		params.loginID = req.user.id;

		if( req.user.admin ) {
			params.loginType = 'admin';
		} else {
			params.loginType = 'user';
		}
	}

	res.render( 'user', params );
} );

router.post( '/', function ( req, res ) {

	function checkAuth() {

		if( req.body.uid == -1 ) {

			if( !req.user ) {
				res.send( JSON.stringify( {
					code: 'ELOGIN',
					err: 'You must login.'
				} ) );
				return false;
			}

			if( !req.session ||
				!req.session.passport ||
				!req.session.passport.user ) {
				res.send( JSON.stringify( {
					code: 'ESESSION',
					err: 'Something wrong with Session.'
				} ) );
				return false;
			}

			return req.session.passport.user;

		} else {

			if( !req.user.admin ) {
				res.send( JSON.stringify( {
					code: 'EAUTH',
					err: 'You are not ADMIN.'
				} ) );
				return false;
			}

			return req.body.uid;
		}
	}

	if( req.body.mode === 'add' ) {

		user.addUser( req.body, sendMsg => {
			res.send( JSON.stringify( sendMsg) );
		} );

	} else if( req.body.mode === 'edit' ) {

		const uid = checkAuth();
		if( uid === false ) {
			return;
		}

		user.editUser( uid, req.body, sendMsg => {
			res.send( JSON.stringify( sendMsg ) );
		} );
	} else if( req.body.mode === 'del' ) {

		const uid = checkAuth();
		if( uid === false ) {
			return;
		}

		user.deleteUser( uid, req.body, sendMsg => {
			res.send( JSON.stringify( sendMsg ) );
		} );
	} else {
		res.send( JSON.stringify(
			{
				code: 'EMODE',
				err: `Invalid MODE: ${req.body.mode}.`
			} ) );
		//res.send( `<h1>Invalid MODE : ${req.body.mode}</h1>` );
	}

} );

router.get( '/list', function ( req, res ) {
	res.setHeader( 'Content-Type', 'application/json' );
	res.send( user.getUserList() );
} );

module.exports = router;
