'use strict';
const user = require( './user' );
const passport = require( 'passport' );
const LocalStrategy = require( 'passport-local' ).Strategy;
const express = require( 'express' );
const router = express.Router();

const session = require( 'express-session' );
const FileStore = require( 'session-file-store' )( session );

const bcrypt = require( 'bcrypt' );

//let sCount = 0;
//let dCount = 0;

module.exports = function ( app ) {

	app.use( session( {
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		store: new FileStore()
	} ) );
	app.use( passport.initialize() );
	app.use( passport.session() );

	passport.serializeUser( function ( uid, done ) {
		//console.log( `serializeUser, ${sCount++}` );
		done( null, uid );
	} );

	passport.deserializeUser( function ( uid, done ) {
		const u = user.allUsers[ uid ];
		let err = '';
		if( !u ) {
			err = `CANNOT deserializeUser: ${uid}`;
			//console.log( err );
		}
		//console.log( `deserializeUser, ${dCount++}` );
		done( err, u );
	} );

	passport.use( new LocalStrategy( {
			usernameField: 'id',
			passwordField: 'password'
		},
		function ( id, pwd, done ) {
			//console.log( 'AUTH : START' );
			const uid = user.loginIDList[ id ];
			//for( const uid in user.allUsers ) {
				const u = user.allUsers[ uid ];
				//if( u.id === id ) {
					//console.log( 'AUTH : User Found' );
					if( u.deleted ) {
						return done( null, false, { code: 'EDELETED', message: 'Deleted User. Ask admin.' } );
					}
					bcrypt.compare( pwd, u.password, ( err, result ) => {
						if( result ) {
							//console.log( 'AUTH : Password Good' );
							return done( null, uid );
						} else {
							//console.log( 'AUTH : Password Fuck' );
							return done( null, false, { code: 'EPASSWORD', message: 'Incorrect password.' } );
						}
					} );
					return;
				//}
			//}
			//console.log( 'AUTH : User Not Found' );
			return done( null, false, { code:'ENOUSER', message: 'Incorrect username.' } );
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

	// 간헐적으로 에러가 남
	// EPERM: operation not permitted,
	// rename 'sessions\nvw-L3cTyKDbkKN3VKc1QXDw9KOYgYYR.json.3036754528' ->
	// sessions\nvw-L3cTyKDbkKN3VKc1QXDw9KOYgYYR.json'
	// req.session.save( callback ) 으로 해결 가능하다는 얘기가 있는데
	// 일단 귀찮으니 넘어가자-_-
	// ...
	// 가 아니라 redirect 가 아니라 send 방식으로 처리해야 함-_-
	// ajax fetch 로 할꺼니까... 일단 기능먼저...
	/*
	router.post( '/login', passport.authenticate( 'local', {
		successRedirect: '/auth/success',
		failureRedirect: '/auth/failed'
		//failureFlash: true
	} ) );
	*/
	// 우씨 자꾸 갱신이 안되서 짱남;;
	router.post( '/login', function ( req, res, next ) {
		passport.authenticate( 'local', ( err, uid, info ) => {

			let sendMsg = { code: 'UNKNOWN' };

			if( err ) {
				console.log( `ERROR: Login - passport.authenticate, ${err}...` );
				sendMsg.code = 'EAUTH';
				sendMsg.err = err;
				res.send( JSON.stringify( sendMsg ) );
				//next( err );
				return;
			}

			if( !uid ) { // 아마 uid 가 들어올 거임
				sendMsg.code = info.code || 'ETC';
				sendMsg.msg = info.message;
				res.send( JSON.stringify( sendMsg ) );
				//res.redirect( '/auth/failed' );
				return;
			}

			req.login( uid, err => {

				if( err ) {
					console.log( `ERROR: Login - req.login, ${err}...` );
					sendMsg.code = 'ELOGIN';
					sendMsg.err = err;
					res.send( JSON.stringify( sendMsg ) );
					//next( err );
					return;
				}

				req.session.save( err => {

					if( err ) {
						console.log( `ERROR: Login - Session Save, ${err}...` );
						sendMsg.code = 'ESS';
						sendMsg.err = err;
					} else {
						sendMsg.code = 'OK'
						sendMsg.admin = user.allUsers[uid].admin;
					}
					res.send( JSON.stringify( sendMsg ) );
					//res.redirect( '/auth/success' );
				} );
			} );
		} )( req, res, next );
	} );

	router.get( '/success', function ( req, res ) {
		console.log( req.user );
		if( req.user ) {
			res.send( `LOGIN SUCCESS You Are <BR>
			 			NAME: ${req.user.name}<BR>
			 			ID: ${req.user.id}<BR>
			 		` );
		} else {
			res.send( 'You Are NOT LOGINNED' );
		}
	} );

	router.get( '/failed', function ( req, res ) {
		console.log( req.user );
		res.send( `LOGIN FAILED You Are <BR>
			 ${JSON.stringify(req.user)}<BR>
			 ` );
	} );

	router.get( '/logout', function ( req, res ) {
 		//req.session.destroy( function ( err ) {
		req.logout();
		req.session.save( err => {

			let sendMsg = {};
			if( err ) {
				console.log( `ERROR: Logout - Session Save, ${err}...` );
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
