let user_name = prompt('Qual é o seu nome?');

let object_users = {
  name: `${user_name}`
};

let last_messages = [];

axios.defaults.headers.common['Authorization'] = 'A18MuWr2gHpwC7V6lSzyYJqS';

function new_user() {
  const promise = axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', object_users);
  promise.then(joined_server);
  promise.catch(not_joined_server);
  const status_check = setInterval(check_status, 5000); //checar status a cada 5 seg
  const new_messages_check = setInterval(search_messages, 3000); //checar novas msgs a cada 3 seg
  return [status_check, new_messages_check];

}

const intervals = new_user();

function joined_server() {
  search_messages();
}

function not_joined_server(error) {
  if (error.response.status === 400) {
    user_name = prompt('Este nome já foi cadastrado, digite outro');
    object_users = {
      name: `${user_name}`
    }
    if (user_name === null) {
      user_name = prompt('Por favor, insira um nome para prosseguir');
    }
    new_user();
  }
}

function check_status() {
  const promise = axios.post('https://mock-api.driven.com.br/api/vm/uol/status', object_users);
  promise.then(online);
  promise.catch(offline);
}

function online() {
  search_messages();
}

function offline(error) {
  console.log(error);
  clearInterval(intervals[0]);
  clearInterval(intervals[1]);
  alert('Desconectado por inatividade');
  window.location.reload();
}

function search_messages(type = null) {
  const promessa = axios.get('https://mock-api.driven.com.br/api/vm/uol/messages');
  promessa.then(answer => message(answer.data, type));
  promessa.catch(fail_message);
}

function fail_message(error) {
  console.log(error);
}

function message(answer, type) {
  let filtered_messages = answer.filter((msg) => (msg.type === 'status' || msg.type === 'message') && (!type || msg.type === type));
  render_messages(filtered_messages);
}

function render_messages(list_messages) {
  let new_message = document.querySelector('.content');
  if (!new_message) {
    console.log('Error: could not find message container');
    return;
  }

  new_message.innerHTML = '';

  let messages = list_messages.slice(-100);

  for (let i = 0; i < messages.length; i++) {
    let last_message = list_messages[i];
    last_messages.push(last_message);

    if (equal_messages(last_messages[last_messages.length - 2], last_messages[last_messages.length - 1])) {
      if (last_message.type === 'status') {
        new_message.innerHTML += status_message(last_message);
      }
      else if (last_message.type === 'message' && last_message.to === "Todos") {
        new_message.innerHTML += text_message(last_message);
      }
    }
  }
  new_message.lastElementChild.scrollIntoView();
}

function send_message() {
  let message_content = document.querySelector('.typing_pad').value;
  let new_message = {
    from: `${user_name}`,
    to: "Todos",
    text: `${message_content}`,
    type: "message"
  };
  const request = axios.post('https://mock-api.driven.com.br/api/vm/uol/messages', new_message);

  request.then(answer_arrived);
  request.catch(error);
}

function answer_arrived() {
  search_messages();
}

function error(error) {
  console.log('Ocorreu um erro ao enviar sua mensagem, tente novamente ou recarregue a página');
} 


function equal_messages(msg1, msg2){     
    let check1 = msg1.text !== msg2.text;
    let check2 = msg1.from !== msg2.from;
    let check3 = msg1.type !== msg2.type;
    let final_check = check1 || check2 || check3;
    return final_check;
}

function status_message(last_message){
    return`<li class='status_msg' data-test="message"><span class='time'>(${last_message.time})</span><span class='user'>&nbsp${last_message.from}</span><p>&nbsp${last_message.text}</p></li>`;
}

function text_message(last_message){
    return `<li class='msg'><span class='time'>(${last_message.time})</span><span class='user'>&nbsp${last_message.from}</span>&nbsppara<span class='user'>&nbsp${last_message.to}:</span><p>&nbsp${last_message.text}</p></li>`;
}