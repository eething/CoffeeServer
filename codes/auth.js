'use strict';

const users		= require( './user' );
const beverages	= require( './beverage' );
const orders	= require( './order' );
const admins	= require( './admin' );

const convertError = require( '../lib/convert-error' );

const passport			= require( 'passport' );
const LocalStrategy		= require( 'passport-local' ).Strategy;
const FacebookStrategy	= require( 'passport-facebook' ).Strategy;
//const GoogleStrategy = require( 'passport-google' ).Strategy;
//const KakaoStrategy = require( 'passport-kakao' ).Strategy;
//const TwitterStrategy = require( 'passport-twitter' ).Strategy;

const express = require( 'express' );
const router = express.Router();

const session = require( 'express-session' );
const FileStore = require( 'session-file-store' )( session );

const bcrypt = require( 'bcrypt' );

module.exports = function ( app ) {

	app.use( session( {
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		store: new FileStore()
	} ) );
	app.use( passport.initialize() );
	app.use( passport.session() );

	passport.serializeUser( function ( user, done ) {
		done( null, users.loginIDList[ user.id ] );
	} );

	passport.deserializeUser( function ( uid, done ) {
		const user = users.allUsers[ uid ];
		let err = '';
		if( !user ) {
			err = `CANNOT deserializeUser: ${uid}`;
		}
		done( err, user );
	} );

	passport.use( new LocalStrategy( {
			usernameField: 'id',
			passwordField: 'password'
		},
		function ( id, pwd, done ) {
			const uid = users.loginIDList[ id ];
			const user = users.allUsers[ uid ];
			if( !user ) {
				return done( null, false, { code:'ENOUSER', message: 'Incorrect username.' } );
			}
			if( user.deleted ) {
				return done( null, false, { code: 'EDELETED', message: 'Deleted User. Ask admin.' } );
			}
			bcrypt.compare( pwd, user.password, ( err, result ) => {
				if( result ) {
					return done( null, user, { code: 'OK' } );
				} else {
					return done( null, false, { code: 'EPASSWORD', message: 'Incorrect password.' } );
				}
			} );
		}
	) );

	passport.use( new FacebookStrategy( {
			clientID: admins.credentials.Facebook.clientID,
			clientSecret: admins.credentials.Facebook.clientSecret,
			callbackURL: admins.credentials.Facebook.callbackURL
		},
		function ( accessToken, refreshToken, profile, done ) {
			const uid = users.facebookIDList[ profile.id ];
			const user = users.allUsers[ uid ];
			done( null, user, { code:'FACEBOOK', facebookID: profile.id } );
		}
	) );

	app.get( '/auth/facebook', passport.authenticate( 'facebook' ) );
	app.get( '/auth/facebook/callback', function ( req, res, next ) {
		passport.authenticate( 'facebook', ( err, user, info ) => {

			if( err ) {
				res.send( JSON.stringify( {
					code: 'EAUTH_F',
					err: convertError( err )
				} ) );
				return;
			}

			if( req.user ) {
				if( !req.user.facebookID ) {
					req.user.facebookID = info.facebookID;
					res.send( JSON.stringify( {
						code: 'OK',
						msg: 'New FacebookID',
						uid: users.loginIDList[ user.id ],
						facebookID: info.facebookID
					} ) );
				} else if( req.user.facebookID != info.facebookID ) {
					const oldID = req.user.facebookID;
					req.user.facebookID = info.facebookID;
					res.send( JSON.stringify( {
						code: 'OK',
						msg: 'Change FacebookID',
						uid: users.loginIDList[ user.id ],
						facebookID: info.facebookID,
						oldID: oldID
					} ) );
				}
				return;
			}

			let sendMsg = { info };

			if( !user ) {
				sendMsg.code = info.code || 'ETC';
				res.send( JSON.stringify( sendMsg ) );
				return;
			}
			req.login( user, err => {
				if( err ) {
					sendMsg.code = 'ELOGIN';
					sendMsg.err = convertError( err );
					res.send( JSON.stringify( sendMsg ) );
					return;
				}
				req.session.save( err => {
					if( err ) {
						console.log( `ERROR: Login - Session Save, ${err}...` );
						sendMsg.code = 'ESS';
						sendMsg.err = err;
					} else {
						sendMsg.code = 'OK'
						sendMsg.name = user.name;
						sendMsg.id = user.id;
						sendMsg.uid = users.loginIDList[ user.id ];
						sendMsg.facebookID = user.facebookID;
						sendMsg.admin = user.admin;
					}

					sendMsg.allUsers = users.getUserList();
					sendMsg.allBeverages = beverages.allBeverages;
					orders.getCurrentOrder( currentOrder => {
						sendMsg.currentOrder = currentOrder;
						res.send( JSON.stringify( sendMsg ) );
					} );
				} );
			} );
		} )( req, res, next );
	} );

	router.get( '/login', function ( req, res ) {
		//res.render( 'login' );
		res.send( `
			<form action="/auth/login" method="post">
				<input type="text" name="id">
				<input type="password" name="password">
				<input type="submit">
			</form>
			`);
	} );

	/*
	router.post( '/login', passport.authenticate( 'local', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failed'
		//failureFlash: true
	} ) );
	*/
	router.post( '/login', function ( req, res, next ) {
		passport.authenticate( 'local', ( err, user, info ) => {

			if( err ) {
				res.send( JSON.stringify( {
					code: 'EAUTH',
					err: convertError( err )
				} ) );
				return;
			}

			let sendMsg = { info };

			if( !user ) {
				sendMsg.code = info.code || 'ETC';
				res.send( JSON.stringify( sendMsg ) );
				return;
			}

			req.login( user, err => {
				if( err ) {
					sendMsg.code = 'ELOGIN';
					sendMsg.err = convertError( err );
					res.send( JSON.stringify( sendMsg ) );
					return;
				}
				req.session.save( err => {
					if( err ) {
						console.log( `ERROR: Login - Session Save, ${err}...` );
						sendMsg.code = 'ESS';
						sendMsg.err = err;
					} else {
						sendMsg.code = 'OK'
						sendMsg.name = user.name;
						sendMsg.id = user.id;
						sendMsg.uid = users.loginIDList[ user.id ];
						sendMsg.admin = user.admin;
					}

					sendMsg.allUsers = users.getUserList();
					sendMsg.allBeverages = beverages.allBeverages;
					orders.getCurrentOrder( currentOrder => {
						sendMsg.currentOrder = currentOrder;
						res.send( JSON.stringify( sendMsg ) );
					} );
				} );
			} );
		} )( req, res, next );
	} );

	router.get( '/logout', function ( req, res ) {
 		//req.session.destroy( function ( err ) {
		req.logout();
		req.session.save( err => {
			let sendMsg = {};
			if( err ) {
				sendMsg.code = 'ESS';
				sendMsg.err = err;
			} else {
				sendMsg.code = 'OK';
			}
			res.send( JSON.stringify( sendMsg ) );
		} );
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

		let sendMsg = { code: 'OK' };
		sendMsg.allUsers = users.getUserList();
		sendMsg.allBeverages = beverages.allBeverages;
		orders.getCurrentOrder( currentOrder => {
			sendMsg.currentOrder = currentOrder;
			res.send( JSON.stringify( sendMsg ) );
		} );
	} );

	return router;
}
