'use strict';
const fs = require( 'fs' );

module.exports = {

	isLoaded: false,

	allUsers: {
		0: {
			name: '관리자',
			id: 'admin',
			password: 'qwer'
		}
	},

	uniqueID: 0,

	loadUsers() {
		fs.readdir( 'data/users', ( err, files ) => {
			let len = files.length;

			files.forEach( ( file ) => {
				const filePath = `data/users/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					if( err && err.code === 'EISDIR' ) {
						return;
					}

					--len;
					const value = JSON.parse( data );
					const key = file;
					this.allUsers[ key ] = value;

					if( key > this.uniqueID ) {
						this.uniqueID = key;
					}

					if( len === 0 ) {
						this.isLoaded = true;
					}
				} );
			} );
		} );
	},

	_getUser( uid ) {
		if( !this.isLoaded )
			return null;

		return allUsers[ uid ];
	},

	addUser( body, callback ) {

		let user;
		let uid = -1;
		if( body.mode === 'add' ) {
			uid = ++this.uniqueID;
			user = {}
			this.allUsers[uid] = user;
		} else if( body.mode === 'edit' ) {
			uid = body.uid;
			user = this.allUsers[uid];
			if( !user ) {
				callback( {
					err: 'editUser Failed',
					msg: ['User Not Found', `uid=${uid}`]
				} );
				return;
			}
		} else {
			callback( {
				err: 'addUser Failed',
				msg: ['Invalid Mode', `mode = ${body.mode}`]
			} );
		}

		for( let key in body ) {
			let value = body[key];

			if( key === 'mode' || key === 'uid' ) {
				continue;
			} else if( key === 'id' ) {
				if( body.mode === 'edit' ) {
					continue;
				}
			} else if( key == 'password' ) {
				if( body.mode === 'edit' && value === '' ) {
					continue;
				}
				// TODO - 암호화하기
			}

			user[ key ] = value;
		}

		let userString = JSON.stringify( user );
		const filePath = `data/users/${uid}`;
		fs.writeFile( filePath, userString, err => {
			if( err ) {
				callback( {
					err: `${body.mode}User Failed`,
					msg: ['writeFile Failed', err, `uid=${uid}`, userString]
				} );
			} else {
				callback( {
					err: `${body.mode} Success`,
					msg: [`uid=${uid}`, userString]
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
				msg: [ `${command} Failed - Input is NOT Exist` ]
			} );
			return;
		}

		let msg = [ command ]
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

	getUserList() {
		let temp = {};
		for( const uid in this.allUsers ) {

			if( uid == 0 ) {
				continue;
			}

			temp[uid] = {};
			const user = this.allUsers[uid];			
			for( const key in user ) {
				if( key !== 'password' ) {
					temp[uid][key] = user[key];
				}
			}
		}

		return JSON.stringify( temp );
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
