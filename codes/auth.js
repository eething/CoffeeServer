'use strict';
const users = require( './user' );
const passport = require( 'passport' );
const LocalStrategy = require( 'passport-local' ).Strategy;
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

			let sendMsg = { info };

			if( err ) {
				sendMsg.code = 'EAUTH';
				sendMsg.err = err;
				res.send( JSON.stringify( sendMsg ) );
				return;
			}

			if( !user ) {
				sendMsg.code = info.code || 'ETC';
				res.send( JSON.stringify( sendMsg ) );
				return;
			}

			req.login( user, err => {
				if( err ) {
					sendMsg.code = 'ELOGIN';
					sendMsg.err = {};
					sendMsg.err.name = err.name;
					sendMsg.err.message = err.message;
					sendMsg.err.stack = err.stack;
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
						sendMsg.admin = user.admin;
					}
					res.send( JSON.stringify( sendMsg ) );
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

	return router;
}
