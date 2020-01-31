// Hash function to securely store passwords
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
var gl_tableIndex = 0;
function getTableIndex(row) {
      tableIndex = row.rowIndex-1;
}

Vue.component('modal-add-word', {
  template:
  `
  <div class="modal fade" id="addWord" tabindex="-1" role="dialog" aria-labelledby="addWordLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addWordLabel">Add word</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="InputWord">Word</label>
              <input type="text" class="form-control" id="InputWord" aria-describedby="wordHelp" v-model="wordName" required>
              <small id="wordHelp" class="form-text text-muted">Be creative!</small>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="callAddWord">Go</button>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      wordName:''
    }
  },
  methods: {
    callAddWord() {
      if (this.wordName === "") {
        return;
      }
      this.$emit('add-word', {wordName: this.wordName});
    }
  }
});
Vue.component('modal-create-room', {
  template:
  `
  <div class="modal fade" id="createNewMatch" tabindex="-1" role="dialog" aria-labelledby="createNewMatchLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="createNewMatchLabel">New match</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="InputRoomName">Room name</label>
              <input type="text" class="form-control" id="InputRoomName" aria-describedby="roomnameHelp" v-model="roomName" required>
              <small id="roomnameHelp" class="form-text text-muted">Be creative!</small>
            </div>
            <div class="form-group">
              <label for="formControlSelectNumPlayers">Maximum number of players</label>
              <select class="form-control" id="formControlSelectNumPlayers" v-model="maxNumPlayers">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="callCreateRoom">Go</button>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      roomName:'',
      maxNumPlayers: 1
    }
  },
  methods: {
    callCreateRoom() {
      if (this.roomName === "") {
        return;
      }
      this.$emit('create-room', {roomName: this.roomName, maxNumPlayers: this.maxNumPlayers});
    }
  }
});

Vue.component('bootstrap-alert', {
  props: {
    createdUser: {
      type: Boolean,
      required: false,
      default: false
    },
    loginValid: {
      type: Boolean,
      required: false,
      default: false
    },
    show: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  template:
  `
  <div v-bind:class="classType" role="alert" v-if="visible">
    <strong>{{ strongText }}</strong> {{ text }}
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  `,
  data() {
    return {
      classType: 'alert alert-warning alert-dismissible fade show',
      strongText: '',
      text: '',
      visible: false
    }
  },
  watch: {
    show: function() {

      if (this.show == false) {
        return;
      }


      // Danger alert
      if(!this.createdUser && !this.loginValid) {
        this.classType = 'alert alert-danger alert-dismissible fade show';

        // Wrong adm password
        this.strongText = 'Error!';
        this.text = 'Is the admin password correct?';

        // User created
      } else if (this.createdUser && this.loginValid) {
        // Success alert
        this.classType = 'alert alert-success alert-dismissible fade show';
        this.strongText = 'User created successfully!';
        this.text = 'You can now select a match or create your own';
      } else if (!this.createdUser && this.loginValid) {
        this.classType = 'alert alert-success alert-dismissible fade show';
        this.strongText = 'Login successful!';
        this.text = 'Welcome back.';
      }
      this.visible = true;
    }
  }
});
Vue.component('available-rooms', {
  props: {
    rooms: {
      type: Array,
      required: false,
      default: []
    },
    users: {
      type: Array,
      required: false,
      default: []
    }
  },
  template:
  `
    <div class="rooms">
      <h2 v-if="rooms.length > 0">Available rooms:</h2>
      <h2 v-else>No available rooms</h2>
      <div class="table-responsive">
        <table v-if="rooms.length > 0" class="table table-hover" id="availableRoomsTable">
          <thead>
            <tr>
              <th scope="col">Room name</th>
              <th scope="col">Host</th>
              <th scope="col">Max players</th>
            </tr>
          </thead>
          <tbody>
              <tr v-for="room in rooms" class="clickable">
                  <td v-on:click="callRoom" v-on:mouseover="updateCurrentIndex(room.id)">
                    {{room.name}}
                  </td>
                  <td v-on:click="callRoom" v-on:mouseover="updateCurrentIndex(room.id)">
                    {{room.host.name}}
                  </td>
                  <td v-on:click="callRoom" v-on:mouseover="updateCurrentIndex(room.id)">
                    {{room.max_players}}
                  </td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data() {
    return {
      currentRoomId: 0
    }
  },
  methods: {
    callRoom() {
      console.log('CLICK ' + this.currentRoomId);
     this.$emit('go-to-room', this.currentRoomId);
    },
    updateCurrentIndex(id) {
      this.currentRoomId = id;
      console.log('currentRoom:', this.currentRoomId);
    }
  }
});


Vue.component('modal-create-user', {
  template:
  `
  <div class="modal fade" id="createNewUser" tabindex="-1" role="dialog" aria-labelledby="createNewUserLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="createNewUserLabel">Login/Sign up</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="inputUsername">Username</label>
              <input type="text" class="form-control" id="inputUsername" aria-describedby="usernameHelp" v-model="username" required />
              <small id="usernameHelp" class="form-text text-muted">An account will be created if the username doesn't exist</small>
            </div>
            <div class="form-group form-check">
              <input type="checkbox" class="form-check-input" id="admCheck"  v-model="isAdm" />
              <label class="form-check-label" for="admCheck">I'm an administrator</label>
            </div>
            <div class="form-group">
              <label for="inputPassword">Administrator Password</label>
              <input type="password" class="form-control" id="inputPassword" v-bind:disabled="!isAdm" v-model="admPassword" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" v-on:click="callLogin" data-dismiss="modal">Go</button>

        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      username: '',
      isAdm: false,
      admPassword: ''
    }
  },
  methods: {
    callLogin() {
      if (this.username === "") {
        return;
      }
      modalDismiss = "modal";
      this.$emit('login', {username: this.username, isAdm: this.isAdm, admPassword: this.admPassword.hashCode()});

    }
  }
});

var app = new Vue( {
  el: '#app',
  data: {
    users: [],
    availableRooms: [],
    loginResult: {created: false, data:{name: '', adm: false}, valid: false },
    triedToLogin: false,
    roomCreated: false,
    wordAdded: false
  },

  created() {
    fetch('/db-users')
      .then(response => response.json())
      .then(json => {
        this.users = json;
      })
      .catch(err => {
        console.error('Unable to retrieve users:', err)
      });

    fetch('/db-available-rooms')
      .then(response => response.json())
      .then(json => {
        this.availableRooms = json;
      })
      .catch(err => {
        console.error('Unable to retrieve the available rooms:', err)
      });

  },
  methods: {
    goToRoom(roomId) {
      if (!this.loginResult.valid) {
        // Open createNewUser modal
        $(createNewUser).modal();
        return;
      }
      var dataToSend = {user: this.loginResult.data, roomId: roomId};
      fetch('/room', { method:'POST', headers: {'Content-Type': 'application/json;charset=utf-8'}, body: JSON.stringify(dataToSend) })
        .then(response => {
          window.location.href = response.url;
        })
        .catch(err => {console.error(err)});
    },
    login(dataToSend) {
      fetch('/login', { method:'POST', headers: {'Content-Type': 'application/json;charset=utf-8'}, body: JSON.stringify(dataToSend) })
        .then(response => response.json())
        .then(json => {
          this.loginResult = json;
          this.triedToLogin = true;
        })
        .catch(err => {
          console.error('Unable to login:', err)
        });
    },
    createRoom(dataToSend) {
      // Add the host name before sending it
      dataToSend.hostName = this.loginResult.data.name;
      fetch('/create-room',{ method:'POST', headers: {'Content-Type': 'application/json;charset=utf-8'}, body: JSON.stringify(dataToSend) })
        .then(response => response.json())
        .then(json => {
          this.roomCreated = json.created;
          this.goToRoom(json.roomId);
        })
        .catch(err => {
          console.error('Unable to create room:', err)
        });
    },
    addWord(dataToSend) {
      fetch('/add-word',{ method:'POST', headers: {'Content-Type': 'application/json;charset=utf-8'}, body: JSON.stringify(dataToSend) })
        .then(() => {
          this.wordAdded = true;
        })
        .catch(err => {
          console.error('Unable to add word', err)
        });
    }
  }

});

//

// function setUserName() {
//   let myName = prompt('Enter a username');
//   localStorage.setItem('username', myName);
//   // Save user in database here
// }
//
// if (!localStorage.getItem('username')) {
//   setUserName();
// } else {
//   let storedName = localStorage.getItem('username');
// }
