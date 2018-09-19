
const express = require( 'express' );
const session = require( 'express-session' );
const FileStore = require( 'session-file-store' )( session );
const passport = require( 'passport' );

const authCommon	= require( './auth-common' );
const authLocal		= require( './auth-local' );
const authFacebook	= require( './auth-facebook' );
const authGoogle	= require( './auth-google' );
const authKakao		= require( './auth-kakao' );
const authTwitter	= require( './auth-twitter' );

const router = express.Router();



module.exports = function auth( app ) {
	app.use( session( {
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		store: new FileStore(),
	} ) );
	app.use( passport.initialize() );
	app.use( passport.session() );

	authCommon		.register( passport, router );
	authLocal		.register( passport, router );
	authFacebook	.register( passport, router );
	authGoogle		.register( passport, router );
	authKakao		.register( passport, router );
	authTwitter		.register( passport, router );

	return router;
};
