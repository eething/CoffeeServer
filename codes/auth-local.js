'use strict';

const admins = require( './admin' );
const users = require( './user' );
const authCommon = require( './auth-common' );

const LocalStrategy = require( 'passport-local' ).Strategy;

const bcrypt = require( 'bcrypt' );

module.exports = {

	register( passport, router ) {
		this.registerRouter( passport, router );
		this.registerStrategy( passport );
	},

	registerRouter( passport, router ) {

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
				if( !user ) {
					info.code = info.code || 'ETC';
					res.send( JSON.stringify( info ) );
					return;
				}
				authCommon.processLogin( req, res, user );
			} )( req, res, next );
		} );

		router.get( '/logout', function ( req, res ) {
			//req.session.destroy( function ( err ) {
			req.logout();
			req.session.save( err => {
				let sendMsg = {};
				if( err ) {
					sendMsg.code = 'ESS';
					sendMsg.err = convertError( err );
				} else {
					sendMsg.code = 'OK';
				}
				res.send( JSON.stringify( sendMsg ) );
			} );
		} );
	},

	registerStrategy( passport ) {
		passport.use( new LocalStrategy( {
				usernameField: 'id',
				passwordField: 'password'
			},
			function ( id, pwd, done ) {
				const local = users.allLocals[id];
				const uid = local ? local.uid : -1;
				const user = users.allUsers[uid];
				if( !user ) {
					return done( null, false, { code: 'ENOUSER', message: 'Incorrect username.' } );
				}
				if( user.deleted ) {
					return done( null, false, { code: 'EDELETED', message: 'Deleted User. Ask admin.' } );
				}
				bcrypt.compare( pwd, local.password, ( err, result ) => {
					if( result ) {
						return done( null, user, { code: 'OK' } );
					} else {
						return done( null, false, { code: 'EPASSWORD', message: 'Incorrect password.' } );
					}
				} );
			}
		) );
	}
};
