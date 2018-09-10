'use strict';

//const users			= require( '../codes/user' );
//const beverages		= require( '../codes/beverage' );
//const orders		= require( '../codes/order' );
const adminUser		= require( '../codes/admin' );
const checkAuth		= require( '../lib/check-auth' );
const convertError	= require( '../lib/convert-error' );
const express		= require( 'express' );

const router = express.Router();

router.get( '/', function ( req, res ) {
	let params = {};
	/*
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

/*
router.post( '/adminUser', function ( req, res ) {

	if( checkAuthAdmin( req, res ) ) {
		return;
	}
}
*/

router.post( '/facebook', function ( req, res ) {
	if( checkAuthAdmin( req, res ) ) {
		return;
	}
} );

router.get( '/list', function ( req, res ) {
	if( checkAuthAdmin( req, res ) ) {
		return;
	}
	res.send( JSON.stringify( {} ) );
} );
/*
router.post( '/addUser', function ( req, res ) {

	users.addUser( req.body, sendMsg => {

		if( sendMsg.code !== 'OK' ) {
			res.send( JSON.stringify( sendMsg ) );
			return;
		}

		const user = users.allUsers[sendMsg.uid];
		req.login( user, error => {
			if( error ) {
				sendMsg.code = 'ELOGIN';
				sendMsg.err = convertError( error );
				res.send( JSON.stringify( sendMsg ) );
				return;
			}
			req.session.save( err => {
				if( err ) {
					sendMsg.code = 'ESS';
					sendMsg.err = convertError( err );
					res.send( JSON.stringify( sendMsg ) );
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
} );

router.post( '/editUser', function ( req, res ) {

	if( checkAuth( req, res ) ) {
		return false;
	}

	const uid = users.loginIDList[ req.user.id ];
	const user = users.allUsers[ uid ];
	const oldDisplayName = user.name || user.ID || `* ${uid}`;

	users.editUser( uid, req.body, sendMsg => {
		const newDisplayName = user.name || user.ID || `* ${uid}`;
		if( oldDisplayName != newDisplayName ) {
			orders.changeDisplayName( uid, newDisplayName );
		}
		sendMsg.allUsers = users.getUserList();
		res.send( JSON.stringify( sendMsg ) );
	} );
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

router.post( '/adminUser', function ( req, res ) {

	if( checkAuthAdmin( req, res ) ) {
		return;
	}

	const uid = req.body.uid;
	const user = users.allUsers[ uid ];
	const oldDisplayName = user.name || user.ID || `* ${uid}`;

	users.editUser( uid, req.body, sendMsg => {
		const newDisplayName = user.name || user.ID || `* ${uid}`;
		if( oldDisplayName != newDisplayName ) {
			orders.changeDisplayName( uid, newDisplayName );
		}

		sendMsg.allUsers = users.getUserList();
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/delUser', function ( req, res ) {

	if( checkAuthAdmin( req, res ) ) {
		return;
	}

	const uid = req.body.uid;

	users.deleteUser( uid, req.body, sendMsg => {

		if( sendMsg.code !== 'OK' ||
			uid != users.loginIDList[req.user.id] ) {
			sendMsg.allUsers = users.getUserList();
			res.send( JSON.stringify( sendMsg ) );
			return;
		}

		req.logout();
		req.session.save( err => {
			if( err ) {
				sendMsg.code = 'ESS';
				sendMsg.err = convertError( err );
			} else {
				//sendMsg.code = 'OK'; // 이미 OK
			}
			res.send( JSON.stringify( sendMsg ) );
		} );
	} );
} );

router.post( '/enableUser', function ( req, res ) {

	if( checkAuthAdmin( req, res ) ) {
		return;
	}

	users.enableUser( req.body, sendMsg => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/disableUser', function ( req, res ) {

	if( checkAuthAdmin( req, res ) ) {
		return;
	}

	users.disableUser( req.body, sendMsg => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );
*/
module.exports = router;
