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

	let validID = 0;
	if( f.id.value === '' ) {
		validID = 1;
	} else {
		for( const uid in l2data.allUsers ) {
			const user = l2data.allUsers[uid];
			if( f.id.value === user.id || f.id.value === 'admin' ) {
				validID = 2;
				break;
			}
		}
	}
	f.id.className =	( validID === 2 ) ? 'userYellow' :
						( validID === 1 ) ? 'userRed' : 'userWhite';


	const validP1 = f.password1_add.value ? 0 : 1;
	f.password1_add.className = ( validP1 === 1 ) ? 'userRed' : 'userWhite';

	const validP2 = ( f.password1_add.value === f.password2_add.value ) ? 0 : 1;
	f.password2_add.className = ( validP2 === 1 ) ? 'userRed' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let empty = 0;
	let msg = '';
	if( validID === 2 ) {
		msg = 'ID 중복!!!';
	} else if( validID === 1 ) {
		empty++;
		msg = 'ID'
	}
	if( validP1 || validP2 ) {
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
	
	const validP2 = ( f.password1_edit.value === f.password2_edit.value ) ? 0 : 1;
	f.password2_edit.className = ( validP2 === 1 ) ? 'userRed' : 'userWhite';

	// TODO - check same data
	let validName = ( f.name_edit.value === '' ) ? 1 :
					( f.name_edit.value === myName ) ? 2 : 0;
	f.name_edit.className = ( validName === 2 ) ? 'userYellow' :
							( validName === 1 ) ? 'userRed' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let msg;

	if( validP2 ) {
		msg = '비밀번호가 다릅니다.';
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

		f.password.value = f.password_edit;
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