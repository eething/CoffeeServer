'use strict';
const fs = require( 'fs' );
const bcrypt = require( 'bcrypt' );

module.exports = {

	isLoaded: false,

	allUsers: {
		0: {
			name: '관리자',
			id: 'admin',
			admin: true,
			password: '$2b$10$j4gB9lgzNoKvyEN5ZpV6SOkaGUKSrf8s0CvSQA4bq4ZLwBCrIUC8e'
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

	_findEmptyUID() {

		let uid = 1;
		while( uid < 10000 ) {
			if( !this.allUsers[uid] ) {
				if( uid > this.uniqueID ) {
					this.uniqueID = uid;
				}
				return uid;
			}
			++uid;
		}

		console.log( 'ERROR: Something Wrong at _findEmptyUID' );
		return ++this.uniqueID;
	},

	addUser( body, callback ) {

		//uid = ++this.uniqueID;
		const uid = this._findEmptyUID();
		let user = {};

		let changePassword = false;
		for( let key in body ) {
			let value = body[key];

			if( key === 'mode' || key === 'uid' ) {
				continue;
			} else if( key == 'password' ) {
				if( value === '' ) {
					callback( {
						code: 'EPASSWORD',
						err: 'Empty Password.'
					} );
					return;
				}
				changePassword = true;
			}

			user[ key ] = value;
		}

		const _finalize = () => {

			let userString = JSON.stringify( user );
			const filePath = `data/users/${uid}`;
			fs.writeFile( filePath, userString, err => {
				if( err ) {
					callback( {
						code: 'EWRITE',
						err: err,
						msg: `uid=${uid}, userString=${userString}.`
					} );
				} else {
					this.allUsers[ uid ] = user;
					callback( {
						code: 'OK'
					} );
				}
			} );
		}

		if( changePassword ) {
			bcrypt.hash( user.password, 10, ( err, hash ) => {
				user.password = hash;
				_finalize();
			} );
		} else {
			_finalize();
		}
	},

	editUser( uid, body, callback ) {

		if( uid < 0 ) {
			callback( {
				code: 'EUID',
				err: `Invalid uid=${uid}. It must be < 0.`
			} );
			return;
		}

		const user = this.allUsers[ uid ];
		if( !user ) {
			callback( {
				code: 'ENOUSER',
				err: `User Not Found, uid=${uid}.`
			} );
			return;
		}

		let changePassword = false;
		for( let key in body ) {
			let value = body[key];

			if( key === 'mode' || key === 'uid' ) {
				continue;
			} else if( key === 'id' ) {
				continue;
			} else if( key == 'password' ) {
				if( value === '' ) {
					continue;
				}
				changePassword = true;
			}

			user[ key ] = value;
		}

		const _finalize = () => {
			
			let userString = JSON.stringify( user );
			const filePath = `data/users/${uid}`;
			fs.writeFile( filePath, userString, err => {
				if( err ) {
					callback( {
						code: 'EWRITE',
						err: err,
						msg: `uid=${uid}, userString=${userString}`
					} );
				} else {
					callback( {
						code: 'OK'
					} );
				}
			} );
		}

		if( changePassword ) {
			bcrypt.hash( user.password, 10, ( err, hash ) => {
				user.password = hash;
				_finalize();
			} );
		} else {
			_finalize();
		}
	},

	deleteUser( uid, body, callback ) {

		if( uid < 0 ) {
			callback( {
				code: 'EUID',
				err: `Invalid uid=${uid}. It must be < 0.`
			} );
			return;
		}

		user = this.allUsers[ uid ];
		if( !user ) {
			callback( {
				code: 'ENOUSER',
				err: `User Not Found, uid=${uid}.`
			} );
			return;
		}

		function _finalize() {
			const filePath = `data/users/${uid}`;
			fs.unlink( filePath, err => {
				if( err ) {
					callback( {
						code: 'EWRITE',
						err: err,
						msg: `uid=${uid}`
					} );
				} else {

					if( uid != 0 ) {
						delete allUsers[ uid ];
					} else {
						// TODO - 관리자 초기화...
						allUsers[0] = {
							name: '관리자',
							id: 'admin',
							admin: true,
							password: '$2b$10$j4gB9lgzNoKvyEN5ZpV6SOkaGUKSrf8s0CvSQA4bq4ZLwBCrIUC8e'
						};
					}

					callback( {
						code: 'OK'
					} );
				}
			} );
		}
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
