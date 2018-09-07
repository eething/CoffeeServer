'use strict';
const fs = require( 'fs' );
const bcrypt = require( 'bcrypt' );

const adam = {
	name: '관리자',
	id: 'admin',
	password: '$2b$10$j4gB9lgzNoKvyEN5ZpV6SOkaGUKSrf8s0CvSQA4bq4ZLwBCrIUC8e', //qwer
	// admin: true,
	// enabled: false
}
Object.freeze( adam );

module.exports = {

	isLoaded: false,
	_maxUID: 0,

	// user -> id -> uid -> user ...
	allUsers: {}, // key: uid, value: user
	loginIDList: {}, // key: id, value: uid

	_initSuperAdmin() {
		this.allUsers[0]			= this.allUsers[0] || {};

		this.allUsers[0].name		= adam.name;
		this.allUsers[0].id			= adam.id;
		this.allUsers[0].password	= adam.password;
		this.allUsers[0].admin		= true;
		this.allUsers[0].enabled	= false;

		this.loginIDList[ 'admin' ]	= 0;
	},

	loadUsers() {

		this._initSuperAdmin();

		fs.readdir( 'data/users', ( err, files ) => {
			let len = files.length;
			if( len === 0 ) {
				this.isLoaded = true;
				return;
			}

			files.forEach( ( file ) => {
				const filePath = `data/users/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const uid = file;
					const value = JSON.parse( data );

					this.allUsers[ uid ] = value;
					this.loginIDList[ value.id ] = uid;

					if( uid > this._maxUID ) {
						this._maxUID = uid;
					}

					if( len === 0 ) {
						this.isLoaded = true;
					}
				} );
			} );
		} );
	},

	_getUser( uid, callback ) {

		if( !this.isLoaded ) {
			callback( {
				code: 'ELOAD',
				err: 'User Not Loaded'
			} );
			return false;
		}

		if( !(uid >= 0) ) {
			callback( {
				code: 'EUID',
				err: `Invalid uid=${uid}. It must be >= 0.`
			} );
			return false;
		}

		const user = this.allUsers[ uid ];
		if( !user ) {
			callback( {
				code: 'ENOUSER',
				err: `User Not Found, uid=${uid}.`
			} );
			return false;
		}

		return user;
	},

	_writeUser( uid, user, callback, success ) {

		if( typeof user === 'function' ) {
			success = callback;
			callback = user;
			user = this.allUsers[ uid ];
		}

		const userString = JSON.stringify( user );
		const filePath = `data/users/${uid}`;

		fs.writeFile( filePath, userString, err => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: err,
					msg: `uid=${uid}, userString=${userString}`
				} );
			} else {
				if( typeof success === 'function' ) {
					success();
				}
				callback( {
					code: 'OK',
					uid: uid
				} );
			}
		} );
	},

	haveDuplicatedID( id ) {
		let sendMsg = {};
		if( this.loginIDList[ id ] === undefined ) {
			sendMsg.code = 'OK';
		} else {
			sendMsg.code = 'EUSERID';
			sendMsg.err = 'UserID Already Exists.';
		}
		return sendMsg;
	},

	addUser( body, callback ) {

		const msg = this.haveDuplicatedID( body.id );
		if( msg.code !== 'OK' ) {
			callback( msg );
			return;
		}

		let user = {};
		let changePassword = false;
		for( let key in body ) {
			let value = body[ key ];

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

		const uid = ++this._maxUID;

		/*
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
						code: 'OK',
						uid: uid
					} );
				}
			} );
		}
		*/

		if( changePassword ) {
			bcrypt.hash( user.password, 10, ( err, hash ) => {
				user.password = hash;
				//_finalize();
				this._writeUser( uid, user, callback, () => {
					this.allUsers[ uid ] = user;
					this.loginIDList[ user.id ] = uid;
				} );
			} );
		} else {
			callback( {
				code: 'EPASSWORD',
				err: 'Password Not Exists.'
			} );
		}
	},

	editUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if( !user ) {
			return;
		}

		// old password check
		// 막 만들다보니 기존암호 입력 안하게 해버렸음-_-
		// 나중에 시간되면...
		/*
		bcrypt.compare( body.oldPassword, user.password, ( err, result ) => {
			if( !result ) {
				callback( {
					code: "EPASSWORD",
					err: `Password Wrong - ${body.oldPassword}`
				} );
			} else {
				// 아래 코드들을 여기서 실행
			}
		} );
		*/
		const oldID = user.id;

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

		if( user.id != oldID ) {
			delete loginIDList[ oldID ];
			loginIDList[ user.id ] = uid;
		}

		/*
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
		*/

		if( changePassword ) {
			bcrypt.hash( user.password, 10, ( err, hash ) => {
				user.password = hash;
				//_finalize();
				this._writeUser( uid, callback );
			} );
		} else {
			//_finalize();
			this._writeUser( uid, callback );
		}
	},

	deleteUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if( !user ) {
			return;
		}

		if( uid == 0 ) {
			_initSuperAdmin();
		} else {
			user.deleted = true;
		}

		this._writeUser( uid, callback );

		/*
		const filePath = `data/users/${uid}`;
		fs.unlink( filePath, err => {
			if( err ) {
				callback( {
					code: 'EUNLINK',
					err: err,
					msg: `uid=${uid}`
				} );
			} else {
				if( uid == 0 ) {
					this._initSuperAdmin();
				} else {
					delete allUsers[ uid ];
				}
				callback( { code: 'OK' } );
			}
		} );
		*/
	},

	enableUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if( !user ) {
			return;
		}

		if( user.disabled ) {
			user.disabled = false;
		}

		this._writeUser( uid, callback );
	},

	disableUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if( !user ) {
			return;
		}

		user.disabled = true;

		this._writeUser( uid, callback );
	},


	/*
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
	*/

	getUserList() {
		let temp = {};
		for( const uid in this.allUsers ) {

			//if( uid == 0 ) {
			//	continue;
			//}

			temp[uid] = {};
			const user = this.allUsers[uid];
			for( const key in user ) {
				if( key !== 'password' ) {
					temp[uid][key] = user[key];
				}
			}
		}

		return temp;
	},

	setFavorite( body, callback ) {

	}
}
