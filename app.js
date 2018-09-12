'use strict';
var fs				= require( 'fs' );
var debug			= require( 'debug' )('CoffeeServer');
var express			= require( 'express' );
var path			= require( 'path' );
var favicon			= require( 'serve-favicon' );
var logger			= require( 'morgan' );
var cookieParser	= require( 'cookie-parser' );
var bodyParser		= require( 'body-parser' );

// Data Manager
var admins			= require( './codes/admin' );
var users			= require( './codes/user' );
var beverages		= require( './codes/beverage' );
var orders			= require( './codes/order' );

// Routers
//var routeAuth		= require( './routes/route-auth' );
var routeBeverage	= require( './routes/route-beverage' );
var routeIndex		= require( './routes/route-index' );
var routeOrder		= require( './routes/route-order' );
var routeUser		= require( './routes/route-user' );
var routeAdmin		= require( './routes/route-admin' );

// Initialize Directory and Load... Sync
try { fs.mkdirSync( 'data' ); } catch( err ) { }
try { fs.mkdirSync( 'data/admins' ); } catch( err ) { }
admins.loadAdmins();
try { fs.mkdirSync( 'data/users' ); } catch( err ) { }
try { fs.mkdirSync( 'data/users/facebook' ); } catch( err ) { }
try { fs.mkdirSync( 'data/users/google' ); } catch( err ) { }
try { fs.mkdirSync( 'data/users/kakao' ); } catch( err ) { }
try { fs.mkdirSync( 'data/users/twitter' ); } catch( err ) { }
users.loadUsers(); // TODO - change to Sync
try { fs.mkdirSync( 'data/beverages' ); } catch( err ) { }
beverages.loadBeverages(); // TODO - change to Sync
try { fs.mkdirSync( 'data/orders' ); } catch( err ) { }
orders.loadOrders(); // TODO - change to Sync
//

var app = express();

app.locals.pretty = true;

// view engine setup
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'pug' );

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( cookieParser() );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( '/evil-icons', express.static( path.join( __dirname, 'node_modules/evil-icons/assets' ) ) );

// Auth
var routeAuth		= require( './codes/auth' )( app );

app.use( '/',			routeIndex );
app.use( '/auth',		routeAuth );
app.use( '/beverage',	routeBeverage );
app.use( '/order',		routeOrder );
app.use( '/user',		routeUser );
app.use( '/admin',		routeAdmin );


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
	console.log( `ERROR NFD, ${err.status}, ${err.message}...` );
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if( app.get('env') === 'development' ) {
    app.use( function (err, req, res, next) {
		console.log( `ERROR DEV, ${err}, ${err.status}, ${err.message}...` );
		if( !res.headersSent ) {
			res.status( err.status || 500 );
			res.render( 'error', {
				message: err.message || err,
				error: err
			} );
		}
	} );
}

// production error handler
// no stacktraces leaked to user
app.use( function (err, req, res, next) {
	console.log( `ERROR PROD, ${err.status}, ${err.message}...` );
	if( !res.headersSent ) {
		res.status( err.status || 500 );
		res.render('error', {
			message: err.message,
			error: {}
    	} );
	}
} );

app.set( 'port', process.env.PORT || 3000 );

var server = app.listen( app.get( 'port' ), function () {
    debug( 'Express server listening on port ' + server.address().port );
} );
