
const express = require( 'express' );

const users			= require( '../codes/user' );
const beverages		= require( '../codes/beverage' );
const orders		= require( '../codes/order' );
const shuttles		= require( '../codes/shuttle' );
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
	res.send( JSON.stringify( {
		allUsers: users.getUserList( req.user ),
	} ) );
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
				res.send( JSON.stringify( { code: 'ELOGIN', err: convertError( error ) } ) );
				return;
			}
			req.session.save( ( err ) => {
				if ( err ) {
					res.send( JSON.stringify( { code: 'ESS', err: convertError( err ) } ) );
					return;
				}
				sendMsg.allUsers = users.getUserList( user );
				sendMsg.allBeverages = beverages.allBeverages;
				orders.getCurrentOrder( ( currentOrder ) => {
					sendMsg.currentOrder = currentOrder;
					res.send( JSON.stringify( sendMsg ) );
				} );
			} ); // save
		} ); // login
	} ); // addUser
} );

router.post( '/editUser', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}

	const oldDisplayName = users.getDisplayName( req.user );

	users.editUser( req.user.uid, req.body, ( sendMsg ) => {
		const newDisplayName = users.getDisplayName( req.user );

		if ( oldDisplayName !== newDisplayName ) {
			orders.changeDisplayName( req.user.uid, newDisplayName );
		}
		sendMsg.allUsers = users.getUserList( req.user );
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/adminUser', ( req, res ) => {
	if ( checkAuth( req, res, 'admin' ) ) {
		return;
	}

	const uid = Number( req.body.uid );
	const user = users.allUsers[uid];
	const oldDisplayName = users.getDisplayName( user );

	users.editUser( uid, req.body, ( sendMsg ) => {
		const newDisplayName = users.getDisplayName( user );
		if ( oldDisplayName !== newDisplayName ) {
			orders.changeDisplayName( uid, newDisplayName );
		}

		sendMsg.allUsers = users.getUserList( req.user );
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/delUser', ( req, res ) => {
	if ( checkAuth( req, res, 'admin' ) ) {
		return;
	}

	const uid = Number( req.body.uid );

	users.deleteUser( uid, ( sendMsg ) => {
		if ( sendMsg.code !== 'OK' || uid !== req.user.uid ) {
			sendMsg.allUsers = users.getUserList( req.user );
			res.send( JSON.stringify( sendMsg ) );
			return;
		}

		req.logout();
		req.session.save( ( err ) => {
			if ( err ) {
				sendMsg.code = 'ESS';
				sendMsg.err = convertError( err );
			} else {
				// sendMsg.code = 'OK'; // 이미 OK
			}
			res.send( JSON.stringify( sendMsg ) );
		} );
	} );
} );

router.post( '/enableUser', ( req, res ) => {
	if ( checkAuth( req, res, 'admin' ) ) {
		return;
	}

	users.enableUser( req.body, ( sendMsg ) => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.post( '/disableUser', ( req, res ) => {
	if ( checkAuth( req, res, 'admin' ) ) {
		return;
	}

	users.disableUser( req.body, ( sendMsg ) => {
		res.send( JSON.stringify( sendMsg ) );
	} );
} );

router.get( '/shuttle', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}

	shuttles.getTodayShuttle( false, ( err, data ) => {
		if ( err ) {
			res.send( JSON.stringify( convertError( err ) ) );
		} else {
			res.send( JSON.stringify( {
				code: 'OK',
				shuttleList: data,
			} ) );
		}
	} );
} );

router.get( '/newShuttle', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}

	shuttles.getTodayShuttle( true, ( err, data ) => {
		if ( err ) {
			res.send( JSON.stringify( convertError( err ) ) );
		} else {
			res.send( JSON.stringify( {
				code: 'OK',
				shuttleList: data,
			} ) );
		}
	} );
} );

router.post( '/shuttle', ( req, res ) => {
	if ( checkAuth( req, res ) ) {
		return;
	}

	const confirmList = [];
	const deletedList = [];
	req.body.forEach( ( list ) => {
		if ( req.user.admin || req.user.uid === list.uid ) {
			if ( list.confirm ) {
				confirmList.push( list.uid );
			} else if ( list.deleted ) {
				deletedList.push( list.uid );
			}
		}
	} );

	shuttles.confirmShuttles( confirmList, deletedList, ( err, data ) => {
		if ( err ) {
			res.send( JSON.stringify( convertError( err ) ) );
		} else {
			res.send( JSON.stringify( {
				code: 'OK',
				shuttleList: data,
			} ) );
		}
	} );
} );

router.get( '/test', ( req, res ) => {
	const loadedStr = JSON.stringify( users.isLoaded );
	if ( Object.values( users.isLoaded ).includes( false ) ) {
		res.send( `false: ${loadedStr}` );
	} else {
		res.send( `true: ${loadedStr}` );
	}
} );

module.exports = router;
