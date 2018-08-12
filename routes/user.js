'use strict';
const fs = require( 'fs' );

module.exports = {

	isLoaded: false,

	allUsers: {},

	uniqueID: 0,

	loadUsers() {

		fs.readdir( 'data/users', ( err, files ) => {
			let len = files.length;

			files.forEach( ( file ) => {
				fs.readFile( files, ( err, data ) => {
					--len;

					const value = JSON.parse( data );
					const key = value.id;
					allUsers[key] = value;

					if( id > uniqueID ) {
						uniqueID = id;
					}

					if( len === 0 ) {
						this.isLoaded = true;
					}
				} );
			} );
		} );
	},

	_getUser( id ) {
		if( !this.isLoaded )
			return null;

		return allUsers[id];
	},

	addUser( body, callback ) {
		let user = { id: ++uniqueID };
		for( let key in body ) {
			let value = body[key];
			/* TODO - 암호화하기
			if( key == 'password' ) {
				
			}
			*/
			user[key] = value;
		}
		this.allUsers[user.id] = user;

		let userString = JSON.stringify( user );
		fs.writeFile( `data/users/${user.id}`, userString, ( err ) => {
			if( err ) {
				callback( {
					err: "WriteFileFailed",
					msg: [`addUser Failed - ${err}`]
				} );
			}
			else {
				callback( {
					err: "Success",
					msg: [`addUser Success - ${userString}`]
				} );
			}
		} );
	},

	_activateUser( active, body, callback ) {
		const command = active ? 'enableUser' : 'disableUser';

		let len = Object.keys( body ).length;
		if( len === 0 ) {
			callback( {
				err: "InputNotExist",
				msg: [`${command} Failed - Input is NOT Exist`]
			} );
			return;
		}

		let msg = [command]
		for( let key in body ) {
			let user = this._getUser( key );
			if( !user ) {
				--len;
				msg.push( `* User ${key} is not exist, or allUser is not LOADED` );
				if( len === 0 ) {
					callback( { msg: msg } );
				}
			} else {
				user.isActivate = active;

				fs.writeFile( `data/users/${user.id}`, userString, ( err ) => {
					--len;
					if( err ) {
						msg.push( `* ${err}` );
					} else {
						msg.push( `* Success - ${user.id}, ${user.name}` );
					}

					if( len === 0 ) {
						callback( { msg: msg } );
					}
				} );
			}
		}
	},

	enableUser( body, callback ) {
		this._activateUser( true, body, callback );
	},

	disableUser( body, callback ) {
		this._activateUser( false, body, callback );
	},

	deleteUser( body, callback ) {

	},

	changePassword( body, callback ) {
		let user = this._getUser( body.id );
		if( !user ) {
			callback( {
				err: "UserNotExist",
				msg: `User ${id} NOT exist`
			} );
			return;
		}

		// TODO - 암호화하기
		if( user.password !== body.oldPassword ) {
			callback( {
				err: "WrongOldPassword",
				msg: `Password Wrong - ${body.oldPassword}`
			} );
			return;
		}

		if( body.newPassword !== body.newPassword2 ) {
			callback( {
				err: "NewPasswordsNotSame",
				msg: `Password NOT Same - ${body.newPassword} ${body.newPassword2}`
			} );
			return;
		}

		// TODO - 암호화하기
		user.password = body.newPassword;
		callback( {
			err: "Success",
			msg: 'Password changed'
		} );
	},

	setFavorite( body, callback ) {

	}
}
