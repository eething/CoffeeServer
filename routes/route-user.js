'use strict';
const user = require( '../codes/user' );
const express = require( 'express' );

const router = express.Router();

router.get( '/', function ( req, res ) {
	let params = {};
	if( req.user ) {
		params.loginName = req.user.name;
		params.loginID = req.user.id;
		params.loginUID = user.loginIDList[ req.user.id ];
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

			return user.loginIDList[ req.user.id ];
			/*
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
			*/

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

			if( sendMsg.code !== 'OK' ) {
				res.send( JSON.stringify( sendMsg ) );
				return;
			}

			req.login( sendMsg.uid, err => {
				if( err ) {
					sendMsg.code = 'ELOGIN';
					sendMsg.err = err;
					res.send( JSON.stringify( sendMsg ) );
					return;
				}

				req.session.save( err => {
					if( err ) {
						sendMsg.code = 'ESS';
						sendMsg.err = err;
					} else {
						//sendMsg.code = 'OK' // 이미 OK
						//sendMsg.admin = user.allUsers[ uid ].admin; // 첫 생성에 admin 일리 없으니까
					}
					res.send( JSON.stringify( sendMsg ) );
				} );
			} );


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

			const deleteMe = ( req.body.uid == -1 ||
				user.loginIDList[ req.user.id ] == req.body.uid );

			if( sendMsg.code !== 'OK' || !deleteMe ) {
				res.send( JSON.stringify( sendMsg ) );
				return;
			}

			req.logout();
			req.session.save( err => {
				if( err ) {
					sendMsg.code = 'ESS';
					sendMsg.err = err;
				} else {
					//sendMsg.code = 'OK'; // 이미 OK
				}
				res.send( JSON.stringify( sendMsg ) );
			} );
		} );
	} else if( req.body.mode === 'enable' ) {

		if( req.body.uid == -1 ) {
			res.send( JSON.stringify( {
				code: 'ESELF',
				err: 'Can not enable yourself'
			} ) );
		}

		const uid = checkAuth();
		if( uid === false ) {
			return;
		}

		user.enableUser( uid, req.body, sendMsg => {
			res.send( JSON.stringify( sendMsg ) );
		} );

	} else if( req.body.mode === 'disable' ) {

		if( req.body.uid == -1 ) {
			res.send( JSON.stringify( {
				code: 'ESELF',
				err: 'Can not disable yourself'
			} ) );
		}

		const uid = checkAuth();
		if( uid === false ) {
			return;
		}

		user.disableUser( uid, req.body, sendMsg => {
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

router.post( '/duplicatedID', function ( req, res ) {
	res.send( JSON.stringify( user.haveDuplicatedID( req.body.id ) ) );
} );

router.get( '/list', function ( req, res ) {
	res.setHeader( 'Content-Type', 'application/json' );
	res.send( user.getUserList() );
} );

module.exports = router;
