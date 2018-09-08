'use strict';

const users = require( '../codes/user' );
const beverages = require( '../codes/beverage' );
const orders = require( '../codes/order' );
const convertError = require( '../lib/convert-error' );
const express = require( 'express' );

const router = express.Router();

router.get( '/', function ( req, res ) {
	let params = {};
	if( req.user ) {
		params.loginName = req.user.name;
		params.loginID = req.user.id;
		params.loginUID = users.loginIDList[ req.user.id ];
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
					code: 'EAUTH',
					err: 'You must login.'
				} ) );
				return false;
			}

			return users.loginIDList[ req.user.id ];
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

		users.addUser( req.body, sendMsg => {

			if( sendMsg.code !== 'OK' ) {
				res.send( JSON.stringify( sendMsg ) );
				return;
			}

			const user = users.allUsers[ sendMsg.uid ];
			req.login( user, err => {
				if( err ) {
					sendMsg.code = 'ELOGIN';
					sendMsg.err = convertError( err );
					res.send( JSON.stringify( sendMsg ) );
					return;
				}
				req.session.save( err => {
					if( err ) {
						sendMsg.code = 'ESS';
						sendMsg.err = err;
						res.send( JSON.stringify( {
							code: 'ESS',
							err: err
						} ) );
					} else {
						sendMsg.name = user.name;
						sendMsg.id = user.id;
						sendMsg.allUsers = users.getUserList();
						sendMsg.allBeverages = beverages.allBeverages;
						orders.getCurrentOrder( currentOrder => {
							sendMsg.currentOrder = currentOrder;
							res.send( JSON.stringify( sendMsg ) );
						} );
					}
				} ); // save
			} ); //login
		} ); // addUser

	} else if( req.body.mode === 'edit' ) {

		const uid = checkAuth();
		if( uid === false ) {
			return;
		}

		const user = users.allUsers[uid].name;
		const oldDisplayName = user.name || user.ID;

		users.editUser( uid, req.body, sendMsg => {
			const newDisplayName = user.name || user.ID;
			if( oldDisplayName != newDisplayName ) {
				orders.changeDisplayName( uid, newDisplayName );
			}
			res.send( JSON.stringify( sendMsg ) );
		} );
	} else if( req.body.mode === 'del' ) {

		const uid = checkAuth();
		if( uid === false ) {
			return;
		}

		users.deleteUser( uid, req.body, sendMsg => {

			const deleteMe = ( req.body.uid == -1 ||
				users.loginIDList[ req.user.id ] == req.body.uid );

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

		users.enableUser( uid, req.body, sendMsg => {
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

		users.disableUser( uid, req.body, sendMsg => {
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
	res.send( JSON.stringify( users.haveDuplicatedID( req.body.id ) ) );
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
	res.send( JSON.stringify( { allUsers: users.getUserList() } ) );
} );

module.exports = router;
