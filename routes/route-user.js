
const express = require( 'express' );

const users			= require( '../codes/user' );
const beverages		= require( '../codes/beverage' );
const orders		= require( '../codes/order' );
const checkAuth		= require( '../lib/check-auth' );
const convertError	= require( '../lib/convert-error' );

const router = express.Router();

router.get( '/', ( req, res ) => {
	const params = {};
	if ( req.user ) {
		params.loginName = req.user.name;
		params.loginUID = req.user.uid;
		params.loginID = users.getAuthID( 'Local', req.user.uid );
		if ( req.user.admin ) {
			params.loginType = 'admin';
		} else {
			params.loginType = 'user';
		}
	}
	res.render( 'user', params );
} );

router.post( '/duplicatedID', ( req, res ) => {
	res.send( JSON.stringify( users.haveDuplicatedID( req.body.id ) ) );
} );

router.get( '/list', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}
	res.send( JSON.stringify( { allUsers: users.getUserList() } ) );
} );

router.post( '/addUser', ( req, res ) => {
	users.addUser( req.body, ( sendMsg ) => {
		if ( sendMsg.code !== 'OK' ) {
			res.send( JSON.stringify( sendMsg ) );
			return;
		}

		const user = users.allUsers[sendMsg.uid];
		req.login( user, ( error ) => {
			if ( error ) {
				sendMsg.code = 'ELOGIN';
				sendMsg.err = convertError( error );
				res.send( JSON.stringify( sendMsg ) );
				return;
			}
			req.session.save( ( err ) => {
				if ( err ) {
					sendMsg.code = 'ESS';
					sendMsg.err = convertError( err );
					res.send( JSON.stringify( sendMsg ) );
				} else {
					sendMsg.allUsers = users.getUserList();
					sendMsg.allBeverages = beverages.allBeverages;
					orders.getCurrentOrder( ( currentOrder ) => {
						sendMsg.currentOrder = currentOrder;
						res.send( JSON.stringify( sendMsg ) );
					} );
				}
			} ); // save
		} ); //login
	} ); // addUser
} );

router.post( '/editUser', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return false;
	}

	const oldDisplayName = users.getDisplayName( req.user );

	users.editUser( req.user.uid, req.body, ( sendMsg ) => {
		const newDisplayName = users.getDisplayName( req.user );

		if ( oldDisplayName !== newDisplayName ) {
			orders.changeDisplayName( req.user.uid, newDisplayName );
		}
		sendMsg.allUsers = users.getUserList();
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

function checkAuthAdmin( req, res ) {
	if ( checkAuth( req, res ) ) {
		return true;
	}
	if ( !req.user.admin ) {
		res.send( JSON.stringify( {
			code: 'EAUTH',
			err: 'You are not ADMIN.',
		} ) );
		return true;
	}
}

router.post( '/adminUser', ( req, res ) => {
	if ( checkAuthAdmin( req, res ) ) {
		return;
	}

	const { uid } = req.body;
	const user = users.allUsers[uid];
	const oldDisplayName = users.getDisplayName( user );

	users.editUser( uid, req.body, ( sendMsg ) => {
		const newDisplayName = users.getDisplayName( user );
		if ( oldDisplayName !== newDisplayName ) {
			orders.changeDisplayName( uid, newDisplayName );
		}

		sendMsg.allUsers = users.getUserList();
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/delUser', ( req, res ) => {
	if ( checkAuthAdmin( req, res ) ) {
		return;
	}

	const { uid } = req.body;

	users.deleteUser( uid, req.body, ( sendMsg ) => {

		if( sendMsg.code !== 'OK' || uid != req.user.uid ) {
			sendMsg.allUsers = users.getUserList();
			res.send( JSON.stringify( sendMsg ) );
			return;
		}

		req.logout();
		req.session.save( ( err ) => {
			if ( err ) {
				sendMsg.code = 'ESS';
				sendMsg.err = convertError( err );
			} else {
				//sendMsg.code = 'OK'; // 이미 OK
			}
			res.send( JSON.stringify( sendMsg ) );
		} );
	} );
} );

router.post( '/enableUser', ( req, res ) => {
	if ( checkAuthAdmin( req, res ) ) {
		return;
	}

	users.enableUser( req.body, ( sendMsg ) => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/disableUser', ( req, res ) => {
	if ( checkAuthAdmin( req, res ) ) {
		return;
	}

	users.disableUser( req.body, ( sendMsg ) => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

module.exports = router;
