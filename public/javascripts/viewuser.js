// vieworder.js

function initUserElem() {

	elem.divNewUser = document.querySelector( 'div.cNewUser' );
	elem.divMyInfo = document.querySelector( 'div.cMyInfo' );
	elem.divAdmin = document.querySelector( 'div.cAdmin' );

	elem.divNewUser.style.display = 'block';
	elem.divMyInfo.style.display = 'none';
	elem.divAdmin.style.display = 'none';

	elem.userList = [
		elem.divNewUser,
		elem.divMyInfo,
		elem.divAdmin
	];

	changeUserPage( 'NewUser' );
}

l2user = {
	cbUserList() {
		let select = document.querySelector( '#idSelect' );
		removeChildAll( select );

		for( const uid in l2data.allUsers ) {
			let user = l2data.allUsers[uid];
			let option = addElement( select, 'option', '',
				user.name ? user.name : user.id );
			option.value = uid;
		}

		select.form.uid.value = select.value;
	}
}

function checkAddForm( self, getMsg ) {
	const f = self.form;

	let errID = 0;
	if( f.id.value === '' ) {
		errID = 1;
	} else {
		for( const uid in l2data.allUsers ) {
			const user = l2data.allUsers[uid];
			if( f.id.value === user.id || f.id.value === 'admin' ) {
				errID = 2;
				break;
			}
		}
	}
	f.id.className =	( errID === 2 ) ? 'userYellow' :
						( errID === 1 ) ? 'userRed' : 'userWhite';


	const errP1 = f.password1_add.value ? 0 : 1;
	f.password1_add.className = ( errP1 === 1 ) ? 'userRed' : 'userWhite';

	const errP2 = ( f.password1_add.value === f.password2_add.value ) ? 0 : 1;
	f.password2_add.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let empty = 0;
	let msg = '';
	if( errID === 2 ) {
		msg = 'ID 중복!!!';
	} else if( errID === 1 ) {
		empty++;
		msg = 'ID'
	}
	if( errP1 || errP2 ) {
		empty++;
		msg = `${msg ? `${msg}, ` : ''}비밀번호`;
	}
	if( empty > 0 ) {
		msg = `${msg}를 정확하게 입력해주세요.`;
	}

	return msg;
}

function addUser( self ) {

	const msg = checkAddForm( self, true );
	if( msg ) {
		alert( msg );
		return;
	}

	const f = self.form;
	f.name.value = f.name_add.value;
	f.password.value = f.password1_add.value;

	self.form.mode.value = "add";
	self.form.submit();
}

function checkEditForm( self, getMsg ) {
	const myName = '김개똥';

	const f = self.form;

	let hasChange = f.password1_edit.value ? true : false;

	const errP2 = ( f.password1_edit.value === f.password2_edit.value ) ? 0 : 1;
	f.password2_edit.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	let changeName = ( f.name_edit.value === myName ) ? 0 : 1;
	f.name_edit.className = ( changeName === 1 ) ? 'userGreen' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let msg;
	if( errP2 ) {
		return '비밀번호가 다릅니다.';
	}

	if( changeName ) {
		hasChange = true;
	}

	if( !hasChange ) {
		msg = '변경사항이 없습니다.'
	}

	return msg;
}

function editUser( self, admin ) {

	const f = self.form;
	f.name.value = admin ? f.name_admin.value : f.name_edit.value;

	if( admin ) {
		f.password.value = '';
	} else {


		const msg = checkEditForm( self, true );
		if( msg ) {
			alert( msg );
			return;
		}

		f.password.value = f.password1_edit.value;
	}

	self.form.mode.value = "edit";
	self.form.submit();
}

function delUser( self ) {

	const userName = 'asdf';
	const msg = `${userName} 를 삭제하시겠습니까?`;

	if( confirm( msg ) ) {
		self.form.mode.value = "del";
		self.form.submit();
	}
}

function onChangeUserID( self ) {
	self.form.uid.value = self.value;
}

function changeUserPage( page ) {
	elem.userList.forEach( o => {
		if( o.className.substr( 1 ) === page ) {
			o.style.display = 'block'
		} else {
			o.style.display = 'none'
		}
	} );
}