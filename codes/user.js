
const fs = require( 'fs' );
const bcrypt = require( 'bcrypt' );

const convertError = require( '../lib/convert-error' );
const checkLoaded = require( '../lib/check-loaded' );

const adam = {
	// uid: 0,
	name: '관리자',
	// admin: true,
	// deleted: false,
	// enabled: false

	// for local
	id: 'admin',
	password: '$2b$10$j4gB9lgzNoKvyEN5ZpV6SOkaGUKSrf8s0CvSQA4bq4ZLwBCrIUC8e', // qwer
};
Object.freeze( adam );

/*
allUsers = {
	'1': { // uid
		name: '홍길동',
		admin: false,
		deleted: false,
		enabled: false,
		favorite: { '아메리카노', ice, syrup },
}
authTable = {
	'1': {
		Local: 'ithing',
		Facebook: '10987654321',
		Google: '111122223333',
		Kakao: -1,
		Twitter: undefined
	}
}
allLocals = {
	'ithing': {
		uid: 1,
		password: '$2b$10$abcde'
	}
}
allFacebooks = {
	'10987654321': {
		uid: 1,
		accessToken: 'asdf',
		refreshToken: 'zxcv',
		profile...?
	}
}
*/


module.exports = {

	isLoaded: {
		User: false,
		Local: false,
		Facebook: false,
		Google: false,
		Kakao: false,
		Twitter: false,
	},

	maxUID: 0,

	allUsers: {},
	allLocals: {},
	allFacebooks: {},
	allGoogles: {},
	allKakaos: {},
	allTwitters: {},

	authTable: {}, // NOT Serialize

	initSuperAdmin() {
		this.allUsers[0] = this.allUsers[0] || {};
		const user = this.allUsers[0];
		user.uid		= 0;
		user.name		= adam.name;
		user.admin		= true;
		// user.deleted	= false;
		// user.enabled	= false;
		delete user.deleted;
		delete user.enabled;

		this.allLocals[adam.id] = this.allLocals[adam.id] || {};
		const local = this.allLocals[adam.id];
		local.uid		= 0;
		local.password	= adam.password;

		this.authTable[0] = this.authTable[0] || {};
		this.authTable[0].Local = adam.id;
	},

	loadUsers( callback ) {
		const checker = checkLoaded( 6, () => {
			console.log( 'User Loaded...' );
			callback();
		} );

		fs.mkdir( 'data/users', () => {
			this.initSuperAdmin();

			this.loadUser( checker );

			fs.mkdir( 'data/users/Local', () => {
				this.loadProvider( 'Local', checker );
			} );

			fs.mkdir( 'data/users/Facebook', () => {
				this.loadProvider( 'Facebook', checker );
			} );

			fs.mkdir( 'data/users/Google', () => {
				this.loadProvider( 'Google', checker );
			} );

			fs.mkdir( 'data/users/Kakao', () => {
				this.loadProvider( 'Kakao', checker );
			} );

			fs.mkdir( 'data/users/Twitter', () => {
				this.loadProvider( 'Twitter', checker );
			} );
		} );
	},
	loadUser( callback ) {
		fs.readdir( 'data/users', ( error, files ) => {
			const len = files.length;
			const checker = checkLoaded( len + 1, () => {
				this.isLoaded.User = true;
				callback();
			} );
			checker();
			files.forEach( ( file ) => {
				const filePath = `data/users/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					if ( err ) {
						if ( err.code === 'EISDIR' ) {
							checker();
							return;
						}
						throw err;
					}

					const uid = file;
					const value = JSON.parse( data );
					this.allUsers[uid] = value;

					if ( uid > this.maxUID ) {
						this.maxUID = Number( uid );
					}

					checker();
				} );
			} );
		} );
	},
	loadProvider( Provider, callback ) {
		fs.readdir( `data/users/${Provider}`, ( error, files ) => {
			const len = files.length;
			const checker = checkLoaded( len + 1, () => {
				this.isLoaded[Provider] = true;
				callback();
			} );
			checker();
			files.forEach( ( providerID ) => {
				const filePath = `data/users/${Provider}/${providerID}`;
				fs.readFile( filePath, ( err, data ) => {
					if ( err ) {
						if ( err.code === 'EISDIR' ) {
							checker();
							return;
						}
						throw err;
					}

					const value = JSON.parse( data );
					const allProviders = this.getAllProvider( Provider );
					allProviders[providerID] = value;
					this.authTable[value.uid] = this.authTable[value.uid] || {};
					this.authTable[value.uid][Provider] = providerID;

					checker();
				} );
			} );
		} );
	},

	setAuthID( Provider, u, newID ) {
		let uid = u;
		if ( typeof u === 'object' ) {
			( { uid } = u );
		}
		this.authTable[uid] = this.authTable[uid] || {};
		this.authTable[uid][Provider] = newID;
	},
	getAuthID( Provider, u ) {
		let uid = u;
		if ( typeof u === 'object' ) {
			( { uid } = u );
		}
		const auth = this.authTable[uid];
		return auth ? auth[Provider] : null;
	},

	getUser( uid, callback ) {
		// Azure 에서 작동 안함..
		// undefined, Object.values is not a function...
		// nodejs 버전 문제인지? 8.11.1 인데? 일단 급한 불을 끄자...
		// if ( Object.values( this.isLoaded ).includes( false ) ) {
		let bError = false;
		Object.keys( this.isLoaded ).forEach( ( k ) => {
			if ( !bError && !this.isLoaded[k] ) {
				bError = true;
				callback( {
					code: 'ELOAD',
					err: 'User Not Loaded',
					isLoaded: this.isLoaded,
				} );
			}
		} );
		if ( bError ) {
			return false;
		}

		if ( !( uid >= 0 ) ) {
			callback( {
				code: 'EUID',
				err: `Invalid uid=${uid}. It must be >= 0.`,
			} );
			return false;
		}

		const user = this.allUsers[uid];
		if ( !user ) {
			callback( {
				code: 'ENOUSER',
				err: `User Not Found, uid=${uid}.`,
			} );
			return false;
		}

		return user;
	},

	// Local...
	writeUser( uid, callback ) {
		const user = this.allUsers[uid];
		const userString = JSON.stringify( user );
		const filePath = `data/users/${uid}`;
		fs.writeFile( filePath, userString, ( err ) => {
			if ( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `uid=${uid}, userString=${userString}`,
				} );
			} else {
				callback( { code: 'OK' } );
			}
		} );
	},

	getAllProvider( Provider ) { // Provider 첫 글자 대문자 !!!
		// `all${provider.replace( /^\w/, c => c.toUpperCase() )}s`;
		const providerKey = `all${Provider}s`;
		const allProviders = this[providerKey];
		if ( !allProviders ) {
			throw new Error( `Invalid Provider: ${Provider}` );
		}
		return allProviders;
	},
	getProvider( Provider, providerID ) {
		const allProviders = this.getAllProvider( Provider );
		return allProviders[providerID];
	},
	deleteProvider( Provider, providerID ) {
		let bDeleted = false;
		const allProviders = this.getAllProvider( Provider );
		if ( allProviders[providerID] ) {
			bDeleted = true;
			delete allProviders[providerID];
			fs.unlink( `data/users/${Provider}/${providerID}`, () => { } ); // 에러처리안함
		}
		return bDeleted;
	},

	writeProvider( Provider, providerID, callback ) {
		const prov = this.getProvider( Provider, providerID );
		const provString = JSON.stringify( prov );
		const filePath = `data/users/${Provider}/${providerID}`;
		fs.writeFile( filePath, provString, ( err ) => {
			if ( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `${Provider}ID=${providerID}, Str=${provString}`,
				} );
				return;
			}
			callback( {
				code: 'OK',
				uid: prov.uid,
				/* 필요없는거 같은데? providerID, */
			} );
		} );
	},

	haveDuplicatedID( localID ) {
		const sendMsg = {};
		if ( this.allLocals[localID] === undefined ) {
			sendMsg.code = 'OK';
		} else {
			sendMsg.code = 'EUSERID';
			sendMsg.err = 'UserID Already Exists.';
		}
		return sendMsg;
	},

	addUser( body, callback ) {
		const msg = this.haveDuplicatedID( body.id );
		if ( msg.code !== 'OK' ) {
			callback( msg );
			return;
		}
		this.processAddUser( body, callback );
	},
	processAddUser( body, callback ) {
		this.maxUID += 1;
		const uid = this.maxUID;
		this.allUsers[uid] = {
			uid,
			name: body.name,
		};
		this.authTable[uid] = {};

		const localID = body.id;
		if ( localID ) {
			// id - password 는 둘다 있든지 둘다 없든지
			if ( !body.password ) {
				callback( {
					code: 'EPASSWORD',
					err: 'Password NOT Exists.',
				} );
				return;
			}

			this.allLocals[localID] = {
				uid,
				id: localID,
			};
			this.setAuthID( 'Local', uid, localID );
		}

		this.writeUser( uid, ( msg ) => {
			msg.uid = uid;
			msg.name = this.allUsers[uid].name;
			if ( !localID ) {
				callback( msg );
				return;
			}

			msg.id = localID;
			const local = this.allLocals[localID];
			bcrypt.hash( body.password, 10, ( err, hash ) => {
				local.password = hash;
				this.writeProvider( 'Local', localID, ( msg2 ) => {
					msg.writeProvider = msg2;
					if ( msg.code === 'OK' ) {
						msg.code = msg2.code;
					} else if ( msg2.code !== 'OK' ) {
						msg.code2 = msg2.code;
					}
					callback( msg );
				} );
			} );
		} );
	},

	editUser( uid, body, callback ) {
		const user = this.getUser( uid, callback );
		if ( !user ) {
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


		// const oldID = user.id;

		// let changePassword = false;
		let tempPassword = '';
		Object.keys( body ).forEach( ( key ) => {
			const value = body[key];
			let bContinue = false;
			if ( key === 'mode' || key === 'uid' ) {
				bContinue = true;
			} else if ( key === 'id' ) {
				// localID 변경처리 추후에
				bContinue = true;
			} else if ( key === 'password' ) {
				if ( value === '' ) {
					bContinue = true;
				} else {
					// changePassword = true;
					tempPassword = value;
					bContinue = true;
				}
			} else if ( uid === 0 ) {
				if ( key === 'deleted' || key === 'enagled' || key === 'shuttle' ) {
					bContinue = true;
				}
			}

			if ( !bContinue ) {
				user[key] = body[key];
			}
		} );
		/* localID 가 바뀌는 경우에 대한 처리는 추후에 다시...
		if( newLocalID !== oldLocalID ) {
			this.authTable[ uid ].local = newLocalID;

			delete this.allLocals[ oldLocalD ];
			unlink( `data/users/local/${oldLocalID}`, ()= > { ... } );

			local = this.allLocals[ newLocalID ] = { uid: newUID }
			this.writeLocal( newLocalID, () => { ... } );
		}
		*/

		this.writeUser( uid, ( msg ) => {
			if ( !tempPassword ) {
				callback( msg );
				return;
			}

			// user가 고아가 되서 authTable에 없는 경우,
			// admin 기능으로 password 를 추가해 줄 수 있음
			const localID = this.getAuthID( 'Local', uid ) || body.id;
			this.setAuthID( 'Local', uid, localID );
			this.allLocals[localID] = this.allLocals[localID] || { uid };

			const local = this.allLocals[localID];
			bcrypt.hash( tempPassword, 10, ( err, hash ) => {
				local.password = hash;
				this.writeProvider( 'Local', localID, ( msg2 ) => {
					msg.writeProvider = msg2;
					if ( msg.code === 'OK' ) {
						msg.code = msg2.code;
					} else if ( msg2.code !== 'OK' ) {
						msg.code2 = msg2.code;
					}
					callback( msg );
				} );
			} );
		} );
	},

	deleteUser( uid, callback ) {
		const user = this.getUser( uid, callback );
		if ( !user ) {
			return;
		}

		if ( uid === 0 ) {
			this.initSuperAdmin();
		} else {
			user.deleted = true;
		}

		this.writeUser( uid, callback );
	},

	// TODO - body 대신 uid
	enableUser( body, callback ) {
		const user = this.getUser( body.uid, callback );
		if ( !user ) {
			return;
		}

		user.enabled = false;

		this.writeUser( body.uid, callback );
	},
	// TODO - body 대신 uid
	disableUser( body, callback ) {
		const user = this.getUser( body.uid, callback );
		if ( !user ) {
			return;
		}

		if ( user.enabled ) {
			user.enabled = false;
		}

		this.writeUser( body.uid, callback );
	},

	getUserList( currentUser ) {
		const { admin, uid: myUID } = currentUser;
		const tempAll = {};
		Object.keys( this.allUsers ).forEach( ( uid ) => {
			//	if( uid == 0 ) {
			//		continue;
			//	}
			let include = false;
			const user = this.allUsers[uid];
			const auth = this.authTable[uid];
			if ( admin ) {
				include = true;
			} else if ( auth && !user.deleted && user.enabled ) {
				include = true;
			} else if ( user.uid === myUID ) {
				include = true;
			}

			if ( include ) {
				tempAll[uid] = {};
				const tempUser = tempAll[uid];
				Object.keys( user ).forEach( ( key ) => {
					tempUser[key] = user[key];
				} );
				tempUser.localID = auth ? auth.Local : null;
				tempUser.profile = ''; // TODO - 프사

				if ( admin ) {
					tempUser.auth = this.getAuthInfo( auth );
				}
			}
		} );
		return tempAll;
	},

	getAuthInfo( auth ) {
		if ( !auth ) {
			return null;
		}
		const temp = {};
		const Providers = ['Facebook', 'Google', 'Kakao', 'Twitter'];
		Providers.forEach( ( Provider ) => {
			const providerID = auth[Provider];
			if ( providerID ) {
				const prov = this.getProvider( Provider, providerID );
				temp[Provider] = {
					providerID,
					uid: prov.uid,
					id: prov.profile.id,
					name: prov.profile.displayName,
				};
			}
		} );
		return temp;
	},

	/*
	setFavorite( body, callback ) {

	},
	*/

	/*
	req.user.uid = 3, newFacebookID = 44444 를 연동하면
		authTable
			4: 44444 ~~> 다른인증수단이 있는지 체크
						 있으면 undefined
						 없으면 ASK 후 delete 처리
			3: 33333 ~~> 44444

		allFacebooks
			33333: 3 ~~> unlink
			44444: 4 ~~> 3
	*/
	getDisplayName( u ) {
		let user;
		let uid;
		if ( typeof u === 'object' ) {
			user = u;
			( { uid } = user );
		} else {
			uid = u;
			user = this.allUsers[uid];
		}

		if ( user.name ) {
			return user.name;
		}
		const auth = this.authTable[uid];
		if ( auth && auth.Local ) {
			return auth.Local;
		}
		return `* ${user.uid}`;
	},

	checkProvider( Provider, currentUser, newProviderID, callback ) {
		const newProv = this.getProvider( Provider, newProviderID ); // 44444
		const oldProviderID = this.getAuthID( Provider, currentUser ); // 3.33333

		// New User
		if ( newProv.uid === undefined ) {
			this.setAuthID( Provider, currentUser, newProviderID ); // 3.33333 ~~> 44444
			newProv.uid = currentUser.uid; // 44444.4 ~~> 3

			this.writeProvider( Provider, newProviderID, ( sendMsg ) => {
				if ( sendMsg.code !== 'OK' ) {
					callback( sendMsg );
					return;
				}
				this.deleteProvider( Provider, oldProviderID ); // 33333.3 ~~> unlink
				callback( { code: 'OK', msg: 'New User' } );
			} );
			return;
		}

		if ( currentUser.uid === newProv.uid && oldProviderID === newProviderID ) {
			callback( { code: 'OK', msg: 'Same User' } );
			return;
		}

		const deleteUID = newProv.uid; // 44444.4
		const deleteAuth = this.authTable[deleteUID]; // 4

		const askKey = `ask${Provider}`;
		deleteAuth[askKey] = Math.random().toString();

		const deleteUser = this.allUsers[deleteUID];

		const sendMsg = {
			code: 'ASK',
			Provider,
			askValue: deleteAuth[askKey],
			providerID: newProviderID,
			providerName: newProv.profile.displayName,
			currentName: this.getDisplayName( currentUser ),
			deleteName: this.getDisplayName( deleteUser ),
		};
		if ( this.authNoMoreExist( deleteAuth, Provider ) ) {
			sendMsg.askDelete = true;
		}
		callback( sendMsg );
	},

	authNoMoreExist( deleteAuth, except ) {
		const checkKeys = ['Local', 'Facebook', 'Google', 'Kakao', 'Twitter'];
		return checkKeys.every( ( key ) => {
			if ( key === except ) {
				return true;
			}
			if ( !deleteAuth[key] ) {
				return true;
			}
			return false;
		} );
	},

	associateProvider( currentUser, body, callback ) {
		const { Provider, providerID, askValue } = body;
		const newProv = this.getProvider( Provider, providerID );

		const deleteUID = newProv.uid;
		const deleteAuth = this.authTable[deleteUID]; // 4
		const askKey = `ask${Provider}`;
		const deleteAskValue = deleteAuth[askKey];
		delete deleteAuth[askKey];

		if ( !body.bYes ) {
			callback( {
				code: 'NO',
				msg: 'You select No...',
			} );
			return;
		}

		if ( !askValue || askValue !== deleteAskValue ) {
			callback( {
				code: 'EASKKEY',
				err: `${askKey} is not valid`,
				deleteAskValue,
				askValue,
			} );
			return;
		}

		if ( this.authNoMoreExist( deleteAuth, Provider ) ) {
			this.allUsers[deleteUID].deleted = true;
			this.writeUser( deleteUID, () => { } ); // TODO - 귀찮아서 처리콜백 등록안함-_-;
		}
		delete deleteAuth[Provider]; // 4.44444 ~~> delete
		// sendMsg.authDeleted = true;

		const oldProviderID = this.getAuthID( Provider, currentUser ); // 3.33333
		// sendMsg.oldFacebookID = oldFacebookID;

		this.setAuthID( Provider, currentUser, providerID ); // 3.33333 ~~> 44444
		newProv.uid = currentUser.uid; // 44444.4 ~~> 3

		this.writeProvider( Provider, providerID, ( sendMsg ) => {
			if ( sendMsg.code !== 'OK' ) {
				callback( sendMsg );
				return;
			}
			this.deleteProvider( Provider, oldProviderID ); // 33333.3 ~~> unlink
			callback( { code: 'YES' } );
		} );
	},

	saveProvider( Provider, providerID, done ) {
		this.writeProvider( Provider, providerID, ( sendMsg ) => {
			if ( sendMsg.code !== 'OK' ) {
				done( sendMsg.err, false );
				return;
			}
			const prov = this.getProvider( Provider, providerID );
			const user = this.allUsers[prov.uid];
			done( null, user, { providerID } );
		} );
	},


	addProviderUser( Provider, providerID, callback ) {
		const prov = this.getProvider( Provider, providerID );
		if ( !prov ) {
			callback( {
				code: `E${Provider.toUpperCase()}`,
				err: `${Provider} ${providerID} not Exist`,
			} );
			return;
		}

		const body = { name: prov.profile.displayName };
		this.processAddUser( body, ( msg ) => {
			if ( msg.code !== 'OK' ) {
				callback( msg );
				return;
			}
			this.setAuthID( Provider, msg.uid, providerID );
			prov.uid = msg.uid;
			this.writeProvider( Provider, providerID, callback );
		} );
	},
};
