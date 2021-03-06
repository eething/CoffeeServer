﻿
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^next$" }] */

const fs			= require( 'fs' );
// const debug			= require( 'debug' )( 'CoffeeServer' );
const express		= require( 'express' );
const path			= require( 'path' );
// const favicon		= require( 'serve-favicon' );
const logger		= require( 'morgan' );
const cookieParser	= require( 'cookie-parser' );
const bodyParser	= require( 'body-parser' );

// Data Manager
const admins		= require( './codes/admin' );
const users			= require( './codes/user' );
const beverages		= require( './codes/beverage' );
const orders		= require( './codes/order' );
const shuttles		= require( './codes/shuttle' );

// Routers
const authFunc		= require( './codes/auth' );
const routeBeverage	= require( './routes/route-beverage' );
const routeIndex	= require( './routes/route-index' );
const routeOrder	= require( './routes/route-order' );
const routeUser		= require( './routes/route-user' );
const routeAdmin	= require( './routes/route-admin' );



function initExpress() {
	const app = express();

	app.locals.pretty = true;

	// view engine setup
	app.set( 'views', path.join( __dirname, 'views' ) );
	app.set( 'view engine', 'pug' );

	// uncomment after placing your favicon in /public
	// app.use(favicon(__dirname + '/public/favicon.ico'));
	app.use( logger( 'dev' ) );
	app.use( bodyParser.json() );
	app.use( bodyParser.urlencoded( { extended: false } ) );
	app.use( cookieParser() );
	app.use( express.static( path.join( __dirname, 'public' ) ) );
	app.use( '/evil-icons', express.static( path.join( __dirname, 'node_modules/evil-icons/assets' ) ) );

	// Auth
	const routeAuth = authFunc( app );

	app.use( '/',			routeIndex );
	app.use( '/auth',		routeAuth );
	app.use( '/beverage',	routeBeverage );
	app.use( '/order',		routeOrder );
	app.use( '/user',		routeUser );
	app.use( '/admin',		routeAdmin );

	app.get( '/env', ( req, res ) => {
		const env = app.get( 'env' );
		const port = process.env.PORT;
		res.send( `env: ${env}<BR>port: ${port}` );
	} );

	// catch 404 and forward to error handler
	app.use( ( req, res, next ) => {
		const err = new Error( 'Not Found' );
		err.status = 404;
		console.log( `ERROR NFD, ${err.status}, ${err.message}...` );
		next( err );
	} );

	// error handlers

	// development error handler
	// will print stacktrace
	if ( app.get( 'env' ) === 'development' ) {
		app.use( ( err, req, res, next ) => {
			console.log( `ERROR DEV, ${err}, ${err.status}, ${err.message}...` );
			if ( !res.headersSent ) {
				res.status( err.status || 500 );
				res.render( 'error', {
					message: err.message || err,
					error: err,
				} );
			}
		} );
	}

	// production error handler
	// no stacktraces leaked to user
	app.use( ( err, req, res, next ) => {
		console.log( `ERROR PROD, ${err.status}, ${err.message}...` );
		if ( !res.headersSent ) {
			res.status( err.status || 500 );
			res.render( 'error', {
				message: err.message,
				error: {},
			} );
		}
	} );

	app.set( 'port', process.env.PORT || 3000 );

	const server = app.listen( app.get( 'port' ), () => {
		const msg = `Express server listening on port ${server.address().port}`;
		console.log( msg );
		// debug( msg );
	} );
}

function initMain() {
	const displayNames = {};
	Object.keys( users.allUsers ).forEach( ( uid ) => {
		displayNames[uid] = users.getDisplayName( uid );
	} );
	orders.adjustDisplayNameAll( displayNames );

	initExpress();
}

// Initialize Directory and Load...
// 인증쪽 clientID, clientSecret 등이 필요해서 Admin 만 Sync 로
const checker = require( './lib/check-loaded' )( 5, initMain );

fs.mkdir( 'data', () => {
	admins.loadAdmins( checker );

	users.loadUsers( checker );

	fs.mkdir( 'data/beverages', () => {
		beverages.loadBeverages( checker );
	} );

	fs.mkdir( 'data/orders', () => {
		orders.loadOrders( false, checker );
	} );

	fs.mkdir( 'data/shuttles', () => {
		shuttles.loadShuttlePoint( checker );
	} );
} );
