
const LocalStrategy = require( 'passport-local' ).Strategy;
const bcrypt = require( 'bcrypt' );
// const flash = require( 'connect-flash' );

const convertError = require( '../lib/convert-error' );
const users = require( './user' );
const authCommon = require( './auth-common' );



module.exports = {

	register( passport, router ) {
		this.registerRouter( passport, router );
		this.registerStrategy( passport );
	},

	registerRouter( passport, router ) {
		router.get( '/login', ( req, res ) => {
			// res.render( 'login' );
			res.send( `
			<form action="/auth/login" method="post">
				<input type="text" name="id">
				<input type="password" name="password">
				<input type="submit">
			</form>
			` );
		} );

		/*
		router.post( '/login', passport.authenticate( 'local', {
			successRedirect: '/auth/success',
			failureRedirect: '/auth/failed'
			//failureFlash: true
		} ) );
		*/
		router.post( '/login', ( req, res, next ) => {
			passport.authenticate( 'local', ( err, user, info ) => {
				if ( err ) {
					res.send( JSON.stringify( {
						code: 'EAUTH',
						err: convertError( err ),
					} ) );
					return;
				}
				if ( !user ) {
					info.code = info.code || 'ETC';
					res.send( JSON.stringify( info ) );
					return;
				}
				authCommon.processLogin( req, res, user );
			} )( req, res, next );
		} );

		router.post( '/local', ( req, res, next ) => {
			passport.authenticate( 'local', ( err, user, info ) => {
				if ( err ) {
					req.flash( 'error', { code: 'EAUTH', err: convertError( err ) } );
					res.redirect( '/' );
					return;
				}
				if ( !user ) {
					info.code = info.code || 'ETC';
					req.flash( 'error', info );
					res.redirect( '/' );
					return;
				}
				req.login( user, ( error ) => {
					if ( error ) {
						req.flash( 'error', { code: 'ELOGIN', err: convertError( error ) } );
						res.redirect( '/' );
						return;
					}
					req.session.save( ( e ) => {
						if ( e ) {
							req.flash( 'error', { code: 'ESS', err: convertError( e ) } );
						} else {
							res.redirect( '/' );
						}
					} );
				} );
			} )( req, res, next );
		} );

		router.get( '/logout', ( req, res ) => {
			// req.session.destroy( function ( err ) {
			req.logout();
			req.session.save( ( err ) => {
				const sendMsg = {};
				if ( err ) {
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
			passwordField: 'password',
		},
		( id, pwd, done ) => {
			const local = users.allLocals[id];
			const uid = local ? local.uid : -1;
			const user = users.allUsers[uid];
			if ( !user ) {
				done( null, false, { code: 'ENOUSER', message: 'Incorrect username.' } );
				return;
			}
			if ( user.deleted ) {
				done( null, false, { code: 'EDELETED', message: 'Deleted User. Ask admin.' } );
				return;
			}
			bcrypt.compare( pwd, local.password, ( err, result ) => {
				if ( result ) {
					done( null, user, { code: 'OK' } );
					return;
				}
				done( null, false, { code: 'EPASSWORD', message: 'Incorrect password.' } );
			} );
		} ) );
	},
};
