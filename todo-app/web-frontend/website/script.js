function addTodoToRow(todo){
  var myRow = '<tr><td class="col-md-10">'+todo+'</td><td class="vcenter col-md-2"><input type="checkbox" name="deleteCheck" value="1"/></td></tr>';
  $("#Todos tr:last").after(myRow)
  $('#todoText').val("")
  $('#todoText').parent().removeClass("has-error").addClass("has-success")
}

function callRestAPI(call_type, on_success, todo){
  var server_url = "http://todoapp:9090"
  var api_url = (typeof todo == 'undefined') ? server_url : server_url.concat("/todo/").concat(todo);
  jQuery.ajax({
    url: api_url,
    type: call_type,
    contentType: 'application/json; charset=utf-8',
    success: on_success,
    error : function(jqXHR, textStatus, errorThrown) {
      alert(textStatus)
    },
    timeout: 120000,
  });
}

function loadTodos(){
  callRestAPI("GET",
  function(resultData) {
    todos = JSON.parse(resultData);
    for (var i = 0; i < todos.length; i++) {
      addTodoToRow(todos[i])
    }
  })
}

function addTodo() {
    var todo = $('#todoText').val()
    if (!todo){
        $('#todoText').parent().addClass("has-error").removeClass("has-success")
        return
    }

    callRestAPI("PUT",
    function(resultData) {
      addTodoToRow(todo)
    },
    todo)
}

function deleteTodos(){
    var checkboxes = document.getElementsByName("deleteCheck")
    for (var i=0; i < checkboxes.length; i++) {
     if (!checkboxes[i].checked){
       continue
     }
     var checkbox = checkboxes[i]
     callRestAPI("DELETE",
     function(resultData) {
      $(checkbox).closest('tr').fadeOut( "slow", function() {
        $(checkbox).closest('tr').remove()
      });
     },
     $(checkbox).closest('tr').text())
  }
}
